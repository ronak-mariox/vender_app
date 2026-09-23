import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Offer, useOffers } from '../../context/OffersContext';
import { OfferCard } from './OfferCard';
import { OfferActionsSheet } from './OfferActionsSheet';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OffersOverview'>;

export function OffersScreen({ navigation }: Props) {
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

  const stats = useMemo(() => {
    const activeOffers = offers.filter(offer => offer.status === 'active');
    const totalReach = offers.reduce((sum, offer) => sum + (offer.estimatedReach ?? 0), 0);
    const revenue = activeOffers.reduce((sum, offer) => sum + (offer.revenueGenerated ?? 0), 0);
    return { activeCount: activeOffers.length, totalReach, revenue };
  }, [offers]);

  const tabs = [
    { key: 'all', label: `All (${offers.length})`, active: true, onPress: () => {} },
    { key: 'active', label: `Active (${counts.active})`, active: false, onPress: () => navigation.navigate('ActiveOffers') },
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

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeCount}</Text>
            <Text style={styles.statLabel}>Active Offers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalReach.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Total Reach</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{stats.revenue.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Revenue from Offers</Text>
          </View>
        </View>

        <View style={styles.list}>
          {offers.length === 0 ? (
            <Text style={styles.emptyText}>No offers yet. Create your first offer to get started.</Text>
          ) : (
            offers.map(offer => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
                onMenuPress={() => setMenuOffer(offer)}
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
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  statValue: {
    fontFamily: fontFamilies.bold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: fontFamilies.regular,
    fontSize: 10,
    lineHeight: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.huge,
  },
});
