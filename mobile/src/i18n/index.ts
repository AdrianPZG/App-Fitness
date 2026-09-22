import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';

export const LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];
const STORAGE_KEY = 'app.language';
const supported: string[] = LANGUAGES.map((l) => l.code);

// Español por defecto, inglés como respaldo; pt/fr/de caen a es -> en si falta una clave.
i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    pt: { translation: pt },
    fr: { translation: fr },
    de: { translation: de },
  },
  lng: 'es',
  fallbackLng: { default: ['es', 'en'], en: ['es'] },
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

/** Idioma guardado > idioma del dispositivo (si lo soportamos) > español. */
export async function loadLanguage(): Promise<void> {
  let code: string | null = null;
  try {
    code = await AsyncStorage.getItem(STORAGE_KEY);
  } catch {}
  if (!code || !supported.includes(code)) {
    const device = getLocales()[0]?.languageCode ?? 'es';
    code = supported.includes(device) ? device : 'es';
  }
  await i18n.changeLanguage(code);
}

export async function setLanguage(code: LanguageCode): Promise<void> {
  await i18n.changeLanguage(code);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, code);
  } catch {}
}

export default i18n;
