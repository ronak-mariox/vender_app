import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextStyle, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Icon, IconName } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = {
  headerTitle?: string;
  onBack?: () => void;
  headerAccessory?: React.ReactNode;
  backButtonShape?: 'square' | 'circle';
  icon: IconName;
  iconColor: string;
  iconBg: string;
  iconRingColor?: string;
  iconCircleSize?: number;
  iconSize?: number;
  heading: string;
  headingSize?: number;
  headingWeight?: 'bold' | 'extrabold' | 'black';
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  footerDivider?: boolean;
  gradient?: boolean;
};

const HEADING_WEIGHT_MAP: Record<NonNullable<Props['headingWeight']>, TextStyle['fontFamily']> = {
  bold: fontFamilies.bold,
  extrabold: fontFamilies.extrabold,
  black: fontFamilies.black,
};

export function FlowStatusScreen({
  headerTitle,
  onBack,
  headerAccessory,
  backButtonShape = 'square',
  icon,
  iconColor,
  iconBg,
  iconRingColor,
  iconCircleSize = 88,
  iconSize = 40,
  heading,
  headingSize,
  headingWeight,
  subtitle,
  children,
  footer,
  footerDivider = true,
  gradient = false,
}: Props) {
  const content = (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {headerTitle ? (
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            style={[styles.backButton, backButtonShape === 'circle' && styles.backButtonCircle]}
          >
            <Icon name="arrow-left" size={18} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
          {headerAccessory}
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.iconCircle,
            {
              width: iconCircleSize,
              height: iconCircleSize,
              borderRadius: iconCircleSize / 2,
              backgroundColor: iconBg,
              borderColor: iconRingColor ?? iconBg,
            },
            gradient && styles.iconCircleGradient,
          ]}
        >
          <Icon name={icon} size={iconSize} color={iconColor} />
        </View>
        <Text
          style={[
            styles.heading,
            gradient && styles.headingLight,
            headingSize ? { fontSize: headingSize } : null,
            headingWeight ? { fontFamily: HEADING_WEIGHT_MAP[headingWeight] } : null,
          ]}
        >
          {heading}
        </Text>
        {subtitle ? (
          typeof subtitle === 'string' ? (
            <Text style={[styles.subtitle, gradient && styles.subtitleLight]}>{subtitle}</Text>
          ) : (
            subtitle
          )
        ) : null}
        {children}
      </ScrollView>

      {footer ? (
        <View style={[styles.footer, !footerDivider && styles.footerNoDivider, gradient && styles.footerGradient]}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.root, styles.rootGradient]}
      >
        {content}
      </LinearGradient>
    );
  }

  return <View style={styles.root}>{content}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  rootGradient: {
    backgroundColor: colors.primary,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonCircle: {
    borderRadius: radii.full,
  },
  headerTitle: {
    ...typography.bodySemibold,
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconCircleGradient: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heading: {
    ...typography.h2,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headingLight: {
    color: colors.white,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  subtitleLight: {
    color: 'rgba(255,255,255,0.85)',
  },
  footer: {
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  footerGradient: {
    borderTopWidth: 0,
  },
  footerNoDivider: {
    borderTopWidth: 0,
  },
});
