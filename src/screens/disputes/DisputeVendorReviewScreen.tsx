import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useDisputes } from '../../context/DisputesContext';
import { Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeVendorReview'>;

export function DisputeVendorReviewScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute } = useDisputes();
  const dispute = getDispute(disputeId);

  if (!dispute) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Your Review" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Dispute not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Your Review" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <Icon name="info" size={18} color={colors.primaryDark} strokeWidth={2} />
          <Text style={styles.infoBannerText}>
            Review the customer&apos;s claim and decide whether to accept or dispute.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Issue Recap</Text>
          <Text style={styles.recapLine}>
            <Text style={styles.recapRegular}>Damaged </Text>
            <Text style={styles.recapBold}>{dispute.productName}</Text>
            <Text style={styles.recapRegular}> — Customer claims </Text>
            <Text style={styles.recapBoldRed}>₹{dispute.claimAmount}</Text>
            <Text style={styles.recapRegular}> refund</Text>
          </Text>
          <Text style={styles.recapStatement}>&ldquo;{dispute.customerStatement}&rdquo;</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Options</Text>

        <View style={[styles.optionCard, styles.optionCardAccept]}>
          <View style={styles.optionRow}>
            <View style={[styles.optionIconWrap, styles.optionIconWrapAccept]}>
              <Icon name="check" size={16} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.optionTextColumn}>
              <Text style={styles.optionTitle}>Accept the Issue</Text>
              <Text style={styles.optionBody}>
                Customer receives a ₹{dispute.claimAmount} refund. The amount will be deducted
                from your next settlement.
              </Text>
              <Text style={styles.optionNoteGreen}>
                Rating unaffected if accepted within 48 hours.
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.optionCard, styles.optionCardDispute]}>
          <View style={styles.optionRow}>
            <View style={[styles.optionIconWrap, styles.optionIconWrapDispute]}>
              <Icon name="x" size={16} color={colors.error} strokeWidth={2.5} />
            </View>
            <View style={styles.optionTextColumn}>
              <Text style={styles.optionTitle}>Dispute the Issue</Text>
              <Text style={styles.optionBody}>
                Submit your evidence for review. Support team will make a binding decision within
                72 hours.
              </Text>
              <Text style={styles.optionNoteRed}>Outcome may include partial or full refund.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <Button
            label="Accept Issue"
            onPress={() => navigation.navigate('DisputeAcceptIssue', { disputeId })}
          />
        </View>
        <View style={styles.footerButton}>
          <RedOutlineButton
            label="Dispute Issue"
            onPress={() => navigation.navigate('DisputeIssueDispute', { disputeId })}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function RedOutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.redOutlineButton, pressed && styles.redOutlineButtonPressed]}
    >
      <Text style={styles.redOutlineButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.xl,
    gap: 14,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.lg + 2,
  },
  infoBannerText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.primaryDark,
    flex: 1,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  cardTitle: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recapLine: {
    paddingTop: spacing.md,
  },
  recapRegular: {
    ...typography.body,
    color: colors.textPrimary,
  },
  recapBold: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  recapBoldRed: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 22.4,
    color: colors.error,
  },
  recapStatement: {
    ...typography.label,
    fontStyle: 'italic',
    color: colors.textSecondary,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  optionCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.xl,
  },
  optionCardAccept: {
    borderColor: colors.primary,
  },
  optionCardDispute: {
    borderColor: colors.errorBorder,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  optionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconWrapAccept: {
    backgroundColor: colors.primarySurface,
  },
  optionIconWrapDispute: {
    backgroundColor: colors.errorSurface,
  },
  optionTextColumn: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    ...typography.bodySemibold,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  optionBody: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  optionNoteGreen: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
    paddingTop: 2,
  },
  optionNoteRed: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.error,
    paddingTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  footerButton: {
    flex: 1,
  },
  redOutlineButton: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  redOutlineButtonPressed: {
    opacity: 0.85,
  },
  redOutlineButtonLabel: {
    ...typography.button,
    color: colors.error,
  },
});
