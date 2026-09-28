import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

type Props = {
  scrollProgress: number;
};

export function PolicyMetaBar({ scrollProgress }: Props) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, scrollProgress))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    width: '100%',
    backgroundColor: colors.border,
  },
  fill: {
    height: 3,
    backgroundColor: colors.primary,
  },
});
