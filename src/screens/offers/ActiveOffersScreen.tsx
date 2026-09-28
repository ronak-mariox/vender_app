import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Badge } from '../../components';
import { Offer, useOffers } from '../../context/OffersContext';
import { OffersListLayout, offersForTab, useOfferActions } from './OffersListLayout';
import { formatINR, formatOfferDate, offerTypeLabel } from './offerFormat';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ActiveOffers'>;

// Design-specific accent tints that don't map to an existing theme token.
const STAT_TILE_BG = '#ECFDF3';
const STAT_TILE_VALUE = '#027A48';
const STAT_TILE_LABEL = '#047857';
const CARD_BORDER_ACTIVE = '#A6F4C5';
const PAUSE_BORDER = '#FDE68A';

export function ActiveOffersScreen({ navigation }: Props) {
  const { offers } = useOffers();
  const { openMenu, sheet, editOffer, togglePause, isOfferPending } = useOfferActions();
  const activeOffers = useMemo(() => offersForTab(offers, 'active'), [offers]);

  return (
    <OffersListLayout
      activeTab="active"
      itemCount={activeOffers.length}
      emptyText="No active offers right now."
      overlay={sheet}
    >
      {activeOffers.map(offer => (
        <ActiveOfferCard
          key={offer.id}
          offer={offer}
          pending={isOfferPending(offer.id)}
          onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
          onMenuPress={() => openMenu(offer)}
          onPauseResume={() => togglePause(offer)}
          onEdit={() => editOffer(offer)}
        />
      ))}
    </OffersListLayout>
  );
}

type ActiveOfferCardProps = {
  offer: Offer;
  pending: boolean;
  onPress: () => void;
  onMenuPress: () => void;
  onPauseResume: () => void;
  onEdit: () => void;
};

function ActiveOfferCard({ offer, pending, onPress, onMenuPress, onPauseResume, onEdit }: ActiveOfferCardProps) {
  const paused = offer.status === 'paused';
  const avgRevenue = offer.usesCount > 0 ? offer.revenueGenerated / offer.usesCount : 0;

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
            <Badge label={paused ? 'Paused' : 'Active'} tone={paused ? 'warning' : 'success'} />
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
          <Text style={styles.statTileLabel}>Revenue</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>{formatINR(avgRevenue)}</Text>
          <Text style={styles.statTileLabel}>Avg per use</Text>
        </View>
      </View>

      <View style={styles.endsRow}>
        <Icon name="calendar" size={14} color={colors.textSecondary} />
        <Text style={styles.endsText}>Ends {formatOfferDate(offer.endDate)}</Text>
      </View>

      <View style={styles.footerRow}>
        <Pressable
          style={[styles.pauseButton, pending && styles.buttonDisabled]}
          onPress={onPauseResume}
          disabled={pending}
        >
          {pending ? (
            <ActivityIndicator color={colors.warningDark} />
          ) : (
            <Text style={styles.pauseButtonText}>{paused ? 'Resume' : 'Pause'}</Text>
          )}
        </Pressable>
        <Pressable style={[styles.editButton, pending && styles.buttonDisabled]} onPress={onEdit} disabled={pending}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: CARD_BORDER_ACTIVE,
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
    backgroundColor: STAT_TILE_BG,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  statTileValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 13,
    lineHeight: 19.5,
    color: STAT_TILE_VALUE,
  },
  statTileLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: 10,
    lineHeight: 15,
    color: STAT_TILE_LABEL,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pauseButton: {
    flex: 1,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: PAUSE_BORDER,
    backgroundColor: colors.warningSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButtonText: {
    ...typography.bodySemibold,
    color: colors.warningDark,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  endsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  endsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
