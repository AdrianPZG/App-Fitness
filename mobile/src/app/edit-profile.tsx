import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';

import { Profile, api } from '@/api/client';
import { Icon, Screen, styles } from '@/components/FitnessUI';
import { ProfileForm } from '@/components/ProfileForm';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/store/auth';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const token = useAuth((s) => s.token);
  const profile = useQuery({ queryKey: ['profile', token], queryFn: () => api<Profile>('/me/profile') });
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'));

  return (
    <Screen>
      <Pressable onPress={back} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon name="arrow-left" size={19} color={colors.foreground} />
        <Text style={[styles.sectionAction, { color: colors.primary }]}>{t('common.back')}</Text>
      </Pressable>
      <Text style={[styles.loginTitle, { color: colors.foreground }]}>{t('profile.editTitle')}</Text>
      {profile.data && <ProfileForm initial={profile.data} onSaved={back} />}
    </Screen>
  );
}
