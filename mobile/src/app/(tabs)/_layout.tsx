import { Tabs } from 'expo-router';
import { Dumbbell, House, Moon, User, Utensils } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { font, useColors } from '@/theme';

const icons = { index: House, train: Dumbbell, nutrition: Utensils, wellbeing: Moon, profile: User };

export default function TabsLayout() {
  const { t } = useTranslation();
  const c = useColors();
  const wide = useWindowDimensions().width >= 768; // tablet: navegación lateral

  const screen = (name: keyof typeof icons, label: string) => {
    const Icon = icons[name];
    return (
      <Tabs.Screen
        key={name}
        name={name}
        options={{
          title: label,
          tabBarIcon: ({ color }) => <Icon size={22} color={color} strokeWidth={1.5} />,
        }}
      />
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: wide ? 'left' : 'bottom',
        tabBarVariant: wide ? 'material' : 'uikit',
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textSoft,
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 12 },
        tabBarStyle: {
          backgroundColor: c.surface,
          borderColor: c.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderRightWidth: wide ? StyleSheet.hairlineWidth : 0,
          elevation: 0,
        },
      }}>
      {screen('index', t('tabs.today'))}
      {screen('train', t('tabs.train'))}
      {screen('nutrition', t('tabs.nutrition'))}
      {screen('wellbeing', t('tabs.wellbeing'))}
      {screen('profile', t('tabs.profile'))}
    </Tabs>
  );
}
