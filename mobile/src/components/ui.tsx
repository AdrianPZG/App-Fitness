import { ChevronLeft } from 'lucide-react-native';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, radius, space, useColors } from '@/theme';

/** Página con ancho máximo de lectura, centrada en tablets. */
export function Screen({ title, children, onBack }: { title: string; children: ReactNode; onBack?: () => void }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingHorizontal: space.md,
        paddingBottom: space.xl,
        alignItems: 'center',
      }}>
      <View style={{ width: '100%', maxWidth: 720, gap: space.lg }}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={12} style={{ alignSelf: 'flex-start' }}>
            <ChevronLeft size={26} color={c.text} strokeWidth={1.5} />
          </Pressable>
        )}
        <Text style={{ fontFamily: font.semibold, fontSize: 30, color: c.text }}>{title}</Text>
        {children}
      </View>
    </ScrollView>
  );
}

export function Card({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderRadius: radius.md,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.line,
        padding: space.md,
        gap: space.sm,
      }}>
      {children}
    </View>
  );
}

export function Body({ soft, style, ...props }: TextProps & { soft?: boolean }) {
  const c = useColors();
  return (
    <Text
      {...props}
      style={[{ fontFamily: font.regular, fontSize: 16, lineHeight: 23, color: soft ? c.textSoft : c.text }, style]}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  const c = useColors();
  return (
    <Text style={{ fontFamily: font.medium, fontSize: 13, letterSpacing: 0.4, color: c.textSoft, textTransform: 'uppercase' }}>
      {children}
    </Text>
  );
}

export function Row({
  label,
  value,
  onPress,
  selected,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  selected?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.sm + 2 }}>
      <Body style={selected ? { fontFamily: font.semibold, color: c.accent } : undefined}>{label}</Body>
      {value ? <Body soft>{value}</Body> : null}
    </Pressable>
  );
}
