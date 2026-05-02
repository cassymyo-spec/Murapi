import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';

export default function TrainingScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.content}>
        <Text style={styles.title}>Refresher Training</Text>
        <Text style={styles.sub}>
          Review protocols, danger signs, and referral criteria in a
          training mode designed for offline use.
        </Text>
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>
            Training content coming next
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000000',
    fontFamily: 'System',
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: '#888888',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 22,
  },
  comingSoon: {
    marginTop: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  comingSoonText: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'System',
  },
});
