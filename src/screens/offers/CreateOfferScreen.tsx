import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, ScreenContainer, SelectableCard } from '../../components';
import { useOfferDraft } from '../../context/OfferDraftContext';
import { useOffers, DiscountType } from '../../context/OffersContext';
import { colors, spacing, typography } from '../../theme';
import { OfferWizardHeader } from './OfferWizardHeader';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateOffer'>;

export function CreateOfferScreen({ navigation, route }: Props) {
  const { offerId } = route.params ?? {};
  const { draft, updateType } = useOfferDraft();
  const { getOffer } = useOffers();
  const existingOffer = offerId ? getOffer(offerId) : undefined;

  const [name, setName] = useState(draft.type?.name ?? existingOffer?.name ?? '');
  const [discountType, setDiscountType] = useState<DiscountType>(
    draft.type?.discountType ?? existingOffer?.discountType ?? 'percentage',
  );
  const [error, setError] = useState<string | undefined>();

  function handleNext() {
    if (!name.trim()) {
      setError('Enter an offer name');
      return;
    }
    updateType({ name: name.trim(), discountType });
    navigation.navigate('SelectOfferProducts');
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <OfferWizardHeader title="Create Offer" step={1} onBack={() => navigation.goBack()} />
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
