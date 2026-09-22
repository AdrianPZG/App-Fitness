import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { Mail, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Button, Field } from '@/components/form';
import { Body, Screen } from '@/components/ui';
import { auth, firebaseEnabled } from '@/lib/firebase';
import { useAuth } from '@/store/auth';
import { font, space, useColors } from '@/theme';

/** Traduce el código de error de Firebase a una clave de texto. */
function errorKey(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(code)) return 'invalidCredentials';
  if (code === 'auth/email-already-in-use') return 'emailInUse';
  if (code === 'auth/weak-password') return 'weakPassword';
  if (code === 'auth/too-many-requests') return 'tooManyRequests';
  if (code === 'auth/network-request-failed') return 'network';
  return 'generic';
}

export default function Login() {
  const { t } = useTranslation();
  const c = useColors();
  const signInDev = useAuth((s) => s.signInDev);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());
  const canSubmit = validEmail && (!firebaseEnabled || password.length >= 6) && !busy;

  async function submit() {
    setMessage(null);
    if (!firebaseEnabled || !auth) return signInDev(email.trim().toLowerCase());
    setBusy(true);
    try {
      if (mode === 'signup') await createUserWithEmailAndPassword(auth, email.trim(), password);
      else await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged actualiza la sesión y el layout cambia de pantalla solo.
    } catch (e) {
      setMessage({ text: t(`auth.error.${errorKey(e)}`), error: true });
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!validEmail || !auth) return setMessage({ text: t('auth.error.enterEmail'), error: true });
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {} // no revelamos si el correo existe
    setMessage({ text: t('auth.resetSent'), error: false });
  }

  return (
    <Screen title={mode === 'signup' ? t('auth.createAccount') : t('auth.welcome')}>
      <Body soft>{t('auth.subtitle')}</Body>
      <View style={{ gap: space.md }}>
        <Field
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          placeholder="nombre@correo.com"
        />
        {firebaseEnabled && (
          <Field
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            placeholder={t('auth.passwordHint')}
          />
        )}
        {message && (
          <Text style={{ fontFamily: font.regular, fontSize: 14, color: message.error ? c.alert : c.accent }}>{message.text}</Text>
        )}
        <Button
          title={mode === 'signup' ? t('auth.createAccount') : t('auth.signIn')}
          disabled={!canSubmit}
          icon={<Mail size={18} color={c.onAccent} strokeWidth={1.5} />}
          onPress={submit}
        />
        {firebaseEnabled && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(null); }}>
              <Text style={{ fontFamily: font.medium, fontSize: 14, color: c.accent }}>
                {mode === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}
              </Text>
            </Pressable>
            {mode === 'signin' && (
              <Pressable onPress={resetPassword}>
                <Text style={{ fontFamily: font.regular, fontSize: 14, color: c.textSoft }}>{t('auth.forgot')}</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
      <View style={{ gap: space.sm }}>
        <Button variant="secondary" disabled title={t('auth.phone')} icon={<Phone size={18} color={c.text} strokeWidth={1.5} />} />
        <Button variant="secondary" disabled title={t('auth.google')} />
        <Text style={{ fontFamily: font.regular, fontSize: 13, color: c.textSoft }}>
          {firebaseEnabled ? t('auth.nativeNote') : t('auth.devNote')}
        </Text>
      </View>
    </Screen>
  );
}
