import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, isDatabaseReady } from './database';

export type VHWProfile = {
  language: string;
  name: string;
  phone: string;
  district: string;
  province: string;
  healthCentre: string;
  supervisorName: string;
  vhwId: string;
  experience: string;
  pinHash: string;
  setupComplete: boolean;
  createdAt: string;
};

export type ProfileAccessState =
  | 'needs_onboarding'
  | 'needs_pin_setup'
  | 'ready_for_unlock';

type ProfileRow = {
  language: string | null;
  name: string | null;
  phone: string | null;
  district: string | null;
  province: string | null;
  health_centre: string | null;
  supervisor_name: string | null;
  vhw_id: string | null;
  experience: string | null;
  pin_hash: string | null;
  setup_complete: number | null;
  created_at: string | null;
};

type SaveProfileInput = Partial<Omit<VHWProfile, 'pinHash'>> & {
  pin?: string;
};

const PROFILE_KEY = 'murapi_vhw_profile';

const normalizeText = (value: string | null | undefined): string =>
  typeof value === 'string' ? value : '';

const hashPin = (pin: string): string => {
  let hash = 2166136261;

  for (let index = 0; index < pin.length; index += 1) {
    hash ^= pin.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `pin_${(hash >>> 0).toString(16)}`;
};

const mapRowToProfile = (row: ProfileRow | null): Partial<VHWProfile> | null => {
  if (!row) {
    return null;
  }

  return {
    language: normalizeText(row.language),
    name: normalizeText(row.name),
    phone: normalizeText(row.phone),
    district: normalizeText(row.district),
    province: normalizeText(row.province),
    healthCentre: normalizeText(row.health_centre),
    supervisorName: normalizeText(row.supervisor_name),
    vhwId: normalizeText(row.vhw_id),
    experience: normalizeText(row.experience),
    pinHash: normalizeText(row.pin_hash),
    setupComplete: row.setup_complete === 1,
    createdAt: normalizeText(row.created_at),
  };
};

const readLegacyProfile = async (): Promise<Partial<VHWProfile> | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error reading legacy profile:', error);
    return null;
  }
};

const clearLegacyProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing legacy profile:', error);
  }
};

const getProfileFromDatabase = (): Partial<VHWProfile> | null => {
  const db = getDatabase();

  if (!db || !isDatabaseReady()) {
    return null;
  }

  const row = db.getFirstSync<ProfileRow>(
    `SELECT
      language,
      name,
      phone,
      district,
      province,
      health_centre,
      supervisor_name,
      vhw_id,
      experience,
      pin_hash,
      setup_complete,
      created_at
     FROM vhw_profile
     WHERE id = 1`
  );

  return mapRowToProfile(row ?? null);
};

const upsertProfile = (profile: Partial<VHWProfile>): void => {
  const db = getDatabase();

  if (!db || !isDatabaseReady()) {
    return;
  }

  db.runSync(
    `INSERT OR REPLACE INTO vhw_profile (
      id,
      language,
      name,
      phone,
      district,
      province,
      health_centre,
      supervisor_name,
      vhw_id,
      experience,
      pin_hash,
      setup_complete,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      profile.language ?? null,
      profile.name ?? null,
      profile.phone ?? null,
      profile.district ?? null,
      profile.province ?? null,
      profile.healthCentre ?? null,
      profile.supervisorName ?? null,
      profile.vhwId ?? null,
      profile.experience ?? null,
      profile.pinHash ?? null,
      profile.setupComplete ? 1 : 0,
      profile.createdAt ?? null,
    ]
  );
};

const migrateLegacyProfileIfNeeded = async (): Promise<Partial<VHWProfile> | null> => {
  const existing = getProfileFromDatabase();

  if (existing?.createdAt) {
    return existing;
  }

  const legacy = await readLegacyProfile();

  if (!legacy) {
    return existing;
  }

  upsertProfile(legacy);
  await clearLegacyProfile();

  return {
    ...existing,
    ...legacy,
  };
};

export const saveProfile = async (
  profile: SaveProfileInput
): Promise<void> => {
  try {
    const existing = (await migrateLegacyProfileIfNeeded()) ?? {};

    const merged: Partial<VHWProfile> = {
      ...existing,
      ...profile,
    };

    if (profile.pin) {
      merged.pinHash = hashPin(profile.pin);
    }

    upsertProfile(merged);
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

export const getProfile = async (): Promise<Partial<VHWProfile> | null> => {
  try {
    const profile = getProfileFromDatabase();

    if (profile) {
      return profile;
    }

    return await migrateLegacyProfileIfNeeded();
  } catch (error) {
    console.error('Error reading profile:', error);
    return null;
  }
};

export const verifyPin = async (pin: string): Promise<boolean> => {
  try {
    const profile = await getProfile();
    const storedHash = profile?.pinHash;

    if (!storedHash) {
      return false;
    }

    return storedHash === hashPin(pin);
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

export const isSetupComplete = async (): Promise<boolean> => {
  try {
    const profile = await getProfile();
    if (profile?.setupComplete !== true) {
      return false;
    }

    const requiredFields: Array<keyof VHWProfile> = [
      'language',
      'name',
      'phone',
      'district',
      'province',
      'healthCentre',
      'supervisorName',
      'experience',
      'pinHash',
      'createdAt',
    ];

    return requiredFields.every((field) => {
      const value = profile[field];
      if (typeof value === 'boolean') {
        return value === true;
      }

      return typeof value === 'string' && value.trim().length > 0;
    });
  } catch (error) {
    return false;
  }
};

export const getProfileAccessState = async (): Promise<ProfileAccessState> => {
  const profile = await getProfile();

  if (!profile) {
    return 'needs_onboarding';
  }

  const hasExistingProfileData = [
    profile.language,
    profile.name,
    profile.phone,
    profile.district,
    profile.province,
    profile.healthCentre,
    profile.supervisorName,
    profile.vhwId,
    profile.experience,
  ].some((value) => typeof value === 'string' && value.trim().length > 0);

  if (!hasExistingProfileData) {
    return 'needs_onboarding';
  }

  if (typeof profile.pinHash === 'string' && profile.pinHash.trim().length > 0) {
    return 'ready_for_unlock';
  }

  return 'needs_pin_setup';
};

export const clearProfile = async (): Promise<void> => {
  try {
    const db = getDatabase();

    if (db && isDatabaseReady()) {
      db.runSync('DELETE FROM vhw_profile WHERE id = 1');
    }

    await clearLegacyProfile();
  } catch (error) {
    console.error('Error clearing profile:', error);
  }
};
