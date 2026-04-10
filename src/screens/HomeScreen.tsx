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

export default function HomeScreen() {
  const [profile, setProfile] = useState<Partial<VHWProfile> | null>(null);
  const [todayCount] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const saved = await getProfile();
    setProfile(saved);
  };

  const firstName = profile?.name?.split(' ')[0] ?? 'VHW';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.name}>{firstName} 🌿</Text>
        </View>
        <View style={styles.offlineBadge}>
          <View style={styles.offlineDot} />
          <Text style={styles.offlineText}>Offline</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Today's patients</Text>
          <Text style={styles.summaryCount}>{todayCount}</Text>
          <Text style={styles.summaryDate}>
            {new Date().toDateString()}
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Health centre</Text>
            <Text style={styles.detailValue}>
              {profile?.healthCentre ?? '—'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>District</Text>
            <Text style={styles.detailValue}>
              {profile?.district ?? '—'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Supervisor</Text>
            <Text style={styles.detailValue}>
              {profile?.supervisorName ?? '—'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick actions</Text>

        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionLeft}>
            <Text style={styles.actionIcon}>🩺</Text>
            <View>
              <Text style={styles.actionTitle}>
                Start clinical session
              </Text>
              <Text style={styles.actionDesc}>
                Assess a patient with Murapi
              </Text>
            </View>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionLeft}>
            <Text style={styles.actionIcon}>📋</Text>
            <View>
              <Text style={styles.actionTitle}>
                Record encounter
              </Text>
              <Text style={styles.actionDesc}>
                Log a patient visit
              </Text>
            </View>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8}>
          <View style={styles.actionLeft}>
            <Text style={styles.actionIcon}>📚</Text>
            <View>
              <Text style={styles.actionTitle}>
                Refresher training
              </Text>
              <Text style={styles.actionDesc}>
                Ask Murapi a clinical question
              </Text>
            </View>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    gap: 14,
  },
  actionIcon: {
    fontSize: 24,
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
  actionArrow: {
    fontSize: 16,
    color: '#cccccc',
  }
});