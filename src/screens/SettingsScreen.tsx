import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeProvider';
import { saveProfile, verifyPin } from '../storage/profileStorage';

export default function SettingsScreen() {
  const { theme, settings, setThemeMode, setLayoutDensity } = useAppTheme();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  const handleChangePin = async () => {
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      setPinMessage('Enter a new 4-digit PIN and confirm it.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinMessage('New PINs do not match.');
      return;
    }

    const isCurrentValid = await verifyPin(currentPin);

    if (!isCurrentValid) {
      setPinMessage('Current PIN is incorrect.');
      return;
    }

    await saveProfile({ pin: newPin });
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinMessage('PIN updated successfully.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.colors.background}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: theme.spacing.screen },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
          <Text style={[styles.sub, { color: theme.colors.textMuted }]}>
            Manage security, appearance, and layout on this device.
          </Text>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>

          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Theme mode</Text>
            <View style={styles.choiceRow}>
              {(['light', 'dark'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.choice,
                    {
                      backgroundColor:
                        settings.themeMode === mode
                          ? theme.colors.primary
                          : theme.colors.surfaceMuted,
                    },
                  ]}
                  onPress={() => setThemeMode(mode)}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      {
                        color:
                          settings.themeMode === mode
                            ? theme.colors.primaryContrast
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {mode === 'light' ? 'Light' : 'Dark'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.optionRow}>
            <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Layout</Text>
            <View style={styles.choiceRow}>
              {(['comfortable', 'compact'] as const).map((density) => (
                <TouchableOpacity
                  key={density}
                  style={[
                    styles.choice,
                    {
                      backgroundColor:
                        settings.layoutDensity === density
                          ? theme.colors.primary
                          : theme.colors.surfaceMuted,
                    },
                  ]}
                  onPress={() => setLayoutDensity(density)}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      {
                        color:
                          settings.layoutDensity === density
                            ? theme.colors.primaryContrast
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {density === 'comfortable' ? 'Comfortable' : 'Compact'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Security</Text>

          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Current PIN</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceMuted,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={currentPin}
            onChangeText={(value) => setCurrentPin(value.replace(/[^0-9]/g, '').slice(0, 4))}
            placeholder="Current 4-digit PIN"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />

          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>New PIN</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceMuted,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={newPin}
            onChangeText={(value) => setNewPin(value.replace(/[^0-9]/g, '').slice(0, 4))}
            placeholder="New 4-digit PIN"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />

          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Confirm new PIN</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surfaceMuted,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={confirmPin}
            onChangeText={(value) => setConfirmPin(value.replace(/[^0-9]/g, '').slice(0, 4))}
            placeholder="Confirm new PIN"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />

          {pinMessage ? (
            <Text
              style={[
                styles.pinMessage,
                {
                  color: pinMessage.includes('success')
                    ? theme.colors.textMuted
                    : theme.colors.dangerText,
                },
              ]}
            >
              {pinMessage}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={handleChangePin}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.primaryButtonText,
                { color: theme.colors.primaryContrast },
              ]}
            >
              Change PIN
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 60,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'System',
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'System',
  },
  section: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'System',
  },
  optionRow: {
    gap: 8,
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'System',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choice: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  choiceText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'System',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'System',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'System',
  },
  pinMessage: {
    fontSize: 12,
    fontFamily: 'System',
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'System',
  },
});
