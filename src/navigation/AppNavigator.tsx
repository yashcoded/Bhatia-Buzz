import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getCurrentUser, setUser } from '../store/slices/authSlice';
import * as authService from '../services/firebase/auth';
import { RootStackParamList } from '../types';
import { Colors, Typography } from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens (will create these next)
import AuthScreen from '../screens/AuthScreen';
import FeedScreen from '../screens/FeedScreen';
import RequestsScreen from '../screens/RequestsScreen';
import MatrimonialScreen from '../screens/MatrimonialScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import MatrimonialDetailScreen from '../screens/MatrimonialDetailScreen';
import MatrimonialSwipeScreen from '../screens/MatrimonialSwipeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import PanjaKhadaScreen from '../screens/PanjaKhadaScreen';
import CreateMatrimonialProfileScreen from '../screens/CreateMatrimonialProfileScreen';
import AboutDeveloperScreen from '../screens/AboutDeveloperScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

// Tab Icons
const FeedIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PanjaKhadaIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L2 7L12 12L22 7L12 2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 17L12 22L22 17"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12L12 17L22 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MatrimonialIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61C20.3292 4.099 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Main Tab Navigator
const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const tabBarBaseHeight = 58;
  const tabBarPaddingBottom = Math.max(insets.bottom, 10);
  const tabBarHeight = tabBarBaseHeight + tabBarPaddingBottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: Colors.tertiary,
        tabBarInactiveTintColor: Colors.secondaryText,
        animation: 'shift',
        animationEnabled: true,
        tabBarStyle: {
          backgroundColor: Colors.primaryBackground,
          borderTopColor: Colors.alternate + '33',
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          ...Typography.label4,
          fontFamily: getFontFamily(500),
        },
        headerStyle: {
          backgroundColor: Colors.primaryBackground,
        },
        headerTitleStyle: {
          ...Typography.headline4,
          color: Colors.primaryText,
          fontFamily: getFontFamily(600),
        },
        headerTintColor: Colors.primaryText,
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: 'Feed',
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => <FeedIcon color={color} size={size} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="PanjaKhada"
        component={PanjaKhadaScreen}
        options={{
          title: 'Panja Khada',
          tabBarLabel: 'Panja Khada',
          tabBarIcon: ({ color, size }) => <PanjaKhadaIcon color={color} size={size} />,
          headerShown: true,
        }}
      />
      {user != null && (
        <Tab.Screen
          name="Matrimonial"
          component={MatrimonialScreen}
          options={{
            title: 'Matrimonial',
            tabBarLabel: 'Match',
            tabBarIcon: ({ color, size }) => <MatrimonialIcon color={color} size={size} />,
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <ProfileIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      dispatch(setUser(user));
    });

    // Also try to get current user
    dispatch(getCurrentUser());

    return unsubscribe;
  }, [dispatch]);

  if (loading) {
    // You can add a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Always allow access to Main tabs (guest mode) */}
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="RequestDetail"
          component={RequestDetailScreen}
          options={{ headerShown: true, title: 'Request Details' }}
        />
        <Stack.Screen
          name="MatrimonialDetail"
          component={MatrimonialDetailScreen}
          options={{ headerShown: true, title: 'Profile Details' }}
        />
        <Stack.Screen
          name="MatrimonialSwipe"
          component={MatrimonialSwipeScreen}
          options={{ headerShown: true, title: 'Find Matches' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: true, title: 'Settings' }}
        />
        <Stack.Screen
          name="Requests"
          component={RequestsScreen}
          options={{ headerShown: true, title: 'Requests' }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ headerShown: true, title: 'Edit Profile' }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ headerShown: true, title: 'Privacy Policy' }}
        />
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreen}
          options={{ headerShown: true, title: 'Terms of Service' }}
        />
        <Stack.Screen
          name="CreateMatrimonialProfile"
          component={CreateMatrimonialProfileScreen}
          options={{ headerShown: true, title: 'Create Matrimonial Profile' }}
        />
        <Stack.Screen
          name="AboutDeveloper"
          component={AboutDeveloperScreen}
          options={{ headerShown: true, title: 'About & Developer' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

