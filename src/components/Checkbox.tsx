import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Icon } from '../icons/Icon';
import { colors, radii } from '../theme';

type Props = {
  checked: boolean;
  onToggle: (value: boolean) => void;
  error?: boolean;
};

export function Checkbox({ checked, onToggle, error }: Props) {
  return (
    <Pressable
      onPress={() => onToggle(!checked)}
      hitSlop={8}
      style={[styles.box, checked && styles.boxChecked, error && !checked && styles.boxError]}
    >
      {checked ? <Icon name="check" size={11} color={colors.white} strokeWidth={3} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 18,
    height: 18,
    borderRadius: radii.sm - 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  boxError: {
    borderColor: colors.error,
  },
});
