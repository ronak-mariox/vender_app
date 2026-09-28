import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

type Props = {
  canAccept: boolean;
  onAccept: () => void;
  acceptLabel?: string;
};

export function PolicyScrollFooter({ canAccept, onAccept, acceptLabel }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.progressText}>
        {canAccept ? 'You can now accept' : 'Scroll to the end to accept'}
      </Text>
      <Pressable
        style={[styles.acceptButton, canAccept && styles.acceptButtonEnabled]}
        onPress={onAccept}
        disabled={!canAccept}
      >
        <Text style={styles.acceptText}>{acceptLabel ?? 'I Accept'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  acceptButton: {
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonEnabled: {
    backgroundColor: colors.primary,
  },
  acceptText: {
    ...typography.bodySemibold,
    color: colors.white,
  },
});
