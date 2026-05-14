import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigatorContainer';
import {
  Patient,
  getAllPatients,
  searchPatients,
} from '../storage/patientRepository';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ClinicalPatient'>;
};

type IntakeMode = 'new' | 'existing';

const AGE_GROUPS = [
  { label: 'Under 2', value: 'under_2' },
  { label: '2 — 5', value: '2_5' },
  { label: '5 — 12', value: '5_12' },
  { label: '13 — 17', value: '13_17' },
  { label: '18 — 40', value: '18_40' },
  { label: '40 — 60', value: '40_60' },
  { label: 'Over 60', value: 'over_60' },
];

const SEX_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];

const COMPLAINTS = [
  { label: 'Fever', value: 'fever' },
  { label: 'Cough', value: 'cough' },
  { label: 'Diarrhoea', value: 'diarrhoea' },
  { label: 'Pregnancy', value: 'pregnancy' },
  { label: 'Chest pain', value: 'chest_pain' },
  { label: 'Headache', value: 'headache' },
  { label: 'Bleeding', value: 'bleeding' },
  { label: 'Breathing', value: 'breathing' },
  { label: 'Fits/Seizure', value: 'seizure' },
  { label: 'Not eating', value: 'not_eating' },
  { label: 'Unconscious', value: 'unconscious' },
  { label: 'Other', value: 'other' },
] as const;

