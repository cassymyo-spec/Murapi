import React, { useState } from 'react';
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

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ClinicalPatient'>;
};

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
  { label: '🌡 Fever', value: 'fever' },
  { label: '🤧 Cough', value: 'cough' },
  { label: '💧 Diarrhoea', value: 'diarrhoea' },
  { label: '🤰 Pregnancy', value: 'pregnancy' },
  { label: '❤️ Chest pain', value: 'chest_pain' },
  { label: '🧠 Headache', value: 'headache' },
  { label: '🩸 Bleeding', value: 'bleeding' },
  { label: '😮 Breathing', value: 'breathing' },
  { label: '⚡ Fits/Seizure', value: 'seizure' },
  { label: '🍽 Not eating', value: 'not_eating' },
  { label: '😴 Unconscious', value: 'unconscious' },
  { label: '✏️ Other', value: 'other' },
];

export default function ClinicalPatientScreen({ navigation }: Props) {
  const [ageGroup, setAgeGroup] = useState('');
  const [sex, setSex] = useState('');
  const [complaint, setComplaint] = useState('');
  const [otherComplaint, setOtherComplaint] = useState('');

  const isComplete =
    ageGroup.length > 0 &&
    sex.length > 0 &&
    complaint.length > 0;

  const handleStart = () => {
    navigation.navigate('ClinicalSession', {
      ageGroup,
      sex,
      complaint: complaint === 'other' ? otherComplaint : complaint,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New patient</Text>
        <Text style={styles.headerSub}>
          Basic details before the session starts
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Age group */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Age group</Text>
          <View style={styles.optionsGrid}>
            {AGE_GROUPS.map((option) => {
              const isSelected = ageGroup === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => setAgeGroup(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sex */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Sex</Text>
          <View style={styles.optionsRow}>
            {SEX_OPTIONS.map((option) => {
              const isSelected = sex === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sexCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => setSex(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Chief complaint */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Chief complaint</Text>
          <Text style={styles.fieldHint}>
            What is the patient's main problem?
          </Text>
          <View style={styles.complaintsGrid}>
            {COMPLAINTS.map((option) => {
              const isSelected = complaint === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.complaintCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => setComplaint(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.complaintText,
                    isSelected && styles.optionTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Other complaint text input */}
        {complaint === 'other' && (
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>
              Describe the complaint
            </Text>
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
        )}

        {/* Warning note */}
        <View style={styles.warningNote}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Murapi supports your clinical judgment —
            it does not replace it. Always use your
            training and refer when in doubt.
          </Text>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            !isComplete && styles.buttonDisabled,
          ]}
          onPress={handleStart}
          disabled={!isComplete}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            Start Session →
          </Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf6',
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  complaintsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  complaintCard: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    backgroundColor: '#ffffff',
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
  complaintText: {
    fontSize: 13,
    color: '#000000',
    fontFamily: 'System',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#ffffff',
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
    textAlignVertical: 'top',
  },
  warningNote: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#ffe0b2',
    marginTop: 4,
  },
  warningIcon: {
    fontSize: 14,
  },
  warningText: {
    flex: 1,
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