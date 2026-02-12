import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import PagerView from 'react-native-pager-view';
import { Colors, Typography } from '../constants/theme';
import { getFontFamily } from '../utils/fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

// Screens
import FeedScreen from '../screens/FeedScreen';
import RequestsScreen from '../screens/RequestsScreen';
import MatrimonialScreen from '../screens/MatrimonialScreen';
import ProfileScreen from '../screens/ProfileScreen';

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

const RequestsIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M14 2V8H20" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 18V12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 15H15" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MatrimonialIcon = ({ color, size }: { color: string; size: number }) => (
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

const SwipeableTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const tabBarBaseHeight = 58;
  const tabBarPaddingBottom = Math.max(insets.bottom, 10);
  const tabBarHeight = tabBarBaseHeight + tabBarPaddingBottom;
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const tabRoutes = ['Feed', 'Requests', 'Matrimonial', 'Profile'];

  const handlePageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    setActiveIndex(index);
  };

  const handleTabPress = (index: number) => {
    if (pagerRef.current) {
      pagerRef.current.setPage(index);
    }
  };

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageSelected}
        scrollEnabled={true}
      >
        <View key="0" style={styles.page}>
          <FeedScreen />
        </View>
        <View key="1" style={styles.page}>
          <RequestsScreen />
        </View>
        <View key="2" style={styles.page}>
          <MatrimonialScreen />
        </View>
        <View key="3" style={styles.page}>
          <ProfileScreen />
        </View>
      </PagerView>

      {/* Custom Tab Bar */}
      <View style={[styles.tabBar, { height: tabBarHeight, paddingBottom: tabBarPaddingBottom }]}>
        <View style={styles.customTabBar}>
          <TouchableOpacity
            onPress={() => handleTabPress(0)}
            style={styles.tabBarItem}
            activeOpacity={0.7}
          >
            <FeedIcon color={activeIndex === 0 ? Colors.tertiary : Colors.secondaryText} size={24} />
            <Text style={[styles.tabBarLabel, { color: activeIndex === 0 ? Colors.tertiary : Colors.secondaryText }]}>
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTabPress(1)}
            style={styles.tabBarItem}
            activeOpacity={0.7}
          >
            <RequestsIcon color={activeIndex === 1 ? Colors.tertiary : Colors.secondaryText} size={24} />
            <Text style={[styles.tabBarLabel, { color: activeIndex === 1 ? Colors.tertiary : Colors.secondaryText }]}>
              Requests
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTabPress(2)}
            style={styles.tabBarItem}
            activeOpacity={0.7}
          >
            <MatrimonialIcon color={activeIndex === 2 ? Colors.tertiary : Colors.secondaryText} size={24} />
            <Text style={[styles.tabBarLabel, { color: activeIndex === 2 ? Colors.tertiary : Colors.secondaryText }]}>
              Match
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTabPress(3)}
            style={styles.tabBarItem}
            activeOpacity={0.7}
          >
            <ProfileIcon color={activeIndex === 3 ? Colors.tertiary : Colors.secondaryText} size={24} />
            <Text style={[styles.tabBarLabel, { color: activeIndex === 3 ? Colors.tertiary : Colors.secondaryText }]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: Colors.primaryBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.alternate + '33',
  },
  customTabBar: {
    flexDirection: 'row',
    height: 58,
    paddingTop: 8,
    backgroundColor: Colors.primaryBackground,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabBarLabel: {
    ...Typography.label4,
    fontFamily: getFontFamily(500),
    marginTop: 4,
  },
});

export default SwipeableTabNavigator;

