import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

type Props =
  | {
      mode: 'accept-download';
      scrollProgress: number;
      threshold?: number;
      onAccept: () => void;
      onDownload: () => void;
      acceptLabel?: string;
      downloadLabel?: string;
    }
  | {
      mode: 'download-only';
      onDownload: () => void;
      downloadLabel?: string;
    };

export function PolicyScrollFooter(props: Props) {
  if (props.mode === 'download-only') {
    return (
      <View style={styles.wrapper}>
        <Pressable style={styles.downloadOnlyButton} onPress={props.onDownload}>
          <Text style={styles.downloadOnlyText}>{props.downloadLabel ?? 'Download Policy PDF'}</Text>
        </Pressable>
      </View>
    );
  }

  const threshold = props.threshold ?? 80;
  const percentRead = Math.min(100, Math.max(0, Math.round(props.scrollProgress)));
  const canAccept = percentRead >= threshold;
  const remaining = Math.max(0, threshold - percentRead);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.progressText}>
        {canAccept
          ? 'Scroll complete — you can now accept'
          : `Scroll to read — ${percentRead}% read (${remaining} more % to enable)`}
      </Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.acceptButton, canAccept && styles.acceptButtonEnabled]}
          onPress={props.onAccept}
          disabled={!canAccept}
        >
          <Text style={styles.acceptText}>{props.acceptLabel ?? 'I Accept'}</Text>
        </Pressable>
        <Pressable style={styles.downloadButton} onPress={props.onDownload}>
          <Text style={styles.downloadText}>{props.downloadLabel ?? 'Download PDF'}</Text>
        </Pressable>
      </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  acceptButton: {
    flex: 1.7,
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
  downloadButton: {
    flex: 1.3,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadText: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  downloadOnlyButton: {
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadOnlyText: {
    ...typography.bodySemibold,
    color: colors.white,
  },
});
