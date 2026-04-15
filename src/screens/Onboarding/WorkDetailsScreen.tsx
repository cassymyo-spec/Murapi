import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';

import { saveProfile } from '../../storage/profileStorage';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../../navigation/NavigatorContainer";
import { CommonActions } from '@react-navigation/native';

type WorkNavProp = NativeStackNavigationProp<RootStackParamList, 'WorkDetails'>;

type Props = {
  navigation: WorkNavProp;
};

const EXPERIENCE_OPTIONS = [
  { label: 'Less than 1 year', value: '0' },
  { label: '1 — 3 years', value: '1-3' },
  { label: '3 — 5 years', value: '3-5' },
  { label: '5 — 10 years', value: '5-10' },
  { label: 'Over 10 years', value: '10+' },
];

export default function WorkDetailsScreen({ navigation }: Props) {

  const [healthCentre, setHealthCentre] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [vhwId, setVhwId] = useState('');
  const [experience, setExperience] = useState('');

  const isComplete =
    healthCentre.length > 0 &&
    supervisorName.length > 0 &&
    experience.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerStep}>Step 3 of 3</Text>
        <Text style={styles.headerTitle}>Work details</Text>
        <Text style={styles.headerSub}>
          Helps Murapi give you relevant clinical guidance
        </Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Health centre name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Beitbridge Rural Health Centre"
            placeholderTextColor="#cccccc"
            value={healthCentre}
            onChangeText={setHealthCentre}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Supervisor name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sister Chiedza Moyo"
            placeholderTextColor="#cccccc"
            value={supervisorName}
            onChangeText={setSupervisorName}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Text style={styles.fieldHint}>
            The nurse-in-charge at your nearest clinic
          </Text>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>
            VHW ID number{' '}
            <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ZW-VHW-00234"
            placeholderTextColor="#cccccc"
            value={vhwId}
            onChangeText={setVhwId}
            autoCapitalize="characters"
            returnKeyType="done"
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Years of experience</Text>
          <View style={styles.optionsGrid}>
            {EXPERIENCE_OPTIONS.map((option) => {
              const isSelected = experience === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => setExperience(option.value)}
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

        <View style={styles.readyNote}>
          <Text style={styles.readyIcon}></Text>
          <View style={styles.readyText}>
            <Text style={styles.readyTitle}>Almost ready</Text>
            <Text style={styles.readyDesc}>
              After this, Murapi is ready to support you
              in the field. No internet needed.
            </Text>
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            !isComplete && styles.buttonDisabled,
          ]}
          onPress={async () => {
            await saveProfile({
              healthCentre,
              supervisorName,
              vhwId,
              experience,
              setupComplete: true,
              createdAt: new Date().toISOString(),
            });
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              })
            );
          }}
          disabled={!isComplete}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            Finish Setup
          </Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 6,
  },
  headerStep: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
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
  progressWrap: {
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#e8e8e8',
    borderRadius: 3,
  },
  progressFill: {
    height: 3,
    backgroundColor: '#000000',
    borderRadius: 3,
  },
  form: {
    paddingHorizontal: 28,
    gap: 20,
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
    marginTop: 2,
  },
  optional: {
    fontWeight: '400',
    color: '#888888',
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
  optionsGrid: {
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
  readyNote: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
    marginTop: 4,
  },
  readyIcon: {
    fontSize: 18,
  },
  readyText: {
    flex: 1,
    gap: 4,
  },
  readyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
  },
  readyDesc: {
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
