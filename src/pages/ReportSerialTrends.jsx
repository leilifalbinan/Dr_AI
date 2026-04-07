import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  Filler,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { format } from "date-fns";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { createPageUrl, cn } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  demoSerialVisitSnapshots,
  SERIAL_TREND_DEMO_PATIENT_ID,
} from "@/data/reportSerialTrendDemoData";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Legend, Tooltip, Filler);

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { font: { size: 11 } } } },
  scales: {
    x: { ticks: { font: { size: 10 } } },
    y: { ticks: { font: { size: 10 } } },
  },
};

export default function ReportSerialTrends() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId") || SERIAL_TREND_DEMO_PATIENT_ID;
  const visitId = searchParams.get("visitId") || "";

  const snaps = demoSerialVisitSnapshots;

  const labels = useMemo(
    () => snaps.map((s) => format(new Date(s.visit_date), "MMM d, yy")),
    [snaps]
  );

  const vitalsChart = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Systolic BP",
          data: snaps.map((s) => s.bp_systolic),
          borderColor: "#0f766e",
          backgroundColor: "rgba(15,118,110,0.12)",
          tension: 0.25,
          fill: false,
        },
        {
          label: "Heart rate",
          data: snaps.map((s) => s.heart_rate),
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124,58,237,0.1)",
          tension: 0.25,
          fill: false,
        },
      ],
    }),
    [labels, snaps]
  );

  const faceChart = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Low affect (%)",
          data: snaps.map((s) => s.face_low_affect_pct),
          borderColor: "#1d4ed8",
          backgroundColor: "rgba(29,78,216,0.08)",
          tension: 0.25,
        },
        {
          label: "Arousal (%)",
          data: snaps.map((s) => s.face_arousal_pct),
          borderColor: "#64748b",
          backgroundColor: "rgba(100,116,139,0.08)",
          tension: 0.25,
        },
        {
          label: "Disgust (%)",
          data: snaps.map((s) => s.face_disgust_pct),
          borderColor: "#7c2d12",
          backgroundColor: "rgba(124,45,18,0.08)",
          tension: 0.25,
        },
        {
          label: "Angry (%)",
          data: snaps.map((s) => s.face_angry_pct),
          borderColor: "#b91c1c",
          backgroundColor: "rgba(185,28,28,0.08)",
          tension: 0.25,
        },
        {
          label: "Happy (%)",
          data: snaps.map((s) => s.face_happy_pct),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245,158,11,0.08)",
          tension: 0.25,
        },
      ],
    }),
    [labels, snaps]
  );

  const audioChart = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Sentiment score",
          data: snaps.map((s) => s.sentiment_score),
          borderColor: "#92400e",
          backgroundColor: "rgba(146,64,14,0.1)",
          yAxisID: "ySent",
          tension: 0.25,
        },
        {
          label: "Diagnostic term %",
          data: snaps.map((s) => (s.audio_diagnostic_term_pct ?? 0) * 100),
          borderColor: "#7c3aed",
          backgroundColor: "rgba(124,58,237,0.08)",
          yAxisID: "yPct",
          tension: 0.25,
        },
      ],
    }),
    [labels, snaps]
  );

  const gaitChart = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Speed (m/s)",
          data: snaps.map((s) => s.gait_avg_speed_mps),
          borderColor: "#0f766e",
          backgroundColor: "rgba(15,118,110,0.1)",
          yAxisID: "ySpeed",
          tension: 0.25,
        },
        {
          label: "Symmetry (%)",
          data: snaps.map((s) => (s.gait_avg_symmetry ?? 0) * 100),
          borderColor: "#15803d",
          backgroundColor: "rgba(21,128,61,0.08)",
          yAxisID: "yPct",
          borderDash: [4, 2],
          tension: 0.25,
        },
        {
          label: "Stability (%)",
          data: snaps.map((s) => (s.gait_avg_stability ?? 0) * 100),
          borderColor: "#65a30d",
          backgroundColor: "rgba(101,163,13,0.08)",
          yAxisID: "yPct",
          borderDash: [2, 4],
          tension: 0.25,
        },
      ],
    }),
    [labels, snaps]
  );

  const twoAxisSentimentOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { size: 10 } } } },
      scales: {
        x: { ticks: { font: { size: 10 } } },
        ySent: {
          type: "linear",
          position: "left",
          min: -1,
          max: 1,
          ticks: { font: { size: 10 } },
          title: { display: true, text: "-1 to 1", font: { size: 10 } },
        },
        yPct: {
          type: "linear",
          position: "right",
          min: 0,
          max: 100,
          ticks: { callback: (v) => `${v}%`, font: { size: 10 } },
          title: { display: true, text: "%", font: { size: 10 } },
          grid: { drawOnChartArea: false },
        },
      },
    }),
    []
  );

  const gaitOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { size: 10 } } } },
      scales: {
        x: { ticks: { font: { size: 10 } } },
        ySpeed: {
          type: "linear",
          position: "left",
          ticks: { font: { size: 10 } },
          title: { display: true, text: "m/s", font: { size: 10 } },
        },
        yPct: {
          type: "linear",
          position: "right",
          min: 0,
          max: 100,
          ticks: { callback: (v) => `${v}%`, font: { size: 10 } },
          title: { display: true, text: "%", font: { size: 10 } },
          grid: { drawOnChartArea: false },
        },
      },
    }),
    []
  );

  const latest = snaps[snaps.length - 1];
  const previous = snaps.length > 1 ? snaps[snaps.length - 2] : null;

  const backToReport = () => {
    const q = visitId ? `?visitId=${encodeURIComponent(visitId)}` : "";
    navigate(`${createPageUrl("ReportSummary")}${q}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={backToReport}
              className="border-teal-200 hover:bg-teal-50 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-teal-900">Serial trend analysis</h1>
                <p className="text-sm text-teal-700">
                  Demo series · patient <span className="font-mono">{patientId}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-teal-200 bg-white/80 backdrop-blur mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-teal-800">Visits in this demo series</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-teal-200 text-left text-[0.65rem] uppercase tracking-wider text-teal-600">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Date</th>
                    <th className="py-2 pr-2">BP</th>
                    <th className="py-2 pr-2">HR</th>
                    <th className="py-2 pr-2">SpO₂</th>
                    <th className="py-2 pr-2">Sentiment</th>
                    <th className="py-2">Gait m/s</th>
                  </tr>
                </thead>
                <tbody>
                  {snaps.map((s) => (
                    <tr
                      key={s.visit_id}
                      className={cn(
                        "border-b border-teal-100",
                        visitId && s.visit_id === visitId && "bg-teal-50/80"
                      )}
                    >
                      <td className="py-2 pr-2 font-mono">{s.visit_number}</td>
                      <td className="py-2 pr-2">{format(new Date(s.visit_date), "MMM d, yyyy")}</td>
                      <td className="py-2 pr-2 font-mono">
                        {s.bp_systolic}/{s.bp_diastolic}
                      </td>
                      <td className="py-2 pr-2 font-mono">{s.heart_rate}</td>
                      <td className="py-2 pr-2 font-mono">{s.spo2}%</td>
                      <td className="py-2 pr-2 font-mono">{s.sentiment_score?.toFixed(2)}</td>
                      <td className="py-2 font-mono">{s.gait_avg_speed_mps?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <Card className="border-teal-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                Vitals trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[240px] w-full">
                <Chart type="line" data={vitalsChart} options={lineOpts} />
              </div>
            </CardContent>
          </Card>
          <Card className="border-teal-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                Current visit quick metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-teal-200 bg-teal-50/70 p-3">
                <p className="text-[0.65rem] uppercase tracking-wider text-teal-600">BP</p>
                <p className="text-lg font-semibold text-teal-900 font-mono">
                  {latest.bp_systolic}/{latest.bp_diastolic}
                </p>
                {previous && (
                  <p className="text-xs text-teal-700">
                    delta {latest.bp_systolic - previous.bp_systolic >= 0 ? "+" : ""}
                    {latest.bp_systolic - previous.bp_systolic} sys
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50/70 p-3">
                <p className="text-[0.65rem] uppercase tracking-wider text-teal-600">Heart rate</p>
                <p className="text-lg font-semibold text-teal-900 font-mono">{latest.heart_rate} bpm</p>
                {previous && (
                  <p className="text-xs text-teal-700">
                    delta {latest.heart_rate - previous.heart_rate >= 0 ? "+" : ""}
                    {latest.heart_rate - previous.heart_rate}
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50/70 p-3">
                <p className="text-[0.65rem] uppercase tracking-wider text-teal-600">Audio sentiment</p>
                <p className="text-lg font-semibold text-teal-900 font-mono">{latest.sentiment_score?.toFixed(2)}</p>
                {previous && (
                  <p className="text-xs text-teal-700">
                    delta {latest.sentiment_score - previous.sentiment_score >= 0 ? "+" : ""}
                    {(latest.sentiment_score - previous.sentiment_score).toFixed(2)}
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50/70 p-3">
                <p className="text-[0.65rem] uppercase tracking-wider text-teal-600">Gait speed</p>
                <p className="text-lg font-semibold text-teal-900 font-mono">{latest.gait_avg_speed_mps?.toFixed(2)} m/s</p>
                {previous && (
                  <p className="text-xs text-teal-700">
                    delta {latest.gait_avg_speed_mps - previous.gait_avg_speed_mps >= 0 ? "+" : ""}
                    {(latest.gait_avg_speed_mps - previous.gait_avg_speed_mps).toFixed(2)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <Card className="border-teal-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                Face subsystem trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[240px] w-full">
                <Chart type="line" data={faceChart} options={lineOpts} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                Audio subsystem trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[240px] w-full">
                <Chart type="line" data={audioChart} options={twoAxisSentimentOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <Card className="border-teal-200 bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                Gait subsystem trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[240px] w-full">
                <Chart type="line" data={gaitChart} options={gaitOptions} />
              </div>
            </CardContent>
          </Card>

        </div>

        <Card className="border-teal-200 bg-white/80 backdrop-blur mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-teal-600">
              AI assessment snapshot by visit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {snaps.map((s) => (
              <div
                key={`${s.visit_id}-ai`}
                className={cn(
                  "rounded-lg border border-teal-200 bg-teal-50/60 p-4",
                  visitId && s.visit_id === visitId && "ring-2 ring-teal-300"
                )}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-teal-900">
                    Visit #{s.visit_number} · {format(new Date(s.visit_date), "MMM d, yyyy")}
                  </span>
                  <span
                    className={cn(
                      "text-[0.65rem] uppercase tracking-wide px-2 py-0.5 rounded border",
                      s.ai_assessment?.risk_level === "high"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    )}
                  >
                    Risk: {s.ai_assessment?.risk_level ?? "n/a"}
                  </span>
                </div>
                <p className="text-xs text-teal-700 mb-2">{s.chief_complaint}</p>
                <ul className="list-disc pl-5 text-sm text-teal-900 space-y-1">
                  {(s.ai_assessment?.suggested_diagnoses || []).map((dx, i) => (
                    <li key={i}>{dx}</li>
                  ))}
                </ul>
                {s.ai_assessment?.follow_up_recommendations && (
                  <p className="text-sm text-teal-800 mt-3">
                    <span className="font-semibold">Follow-up:</span>{" "}
                    {s.ai_assessment.follow_up_recommendations}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-xs text-teal-600">
          Sample data only — extend with stored visits and JSONL rollups when backend wiring is ready.
        </p>
      </div>
    </div>
  );
}
