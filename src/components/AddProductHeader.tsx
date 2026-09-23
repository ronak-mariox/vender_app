import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../theme';

type Props = {
  title: string;
  currentStep: number;
  totalSteps?: number;
  onBack: () => void;
  onSaveDraft?: () => void;
};

export function AddProductHeader({
  title,
  currentStep,
  totalSteps = 10,
  onBack,
  onSaveDraft,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.textColumn}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle}>
            Step {currentStep} of {totalSteps} · Add Product
          </Text>
        </View>
        {onSaveDraft ? (
          <Pressable onPress={onSaveDraft} hitSlop={8}>
            <Text style={styles.saveDraft}>Save Draft</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.track}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View key={index} style={[styles.segment, index < currentStep && styles.segmentActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 1,
  },
  title: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  saveDraft: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xxl,
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
});
