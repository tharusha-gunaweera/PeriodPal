// App.jsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import Home from './screens/Home';
import LoginScreen from './screens/Login/signin';
import SplashScreen from './screens/SplashScreen';

const Stack = createNativeStackNavigator(); 

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading process (assets, data, etc.)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // 3 seconds splash screen

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen onAnimationComplete={() => setIsLoading(false)} />;
  }

  return (
    
  
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        {/* Add other screens here */}
      </Stack.Navigator>
    
  );
}