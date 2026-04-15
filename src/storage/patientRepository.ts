import { isDatabaseReady, getDatabase } from './database';

export type Patient = {
  id?: number;
  patient_code: string;
  name?: string;
  age_group: string;
  sex: string;
  village?: string;
  created_at: string;
};

export type Encounter = {
  id?: number;
  patient_code: string;
  complaint: string;
  session_notes?: string;
  action_taken?: string;
  was_referred: boolean;
  referral_reason?: string;
  follow_up_date?: string;
  created_at: string;
};

export type EncounterRow = {
  id: number;
  patient_code: string;
  patient_name: string | null;
  complaint: string;
  was_referred: number;
  created_at: string;
  action_taken: string | null;
  session_notes: string | null;
  referral_reason: string | null;
  follow_up_date: string | null;
};

export type SessionMessage = {
  id?: number;
  encounter_id: number;
  role: 'murapi' | 'vhw';
  message: string;
  created_at: string;
};

export const generatePatientCode = (sex: string): string => {
  const number = Math.floor(1000 + Math.random() * 9000);
  const prefix = sex === 'female' ? 'MRS' : 'MR';
  return `${prefix}-${number}`;
};

// Create a new patient
export const createPatient = (
  patient: Omit<Patient, 'id'>
): Patient => {
  const db = getDatabase();
  if (!db || !isDatabaseReady()) {
    return patient;
  }

  const result = db.runSync(
    `INSERT INTO patients 
     (patient_code, name, age_group, sex, village, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      patient.patient_code,
      patient.name ?? null,
      patient.age_group,
      patient.sex,
      patient.village ?? null,
      patient.created_at,
    ]
  );
  return { ...patient, id: result.lastInsertRowId };
};

// Get patient by code
export const getPatientByCode = (
  code: string
): Patient | null => {
  const db = getDatabase();
  if (!db || !isDatabaseReady()) {
    return null;
  }

  const result = db.getFirstSync<Patient>(
    'SELECT * FROM patients WHERE patient_code = ?',
    [code]
  );
  return result ?? null;
};

// Get all patients
export const getAllPatients = (): Patient[] => {
  const db = getDatabase();
  if (!db || !isDatabaseReady()) {
    return [];
  }

  return db.getAllSync<Patient>(
    'SELECT * FROM patients ORDER BY created_at DESC'
  );
};

// Search patients by name or code
export const searchPatients = (query: string): Patient[] => {
  const db = getDatabase();
  if (!db || !isDatabaseReady()) {
    return [];
  }

  return db.getAllSync<Patient>(
    `SELECT * FROM patients 
     WHERE name LIKE ? OR patient_code LIKE ?
     ORDER BY created_at DESC`,
    [`%${query}%`, `%${query}%`]
  );
};

// Save a new encounter
export const createEncounter = (
  encounter: Omit<Encounter, 'id'>
): number => {
  const db = getDatabase();
  if (!db || !isDatabaseReady()) {
    return 0;
  }

  const result = db.runSync(
    `INSERT INTO encounters
     (patient_code, complaint, session_notes, action_taken,
      was_referred, referral_reason, follow_up_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      encounter.patient_code,
      encounter.complaint,
      encounter.session_notes ?? null,
      encounter.action_taken ?? null,
      encounter.was_referred ? 1 : 0,
      encounter.referral_reason ?? null,
      encounter.follow_up_date ?? null,
      encounter.created_at,
    ]
  );
  return result.lastInsertRowId;
};

// Get all encounters for a patient
export const getPatientEncounters = (
  patientCode: string
): Encounter[] => {
  const db = getDatabase();
  if (!db || !isDatabaseReady()) {
    return [];
  }

  return db.getAllSync<Encounter>(
    `SELECT * FROM encounters 
     WHERE patient_code = ? 
     ORDER BY created_at DESC`,
    [patientCode]
  );
};

// Get all encounters
export const getAllEncounters = (): EncounterRow[] => {
  const db = getDatabase();
  if (!db || !isDatabaseReady()) {
    return [];
  }

  return db.getAllSync(
    `SELECT e.*, p.name as patient_name
     FROM encounters e
     LEFT JOIN patients p ON e.patient_code = p.patient_code
     ORDER BY e.created_at DESC`
  );
};

// Save all messages from a session
export const saveSessionMessages = (
  encounterId: number,
  messages: { role: 'murapi' | 'vhw'; message: string }[]
): void => {
  const db = getDatabase();
  if (!db || !isDatabaseReady() || encounterId === 0) {
    return;
  }

  const now = new Date().toISOString();
  messages.forEach((msg) => {
    db.runSync(
      `INSERT INTO session_messages
       (encounter_id, role, message, created_at)
       VALUES (?, ?, ?, ?)`,
      [encounterId, msg.role, msg.message, now]
    );
  });
};

// Get messages for an encounter
export const getEncounterMessages = (
  encounterId: number
): SessionMessage[] => {
  const db = getDatabase();
  if (!db || !isDatabaseReady()) {
    return [];
  }

  return db.getAllSync<SessionMessage>(
    `SELECT * FROM session_messages
     WHERE encounter_id = ?
     ORDER BY created_at ASC`,
    [encounterId]
  );
};

// Get today's encounter count
export const getTodayCount = (): number => {
  const db = getDatabase();
  if (!db || !isDatabaseReady()) {
    return 0;
  }

  const today = new Date().toISOString().split('T')[0];
  const result = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM encounters
     WHERE created_at LIKE ?`,
    [`${today}%`]
  );
  return result?.count ?? 0;
};

// Get total patients seen
export const getTotalPatients = (): number => {
  const db = getDatabase();
  if (!db || !isDatabaseReady()) {
    return 0;
  }

  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM patients'
  );
  return result?.count ?? 0;
};
