import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, Button, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProfile } from '../../context/ProfileContext';
import { colors, fontFamilies, radii, shadows, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileBankDetails'>;

function formatSettlementDate(value: string): string {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAmount(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function ProfileBankDetailsScreen({ navigation }: Props) {
  const { bankDetails, settlements, bankDetailsRequestStatus } = useProfile();
  const isPendingReview = bankDetailsRequestStatus === 'pending';

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Bank Details" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isPendingReview ? (
            <View style={styles.pendingBanner}>
              <Icon name="clock" size={16} color={colors.warningDark} />
              <Text style={styles.pendingText}>Change request pending admin review</Text>
            </View>
          ) : (
            <View style={styles.verifiedBanner}>
              <Icon name="shield-check" size={16} color={colors.primaryDark} />
              <Text style={styles.verifiedText}>Bank account verified</Text>
            </View>
          )}

          <LinearGradient
            colors={[colors.primaryDark, '#0E6647']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.cardTopRow}>
              <View>
                <Text style={styles.cardLabel}>BANK</Text>
                <Text style={styles.cardBankName}>{bankDetails.bankName}</Text>
              </View>
              <View style={styles.cardIconCircle}>
                <Icon name="credit-card" size={20} color={colors.white} />
              </View>
            </View>

            <View style={styles.cardBlock}>
              <Text style={styles.cardLabel}>ACCOUNT HOLDER</Text>
              <Text style={styles.cardValue}>{bankDetails.accountHolderName.toUpperCase()}</Text>
            </View>

            <View style={styles.cardRow}>
              <View style={styles.cardColumn}>
                <Text style={styles.cardLabel}>ACCOUNT NO.</Text>
                <Text style={[styles.cardValue, styles.cardValueTracked]}>{bankDetails.accountNumber}</Text>
              </View>
              <View style={styles.cardColumn}>
                <Text style={styles.cardLabel}>IFSC</Text>
                <Text style={styles.cardIfscValue}>{bankDetails.ifsc}</Text>
              </View>
            </View>
          </LinearGradient>

          <Text style={styles.sectionHeader}>Settlement History</Text>
          {settlements.length > 0 ? (
            <View style={styles.settlementCard}>
              {settlements.map((entry, index) => (
                <View
                  key={entry.id}
                  style={[styles.settlementRow, index < settlements.length - 1 && styles.settlementRowDivider]}
                >
                  <View style={styles.settlementTextColumn}>
                    <Text style={styles.settlementAmount}>{formatAmount(entry.netPayout)}</Text>
                    <Text style={styles.settlementDate}>
                      {entry.orderNumber} · {formatSettlementDate(entry.settledAt)}
                    </Text>
                  </View>
                  <Badge label="Credited" tone="success" />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySettlements}>
              <Text style={styles.emptySettlementsText}>No settlements yet.</Text>
            </View>
          )}

          <View style={styles.buttonWrap}>
            <Button
              label={isPendingReview ? 'Change Request Pending' : 'Edit Bank Details'}
              disabled={isPendingReview}
              onPress={() => navigation.navigate('ProfileEditBankDetails')}
            />
          </View>

          <View style={styles.infoBanner}>
            <Icon name="info" size={14} color={colors.warningDark} />
            <Text style={styles.infoBannerText}>
              {isPendingReview
                ? 'Your bank details will update once the admin approves your change request.'
                : 'Changing bank details requires admin approval before it takes effect.'}
            </Text>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
  },
  verifiedText: {
    ...typography.labelSemibold,
    color: colors.primaryDark,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.warningSurface,
  },
  pendingText: {
    ...typography.labelSemibold,
    color: colors.warningDark,
  },
  card: {
    padding: spacing.xxl,
    borderRadius: radii.xl,
    ...shadows.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBlock: {
    paddingTop: spacing.xxxl,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
  },
  cardColumn: {
    gap: 0,
  },
  cardLabel: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBankName: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
    lineHeight: 24,
    color: colors.white,
    paddingTop: 2,
  },
  cardValue: {
    ...typography.button,
    color: colors.white,
    paddingTop: 2,
  },
  cardValueTracked: {
    letterSpacing: 2,
  },
  cardIfscValue: {
    ...typography.bodySemibold,
    color: colors.white,
    paddingTop: 2,
  },
  sectionHeader: {
    fontFamily: fontFamilies.semibold,
    fontSize: 11,
    lineHeight: 16.5,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  settlementCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settlementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  settlementRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settlementTextColumn: {
    gap: 2,
  },
  settlementAmount: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  settlementDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptySettlements: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySettlementsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  buttonWrap: {
    paddingTop: spacing.xs,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.warningSurface,
  },
  infoBannerText: {
    ...typography.caption,
    color: colors.warningDark,
    flex: 1,
  },
});
