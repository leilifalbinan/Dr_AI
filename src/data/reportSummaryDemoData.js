/** Aligns with seeded demo IDs in apiClient (`ensureDemoSeed`). */
export const DEMO_REPORT_VISIT_ID = "visit-demo-1";
export const DEMO_REPORT_PATIENT_ID = "patient-demo-1";
export const DEMO_REPORT_VISIT_ID_2 = "visit-demo-2";
export const DEMO_REPORT_PATIENT_ID_2 = "patient-demo-2";

/** Vital signs + visit context (same shape as New Visit / persisted visit fields). */
export const demoVisitSnapshot = {
  visit_date: "2026-03-28",
  chief_complaint: "Progressive resting tremor, gait slowing, and stiffness",
  bp_systolic: 132,
  bp_diastolic: 78,
  heart_rate: 74,
  respiratory_rate: 16,
  temperature: 98.4,
  temperature_unit: "fahrenheit",
  spo2: 98,
  height: 170,
  weight: 70,
  bmi: 24.2,
};

/** Demo AI assessment for the report tab (matches VisitDetails-style sections). */
export const demoAiAssessment = {
  suggested_diagnoses: [
    "Idiopathic Parkinson disease (early to moderate stage)",
    "Parkinsonian syndrome (needs medication-response confirmation)",
    "Essential tremor with gait dysfunction (less likely)",
  ],
  recommended_tests: [
    "Comprehensive neurologic exam with UPDRS scoring",
    "MRI brain to exclude structural causes",
    "DaTscan (if diagnosis remains uncertain)",
    "CBC, CMP, TSH, vitamin B12",
    "Formal physical therapy gait and balance assessment",
  ],
  treatment_suggestions: [
    "Initiate dopaminergic therapy trial (e.g., carbidopa-levodopa) if clinically appropriate",
    "Physical and occupational therapy for gait, balance, and ADLs",
    "Structured exercise program focused on mobility and strength",
    "Fall-risk mitigation and home safety planning",
  ],
  patient_education: [
    "Track tremor severity, slowness, and gait changes daily",
    "Use assistive devices and remove home fall hazards",
    "Maintain regular exercise, hydration, and sleep schedule",
    "Seek urgent care for sudden falls, confusion, or rapid neurologic worsening",
  ],
  follow_up_recommendations:
    "Neurology follow-up in 2-4 weeks to review treatment response and adjust care plan.",
};

/** Sample transcription + NLP when a visit has no saved NLP fields (Report Summary tab). */
export const demoTranscriptionNlp = {
  transcription:
    "Patient: For about a year my right hand shakes at rest and it's getting worse. I'm slower walking and turning is hard; my wife says I shuffle. I'm stiff in the morning, my writing is smaller, my voice is softer, and I'm more tired with daily tasks.\n\nClinician: Any falls, hallucinations, or medication changes?\n\nPatient: No falls yet. Sleep is okay. I'm on no Parkinson meds yet.",
  speaker_segments: [
    { speaker: 0, text: "Resting tremor, gait slowing, stiffness, micrographia, hypophonia." },
    { speaker: 1, text: "Screening questions for red flags." },
  ],
  keyword_analysis: {
    total_words: 86,
    diagnostic_keywords: { tremor: 4, stiff: 3, slow: 3, walking: 2, balance: 2 },
    keyword_percentage: 14,
    top_keywords: [
      { count: 4, word: "tremor", category: "motor" },
      { count: 3, word: "stiff", category: "motor" },
      { count: 3, word: "slow", category: "motor" },
      { count: 2, word: "walking", category: "gait" },
      { count: 2, word: "writing", category: "fine motor" },
    ],
    inter_word_frequency: {
      "tremor, stiff": 2,
      "slow, walking": 2,
      "stiff, morning": 1,
    },
  },
  sentiment_analysis: {
    overall_sentiment: "negative",
    sentiment_score: -0.28,
    distress_level: "medium",
    emotional_indicators: ["concern", "fatigue", "functional decline"],
  },
  semantic_analysis: {
    key_themes: ["resting tremor", "bradykinesia", "postural instability", "non-motor symptoms"],
    symptom_severity: "moderate",
    functional_impact: "ADLs and mobility affected",
    temporal_patterns: "Progressive over ~12 months",
  },
  physician_notes: "Consider neurology referral, UPDRS-oriented exam, and discussion of levodopa trial when appropriate.",
};

/** Second demo patient (Sarah Martinez) — fibromyalgia / widespread pain theme. */
export const demoVisitSnapshot2 = {
  visit_date: "2025-10-29",
  chief_complaint: "Pain all over entire body",
  bp_systolic: 118,
  bp_diastolic: 76,
  heart_rate: 82,
  respiratory_rate: 18,
  temperature: 98.1,
  temperature_unit: "fahrenheit",
  spo2: 97,
  height: 165,
  weight: 68,
  bmi: 25.0,
};

