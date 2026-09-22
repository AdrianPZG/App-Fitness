import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';

import { Profile, api, isComplete } from '@/api/client';
import i18n, { loadLanguage } from '@/i18n';
import { useAuth } from '@/store/auth';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

function Routes() {
  const token = useAuth((s) => s.token);
  const profile = useQuery({ queryKey: ['profile', token], queryFn: () => api<Profile>('/me/profile'), enabled: !!token });
  const p = profile.data;
  const complete = isComplete(p);

  // Con sesión iniciada esperamos el perfil para saber si falta el onboarding.
  if (token && profile.isPending) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!!token && !complete}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!!token && complete}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="exercise/[id]" />
        <Stack.Screen name="recipe/[id]" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  const [langReady, setLangReady] = useState(false);
  const authReady = useAuth((s) => s.ready);

  useEffect(() => {
    loadLanguage().finally(() => setLangReady(true));
    useAuth.getState().load();
  }, []);

  useEffect(() => {
    if (fontsLoaded && langReady && authReady) SplashScreen.hideAsync();
  }, [fontsLoaded, langReady, authReady]);

  if (!fontsLoaded || !langReady || !authReady) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Routes />
      </QueryClientProvider>
    </I18nextProvider>
  );
}
