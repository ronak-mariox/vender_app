import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons/Icon';
import { colors, spacing, typography } from '../../theme';

type Props = {
  title: string;
  onBack: () => void;
};

export function PricingBackHeader({ title, onBack }: Props) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8} style={styles.row}>
        <Icon name="arrow-left" size={20} color={colors.textPrimary} />
        <Text style={styles.title}>{title}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    ...typography.bodySemibold,
    fontSize: 17,
    color: colors.textPrimary,
  },
});
