import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, FileText, Loader2, UserPlus, Mic, MicOff } from "lucide-react";
import { compareAllModels, getConsensusResult, analyzeKeywords, analyzeSentiment, analyzeSemantics, extractPatientText } from "@/services/aiService";
import { transcriptionService } from "@/services/transcriptionService";
import { AudioJsonlLogger, makeRelativeTimer, parsePatientSegments } from "@/utils/jsonlLogger";
import FacialAnalysis from "@/components/FacialAnalysis";

function formatTranscriptionForDisplay(text) {
  if (!text) return text;
  return text.replace(/Mic 1/g, "Patient").replace(/Mic 2/g, "Doctor");
}

export default function NewVisit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [visitData, setVisitData] = useState({
    visit_date: new Date().toISOString().split("T")[0],
    chief_complaint: "",
    transcription: "",
    physician_notes: "",
    bp_systolic: "",
    bp_diastolic: "",
    heart_rate: "",
    respiratory_rate: "",
    temperature: "",
    spo2: "",
    height: "",
    weight: "",
    bmi: "",
    gait_summary: null,
    gait_summary_text: "",
    gait_overlay_video_url: ""
  });

  const [speakerSegments, setSpeakerSegments] = useState([]);
  const [units, setUnits] = useState("metric");
  const [tempUnit, setTempUnit] = useState("fahrenheit");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState({
    openai: "pending",
    ollama: "pending"
  });
  const [isStartingTranscription, setIsStartingTranscription] = useState(false);

  const transcriptionListenerRef = useRef(null);
  const jsonlLoggerRef = useRef(null);
  const windowStartRef = useRef(null);

  const [isGaitRunning, setIsGaitRunning] = useState(false);
  const [gaitSummary, setGaitSummary] = useState(null);
  const [gaitError, setGaitError] = useState(null);
  const gaitRunPromiseRef = useRef(null);

  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [newPatient, setNewPatient] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    medical_record_number: "",
    primary_diagnosis: "",
    notes: ""
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.entities.Patient.list("-created_date"),
  });

  const { data: existingVisits = [] } = useQuery({
    queryKey: ["visits", selectedPatientId],
    queryFn: () => api.entities.Visit.filter({ patient_id: selectedPatientId }),
    enabled: !!selectedPatientId
  });

  useEffect(() => {
    transcriptionService.connect().catch(() => {});
  }, [isGaitRunning]);

  useEffect(() => {
    return () => {
      if (isTranscribing) {
        transcriptionService.stop().catch(console.error);
      }
      if (transcriptionListenerRef.current) {
        transcriptionListenerRef.current();
      }
      transcriptionService.disconnect();
      try {
        if (isGaitRunning) {
          fetch("/api/gait/stop", { method: "POST" }).catch(() => {});
        }
      } catch (err) {
        console.warn("Error cleaning up monitoring streams", err);
      }
    };
  }, []);

  const formatGaitSummaryText = (summary) => {
    if (!summary) return "";
    if (summary.summary_text) return summary.summary_text;

    const parts = [];
    if (summary.mean_speed_mps != null) parts.push(`speed ${Number(summary.mean_speed_mps).toFixed(2)} m/s`);
    if (summary.cadence_spm != null) parts.push(`cadence ${Number(summary.cadence_spm).toFixed(1)} steps/min`);
    if (summary.num_steps_est != null) parts.push(`estimated steps ${summary.num_steps_est}`);
    if (summary.knee_symmetry_index_percent != null) parts.push(`knee symmetry index ${Number(summary.knee_symmetry_index_percent).toFixed(1)}%`);
    if (summary.stability_ml_rms_m != null) parts.push(`medio-lateral sway RMS ${Number(summary.stability_ml_rms_m).toFixed(3)} m`);
    if (summary.sit_to_stand_detected != null) parts.push(`sit-to-stand ${summary.sit_to_stand_detected ? "detected" : "not detected"}`);

    return parts.length > 0 ? `Gait analysis: ${parts.join(", ")}.` : "Gait analysis completed.";
  };

  const handleStartGait = async () => {
    try {
      setGaitError(null);
      setGaitSummary(null);
      setIsGaitRunning(true);

      gaitRunPromiseRef.current = fetch("/api/gait?duration=0")
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || !data.ok) {
            throw new Error(data.error || "Failed to run gait capture");
          }

          const summary = data.summary || {};
          const summaryText = formatGaitSummaryText(summary);

          setGaitSummary(summary);
          setVisitData((prev) => ({
            ...prev,
            gait_summary: summary,
            gait_summary_text: summaryText,
            gait_overlay_video_url: summary.overlay_video_url || ""
          }));
        })
        .catch((err) => {
          console.error(err);
          setGaitError(err.message || "Failed to run gait capture");
        })
        .finally(() => {
          setIsGaitRunning(false);
        });

    } catch (err) {
      setGaitError(err.message || "Failed to start gait capture");
      setIsGaitRunning(false);
    }
  };

  const handleStopGait = async () => {
    try {
      await fetch("/api/gait/stop", { method: "POST" });
      if (gaitRunPromiseRef.current) {
        await gaitRunPromiseRef.current;
      }
    } catch (err) {
      console.error(err);
      setGaitError(err.message || "Failed to stop gait capture");
      setIsGaitRunning(false);
    }
  };

  useEffect(() => {
    if (isTranscribing) {
      transcriptionListenerRef.current = transcriptionService.addListener(async (event, data) => {
        if (event === "update") {
          const displayText = formatTranscriptionForDisplay(data.text);
          setVisitData(prev => ({
            ...prev,
            transcription: prev.transcription
              ? `${prev.transcription}\n\n${displayText}`.trim()
              : displayText
          }));

          if (jsonlLoggerRef.current && data.text) {
            const logger = jsonlLoggerRef.current;
            const now = Date.now();
            const toRel = makeRelativeTimer(logger.t0);
            const tStart = toRel(windowStartRef.current);
            const tEnd = toRel(now);
            windowStartRef.current = now;
            const patientText = extractPatientText(data.text) || data.text;
            const keywordAnalysis = analyzeKeywords(patientText);
            const sentimentAnalysis = await analyzeSentiment(patientText);
            const semanticAnalysis = analyzeSemantics(patientText);
            logger.logWindow({
              tStart,
              tEnd,
              wordCount: data.text.trim().split(/\s+/).length,
              keywordAnalysis,
              sentimentAnalysis,
              semanticAnalysis
            });
          }

        } else if (event === "complete") {
          const displayFull = formatTranscriptionForDisplay(data.full_text || "");
          setVisitData(prev => ({ ...prev, transcription: displayFull || prev.transcription }));
          setIsTranscribing(false);

        } else if (event === "error") {
          setTranscriptionError(data.message);
          setIsTranscribing(false);
        }
      });
    }

    return () => {
      if (transcriptionListenerRef.current) {
        transcriptionListenerRef.current();
        transcriptionListenerRef.current = null;
      }
    };
  }, [isTranscribing]);

  const createPatientMutation = useMutation({
    mutationFn: (patientData) => api.entities.Patient.create(patientData),
    onSuccess: (createdPatient) => {
      queryClient.invalidateQueries(["patients"]);
      setSelectedPatientId(createdPatient.id);
      setShowNewPatientDialog(false);
      setNewPatient({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "",
        medical_record_number: "",
        primary_diagnosis: "",
        notes: ""
      });
    },
  });

  const createVisitMutation = useMutation({
    mutationFn: async (data) => {
      const visit = await api.entities.Visit.create(data);
      return visit;
    },
    onSuccess: (visit) => {
      queryClient.invalidateQueries(["visits"]);
      navigate(createPageUrl(`VisitDetails?id=${visit.id}`));
    },
  });

  const handleCreatePatient = () => {
    createPatientMutation.mutate(newPatient);
  };

  const handleStartTranscription = async () => {
    try {
      setTranscriptionError(null);
      setIsStartingTranscription(true);
      await transcriptionService.start();

      const t0 = Date.now();
      jsonlLoggerRef.current = new AudioJsonlLogger({
        visitId: selectedPatientId || `session_${t0}`,
        patientId: selectedPatientId || "unknown",
        t0,
      });
      windowStartRef.current = t0;

      setIsTranscribing(true);
    } catch (error) {
      console.error("Failed to start transcription:", error);
      setTranscriptionError(error.message || "Failed to start transcription. Make sure the backend is running.");
      setIsTranscribing(false);
    } finally {
      setIsStartingTranscription(false);
    }
  };

  const handleStopTranscription = async () => {
    try {
      const result = await transcriptionService.stop();
      if (result && result.full_text) {
        setVisitData(prev => ({
          ...prev,
          transcription: formatTranscriptionForDisplay(result.full_text)
        }));
      }
      setIsTranscribing(false);
      setTranscriptionError(null);
    } catch (error) {
      console.error("Failed to stop transcription:", error);
      setTranscriptionError(error.message || "Failed to stop transcription");
      setIsTranscribing(false);
    }
  };

  const analyzeTranscription = async () => {
    if (!visitData.transcription || !selectedPatientId) return;

    if (!visitData.bp_systolic || !visitData.bp_diastolic || !visitData.heart_rate) {
      alert("Please enter required vital signs: Blood Pressure and Heart Rate");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress({ openai: "running", ollama: "running" });

    try {
      const results = await compareAllModels(visitData, (model, status) => {
        console.log(`${model}: ${status}`);
        setAnalysisProgress(prev => ({ ...prev, [model]: status }));
      });

      const consensus = await getConsensusResult(results, visitData.transcription);

      if (!consensus) {
        alert("All AI models failed. Please check your configuration and try again.");
        setIsAnalyzing(false);
        return;
      }

      if (!jsonlLoggerRef.current && visitData.transcription) {
        const t0 = Date.now();
        jsonlLoggerRef.current = new AudioJsonlLogger({
          visitId: selectedPatientId,
          patientId: selectedPatientId,
          t0,
        });
        const segments = parsePatientSegments(visitData.transcription);
        if (segments.length > 0) {
          const segmentsWithAnalysis = await Promise.all(
            segments.map(async ({ tStart, tEnd, text }) => ({
              tStart,
              tEnd,
              text,
              keywordAnalysis: analyzeKeywords(text),
              sentimentAnalysis: await analyzeSentiment(text),
              semanticAnalysis: analyzeSemantics(text),
            }))
          );
          jsonlLoggerRef.current.logPatientSegments(segmentsWithAnalysis);
        } else {
          const patientText = extractPatientText(visitData.transcription) || visitData.transcription;
          const keywordAnalysis = analyzeKeywords(patientText);
          const sentimentAnalysis = await analyzeSentiment(patientText);
          const semanticAnalysis = analyzeSemantics(patientText);
          jsonlLoggerRef.current.logWindow({
            tStart: 0,
            tEnd: parseFloat((visitData.transcription.trim().split(/\s+/).length / 2.5).toFixed(3)),
            wordCount: patientText.trim().split(/\s+/).length,
            keywordAnalysis,
            sentimentAnalysis,
            semanticAnalysis,
          });
        }
      }

      if (jsonlLoggerRef.current) {
        jsonlLoggerRef.current.logSummary();
        jsonlLoggerRef.current.download();
        jsonlLoggerRef.current = null;
      }

      const visitNumber = existingVisits.length + 1;

      createVisitMutation.mutate({
        patient_id: selectedPatientId,
        visit_number: visitNumber,
        ...visitData,
        temperature_unit: tempUnit,
        speaker_segments: speakerSegments,
        keyword_analysis: consensus.keyword_analysis,
        sentiment_analysis: consensus.sentiment_analysis,
        semantic_analysis: consensus.semantic_analysis,
        ai_assessment: consensus.ai_assessment,
        ai_comparison: results,
        gait_summary: visitData.gait_summary,
        gait_summary_text: visitData.gait_summary_text,
        gait_overlay_video_url: visitData.gait_overlay_video_url
      });

    } catch (error) {
      console.error("Analysis error:", error);
      alert("Error analyzing transcription. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return "";
    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    return bmi;
  };

  const handleWeightChange = (value) => {
    setVisitData(prev => {
      const newData = { ...prev, weight: value };
      if (prev.height) {
        newData.bmi = calculateBMI(value, prev.height);
      }
      return newData;
    });
  };

  const handleHeightChange = (value) => {
    setVisitData(prev => {
      const newData = { ...prev, height: value };
      if (prev.weight) {
        newData.bmi = calculateBMI(prev.weight, value);
      }
      return newData;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="border-teal-200 hover:bg-teal-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-teal-900 mb-1">New Patient Visit</h1>
              <p className="text-sm text-teal-700">Record and analyze patient consultation</p>
            </div>
          </div>
        </div>

        <Card className="border-teal-200 bg-white/80 backdrop-blur mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-teal-900">
              <FileText className="w-4 h-4" />
              Visit Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="patient" className="text-sm font-medium text-teal-900">Select Patient *</Label>
              <div className="flex gap-2">
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} {patient.medical_record_number && `(MRN: ${patient.medical_record_number})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setShowNewPatientDialog(true)}
                  className="border-teal-300 hover:bg-teal-50"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  New Patient
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visit_date" className="text-sm font-medium text-teal-900">Visit Date *</Label>
                <Input
                  id="visit_date"
                  type="date"
                  value={visitData.visit_date}
                  onChange={(e) => setVisitData({ ...visitData, visit_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chief_complaint" className="text-sm font-medium text-teal-900">Chief Complaint</Label>
                <Input
                  id="chief_complaint"
                  placeholder="e.g., Shortness of breath"
                  value={visitData.chief_complaint}
                  onChange={(e) => setVisitData({ ...visitData, chief_complaint: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-teal-900">Vital Signs *</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bp" className="text-xs">Blood Pressure (mmHg) *</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="bp"
                      type="number"
                      placeholder="120"
                      value={visitData.bp_systolic}
                      onChange={(e) => setVisitData({ ...visitData, bp_systolic: e.target.value })}
                      className="text-sm"
                    />
                    <span className="text-gray-400">/</span>
                    <Input
                      type="number"
                      placeholder="80"
                      value={visitData.bp_diastolic}
                      onChange={(e) => setVisitData({ ...visitData, bp_diastolic: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heart_rate" className="text-xs">Heart Rate (bpm) *</Label>
                  <Input
                    id="heart_rate"
                    type="number"
                    placeholder="72"
                    value={visitData.heart_rate}
                    onChange={(e) => setVisitData({ ...visitData, heart_rate: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="respiratory_rate" className="text-xs">Respiratory Rate (/min)</Label>
                  <Input
                    id="respiratory_rate"
                    type="number"
                    placeholder="16"
                    value={visitData.respiratory_rate}
                    onChange={(e) => setVisitData({ ...visitData, respiratory_rate: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature" className="text-xs">Temperature</Label>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant={tempUnit === "fahrenheit" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTempUnit("fahrenheit")}
                        className="h-6 px-2 text-xs"
                      >
                        °F
                      </Button>
                      <Button
                        type="button"
                        variant={tempUnit === "celsius" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTempUnit("celsius")}
                        className="h-6 px-2 text-xs"
                      >
                        °C
                      </Button>
                    </div>
                  </div>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    placeholder={tempUnit === "fahrenheit" ? "98.6" : "37.0"}
                    value={visitData.temperature}
                    onChange={(e) => setVisitData({ ...visitData, temperature: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spo2" className="text-xs">SpO2 (%)</Label>
                  <Input
                    id="spo2"
                    type="number"
                    placeholder="98"
                    value={visitData.spo2}
                    onChange={(e) => setVisitData({ ...visitData, spo2: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-teal-900">Physical Measurements</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={units === "metric" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUnits("metric")}
                    className="text-xs"
                  >
                    Metric
                  </Button>
                  <Button
                    type="button"
                    variant={units === "imperial" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUnits("imperial")}
                    className="text-xs"
                  >
                    Imperial
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-xs">
                    Height ({units === "metric" ? "cm" : "in"})
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    placeholder={units === "metric" ? "170" : "67"}
                    value={visitData.height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-xs">
                    Weight ({units === "metric" ? "kg" : "lbs"})
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder={units === "metric" ? "70" : "154"}
                    value={visitData.weight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {visitData.bmi && (
                  <div className="space-y-2">
                    <Label className="text-xs">BMI</Label>
                    <div className="text-sm font-semibold text-teal-700 bg-teal-50 rounded px-3 py-2">
                      {visitData.bmi}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {parseFloat(visitData.bmi) < 18.5 ? "⚠️ Underweight" :
                       parseFloat(visitData.bmi) < 25 ? "✓ Normal" :
                       parseFloat(visitData.bmi) < 30 ? "⚠️ Overweight" :
                       "⚠️ Obese"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-white/80 backdrop-blur mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-teal-900">
              <FileText className="w-4 h-4" />
              Live Monitoring
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-teal-900">Motion / Gait Analysis</h4>
                <span className="text-xs text-gray-500">
                  {isGaitRunning ? "Capturing" : gaitSummary ? "Completed" : "Idle"}
                </span>
              </div>

              <div className="relative bg-black rounded overflow-hidden w-full" style={{ aspectRatio: "16/9" }}>
                <img
                  src="/api/gait/live"
                  alt="Live gait stream"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex gap-2">
                {!isGaitRunning ? (
                  <Button size="sm" onClick={handleStartGait}>
                    Start Gait Capture
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={handleStopGait}>
                    Stop Gait Capture
                  </Button>
                )}
              </div>

              {gaitError && (
                <p className="text-xs text-red-600">{gaitError}</p>
              )}

              {gaitSummary && (
                <div className="text-xs text-slate-700 bg-slate-50 rounded p-3 space-y-1">
                  <div><strong>Summary:</strong> {visitData.gait_summary_text || formatGaitSummaryText(gaitSummary)}</div>
                  <div><strong>Speed:</strong> {gaitSummary.mean_speed_mps != null ? `${Number(gaitSummary.mean_speed_mps).toFixed(2)} m/s` : "N/A"}</div>
                  <div><strong>Cadence:</strong> {gaitSummary.cadence_spm != null ? `${Number(gaitSummary.cadence_spm).toFixed(1)} spm` : "N/A"}</div>
                  <div><strong>Steps:</strong> {gaitSummary.num_steps_est ?? "N/A"}</div>
                  <div><strong>Knee symmetry index:</strong> {gaitSummary.knee_symmetry_index_percent != null ? `${Number(gaitSummary.knee_symmetry_index_percent).toFixed(1)}%` : "N/A"}</div>
                  <div><strong>Sit-to-stand:</strong> {gaitSummary.sit_to_stand_detected ? "Detected" : "Not detected"}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-teal-900">Facial Analysis</h4>
              <FacialAnalysis />
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-white/80 backdrop-blur mb-4 mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-teal-900">
              <FileText className="w-4 h-4" />
              Clinical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="transcription" className="text-sm font-medium text-teal-900">Patient Transcription *</Label>
                <div className="flex items-center gap-2">
                  {isStartingTranscription ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled
                      className="flex items-center gap-2 border-teal-200 bg-teal-50/50"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting up...
                    </Button>
                  ) : !isTranscribing ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleStartTranscription}
                      className="flex items-center gap-2 border-teal-200 hover:bg-teal-50"
                    >
                      <Mic className="w-4 h-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleStopTranscription}
                      className="flex items-center gap-2 border-red-200 hover:bg-red-50 text-red-700"
                    >
                      <MicOff className="w-4 h-4" />
                      Stop Recording
                    </Button>
                  )}
                </div>
              </div>

              {isStartingTranscription && (
                <div className="flex items-center gap-2 text-xs text-teal-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Connecting and starting transcription...</span>
                </div>
              )}

              {isTranscribing && !isStartingTranscription && (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Recording... Speak clearly into your microphone</span>
                </div>
              )}

              {transcriptionError && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  ⚠️ {transcriptionError}
                </div>
              )}

              <Textarea
                id="transcription"
                placeholder="Type patient's spoken words here or use the microphone button to record..."
                value={visitData.transcription}
                onChange={(e) => setVisitData({ ...visitData, transcription: e.target.value })}
                className="min-h-[180px] font-mono text-sm"
              />

              <p className="text-xs text-teal-600">
                ✓ Real-time transcription with speaker detection and timestamps
              </p>
              <p className="text-xs text-slate-500">
                AI will analyze with OpenAI GPT-4 and Ollama Llama (if running)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="physician_notes" className="text-sm font-medium text-teal-900">Clinical Notes</Label>
              <Textarea
                id="physician_notes"
                placeholder="Additional observations..."
                value={visitData.physician_notes}
                onChange={(e) => setVisitData({ ...visitData, physician_notes: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("Dashboard"))}
              >
                Cancel
              </Button>
              <Button
                onClick={analyzeTranscription}
                disabled={!selectedPatientId || !visitData.transcription || isAnalyzing}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze & Save Visit"
                )}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="text-xs text-slate-600 bg-slate-50 rounded p-3 space-y-1">
                <div>OpenAI: {analysisProgress.openai}</div>
                <div>Ollama: {analysisProgress.ollama}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={newPatient.first_name}
                  onChange={(e) => setNewPatient({ ...newPatient, first_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={newPatient.last_name}
                  onChange={(e) => setNewPatient({ ...newPatient, last_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={newPatient.date_of_birth}
                  onChange={(e) => setNewPatient({ ...newPatient, date_of_birth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Input
                  value={newPatient.gender}
                  onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Medical Record Number</Label>
                <Input
                  value={newPatient.medical_record_number}
                  onChange={(e) => setNewPatient({ ...newPatient, medical_record_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Primary Diagnosis</Label>
                <Input
                  value={newPatient.primary_diagnosis}
                  onChange={(e) => setNewPatient({ ...newPatient, primary_diagnosis: e.target.value })}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Notes</Label>
                <Textarea
                  value={newPatient.notes}
                  onChange={(e) => setNewPatient({ ...newPatient, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowNewPatientDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePatient} disabled={createPatientMutation.isPending}>
                {createPatientMutation.isPending ? "Creating..." : "Create Patient"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}