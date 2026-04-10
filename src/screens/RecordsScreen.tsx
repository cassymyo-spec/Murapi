import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';

export default function RecordsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />
      <View style={styles.content}>
        <Text style={styles.icon}></Text>
        <Text style={styles.title}>Encounter Records</Text>
        <Text style={styles.sub}>
          Every patient visit you record will appear here.
          Stored locally on your device.
        </Text>
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>
            No records yet — start a clinical session
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