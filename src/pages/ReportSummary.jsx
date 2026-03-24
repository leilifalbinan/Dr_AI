import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Legend,
  Tooltip,
  Filler,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { ArrowLeft, FileBarChart } from "lucide-react";
import { createPageUrl, cn } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoFace, demoAudio, demoGait } from "@/data/reportSummaryDemoData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Legend,
  Tooltip,
  Filler
);

const EMO_COLORS = {
  happy: "#f4a261",
  angry: "#e63946",
  disgust: "#a8dadc",
  low_affect: "#457b9d",
  arousal: "#94a3b8",
  sad: "#6d6875",
  fear: "#e9c46a",
  neutral: "#8ecae6",
  surprise: "#ffb703",
};

function emoColor(key) {
  return EMO_COLORS[key] || "#94a3b8";
}

function pct(v) {
  return `${(v * 100).toFixed(0)}%`;
}

function fmtConf(v) {
  return v != null ? `${(v * 100).toFixed(0)}%` : "—";
}

function avgConf(recs) {
  const v = recs.filter((r) => r.confidence != null && r.valid !== false);
  return v.length ? v.reduce((a, r) => a + r.confidence, 0) / v.length : null;
}

function labelEmo(key) {
  return key.replace(/_/g, " ");
}

function qualLabel(v, low, mid) {
  if (v == null) return "—";
  if (v >= mid) return "Good";
  if (v >= low) return "Fair";
  return "Low";
}

const chartBox = "relative h-[180px] w-full";
const chartBoxTall = "relative h-[220px] w-full";

