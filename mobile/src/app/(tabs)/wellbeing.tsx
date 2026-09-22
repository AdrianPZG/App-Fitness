import { useTranslation } from 'react-i18next';

import { Body, Card, Label, Screen } from '@/components/ui';

export default function Wellbeing() {
  const { t } = useTranslation();
  return (
    <Screen title={t('wellbeing.title')}>
      <Card>
        <Label>{t('wellbeing.sleep')}</Label>
        <Body soft>{t('nutrition.soon')}</Body>
      </Card>
      <Card>
        <Label>{t('wellbeing.cycle')}</Label>
        <Body soft>{t('nutrition.soon')}</Body>
      </Card>
    </Screen>
  );
}
