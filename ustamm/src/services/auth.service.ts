import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { User, UserRole } from '../types';

export const authService = {
  async register(
    email: string,
    password: string,
    phone: string,
    fullName: string,
    role: UserRole,
    categories?: string[]
  ): Promise<User> {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    const userData: Omit<User, 'id' | 'createdAt'> & { createdAt: unknown } = {
      email,
      phone,
      fullName,
      role,
      rating: 0,
      totalReviews: 0,
      totalJobs: 0,
      isVerified: false,
      createdAt: serverTimestamp(),
      ...(role === UserRole.TRADESMAN && categories ? { categories } : {}),
    };

    await setDoc(doc(db, 'users', uid), userData);

    return {
      id: uid,
      ...userData,
      createdAt: new Date(),
    } as User;
  },

  async login(email: string, password: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
  },

  async uploadProfilePhoto(userId: string, imageUri: string): Promise<string> {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profiles/${userId}/avatar.jpg`);
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    await updateDoc(doc(db, 'users', userId), { profileImage: downloadUrl });
    return downloadUrl;
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async getUserData(userId: string): Promise<User | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
    } as User;
  },
};
