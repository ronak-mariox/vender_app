import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

type Props = {
  title?: string;
  children: React.ReactNode;
};

export function DetailCard({ title, children }: Props) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

type RowProps = {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
  divider?: boolean;
};

export function DetailRow({ label, value, valueColor, bold, divider }: RowProps) {
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          bold && styles.rowValueBold,
          valueColor ? { color: valueColor } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    paddingBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  rowLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.label,
    color: colors.textPrimary,
  },
  rowValueBold: {
    ...typography.labelSemibold,
  },
});
