import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, ScreenContainer } from '../../components';
import { ADD_PRODUCT_TOTAL_STEPS, useProductDraft } from '../../context/ProductDraftContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductDescriptionStep'>;

const MAX_LENGTH = 2000;

export function ProductDescriptionStepScreen({ navigation }: Props) {
  const { draft, updateDescription } = useProductDraft();
  const [description, setDescription] = useState(draft.description?.description ?? '');
  const [error, setError] = useState<string | undefined>();

  function handleContinue() {
    if (!description.trim()) {
      setError('Enter a product description');
      return;
    }
    updateDescription({ description: description.trim() });
    navigation.navigate('PackSizeVariant');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Description"
        currentStep={4}
        totalSteps={ADD_PRODUCT_TOTAL_STEPS}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <FormSectionCard>
          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View style={[styles.textarea, error && styles.textareaError]}>
              <TextInput
                value={description}
                onChangeText={text => {
                  if (text.length <= MAX_LENGTH) setDescription(text);
                  if (error) setError(undefined);
                }}
                placeholder="Describe features, benefits, and usage"
                placeholderTextColor={colors.textTertiary}
                style={styles.textareaInput}
                multiline
              />
            </View>
            <View style={styles.textareaFooter}>
              <Text style={error ? styles.errorText : styles.helperText}>
                {error ?? 'Tip: include features, benefits and usage'}
              </Text>
              <Text style={styles.counterText}>
                {description.length} / {MAX_LENGTH}
              </Text>
            </View>
          </View>
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
  labelRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
  },
  required: {
    ...typography.label,
    color: colors.error,
  },
  textarea: {
    minHeight: 140,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  textareaError: {
    borderColor: colors.error,
  },
  textareaInput: {
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
    textAlignVertical: 'top',
  },
  textareaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  helperText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.tiny,
    color: colors.error,
  },
  counterText: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
