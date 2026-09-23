import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../../icons/Icon';
import { Badge, BadgeTone } from '../../components';
import { Offer, OfferStatus } from '../../context/OffersContext';
import { colors, radii, spacing, typography } from '../../theme';

const STATUS_META: Record<OfferStatus, { label: string; tone: BadgeTone }> = {
  active: { label: 'Active', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  expired: { label: 'Expired', tone: 'neutral' },
  paused: { label: 'Paused', tone: 'warning' },
};

export function offerTypeLabel(offer: Pick<Offer, 'discountType' | 'discountValue'>) {
  return offer.discountType === 'percentage'
    ? `${offer.discountValue}% Percentage Discount`
    : `₹${offer.discountValue} Fixed Amount Off`;
}

type Props = {
  offer: Offer;
  onPress: () => void;
  onMenuPress: () => void;
};

export function OfferCard({ offer, onPress, onMenuPress }: Props) {
  const status = STATUS_META[offer.status];
  const dateRow =
    offer.status === 'scheduled'
      ? `Starts ${offer.startDateLabel}`
      : offer.status === 'expired'
        ? `Ended ${offer.endDateLabel}`
        : `Ends ${offer.endDateLabel}`;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <View style={styles.textColumn}>
          <Text style={styles.name} numberOfLines={1}>
            {offer.name}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{offerTypeLabel(offer)}</Text>
            </View>
            <Badge label={status.label} tone={status.tone} />
          </View>
        </View>
        <Pressable onPress={onMenuPress} hitSlop={8} style={styles.menuButton}>
          <Icon name="more-vertical" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        {offer.status !== 'scheduled' ? (
          <View style={styles.metaItem}>
            <Icon name="users" size={13} color={colors.textSecondary} />
            <Text style={styles.metaText}>{offer.usesCount.toLocaleString('en-IN')} uses</Text>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <Icon name="calendar" size={15} color={colors.textSecondary} />
          <Text style={styles.metaText}>{dateRow}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  name: {
    ...typography.bodySemibold,
    fontSize: 15,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
