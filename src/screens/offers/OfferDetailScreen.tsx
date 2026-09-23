import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOffers, OfferStatus } from '../../context/OffersContext';
import { offerTypeLabel } from './OfferCard';
import { OfferActionsSheet } from './OfferActionsSheet';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OfferDetail'>;

const STATUS_CHIP_LABEL: Record<OfferStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  paused: 'Paused',
};

export function OfferDetailScreen({ navigation, route }: Props) {
  const { offerId } = route.params;
  const { getOffer, duplicateOffer } = useOffers();
  const offer = getOffer(offerId);
  const [actionsVisible, setActionsVisible] = useState(false);

  if (!offer) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>This offer could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  function handleEdit() {
    navigation.navigate('CreateOffer', { offerId });
  }

  function handlePauseResume() {
    navigation.navigate('PauseOffer', { offerId });
  }

  function handleDelete() {
    navigation.navigate('DeleteOffer', { offerId });
  }

  function handleDuplicateRelaunch() {
    const clone = duplicateOffer(offerId);
    navigation.navigate('CreateOffer', { offerId: clone.id });
  }

  function handleViewFullReport() {
    Alert.alert('Coming soon', 'Full offer reporting is coming soon.');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {offer.status === 'expired' ? (
        <View style={styles.expiredBanner}>
          <Icon name="bell" size={16} color={colors.warningDark} strokeWidth={2} />
          <Text style={styles.expiredBannerText}>
            <Text style={styles.expiredBannerTitle}>Offer Expired</Text>
            {'  '}
            <Text style={styles.expiredBannerMeta}>
              {offer.name} ended {offer.endDateLabel}
            </Text>
          </Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTitleColumn}>
              <Text style={styles.cardTitle}>{offer.name}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{offerTypeLabel(offer)}</Text>
                </View>
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipText}>{STATUS_CHIP_LABEL[offer.status]}</Text>
                </View>
              </View>
            </View>
            <Pressable onPress={() => setActionsVisible(true)} hitSlop={8} style={styles.menuButton}>
              <Icon name="more-vertical" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Final Performance</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{offer.usesCount.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>Total uses</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>₹{offer.revenueGenerated.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>Revenue generated</Text>
            </View>
          </View>

          {offer.topProduct ? (
            <View style={styles.topProductRow}>
              <View style={styles.topProductTextColumn}>
                <Text style={styles.topProductLabel}>Top performing product</Text>
                <Text style={styles.topProductName}>{offer.topProduct.name}</Text>
              </View>
              <View style={styles.topProductStatColumn}>
                <Text style={styles.topProductUnits}>{offer.topProduct.unitsSold} units</Text>
                <Text style={styles.topProductSubtext}>sold with offer</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.footerRow}>
            <Pressable style={styles.duplicateButton} onPress={handleDuplicateRelaunch}>
              <Text style={styles.duplicateButtonText}>Duplicate & Relaunch</Text>
            </Pressable>
            <Pressable style={styles.reportButton} onPress={handleViewFullReport}>
              <Text style={styles.reportButtonText}>View Full Report</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionTitle}>Re-run this offer?</Text>
          <Text style={styles.suggestionBody}>
            Duplicate {offer.name} and update the dates to relaunch it for your customers.
          </Text>
          {offer.runDaysLabel ? (
            <View style={styles.suggestionNoteRow}>
              <View style={styles.suggestionDot} />
              <Text style={styles.suggestionNote}>{offer.runDaysLabel}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <OfferActionsSheet
        visible={actionsVisible}
        offer={offer}
        onClose={() => setActionsVisible(false)}
        onEdit={handleEdit}
        onPauseResume={handlePauseResume}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  expiredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  expiredBannerText: {
    flex: 1,
  },
  expiredBannerTitle: {
    ...typography.bodySemibold,
    color: colors.warningDark,
  },
  expiredBannerMeta: {
    ...typography.label,
    color: '#92400E',
  },
  body: {
    padding: spacing.xxl,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitleColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  typeBadgeText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  statusChip: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  statusChipText: {
    ...typography.tinyBold,
    color: '#374151',
  },
  menuButton: {
    padding: spacing.xs,
  },
  sectionLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    letterSpacing: 0.48,
    textTransform: 'uppercase',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.bodySemibold,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.tiny,
    fontSize: 10,
    color: colors.textSecondary,
    paddingTop: 2,
  },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
  },
  topProductTextColumn: {
    gap: 2,
  },
  topProductLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  topProductName: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  topProductStatColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  topProductUnits: {
    ...typography.labelSemibold,
    fontWeight: '700',
    color: colors.primary,
  },
  topProductSubtext: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
  },
  duplicateButton: {
    flex: 1,
    height: 42,
    borderRadius: radii.sm + 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duplicateButtonText: {
    ...typography.labelSemibold,
    color: colors.white,
  },
  reportButton: {
    flex: 1,
    height: 42,
    borderRadius: radii.sm + 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonText: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  suggestionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  suggestionTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  suggestionBody: {
    ...typography.label,
    color: colors.textSecondary,
    paddingTop: spacing.sm,
  },
  suggestionNoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  suggestionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 5,
  },
  suggestionNote: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
});
