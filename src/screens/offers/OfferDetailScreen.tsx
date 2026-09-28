import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOffers, OfferStatus } from '../../context/OffersContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { getApiErrorMessage } from '../../services/api';
import { useOfferActions } from './OffersListLayout';
import {
  formatINR,
  formatOfferDate,
  formatOfferDateTime,
  offerEligibleProductCount,
  offerScopeLabel,
  offerTypeLabel,
} from './offerFormat';
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
  const { getOffer, fetchOffer } = useOffers();
  const { products, categories } = useProductCatalog();
  const { openMenu, sheet, editOffer, duplicateOffer, deleteOffer, togglePause, isOfferPending } = useOfferActions();
  const offer = getOffer(offerId);
  const [loading, setLoading] = useState(!offer);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      await fetchOffer(offerId);
      setLoadError(null);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Could not load this offer.'));
    }
  }, [fetchOffer, offerId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
        <Icon name="arrow-left" size={18} color={colors.textPrimary} />
      </Pressable>
      <Text style={styles.headerTitle}>Offer Details</Text>
    </View>
  );

  if (!offer) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        {header}
        <View style={styles.emptyState}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Text style={styles.emptyStateText}>{loadError ?? 'This offer could not be found.'}</Text>
              <Pressable
                style={styles.retryButton}
                onPress={() => {
                  setLoading(true);
                  load().finally(() => setLoading(false));
                }}
              >
                <Text style={styles.reportButtonText}>Retry</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  const pending = isOfferPending(offer.id);
  const coveredCount = offerEligibleProductCount(offer, products);
  const detailRows = [
    { label: 'Applies to', value: `${offerScopeLabel(offer, products, categories)} · ${coveredCount} products` },
    { label: 'Min. order', value: offer.minOrderValueEnabled ? formatINR(offer.minOrderValue) : 'None' },
    { label: 'Customers', value: offer.customerEligibility === 'new-only' ? 'New customers only' : 'All customers' },
    { label: 'Starts', value: formatOfferDateTime(offer.startDate) },
    { label: 'Ends', value: formatOfferDateTime(offer.endDate) },
  ];

  const isExpired = offer.status === 'expired';
  const primaryAction = isExpired
    ? { label: 'Duplicate & Relaunch', onPress: () => duplicateOffer(offer) }
    : { label: 'Edit Offer', onPress: () => editOffer(offer) };
  const secondaryAction =
    offer.status === 'active' || offer.status === 'paused'
      ? { label: offer.status === 'paused' ? 'Resume' : 'Pause', onPress: () => togglePause(offer) }
      : { label: 'Delete', onPress: () => deleteOffer(offer) };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {header}
      {isExpired ? (
        <View style={styles.expiredBanner}>
          <Icon name="bell" size={16} color={colors.warningDark} strokeWidth={2} />
          <Text style={styles.expiredBannerText}>
            <Text style={styles.expiredBannerTitle}>Offer Expired</Text>
            {'  '}
            <Text style={styles.expiredBannerMeta}>
              {offer.title} ended {formatOfferDate(offer.endDate)}
            </Text>
          </Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTitleColumn}>
              <Text style={styles.cardTitle}>{offer.title}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{offerTypeLabel(offer)}</Text>
                </View>
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipText}>{STATUS_CHIP_LABEL[offer.status]}</Text>
                </View>
              </View>
            </View>
            <Pressable onPress={() => openMenu(offer)} hitSlop={8} style={styles.menuButton}>
              <Icon name="more-vertical" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>{isExpired ? 'Final Performance' : 'Performance'}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{offer.usesCount.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>Total uses</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{formatINR(offer.revenueGenerated)}</Text>
              <Text style={styles.statLabel}>Revenue generated</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Details</Text>
          {detailRows.map(row => (
            <View key={row.label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}

          <View style={styles.footerRow}>
            <Pressable
              style={[styles.duplicateButton, pending && styles.buttonDisabled]}
              onPress={primaryAction.onPress}
              disabled={pending}
            >
              <Text style={styles.duplicateButtonText}>{primaryAction.label}</Text>
            </Pressable>
            <Pressable
              style={[styles.reportButton, pending && styles.buttonDisabled]}
              onPress={secondaryAction.onPress}
              disabled={pending}
            >
              {pending ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.reportButtonText}>{secondaryAction.label}</Text>
              )}
            </Pressable>
          </View>
        </View>

        {isExpired ? (
          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>Re-run this offer?</Text>
            <Text style={styles.suggestionBody}>
              Duplicate {offer.title} and update the dates to relaunch it for your customers.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {sheet}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
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
});
