import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Plan, api } from '@/api/client';
import { ActionButton, Icon, ProgressRing, Screen, StatPill, styles } from '@/components/FitnessUI';
import { Reveal } from '@/components/Motion';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/store/auth';
import { useWorkoutLog } from '@/store/workoutLog';

export default function WorkoutScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const token = useAuth((s) => s.token);
  const { done, toggle } = useWorkoutLog();

  const plan = useQuery({ queryKey: ['plan', token, i18n.language], queryFn: () => api<Plan>(`/me/plan?lang=${i18n.language}`) });
  const dayNumber = Number(day);
  const session = plan.data?.days.find((d) => d.day === dayNumber);

  const muscles = useMemo(() => {
    const set = new Set<string>();
    session?.exercises.forEach((item) => item.exercise.muscle_groups.forEach((m) => set.add(m)));
    return Array.from(set).slice(0, 6);
  }, [session]);

  const heroImage = session?.exercises[0]?.exercise.images[0];
  const keyOf = (index: number) => `${dayNumber}-${session?.exercises[index].exercise.id}-${index}`;
  const completedCount = session ? session.exercises.filter((_, i) => done(keyOf(i))).length : 0;
  const progress = session && session.exercises.length ? completedCount / session.exercises.length : 0;
  const estMinutes = session ? session.exercises.length * 4 : 0;

  return (
    <Screen>
      <View style={styles.detailHeader}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, opacity: pressed ? 0.65 : 1 }]}>
          <Icon name="arrow-left" size={19} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>{t('workout.eyebrow')}</Text>
          <Text style={[styles.detailTitle, { color: colors.foreground }]}>{session ? t(`plan.kind.${session.kind}`) : '—'}</Text>
        </View>
      </View>

      {session && (
        <>
          <Reveal>
            <View style={styles.workoutHero}>
              {heroImage ? (
                <Image source={heroImage} style={styles.workoutHeroImage} contentFit="cover" />
              ) : (
                <LinearGradient colors={[colors.backgroundAlt, colors.background]} style={styles.workoutHeroImage} />
              )}
              <LinearGradient colors={[colors.surfaceOverlay, colors.surfaceOverlayStrong]} style={styles.workoutHeroGradient} />
              <View style={styles.workoutHeroCopy}>
                <View style={styles.workoutTag}>
                  <Text style={[styles.workoutTagText, { color: colors.primaryForeground }]}>{t(`plan.kind.${session.kind}`).toUpperCase()}</Text>
                </View>
                <Text style={[styles.workoutHeroTitle, { color: colors.foreground }]}>{t('workout.heroTitle', { n: session.day })}</Text>
              </View>
            </View>
          </Reveal>

          <Reveal delay={90}>
            <View style={styles.workoutMetricStrip}>
              <StatPill icon="clock" label={t('workout.duration')} value={t('workout.minutes', { count: estMinutes })} />
              <StatPill icon="activity" label={t('workout.level')} value={t(`plan.level.${plan.data?.level}`)} tone="amber" />
              <StatPill icon="target" label={t('workout.goal')} value={t(`goals.${plan.data?.goal}`)} tone="muted" />
            </View>
          </Reveal>

          <Reveal delay={150}>
            <View style={[styles.workoutProgressCard, { backgroundColor: colors.card }]}>
              <ProgressRing progress={progress} label={t('workout.progress')} value={`${Math.round(progress * 100)}%`} detail={t('workout.exercisesOf', { done: completedCount, total: session.exercises.length })} size={104} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardEyebrow, { color: colors.primary }]}>{t('workout.focusToday')}</Text>
                <Text style={[styles.workoutSectionTitle, { color: colors.foreground }]}>{t('workout.focusTip')}</Text>
                <Text style={[styles.noticeBody, { color: colors.mutedForeground }]}>{t('workout.restTip')}</Text>
              </View>
            </View>
          </Reveal>

          {muscles.length > 0 && (
            <Reveal delay={210}>
              <Text style={[styles.workoutSectionTitle, { color: colors.foreground, marginTop: 24, marginBottom: 10 }]}>{t('workout.targetMuscles')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {muscles.map((muscle, index) => (
                  <View key={muscle} style={[styles.muscleChip, { backgroundColor: index === 0 ? colors.secondary : colors.card, borderColor: index === 0 ? colors.primary : colors.border }]}>
                    <View style={[styles.muscleDot, { backgroundColor: index === 0 ? colors.primary : colors.accent }]} />
                    <Text style={[styles.muscleChipText, { color: colors.foreground }]}>{t(`muscle.${muscle}`, { defaultValue: muscle })}</Text>
                  </View>
                ))}
              </ScrollView>
            </Reveal>
          )}

          <Reveal delay={270}>
            <View style={styles.workoutListHeader}>
              <Text style={[styles.workoutSectionTitle, { color: colors.foreground }]}>{t('workout.includedExercises')}</Text>
              <Text style={[styles.sectionAction, { color: colors.primary }]}>
                {completedCount}/{session.exercises.length}
              </Text>
            </View>
            <View style={{ gap: 8 }}>
              {session.exercises.map((item, index) => {
                const key = keyOf(index);
                const isDone = done(key);
                return (
                  <Pressable
                    key={key}
                    onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: String(item.exercise.id) } })}
                    style={({ pressed }) => [styles.workoutExerciseRow, { backgroundColor: colors.card, borderColor: isDone ? colors.primary : colors.border, opacity: pressed ? 0.75 : 1 }]}>
                    <View style={[styles.exerciseNumber, { backgroundColor: isDone ? colors.primary : colors.secondary }]}>
                      <Text style={[styles.exerciseNumberText, { color: isDone ? colors.primaryForeground : colors.primary }]}>{String(index + 1).padStart(2, '0')}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.exerciseName, { color: isDone ? colors.mutedForeground : colors.foreground, textDecorationLine: isDone ? 'line-through' : 'none' }]} numberOfLines={1}>
                        {item.exercise.name}
                      </Text>
                      <Text style={[styles.exerciseDetail, { color: colors.mutedForeground }]}>{item.reps ? `${item.sets} × ${item.reps}` : `${item.sets} × ${item.seconds}s`}</Text>
                    </View>
                    <Pressable
                      onPress={() => toggle(key)}
                      style={[styles.exerciseCheck, { borderColor: isDone ? colors.primary : colors.border, backgroundColor: isDone ? colors.primary : 'transparent' }]}>
                      {isDone ? <Icon name="check" size={14} color={colors.primaryForeground} /> : <Icon name="plus" size={14} color={colors.mutedForeground} />}
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </Reveal>

          <View style={{ marginTop: 20 }}>
            <ActionButton label={t('workout.markStart')} icon="play" onPress={() => router.push('/(tabs)/routines')} />
          </View>
          <Text style={[styles.legalText, { color: colors.mutedForeground, textAlign: 'center', marginTop: 11 }]}>{t('workout.tapHint')}</Text>
        </>
      )}
    </Screen>
  );
}