const formatLabel = (value: string): string =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ClinicalPatientScreen({ navigation }: Props) {
  const [intakeMode, setIntakeMode] = useState<IntakeMode>('new');
  const [existingSearch, setExistingSearch] = useState('');
  const [existingPatients, setExistingPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [patientName, setPatientName] = useState('');
  const [village, setVillage] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [sex, setSex] = useState('');
  const [complaint, setComplaint] = useState('');
  const [otherComplaint, setOtherComplaint] = useState('');

  useEffect(() => {
    if (intakeMode !== 'existing') {
      return;
    }

    const query = existingSearch.trim();
    const nextPatients = query.length > 0 ? searchPatients(query) : getAllPatients().slice(0, 12);
    setExistingPatients(nextPatients);
  }, [existingSearch, intakeMode]);

  const isComplaintComplete =
    complaint.length > 0 && (complaint !== 'other' || otherComplaint.trim().length > 0);

  const isNewPatientComplete =
    patientName.trim().length > 0 &&
    ageGroup.length > 0 &&
    sex.length > 0 &&
    isComplaintComplete;

  const isExistingPatientComplete = selectedPatient !== null && isComplaintComplete;

  const handleSelectExistingPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientName(patient.name ?? '');
    setVillage(patient.village ?? '');
    setAgeGroup(patient.age_group);
    setSex(patient.sex);
  };

  const handleStart = () => {
    if (intakeMode === 'existing' && selectedPatient) {
      navigation.navigate('ClinicalSession', {
        patientCode: selectedPatient.patient_code,
        patientName: selectedPatient.name?.trim() || selectedPatient.patient_code,
        village: selectedPatient.village?.trim() || '',
        ageGroup: selectedPatient.age_group,
        sex: selectedPatient.sex,
        complaint: complaint === 'other' ? otherComplaint.trim() : complaint,
      });
      return;
    }

    navigation.navigate('ClinicalSession', {
      patientName: patientName.trim(),
      village: village.trim(),
      ageGroup,
      sex,
      complaint: complaint === 'other' ? otherComplaint.trim() : complaint,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient intake</Text>
        <Text style={styles.headerSub}>
          Start a session for a new patient or reopen care for an existing record
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.modeRow}>
          {(['new', 'existing'] as const).map((mode) => {
            const isSelected = intakeMode === mode;

            return (
              <TouchableOpacity
                key={mode}
                style={[styles.modeCard, isSelected && styles.modeCardSelected]}
                onPress={() => setIntakeMode(mode)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modeTitle, isSelected && styles.modeTitleSelected]}>
                  {mode === 'new' ? 'New patient' : 'Existing patient'}
                </Text>
                <Text style={styles.modeDescription}>
                  {mode === 'new'
                    ? 'Create a fresh patient record before the session starts.'
                    : 'Find a saved patient and attach this encounter to their history.'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {intakeMode === 'existing' ? (
          <>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Find patient</Text>
              <TextInput
                style={styles.input}
                placeholder="Search by name or patient code"
                placeholderTextColor="#cccccc"
                value={existingSearch}
                onChangeText={setExistingSearch}
                autoCapitalize="words"
                returnKeyType="search"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Select patient</Text>
              {existingPatients.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No saved patients match this search yet.</Text>
                </View>
              ) : (
                <View style={styles.resultsList}>
                  {existingPatients.map((patient) => {
                    const isSelected = selectedPatient?.patient_code === patient.patient_code;

                    return (
                      <TouchableOpacity
                        key={patient.patient_code}
                        style={[styles.patientCard, isSelected && styles.patientCardSelected]}
                        onPress={() => handleSelectExistingPatient(patient)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.patientNameText}>
                          {patient.name?.trim() || patient.patient_code}
                        </Text>
                        <Text style={styles.patientMeta}>
                          {patient.patient_code} · {formatLabel(patient.age_group)} ·{' '}
                          {formatLabel(patient.sex)}
                        </Text>
                        {patient.village ? (
                          <Text style={styles.patientMeta}>{patient.village}</Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {selectedPatient ? (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Selected patient</Text>
                <Text style={styles.summaryText}>
                  {selectedPatient.name?.trim() || selectedPatient.patient_code}
                </Text>
                <Text style={styles.summaryMeta}>
                  {selectedPatient.patient_code} · {formatLabel(selectedPatient.age_group)} ·{' '}
                  {formatLabel(selectedPatient.sex)}
                </Text>
                {selectedPatient.village ? (
                  <Text style={styles.summaryMeta}>{selectedPatient.village}</Text>
                ) : null}
              </View>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Patient name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Tariro Ndlovu"
                placeholderTextColor="#cccccc"
                value={patientName}
                onChangeText={setPatientName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Village or area</Text>
              <TextInput
                style={styles.input}
                placeholder="Optional"
                placeholderTextColor="#cccccc"
                value={village}
                onChangeText={setVillage}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Age group</Text>
              <View style={styles.optionsGrid}>
                {AGE_GROUPS.map((option) => {
                  const isSelected = ageGroup === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                      onPress={() => setAgeGroup(option.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Sex</Text>
              <View style={styles.optionsRow}>
                {SEX_OPTIONS.map((option) => {
                  const isSelected = sex === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.sexCard, isSelected && styles.optionCardSelected]}
                      onPress={() => setSex(option.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Chief complaint</Text>
          <Text style={styles.fieldHint}>What is the patient's main problem?</Text>
          <View style={styles.complaintsGrid}>
            {COMPLAINTS.map((option) => {
              const isSelected = complaint === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.complaintCard, isSelected && styles.optionCardSelected]}
                  onPress={() => setComplaint(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.complaintText, isSelected && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {complaint === 'other' ? (
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Describe the complaint</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe the main complaint..."
              placeholderTextColor="#cccccc"
              value={otherComplaint}
              onChangeText={setOtherComplaint}
              multiline
              numberOfLines={3}
            />
          </View>
        ) : null}

        <View style={styles.warningNote}>
          <Text style={styles.warningText}>
            Murapi supports assessment and referral decisions. It does not
            diagnose, prescribe independently, or replace your training.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            !((intakeMode === 'new' && isNewPatientComplete) ||
              (intakeMode === 'existing' && isExistingPatientComplete)) &&
              styles.buttonDisabled,
          ]}
          onPress={handleStart}
          disabled={
            !((intakeMode === 'new' && isNewPatientComplete) ||
              (intakeMode === 'existing' && isExistingPatientComplete))
          }
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Start session</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 4,
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'System',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
  headerSub: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'System',
    lineHeight: 20,
  },
  form: {
    paddingHorizontal: 28,
    gap: 24,
    paddingBottom: 20,
  },
  modeRow: {
    gap: 10,
  },
  modeCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 6,
  },
  modeCardSelected: {
    borderColor: '#000000',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
  },
  modeTitleSelected: {
    color: '#000000',
  },
  modeDescription: {
    fontSize: 13,
    color: '#6d6d6d',
    lineHeight: 20,
    fontFamily: 'System',
  },
  fieldWrap: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: 0.2,
  },
  fieldHint: {
    fontSize: 11,
    color: '#888888',
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000000',
    fontFamily: 'System',
  },
  resultsList: {
    gap: 10,
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    padding: 14,
    gap: 4,
  },
  patientCardSelected: {
    borderColor: '#000000',
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  patientNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
  },
  patientMeta: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'System',
  },
  summaryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontFamily: 'System',
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
  },
  summaryMeta: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'System',
  },
  emptyCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
  },
  emptyText: {
    fontSize: 13,
    color: '#888888',
    fontFamily: 'System',
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    backgroundColor: '#ffffff',
  },
  sexCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  optionCardSelected: {
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  optionText: {
    fontSize: 13,
    color: '#000000',
    fontFamily: 'System',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  complaintsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  complaintCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    backgroundColor: '#ffffff',
  },
  complaintText: {
    fontSize: 13,
    color: '#000000',
    fontFamily: 'System',
    fontWeight: '500',
  },
  warningNote: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
  },
  warningText: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: 'System',
  },
});
