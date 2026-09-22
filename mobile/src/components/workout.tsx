import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PlanDay } from '@/api/client';
import { font, radius, space, useColors } from '@/theme';

import { Body, Card, Label } from './ui';

export function WorkoutCard({ day, heading }: { day: PlanDay; heading?: string }) {
  const { t } = useTranslation();
  const c = useColors();
  return (
    <Card>
      <Label>{heading ?? `${t('plan.day', { n: day.day })} · ${t(`plan.kind.${day.kind}`)}`}</Label>
      {day.exercises.map((item, i) => {
        const dose = item.reps ? `${item.sets} × ${item.reps}` : `${item.sets} × ${item.seconds}s`;
        return (
          <View key={`${item.exercise.id}-${i}`}>
            {i > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.line, marginVertical: space.sm }} />}
            <Pressable
              onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: String(item.exercise.id) } })}
              style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
              <Image
                source={item.exercise.images[0]}
                style={{ width: 56, height: 56, borderRadius: radius.sm, backgroundColor: c.line }}
                contentFit="cover"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.medium, fontSize: 15, color: c.text }} numberOfLines={2}>
                  {item.exercise.name}
                </Text>
                <Body soft style={{ fontSize: 13 }}>
                  {dose} · {t('plan.rest', { s: item.rest_s })}
                </Body>
              </View>
            </Pressable>
          </View>
        );
      })}
    </Card>
  );
}
