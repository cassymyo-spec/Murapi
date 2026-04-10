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

type ProfileNavProp = NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>;

type Props = {
  navigation: ProfileNavProp;
};

export default function ProfileSetupScreen({ navigation }: Props) {

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');

  const isComplete = name.length > 0 && phone.length > 0 && district.length > 0 && province.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />

      <View style={styles.header}>
        <Text style={styles.headerStep}>Step 2 of 3</Text>
        <Text style={styles.headerTitle}>Personal details</Text>
        <Text style={styles.headerSub}>
          This stays on your device and is never shared
        </Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.form}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Shamiso Moyo"
            placeholderTextColor="#c8bfa8"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Phone number</Text>
          <View style={styles.phoneWrap}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>🇿🇼 +263</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="77 123 4567"
              placeholderTextColor="#c8bfa8"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>District</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Beitbridge"
            placeholderTextColor="#c8bfa8"
            value={district}
            onChangeText={setDistrict}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Province</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Matabeleland South"
            placeholderTextColor="#c8bfa8"
            value={province}
            onChangeText={setProvince}
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            Your details are stored only on this device.
            No internet connection required.
          </Text>
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
                name,
                phone,
                district,
                province,
            });
            navigation.navigate('WorkDetails');
          }}
          disabled={!isComplete}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Continue</Text>
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
  phoneWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  phonePrefix: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontSize: 14,
    color: '#000000',
    fontFamily: 'System',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
  },
  privacyNote: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'flex-start',
    marginTop: 4,
  },
  privacyIcon: {
    fontSize: 14,
  },
  privacyText: {
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