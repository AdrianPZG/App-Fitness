import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Plan, api } from '@/api/client';
import { Body, Card, Screen } from '@/components/ui';
import { WorkoutCard } from '@/components/workout';
import { useAuth } from '@/store/auth';

export default function Today() {
  const { t, i18n } = useTranslation();
  const token = useAuth((s) => s.token);
  const plan = useQuery({
    queryKey: ['plan', token, i18n.language],
    queryFn: () => api<Plan>(`/me/plan?lang=${i18n.language}`),
    retry: false,
  }).data;

  const weekday = (new Date().getDay() + 6) % 7; // lunes = 0
  const slot = plan?.weekdays.indexOf(weekday) ?? -1;
  const day = plan && slot >= 0 ? plan.days[slot] : null;

  return (
    <Screen title={t('today.title')}>
      {day ? (
        <WorkoutCard day={day} heading={t('today.workout', { kind: t(`plan.kind.${day.kind}`) })} />
      ) : (
        <Card>
          <Body soft>{plan ? t('today.rest') : t('today.empty')}</Body>
        </Card>
      )}
    </Screen>
  );
}
