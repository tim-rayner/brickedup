import { forwardRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';

type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
};

type PressableRef = ComponentRef<typeof Pressable>;

export const Button = forwardRef<PressableRef, ButtonProps>(function Button(
  { label, variant = 'primary', loading, disabled, style, ...props },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...props}>
      <Text
        style={[
          styles.label,
          variant === 'secondary' && styles.labelSecondary,
          variant === 'ghost' && styles.labelGhost,
        ]}>
        {loading ? '…' : label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  primary: {
    backgroundColor: Brand.brick,
  },
  secondary: {
    backgroundColor: Brand.white,
    borderWidth: 1.5,
    borderColor: Brand.ink,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    color: Brand.white,
    fontSize: 17,
    fontWeight: '600',
  },
  labelSecondary: {
    color: Brand.ink,
  },
  labelGhost: {
    color: Brand.brickDeep,
    fontWeight: '600',
  },
});
