import React, { useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getCurrentUser, setUser } from '../store/slices/authSlice';
import * as authService from '../services/firebase/auth';
import { RootStackParamList } from '../types';
import { Typography } from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import { useTheme } from '../utils/theme';
import { Home, Users, Heart, CircleUser, SlidersHorizontal } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassSurface from '../components/common/GlassSurface';

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
import MatchFilterScreen from '../screens/MatchFilterScreen';
import AdminPendingRequestsScreen from '../screens/AdminPendingRequestsScreen';
import AdminPendingMatrimonialScreen from '../screens/AdminPendingMatrimonialScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

function MatchFilterHeaderButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('MatchFilter')}
      style={{ padding: 8, marginRight: 4 }}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <SlidersHorizontal color={colors.primaryText} size={24} />
    </TouchableOpacity>
  );
}

// Main Tab Navigator
const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const user = useAppSelector((state) => state.auth.user);
  const { colors } = useTheme();
  const tabBarBaseHeight = 58;
  const tabBarPaddingBottom = Math.max(insets.bottom, 10);
  const tabBarHeight = tabBarBaseHeight + tabBarPaddingBottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: colors.tertiary,
        tabBarInactiveTintColor: colors.secondaryText,
        animation: 'shift',
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarBackground: () => (
          <GlassSurface
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          ...Typography.label4,
          fontFamily: getFontFamily(500),
        },
        headerStyle: {
          backgroundColor: colors.headerBackground,
        },
        headerTitleStyle: {
          ...Typography.headline4,
          color: colors.primaryText,
          fontFamily: getFontFamily(600),
        },
        headerTintColor: colors.primaryText,
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          title: 'Feed',
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="PanjaKhada"
        component={PanjaKhadaScreen}
        options={{
          title: 'Panja Khada',
          tabBarLabel: 'Panja Khada',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
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
            tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <CircleUser color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const { colors, isDark } = useTheme();

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

  const stackScreenOptions = {
    headerShown: false,
    contentStyle: { backgroundColor: colors.primaryBackground },
    animation: 'slide_from_right' as const,
    gestureEnabled: true,
    fullScreenGestureEnabled: true,
    headerTransparent: true,
    headerBackground: () => (
      <GlassSurface
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />
    ),
    headerStyle: {
      backgroundColor: 'transparent',
    },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
    headerTitleStyle: {
      ...Typography.headline4,
      color: colors.primaryText,
      fontFamily: getFontFamily(600),
    },
    headerTintColor: colors.primaryText,
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer>
        <Stack.Navigator screenOptions={stackScreenOptions}>
        {/* Always allow access to Main tabs (guest mode) */}
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
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
          options={{
            headerShown: true,
            title: 'Find Matches',
            headerRight: () => <MatchFilterHeaderButton />,
            gestureEnabled: false,
            fullScreenGestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="MatchFilter"
          component={MatchFilterScreen}
          options={{ headerShown: true, title: 'Filters' }}
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
        <Stack.Screen
          name="AdminPendingRequests"
          component={AdminPendingRequestsScreen}
          options={{ headerShown: true, title: 'Pending Requests' }}
        />
        <Stack.Screen
          name="AdminPendingMatrimonial"
          component={AdminPendingMatrimonialScreen}
          options={{ headerShown: true, title: 'Pending Matrimonial Profiles' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </>
  );
};

export default AppNavigator;