export const demoAiAssessment2 = {
  suggested_diagnoses: [
    "Fibromyalgia syndrome (ACR 2016 criteria — clinical correlation)",
    "Central sensitization / chronic widespread pain",
    "Hypothyroidism, autoimmune rheumatic disease (less likely without objective inflammation)",
  ],
  recommended_tests: [
    "CBC, CMP, TSH, vitamin D, inflammatory markers (ESR/CRP)",
    "Consider ANA / RF if exam suggests connective tissue disease",
    "Sleep study if prominent non-restorative sleep or suspected apnea",
    "Physical therapy assessment focusing on pacing and graded activity",
  ],
  treatment_suggestions: [
    "Patient education on pacing, sleep hygiene, and stress reduction",
    "Graded exercise / movement program with PT guidance",
    "Trial of FDA-approved fibromyalgia agents as appropriate (e.g., duloxetine, milnacipran, pregabalin)",
    "Cognitive behavioral therapy for pain coping when available",
  ],
  patient_education: [
    "Flares are common; track triggers (sleep, stress, overexertion)",
    "Gentle daily movement often helps more than prolonged bed rest",
    "Keep a brief symptom and activity diary for follow-up visits",
  ],
  follow_up_recommendations:
    "Primary care or rheumatology follow-up in 4–6 weeks to review response and adjust multimodal plan.",
};

export const demoTranscriptionNlp2 = {
  transcription:
    "Patient: The pain is everywhere — shoulders, back, hips, legs. It never fully goes away. I'm exhausted even after sleep, and I can't exercise like I used to without crashing the next day.\n\nClinician: Any joint swelling, fevers, or new weakness?\n\nPatient: No swelling that I can see. No fever. Sometimes my hands feel stiff in the morning for a little while.",
  speaker_segments: [
    { speaker: 0, text: "Widespread pain, fatigue, non-restorative sleep, post-exertional worsening." },
    { speaker: 1, text: "Inflammatory and neurologic red flags screening." },
  ],
  keyword_analysis: {
    total_words: 92,
    diagnostic_keywords: { pain: 9, sleep: 4, fatigue: 6, body: 3, widespread: 2, exercise: 2 },
    keyword_percentage: 19,
    top_keywords: [
      { count: 9, word: "pain", category: "PAIN" },
      { count: 6, word: "fatigue", category: "CONSTITUTIONAL" },
      { count: 4, word: "sleep", category: "SLEEP" },
      { count: 3, word: "body", category: "GENERAL" },
      { count: 2, word: "widespread", category: "PAIN" },
    ],
    inter_word_frequency: {
      "pain, fatigue": 3,
      "sleep, pain": 2,
      "body, pain": 2,
    },
  },
  sentiment_analysis: {
    overall_sentiment: "negative",
    sentiment_score: -0.45,
    distress_level: "high",
    emotional_indicators: ["frustration", "hopelessness", "fatigue", "sleep disturbance"],
  },
  semantic_analysis: {
    key_themes: ["widespread pain", "central sensitization", "sleep dysfunction", "functional limitation"],
    symptom_severity: "moderate to severe",
    functional_impact: "high — work and exercise tolerance reduced",
    temporal_patterns: "Chronic with post-exertional flares",
  },
  physician_notes:
    "2016 fibromyalgia diagnostic criteria screening; multimodal plan; rule out alternative rheumatic and endocrine causes.",
};

/** Demo records for Report Summary (face / audio / gait JSONL-style rows). */
export const demoFace = [
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 0, t_end: 5, features: { emotion_counts: { happy: 3, angry: 1, neutral: 5, sad: 1, surprise: 2 } }, confidence: 0.91, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 5, t_end: 10, features: { emotion_counts: { happy: 4, angry: 2, neutral: 6, sad: 1, surprise: 3 } }, confidence: 0.88, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 10, t_end: 15, features: { emotion_counts: { happy: 2, angry: 1, neutral: 8, sad: 4, surprise: 4 } }, confidence: 0.86, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 15, t_end: 20, features: { emotion_counts: { happy: 1, angry: 3, neutral: 10, sad: 5, surprise: 3 } }, confidence: 0.84, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 20, t_end: 25, features: { emotion_counts: { happy: 5, angry: 0, neutral: 7, sad: 2, surprise: 4 } }, confidence: 0.9, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 25, t_end: 30, features: { emotion_counts: { happy: 2, angry: 1, neutral: 9, sad: 3, surprise: 5 } }, confidence: 0.87, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 30, t_end: 35, features: { emotion_counts: { happy: 6, angry: 0, neutral: 5, sad: 1, surprise: 6 } }, confidence: 0.92, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 35, t_end: 40, features: { emotion_counts: { happy: 1, angry: 4, neutral: 11, sad: 6, surprise: 2 } }, confidence: 0.82, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "event", t: 23.4, features: { event: "face_occluded" }, confidence: 0.74, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "summary", t_start: 0, t_end: 60, features: { total_samples: 208, emotion_counts: { angry: 17, happy: 34, neutral: 98, sad: 37, surprise: 22 }, emotion_pct: { angry: 8.17, happy: 16.35, neutral: 47.12, sad: 17.79, surprise: 10.58 } }, confidence: 1, valid: true, schema_version: "v0.1", model_version: "resnet34_5class_v3" },
];

