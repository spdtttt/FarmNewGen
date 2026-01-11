import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform } from 'react-native';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

// Import Types
import { AuthStackParamList, BottomTabParamList, MainStackParamList } from './types';

// Import Screens
import LoadingScreen from '../components/LoadingScreen';
import FertilizerCalculatorScreen from '../screens/FertilizerCalculatorScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ShopScreen from '../screens/ShopScreen';
import UpdatePasswordScreen from '../screens/UpdatePasswordScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const BottomTab = createBottomTabNavigator<BottomTabParamList>();

// Auth Stack - สำหรับผู้ที่ยังไม่ได้ login
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Bottom Tab Navigator - สำหรับหน้าหลัก 3 หน้า
const BottomTabNavigator: React.FC = () => {
  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 10, // Shadow for Android
          shadowColor: colors.primary, // Shadow for iOS
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'หน้าหลัก',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <BottomTab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarLabel: 'ร้านค้า',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "storefront" : "storefront-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'โปรไฟล์',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
};

// Main Stack - สำหรับผู้ที่ login แล้ว
const MainNavigator: React.FC = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <MainStack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="FertilizerCalculator"
        component={FertilizerCalculatorScreen}
        options={{ headerShown: false }}
      />
    </MainStack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { user, loading, requirePasswordReset } = useAuth();

  // Custom Stack for Password Reset to separate it from Main/Auth
  const ResetPasswordStack = createNativeStackNavigator<MainStackParamList>();

  // แสดง Loading Screen ขณะกำลังตรวจสอบ session
  if (loading) {
    return <LoadingScreen />;
  }

  // If password reset is required, show only the UpdatePasswordScreen
  if (user && requirePasswordReset) {
    return (
      <NavigationContainer>
        <ResetPasswordStack.Navigator screenOptions={{ headerShown: false }}>
          <ResetPasswordStack.Screen
            name="ResetPassword"
            component={UpdatePasswordScreen}
          />
        </ResetPasswordStack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {/* 
        ถ้ามี user แสดงว่า login แล้ว → ไป MainNavigator
        ถ้าไม่มี user → ไป AuthNavigator
      */}
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;