import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { useOffers } from '../../context/OffersContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OfferPublished'>;

const DOTS = [
  { top: 118, left: 56, size: 9, color: '#FBBF24' },
  { top: 96, left: 300, size: 6, color: '#60A5FA' },
  { top: 152, left: 122, size: 5, color: '#34D399' },
  { top: 172, left: 340, size: 6, color: '#34D399' },
  { top: 232, left: 371, size: 7, color: '#F87171' },
  { top: 256, left: 78, size: 6, color: '#60A5FA' },
  { top: 336, left: 380, size: 6, color: '#FBBF24' },
  { top: 356, left: 44, size: 6, color: '#A78BFA' },
];

export function OfferPublishedScreen({ navigation, route }: Props) {
  const { offerId } = route.params;
  const { getOffer } = useOffers();
  const offer = getOffer(offerId);

  const discountLabel = offer
    ? `${offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`} on ${
        offer.scope === 'entire-store' ? 'Entire Store' : offer.categoryLabel
      }`
    : '—';
  const durationLabel = offer ? offer.durationLabel.split(' · ')[0] : '—';

  function handleViewOffer() {
    navigation.reset({
      index: 1,
      routes: [{ name: 'OffersOverview' }, { name: 'OfferDetail', params: { offerId } }],
    });
  }

  function handleCreateAnother() {
    navigation.reset({ index: 0, routes: [{ name: 'CreateOffer', params: {} }] });
  }

  return (
    <View style={styles.root}>
      {DOTS.map((dot, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              backgroundColor: dot.color,
            },
          ]}
        />
      ))}
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.checkCircle}>
            <Icon name="check" size={44} color={colors.white} strokeWidth={3} />
          </View>
          <Text style={styles.heading}>Offer Live!</Text>
          <Text style={styles.subtitle}>
            {offer?.name || 'Your offer'} is now active{'\n'}and visible to customers.
          </Text>

          <View style={styles.summaryCard}>
            <SummaryRow label="Offer" value={offer?.name || '—'} first />
            <SummaryRow label="Discount" value={discountLabel} />
            <SummaryRow label="Duration" value={durationLabel} />
            {offer?.estimatedReach !== undefined ? (
              <SummaryRow label="Est. Reach" value={`${offer.estimatedReach} customers`} />
            ) : null}
          </View>

          <View style={styles.footer}>
            <View style={styles.footerButton}>
              <Button label="View Offer" variant="outline" onPress={handleViewOffer} />
            </View>
            <View style={styles.footerButton}>
              <Button label="Create Another" onPress={handleCreateAnother} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function SummaryRow({ label, value, first }: { label: string; value: string; first?: boolean }) {
  return (
    <View style={[styles.summaryRow, !first && styles.summaryRowDivider]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl + spacing.xs,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primarySurface,
    marginBottom: spacing.xl,
  },
  heading: {
    ...typography.h1,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.78,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLarge,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: '#A6F4C5',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xxxl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  summaryRowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#A6F4C5',
  },
  summaryLabel: {
    ...typography.label,
    color: '#047857',
  },
  summaryValue: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    width: '100%',
  },
  footerButton: {
    flex: 1,
  },
});
