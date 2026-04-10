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
      <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />
      <View style={styles.content}>
        <Text style={styles.icon}></Text>
        <Text style={styles.title}>Refresher Training</Text>
        <Text style={styles.sub}>
          Ask Murapi any clinical question. IMCI protocols,
          danger signs, referral criteria — all available offline.
        </Text>
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>
            Coming next — integration
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf6',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
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