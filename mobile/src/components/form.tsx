import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { font, radius, space, useColors } from '@/theme';

import { Label } from './ui';

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const c = useColors();
  return (
    <View style={{ gap: space.xs + 2 }}>
      <Label>{label}</Label>
      <TextInput
        placeholderTextColor={c.textSoft}
        {...props}
        style={{
          fontFamily: font.regular,
          fontSize: 16,
          color: c.text,
          backgroundColor: c.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.line,
          borderRadius: radius.md,
          paddingHorizontal: space.md,
          paddingVertical: 14,
        }}
      />
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  icon,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: ReactNode;
}) {
  const c = useColors();
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        gap: space.sm,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: radius.md,
        backgroundColor: primary ? c.accent : 'transparent',
        borderWidth: primary ? 0 : StyleSheet.hairlineWidth,
        borderColor: c.line,
        opacity: disabled ? 0.45 : 1,
      }}>
      {icon}
      <Text style={{ fontFamily: font.semibold, fontSize: 16, color: primary ? c.onAccent : c.text }}>{title}</Text>
    </Pressable>
  );
}

/** Selector de una opción entre varias (sexo, objetivo). */
export function Choice<T extends string>({
  options,
  value,
  onChange,
  columns,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  columns?: boolean;
}) {
  const c = useColors();
  return (
    <View style={{ flexDirection: columns ? 'row' : 'column', gap: space.sm }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: columns ? 1 : undefined,
              paddingVertical: 14,
              paddingHorizontal: space.md,
              borderRadius: radius.md,
              borderWidth: on ? 1.5 : StyleSheet.hairlineWidth,
              borderColor: on ? c.accent : c.line,
              backgroundColor: c.surface,
              alignItems: columns ? 'center' : 'flex-start',
            }}>
            <Text style={{ fontFamily: on ? font.semibold : font.regular, fontSize: 16, color: on ? c.accent : c.text }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
