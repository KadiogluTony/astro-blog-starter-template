import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import TradesmanHomeScreen from '../screens/tradesman/HomeScreen';
import JobsMapScreen from '../screens/tradesman/JobsMapScreen';
import MyOffersScreen from '../screens/tradesman/MyOffersScreen';
import EarningsScreen from '../screens/tradesman/EarningsScreen';
import TradesmanProfileScreen from '../screens/tradesman/ProfileScreen';
import TradesmanJobDetailScreen from '../screens/tradesman/JobDetailScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ReviewScreen from '../screens/shared/ReviewScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const MapStack = createStackNavigator();
const OffersStack = createStackNavigator();
const EarningsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="TradesmanHome" component={TradesmanHomeScreen} />
      <HomeStack.Screen name="JobDetail" component={TradesmanJobDetailScreen} />
      <HomeStack.Screen name="Chat" component={ChatScreen} />
    </HomeStack.Navigator>
  );
}

function MapStackNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="JobsMap" component={JobsMapScreen} />
      <MapStack.Screen name="JobDetail" component={TradesmanJobDetailScreen} />
    </MapStack.Navigator>
  );
}

function OffersStackNavigator() {
  return (
    <OffersStack.Navigator screenOptions={{ headerShown: false }}>
      <OffersStack.Screen name="MyOffers" component={MyOffersScreen} />
      <OffersStack.Screen name="JobDetail" component={TradesmanJobDetailScreen} />
      <OffersStack.Screen name="Review" component={ReviewScreen} />
    </OffersStack.Navigator>
  );
}

function EarningsStackNavigator() {
  return (
    <EarningsStack.Navigator screenOptions={{ headerShown: false }}>
      <EarningsStack.Screen name="Earnings" component={EarningsScreen} />
    </EarningsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="TradesmanProfile" component={TradesmanProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export default function TradesmanNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'HomeTab') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'MapTab') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'OffersTab') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'EarningsTab') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ tabBarLabel: 'Ana Sayfa' }} />
      <Tab.Screen name="MapTab" component={MapStackNavigator} options={{ tabBarLabel: 'İş Haritası' }} />
      <Tab.Screen name="OffersTab" component={OffersStackNavigator} options={{ tabBarLabel: 'Tekliflerim' }} />
      <Tab.Screen name="EarningsTab" component={EarningsStackNavigator} options={{ tabBarLabel: 'Kazanç' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}
