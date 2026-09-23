import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  error?: string;
};

export function UploadDropzone({ label, onPress, error }: Props) {
  const hasError = Boolean(error);

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onPress} style={[styles.container, hasError && styles.containerError]}>
        <View style={styles.iconWrapper}>
          <Icon name="upload" size={20} color={colors.textSecondary} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: spacing.sm,
  },
  container: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  containerError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
});
