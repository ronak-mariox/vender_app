import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

type Props = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export function PolicySection({ heading, paragraphs, bullets }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{heading}</Text>
      {paragraphs?.map((paragraph, index) => (
        <Text key={index} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
      {bullets?.map((bullet, index) => (
        <View key={index} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>{'•'}</Text>
          <Text style={styles.bulletText}>{bullet}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: spacing.xxl + 2,
    gap: spacing.md,
  },
  heading: {
    ...typography.captionSemibold,
    fontWeight: '700',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  paragraph: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 22.1,
    color: colors.textSecondary,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  bulletDot: {
    ...typography.bodySemibold,
    color: colors.primary,
    lineHeight: 20.8,
  },
  bulletText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 20.8,
    color: colors.textSecondary,
    flex: 1,
  },
});
