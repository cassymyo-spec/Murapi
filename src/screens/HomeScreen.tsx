import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { getProfile, VHWProfile } from '../storage/profileStorage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigatorContainer';
import { getTodayCount, getTotalPatients } from '../storage/patientRepository';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAppTheme } from '../theme/ThemeProvider';

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<Partial<VHWProfile> | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0)

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTodayCount(getTodayCount());
      setTotalPatients(getTotalPatients());
    }, [])
  );

  const loadProfile = async () => {
    const saved = await getProfile();
    setProfile(saved);
  };

  const firstName = profile?.name?.split(' ')[0] ?? 'VHW';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textMuted }]}>Good morning,</Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>{firstName}</Text>
        </View>
        <View style={[styles.offlineBadge, { backgroundColor: theme.colors.surfaceMuted }]}>
          <View style={[styles.offlineDot, { backgroundColor: theme.colors.text }]} />
          <Text style={[styles.offlineText, { color: theme.colors.text }]}>Offline</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={[styles.summaryCard, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.summaryLabel}>Today's patients</Text>
          <Text style={styles.summaryCount}>{todayCount}</Text>
          <Text style={styles.summaryDate}>
            {new Date().toDateString()}
          </Text>
          <Text style={styles.summaryTotal}>
            {totalPatients} total patients on record
          </Text>
        </View>

        <View
          style={[
            styles.detailsCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Health centre</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {profile?.healthCentre ?? '—'}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>District</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {profile?.district ?? '—'}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textMuted }]}>Supervisor</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {profile?.supervisorName ?? '—'}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick actions</Text>

        <TouchableOpacity 
          style={[
            styles.actionCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]} 
          onPress={() => navigation.navigate('ClinicalPatient')}
          activeOpacity={0.8}
        >
          <View style={styles.actionLeft}>
            <View>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                Start session
              </Text>
              <Text style={[styles.actionDesc, { color: theme.colors.textMuted }]}>
                Type findings and get offline guidance
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.actionLeft}>
            <View>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                Photo support
              </Text>
              <Text style={[styles.actionDesc, { color: theme.colors.textMuted }]}>
                Camera workflow for signs and wound review
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
          activeOpacity={0.8}
        >
          <View style={styles.actionLeft}>
            <View>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                Voice support
              </Text>
              <Text style={[styles.actionDesc, { color: theme.colors.textMuted }]}>
                Speak findings for hands-busy field use
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'System',
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
    fontFamily: 'System',
    letterSpacing: -0.5,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
  },
  offlineText: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '600',
    fontFamily: 'System',
  },
  content: {
    paddingHorizontal: 28,
    gap: 12,
    paddingBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 24,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'System',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryCount: {
    fontSize: 56,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'System',
    letterSpacing: -2,
    lineHeight: 64,
  },
  summaryDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'System',
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    paddingHorizontal: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#888888',
    fontFamily: 'System',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
    fontFamily: 'System',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
  },
  actionDesc: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
    marginTop: 2,
  },
  summaryTotal: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'System',
    marginTop: 2,
  },
});
