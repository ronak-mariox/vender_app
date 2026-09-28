import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../icons/Icon';
import { radii, spacing, typography } from '../theme';

type Props = {
  icon: IconName;
  value: number;
  label: string;
  color: string;
  background: string;
  iconBackground: string;
  onPress?: () => void;
};

export function PipelineTile({ icon, value, label, color, background, iconBackground, onPress }: Props) {
  return (
    <Pressable
      style={[styles.tile, { backgroundColor: background, borderColor: `${color}22` }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconWrapper, { backgroundColor: iconBackground }]}>
        <Icon name={icon} size={14} color={color} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    padding: 10,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography.h2,
    fontSize: 22,
    letterSpacing: -0.88,
  },
  label: {
    ...typography.tinyBold,
    fontSize: 10,
    textAlign: 'center',
  },
});
