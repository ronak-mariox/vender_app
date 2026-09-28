import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Button } from '../../components';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PublishOffer'>;

export function PublishOfferScreen({ navigation }: Props) {
  const { draft, publishDraft, resetDraft } = useOfferDraft();
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const isEditing = Boolean(draft.editingOfferId);

  const publish = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError(null);
    try {
      const offer = await publishDraft();
      resetDraft();
      navigation.replace('OfferPublished', { offerId: offer.id });
    } catch (err) {
      setError(getApiErrorMessage(err, err instanceof Error ? err.message : 'Could not publish the offer.'));
    } finally {
      inFlight.current = false;
    }
  }, [navigation, publishDraft, resetDraft]);

  useEffect(() => {
    publish();
    // Publish exactly once on mount; retries go through the button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.content}>
        {error ? (
          <>
            <View style={styles.errorIcon}>
              <Icon name="alert-circle" size={32} color={colors.error} />
            </View>
            <Text style={styles.heading}>{isEditing ? 'Could not save changes' : 'Could not publish offer'}</Text>
            <Text style={styles.subtitle}>{error}</Text>
            <View style={styles.actions}>
              <Button label="Try Again" onPress={publish} />
              <Button label="Back to Review" variant="outline" onPress={() => navigation.goBack()} />
            </View>
          </>
        ) : (
          <>
            <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
            <Text style={styles.heading}>{isEditing ? 'Saving your changes…' : 'Publishing your offer…'}</Text>
            <Text style={styles.subtitle}>This only takes a moment</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.huge,
  },
  spinner: {
    marginBottom: spacing.xl,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  heading: {
    ...typography.h3,
    fontSize: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
});
