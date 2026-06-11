import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import * as ExpoNotifications from 'expo-notifications';
import { db } from '../config/firebase';
import { Notification } from '../types';

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationsService = {
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await ExpoNotifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  async getExpoPushToken(): Promise<string | null> {
    try {
      const granted = await notificationsService.requestPermissions();
      if (!granted) return null;
      const tokenData = await ExpoNotifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      });
      return tokenData.data;
    } catch {
      return null;
    }
  },

  async saveToken(userId: string, token: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { fcmToken: token });
  },

  async sendPushNotification(params: {
    targetUserId: string;
    title: string;
    body: string;
    type: Notification['type'];
    data?: Record<string, string>;
  }): Promise<void> {
    // Save notification to Firestore
    await addDoc(collection(db, 'notifications'), {
      userId: params.targetUserId,
      title: params.title,
      body: params.body,
      type: params.type,
      data: params.data || {},
      read: false,
      createdAt: serverTimestamp(),
    });

    // Get user's FCM token and send via Expo Push API
    const { getDocs: gd, query: q, where: w, collection: c } = await import('firebase/firestore');
    const snap = await gd(q(c(db, 'users'), w('__name__', '==', params.targetUserId)));
    if (snap.empty) return;

    const user = snap.docs[0].data();
    if (!user.fcmToken) return;

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: user.fcmToken,
        title: params.title,
        body: params.body,
        data: params.data,
        sound: 'default',
      }),
    });
  },

  async getNotifications(userId: string, pageLimit = 20): Promise<Notification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageLimit)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as Notification[];
  },

  async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  },

  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
  },

  async getUnreadCount(userId: string): Promise<number> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    return snap.size;
  },
};
