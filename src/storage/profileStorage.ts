import AsyncStorage from '@react-native-async-storage/async-storage';

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

  setupComplete: boolean;
  createdAt: string;
};

const PROFILE_KEY = 'murapi_vhw_profile';

export const saveProfile = async (
  profile: Partial<VHWProfile>
): Promise<void> => {
  try {
    const existing = await getProfile();

    const merged = {
      ...existing,
      ...profile,
    };

    const jsonValue = JSON.stringify(merged);
    await AsyncStorage.setItem(PROFILE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

export const getProfile = async (): Promise<Partial<VHWProfile> | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PROFILE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error reading profile:', error);
    return null;
  }
};

export const isSetupComplete = async (): Promise<boolean> => {
  try {
    const profile = await getProfile();
    return profile?.setupComplete === true;
  } catch (error) {
    return false;
  }
};

export const clearProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PROFILE_KEY);
  } catch (error) {
    console.error('Error clearing profile:', error);
  }
};