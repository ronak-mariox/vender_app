import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Badge, InfoBanner } from '../../components';
import { Offer, useOffers } from '../../context/OffersContext';
import { OffersListLayout, offersForTab, useOfferActions } from './OffersListLayout';
import { formatINR, formatOfferDate, offerTypeLabel } from './offerFormat';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ExpiredOffers'>;

export function ExpiredOffersScreen({ navigation }: Props) {
  const { offers } = useOffers();
  const { openMenu, sheet, duplicateOffer } = useOfferActions();
  const expiredOffers = useMemo(() => offersForTab(offers, 'expired'), [offers]);

  return (
    <OffersListLayout
      activeTab="expired"
      itemCount={expiredOffers.length}
      emptyText="No expired offers."
      overlay={sheet}
      beforeList={
        expiredOffers.length > 0 ? (
          <View style={styles.bannerWrapper}>
            <InfoBanner
              variant="warning"
              message="Reactivate by creating a new offer from a duplicate."
              bordered
            />
          </View>
        ) : null
      }
    >
      {expiredOffers.map(offer => (
        <ExpiredOfferCard
          key={offer.id}
          offer={offer}
          onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
          onMenuPress={() => openMenu(offer)}
          onDuplicate={() => duplicateOffer(offer)}
          onViewReport={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
        />
      ))}
    </OffersListLayout>
  );
}

type ExpiredOfferCardProps = {
  offer: Offer;
  onPress: () => void;
  onMenuPress: () => void;
  onDuplicate: () => void;
  onViewReport: () => void;
};

function ExpiredOfferCard({ offer, onPress, onMenuPress, onDuplicate, onViewReport }: ExpiredOfferCardProps) {
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
            <Badge label="Expired" tone="neutral" />
          </View>
        </View>
        <Pressable onPress={onMenuPress} hitSlop={8} style={styles.menuButton}>
          <Icon name="more-vertical" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>{offer.usesCount.toLocaleString('en-IN')}</Text>
          <Text style={styles.statTileLabel}>Total uses</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>{formatINR(offer.revenueGenerated)}</Text>
          <Text style={styles.statTileLabel}>Revenue generated</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>{formatOfferDate(offer.endDate)}</Text>
          <Text style={styles.statTileLabel}>Ended</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Pressable style={styles.duplicateButton} onPress={onDuplicate}>
          <Text style={styles.duplicateButtonText}>Duplicate Offer</Text>
        </Pressable>
        <Pressable style={styles.reportButton} onPress={onViewReport}>
          <Text style={styles.reportButtonText}>View Report</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bannerWrapper: {
    marginTop: spacing.xl,
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
  statGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  statTileValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textPrimary,
  },
  statTileLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  duplicateButton: {
    flex: 1,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  duplicateButtonText: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  reportButton: {
    flex: 1,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonText: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
});
