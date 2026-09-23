import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { typography } from '../theme';

type Props = {
  label: string;
  color: string;
  background: string;
};

export function StatusChip({ label, color, background }: Props) {
  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.tinyBold,
    lineHeight: 15,
  },
});
