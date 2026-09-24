import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Recipe, api } from '@/api/client';
import { ActionButton, Icon, Screen, styles } from '@/components/FitnessUI';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/store/auth';

const mealImage = require('@/assets/images/meal-card.jpg');

export default function RecipeDetail() {
  const { id, portion } = useLocalSearchParams<{ id: string; portion?: string }>();
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const token = useAuth((s) => s.token);
  const q = useQuery({
    queryKey: ['recipe', token, id, portion, i18n.language],
    queryFn: () => api<Recipe>(`/recipes/${id}?lang=${i18n.language}&portion=${portion ?? 1}`),
  });
  const r = q.data;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  return (
    <Screen>
      <View style={styles.detailHeader}>
        <Pressable onPress={back} style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.card, opacity: pressed ? 0.65 : 1 }]}>
          <Icon name="arrow-left" size={19} color={colors.foreground} />
        </Pressable>
      </View>
      {q.isError && <Text style={[styles.bodyCopy, { color: colors.mutedForeground }]}>{t('common.error')}</Text>}
      {r && (
        <>
          <Image source={mealImage} style={styles.recipeImage} />
          <Text style={[styles.eyebrow, { color: colors.primary, marginTop: 18 }]}>
            {r.kcal} KCAL · {r.prep_min} MIN
          </Text>
          <Text style={[styles.recipeTitle, { color: colors.foreground }]}>{r.title}</Text>
          <View style={[styles.recipeStats, { borderColor: colors.border }]}>
            <Text style={[styles.recipeStat, { color: colors.foreground }]}>
              <Text style={{ color: colors.primary }}>{r.protein_g} g</Text>
              {'\n'}
              {t('nutrition.protein')}
            </Text>
            <Text style={[styles.recipeStat, { color: colors.foreground }]}>
              <Text style={{ color: colors.primary }}>{r.carbs_g} g</Text>
              {'\n'}
              {t('nutrition.carbs')}
            </Text>
            <Text style={[styles.recipeStat, { color: colors.foreground }]}>
              <Text style={{ color: colors.primary }}>{r.fat_g} g</Text>
              {'\n'}
              {t('nutrition.fat')}
            </Text>
          </View>
          <Text style={[styles.sectionHeading, { color: colors.foreground, marginTop: 26, marginBottom: 13 }]}>{t('recipe.ingredients')}</Text>
          {r.ingredients.map((item) => (
            <View key={item.name} style={styles.ingredient}>
              <Icon name="check" size={15} color={colors.primary} />
              <Text style={[styles.exerciseName, { color: colors.foreground }]}>
                {item.name} · {item.grams} g
              </Text>
            </View>
          ))}
          <Text style={[styles.sectionHeading, { color: colors.foreground, marginTop: 22, marginBottom: 13 }]}>{t('recipe.steps')}</Text>
          {r.steps.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: colors.primary, width: 20 }}>{i + 1}</Text>
              <Text style={[styles.bodyCopy, { color: colors.foreground, flex: 1 }]}>{step}</Text>
            </View>
          ))}
          <View style={{ marginTop: 12 }}>
            <ActionButton label={t('recipe.done')} icon="check-circle" onPress={back} />
          </View>
        </>
      )}
    </Screen>
  );
}
