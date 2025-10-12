import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import your actual screens - UPDATE THESE IMPORTS
import CommunityMemberScreen from '../Community/CommunityMemberScreen';
import Home from '../Tracker/Home';
import ShopScreen from '../MenstrualSup/ShopScreen'; // Import your Products/Shop screen
import ProfileScreen from '../auth/Profile/ProfileScreen'; // Import your Profile/Account screen

const Tab = createBottomTabNavigator();
const CommunityStack = createNativeStackNavigator();
const ShopStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Community Stack Navigator
function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator>
      <CommunityStack.Screen 
        name="CommunityMemberScreen" 
        component={CommunityMemberScreen}
        options={{ 
          title: 'Communities',
          headerStyle: { backgroundColor: '#EC4899' },
          headerTintColor: '#FFFFFF',
        }}
      />
    </CommunityStack.Navigator>
  );
}

// Shop Stack Navigator
function ShopStackNavigator() {
  return (
    <ShopStack.Navigator>
      <ShopStack.Screen 
        name="ShopScreen" 
        component={ShopScreen}
        options={{ 
          title: 'Products',
          headerStyle: { backgroundColor: '#EC4899' },
          headerTintColor: '#FFFFFF',
        }}
      />
    </ShopStack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen}
        options={{ 
          title: 'My Account',
          headerStyle: { backgroundColor: '#EC4899' },
          headerTintColor: '#FFFFFF',
        }}
      />
    </ProfileStack.Navigator>
  );
}

// Custom Middle Button Component (if you still want it)
const CustomMiddleButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={styles.middleButton}
    onPress={onPress}
  >
    <View style={styles.middleButtonContainer}>
      {children}
    </View>
  </TouchableOpacity>
);

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Communities') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#EC4899',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#EC4899',
        },
        headerTintColor: '#FFFFFF',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Home}
        options={{
          title: 'Home',
          headerTitle: 'Cycle Tracker',
        }}
      />
      
      <Tab.Screen 
        name="Communities" 
        component={CommunityStackNavigator}
        options={{
          headerShown: false,
          title: 'Communities',
        }}
      />
      
      <Tab.Screen 
        name="Products" 
        component={ShopStackNavigator}
        options={{
          headerShown: false,
          title: 'Products',
        }}
      />
      
      <Tab.Screen 
        name="Account" 
        component={ProfileStackNavigator}
        options={{
          headerShown: false,
          title: 'Account',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  middleButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleButtonContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  middleButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
});