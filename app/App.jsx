import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';

// Import screens
import LoginScreen from './screens/auth/SignIn/SignIn';
import SignUpScreen from './screens/auth/Signup/SignUp';
import CommunityListScreen from './screens/Community/CommunityListScreen';
import CommunityChatScreen from './screens/Community/CommunityChatScreen';
import CommunityLocationView from './screens/Community/CommunityLocationView'; // Add this import
import BottomTabNavigator from './screens/navigation/BottomTabNavigator';
import OnboardingScreen from './screens/OnboardingScreen';
import SplashScreen from './screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        console.log("User is", user);
        setIsLoggedIn(!!user);
      } catch (error) {
        console.log('Error reading user data:', error);
        setIsLoggedIn(false);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };
    checkLogin();
  }, []);

  if (isLoading) {
    return <SplashScreen onAnimationComplete={() => setIsLoading(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        {isLoggedIn ? (
          // User is logged in - show main app with tabs
          <>
            <Stack.Screen name="MainApp" component={BottomTabNavigator} />
            
            {/* Community screens that can be accessed from anywhere in the app */}
            <Stack.Screen
              name="CommunityList"
              component={CommunityListScreen}
              options={{
                title: 'Communities',
                headerShown: true,
                headerStyle: { backgroundColor: '#EC4899' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
            
            <Stack.Screen
              name="CommunityChat"
              component={CommunityChatScreen}
              options={({ route }) => ({
                title: route.params?.communityName || 'Chat',
                headerShown: true,
                headerStyle: { backgroundColor: '#EC4899' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: 'bold' },
              })}
            />
            
            {/* Add CommunityLocationView screen */}
            <Stack.Screen
              name="CommunityLocationView"
              component={CommunityLocationView}
              options={({ route }) => ({
                title: `${route.params?.communityName || 'Community'} Location`,
                headerShown: true,
                headerStyle: { backgroundColor: '#EC4899' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: 'bold' },
              })}
            />
          </>
        ) : (
          // User is not logged in - show auth flow
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            
            {/* Allow access to communities even when not logged in (read-only) */}
            <Stack.Screen
              name="CommunityList"
              component={CommunityListScreen}
              options={{
                title: 'Communities',
                headerShown: true,
                headerStyle: { backgroundColor: '#EC4899' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: 'bold' },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}