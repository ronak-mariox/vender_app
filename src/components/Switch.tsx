import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii } from '../theme';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export function Switch({ value, onChange }: Props) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={8}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
    >
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: radii.full,
    padding: 3,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors.primary,
    alignItems: 'flex-end',
  },
  trackOff: {
    backgroundColor: colors.border,
    alignItems: 'flex-start',
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 9999,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  knobOn: {},
});
