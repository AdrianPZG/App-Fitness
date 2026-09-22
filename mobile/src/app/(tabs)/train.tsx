import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Exercise, Plan, api } from '@/api/client';
import { Field } from '@/components/form';
import { Body, Card, Label, Screen } from '@/components/ui';
import { WorkoutCard } from '@/components/workout';
import { useAuth } from '@/store/auth';
import { font, radius, space, useColors } from '@/theme';

function ExerciseRow({ ex }: { ex: Exercise }) {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: String(ex.id) } })}
      style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
      <Image
        source={ex.images[0]}
        style={{ width: 72, height: 72, borderRadius: radius.sm, backgroundColor: c.line, opacity: ex.locked ? 0.5 : 1 }}
        contentFit="cover"
      />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: font.medium, fontSize: 16, color: c.text }} numberOfLines={2}>
          {ex.name}
        </Text>
        <Body soft style={{ fontSize: 14 }} numberOfLines={1}>
          {[ex.muscle_groups[0], ex.level].filter(Boolean).join(' · ')}
        </Body>
        {ex.locked && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Lock size={13} color={c.textSoft} strokeWidth={1.5} />
            <Text style={{ fontFamily: font.regular, fontSize: 13, color: c.textSoft }}>{t('train.locked')}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function Train() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const token = useAuth((s) => s.token);
  const [q, setQ] = useState('');
  const plan = useQuery({
    queryKey: ['plan', token, i18n.language],
    queryFn: () => api<Plan>(`/me/plan?lang=${i18n.language}`),
    retry: false,
  });
  const list = useQuery({
    queryKey: ['exercises', token, i18n.language, q],
    queryFn: () => api<Exercise[]>(`/exercises?lang=${i18n.language}&limit=40&q=${encodeURIComponent(q)}`),
  });

  return (
    <Screen title={t('train.title')}>
      <View style={{ gap: space.md }}>
        <Label>{t('plan.title')}</Label>
        {plan.isPending && <Body soft>…</Body>}
        {plan.isError && (
          <Card>
            <Body soft>{t('plan.locked')}</Body>
          </Card>
        )}
        {plan.data && (
          <>
            <Body soft>{t('plan.summary', { days: plan.data.days_per_week, level: t(`plan.level.${plan.data.level}`) })}</Body>
            {plan.data.days.map((d) => (
              <WorkoutCard key={d.day} day={d} />
            ))}
          </>
        )}
      </View>

      <Field label={t('train.library')} value={q} onChangeText={setQ} placeholder={t('train.search')} />
      <Card>
        {list.isPending && <Body soft>…</Body>}
        {list.isError && <Body soft>{t('common.error')}</Body>}
        {list.data?.map((ex, i) => (
          <View key={ex.id}>
            {i > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginVertical: space.sm }} />}
            <ExerciseRow ex={ex} />
          </View>
        ))}
      </Card>
    </Screen>
  );
}
