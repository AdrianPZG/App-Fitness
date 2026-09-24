import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Exercise, api } from '@/api/client';
import { Icon, Screen, styles } from '@/components/FitnessUI';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/store/auth';

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const token = useAuth((s) => s.token);
  const q = useQuery({
    queryKey: ['exercise', token, id, i18n.language],
    queryFn: () => api<Exercise>(`/exercises/${id}?lang=${i18n.language}`),
  });
  const ex = q.data;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const label = (group: string, key: string | null) => (key ? t(`${group}.${key}`, { defaultValue: key }) : '—');

  return (
    <Screen>
      <View style={styles.detailHeader}>
        <Pressable onPress={back} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, opacity: pressed ? 0.65 : 1 }]}>
          <Icon name="arrow-left" size={19} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>{t('exercise.eyebrow')}</Text>
          <Text style={[styles.detailTitle, { color: colors.foreground }]} numberOfLines={2}>
            {ex?.name ?? '…'}
          </Text>
        </View>
      </View>

      {q.isError && <Text style={[styles.bodyCopy, { color: colors.mutedForeground }]}>{t('common.error')}</Text>}

      {ex && (
        <>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {ex.images.map((uri) => (
              <Image key={uri} source={uri} style={{ flex: 1, aspectRatio: 1.3, borderRadius: 16, backgroundColor: colors.muted }} contentFit="cover" />
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            <View style={[styles.macroCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>{t('exercise.muscle')}</Text>
              <Text style={[styles.exerciseName, { color: colors.foreground, marginTop: 4 }]}>{label('muscle', ex.muscle_groups[0] ?? null)}</Text>
            </View>
            <View style={[styles.macroCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>{t('exercise.equipment')}</Text>
              <Text style={[styles.exerciseName, { color: colors.foreground, marginTop: 4 }]}>{label('equipment', ex.equipment)}</Text>
            </View>
            <View style={[styles.macroCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>{t('exercise.level')}</Text>
              <Text style={[styles.exerciseName, { color: colors.foreground, marginTop: 4 }]}>{label('level', ex.level)}</Text>
            </View>
          </View>

          {ex.locked ? (
            <View style={[styles.lockedBanner, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
              <Icon name="lock" size={17} color={colors.accent} />
              <Text style={[styles.noticeBody, { color: colors.mutedForeground, flex: 1 }]}>{t('exercise.lockedInfo')}</Text>
            </View>
          ) : (
            <View style={{ marginTop: 22, gap: 14 }}>
              <Text style={[styles.sectionHeading, { color: colors.foreground }]}>{t('exercise.steps')}</Text>
              {ex.instructions.map((step, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                  <Text style={{ fontWeight: '700', fontSize: 15, color: colors.primary, width: 20 }}>{i + 1}</Text>
                  <Text style={[styles.bodyCopy, { color: colors.foreground, flex: 1 }]}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}
