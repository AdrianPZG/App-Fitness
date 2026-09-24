import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { ActionButton, Icon, Screen, SectionTitle, StatPill, TopBar, styles } from '@/components/FitnessUI';
import { Reveal } from '@/components/Motion';
import { useColors } from '@/hooks/useColors';

const DEVICES = [
  { key: 'apple', icon: 'heart' as const },
  { key: 'google', icon: 'activity' as const },
  { key: 'garmin', icon: 'watch' as const },
];

export default function WatchScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const [connectedDevice, setConnectedDevice] = useState('');
  const [deferred, setDeferred] = useState(false);

  return (
    <Screen>
      <Reveal>
        <TopBar eyebrow={t('watch.eyebrow')} title={t('tabs.watch')} />
      </Reveal>
      <Reveal delay={80}>
        <View style={[styles.watchHero, { backgroundColor: colors.card }]}>
          <View style={[styles.watchIcon, { backgroundColor: colors.secondary }]}>
            <Icon name="watch" size={29} color={colors.primary} />
          </View>
          <Text style={[styles.watchTitle, { color: colors.foreground }]}>{t('watch.heroTitle')}</Text>
          <Text style={[styles.bodyCopy, { color: colors.mutedForeground }]}>{t('watch.heroBody')}</Text>
        </View>
      </Reveal>

      <Reveal delay={200}>
        <SectionTitle title={t('watch.connectDevice')} />
      </Reveal>
      <View style={{ gap: 10 }}>
        {DEVICES.map((device, index) => {
          const connected = connectedDevice === device.key;
          return (
            <Reveal key={device.key} delay={250 + index * 55}>
              <Pressable
                onPress={() => setConnectedDevice(connected ? '' : device.key)}
                style={({ pressed }) => [
                  styles.deviceRow,
                  { backgroundColor: colors.card, borderColor: connected ? colors.primary : colors.card, borderWidth: 1, opacity: pressed ? 0.75 : 1 },
                ]}>
                <View style={[styles.libraryIcon, { backgroundColor: connected ? colors.primary : colors.secondary }]}>
                  <Icon name={connected ? 'check' : device.icon} size={18} color={connected ? colors.primaryForeground : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exerciseName, { color: colors.foreground }]}>{t(`watch.device.${device.key}.name`)}</Text>
                  <Text style={[styles.exerciseDetail, { color: colors.mutedForeground }]}>
                    {connected ? t('watch.syncing') : t(`watch.device.${device.key}.detail`)}
                  </Text>
                </View>
                <Text style={[styles.deviceStatus, { color: connected ? colors.primary : colors.mutedForeground }]}>
                  {connected ? t('watch.active') : t('watch.connect')}
                </Text>
              </Pressable>
            </Reveal>
          );
        })}
      </View>

      {connectedDevice && (
        <Reveal delay={180}>
          <View style={styles.connectedMetricRow}>
            <StatPill icon="activity" label={t('watch.steps')} value="—" />
            <StatPill icon="heart" label={t('watch.heartRate')} value="—" tone="amber" />
            <StatPill icon="moon" label={t('watch.sleep')} value="—" tone="muted" />
          </View>
        </Reveal>
      )}

      <View style={[styles.syncCard, { borderColor: colors.border, backgroundColor: colors.secondary }]}>
        <Icon name="shield" size={17} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.noticeTitle, { color: colors.foreground }]}>{t('watch.privacyTitle')}</Text>
          <Text style={[styles.noticeBody, { color: colors.mutedForeground }]}>{t('watch.privacyBody')}</Text>
        </View>
      </View>
      <ActionButton label={deferred ? t('watch.reminderSaved') : t('watch.later')} secondary onPress={() => setDeferred(true)} />
    </Screen>
  );
}
