import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ProfileForm } from '@/components/ProfileForm';
import { Screen, styles } from '@/components/FitnessUI';
import { useColors } from '@/hooks/useColors';
import { Text } from 'react-native';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  return (
    <Screen>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>{t('onboarding.step')}</Text>
      <Text style={[styles.loginTitle, { color: colors.foreground }]}>{t('onboarding.title')}</Text>
      <Text style={[styles.bodyCopy, { color: colors.mutedForeground, marginBottom: 24 }]}>{t('onboarding.subtitle')}</Text>
      <ProfileForm onSaved={() => router.replace('/(tabs)')} />
    </Screen>
  );
}
