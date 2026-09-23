import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../icons/Icon';
import { Badge } from './Badge';
import { colors, fontFamilies, radii, spacing, typography } from '../theme';

type Row = { label: string; value: string };

type Props = {
  icon: IconName;
  title: string;
  rows: Row[];
  onEdit: () => void;
};

export function ReviewSectionCard({ icon, title, rows, onEdit }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Icon name={icon} size={16} color={colors.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Badge label="Complete" tone="success" icon="check" />
        <Pressable onPress={onEdit} hitSlop={8}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>
      <View style={styles.body}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[styles.row, index < rows.length - 1 && styles.rowDivider]}
          >
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    flex: 1,
  },
  editText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
    gap: 1,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  rowValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
});
