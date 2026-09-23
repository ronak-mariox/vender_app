import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme';

type Props = {
  password: string;
};

function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const LEVELS = [
  { label: '', color: colors.border },
  { label: 'Weak password', color: colors.error },
  { label: 'Fair password', color: colors.warningDark },
  { label: 'Good password', color: colors.primary },
  { label: 'Strong password', color: colors.primary },
];

export function PasswordStrengthMeter({ password }: Props) {
  const score = useMemo(() => scorePassword(password), [password]);
  if (!password) return null;
  const level = LEVELS[score];

  return (
    <View style={styles.container}>
      <View style={styles.segments}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              { backgroundColor: index < score ? level.color : colors.border },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: level.color }]}>{level.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 3,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 9999,
  },
  label: {
    ...typography.tiny,
  },
});
