import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Badge } from '../../components';
import { Offer, useOffers } from '../../context/OffersContext';
import { offerTypeLabel } from './OfferCard';
import { OfferActionsSheet } from './OfferActionsSheet';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ActiveOffers'>;

// Design-specific accent tints that don't map to an existing theme token.
const STAT_TILE_BG = '#ECFDF3';
const STAT_TILE_VALUE = '#027A48';
const STAT_TILE_LABEL = '#047857';
const CARD_BORDER_ACTIVE = '#A6F4C5';
const PAUSE_BORDER = '#FDE68A';

export function ActiveOffersScreen({ navigation }: Props) {
  const { offers, pauseOffer } = useOffers();
  const [menuOffer, setMenuOffer] = useState<Offer | null>(null);

  const counts = useMemo(() => {
    const result = { active: 0, scheduled: 0, expired: 0 };
    offers.forEach(offer => {
      if (offer.status === 'active') result.active += 1;
      else if (offer.status === 'scheduled') result.scheduled += 1;
      else if (offer.status === 'expired') result.expired += 1;
    });
    return result;
  }, [offers]);

  const activeOffers = useMemo(() => offers.filter(offer => offer.status === 'active'), [offers]);

  const tabs = [
    { key: 'all', label: `All (${offers.length})`, active: false, onPress: () => navigation.navigate('OffersOverview') },
    { key: 'active', label: `Active (${counts.active})`, active: true, onPress: () => {} },
    { key: 'scheduled', label: `Scheduled (${counts.scheduled})`, active: false, onPress: () => navigation.navigate('ScheduledOffers') },
    { key: 'expired', label: `Expired (${counts.expired})`, active: false, onPress: () => navigation.navigate('ExpiredOffers') },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offers & Promotions</Text>
        <Pressable style={styles.createButton} onPress={() => navigation.navigate('CreateOffer', {})}>
          <Icon name="plus" size={16} color={colors.white} />
          <Text style={styles.createButtonText}>Create Offer</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabRow}>
          {tabs.map(tab => (
            <Pressable
              key={tab.key}
              style={[styles.tabPill, tab.active && styles.tabPillActive]}
              onPress={tab.onPress}
            >
              <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.list}>
          {activeOffers.length === 0 ? (
            <Text style={styles.emptyText}>No active offers right now.</Text>
          ) : (
            activeOffers.map(offer => (
              <ActiveOfferCard
                key={offer.id}
                offer={offer}
                onMenuPress={() => setMenuOffer(offer)}
                onPause={() => pauseOffer(offer.id)}
                onEdit={() => navigation.navigate('CreateOffer', { offerId: offer.id })}
              />
            ))
          )}

          {activeOffers.length === 1 ? (
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>No other active offers</Text>
              <View style={styles.dividerLine} />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <OfferActionsSheet
        visible={!!menuOffer}
        offer={menuOffer}
        onClose={() => setMenuOffer(null)}
        onEdit={() => menuOffer && navigation.navigate('CreateOffer', { offerId: menuOffer.id })}
        onPauseResume={() => menuOffer && navigation.navigate('PauseOffer', { offerId: menuOffer.id })}
        onDelete={() => menuOffer && navigation.navigate('DeleteOffer', { offerId: menuOffer.id })}
      />
    </SafeAreaView>
  );
}

type ActiveOfferCardProps = {
  offer: Offer;
  onMenuPress: () => void;
  onPause: () => void;
  onEdit: () => void;
};

function ActiveOfferCard({ offer, onMenuPress, onPause, onEdit }: ActiveOfferCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardTextColumn}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {offer.name}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{offerTypeLabel(offer)}</Text>
            </View>
            <Badge label="Active" tone="success" />
          </View>
        </View>
        <Pressable onPress={onMenuPress} hitSlop={8} style={styles.menuButton}>
          <Icon name="more-vertical" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>{offer.usesToday ?? 0}</Text>
          <Text style={styles.statTileLabel}>Uses today</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>₹{(offer.revenueToday ?? 0).toLocaleString('en-IN')}</Text>
          <Text style={styles.statTileLabel}>Revenue today</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>₹{(offer.avgOrderValue ?? 0).toLocaleString('en-IN')}</Text>
          <Text style={styles.statTileLabel}>Avg order value</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Pressable style={styles.pauseButton} onPress={onPause}>
          <Text style={styles.pauseButtonText}>Pause</Text>
        </Pressable>
        <Pressable style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  createButtonText: {
    ...typography.labelSemibold,
    color: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tabPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    ...typography.labelSemibold,
    color: colors.white,
  },
  list: {
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.huge,
  },
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
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
