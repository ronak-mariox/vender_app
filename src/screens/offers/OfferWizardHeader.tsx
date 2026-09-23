import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = {
  title: string;
  step: number;
  totalSteps?: number;
  onBack: () => void;
};

export function OfferWizardHeader({ title, step, totalSteps = 5, onBack }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.track}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={[styles.segment, index < step && styles.segmentActive]} />
        ))}
      </View>
      <Text style={styles.stepLabel}>
        Step {step} of {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.bodySemibold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  track: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
});
