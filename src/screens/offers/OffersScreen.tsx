import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useOffers } from '../../context/OffersContext';
import { OfferCard } from './OfferCard';
import { OffersListLayout, useOfferActions } from './OffersListLayout';
import { formatINR } from './offerFormat';
import { colors, fontFamilies, radii, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OffersOverview'>;

export function OffersScreen({ navigation }: Props) {
  const { offers } = useOffers();
  const { openMenu, sheet } = useOfferActions();

  const stats = useMemo(
    () => ({
      activeCount: offers.filter(offer => offer.status === 'active').length,
      totalUses: offers.reduce((sum, offer) => sum + offer.usesCount, 0),
      revenue: offers.reduce((sum, offer) => sum + offer.revenueGenerated, 0),
    }),
    [offers],
  );

  return (
    <OffersListLayout
      activeTab="all"
      itemCount={offers.length}
      emptyText="No offers yet. Create your first offer to get started."
      overlay={sheet}
      beforeList={
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeCount}</Text>
            <Text style={styles.statLabel}>Active Offers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalUses.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Total Uses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatINR(stats.revenue)}</Text>
            <Text style={styles.statLabel}>Revenue from Offers</Text>
          </View>
        </View>
      }
    >
      {offers.map(offer => (
        <OfferCard
          key={offer.id}
          offer={offer}
          onPress={() => navigation.navigate('OfferDetail', { offerId: offer.id })}
          onMenuPress={() => openMenu(offer)}
        />
      ))}
    </OffersListLayout>
  );
}

const styles = StyleSheet.create({
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
});
