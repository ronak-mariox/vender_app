import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../icons/Icon';
import { colors, typography } from '../theme';

type Props = {
  icon: IconName;
  size?: number;
  iconSize?: number;
  iconColor?: string;
  backgroundColor?: string;
  dashed?: boolean;
  badge?: React.ReactNode;
  badgeLabel?: string;
  badgeColor?: string;
};

export function IconCircle({
  icon,
  size = 72,
  iconSize = 32,
  iconColor = colors.primary,
  backgroundColor = colors.primarySurface,
  dashed = false,
  badge,
  badgeLabel,
  badgeColor = colors.primary,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
          },
          dashed && styles.dashed,
        ]}
      >
        <Icon name={icon} size={iconSize} color={iconColor} />
      </View>
      {badgeLabel ? (
        <View style={[styles.pillBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.pillBadgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
      {badge}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashed: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  pillBadge: {
    position: 'absolute',
    bottom: -8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  pillBadgeText: {
    ...typography.tinyBold,
    color: colors.white,
    lineHeight: 15,
  },
});
