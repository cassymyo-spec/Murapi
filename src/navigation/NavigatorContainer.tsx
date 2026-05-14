import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getProfileAccessState } from '../storage/profileStorage';

// Onboarding screens
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import LanguageSelectScreen from '../screens/Onboarding/LanguageSelectScreen';
import ProfileSetupScreen from '../screens/Onboarding/ProfileSetupScreen';
import WorkDetailsScreen from '../screens/Onboarding/WorkDetailsScreen';
import UnlockScreen from '../screens/UnlockScreen';
import PinSetupScreen from '../screens/PinSetupScreen';

// Tab screens
import HomeScreen from '../screens/HomeScreen';
import ClinicalScreen from '../screens/ClinicalScreen';
import RecordsScreen from '../screens/RecordsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useAppTheme } from '../theme/ThemeProvider';

import ClinicalPatientScreen from '../screens/ClinicalPatientScreen';
import ClinicalSessionScreen from '../screens/ClinicalSessionScreen';
import RecordDetailScreen from '../screens/RecordDetailScreen';

export type RootStackParamList = {
  Welcome: undefined;
  LanguageSelect: undefined;
  ProfileSetup: undefined;
  WorkDetails: undefined;
  PinSetup: undefined;
  Unlock: undefined;
  MainTabs: undefined;
  ClinicalPatient: undefined;
  ClinicalSession: {
    patientCode?: string;
    patientName: string;
    village?: string;
    ageGroup: string;
    sex: string;
    complaint: string;
  };
  RecordDetail: {
    encounterId: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: 'home-outline',
  Clinical: 'stethoscope',
  Records: 'clipboard-text-outline',
  Settings: 'cog-outline',
} as const;

function MainTabs() {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={tabIcons[route.name as keyof typeof tabIcons]}
            color={color}
            size={size + 2}
          />
        ),
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'System',
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="Clinical"
        component={ClinicalScreen}
        options={{ tabBarLabel: 'Clinical'}}
      />
      <Tab.Screen
        name="Records"
        component={RecordsScreen}
        options={{ tabBarLabel: 'Records'}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings'}}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useAppTheme();
  const [initialRouteName, setInitialRouteName] =
    useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadInitialRoute = async () => {
      const accessState = await getProfileAccessState();

      if (isMounted) {
        setInitialRouteName(
          accessState === 'ready_for_unlock'
            ? 'Unlock'
            : accessState === 'needs_pin_setup'
              ? 'PinSetup'
              : 'Welcome'
        );
      }
    };

    loadInitialRoute();

    return () => {
      isMounted = false;
    };
  }, []);

  if (initialRouteName === null) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator color="#2d6a4f" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="WorkDetails" component={WorkDetailsScreen} />
        <Stack.Screen name="PinSetup" component={PinSetupScreen} />
        <Stack.Screen name="Unlock" component={UnlockScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ClinicalPatient" component={ClinicalPatientScreen} />
        <Stack.Screen name="ClinicalSession" component={ClinicalSessionScreen} />
        <Stack.Screen name="RecordDetail" component={RecordDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
