import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { DepthOrb } from '@/components/DepthOrb';
import { ActionButton, Icon, Screen, styles } from '@/components/FitnessUI';
import { useColors } from '@/hooks/useColors';
import { auth, firebaseEnabled } from '@/lib/firebase';
import { useAuth } from '@/store/auth';

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

export default function LoginScreen() {
  const { t } = useTranslation();
  const colors = useColors();
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

  const inputStyle = { borderColor: colors.input, color: colors.foreground, backgroundColor: colors.card };

  return (
    <Screen scroll={false}>
      <LinearGradient colors={[colors.background, colors.backgroundAlt, colors.background]} style={StyleSheet.absoluteFill} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={[styles.loginMark, { backgroundColor: colors.primary, marginBottom: 0 }]}>
          <Icon name="activity" size={24} color={colors.primaryForeground} />
        </View>
        <Text style={{ fontSize: 10, letterSpacing: 1.6, fontWeight: '700', color: colors.mutedForeground }}>FITNESS / 01</Text>
      </View>
      <View style={{ height: 210, alignItems: 'center', justifyContent: 'center' }}>
        <DepthOrb size={175} label={mode === 'signup' ? 'START' : 'RESET'} />
      </View>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{t('auth.eyebrow')}</Text>
        <Text style={[styles.loginTitle, { color: colors.foreground }]}>{mode === 'signup' ? t('auth.createAccount') : t('auth.welcome')}</Text>
        <Text style={[styles.bodyCopy, { color: colors.mutedForeground, maxWidth: 310 }]}>{t('auth.subtitle')}</Text>

        <View style={{ gap: 10, marginTop: 24 }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.email')}
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={[styles.input, inputStyle]}
          />
          {firebaseEnabled && (
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.passwordHint')}
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              autoCapitalize="none"
              style={[styles.input, inputStyle]}
            />
          )}
          {message && <Text style={{ fontSize: 13, color: message.error ? colors.destructive : colors.primary }}>{message.text}</Text>}
          <ActionButton label={mode === 'signup' ? t('auth.createAccount') : t('auth.signIn')} disabled={!canSubmit} icon="arrow-right" onPress={submit} />
        </View>

        {firebaseEnabled && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
            <Pressable
              onPress={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setMessage(null);
              }}>
              <Text style={[styles.sectionAction, { color: colors.primary }]}>{mode === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}</Text>
            </Pressable>
            {mode === 'signin' && (
              <Pressable onPress={resetPassword}>
                <Text style={[styles.legalText, { color: colors.mutedForeground }]}>{t('auth.forgot')}</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.loginDivider}>
          <View style={[styles.loginLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.legalText, { color: colors.mutedForeground }]}>{t('common.or')}</Text>
          <View style={[styles.loginLine, { backgroundColor: colors.border }]} />
        </View>
        <View style={{ gap: 10 }}>
          <ActionButton label={t('auth.phone')} icon="smartphone" secondary disabled onPress={() => {}} />
          <ActionButton label={t('auth.google')} icon="globe" secondary disabled onPress={() => {}} />
        </View>
        <Text style={[styles.legalText, { color: colors.mutedForeground, textAlign: 'center', marginTop: 16 }]}>
          {firebaseEnabled ? t('auth.nativeNote') : t('auth.devNote')}
        </Text>
      </View>
    </Screen>
  );
}
