import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Profile, api } from '@/api/client';
import { ActionButton, styles } from '@/components/FitnessUI';
import { useColors } from '@/hooks/useColors';

const GOALS = ['lose_weight', 'gain_weight', 'build_muscle', 'stay_fit', 'stay_active', 'eat_better'] as const;
const LEVELS = ['sedentary', 'light', 'moderate', 'active'] as const;

function ChoiceRow<T extends string>({ options, value, onChange, labels }: { options: readonly T[]; value: T | null; onChange: (v: T) => void; labels: (v: T) => string }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => {
        const selected = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.choiceChip, { backgroundColor: selected ? colors.primary : colors.secondary, borderColor: selected ? colors.primary : colors.border }]}>
            <Text style={{ color: selected ? colors.primaryForeground : colors.mutedForeground, fontSize: 12, fontWeight: '600' }}>{labels(option)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Formulario de datos personales, usado en el onboarding y en "Editar perfil". */
export function ProfileForm({ initial, onSaved }: { initial?: Profile; onSaved: () => void }) {
  const { t, i18n } = useTranslation();
  const colors = useColors();
  const qc = useQueryClient();

  const [name, setName] = useState(initial?.name ?? '');
  const [height, setHeight] = useState(initial?.height_cm ? String(initial.height_cm) : '');
  const [weight, setWeight] = useState(initial?.weight_kg ? String(initial.weight_kg) : '');
  const [age, setAge] = useState(initial?.birth_year ? String(new Date().getFullYear() - initial.birth_year) : '');
  const [sex, setSex] = useState<Profile['sex']>(initial?.sex ?? null);
  const [goal, setGoal] = useState<Profile['goal']>(initial?.goal ?? null);
  const [activity, setActivity] = useState<Profile['activity_level']>(initial?.activity_level ?? null);
  const [equipment, setEquipment] = useState<Profile['equipment']>(initial?.equipment ?? null);

  const h = parseFloat(height.replace(',', '.'));
  const w = parseFloat(weight.replace(',', '.'));
  const a = parseInt(age, 10);
  const valid = h >= 100 && h <= 250 && w >= 30 && w <= 300 && a >= 14 && a <= 90 && !!sex && !!goal && !!activity && !!equipment;

  const save = useMutation({
    mutationFn: () =>
      api<Profile>('/me/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim() || null,
          height_cm: h,
          weight_kg: w,
          sex,
          goal,
          activity_level: activity,
          equipment,
          birth_year: new Date().getFullYear() - a,
          locale: i18n.language,
        }),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['plan'] });
      qc.invalidateQueries({ queryKey: ['nutrition'] });
      qc.invalidateQueries({ queryKey: ['menu'] });
      onSaved();
    },
  });

  const input = { borderColor: colors.input, color: colors.foreground, backgroundColor: colors.card };

  return (
    <View style={{ gap: 14 }}>
      <TextInput value={name} onChangeText={setName} placeholder={t('onboarding.name')} placeholderTextColor={colors.mutedForeground} style={[styles.input, input]} />
      <View style={{ flexDirection: 'row', gap: 9 }}>
        <TextInput value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="cm" placeholderTextColor={colors.mutedForeground} style={[styles.input, styles.smallInput, input]} />
        <TextInput value={weight} onChangeText={setWeight} keyboardType="number-pad" placeholder="kg" placeholderTextColor={colors.mutedForeground} style={[styles.input, styles.smallInput, input]} />
        <TextInput value={age} onChangeText={setAge} keyboardType="number-pad" placeholder={t('onboarding.age')} placeholderTextColor={colors.mutedForeground} style={[styles.input, styles.smallInput, input]} />
      </View>
      <Text style={[styles.formHint, { color: colors.mutedForeground }]}>{t('onboarding.metricsHint')}</Text>

      <Text style={[styles.formLabel, { color: colors.foreground }]}>{t('profile.sex')}</Text>
      <ChoiceRow options={['M', 'F'] as const} value={sex} onChange={setSex} labels={(v) => t(`onboarding.${v === 'M' ? 'male' : 'female'}`)} />

      <Text style={[styles.formLabel, { color: colors.foreground }]}>{t('profile.goal')}</Text>
      <ChoiceRow options={GOALS} value={goal} onChange={setGoal} labels={(v) => t(`goals.${v}`)} />

      <Text style={[styles.formLabel, { color: colors.foreground }]}>{t('onboarding.activity')}</Text>
      <ChoiceRow options={LEVELS} value={activity} onChange={setActivity} labels={(v) => t(`activity.${v}`)} />

      <Text style={[styles.formLabel, { color: colors.foreground }]}>{t('onboarding.equipment')}</Text>
      <ChoiceRow options={['home', 'gym'] as const} value={equipment} onChange={setEquipment} labels={(v) => t(`onboarding.${v}`)} />

      <View style={{ marginTop: 12 }}>
        <ActionButton label={t('onboarding.finish')} icon="arrow-right" disabled={!valid || save.isPending} onPress={() => save.mutate()} />
      </View>
      {!valid && <Text style={[styles.formHint, { color: colors.mutedForeground, marginTop: -4 }]}>{t('onboarding.incomplete')}</Text>}
    </View>
  );
}
