import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, Input, ScreenContainer, SelectField } from '../../components';
import { GST_RATE_OPTIONS } from '../../data/productOptions';
import { ADD_PRODUCT_TOTAL_STEPS, useProductDraft } from '../../context/ProductDraftContext';
import { isValidHSN, type FormErrors } from '../../utils/validators';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductTaxInfo'>;

type Errors = FormErrors<'gst' | 'hsn'>;

export function ProductTaxInfoScreen({ navigation }: Props) {
  const { draft, updateTax } = useProductDraft();
  const initialLabel = GST_RATE_OPTIONS.find(item => item.value === draft.tax?.gstRate)?.label ?? '';
  const [gstLabel, setGstLabel] = useState(initialLabel);
  const [hsnCode, setHsnCode] = useState(draft.tax?.hsnCode ?? '');
  const [error, setError] = useState<Errors>({});

  function handleContinue() {
    const nextErrors: Errors = {};
    if (!gstLabel) nextErrors.gst = 'Select a GST rate';
    if (hsnCode.trim() && !isValidHSN(hsnCode.trim())) nextErrors.hsn = 'HSN codes are 4 to 8 digits';
    setError(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const gstRate = GST_RATE_OPTIONS.find(item => item.label === gstLabel)?.value ?? '';
    updateTax({ gstRate, hsnCode: hsnCode.trim() });
    navigation.navigate('ProductSKU');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Tax Information"
        currentStep={7}
        totalSteps={ADD_PRODUCT_TOTAL_STEPS}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <FormSectionCard>
          <SelectField
            label="GST Rate"
            required
            value={gstLabel}
            options={GST_RATE_OPTIONS.map(item => item.label)}
            onChange={value => {
              setGstLabel(value);
              if (error.gst) setError(prev => ({ ...prev, gst: undefined }));
            }}
            placeholder="Select GST rate"
          />
          {error.gst ? <Text style={styles.errorText}>{error.gst}</Text> : null}

          <Input
            label="HSN Code"
            value={hsnCode}
            onChangeText={text => {
              setHsnCode(text.replace(/[^0-9]/g, ''));
              if (error.hsn) setError(prev => ({ ...prev, hsn: undefined }));
            }}
            placeholder="e.g. 2501"
            leftIcon="hash"
            keyboardType="number-pad"
            maxLength={8}
            error={error.hsn}
            helperText={
              error.hsn ? undefined : 'Optional. Enter the HSN code from your GST invoice — it is not verified automatically.'
            }
          />
        </FormSectionCard>

        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: -spacing.sm,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