export const demoAudio = [
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "audio", phase: "encounter", type: "window", t_start: 0, t_end: 10, features: { word_count: 35, top_words: [["tremor", 3], ["right", 2], ["hand", 2], ["rest", 2]], diagnostic_terms: { matches: [["tremor", 3], ["rest", 2]], diagnostic_term_pct: 0.143 }, sentiment: { polarity: -0.22 }, topics: [["movement_symptoms", 0.64], ["motor_pattern", 0.26], ["general", 0.1]] }, confidence: 0.86, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "audio", phase: "encounter", type: "window", t_start: 10, t_end: 20, features: { word_count: 42, top_words: [["stiff", 3], ["slow", 3], ["walking", 2], ["steps", 2]], diagnostic_terms: { matches: [["stiff", 3], ["slow", 3], ["walking", 2]], diagnostic_term_pct: 0.19 }, sentiment: { polarity: -0.34 }, topics: [["bradykinesia", 0.55], ["gait_change", 0.31], ["general", 0.14]] }, confidence: 0.84, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "audio", phase: "encounter", type: "window", t_start: 20, t_end: 30, features: { word_count: 39, top_words: [["balance", 2], ["turning", 2], ["shuffle", 2], ["freeze", 1]], diagnostic_terms: { matches: [["balance", 2], ["shuffle", 2], ["freeze", 1]], diagnostic_term_pct: 0.128 }, sentiment: { polarity: -0.29 }, topics: [["postural_instability", 0.58], ["gait_change", 0.27], ["general", 0.15]] }, confidence: 0.82, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "audio", phase: "encounter", type: "window", t_start: 30, t_end: 40, features: { word_count: 41, top_words: [["voice", 2], ["soft", 2], ["writing", 2], ["small", 1]], diagnostic_terms: { matches: [["voice", 2], ["writing", 2]], diagnostic_term_pct: 0.122 }, sentiment: { polarity: -0.25 }, topics: [["speech_change", 0.45], ["fine_motor", 0.38], ["general", 0.17]] }, confidence: 0.83, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "audio", phase: "encounter", type: "window", t_start: 40, t_end: 50, features: { word_count: 40, top_words: [["sleep", 2], ["dream", 2], ["acting", 1], ["night", 1]], diagnostic_terms: { matches: [["sleep", 2], ["dream", 2]], diagnostic_term_pct: 0.1 }, sentiment: { polarity: -0.19 }, topics: [["non_motor_symptoms", 0.57], ["sleep_disturbance", 0.29], ["general", 0.14]] }, confidence: 0.81, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "audio", phase: "encounter", type: "window", t_start: 50, t_end: 60, features: { word_count: 43, top_words: [["fatigue", 3], ["slower", 2], ["daily", 1], ["tasks", 1]], diagnostic_terms: { matches: [["fatigue", 3], ["slower", 2]], diagnostic_term_pct: 0.116 }, sentiment: { polarity: -0.27 }, topics: [["functional_decline", 0.61], ["activities_daily_living", 0.25], ["general", 0.14]] }, confidence: 0.8, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "audio", phase: "encounter", type: "window", t_start: 60, t_end: 70, features: { word_count: 46, top_words: [["medication", 2], ["timing", 2], ["benefit", 1], ["wearing", 1]], diagnostic_terms: { matches: [["medication", 2], ["benefit", 1]], diagnostic_term_pct: 0.089 }, sentiment: { polarity: -0.16 }, topics: [["treatment_response", 0.49], ["care_planning", 0.33], ["general", 0.18]] }, confidence: 0.79, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "audio", phase: "encounter", type: "window", t_start: 70, t_end: 80, features: { word_count: 44, top_words: [["neurology", 2], ["therapy", 2], ["followup", 2], ["exercise", 1]], diagnostic_terms: { matches: [["neurology", 2], ["therapy", 2], ["exercise", 1]], diagnostic_term_pct: 0.114 }, sentiment: { polarity: -0.12 }, topics: [["diagnostic_planning", 0.52], ["rehab_plan", 0.31], ["general", 0.17]] }, confidence: 0.83, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "audio", phase: "encounter", type: "summary", t_start: 0, t_end: 80, features: { word_count: 330, top_words: [["tremor", 12], ["slow", 9], ["stiff", 8], ["walking", 7], ["balance", 6], ["fatigue", 5]], diagnostic_terms: { matches: [["tremor", 12], ["slow", 9], ["stiff", 8], ["walking", 7]], diagnostic_term_pct: 0.109 }, sentiment: { polarity: -0.23 }, topics: [["movement_symptoms", 0.34], ["gait_change", 0.24], ["functional_decline", 0.22], ["non_motor_symptoms", 0.2]] }, confidence: 0.85, valid: true, schema_version: "v0.1" },
];

