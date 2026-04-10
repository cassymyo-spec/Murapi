import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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

export type RootStackParamList = {
  Welcome: undefined;
  LanguageSelect: undefined;
  ProfileSetup: undefined;
  WorkDetails: undefined;
  MainTabs: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Tab navigator — shown after onboarding
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
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
      }}
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

// Root stack — onboarding first, then tabs
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}