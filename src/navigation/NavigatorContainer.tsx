import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { isSetupComplete } from '../storage/profileStorage';

// Onboarding screens
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import LanguageSelectScreen from '../screens/Onboarding/LanguageSelectScreen';
import ProfileSetupScreen from '../screens/Onboarding/ProfileSetupScreen';
import WorkDetailsScreen from '../screens/Onboarding/WorkDetailsScreen';

// Tab screens
import HomeScreen from '../screens/HomeScreen';
import ClinicalScreen from '../screens/ClinicalScreen';
import RecordsScreen from '../screens/RecordsScreen';
import TrainingScreen from '../screens/TrainingScreen';

import ClinicalPatientScreen from '../screens/ClinicalPatientScreen';
import ClinicalSessionScreen from '../screens/ClinicalSessionScreen';

export type RootStackParamList = {
  Welcome: undefined;
  LanguageSelect: undefined;
  ProfileSetup: undefined;
  WorkDetails: undefined;
  MainTabs: undefined;
  ClinicalPatient: undefined;
  ClinicalSession: {
    ageGroup: string;
    sex: string;
    complaint: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: 'home-outline',
  Clinical: 'stethoscope',
  Records: 'clipboard-text-outline',
  Training: 'school-outline',
} as const;

function MainTabs() {
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
          backgroundColor: '#ffffff',
          borderTopColor: '#e8e8e8',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#cccccc',
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
        name="Training"
        component={TrainingScreen}
        options={{ tabBarLabel: 'Training'}}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [initialRouteName, setInitialRouteName] =
    useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadInitialRoute = async () => {
      const setupComplete = await isSetupComplete();

      if (isMounted) {
        setInitialRouteName(setupComplete ? 'MainTabs' : 'Welcome');
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
          backgroundColor: '#fffdf6',
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
          contentStyle: { backgroundColor: '#fffdf6' },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="WorkDetails" component={WorkDetailsScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ClinicalPatient" component={ClinicalPatientScreen} />
        <Stack.Screen name="ClinicalSession" component={ClinicalSessionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
