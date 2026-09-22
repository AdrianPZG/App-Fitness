import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Macros, Menu, Nutrition as NutritionData, api } from '@/api/client';
import { Body, Card, Label, Row, Screen } from '@/components/ui';
import { useAuth } from '@/store/auth';
import { font, space, useColors } from '@/theme';

function MacroLine({ m }: { m: Macros }) {
  const { t } = useTranslation();
  return (
    <Body soft style={{ fontSize: 14 }}>
      {t('nutrition.macroLine', { p: m.protein_g, c: m.carbs_g, f: m.fat_g })}
    </Body>
  );
}

function Chip({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: active ? 1.5 : 1,
        borderColor: active ? c.accent : c.line,
        backgroundColor: c.surface,
      }}>
      <Text style={{ fontFamily: active ? font.semibold : font.regular, fontSize: 14, color: active ? c.accent : c.text }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function Nutrition() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const token = useAuth((s) => s.token);
  const [variant, setVariant] = useState(0);
  const [vegetarian, setVegetarian] = useState(false);
  const q = useQuery({ queryKey: ['nutrition', token], queryFn: () => api<NutritionData>('/me/nutrition'), retry: false });
  const n = q.data;
  const menu = useQuery({
    queryKey: ['menu', token, i18n.language, variant, vegetarian],
    queryFn: () => api<Menu>(`/me/menu?lang=${i18n.language}&variant=${variant}${vegetarian ? '&diet=vegetarian' : ''}`),
    retry: false,
    enabled: !!n,
  });

  return (
    <Screen title={t('nutrition.title')}>
      {q.isPending && <Body soft>…</Body>}
      {q.isError && (
        <Card>
          <Body soft>{t('plan.locked')}</Body>
        </Card>
      )}
      {n && (
        <>
          {n.warnings.map((w) => (
            <Card key={w}>
              <Body style={{ color: c.alert }}>{t(`nutrition.warning.${w}`)}</Body>
            </Card>
          ))}
          <Card>
            <Label>{t('nutrition.daily')}</Label>
            <Text style={{ fontFamily: font.semibold, fontSize: 40, color: c.text }}>
              {n.kcal} <Text style={{ fontSize: 16, color: c.textSoft }}>kcal</Text>
            </Text>
            <MacroLine m={n} />
          </Card>

          <View style={{ gap: space.md }}>
            <Label>{t('nutrition.menuToday')}</Label>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Chip label={t('nutrition.otherOptions')} onPress={() => setVariant((v) => v + 1)} />
              <Chip label={t('nutrition.vegetarian')} active={vegetarian} onPress={() => setVegetarian((v) => !v)} />
            </View>
            {menu.data?.meals.map((m) => (
              <Pressable
                key={m.meal}
                onPress={() =>
                  router.push({ pathname: '/recipe/[id]', params: { id: String(m.recipe.id), portion: String(m.recipe.portion) } })
                }>
                <Card>
                  <Label>{t(`nutrition.meal.${m.meal}`)}</Label>
                  <Text style={{ fontFamily: font.medium, fontSize: 17, color: c.text }}>{m.recipe.title}</Text>
                  <Body soft style={{ fontSize: 14 }}>
                    {m.recipe.kcal} kcal ·{' '}
                    {t('nutrition.macroLine', { p: m.recipe.protein_g, c: m.recipe.carbs_g, f: m.recipe.fat_g })}
                  </Body>
                </Card>
              </Pressable>
            ))}
            {menu.data && (
              <Body soft style={{ fontSize: 13 }}>
                {t('nutrition.menuTotal', { kcal: menu.data.total.kcal, target: menu.data.target.kcal })}
              </Body>
            )}
          </View>

          <Card>
            <Row label={t('nutrition.protein')} value={`${n.protein_g} g`} />
            <Row label={t('nutrition.carbs')} value={`${n.carbs_g} g`} />
            <Row label={t('nutrition.fat')} value={`${n.fat_g} g`} />
            <Row label={t('nutrition.fiber')} value={`${n.fiber_g} g`} />
            <Row label={t('nutrition.water')} value={`${(n.water_ml / 1000).toFixed(1)} L`} />
          </Card>
          <Body soft style={{ fontSize: 13 }}>
            {t('nutrition.disclaimer')}
          </Body>
        </>
      )}
    </Screen>
  );
}