export const demoGait = [
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 0, t_end: 1, features: { speed_mps: 0.72, symmetry: 0.76, stability: 0.68 }, confidence: 0.78, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 1, t_end: 2, features: { speed_mps: 0.78, symmetry: 0.79, stability: 0.71 }, confidence: 0.79, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 2, t_end: 3, features: { speed_mps: 0.83, symmetry: 0.82, stability: 0.73 }, confidence: 0.81, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 3, t_end: 4, features: { speed_mps: 0.88, symmetry: 0.84, stability: 0.75 }, confidence: 0.82, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 4, t_end: 5, features: { speed_mps: 0.91, symmetry: 0.86, stability: 0.76 }, confidence: 0.83, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 5, t_end: 6, features: { speed_mps: 0.92, symmetry: 0.87, stability: 0.74 }, confidence: 0.78, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 6, t_end: 7, features: { speed_mps: 0.89, symmetry: 0.85, stability: 0.72 }, confidence: 0.77, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 7, t_end: 8, features: { speed_mps: 0.87, symmetry: 0.83, stability: 0.7 }, confidence: 0.76, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 8, t_end: 9, features: { speed_mps: 0.85, symmetry: 0.82, stability: 0.71 }, confidence: 0.77, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 9, t_end: 10, features: { speed_mps: 0.88, symmetry: 0.84, stability: 0.73 }, confidence: 0.79, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 10, t_end: 11, features: { speed_mps: 0.9, symmetry: 0.86, stability: 0.75 }, confidence: 0.8, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "window", t_start: 11, t_end: 12, features: { speed_mps: 0.91, symmetry: 0.87, stability: 0.76 }, confidence: 0.81, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "event", t: 4.1, features: { event: "cadence_drop" }, confidence: 0.81, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "event", t: 9.7, features: { event: "near_stumble" }, confidence: 0.76, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "event", t: 18.2, features: { event: "walk_end" }, confidence: 0.92, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "gait", phase: "entry", type: "summary", t_start: 0, t_end: 18.2, features: { avg_speed_mps: 0.86, avg_symmetry: 0.84, avg_stability: 0.73 }, confidence: 0.8, valid: true, schema_version: "v0.1", notes: "Below normal walking speed; mild asymmetry detected" },
];

function cloneSubsystemForVisit(rows, visitId, patientId) {
  return rows.map((r) => ({ ...r, visit_id: visitId, patient_id: patientId }));
}

const demoFaceVisit2 = cloneSubsystemForVisit(demoFace, DEMO_REPORT_VISIT_ID_2, DEMO_REPORT_PATIENT_ID_2);
const demoAudioVisit2 = cloneSubsystemForVisit(demoAudio, DEMO_REPORT_VISIT_ID_2, DEMO_REPORT_PATIENT_ID_2);
const demoGaitVisit2 = cloneSubsystemForVisit(demoGait, DEMO_REPORT_VISIT_ID_2, DEMO_REPORT_PATIENT_ID_2);

const REPORT_PACKAGE_DEFAULT = {
  face: demoFace,
  audio: demoAudio,
  gait: demoGait,
  aiAssessment: demoAiAssessment,
  transcriptionNlp: demoTranscriptionNlp,
  visitSnapshot: demoVisitSnapshot,
};

const REPORT_PACKAGE_VISIT_2 = {
  face: demoFaceVisit2,
  audio: demoAudioVisit2,
  gait: demoGaitVisit2,
  aiAssessment: demoAiAssessment2,
  transcriptionNlp: demoTranscriptionNlp2,
  visitSnapshot: demoVisitSnapshot2,
};

/**
 * Multimodal rows + NLP/AI fallbacks for Report Summary, keyed by persisted visit id.
 * Unknown ids fall back to demo visit 1 (Michael Reyes).
 */
export function getReportDemoPackage(visitId) {
  if (visitId === DEMO_REPORT_VISIT_ID_2) {
    return REPORT_PACKAGE_VISIT_2;
  }
  return REPORT_PACKAGE_DEFAULT;
}
