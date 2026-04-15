import * as SQLite from 'expo-sqlite';

export type MurapiDatabase = SQLite.SQLiteDatabase;

let db: MurapiDatabase | null = null;
let initComplete = false;

export const getDatabase = (): MurapiDatabase | null => {
  if (db) return db;

  try {
    db = SQLite.openDatabaseSync('murapi.db');
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
    return null;
  }
};

export const initDatabase = (): boolean => {
  const database = getDatabase();

  if (!database) {
    return false;
  }

  if (initComplete) {
    return true;
  }

  try {
    database.execSync(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_code TEXT UNIQUE NOT NULL,
      name TEXT,
      age_group TEXT NOT NULL,
      sex TEXT NOT NULL,
      village TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS encounters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_code TEXT NOT NULL,
      complaint TEXT NOT NULL,
      session_notes TEXT,
      action_taken TEXT,
      was_referred INTEGER DEFAULT 0,
      referral_reason TEXT,
      follow_up_date TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (patient_code) REFERENCES patients (patient_code)
    );

    CREATE TABLE IF NOT EXISTS session_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      encounter_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (encounter_id) REFERENCES encounters (id)
    );
  `);

    initComplete = true;
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

export const isDatabaseReady = (): boolean => initDatabase();
