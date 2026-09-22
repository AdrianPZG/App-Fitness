import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Exercise, api } from '@/api/client';
import { Body, Card, Label, Row, Screen } from '@/components/ui';
import { useAuth } from '@/store/auth';
import { font, radius, space, useColors } from '@/theme';

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const c = useColors();
  const token = useAuth((s) => s.token);
  const q = useQuery({
    queryKey: ['exercise', token, id, i18n.language],
    queryFn: () => api<Exercise>(`/exercises/${id}?lang=${i18n.language}`),
  });
  const ex = q.data;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const label = (group: string, key: string | null) => (key ? t(`${group}.${key}`, { defaultValue: key }) : '—');

  return (
    <Screen title={ex?.name ?? '…'} onBack={back}>
      {q.isError && <Body soft>{t('common.error')}</Body>}
      {ex && (
        <>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {ex.images.map((uri) => (
              <Image
                key={uri}
                source={uri}
                style={{ flex: 1, aspectRatio: 1.5, borderRadius: radius.md, backgroundColor: c.line }}
                contentFit="cover"
              />
            ))}
          </View>
          <Card>
            <Row label={t('exercise.muscle')} value={label('muscle', ex.muscle_groups[0] ?? null)} />
            <Row label={t('exercise.equipment')} value={label('equipment', ex.equipment)} />
            <Row label={t('exercise.level')} value={label('level', ex.level)} />
          </Card>
          {ex.locked ? (
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <Lock size={16} color={c.textSoft} strokeWidth={1.5} />
                <Body soft style={{ flex: 1 }}>
                  {t('exercise.lockedInfo')}
                </Body>
              </View>
            </Card>
          ) : (
            <View style={{ gap: space.md }}>
              <Label>{t('exercise.steps')}</Label>
              {ex.instructions.map((step, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: space.md }}>
                  <Text style={{ fontFamily: font.semibold, fontSize: 16, color: c.accent, width: 22 }}>{i + 1}</Text>
                  <Body style={{ flex: 1 }}>{step}</Body>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
