import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

import { Profile, api, isComplete } from '@/api/client';
import { DepthOrb } from '@/components/DepthOrb';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { styles } from '@/components/FitnessUI';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import i18n, { loadLanguage } from '@/i18n';
import { useAuth } from '@/store/auth';
import { useWorkoutLog } from '@/store/workoutLog';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

function Splash() {
  const colors = useColors();
  return (
    <View style={[styles.entryScreen, { flex: 1, backgroundColor: colors.background }]}>
      <DepthOrb size={220} label="FITNESS" />
      <Text style={[styles.entryTitle, { color: colors.foreground }]}>Muévete con intención.</Text>
    </View>
  );
}

function Routes() {
  const token = useAuth((s) => s.token);
  const { isDark } = useTheme();
  const profile = useQuery({ queryKey: ['profile', token], queryFn: () => api<Profile>('/me/profile'), enabled: !!token });
  const p = profile.data;
  const complete = isComplete(p);

  // Con sesión iniciada esperamos el perfil para saber si falta el onboarding.
  if (token && profile.isPending) return <Splash />;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!token}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Protected guard={!!token && !complete}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={!!token && complete}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="workout" options={{ presentation: 'card' }} />
          <Stack.Screen name="exercise/[id]" />
          <Stack.Screen name="recipe/[id]" />
          <Stack.Screen name="subscribe" options={{ presentation: 'modal' }} />
          <Stack.Screen name="edit-profile" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [langReady, setLangReady] = useState(false);
  const authReady = useAuth((s) => s.ready);

  useEffect(() => {
    loadLanguage().finally(() => setLangReady(true));
    useAuth.getState().load();
    useWorkoutLog.getState().load();
  }, []);

  useEffect(() => {
    if (fontsLoaded && langReady && authReady) SplashScreen.hideAsync();
  }, [fontsLoaded, langReady, authReady]);

  if (!fontsLoaded || !langReady || !authReady) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <I18nextProvider i18n={i18n}>
                  <Routes />
                </I18nextProvider>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
