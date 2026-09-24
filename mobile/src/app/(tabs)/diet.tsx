import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Menu, Nutrition, api } from '@/api/client';
import { ActionButton, Icon, Screen, SectionTitle, StatPill, TopBar, styles } from '@/components/FitnessUI';
import { Reveal } from '@/components/Motion';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/store/auth';

const mealImage = require('@/assets/images/meal-card.jpg');

export default function DietScreen() {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const token = useAuth((s) => s.token);
  const [vegetarian, setVegetarian] = useState(false);
  const [variant, setVariant] = useState(0);

  const nutrition = useQuery({ queryKey: ['nutrition', token], queryFn: () => api<Nutrition>('/me/nutrition'), retry: false });
  const menu = useQuery({
    queryKey: ['menu', token, i18n.language, variant, vegetarian],
    queryFn: () => api<Menu>(`/me/menu?lang=${i18n.language}&variant=${variant}${vegetarian ? '&diet=vegetarian' : ''}`),
    retry: false,
    enabled: !!nutrition.data,
  });

  const n = nutrition.data;
  const macroTargets = n ? { [t('nutrition.protein')]: n.protein_g, [t('nutrition.carbs')]: n.carbs_g, [t('nutrition.fat')]: n.fat_g } : {};

  return (
    <Screen>
      <Reveal>
        <TopBar eyebrow={t('nutrition.eyebrow')} title={t('tabs.diet')} />
      </Reveal>

      {nutrition.isError && (
        <Reveal>
          <View style={[styles.lockedBanner, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
            <Icon name="lock" size={17} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.noticeTitle, { color: colors.foreground }]}>{t('nutrition.title')}</Text>
              <Text style={[styles.noticeBody, { color: colors.mutedForeground }]}>{t('plan.locked')}</Text>
            </View>
            <ActionButton label={t('subscribe.cta')} onPress={() => router.push('/subscribe')} />
          </View>
        </Reveal>
      )}

      {n && (
        <>
          <Reveal delay={80}>
            <View style={[styles.caloriePanel, { backgroundColor: colors.card }]}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.primary }]}>{t('nutrition.estimatedGoal')}</Text>
                <Text style={[styles.calorieValue, { color: colors.foreground }]}>
                  {n.kcal.toLocaleString()} <Text style={styles.calorieUnit}>kcal</Text>
                </Text>
                <Text style={[styles.bodyCopy, { color: colors.mutedForeground }]}>{t('nutrition.dailyTarget')}</Text>
              </View>
            </View>
          </Reveal>

          <Reveal delay={140}>
            <View style={{ flexDirection: 'row', gap: 9, marginTop: 12 }}>
              {([
                [n.protein_g, t('nutrition.protein')],
                [n.carbs_g, t('nutrition.carbs')],
                [n.fat_g, t('nutrition.fat')],
              ] as const).map(([value, label], index) => (
                <View key={label} style={[styles.macroCard, { backgroundColor: colors.card }]}>
                  <Text style={[styles.macroValue, { color: index === 0 ? colors.primary : colors.foreground }]}>
                    {value}
                    <Text style={styles.calorieUnit}> g</Text>
                  </Text>
                  <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
              ))}
            </View>
          </Reveal>

          <Reveal delay={175}>
            <View style={styles.nutritionMetricRow}>
              <StatPill icon="droplet" label={t('nutrition.water')} value={`${(n.water_ml / 1000).toFixed(1)} L`} />
              <StatPill icon="activity" label={t('nutrition.fiber')} value={`${n.fiber_g} g`} tone="amber" />
            </View>
          </Reveal>

          {n.warnings.map((w) => (
            <View key={w} style={[styles.miniNotice, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <View style={[styles.noticeIcon, { backgroundColor: colors.accent }]}>
                <Icon name="info" size={14} color={colors.accentForeground} />
              </View>
              <Text style={[styles.noticeBody, { color: colors.mutedForeground, flex: 1 }]}>{t(`nutrition.warning.${w}`)}</Text>
            </View>
          ))}

          <SectionTitle
            title={t('nutrition.todayMenu')}
            action={vegetarian ? t('nutrition.vegetarian') : t('nutrition.balanced')}
            onAction={() => setVegetarian((v) => !v)}
          />
          <View style={{ gap: 10 }}>
            {menu.data?.meals.map((m, index) => (
              <Reveal key={m.meal} delay={250 + index * 55}>
                <Pressable
                  onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: String(m.recipe.id), portion: String(m.recipe.portion) } })}
                  style={({ pressed }) => [styles.mealRow, { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}>
                  <Image source={mealImage} style={styles.mealImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.mealType, { color: colors.primary }]}>{t(`nutrition.meal.${m.meal}`)}</Text>
                    <Text style={[styles.mealName, { color: colors.foreground }]} numberOfLines={1}>
                      {m.recipe.title}
                    </Text>
                    <Text style={[styles.mealMeta, { color: colors.mutedForeground }]}>
                      {m.recipe.kcal} kcal · {m.recipe.protein_g} g {t('nutrition.protein').toLowerCase()}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={18} color={colors.mutedForeground} />
                </Pressable>
              </Reveal>
            ))}
          </View>

          <ActionButton label={t('nutrition.otherOptions')} icon="refresh-cw" secondary onPress={() => setVariant((v) => v + 1)} />

          <View style={[styles.legalNote, { borderColor: colors.border }]}>
            <Icon name="info" size={15} color={colors.mutedForeground} />
            <Text style={[styles.legalText, { color: colors.mutedForeground }]}>{t('nutrition.disclaimer')}</Text>
          </View>
        </>
      )}
    </Screen>
  );
}
