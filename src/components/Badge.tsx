import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../icons/Icon';
import { colors, typography } from '../theme';

export type BadgeTone = 'success' | 'warning' | 'error' | 'neutral' | 'info';

type Props = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
};

const TONE_STYLES: Record<BadgeTone, { background: string; text: string }> = {
  success: { background: colors.primarySurface, text: colors.primary },
  warning: { background: colors.warningSurface, text: colors.warningDark },
  error: { background: colors.errorSurface, text: colors.error },
  neutral: { background: colors.surfaceAlt, text: colors.textSecondary },
  info: { background: '#EFF8FF', text: '#1570EF' },
};

export function Badge({ label, tone = 'neutral', icon }: Props) {
  const toneStyle = TONE_STYLES[tone];
  return (
    <View style={[styles.container, { backgroundColor: toneStyle.background }]}>
      {icon ? <Icon name={icon} size={11} color={toneStyle.text} strokeWidth={2.5} /> : null}
      <Text style={[styles.label, { color: toneStyle.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.tinyBold,
    lineHeight: 15,
  },
});
