import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, Input, ScreenContainer } from '../../components';
import { ADD_PRODUCT_TOTAL_STEPS, useProductDraft } from '../../context/ProductDraftContext';
import { colors, spacing } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductBasicInfo'>;

export function ProductBasicInfoScreen({ navigation }: Props) {
  const { draft, updateBasicInfo } = useProductDraft();
  const [name, setName] = useState(draft.basicInfo?.name ?? '');
  const [brand, setBrand] = useState(draft.basicInfo?.brand ?? '');
  const [country, setCountry] = useState(draft.basicInfo?.countryOfOrigin ?? 'India');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleContinue() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Enter the product name';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateBasicInfo({
      name: name.trim(),
      brand: brand.trim(),
      countryOfOrigin: country.trim(),
    });
    navigation.navigate('ProductImages');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Basic Information"
        currentStep={1}
        totalSteps={ADD_PRODUCT_TOTAL_STEPS}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormSectionCard>
          <Input
            label="Product Name"
            required
            value={name}
            onChangeText={text => {
              setName(text);
              if (errors.name) setErrors({});
            }}
            placeholder="e.g. Tata Salt Vacuum"
            error={errors.name}
            helperText={errors.name ? undefined : 'Use the full product name as on packaging'}
          />

          <Input
            label="Brand"
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Tata"
            helperText="Leave blank for unbranded or loose products"
          />

          <Input
            label="Country of Origin"
            value={country}
            onChangeText={setCountry}
            placeholder="India"
          />
        </FormSectionCard>

        <Button label="Continue" onPress={handleContinue} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
});
