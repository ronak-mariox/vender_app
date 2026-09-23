import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../theme';

export type BannerVariant = 'info' | 'success' | 'warning' | 'error' | 'neutral';

type Props = {
  variant: BannerVariant;
  title?: string;
  message: string;
  bordered?: boolean;
};

type VariantStyle = {
  icon: IconName;
  iconColor: string;
  background: string;
  border: string;
  titleColor: string;
  messageColor: string;
  messageBold: boolean;
};

const VARIANT_CONFIG: Record<BannerVariant, VariantStyle> = {
  info: {
    icon: 'info',
    iconColor: colors.primaryDark,
    background: colors.primarySurface,
    border: colors.primaryBorder,
    titleColor: colors.primaryDark,
    messageColor: colors.primaryDark,
    messageBold: false,
  },
  success: {
    icon: 'check-circle',
    iconColor: colors.primaryDark,
    background: colors.primarySurface,
    border: colors.primaryBorder,
    titleColor: colors.primaryDark,
    messageColor: colors.primaryDark,
    messageBold: true,
  },
  warning: {
    icon: 'alert-triangle',
    iconColor: colors.warningDark,
    background: colors.warningSurface,
    border: colors.warningSurface,
    titleColor: colors.warningDark,
    messageColor: colors.warningDark,
    messageBold: true,
  },
  error: {
    icon: 'alert-circle',
    iconColor: colors.error,
    background: colors.errorSurface,
    border: colors.errorBorder,
    titleColor: colors.error,
    messageColor: colors.errorDark,
    messageBold: false,
  },
  neutral: {
    icon: 'info',
    iconColor: colors.textSecondary,
    background: colors.surface,
    border: colors.border,
    titleColor: colors.textPrimary,
    messageColor: colors.textSecondary,
    messageBold: false,
  },
};

export function InfoBanner({ variant, title, message, bordered = false }: Props) {
  const config = VARIANT_CONFIG[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.background },
        bordered && { borderWidth: 1, borderColor: config.border },
      ]}
    >
      <View style={styles.iconWrapper}>
        <Icon name={config.icon} size={16} color={config.iconColor} />
      </View>
      <View style={styles.textColumn}>
        {title ? (
          <Text style={[styles.title, { color: config.titleColor }]}>{title}</Text>
        ) : null}
        <Text
          style={[
            styles.message,
            {
              color: config.messageColor,
              fontFamily: config.messageBold ? fontFamilies.bold : fontFamilies.regular,
            },
          ]}
        >
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    width: '100%',
  },
  iconWrapper: {
    paddingTop: 1,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.labelSemibold,
  },
  message: {
    ...typography.caption,
  },
});
