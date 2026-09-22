import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { Platform } from 'react-native';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/** Sin configuración de Firebase la app usa el login de desarrollo. */
export const firebaseEnabled = !!(config.apiKey && config.projectId && config.appId);

function createAuth() {
  const app = getApps().length ? getApp() : initializeApp(config);
  if (Platform.OS === 'web') return FirebaseAuth.getAuth(app);
  // getReactNativePersistence solo existe en el build nativo de firebase/auth (sin tipos en el build web).
  const { getReactNativePersistence } = FirebaseAuth as unknown as {
    getReactNativePersistence: (s: typeof AsyncStorage) => FirebaseAuth.Persistence;
  };
  try {
    return FirebaseAuth.initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return FirebaseAuth.getAuth(app); // recarga en caliente: ya estaba inicializado
  }
}

export const auth = firebaseEnabled ? createAuth() : null;
