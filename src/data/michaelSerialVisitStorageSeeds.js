/**
 * Full Visit-shaped rows for Michael Reyes (patient-demo-1) aligned with
 * `demoSerialVisitSnapshots` in reportSerialTrendDemoData.js — same ids and timeline.
 */
import { demoSerialVisitSnapshots } from "@/data/reportSerialTrendDemoData";

const TRANSCRIPTIONS = [
  `I've noticed a slight shake in my right hand when it's resting on my lap for the past few months. Walking feels a little slower than before but I can still do my usual walks. No falls. Sleep has been okay. I'm not on any Parkinson medications yet.`,
  `The tremor is more obvious now and my legs feel stiff, especially in the morning. Turning when I walk is harder and I have to take smaller steps. I'm more tired by the afternoon. Still driving short distances. Family says I'm not swinging my right arm as much when I walk.`,
  `The resting tremor in my right hand is much more noticeable. I'm slower getting up from a chair, turning takes several steps, and my wife says I shuffle. My handwriting has gotten smaller, my voice is softer, and I'm wiped out after routine housework. No falls yet but I'm nervous about balance.`,
  `I saw neurology since last time. We're adjusting medication timing. Tremor is still there but I'm a bit steadier on flat ground. Stiffness is ongoing. I had one near-trip on a curb but caught myself. I want to focus on staying active safely and knowing what to watch for.`,
];

const PHYSICIAN_NOTES = [
  "Baseline exam: mild asymmetric resting tremor, subtle bradykinesia. Discussed prognosis and follow-up plan.",
  "Progressive motor features; discussed escalation of care and objective motor scales.",
  "Clear parkinsonian syndrome picture; counseling on therapy options and fall risk.",
  "Post-initiation follow-up: review med timing, PT referral, safety counseling.",
];

function keywordFromSnapshot(_s, idx) {
  const counts = {
    tremor: 2 + idx,
    slow: 2 + Math.min(1, idx),
    stiff: 2,
    walking: 2,
    balance: 1 + idx,
    rigidity: 1 + Math.floor(idx / 2),
    bradykinesia: idx >= 2 ? 2 : 1,
    gait: idx >= 1 ? 2 : 1,
  };
  const totalWords = 55 + idx * 12;
  const kwPct = 22 + idx * 2.5;
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word, count]) => ({
      word,
      count,
      category: word === "tremor" || word === "bradykinesia" ? "NEUROLOGIC" : "MOTOR",
    }));
  return {
    total_words: totalWords,
    diagnostic_keywords: counts,
    keyword_percentage: Math.min(38, Math.round(kwPct * 10) / 10),
    top_keywords: top,
  };
}

function sentimentFromSnapshot(s) {
  const score = s.sentiment_score;
  return {
    overall_sentiment: score <= -0.3 ? "negative" : score >= 0.2 ? "positive" : "neutral",
    sentiment_score: score,
    distress_level: score <= -0.45 ? "high" : score <= -0.28 ? "medium" : "low",
    emotional_indicators:
      score <= -0.4
        ? ["worry", "fatigue", "frustration", "mobility concern"]
        : ["concern", "fatigue", "adjusting to symptoms"],
  };
}

function semanticFromSnapshot(s, idx) {
  return {
    key_themes: [
      "resting tremor",
      "bradykinesia",
      idx >= 2 ? "postural instability" : "gait change",
      "rigidity",
      idx >= 3 ? "treatment adjustment" : "functional impact",
    ],
    symptom_severity: idx <= 1 ? "mild to moderate" : "moderate",
    functional_impact: idx <= 1 ? "mild ADL impact" : "moderate ADL and mobility impact",
    temporal_patterns: "progressive over months",
  };
}

function fullAiAssessment(s) {
  const a = s.ai_assessment;
  return {
    suggested_diagnoses: a.suggested_diagnoses,
    recommended_tests: [
      "Comprehensive neurologic exam with motor scoring (e.g., UPDRS elements)",
      "MRI brain if atypical features or red flags",
      "CBC, CMP, TSH, B12 as clinically indicated",
      "Gait and balance assessment with PT",
    ],
    treatment_suggestions: [
      "Coordinate care with neurology for medication and device planning",
      "Physical therapy for gait, turns, and freezing strategies",
      "Occupational therapy for fine motor and ADL tasks",
      "Fall-risk mitigation and home safety review",
    ],
    patient_education: [
      "Track tremor, stiffness, walking speed, and freezing between visits",
      "Maintain exercise, sleep, and hydration; avoid abrupt medication changes without guidance",
      "Seek urgent care for sudden weakness, confusion, or repeated falls",
    ],
    follow_up_recommendations: a.follow_up_recommendations,
  };
}

export function buildMichaelSerialStorageVisits() {
  return demoSerialVisitSnapshots.map((s, idx) => ({
    id: s.visit_id,
    patient_id: "patient-demo-1",
    visit_number: s.visit_number,
    visit_date: s.visit_date,
    chief_complaint: s.chief_complaint,
    bp_systolic: s.bp_systolic,
    bp_diastolic: s.bp_diastolic,
    heart_rate: s.heart_rate,
    respiratory_rate: s.respiratory_rate,
    temperature: s.temperature,
    temperature_unit: s.temperature_unit || "fahrenheit",
    spo2: s.spo2,
    height: s.height,
    weight: s.weight,
    bmi: s.bmi,
    transcription: TRANSCRIPTIONS[idx],
    physician_notes: PHYSICIAN_NOTES[idx],
    keyword_analysis: keywordFromSnapshot(s, idx),
    sentiment_analysis: sentimentFromSnapshot(s),
    semantic_analysis: semanticFromSnapshot(s, idx),
    ai_assessment: fullAiAssessment(s),
    created_date: `${s.visit_date}T15:00:00.000Z`,
    updated_date: `${s.visit_date}T15:00:00.000Z`,
  }));
}
