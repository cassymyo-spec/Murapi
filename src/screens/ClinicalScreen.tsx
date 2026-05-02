import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigatorContainer';

type ClinicalNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

const SUPPORT_MODES = [
  {
    title: 'Open patient session',
    description:
      'Start one structured session with text, voice, image, and guidance in the same thread.',
    cta: 'Start session',
    available: true,
  },
  {
    title: 'Voice in session',
    description:
      'Use the voice action from inside the session so spoken findings stay with the same encounter.',
    cta: 'Included',
    available: true,
  },
  {
    title: 'Image in session',
    description:
      'Use the image action from inside the session so photos and notes belong to one patient record.',
    cta: 'Included',
    available: true,
  },
] as const;

const SAFETY_POINTS = [
  'Murapi supports assessment and referral. It does not diagnose.',
  'Use Zimbabwe Ministry of Health and Child Care protocols and your supervisor when in doubt.',
  'Refer immediately when danger signs are present or the patient is unstable.',
];

export default function ClinicalScreen() {
  const navigation = useNavigation<ClinicalNavigationProp>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>Clinical Support</Text>
          <Text style={styles.title}>One session for text, voice, and image</Text>
          <Text style={styles.sub}>
            Start one patient session and keep typed findings, voice notes,
            image review, and Murapi guidance together in a single thread.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Unified workflow</Text>
          <Text style={styles.heroText}>
            The app now treats text, voice, and image as inputs to one support
            session so every encounter can be reviewed and stored together.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start a session</Text>
          {SUPPORT_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.title}
              style={styles.modeCard}
              activeOpacity={mode.available ? 0.8 : 1}
              disabled={!mode.available}
              onPress={() => navigation.navigate('ClinicalPatient')}
            >
              <View style={styles.modeBody}>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
              </View>
              <Text
                style={[
                  styles.modeCta,
                  !mode.available && styles.modeCtaMuted,
                ]}
              >
                {mode.cta}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety guardrails</Text>
          <View style={styles.noteCard}>
            {SAFETY_POINTS.map((point) => (
              <Text key={point} style={styles.noteItem}>
                {`\u2022 ${point}`}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 32,
    gap: 18,
  },
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 11,
    color: '#2d6a4f',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.8,
    fontFamily: 'System',
  },
  sub: {
    fontSize: 14,
    color: '#5f5f5f',
    lineHeight: 22,
    fontFamily: 'System',
  },
  heroCard: {
    backgroundColor: '#1f3d2f',
    borderRadius: 18,
    padding: 20,
    gap: 8,
  },
  heroTitle: {
    fontSize: 13,
    color: '#d8eadf',
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  heroText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
    fontFamily: 'System',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  modeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    gap: 14,
  },
  modeBody: {
    gap: 6,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
  },
  modeDescription: {
    fontSize: 13,
    color: '#6d6d6d',
    lineHeight: 20,
    fontFamily: 'System',
  },
  modeCta: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    fontFamily: 'System',
  },
  modeCtaMuted: {
    color: '#888888',
  },
  noteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    gap: 10,
  },
  noteItem: {
    fontSize: 13,
    color: '#4f4f4f',
    lineHeight: 20,
    fontFamily: 'System',
  },
});
