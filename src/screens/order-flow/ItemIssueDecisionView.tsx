import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, IconName } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';
import { FlowStatusScreen } from './FlowStatusScreen';

type OptionTone = 'success' | 'warning' | 'error';

type Option = {
  icon?: IconName;
  label: string;
  hint?: string;
  tone: OptionTone;
  onPress: () => void;
};

type Props = {
  headerTitle: string;
  onBack: () => void;
  statusIcon?: IconName;
  statusIconColor?: string;
  statusIconBg?: string;
  statusIconRingColor?: string;
  heading: string;
  subtitle: string;
  detailIcon?: IconName;
  detailTitle: string;
  detailLines: string[];
  prompt: string;
  options: Option[];
  optionBordered?: boolean;
};

const TONE_STYLES: Record<OptionTone, { color: string; background: string; border: string }> = {
  success: { color: colors.primary, background: colors.primarySurface, border: colors.primaryBorder },
  warning: { color: colors.warning, background: colors.warningSurface, border: '#FDE68A' },
  error: { color: colors.error, background: colors.errorSurface, border: colors.errorBorder },
};

export function ItemIssueDecisionView({
  headerTitle,
  onBack,
  statusIcon = 'alert-circle',
  statusIconColor = colors.error,
  statusIconBg = colors.errorSurface,
  statusIconRingColor = colors.errorBorder,
  heading,
  subtitle,
  detailIcon,
  detailTitle,
  detailLines,
  prompt,
  options,
  optionBordered = false,
}: Props) {
  return (
    <FlowStatusScreen
      headerTitle={headerTitle}
      onBack={onBack}
      backButtonShape="circle"
      icon={statusIcon}
      iconColor={statusIconColor}
      iconBg={statusIconBg}
      iconRingColor={statusIconRingColor}
      heading={heading}
      subtitle={subtitle}
    >
      <View style={styles.detailCard}>
        <View style={styles.detailTitleRow}>
          {detailIcon ? <Icon name={detailIcon} size={16} color={colors.error} /> : null}
          <Text style={styles.detailTitle}>{detailTitle}</Text>
        </View>
        {detailLines.map(line => (
          <Text key={line} style={styles.detailLine}>
            {line}
          </Text>
        ))}
      </View>

      <Text style={styles.prompt}>{prompt}</Text>

      <View style={styles.optionsColumn}>
        {options.map(option => {
          const tone = TONE_STYLES[option.tone];
          return (
            <Pressable
              key={option.label}
              style={[
                styles.optionCard,
                { backgroundColor: tone.background },
                optionBordered ? { borderWidth: 1.5, borderColor: tone.border } : null,
              ]}
              onPress={option.onPress}
            >
              {option.icon ? (
                <View style={[styles.optionIcon, { backgroundColor: colors.white }]}>
                  <Icon name={option.icon} size={16} color={tone.color} />
                </View>
              ) : null}
              <View style={styles.optionTextColumn}>
                <Text style={[styles.optionLabel, { color: tone.color }]}>{option.label}</Text>
                {option.hint ? <Text style={styles.optionHint}>{option.hint}</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </FlowStatusScreen>
  );
}

const styles = StyleSheet.create({
  detailCard: {
    width: '100%',
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    gap: 2,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailTitle: {
    ...typography.bodySemibold,
    color: colors.error,
  },
  detailLine: {
    ...typography.caption,
    color: '#B91C1C',
  },
  prompt: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  optionsColumn: {
    width: '100%',
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextColumn: {
    flex: 1,
    gap: 1,
  },
  optionLabel: {
    ...typography.labelSemibold,
  },
  optionHint: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
});
