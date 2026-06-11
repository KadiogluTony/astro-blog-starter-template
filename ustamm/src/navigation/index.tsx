import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import TradesmanNavigator from './TradesmanNavigator';
import { COLORS } from '../constants';

export default function RootNavigator() {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : user.role === UserRole.CUSTOMER ? (
        <CustomerNavigator />
      ) : (
        <TradesmanNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
