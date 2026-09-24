import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Profile, Subscription, api } from '@/api/client';
import { ActionButton, Divider, Icon, Screen, SectionTitle, TopBar, styles } from '@/components/FitnessUI';
import { ThemeMode, useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { LANGUAGES, setLanguage } from '@/i18n';
import { useAuth } from '@/store/auth';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const { mode, setMode } = useTheme();
  const token = useAuth((s) => s.token);
  const [showLanguages, setShowLanguages] = useState(false);

  const profile = useQuery({ queryKey: ['profile', token], queryFn: () => api<Profile>('/me/profile') });
  const subscription = useQuery({ queryKey: ['subscription', token], queryFn: () => api<Subscription>('/me/subscription') });
  const p = profile.data;

  const initials = (p?.name?.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '·').slice(0, 2);
  const themeOptions: { value: ThemeMode; label: string; icon: 'moon' | 'sun' | 'smartphone' }[] = [
    { value: 'dark', label: t('profile.themeDark'), icon: 'moon' },
    { value: 'light', label: t('profile.themeLight'), icon: 'sun' },
    { value: 'system', label: t('profile.themeSystem'), icon: 'smartphone' },
  ];

  const sub = subscription.data;
  const subLabel =
    sub?.status === 'trial' ? t('profile.trialDays', { count: sub.days_left ?? 0 }) : sub?.status === 'active' ? t('profile.activePlan') : t('profile.noPlan');

  const settings: { key: string; label: string; detail: string; icon: keyof typeof import('@expo/vector-icons').Feather.glyphMap; onPress?: () => void }[] = [
    { key: 'data', label: t('profile.personalData'), detail: p ? `${p.name ?? '—'} · ${p.height_cm ?? '—'} cm · ${p.weight_kg ?? '—'} kg` : '—', icon: 'user', onPress: () => router.push('/edit-profile') },
    { key: 'lang', label: t('profile.language'), detail: LANGUAGES.find((l) => l.code === i18n.language)?.label ?? '', icon: 'globe', onPress: () => setShowLanguages((v) => !v) },
    { key: 'notifications', label: t('profile.notifications'), detail: t('profile.comingSoon'), icon: 'bell' },
  ];

  return (
    <Screen>
      <TopBar eyebrow={t('profile.eyebrow')} title={t('tabs.profile')} />

      <View style={[styles.profileHero, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.profileName, { color: colors.foreground }]}>{p?.name || t('profile.noName')}</Text>
          <Text style={[styles.bodyCopy, { color: colors.mutedForeground }]}>{p?.goal ? t(`goals.${p.goal}`) : ''}</Text>
        </View>
        <Pressable onPress={() => router.push('/edit-profile')}>
          <Icon name="edit-2" size={17} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <Pressable onPress={() => sub?.status !== 'active' && router.push('/subscribe')} style={[styles.subscriptionCard, { backgroundColor: colors.primary }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.primaryForeground }]}>{t('profile.planLabel')}</Text>
          <Text style={[styles.subscriptionTitle, { color: colors.primaryForeground }]}>{subLabel}</Text>
          <Text style={[styles.subscriptionBody, { color: colors.primaryForeground }]}>{t('profile.priceLine', { price: sub?.price_mxn ?? 50 })}</Text>
        </View>
        <Icon name="award" size={27} color={colors.primaryForeground} />
      </Pressable>

      <SectionTitle title={t('profile.appearance')} />
      <View style={[styles.appearanceCard, { backgroundColor: colors.card }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.exerciseName, { color: colors.foreground }]}>{t('profile.appMode')}</Text>
          <Text style={[styles.exerciseDetail, { color: colors.mutedForeground }]}>{t('profile.appModeDetail')}</Text>
        </View>
        <View style={styles.themeOptions}>
          {themeOptions.map((option) => (
            <Pressable key={option.value} onPress={() => setMode(option.value)} style={[styles.themeOption, { backgroundColor: mode === option.value ? colors.primary : colors.secondary }]}>
              <Icon name={option.icon} size={14} color={mode === option.value ? colors.primaryForeground : colors.mutedForeground} />
              <Text style={{ color: mode === option.value ? colors.primaryForeground : colors.mutedForeground, fontSize: 10, fontWeight: '700' }}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <SectionTitle title={t('profile.settings')} />
      <View style={[styles.settingsGroup, { backgroundColor: colors.card }]}>
        {settings.map((setting, index) => (
          <View key={setting.key}>
            <Pressable style={styles.settingRow} onPress={setting.onPress} disabled={!setting.onPress}>
              <View style={[styles.libraryIcon, { backgroundColor: colors.secondary }]}>
                <Icon name={setting.icon} size={17} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.exerciseName, { color: colors.foreground }]}>{setting.label}</Text>
                <Text style={[styles.exerciseDetail, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {setting.detail}
                </Text>
              </View>
              {setting.onPress ? <Icon name="chevron-right" size={18} color={colors.mutedForeground} /> : null}
            </Pressable>
            {index < settings.length - 1 ? <Divider /> : null}
            {setting.key === 'lang' && showLanguages && (
              <View style={{ paddingBottom: 10, paddingHorizontal: 13, gap: 6 }}>
                {LANGUAGES.map((l) => (
                  <Pressable key={l.code} onPress={() => setLanguage(l.code)} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
                    <Text style={{ color: i18n.language === l.code ? colors.primary : colors.foreground, fontWeight: i18n.language === l.code ? '700' : '400' }}>{l.label}</Text>
                    {i18n.language === l.code ? <Icon name="check" size={16} color={colors.primary} /> : null}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      <SectionTitle title={t('profile.account')} />
      <View style={{ gap: 10 }}>
        <ActionButton label={t('profile.export')} icon="download" secondary disabled onPress={() => {}} />
        <Pressable onPress={() => useAuth.getState().signOut()}>
          <Text style={[styles.signOut, { color: colors.destructive }]}>{t('profile.signOut')}</Text>
        </Pressable>
      </View>
      <Text style={[styles.legalText, { color: colors.mutedForeground, textAlign: 'center', marginTop: 28 }]}>{t('profile.version')}</Text>
    </Screen>
  );
}
