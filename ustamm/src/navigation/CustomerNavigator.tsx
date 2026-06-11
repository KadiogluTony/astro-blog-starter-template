import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import CustomerHomeScreen from '../screens/customer/HomeScreen';
import MapSearchScreen from '../screens/customer/MapSearchScreen';
import PostJobScreen from '../screens/customer/PostJobScreen';
import OffersScreen from '../screens/customer/OffersScreen';
import CustomerProfileScreen from '../screens/customer/ProfileScreen';
import JobDetailScreen from '../screens/customer/JobDetailScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import ReviewScreen from '../screens/shared/ReviewScreen';
import PaymentScreen from '../screens/shared/PaymentScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const MapStack = createStackNavigator();
const PostStack = createStackNavigator();
const OffersStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="CustomerHome" component={CustomerHomeScreen} />
      <HomeStack.Screen name="JobDetail" component={JobDetailScreen} />
      <HomeStack.Screen name="Chat" component={ChatScreen} />
      <HomeStack.Screen name="Review" component={ReviewScreen} />
      <HomeStack.Screen name="Payment" component={PaymentScreen} />
    </HomeStack.Navigator>
  );
}

function MapStackNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="MapSearch" component={MapSearchScreen} />
    </MapStack.Navigator>
  );
}

function PostStackNavigator() {
  return (
    <PostStack.Navigator screenOptions={{ headerShown: false }}>
      <PostStack.Screen name="PostJob" component={PostJobScreen} />
    </PostStack.Navigator>
  );
}

function OffersStackNavigator() {
  return (
    <OffersStack.Navigator screenOptions={{ headerShown: false }}>
      <OffersStack.Screen name="Offers" component={OffersScreen} />
      <OffersStack.Screen name="JobDetail" component={JobDetailScreen} />
    </OffersStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={CustomerProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export default function CustomerNavigator() {
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
          else if (route.name === 'PostTab') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'OffersTab') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ tabBarLabel: 'Ana Sayfa' }} />
      <Tab.Screen name="MapTab" component={MapStackNavigator} options={{ tabBarLabel: 'Harita' }} />
      <Tab.Screen name="PostTab" component={PostStackNavigator} options={{ tabBarLabel: 'İlan Ver' }} />
      <Tab.Screen name="OffersTab" component={OffersStackNavigator} options={{ tabBarLabel: 'Teklifler' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}
