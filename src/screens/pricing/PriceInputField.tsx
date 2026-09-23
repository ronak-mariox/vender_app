import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  prefix?: string;
  suffix?: string;
  error?: boolean;
};

export function PriceInputField({ label, value, onChangeText, prefix = '₹', suffix, error }: Props) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error && styles.fieldError]}>
        {prefix ? (
          <View style={styles.affix}>
            <Text style={styles.affixText}>{prefix}</Text>
          </View>
        ) : null}
        <TextInput
          value={value}
          onChangeText={text => onChangeText(text.replace(/[^0-9.]/g, ''))}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        {suffix ? (
          <View style={[styles.affix, styles.affixRight]}>
            <Text style={styles.affixText}>{suffix}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
    paddingTop: spacing.xl,
  },
  label: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 51,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  fieldError: {
    borderColor: colors.error,
  },
  affix: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  affixRight: {
    borderRightWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  affixText: {
    ...typography.bodySemibold,
    color: colors.textSecondary,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.lg,
    ...typography.bodySemibold,
    fontSize: 16,
    color: colors.textPrimary,
  },
});
