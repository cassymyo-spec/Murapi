import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/NavigatorContainer';
import { getProfile, verifyPin } from '../storage/profileStorage';
import { useAppTheme } from '../theme/ThemeProvider';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Unlock'>;
};

export default function UnlockScreen({ navigation }: Props) {
  const { theme } = useAppTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('VHW');

  React.useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const profile = await getProfile();

      if (isMounted && profile?.name) {
        setFirstName(profile.name.split(' ')[0] || 'VHW');
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUnlock = async () => {
    if (pin.trim().length < 4) {
      setError('Enter your 4-digit PIN to continue.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const isValid = await verifyPin(pin);

    setIsSubmitting(false);

    if (!isValid) {
      setError('Incorrect PIN. Try again.');
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.content}>
        <Text style={[styles.kicker, { color: theme.colors.textMuted }]}>Secure Access</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome back, {firstName}</Text>
        <Text style={[styles.sub, { color: theme.colors.textMuted }]}>
          Enter your local PIN to unlock Murapi. Patient records and VHW
          details stay on this device.
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.label, { color: theme.colors.text }]}>PIN</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceMuted,
                color: theme.colors.text,
              },
            ]}
            value={pin}
            onChangeText={(value) => {
              setPin(value.replace(/[^0-9]/g, '').slice(0, 4));
              if (error) {
                setError('');
              }
            }}
            placeholder="Enter 4-digit PIN"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />

          {error ? <Text style={[styles.errorText, { color: theme.colors.dangerText }]}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  pin.length < 4 || isSubmitting
                    ? '#cccccc'
                    : theme.colors.primary,
              },
            ]}
            onPress={handleUnlock}
            disabled={pin.length < 4 || isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Checking...' : 'Unlock'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 18,
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
    letterSpacing: -0.6,
    fontFamily: 'System',
  },
  sub: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    fontFamily: 'System',
  },
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'System',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: 'System',
    letterSpacing: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#b42318',
    fontFamily: 'System',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    fontFamily: 'System',
  },
});
