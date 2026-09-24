import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Exercise, Plan, api } from '@/api/client';
import { Icon, ActionButton, Screen, SectionTitle, TopBar, styles } from '@/components/FitnessUI';
import { Reveal } from '@/components/Motion';
import { useColors } from '@/hooks/useColors';
import { useWorkoutLog } from '@/store/workoutLog';
import { useAuth } from '@/store/auth';

export default function RoutinesScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const token = useAuth((s) => s.token);
  const { done, toggle } = useWorkoutLog();
  const [q, setQ] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);

  const plan = useQuery({
    queryKey: ['plan', token, i18n.language],
    queryFn: () => api<Plan>(`/me/plan?lang=${i18n.language}`),
    retry: false,
  });
  const library = useQuery({
    queryKey: ['exercises', token, i18n.language, q],
    queryFn: () => api<Exercise[]>(`/exercises?lang=${i18n.language}&limit=30&q=${encodeURIComponent(q)}`),
  });

  const day = plan.data?.days[selectedDay];
  const anyLocked = useMemo(() => library.data?.some((e) => e.locked) ?? false, [library.data]);

  return (
    <Screen>
      <Reveal>
        <TopBar eyebrow={t('routines.eyebrow')} title={t('tabs.routines')} />
      </Reveal>

      {plan.isError && (
        <Reveal>
          <View style={[styles.lockedBanner, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
            <Icon name="lock" size={17} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.noticeTitle, { color: colors.foreground }]}>{t('plan.title')}</Text>
              <Text style={[styles.noticeBody, { color: colors.mutedForeground }]}>{t('plan.locked')}</Text>
            </View>
            <ActionButton label={t('subscribe.cta')} onPress={() => router.push('/subscribe')} />
          </View>
        </Reveal>
      )}

      {plan.data && (
        <>
          <Reveal delay={50}>
            <View style={styles.programHeader}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.primary }]}>{t('routines.yourProgram')}</Text>
                <Text style={[styles.programTitle, { color: colors.foreground }]}>{t(`plan.level.${plan.data.level}`)}</Text>
              </View>
              <Text style={[styles.programCount, { color: colors.mutedForeground }]}>
                {String(selectedDay + 1).padStart(2, '0')} / {String(plan.data.days.length).padStart(2, '0')}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {plan.data.days.map((d, index) => {
                const selected = index === selectedDay;
                return (
                  <Pressable
                    key={d.day}
                    onPress={() => setSelectedDay(index)}
                    style={({ pressed }) => [
                      styles.programCard,
                      { backgroundColor: selected ? colors.primary : colors.card, borderColor: selected ? colors.primary : colors.border, opacity: pressed ? 0.82 : 1 },
                    ]}>
                    <View style={[styles.programMarker, { backgroundColor: selected ? colors.primaryForeground : colors.accent }]} />
                    <Text style={[styles.programTone, { color: selected ? colors.primaryForeground : colors.primary }]}>{t('routines.day', { n: d.day })}</Text>
                    <Text style={[styles.programName, { color: selected ? colors.primaryForeground : colors.foreground }]}>{t(`plan.kind.${d.kind}`)}</Text>
                    <Text style={[styles.programDetail, { color: selected ? colors.primaryForeground : colors.mutedForeground }]}>
                      {t('routines.exerciseCount', { count: d.exercises.length })}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Reveal>

          {day && (
            <Reveal delay={110}>
              <SectionTitle title={t('routines.day', { n: day.day })} action={t('routines.startSession')} onAction={() => router.push({ pathname: '/workout', params: { day: String(day.day) } })} />
              <View style={{ gap: 8 }}>
                {day.exercises.map((item, index) => {
                  const key = `${day.day}-${item.exercise.id}-${index}`;
                  const isDone = done(key);
                  return (
                    <Pressable
                      key={key}
                      onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: String(item.exercise.id) } })}
                      onLongPress={() => toggle(key)}
                      style={({ pressed }) => [styles.exerciseRow, { backgroundColor: colors.card, opacity: pressed ? 0.72 : 1 }]}>
                      <Pressable
                        onPress={() => toggle(key)}
                        style={[styles.exerciseCheck, { borderColor: isDone ? colors.primary : colors.border, backgroundColor: isDone ? colors.primary : 'transparent' }]}>
                        {isDone ? <Icon name="check" size={14} color={colors.primaryForeground} /> : null}
                      </Pressable>
                      <Image source={item.exercise.images[0]} style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: colors.muted }} contentFit="cover" />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.exerciseName, { color: isDone ? colors.mutedForeground : colors.foreground, textDecorationLine: isDone ? 'line-through' : 'none' }]}
                          numberOfLines={1}>
                          {item.exercise.name}
                        </Text>
                        <Text style={[styles.exerciseDetail, { color: colors.mutedForeground }]}>
                          {item.reps ? `${item.sets} × ${item.reps}` : `${item.sets} × ${item.seconds}s`}
                        </Text>
                      </View>
                      <Icon name="chevron-right" size={18} color={colors.mutedForeground} />
                    </Pressable>
                  );
                })}
              </View>
            </Reveal>
          )}
        </>
      )}

      <SectionTitle title={t('routines.library')} />
      <View style={{ marginBottom: 10 }}>
        <SearchField value={q} onChangeText={setQ} placeholder={t('train.search')} />
      </View>
      <View style={{ gap: 8 }}>
        {library.data?.slice(0, 12).map((ex) => (
          <Pressable
            key={ex.id}
            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: String(ex.id) } })}
            style={({ pressed }) => [styles.libraryRow, { backgroundColor: colors.card, opacity: pressed ? 0.75 : 1 }]}>
            <Image source={ex.images[0]} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.muted, opacity: ex.locked ? 0.5 : 1 }} contentFit="cover" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.exerciseName, { color: colors.foreground }]} numberOfLines={1}>
                {ex.name}
              </Text>
              <Text style={[styles.exerciseDetail, { color: colors.mutedForeground }]} numberOfLines={1}>
                {[ex.muscle_groups[0], ex.level].filter(Boolean).join(' · ')}
              </Text>
            </View>
            {ex.locked ? <Icon name="lock" size={15} color={colors.mutedForeground} /> : <Icon name="chevron-right" size={18} color={colors.mutedForeground} />}
          </Pressable>
        ))}
      </View>

      {anyLocked && (
        <View style={[styles.lockedBanner, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
          <Icon name="lock" size={17} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.noticeTitle, { color: colors.foreground }]}>{t('train.locked')}</Text>
            <Text style={[styles.noticeBody, { color: colors.mutedForeground }]}>{t('routines.unlockBody')}</Text>
          </View>
          <ActionButton label={t('routines.unlock')} onPress={() => router.push('/subscribe')} />
        </View>
      )}

      <Text style={[styles.legalText, { color: colors.mutedForeground, marginTop: 14 }]}>{t('routines.attribution')}</Text>
    </Screen>
  );
}

function SearchField({ value, onChangeText, placeholder }: { value: string; onChangeText: (v: string) => void; placeholder: string }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: colors.radius, paddingHorizontal: 14, height: 46 }}>
      <Icon name="search" size={16} color={colors.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        style={{ flex: 1, color: colors.foreground, fontSize: 14 }}
      />
    </View>
  );
}
