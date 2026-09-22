import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Profile as ProfileData, api } from '@/api/client';
import { Button } from '@/components/form';
import { Body, Card, Label, Row, Screen } from '@/components/ui';
import { LANGUAGES, setLanguage } from '@/i18n';
import { useAuth } from '@/store/auth';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const token = useAuth((s) => s.token);
  const p = useQuery({ queryKey: ['profile', token], queryFn: () => api<ProfileData>('/me/profile') }).data;
  return (
    <Screen title={t('profile.title')}>
      <Card>
        <Label>{t('profile.data')}</Label>
        <Row label={t('profile.height')} value={p?.height_cm ? `${p.height_cm} cm` : '—'} />
        <Row label={t('profile.weight')} value={p?.weight_kg ? `${p.weight_kg} kg` : '—'} />
        <Row label={t('profile.sex')} value={p?.sex ?? '—'} />
        <Row label={t('profile.goal')} value={p?.goal ? t(`goals.${p.goal}`) : '—'} />
      </Card>
      <Card>
        <Label>{t('profile.subscription')}</Label>
        <Body soft>{t('profile.trial')}</Body>
      </Card>
      <Card>
        <Label>{t('profile.language')}</Label>
        {LANGUAGES.map((l) => (
          <Row key={l.code} label={l.label} selected={i18n.language === l.code} onPress={() => setLanguage(l.code)} />
        ))}
      </Card>
      <Button variant="secondary" title={t('profile.signOut')} onPress={() => useAuth.getState().signOut()} />
    </Screen>
  );
}
