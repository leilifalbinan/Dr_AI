/** Aligns with local demo visit/patient IDs in apiClient when storage was seeded empty. */
export const DEMO_REPORT_VISIT_ID = "visit-demo-1";
export const DEMO_REPORT_PATIENT_ID = "patient-demo-1";

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

/** Demo records for Report Summary (face / audio / gait JSONL-style rows). */
export const demoFace = [
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 0, t_end: 5, features: { emotion_counts: { happy: 3, angry: 1, low_affect: 5, disgust: 1, arousal: 2 } }, confidence: 0.91, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 5, t_end: 10, features: { emotion_counts: { happy: 4, angry: 2, low_affect: 6, disgust: 1, arousal: 3 } }, confidence: 0.88, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 10, t_end: 15, features: { emotion_counts: { happy: 2, angry: 1, low_affect: 8, disgust: 4, arousal: 4 } }, confidence: 0.86, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 15, t_end: 20, features: { emotion_counts: { happy: 1, angry: 3, low_affect: 10, disgust: 5, arousal: 3 } }, confidence: 0.84, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 20, t_end: 25, features: { emotion_counts: { happy: 5, angry: 0, low_affect: 7, disgust: 2, arousal: 4 } }, confidence: 0.9, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 25, t_end: 30, features: { emotion_counts: { happy: 2, angry: 1, low_affect: 9, disgust: 3, arousal: 5 } }, confidence: 0.87, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 30, t_end: 35, features: { emotion_counts: { happy: 6, angry: 0, low_affect: 5, disgust: 1, arousal: 6 } }, confidence: 0.92, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "window", t_start: 35, t_end: 40, features: { emotion_counts: { happy: 1, angry: 4, low_affect: 11, disgust: 6, arousal: 2 } }, confidence: 0.82, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "event", t: 23.4, features: { event: "face_occluded" }, confidence: 0.74, valid: true, schema_version: "v0.1" },
  { visit_id: "visit-demo-1", patient_id: "patient-demo-1", subsystem: "face", phase: "encounter", type: "summary", t_start: 0, t_end: 60, features: { total_samples: 208, emotion_counts: { angry: 17, disgust: 37, happy: 34, low_affect: 98, arousal: 43 }, emotion_pct: { angry: 7.35, disgust: 16.02, happy: 14.72, low_affect: 42.42, arousal: 18.61 } }, confidence: 1, valid: true, schema_version: "v0.1", model_version: "resnet34_5class_v3" },
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
