import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { create } from 'zustand';

import { auth, firebaseEnabled } from '@/lib/firebase';

const DEV_KEY = 'auth.token';

type AuthState = {
  /** Identidad de la sesión: uid de Firebase (o "dev:<correo>" en desarrollo). null = sin sesión. */
  token: string | null;
  ready: boolean;
  load: () => Promise<void>;
  signInDev: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  token: null,
  ready: false,
  load: async () => {
    if (firebaseEnabled && auth) {
      // Firebase restaura la sesión guardada y avisa cada vez que cambia.
      onAuthStateChanged(auth, (user) => set({ token: user?.uid ?? null, ready: true }));
      return;
    }
    let token: string | null = null;
    try {
      token = await AsyncStorage.getItem(DEV_KEY);
    } catch {}
    set({ token, ready: true });
  },
  signInDev: async (email) => {
    const token = `dev:${email}`;
    set({ token });
    try {
      await AsyncStorage.setItem(DEV_KEY, token);
    } catch {}
  },
  signOut: async () => {
    if (firebaseEnabled && auth) {
      await fbSignOut(auth);
      return;
    }
    set({ token: null });
    try {
      await AsyncStorage.removeItem(DEV_KEY);
    } catch {}
  },
}));

/** Token para el backend: en Firebase es un ID token que se renueva solo (dura 1 hora). */
export async function getAuthToken(): Promise<string | null> {
  if (firebaseEnabled && auth) return (await auth.currentUser?.getIdToken()) ?? null;
  return useAuth.getState().token;
}