export default function ReportSummary() {
  const navigate = useNavigate();
  const [face] = useState(demoFace);
  const [audio] = useState(demoAudio);
  const [gait] = useState(demoGait);
  const [showFaceRaw, setShowFaceRaw] = useState(false);
  const [showAudioRaw, setShowAudioRaw] = useState(false);
  const [showGaitRaw, setShowGaitRaw] = useState(false);

  const visitMeta = useMemo(() => {
    const allRecs = [...face, ...audio, ...gait];
    if (!allRecs.length) return null;
    const first = allRecs[0];
    const phases = [...new Set(allRecs.map((r) => r.phase))];
    return {
      visitId: first.visit_id ?? "—",
      patientId: first.patient_id ?? "—",
      phase: phases.join(", "),
      schema: first.schema_version ?? "v0.1",
    };
  }, [face, audio, gait]);

  const { cf, ca, cg, co } = useMemo(() => {
    const f = avgConf(face);
    const a = avgConf(audio);
    const g = avgConf(gait);
    const all = [f, a, g].filter((x) => x != null);
    const o = all.length ? all.reduce((x, y) => x + y, 0) / all.length : null;
    return { cf: f, ca: a, cg: g, co: o };
  }, [face, audio, gait]);

  const faceDerived = useMemo(() => {
    if (!face.length) return null;
    const summary = face.find((r) => r.type === "summary");
    const windows = face.filter((r) => r.type === "window");
    const anyInvalid = face.some((r) => r.valid === false);

    let emotionPct = {};
    if (summary?.features?.emotion_pct) {
      emotionPct = { ...summary.features.emotion_pct };
    } else if (windows.length) {
      const emotionCounts = {};
      windows.forEach((w) => {
        const ec = w.features?.emotion_counts || {};
        Object.entries(ec).forEach(([k, v]) => {
          emotionCounts[k] = (emotionCounts[k] || 0) + v;
        });
      });
      const total = Object.values(emotionCounts).reduce((a, v) => a + v, 0) || 1;
      Object.entries(emotionCounts).forEach(([k, v]) => {
        emotionPct[k] = +((v / total) * 100).toFixed(2);
      });
    }

    const sorted = Object.entries(emotionPct).sort((a, b) => b[1] - a[1]);
    const allEmos = [
      ...new Set(windows.flatMap((w) => Object.keys(w.features?.emotion_counts || {}))),
    ];
    const timelineLabels = windows.map((w) => `${w.t_start}s–${w.t_end}s`);
    const timelineDatasets = allEmos.map((emo) => {
      const totals = windows.map((w) => {
        const ec = w.features?.emotion_counts || {};
        const t = Object.values(ec).reduce((a, v) => a + v, 0) || 1;
        return +(((ec[emo] || 0) / t) * 100).toFixed(1);
      });
      return {
        label: labelEmo(emo),
        data: totals,
        backgroundColor: emoColor(emo),
        stack: "emo",
      };
    });

    return {
      anyInvalid,
      sorted,
      windows,
      doughnutData: {
        labels: sorted.map(([k]) => labelEmo(k)),
        datasets: [
          {
            data: sorted.map(([, v]) => v),
            backgroundColor: sorted.map(([k]) => emoColor(k)),
            borderWidth: 2,
            borderColor: "#f0fdfa",
          },
        ],
      },
      timeline:
        windows.length > 0
          ? {
              labels: timelineLabels,
              datasets: timelineDatasets,
            }
          : null,
    };
  }, [face]);

  const audioDerived = useMemo(() => {
    if (!audio.length) return null;
    const windows = audio.filter((r) => r.type === "window");
    const summary = audio.find((r) => r.type === "summary");
    const anyInvalid = audio.some((r) => r.valid === false);
    const sentLabels = windows.map((w) => `${w.t_start}s`);
    const sentData = windows.map((w) => w.features?.sentiment?.polarity ?? 0);
    const sentColors = sentData.map((v) => (v >= 0 ? "#059669" : "#dc2626"));

    const kwMap = {};
    const diagSet = new Set();
    windows.forEach((w) => {
      (w.features?.top_words || []).forEach(([word, count]) => {
        kwMap[word] = (kwMap[word] || 0) + count;
      });
      (w.features?.diagnostic_terms?.matches || []).forEach(([word]) => diagSet.add(word));
    });

    const topicMap = {};
    windows.forEach((w) => {
      (w.features?.topics || []).forEach(([topic, score]) => {
        if (!topicMap[topic]) topicMap[topic] = [];
        topicMap[topic].push(score);
      });
    });
    if (!Object.keys(topicMap).length && summary?.features?.topics) {
      summary.features.topics.forEach(([t, s]) => {
        topicMap[t] = [s];
      });
    }
    const topicRows = Object.entries(topicMap)
      .map(([topic, scores]) => ({
        topic,
        avg: scores.reduce((x, y) => x + y, 0) / scores.length,
      }))
      .sort((a, b) => b.avg - a.avg);

    return {
      anyInvalid,
      windows,
      summary,
      sentiment: {
        labels: sentLabels,
        datasets: [
          {
            label: "Sentiment polarity",
            data: sentData,
            backgroundColor: sentColors,
            borderRadius: 4,
          },
        ],
      },
      wordCount: {
        labels: sentLabels,
        datasets: [
          {
            label: "Word count",
            data: windows.map((w) => w.features?.word_count ?? 0),
            borderColor: "#6d28d9",
            backgroundColor: "rgba(109, 40, 217, 0.08)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: "#6d28d9",
          },
        ],
      },
      kwSorted: Object.entries(kwMap).sort((a, b) => b[1] - a[1]),
      diagSet,
      topicRows,
    };
  }, [audio]);

  const gaitDerived = useMemo(() => {
    if (!gait.length) return null;
    const windows = gait.filter((r) => r.type === "window");
    const events = gait.filter((r) => r.type === "event");
    const summary = gait.find((r) => r.type === "summary");
    const anyInvalid = gait.some((r) => r.valid === false);

    let avgSpeed =
      summary?.features?.avg_speed_mps ?? summary?.features?.speed_mps ?? null;
    let avgSym = summary?.features?.avg_symmetry ?? summary?.features?.symmetry ?? null;
    let avgStab = summary?.features?.avg_stability ?? summary?.features?.stability ?? null;

    if (avgSpeed == null && windows.length) {
      const sp = windows.map((w) => w.features?.speed_mps).filter((x) => x != null);
      avgSpeed = sp.reduce((a, v) => a + v, 0) / sp.length;
    }
    if (avgSym == null && windows.length) {
      const sy = windows.map((w) => w.features?.symmetry).filter((x) => x != null);
      avgSym = sy.reduce((a, v) => a + v, 0) / sy.length;
    }
    if (avgStab == null && windows.length) {
      const st = windows.map((w) => w.features?.stability).filter((x) => x != null);
      avgStab = st.reduce((a, v) => a + v, 0) / st.length;
    }

    const gaitNotes = summary?.notes;

    const gaitChart =
      windows.length > 0
        ? {
            labels: windows.map((w) => `${w.t_start}s`),
            datasets: [
              {
                label: "Speed (m/s)",
                data: windows.map((w) => w.features?.speed_mps ?? null),
                borderColor: "#047857",
                backgroundColor: "transparent",
                tension: 0.3,
                yAxisID: "ySpeed",
                pointRadius: 3,
              },
              {
                label: "Symmetry",
                data: windows.map((w) => w.features?.symmetry ?? null),
                borderColor: "#10b981",
                backgroundColor: "transparent",
                tension: 0.3,
                yAxisID: "yRatio",
                borderDash: [4, 2],
                pointRadius: 3,
              },
              {
                label: "Stability",
                data: windows.map((w) => w.features?.stability ?? null),
                borderColor: "#6ee7b7",
                backgroundColor: "transparent",
                tension: 0.3,
                yAxisID: "yRatio",
                borderDash: [2, 4],
                pointRadius: 3,
              },
            ],
          }
        : null;

    return {
      anyInvalid,
      windows,
      events,
      summary,
      avgSpeed,
      avgSym,
      avgStab,
      gaitNotes,
      gaitChart,
    };
  }, [gait]);

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right", labels: { padding: 8, boxWidth: 12, font: { size: 11 } } },
      },
    }),
    []
  );

  const faceTimelineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { size: 11 } } } },
      scales: {
        x: { stacked: true, ticks: { font: { size: 10 } } },
        y: {
          stacked: true,
          max: 100,
          ticks: { callback: (v) => `${v}%`, font: { size: 10 } },
        },
      },
    }),
    []
  );

  const sentimentOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { size: 10 } } },
        y: {
          min: -1,
          max: 1,
          ticks: { font: { size: 10 } },
          grid: {
            color: (ctx) =>
              ctx.tick.value === 0 ? "rgba(15, 118, 110, 0.35)" : "rgba(15, 118, 110, 0.08)",
          },
        },
      },
    }),
    []
  );

  const wordCountOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { size: 10 } } },
        y: { ticks: { font: { size: 10 } } },
      },
    }),
    []
  );

  const gaitChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { size: 11 } } } },
      scales: {
        x: { ticks: { font: { size: 10 } } },
        ySpeed: {
          type: "linear",
          position: "left",
          title: { display: true, text: "m/s", font: { size: 10 } },
          ticks: { font: { size: 10 } },
        },
        yRatio: {
          type: "linear",
          position: "right",
          min: 0,
          max: 1,
          title: { display: true, text: "0–1", font: { size: 10 } },
          ticks: { font: { size: 10 } },
          grid: { drawOnChartArea: false },
        },
      },
    }),
    []
  );

  if (!visitMeta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 p-8 flex items-center justify-center">
        <p className="text-teal-700 text-sm">No report data loaded.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="border-teal-200 hover:bg-teal-50 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
                <FileBarChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-teal-900">Report summary</h1>
                <p className="text-sm text-teal-700">Visit review · face, audio, gait</p>
              </div>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-teal-800/80 sm:pr-2">
            <div className="font-semibold">{visitMeta.visitId}</div>
            <div>Patient {visitMeta.patientId}</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            <Card className="border-teal-200 bg-white/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                  Visit info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md bg-teal-900 text-teal-50 p-4 space-y-3 text-sm">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wider text-teal-300/90">Visit ID</p>
                    <p className="font-mono font-semibold">{visitMeta.visitId}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wider text-teal-300/90">Patient ID</p>
                    <p className="font-mono font-semibold">{visitMeta.patientId}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wider text-teal-300/90">Phase</p>
                    <p className="font-mono font-semibold">{visitMeta.phase}</p>
                  </div>
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wider text-teal-300/90">Schema</p>
                    <p className="font-mono font-semibold">{visitMeta.schema}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-teal-200 bg-white/80 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                  Subsystems
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { id: "face", label: "Face", conf: cf, active: "border-blue-300 bg-blue-50" },
                  { id: "audio", label: "Audio", conf: ca, active: "border-violet-300 bg-violet-50" },
                  { id: "gait", label: "Gait", conf: cg, active: "border-emerald-300 bg-emerald-50" },
                ].map(({ id, label, conf, active }) => {
                  const has = id === "face" ? face.length : id === "audio" ? audio.length : gait.length;
                  return (
                    <div
                      key={id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                        has ? active : "border-transparent bg-teal-50/50 hover:border-teal-200"
                      )}
                    >
                      <span
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 rounded-full",
                          id === "face" && "bg-blue-600",
                          id === "audio" && "bg-violet-700",
                          id === "gait" && "bg-emerald-600"
                        )}
                      />
                      <span className="font-medium text-teal-900 flex-1">{label}</span>
                      <span className="font-mono text-xs text-teal-600">{fmtConf(conf)}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </aside>

          <main className="flex-1 min-w-0 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card className="border-teal-200 bg-white/80 backdrop-blur overflow-hidden border-t-4 border-t-teal-900">
                <CardContent className="pt-4">
                  <p className="text-[0.65rem] font-mono uppercase tracking-wider text-teal-600 mb-1">
                    Overall confidence
                  </p>
                  <p className="text-3xl font-bold text-teal-900">{co != null ? pct(co) : "—"}</p>
                  <p className="text-xs text-teal-600 mt-1">Across all subsystems</p>
                </CardContent>
              </Card>
              <Card className="border-teal-200 bg-white/80 backdrop-blur overflow-hidden border-t-4 border-t-blue-600">
                <CardContent className="pt-4">
                  <p className="text-[0.65rem] font-mono uppercase tracking-wider text-teal-600 mb-1">
                    Face · confidence
                  </p>
                  <p className="text-3xl font-bold text-blue-700">{cf != null ? pct(cf) : "—"}</p>
                  <p className="text-xs text-teal-600 mt-1">{face.length} records</p>
                </CardContent>
              </Card>
              <Card className="border-teal-200 bg-white/80 backdrop-blur overflow-hidden border-t-4 border-t-violet-600">
                <CardContent className="pt-4">
                  <p className="text-[0.65rem] font-mono uppercase tracking-wider text-teal-600 mb-1">
                    Audio · confidence
                  </p>
                  <p className="text-3xl font-bold text-violet-700">{ca != null ? pct(ca) : "—"}</p>
                  <p className="text-xs text-teal-600 mt-1">{audio.length} records</p>
                </CardContent>
              </Card>
              <Card className="border-teal-200 bg-white/80 backdrop-blur overflow-hidden border-t-4 border-t-emerald-600">
                <CardContent className="pt-4">
                  <p className="text-[0.65rem] font-mono uppercase tracking-wider text-teal-600 mb-1">
                    Gait · confidence
                  </p>
                  <p className="text-3xl font-bold text-emerald-700">{cg != null ? pct(cg) : "—"}</p>
                  <p className="text-xs text-teal-600 mt-1">{gait.length} records</p>
                </CardContent>
              </Card>
            </div>

            {faceDerived && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-teal-900">Facial expression analysis</h2>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Face</Badge>
                  <div className="hidden sm:block flex-1 h-px bg-teal-200 min-w-[4rem]" />
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[0.65rem]",
                      faceDerived.anyInvalid
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                    )}
                  >
                    {faceDerived.anyInvalid ? "● Issues" : "● Valid"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-teal-200 bg-white/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono uppercase tracking-wider text-teal-600">
                        Emotion distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {faceDerived.sorted.map(([key, val]) => (
                          <div key={key} className="flex items-center gap-3">
                            <span className="w-24 shrink-0 text-sm text-teal-900 capitalize">
                              {labelEmo(key)}
                            </span>
                            <div className="flex-1 h-3.5 rounded bg-teal-100 overflow-hidden">
                              <div
                                className="h-full rounded transition-all duration-500"
                                style={{ width: `${val}%`, backgroundColor: emoColor(key) }}
                              />
                            </div>
                            <span className="w-12 text-right font-mono text-xs text-teal-600">
                              {val.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-teal-200 bg-white/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono uppercase tracking-wider text-teal-600">
                        Emotion breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={chartBox}>
                        <Chart
                          key={faceDerived.sorted.map(([k]) => k).join("-")}
                          type="doughnut"
                          data={faceDerived.doughnutData}
                          options={doughnutOptions}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {faceDerived.timeline && (
                  <Card className="border-teal-200 bg-white/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono uppercase tracking-wider text-teal-600">
                        Emotion over time (windows)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={chartBoxTall}>
                        <Chart
                          type="bar"
                          data={faceDerived.timeline}
                          options={faceTimelineOptions}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-mono text-teal-600 underline p-0 h-auto"
                    onClick={() => setShowFaceRaw((s) => !s)}
                  >
                    {showFaceRaw ? "Hide raw records" : "Show raw records"}
                  </Button>
                  {showFaceRaw && (
                    <pre className="mt-2 rounded-md bg-slate-900 text-sky-100/90 font-mono text-[0.65rem] p-4 max-h-64 overflow-auto whitespace-pre-wrap break-all">
                      {face.map((r) => JSON.stringify(r, null, 2)).join("\n\n")}
                    </pre>
                  )}
                </div>
              </section>
            )}

            {audioDerived && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-teal-900">Audio &amp; language analysis</h2>
                  <Badge className="bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-100">
                    Audio
                  </Badge>
                  <div className="hidden sm:block flex-1 h-px bg-teal-200 min-w-[4rem]" />
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[0.65rem]",
                      audioDerived.anyInvalid
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                    )}
                  >
                    {audioDerived.anyInvalid ? "● Issues" : "● Valid"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-teal-200 bg-white/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono uppercase tracking-wider text-teal-600">
                        Sentiment polarity over time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={chartBox}>
                        <Chart type="bar" data={audioDerived.sentiment} options={sentimentOptions} />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-teal-200 bg-white/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono uppercase tracking-wider text-teal-600">
                        Word count over time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={chartBox}>
                        <Chart type="line" data={audioDerived.wordCount} options={wordCountOptions} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-teal-200 bg-white/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono uppercase tracking-wider text-teal-600">
                        Top keywords (all windows)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-teal-200">
                            <th className="text-left py-2 text-[0.65rem] font-mono uppercase tracking-wider text-teal-600">
                              Word
                            </th>
                            <th className="text-left py-2 text-[0.65rem] font-mono uppercase tracking-wider text-teal-600">
                              Diagnostic
                            </th>
                            <th className="text-right py-2 text-[0.65rem] font-mono uppercase tracking-wider text-teal-600">
                              Count
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {audioDerived.kwSorted.map(([word, count]) => (
                            <tr key={word} className="border-b border-teal-100">
                              <td className="py-1.5 text-teal-900">{word}</td>
                              <td className="py-1.5">
                                {audioDerived.diagSet.has(word) ? (
                                  <span className="inline-block rounded bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[0.65rem] font-mono font-semibold">
                                    diagnostic
                                  </span>
                                ) : null}
                              </td>
                              <td className="py-1.5 text-right font-mono font-semibold text-teal-800">
                                {count}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                  <Card className="border-teal-200 bg-white/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono uppercase tracking-wider text-teal-600">
                        Topic distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {audioDerived.topicRows.map(({ topic, avg }) => (
                        <div key={topic} className="flex items-center gap-2">
                          <span className="w-40 shrink-0 text-sm text-teal-900 truncate">
                            {topic.replace(/_/g, " ")}
                          </span>
                          <div className="flex-1 h-2.5 rounded bg-teal-100 overflow-hidden">
                            <div
                              className="h-full rounded bg-violet-600 transition-all"
                              style={{ width: `${(avg * 100).toFixed(0)}%` }}
                            />
                          </div>
                          <span className="w-9 text-right font-mono text-xs text-teal-600">
                            {(avg * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-mono text-teal-600 underline p-0 h-auto"
                    onClick={() => setShowAudioRaw((s) => !s)}
                  >
                    {showAudioRaw ? "Hide raw records" : "Show raw records"}
                  </Button>
                  {showAudioRaw && (
                    <pre className="mt-2 rounded-md bg-slate-900 text-sky-100/90 font-mono text-[0.65rem] p-4 max-h-64 overflow-auto whitespace-pre-wrap break-all">
                      {audio.map((r) => JSON.stringify(r, null, 2)).join("\n\n")}
                    </pre>
                  )}
                </div>
              </section>
            )}

            {gaitDerived && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-teal-900">Gait &amp; motion analysis</h2>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
                    Gait
                  </Badge>
                  <div className="hidden sm:block flex-1 h-px bg-teal-200 min-w-[4rem]" />
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[0.65rem]",
                      gaitDerived.anyInvalid
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                    )}
                  >
                    {gaitDerived.anyInvalid ? "● Issues" : "● Valid"}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="border-teal-200 bg-teal-50/80 text-center p-4">
                    <p className="text-3xl font-bold text-emerald-700 font-serif">
                      {gaitDerived.avgSpeed != null ? gaitDerived.avgSpeed.toFixed(2) : "—"}
                    </p>
                    <p className="text-[0.65rem] font-mono uppercase tracking-wider text-teal-600 mt-2">
                      Avg speed (m/s)
                    </p>
                    <p className="text-xs text-teal-600 mt-1">
                      Normal: 1.0–1.4 m/s · {qualLabel(gaitDerived.avgSpeed, 0.7, 1.0)}
                    </p>
                  </Card>
                  <Card className="border-teal-200 bg-teal-50/80 text-center p-4">
                    <p className="text-3xl font-bold text-emerald-700 font-serif">
                      {gaitDerived.avgSym != null ? `${(gaitDerived.avgSym * 100).toFixed(0)}%` : "—"}
                    </p>
                    <p className="text-[0.65rem] font-mono uppercase tracking-wider text-teal-600 mt-2">
                      Avg symmetry
                    </p>
                    <p className="text-xs text-teal-600 mt-1">
                      Normal: &gt;85% · {qualLabel(gaitDerived.avgSym, 0.7, 0.85)}
                    </p>
                  </Card>
                  <Card className="border-teal-200 bg-teal-50/80 text-center p-4">
                    <p className="text-3xl font-bold text-emerald-700 font-serif">
                      {gaitDerived.avgStab != null ? `${(gaitDerived.avgStab * 100).toFixed(0)}%` : "—"}
                    </p>
                    <p className="text-[0.65rem] font-mono uppercase tracking-wider text-teal-600 mt-2">
                      Avg stability
                    </p>
                    <p className="text-xs text-teal-600 mt-1">
                      Normal: &gt;80% · {qualLabel(gaitDerived.avgStab, 0.65, 0.8)}
                    </p>
                  </Card>
                </div>
                {gaitDerived.gaitNotes && (
                  <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 text-amber-900 text-sm px-4 py-3">
                    {gaitDerived.gaitNotes}
                  </div>
                )}
                {gaitDerived.gaitChart && (
                  <Card className="border-teal-200 bg-white/80 backdrop-blur">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-mono uppercase tracking-wider text-teal-600">
                        Gait metrics over time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={chartBoxTall}>
                        <Chart type="line" data={gaitDerived.gaitChart} options={gaitChartOptions} />
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card className="border-teal-200 bg-white/80 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono uppercase tracking-wider text-teal-600">
                      Events detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {gaitDerived.events.length === 0 ? (
                      <p className="text-sm text-teal-600">No events detected.</p>
                    ) : (
                      gaitDerived.events.map((e, i) => (
                        <div
                          key={`${e.t}-${i}`}
                          className="flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50/50 px-3 py-2 text-sm"
                        >
                          <span className="font-mono text-xs text-teal-600 w-12 shrink-0">
                            {e.t != null ? `${e.t}s` : "—"}
                          </span>
                          <span className="flex-1 font-medium text-teal-900">
                            {e.features?.event ?? "unknown"}
                          </span>
                          <span className="font-mono text-xs text-teal-600">
                            conf: {fmtConf(e.confidence)}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-mono text-teal-600 underline p-0 h-auto"
                    onClick={() => setShowGaitRaw((s) => !s)}
                  >
                    {showGaitRaw ? "Hide raw records" : "Show raw records"}
                  </Button>
                  {showGaitRaw && (
                    <pre className="mt-2 rounded-md bg-slate-900 text-sky-100/90 font-mono text-[0.65rem] p-4 max-h-64 overflow-auto whitespace-pre-wrap break-all">
                      {gait.map((r) => JSON.stringify(r, null, 2)).join("\n\n")}
                    </pre>
                  )}
                </div>
              </section>
            )}

            <p className="text-xs text-teal-600 pb-4">
              Demo data — wire this page to live JSONL or API when ready.{" "}
              <Link to={createPageUrl("Dashboard")} className="underline text-teal-800">
                Back to dashboard
              </Link>
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
