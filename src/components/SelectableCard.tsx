import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../theme';

type Props = {
  icon: IconName;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

export function SelectableCard({ icon, title, description, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected ? styles.cardSelected : styles.cardDefault]}
    >
      <View style={[styles.iconWrapper, selected && styles.iconWrapperSelected]}>
        <Icon name={icon} size={22} color={selected ? colors.primary : colors.textSecondary} />
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <Icon name="check" size={13} color={colors.white} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    width: '100%',
  },
  cardDefault: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  cardSelected: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperSelected: {
    backgroundColor: 'rgba(28,166,114,0.13)',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  description: {
    ...typography.captionSemibold,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
