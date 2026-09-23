import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Badge, InfoBanner } from '../../components';
import { Offer, useOffers } from '../../context/OffersContext';
import { offerTypeLabel } from './OfferCard';
import { OfferActionsSheet } from './OfferActionsSheet';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ExpiredOffers'>;

export function ExpiredOffersScreen({ navigation }: Props) {
  const { offers, duplicateOffer } = useOffers();
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

  const expiredOffers = useMemo(() => offers.filter(offer => offer.status === 'expired'), [offers]);

  const tabs = [
    { key: 'all', label: `All (${offers.length})`, active: false, onPress: () => navigation.navigate('OffersOverview') },
    { key: 'active', label: `Active (${counts.active})`, active: false, onPress: () => navigation.navigate('ActiveOffers') },
    { key: 'scheduled', label: `Scheduled (${counts.scheduled})`, active: false, onPress: () => navigation.navigate('ScheduledOffers') },
    { key: 'expired', label: `Expired (${counts.expired})`, active: true, onPress: () => {} },
  ];

  const handleDuplicate = (offer: Offer) => {
    const clone = duplicateOffer(offer.id);
    navigation.navigate('CreateOffer', { offerId: clone.id });
  };

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

        {expiredOffers.length > 0 ? (
          <View style={styles.bannerWrapper}>
            <InfoBanner
              variant="warning"
              message="Reactivate by creating a new offer from a duplicate."
              bordered
            />
          </View>
        ) : null}

        <View style={styles.list}>
          {expiredOffers.length === 0 ? (
            <Text style={styles.emptyText}>No expired offers.</Text>
          ) : (
            expiredOffers.map(offer => (
              <ExpiredOfferCard
                key={offer.id}
                offer={offer}
                onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
                onMenuPress={() => setMenuOffer(offer)}
                onDuplicate={() => handleDuplicate(offer)}
                onViewReport={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
              />
            ))
          )}
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

type ExpiredOfferCardProps = {
  offer: Offer;
  onPress: () => void;
  onMenuPress: () => void;
  onDuplicate: () => void;
  onViewReport: () => void;
};

function ExpiredOfferCard({ offer, onPress, onMenuPress, onDuplicate, onViewReport }: ExpiredOfferCardProps) {
  const avgDiscount = offer.avgOrderValue ?? (offer.usesCount > 0 ? Math.round(offer.revenueGenerated / offer.usesCount) : 0);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTopRow}>
        <View style={styles.cardTextColumn}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {offer.name}
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
          <Text style={styles.statTileValue}>₹{offer.revenueGenerated.toLocaleString('en-IN')}</Text>
          <Text style={styles.statTileLabel}>Revenue generated</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>₹{avgDiscount.toLocaleString('en-IN')}</Text>
          <Text style={styles.statTileLabel}>Avg discount</Text>
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
  bannerWrapper: {
    marginTop: spacing.xl,
  },
  list: {
    marginTop: spacing.lg,
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
