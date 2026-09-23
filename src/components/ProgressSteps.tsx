import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamilies, spacing, typography } from '../theme';

type Props = {
  currentStep: number;
  totalSteps: number;
  label: string;
};

export function ProgressSteps({ currentStep, totalSteps, label }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.track}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[styles.segment, index < currentStep && styles.segmentActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  label: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 9999,
    backgroundColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
});
