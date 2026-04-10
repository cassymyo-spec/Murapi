import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "../../navigation/NavigatorContainer";

type WelcomeNavProp = NativeStackNavigationProp <RootStackParamList, 'Welcome'>;

type Props = {
  navigation: WelcomeNavProp;
};

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fffdf6" />

      <View style={styles.topBar} />
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoEmoji}>🌿</Text>
          <Text style={styles.logoText}>Murapi</Text>
          <Text style={styles.tagline}>
            Mufambiri weMurwere
          </Text>
        </View>
        <View style={styles.descWrap}>
          <Text style={styles.descText}>
            Clinical decision support for Zimbabwe's
            Village Health Workers.
          </Text>
          <Text style={styles.descSub}>
            Works fully offline. Speaks your language.
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("ProfileSetup")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          For registered Village Health Workers only
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffdf6',
  },
  topBar: {
    height: 4,
    backgroundColor: '#2d6a4f',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 40,
  },
  logoWrap: {
    alignItems: 'center',
    gap: 8,
  },
  logoEmoji: {
    fontSize: 56,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1a3a2a',
    letterSpacing: -1,
    fontFamily: 'System',
  },
  tagline: {
    fontSize: 13,
    color: '#6b8f79',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  descWrap: {
    alignItems: 'center',
    gap: 8,
  },
  descText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: 'System',
  },
  descSub: {
    fontSize: 13,
    color: '#000000',
    textAlign: 'center',
    fontFamily: 'System',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(45,106,79,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45,106,79,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2d6a4f',
  },
  badgeText: {
    fontSize: 11,
    color: '#2d6a4f',
    letterSpacing: 0.5,
    fontFamily: 'System',
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    gap: 12,
  },
  button: {
    backgroundColor: '#2d6a4f',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: 'System',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: '#8a7a65',
    fontFamily: 'System',
  },
});