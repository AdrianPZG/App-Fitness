import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { ActionButton, Icon, Screen, styles } from '@/components/FitnessUI';
import { useColors } from '@/hooks/useColors';

export default function SubscribeScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const features = ['plans', 'library', 'recipes', 'trial'] as const;

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={[styles.loginMark, { backgroundColor: colors.primary }]}>
          <Icon name="unlock" size={27} color={colors.primaryForeground} />
        </View>
        <Text style={[styles.loginTitle, { color: colors.foreground }]}>{t('subscribe.title')}</Text>
        <Text style={[styles.bodyCopy, { color: colors.mutedForeground }]}>{t('subscribe.subtitle')}</Text>
        <View style={[styles.featureList, { backgroundColor: colors.card }]}>
          {features.map((key) => (
            <View key={key} style={styles.featureRow}>
              <View style={[styles.featureCheck, { backgroundColor: colors.primary }]}>
                <Icon name="check" size={13} color={colors.primaryForeground} />
              </View>
              <Text style={[styles.exerciseName, { color: colors.foreground }]}>{t(`subscribe.feature.${key}`)}</Text>
            </View>
          ))}
        </View>
        <ActionButton label={t('subscribe.close')} icon="arrow-right" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))} />
        <Text style={[styles.legalText, { color: colors.mutedForeground, textAlign: 'center', marginTop: 14 }]}>{t('subscribe.priceLine', { price: 50 })}</Text>
        <Text style={[styles.legalText, { color: colors.mutedForeground, textAlign: 'center', marginTop: 6 }]}>{t('subscribe.notLive')}</Text>
      </View>
    </Screen>
  );
}
