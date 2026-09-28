import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, ScreenContainer, SelectableCard } from '../../components';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { useOffers, DiscountType } from '../../context/OffersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateOffer'>;

export function CreateOfferScreen({ navigation, route }: Props) {
  const offerId = route.params?.offerId;
  const { draft, updateType, loadFromOffer, resetDraft } = useOfferDraft();
  const { getOffer, fetchOffer } = useOffers();
  const needsSeed = Boolean(offerId) && draft.editingOfferId !== offerId;
  const [seeding, setSeeding] = useState(needsSeed);

  const [name, setName] = useState(draft.title);
  const [discountType, setDiscountType] = useState<DiscountType>(draft.discountType);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!offerId) {
      if (draft.editingOfferId) {
        resetDraft();
        setName('');
        setDiscountType('percentage');
      }
      return;
    }
    if (draft.editingOfferId === offerId) return;
    let cancelled = false;
    const seed = (offer: NonNullable<ReturnType<typeof getOffer>>) => {
      loadFromOffer(offer, offerId);
      setName(offer.title);
      setDiscountType(offer.discountType);
      setSeeding(false);
    };
    const cached = getOffer(offerId);
    if (cached) {
      seed(cached);
      return;
    }
    fetchOffer(offerId)
      .then(offer => {
        if (!cancelled) seed(offer);
      })
      .catch(err => {
        if (cancelled) return;
        Alert.alert('Could not load offer', getApiErrorMessage(err));
        navigation.goBack();
      });
    return () => {
      cancelled = true;
    };
    // Seed once per offerId; draft changes afterwards come from this wizard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId]);

  const isEditing = Boolean(offerId);

  function handleNext() {
    if (!name.trim()) {
      setError('Enter an offer name');
      return;
    }
    updateType({ title: name.trim(), discountType });
    navigation.navigate('SelectOfferProducts');
  }

  if (seeding) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <OfferWizardHeader title="Edit Offer" step={1} onBack={() => navigation.goBack()} />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <OfferWizardHeader title={isEditing ? 'Edit Offer' : 'Create Offer'} step={1} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input
          label="Offer Name"
          value={name}
          onChangeText={text => {
            setName(text);
            if (error) setError(undefined);
          }}
          placeholder="e.g. Diwali Special"
          error={error}
        />

        <View>
          <Text style={styles.sectionLabel}>Select Offer Type</Text>
          <View style={styles.cardsColumn}>
            <SelectableCard
              icon="percent"
              title="Percentage Discount"
              description="e.g. 20% off all dairy"
              selected={discountType === 'percentage'}
              onPress={() => setDiscountType('percentage')}
            />
            <SelectableCard
              icon="tag"
              title="Fixed Amount Off"
              description="e.g. ₹30 off orders above ₹299"
              selected={discountType === 'flat'}
              onPress={() => setDiscountType('flat')}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Next: Select Products" onPress={handleNext} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xxl,
  },
  sectionLabel: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  cardsColumn: {
    gap: spacing.lg,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
