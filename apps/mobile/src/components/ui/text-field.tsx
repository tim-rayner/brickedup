import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Brand } from '@/constants/brand';
import { Spacing } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={Brand.inkMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Brand.ink,
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D5CFC6',
    backgroundColor: Brand.white,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    color: Brand.ink,
  },
  inputError: {
    borderColor: Brand.danger,
  },
  error: {
    fontSize: 13,
    color: Brand.danger,
  },
});
