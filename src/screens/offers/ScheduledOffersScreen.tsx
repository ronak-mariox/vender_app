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

type Props = NativeStackScreenProps<AuthStackParamList, 'ScheduledOffers'>;

// Design-specific "scheduled" blue tints that don't map to an existing theme token.
const BLUE_BG = '#EFF6FF';
const BLUE_BORDER = '#BFDBFE';
const BLUE_VALUE = '#1D4ED8';
const BLUE_LABEL = '#2563EB';

export function ScheduledOffersScreen({ navigation }: Props) {
  const { offers } = useOffers();
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

  const scheduledOffers = useMemo(() => offers.filter(offer => offer.status === 'scheduled'), [offers]);

  const tabs = [
    { key: 'all', label: `All (${offers.length})`, active: false, onPress: () => navigation.navigate('OffersOverview') },
    { key: 'active', label: `Active (${counts.active})`, active: false, onPress: () => navigation.navigate('ActiveOffers') },
    { key: 'scheduled', label: `Scheduled (${counts.scheduled})`, active: true, onPress: () => {} },
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
          {scheduledOffers.length === 0 ? (
            <Text style={styles.emptyText}>No scheduled offers right now.</Text>
          ) : (
            scheduledOffers.map(offer => (
              <ScheduledOfferCard
                key={offer.id}
                offer={offer}
                onMenuPress={() => setMenuOffer(offer)}
                onCancel={() => navigation.navigate('DeleteOffer', { offerId: offer.id })}
                onEdit={() => navigation.navigate('CreateOffer', { offerId: offer.id })}
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
        onDelete={() => {
          if (menuOffer) {
            navigation.navigate('DeleteOffer', { offerId: menuOffer.id });
          }
        }}
      />
    </SafeAreaView>
  );
}

type ScheduledOfferCardProps = {
  offer: Offer;
  onMenuPress: () => void;
  onCancel: () => void;
  onEdit: () => void;
};

function ScheduledOfferCard({ offer, onMenuPress, onCancel, onEdit }: ScheduledOfferCardProps) {
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
            <Badge label="Scheduled" tone="info" />
          </View>
        </View>
        <Pressable onPress={onMenuPress} hitSlop={8} style={styles.menuButton}>
          <Icon name="more-vertical" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.countdownBanner}>
        <Icon name="clock" size={16} color={BLUE_VALUE} />
        <Text style={styles.countdownText}>Starts {offer.startDateLabel}</Text>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>{(offer.estimatedReach ?? 0).toLocaleString('en-IN')}</Text>
          <Text style={styles.statTileLabel}>Expected reach</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statTileValue}>{offer.productCount.toLocaleString('en-IN')}</Text>
          <Text style={styles.statTileLabel}>Eligible products</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
