import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Checkbox } from '../../components';
import { Icon } from '../../icons/Icon';
import { useOffers } from '../../context/OffersContext';
import { getApiErrorMessage } from '../../services/api';
import { formatINR } from './offerFormat';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DeleteOffer'>;

export function DeleteOfferScreen({ navigation, route }: Props) {
  const { offerId } = route.params;
  const { getOffer, deleteOffer, isOfferPending } = useOffers();
  const offer = getOffer(offerId);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = isOfferPending(offerId);

  function handleClose() {
    if (pending) return;
    navigation.goBack();
  }

  async function handleConfirm() {
    if (!confirmed || pending) return;
    setError(null);
    try {
      await deleteOffer(offerId);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete the offer.'));
      return;
    }
    const state = navigation.getState();
    const previous = state.routes[state.index - 1];
    if (previous?.name === 'OfferDetail') {
      navigation.pop(2);
    } else {
      navigation.goBack();
    }
  }

  return (
    <Pressable style={styles.backdrop} onPress={handleClose}>
      <Pressable style={styles.sheetWrapper} onPress={event => event.stopPropagation()}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.iconCircle}>
            <Icon name="trash" size={32} color={colors.error} strokeWidth={2} />
          </View>

          <Text style={styles.heading}>Delete Offer?</Text>
          <Text style={styles.subtitle}>
            This action cannot be undone. {offer?.title || 'This offer'} will be permanently deleted.
          </Text>

          <View style={styles.dataBox}>
            <Text style={styles.dataBoxTitle}>Data that will be deleted:</Text>
            <View style={styles.dataStatsRow}>
              <View style={styles.dataStat}>
                <Text style={styles.dataStatValue}>{(offer?.usesCount ?? 0).toLocaleString('en-IN')}</Text>
                <Text style={styles.dataStatLabel}>Total uses</Text>
              </View>
              <View style={styles.dataStat}>
                <Text style={styles.dataStatValue}>{formatINR(offer?.revenueGenerated ?? 0)}</Text>
                <Text style={styles.dataStatLabel}>Revenue tracked</Text>
              </View>
            </View>
          </View>

          <Pressable style={styles.confirmRow} onPress={() => setConfirmed(!confirmed)} hitSlop={4}>
            <View pointerEvents="none">
              <Checkbox checked={confirmed} onToggle={setConfirmed} />
            </View>
            <Text style={styles.confirmRowText}>
              I understand this action is permanent and cannot be undone.
            </Text>
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={handleClose} disabled={pending}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, (!confirmed || pending) && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={!confirmed || pending}
            >
              {pending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>Delete Offer</Text>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  errorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
    paddingTop: spacing.lg,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,24,40,0.4)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl + 4,
    borderTopRightRadius: radii.xl + 4,
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.sm - 4,
    backgroundColor: colors.border,
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingTop: spacing.xl,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.md,
  },
  dataBox: {
    width: '100%',
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.xxl,
  },
  dataBoxTitle: {
    ...typography.captionSemibold,
    color: colors.error,
  },
  dataStatsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingTop: spacing.md,
  },
  dataStat: {
    gap: 2,
  },
  dataStatValue: {
    ...typography.bodySemibold,
    fontWeight: '700',
    color: colors.error,
  },
  dataStatLabel: {
    ...typography.tiny,
    color: colors.errorDark,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    width: '100%',
    paddingTop: spacing.xxl,
  },
  confirmRowText: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    width: '100%',
    paddingTop: spacing.xxxl,
  },
  cancelButton: {
    flex: 4,
    height: 46,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  confirmButton: {
    flex: 6,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
