import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Badge } from '../../components';
import { Offer, useOffers } from '../../context/OffersContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { OffersListLayout, offersForTab, useOfferActions } from './OffersListLayout';
import { formatOfferDateTime, offerDiscountLabel, offerEligibleProductCount, offerTypeLabel } from './offerFormat';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ScheduledOffers'>;

// Design-specific "scheduled" blue tints that don't map to an existing theme token.
const BLUE_BG = '#EFF6FF';
const BLUE_BORDER = '#BFDBFE';
const BLUE_VALUE = '#1D4ED8';
const BLUE_LABEL = '#2563EB';

export function ScheduledOffersScreen({ navigation }: Props) {
  const { offers } = useOffers();
  const { products } = useProductCatalog();
  const { openMenu, sheet, editOffer, deleteOffer, isOfferPending } = useOfferActions();
  const scheduledOffers = useMemo(() => offersForTab(offers, 'scheduled'), [offers]);

  return (
    <OffersListLayout
      activeTab="scheduled"
      itemCount={scheduledOffers.length}
      emptyText="No scheduled offers right now."
      overlay={sheet}
    >
      {scheduledOffers.map(offer => (
        <ScheduledOfferCard
          key={offer.id}
          offer={offer}
          eligibleProducts={offerEligibleProductCount(offer, products)}
          pending={isOfferPending(offer.id)}
          onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
          onMenuPress={() => openMenu(offer)}
          onCancel={() => deleteOffer(offer)}
          onEdit={() => editOffer(offer)}
        />
      ))}
    </OffersListLayout>
  );
}

type ScheduledOfferCardProps = {
  offer: Offer;
  eligibleProducts: number;
  pending: boolean;
  onPress: () => void;
  onMenuPress: () => void;
  onCancel: () => void;
  onEdit: () => void;
};

function ScheduledOfferCard({
  offer,
  eligibleProducts,
  pending,
  onPress,
  onMenuPress,
  onCancel,
  onEdit,
}: ScheduledOfferCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardTextColumn}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {offer.title}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{offerTypeLabel(offer)}</Text>
            </View>
            <Badge label="Scheduled" tone="info" />
          </View>
        </View>
        <Pressable onPress={onMenuPress} hitSlop={8} style={styles.menuButton}>
          <Icon name="more-vertical" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.countdownBanner}>
        <Icon name="clock" size={16} color={BLUE_VALUE} />
        <Text style={styles.countdownText}>Starts {formatOfferDateTime(offer.startDate)}</Text>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>{offerDiscountLabel(offer)}</Text>
          <Text style={styles.statTileLabel}>Discount</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>
            {offer.scope === 'entire-store' ? 'All' : eligibleProducts.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.statTileLabel}>Eligible products</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Pressable style={[styles.cancelButton, pending && styles.buttonDisabled]} onPress={onCancel} disabled={pending}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.editButton, pending && styles.buttonDisabled]} onPress={onEdit} disabled={pending}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.6,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: BLUE_BORDER,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTextColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: fontFamilies.bold,
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
  menuButton: {
    padding: spacing.xs,
  },
  countdownBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: BLUE_BG,
    borderWidth: 1,
    borderColor: BLUE_BORDER,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  countdownText: {
    ...typography.labelSemibold,
    color: BLUE_VALUE,
  },
  statGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: BLUE_BG,
    borderRadius: radii.sm,
    padding: spacing.lg,
  },
  statTileValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 21,
    color: BLUE_VALUE,
  },
  statTileLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: 10,
    lineHeight: 15,
    color: BLUE_LABEL,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.bodySemibold,
    color: colors.error,
  },
  editButton: {
    flex: 1,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    ...typography.bodySemibold,
    color: colors.primary,
  },
});
