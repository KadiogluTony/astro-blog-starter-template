import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { notificationsService } from './src/services/notifications.service';
import { useAuthStore } from './src/store/auth.store';

export default function App() {
  const { user } = useAuthStore();

  useEffect(() => {
    setupNotifications();
  }, [user]);

  const setupNotifications = async () => {
    if (!user) return;
    const token = await notificationsService.getExpoPushToken();
    if (token) {
      await notificationsService.saveToken(user.id, token);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
