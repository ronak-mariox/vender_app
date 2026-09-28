import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../icons/Icon';
import { colors, radii, spacing, typography } from '../theme';

type Props = {
  icon: IconName;
  iconColor: string;
  iconBackground: string;
  value: string;
  label: string;
  sublabel: string;
  muted?: boolean;
  onPress?: () => void;
};

export function MetricCard({
  icon,
  iconColor,
  iconBackground,
  value,
  label,
  sublabel,
  muted = false,
  onPress,
}: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress} disabled={!onPress}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: muted ? colors.surface : iconBackground }]}>
          <Icon name={icon} size={16} color={muted ? colors.textSecondary : iconColor} />
        </View>
        {onPress ? <Icon name="chevron-right" size={14} color={colors.textTertiary} /> : null}
      </View>
      <Text style={[styles.value, muted && styles.valueMuted]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sublabel}>{sublabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.h2,
    fontSize: 20,
    letterSpacing: -0.6,
    color: colors.textPrimary,
  },
  valueMuted: {
    color: colors.textSecondary,
  },
  label: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  sublabel: {
    ...typography.tiny,
    fontSize: 10,
    color: colors.textSecondary,
    opacity: 0.7,
  },
});
