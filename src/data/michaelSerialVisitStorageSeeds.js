/**
 * Full Visit-shaped rows for Michael Reyes (patient-demo-1) aligned with
 * `demoSerialVisitSnapshots` in reportSerialTrendDemoData.js — same ids and timeline.
 */
import { demoSerialVisitSnapshots } from "@/data/reportSerialTrendDemoData";

const TRANSCRIPTIONS = [
  `[00:00] Doctor: Good morning, Michael. Tell me what changes you have noticed since your last routine checkup.
[00:12] Patient: Over the last few months I noticed a slight shake in my right hand when it rests in my lap, especially in the evening.
[00:26] Doctor: Does the tremor happen while you are using the hand, or mainly at rest?
[00:35] Patient: Mostly at rest. If I pick something up it calms down a little, but when I sit still it comes back.
[00:49] Doctor: How is your walking and daily activity overall?
[00:57] Patient: I can still do my neighborhood walk, but my pace is slower and I feel like my first few steps are stiff.
[01:12] Doctor: Any falls, near falls, or trouble turning around corners?
[01:20] Patient: No falls and no near misses yet, just a little cautious when I pivot in tight spaces.
[01:33] Doctor: How are sleep, mood, and energy through the day?
[01:41] Patient: Sleep is fair, mood is okay, and I still do chores, but I get tired sooner than I used to.
[01:56] Doctor: Are you taking any medication specifically for tremor or Parkinson symptoms?
[02:04] Patient: Not yet. I wanted to discuss options after getting a clearer diagnosis.
[02:18] Doctor: That makes sense. We will document this as an early, mild presentation and track progression closely.`,
  `[00:00] Doctor: Michael, at this follow-up, what symptoms are most disruptive right now?
[00:10] Patient: The tremor is definitely more obvious and my legs feel tight in the mornings for about an hour.
[00:24] Doctor: Has your gait changed compared with the last visit?
[00:31] Patient: Yes, I take smaller steps and turning feels clumsy, like I need extra steps to line myself up.
[00:46] Doctor: Any feedback from family members about movement differences?
[00:53] Patient: My wife says I do not swing my right arm much anymore and I look stiffer when I walk.
[01:07] Doctor: Are you still driving and handling errands safely?
[01:14] Patient: I still drive short trips in daylight and avoid heavy traffic because I feel slower reacting.
[01:28] Doctor: How does fatigue affect your afternoons?
[01:35] Patient: By late afternoon I feel drained, so tasks like grocery shopping take longer and I need breaks.
[01:49] Doctor: Any falls, freezing episodes, or balance scares?
[01:56] Patient: No full falls, but I had two moments where I felt unsteady stepping off a curb.
[02:11] Doctor: We should escalate objective motor tracking and discuss early therapy support to preserve function.
[02:23] Patient: I agree. I want to stay independent and keep moving as safely as I can.`,
  `[00:00] Doctor: Thanks for coming in, Michael. Give me a full update since the last appointment.
[00:12] Patient: The resting tremor in my right hand is much stronger now and people notice it when I am sitting.
[00:26] Doctor: What about transitions like standing up or turning?
[00:34] Patient: Getting out of a chair is slower, and when I turn it takes several small steps instead of one smooth turn.
[00:49] Doctor: Have you noticed any handwriting or voice changes?
[00:56] Patient: Yes, my handwriting is smaller and cramped, and my family says my voice sounds quieter by evening.
[01:11] Doctor: How has this affected your home routine and confidence?
[01:18] Patient: Routine chores wipe me out, and I am worried about balance even though I have not fallen yet.
[01:33] Doctor: Any specific near-fall moments?
[01:39] Patient: A few stumbles in the kitchen when I turned quickly, but I caught myself each time.
[01:52] Doctor: Are symptoms fluctuating during the day or mostly constant?
[01:59] Patient: Mornings are stiff, midday is a little better, and evenings are when tremor and fatigue peak.
[02:14] Doctor: This pattern supports progression to moderate motor impact, so we need structured treatment planning.
[02:26] Patient: I am ready to start whatever helps with mobility and lowers my risk of falling.`,
  `[00:00] Doctor: Michael, I saw your neurology note. How have you felt since adjusting medication timing?
[00:13] Patient: I feel a little steadier on flat ground, especially mid-morning, but the tremor is still present.
[00:27] Doctor: Is stiffness improved, unchanged, or worse?
[00:34] Patient: Mostly unchanged, especially in my hips and right leg when I first get moving.
[00:46] Doctor: Any gait safety events since we last met?
[00:52] Patient: I had one near-trip at a curb last week, but I caught myself on a railing.
[01:05] Doctor: Did you notice freezing, rushing, or distraction at that moment?
[01:13] Patient: I was turning and carrying a bag, and my feet felt briefly stuck before I regained balance.
[01:27] Doctor: How are energy and daily function with the current regimen?
[01:34] Patient: Energy is slightly better than before, but longer chores still leave me fatigued.
[01:47] Doctor: Are you comfortable with physical therapy and home safety modifications now?
[01:55] Patient: Yes, I want exercises for turning and balance, and clear warning signs for when to call sooner.
[02:09] Doctor: Great. We will continue medication optimization, start PT-focused gait work, and reinforce fall prevention.
[02:21] Patient: That plan feels practical. I want to stay active without pushing past safe limits.`,
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
