import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOffers } from '../../context/OffersContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PauseOffer'>;

export function PauseOfferScreen({ navigation, route }: Props) {
  const { offerId } = route.params;
  const { getOffer, pauseOffer } = useOffers();
  const offer = getOffer(offerId);

  function handleClose() {
    navigation.goBack();
  }

  function handleConfirm() {
    pauseOffer(offerId);
    navigation.goBack();
  }

  return (
    <Pressable style={styles.backdrop} onPress={handleClose}>
      <Pressable style={styles.sheetWrapper} onPress={event => event.stopPropagation()}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.iconCircle}>
            <Icon name="pause-circle" size={32} color={colors.warningDark} strokeWidth={2} />
          </View>

          <Text style={styles.heading}>Pause Offer?</Text>
          <Text style={styles.subtitle}>
            {offer?.name || 'This offer'} will stop showing to customers immediately.
          </Text>

          <View style={styles.noteBox}>
            <Icon name="alert-triangle" size={15} color={colors.warningDark} strokeWidth={2} />
            <Text style={styles.noteText}>
              This offer will stop applying right away. Its data is kept, and you can resume it anytime.
            </Text>
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Keep Active</Text>
            </Pressable>
            <Pressable style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Pause Offer</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FDE68A',
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
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.xxl,
    width: '100%',
  },
  noteText: {
    ...typography.label,
    color: colors.warningDark,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.lg,
    width: '100%',
    paddingTop: spacing.xxxl,
  },
  cancelButton: {
    flex: 1,
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
    flex: 1,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.warningDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
