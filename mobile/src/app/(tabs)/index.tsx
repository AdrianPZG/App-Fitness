import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Nutrition, Plan, Profile, api } from '@/api/client';
import { Icon, Screen, SectionTitle, TopBar, styles } from '@/components/FitnessUI';
import { Reveal } from '@/components/Motion';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/store/auth';

const WEEKDAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const KIND_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  full: 'activity',
  upper: 'activity',
  lower: 'activity',
  push: 'activity',
  pull: 'activity',
  legs: 'activity',
  cardio: 'wind',
  mobility: 'moon',
};

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const token = useAuth((s) => s.token);

  const profile = useQuery({ queryKey: ['profile', token], queryFn: () => api<Profile>('/me/profile') });
  const plan = useQuery({
    queryKey: ['plan', token, i18n.language],
    queryFn: () => api<Plan>(`/me/plan?lang=${i18n.language}`),
    retry: false,
  });
  const nutrition = useQuery({ queryKey: ['nutrition', token], queryFn: () => api<Nutrition>('/me/nutrition'), retry: false });

  const todayWeekday = (new Date().getDay() + 6) % 7; // lunes = 0
  const slot = plan.data?.weekdays.indexOf(todayWeekday) ?? -1;
  const todayDay = plan.data && slot >= 0 ? plan.data.days[slot] : null;
  const heroImage = todayDay?.exercises[0]?.exercise.images[0];
  const dateLabel = new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const name = profile.data?.name?.split(' ')[0];

  return (
    <Screen>
      <Reveal>
        <TopBar eyebrow={dateLabel} title={name ? t('today.greetingName', { name }) : t('today.greetingPlain')} />
      </Reveal>

      <Reveal delay={80}>
        <Pressable
          onPress={() => todayDay && router.push({ pathname: '/workout', params: { day: String(todayDay.day) } })}
          disabled={!todayDay}
          style={({ pressed }) => [styles.bentoHero, { backgroundColor: colors.card, opacity: pressed ? 0.9 : 1 }]}>
          {heroImage ? (
            <Image source={heroImage} style={styles.bentoHeroImage} contentFit="cover" />
          ) : (
            <LinearGradient colors={[colors.backgroundAlt, colors.background]} style={styles.bentoHeroImage} />
          )}
          <LinearGradient colors={[colors.surfaceOverlay, 'rgba(8, 7, 8, 0.42)', colors.surfaceOverlayStrong]} style={styles.bentoHeroGradient} />
          <View style={styles.bentoHeroContent}>
            <View style={styles.bentoTopline}>
              <Text style={[styles.bentoLabel, { color: colors.foreground }]}>{t('today.workoutLabel')}</Text>
              <View style={[styles.timerPlus, { backgroundColor: 'rgba(244, 239, 233, 0.16)' }]}>
                <Icon name="chevron-right" size={18} color={colors.foreground} />
              </View>
            </View>
            <View>
              <Text style={[styles.bentoHeroTitle, { color: colors.foreground }]}>
                {todayDay ? t(`plan.kind.${todayDay.kind}`) : plan.isError ? t('plan.locked') : t('today.rest')}
              </Text>
              <Text style={[styles.bentoHeroMeta, { color: colors.foreground, opacity: 0.78 }]}>
                {todayDay ? t('today.exerciseCount', { count: todayDay.exercises.length }) : ' '}
              </Text>
            </View>
          </View>
        </Pressable>
      </Reveal>

      <Reveal delay={150}>
        <View style={styles.bentoGrid}>
          <View style={[styles.activityCard, { backgroundColor: colors.contrastCard }]}>
            <View style={styles.bentoTopline}>
              <Text style={[styles.bentoLabel, { color: colors.contrastForeground }]}>{t('today.yourWeek')}</Text>
              <Icon name="calendar" size={16} color={colors.contrastForeground} />
            </View>
            <Text style={[styles.bentoCardTitle, { color: colors.contrastForeground }]}>
              {plan.data ? t('today.daysPerWeek', { count: plan.data.days_per_week }) : '—'}
            </Text>
            <View style={styles.calendarRow}>
              {WEEKDAY_LETTERS.map((letter, i) => {
                const isTrainingDay = plan.data?.weekdays.includes(i);
                const isToday = i === todayWeekday;
                return (
                  <View
                    key={i}
                    style={[
                      styles.calendarDay,
                      {
                        backgroundColor: isToday ? colors.contrastForeground : 'transparent',
                        borderWidth: isTrainingDay && !isToday ? 1 : 0,
                        borderColor: colors.contrastMuted,
                      },
                    ]}>
                    <Feather name={isTrainingDay ? 'activity' : 'moon'} size={9} color={isToday ? colors.contrastCard : colors.contrastMuted} />
                    <Text style={[styles.calendarLetter, { color: isToday ? colors.contrastCard : colors.contrastForeground }]}>{letter}</Text>
                  </View>
                );
              })}
            </View>
            <View style={[styles.bentoRule, { backgroundColor: colors.contrastMuted, opacity: 0.22 }]} />
            <View style={styles.bentoStatRow}>
              <Text style={[styles.bentoStatValue, { color: colors.contrastForeground }]}>
                {plan.data ? t(`plan.level.${plan.data.level}`) : '—'}
              </Text>
              <Text style={[styles.bentoStatLabel, { color: colors.contrastMuted }]}>{t('today.level')}</Text>
            </View>
          </View>

          <Pressable onPress={() => router.push('/(tabs)/diet')} style={[styles.timerCard, { backgroundColor: colors.card }]}>
            <View style={styles.bentoTopline}>
              <View style={[styles.timerPlus, { backgroundColor: colors.secondary }]}>
                <Icon name="pie-chart" size={15} color={colors.primary} />
              </View>
              <Icon name="chevron-right" size={15} color={colors.mutedForeground} />
            </View>
            <View style={[styles.timerCircle, { borderColor: colors.primary }]}>
              <View style={[styles.timerInnerCircle, { borderColor: colors.accent }]} />
              <Text style={[styles.timerValue, { color: colors.foreground }]}>{nutrition.data ? nutrition.data.kcal : '—'}</Text>
              <Text style={[styles.timerCaption, { color: colors.mutedForeground }]}>{t('today.kcalGoal')}</Text>
            </View>
          </Pressable>
        </View>
      </Reveal>

      {todayDay && (
        <Reveal delay={220}>
          <SectionTitle title={t('today.sessionTitle')} action={t('today.viewPlan')} onAction={() => router.push('/(tabs)/routines')} />
          <View style={[styles.sessionList, { backgroundColor: colors.card }]}>
            {todayDay.exercises.slice(0, 4).map((item, index) => (
              <Pressable
                key={`${item.exercise.id}-${index}`}
                onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: String(item.exercise.id) } })}
                style={({ pressed }) => [
                  styles.sessionRow,
                  { borderBottomWidth: index < 3 ? 1 : 0, borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 },
                ]}>
                <View style={[styles.sessionIndex, { backgroundColor: colors.secondary }]}>
                  <Icon name={KIND_ICON[todayDay.kind] ?? 'activity'} size={15} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sessionName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.exercise.name}
                  </Text>
                  <Text style={[styles.sessionMeta, { color: colors.mutedForeground }]}>
                    {item.reps ? `${item.sets} × ${item.reps}` : `${item.sets} × ${item.seconds}s`}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Reveal>
      )}
    </Screen>
  );
}
