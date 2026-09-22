import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Recipe, api } from '@/api/client';
import { Body, Card, Label, Row, Screen } from '@/components/ui';
import { useAuth } from '@/store/auth';
import { font, space, useColors } from '@/theme';

export default function RecipeDetail() {
  const { id, portion } = useLocalSearchParams<{ id: string; portion?: string }>();
  const { t, i18n } = useTranslation();
  const c = useColors();
  const token = useAuth((s) => s.token);
  const q = useQuery({
    queryKey: ['recipe', token, id, portion, i18n.language],
    queryFn: () => api<Recipe>(`/recipes/${id}?lang=${i18n.language}&portion=${portion ?? 1}`),
  });
  const r = q.data;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Screen title={r?.title ?? '…'} onBack={back}>
      {q.isError && <Body soft>{t('common.error')}</Body>}
      {r && (
        <>
          <Card>
            <Row label={t('recipe.calories')} value={`${r.kcal} kcal`} />
            <Row label={t('nutrition.protein')} value={`${r.protein_g} g`} />
            <Row label={t('nutrition.carbs')} value={`${r.carbs_g} g`} />
            <Row label={t('nutrition.fat')} value={`${r.fat_g} g`} />
            <Row label={t('recipe.time')} value={`${r.prep_min} min`} />
            <Row label={t('recipe.portion')} value={`× ${r.portion}`} />
          </Card>
          <View style={{ gap: space.sm }}>
            <Label>{t('recipe.ingredients')}</Label>
            <Card>
              {r.ingredients.map((i) => (
                <Row key={i.name} label={i.name} value={`${i.grams} g`} />
              ))}
            </Card>
          </View>
          <View style={{ gap: space.md }}>
            <Label>{t('recipe.steps')}</Label>
            {r.steps.map((step, n) => (
              <View key={n} style={{ flexDirection: 'row', gap: space.md }}>
                <Text style={{ fontFamily: font.semibold, fontSize: 16, color: c.accent, width: 22 }}>{n + 1}</Text>
                <Body style={{ flex: 1 }}>{step}</Body>
              </View>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
