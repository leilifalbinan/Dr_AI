const STORAGE_KEYS = {
  PATIENTS: 'smart_exam_room_patients',
  VISITS: 'smart_exam_room_visits'
};

// Load data from localStorage
const loadFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading ${key}:`, error);
    return [];
  }
};

// Save data to localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
  }
};

// Initialize data
let patients = loadFromStorage(STORAGE_KEYS.PATIENTS);
let visits = loadFromStorage(STORAGE_KEYS.VISITS);

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to sort array
const sortArray = (array, sortField) => {
  if (!sortField) return array;
  
  const descending = sortField.startsWith('-');
  const field = descending ? sortField.slice(1) : sortField;
  
  return [...array].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (descending) {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
};

export const api = {
  entities: {
    Patient: {
      list: async (sortOrder = '-created_date') => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return sortArray(patients, sortOrder);
      },
      
      filter: async (criteria) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return patients.filter(patient => {
          return Object.entries(criteria).every(([key, value]) => {
            return patient[key] === value;
          });
        });
      },
      
      create: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const newPatient = {
          ...data,
          id: generateId(),
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString()
        };
        patients.push(newPatient);
        saveToStorage(STORAGE_KEYS.PATIENTS, patients);
        return newPatient;
      },
      
      update: async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const index = patients.findIndex(p => p.id === id);
        if (index !== -1) {
          patients[index] = {
            ...patients[index],
            ...data,
            updated_date: new Date().toISOString()
          };
          saveToStorage(STORAGE_KEYS.PATIENTS, patients);
          return patients[index];
        }
        throw new Error('Patient not found');
      },
      
      delete: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        patients = patients.filter(p => p.id !== id);
        saveToStorage(STORAGE_KEYS.PATIENTS, patients);
        return { success: true };
      }
    },
    
    Visit: {
      list: async (sortOrder = '-visit_date', limit) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        let sorted = sortArray(visits, sortOrder);
        if (limit) {
          sorted = sorted.slice(0, limit);
        }
        return sorted;
      },
      
      filter: async (criteria, sortOrder) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        let filtered = visits.filter(visit => {
          return Object.entries(criteria).every(([key, value]) => {
            return visit[key] === value;
          });
        });
        if (sortOrder) {
          filtered = sortArray(filtered, sortOrder);
        }
        return filtered;
      },
      
      create: async (data) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const newVisit = {
          ...data,
          id: generateId(),
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString()
        };
        visits.push(newVisit);
        saveToStorage(STORAGE_KEYS.VISITS, visits);
        return newVisit;
      },
      
      update: async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const index = visits.findIndex(v => v.id === id);
        if (index !== -1) {
          visits[index] = {
            ...visits[index],
            ...data,
            updated_date: new Date().toISOString()
          };
          saveToStorage(STORAGE_KEYS.VISITS, visits);
          return visits[index];
        }
        throw new Error('Visit not found');
      },
      
      delete: async (id) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        visits = visits.filter(v => v.id !== id);
        saveToStorage(STORAGE_KEYS.VISITS, visits);
        return { success: true };
      }
    }
  },
  
  // clear all data
  clearAllData: () => {
    patients = [];
    visits = [];
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.VISITS);
  }
};

// Initialize with demo data if empty
const initializeDemoData = () => {
  if (patients.length === 0) {
    const demoPatient = {
      id: 'patient-demo-1',
      first_name: 'Michael',
      last_name: 'Reyes',
      date_of_birth: '1962-09-21',
      gender: 'male',
      medical_record_number: 'MRN-CC-2048',
      primary_diagnosis: 'Suspected Parkinson disease',
      created_date: '2025-01-15T10:00:00Z',
      updated_date: '2025-01-15T10:00:00Z'
    };
    patients.push(demoPatient);
    saveToStorage(STORAGE_KEYS.PATIENTS, patients);
  }
  
  if (visits.length === 0) {
    const demoVisit = {
      id: 'visit-demo-1',
      patient_id: 'patient-demo-1',
      visit_number: 1,
      visit_date: '2026-03-28',
      chief_complaint: 'Progressive resting tremor, gait slowing, and stiffness',
      bp_systolic: 132,
      bp_diastolic: 78,
      heart_rate: 74,
      respiratory_rate: 16,
      temperature: 98.4,
      temperature_unit: 'fahrenheit',
      spo2: 98,
      height: 170,
      weight: 70,
      bmi: 24.2,
      transcription: 'For about a year I have had a resting tremor in my right hand that is getting more noticeable. I am slower when walking, turning is difficult, and my family says I shuffle. I feel stiff, especially in the morning, and my handwriting has become smaller. My voice is softer and I feel more fatigued with daily tasks.',
      physician_notes: '',
      keyword_analysis: {
        total_words: 66,
        diagnostic_keywords: {
          tremor: 4,
          slow: 3,
          walking: 3,
          shuffle: 2,
          stiffness: 2,
          balance: 2,
          handwriting: 1,
          voice: 1,
          fatigue: 2
        },
        keyword_percentage: 28.7,
        top_keywords: [
          { word: 'tremor', count: 4, category: 'NEUROLOGIC' },
          { word: 'slow walking', count: 3, category: 'MOTOR' },
          { word: 'stiffness', count: 2, category: 'MOTOR' },
          { word: 'fatigue', count: 2, category: 'CONSTITUTIONAL' }
        ]
      },
      sentiment_analysis: {
        overall_sentiment: 'negative',
        sentiment_score: -0.34,
        distress_level: 'medium',
        emotional_indicators: ['frustration', 'worry', 'fatigue', 'slowness']
      },
      semantic_analysis: {
        key_themes: ['resting tremor', 'bradykinesia', 'gait instability', 'rigidity', 'fine motor decline'],
        symptom_severity: 'moderate',
        functional_impact: 'moderate',
        temporal_patterns: 'progressive'
      },
      ai_assessment: {
        suggested_diagnoses: [
          'Idiopathic Parkinson disease (early to moderate stage)',
          'Parkinsonian syndrome requiring medication-response clarification',
          'Essential tremor with gait dysfunction (less likely)'
        ],
        recommended_tests: [
          'Comprehensive neurologic exam with UPDRS scoring',
          'MRI brain',
          'DaTscan if diagnosis uncertain',
          'CBC, CMP, TSH, vitamin B12',
          'Formal physical therapy gait and balance assessment'
        ],
        treatment_suggestions: [
          'Trial dopaminergic therapy (e.g., carbidopa-levodopa) as clinically appropriate',
          'Physical and occupational therapy for gait and ADL support',
          'Structured exercise and balance program',
          'Fall-risk mitigation and home safety planning'
        ],
        patient_education: [
          'Track tremor, gait speed, and freezing episodes daily',
          'Maintain hydration, regular sleep, and consistent exercise',
          'Use assistive devices and remove home fall hazards',
          'Seek urgent care for sudden neurologic decline or repeated falls'
        ],
        follow_up_recommendations: 'Neurology follow-up in 2-4 weeks to review progression and treatment response.'
      },
      created_date: '2026-03-28T14:30:00Z',
      updated_date: '2026-03-28T14:30:00Z'
    };
    visits.push(demoVisit);
    saveToStorage(STORAGE_KEYS.VISITS, visits);
  }
};

initializeDemoData();