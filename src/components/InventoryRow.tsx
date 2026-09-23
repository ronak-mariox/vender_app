import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../icons/Icon';
import { colors, radii, spacing, typography } from '../theme';

type Props = {
  name: string;
  sku: string;
  onPress: () => void;
  right: React.ReactNode;
  muted?: boolean;
  bordered?: boolean;
  borderColor?: string;
  subtitle?: React.ReactNode;
};

export function InventoryRow({ name, sku, onPress, right, muted, bordered, borderColor, subtitle }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        bordered && [styles.rowBordered, { borderColor: borderColor ?? colors.border }],
      ]}
    >
      <View style={[styles.thumb, muted && styles.thumbMuted]}>
        <Icon name="package" size={muted ? 18 : 22} color={colors.textTertiary} />
      </View>
      <View style={styles.textColumn}>
        <Text style={[styles.name, muted && styles.nameMuted]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.sku} numberOfLines={1}>
          {sku}
        </Text>
        {subtitle}
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  rowBordered: {
    borderWidth: 1.5,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
    borderBottomWidth: 1.5,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbMuted: {
    opacity: 0.7,
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  name: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  nameMuted: {
    color: colors.textSecondary,
  },
  sku: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
});
