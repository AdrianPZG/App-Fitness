import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Profile, api } from '@/api/client';
import { Button, Choice, Field } from '@/components/form';
import { Label, Screen } from '@/components/ui';
import { space } from '@/theme';

const GOALS = ['lose_weight', 'gain_weight', 'build_muscle', 'stay_fit', 'stay_active', 'eat_better'] as const;
const LEVELS = ['sedentary', 'light', 'moderate', 'active'] as const;

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState<'M' | 'F' | null>(null);
  const [goal, setGoal] = useState<Profile['goal']>(null);
  const [age, setAge] = useState('');
  const [activity, setActivity] = useState<Profile['activity_level']>(null);
  const [equipment, setEquipment] = useState<Profile['equipment']>(null);

  const h = parseFloat(height.replace(',', '.'));
  const w = parseFloat(weight.replace(',', '.'));
  const a = parseInt(age, 10);
  const valid = h >= 100 && h <= 250 && w >= 30 && w <= 300 && a >= 14 && a <= 90 && !!sex && !!goal && !!activity && !!equipment;

  const save = useMutation({
    mutationFn: () =>
      api<Profile>('/me/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: name.trim() || null, height_cm: h, weight_kg: w, sex, goal, activity_level: activity, equipment, birth_year: new Date().getFullYear() - a, locale: i18n.language }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  return (
    <Screen title={t('onboarding.title')}>
      <View style={{ gap: space.lg }}>
        <Field label={t('onboarding.name')} value={name} onChangeText={setName} />
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Field label={t('onboarding.height')} value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="170" />
          </View>
          <View style={{ flex: 1 }}>
            <Field label={t('onboarding.weight')} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="70" />
          </View>
        </View>
        <Field label={t('onboarding.age')} value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="30" />
        <View style={{ gap: space.sm }}>
          <Label>{t('profile.sex')}</Label>
          <Choice
            columns
            value={sex}
            onChange={setSex}
            options={[
              { value: 'M', label: t('onboarding.male') },
              { value: 'F', label: t('onboarding.female') },
            ]}
          />
        </View>
        <View style={{ gap: space.sm }}>
          <Label>{t('profile.goal')}</Label>
          <Choice value={goal} onChange={setGoal} options={GOALS.map((g) => ({ value: g, label: t(`goals.${g}`) }))} />
        </View>
        <View style={{ gap: space.sm }}>
          <Label>{t('onboarding.activity')}</Label>
          <Choice value={activity} onChange={setActivity} options={LEVELS.map((l) => ({ value: l, label: t(`activity.${l}`) }))} />
        </View>
        <View style={{ gap: space.sm }}>
          <Label>{t('onboarding.equipment')}</Label>
          <Choice
            columns
            value={equipment}
            onChange={setEquipment}
            options={[
              { value: 'home', label: t('onboarding.home') },
              { value: 'gym', label: t('onboarding.gym') },
            ]}
          />
        </View>
        <Button title={t('onboarding.finish')} disabled={!valid || save.isPending} onPress={() => save.mutate()} />
      </View>
    </Screen>
  );
}
