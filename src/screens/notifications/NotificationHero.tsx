import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = {
  icon: IconName;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  timeLabel: string;
};

export function NotificationHero({ icon, iconColor, iconBg, title, subtitle, timeLabel }: Props) {
  return (
    <View style={styles.hero}>
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.time}>{timeLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.xs,
  },
  time: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingTop: spacing.sm,
  },
});
