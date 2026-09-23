import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { AddProductHeader, Button, FormSectionCard, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProductDraft } from '../../context/ProductDraftContext';
import { type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductDescriptionStep'>;

type Errors = FormErrors<'description' | 'features'>;

export function ProductDescriptionStepScreen({ navigation }: Props) {
  const { draft, updateDescription } = useProductDraft();
  const [fullDescription, setFullDescription] = useState(draft.description?.fullDescription ?? '');
  const [features, setFeatures] = useState<string[]>(draft.description?.keyFeatures ?? []);
  const [newFeature, setNewFeature] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  function addFeature() {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setFeatures(prev => [...prev, trimmed]);
    setNewFeature('');
    if (errors.features) setErrors(prev => ({ ...prev, features: undefined }));
  }

  function handleContinue() {
    const nextErrors: Errors = {};
    if (!fullDescription.trim()) {
      nextErrors.description = 'Enter a full description';
    }
    if (features.length === 0) {
      nextErrors.features = 'Add at least one key feature';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    updateDescription({ fullDescription: fullDescription.trim(), keyFeatures: features });
    navigation.navigate('PackSizeVariant');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface}>
      <AddProductHeader
        title="Description"
        currentStep={4}
        onBack={() => navigation.goBack()}
        onSaveDraft={() => navigation.navigate('ProductCatalog')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <FormSectionCard>
          <View>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Full Description</Text>
              <Text style={styles.required}> *</Text>
            </View>
            <View style={[styles.textarea, errors.description && styles.textareaError]}>
              <TextInput
                value={fullDescription}
                onChangeText={text => {
                  if (text.length <= 2000) setFullDescription(text);
                  if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                }}
                placeholder="Describe features, benefits, and usage"
                placeholderTextColor={colors.textTertiary}
                style={styles.textareaInput}
                multiline
              />
            </View>
            <View style={styles.textareaFooter}>
              <Text style={errors.description ? styles.errorText : styles.helperText}>
                {errors.description ?? 'Tip: Include features, benefits, usage'}
              </Text>
              <Text style={styles.counterText}>{fullDescription.length} / 2000</Text>
            </View>
          </View>

          <View>
            <View style={styles.featuresHeaderRow}>
              <Text style={styles.label}>Key Features</Text>
            </View>
            <View style={styles.featuresList}>
              {features.map((feature, index) => (
                <View key={`${feature}-${index}`} style={styles.featureRow}>
                  <View style={styles.featureDot} />
                  <Text style={styles.featureText}>{feature}</Text>
                  <Pressable onPress={() => setFeatures(prev => prev.filter((_, i) => i !== index))} hitSlop={8}>
                    <Icon name="x" size={13} color={colors.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>
            <View style={styles.addFeatureRow}>
              <TextInput
                value={newFeature}
                onChangeText={setNewFeature}
                placeholder="Add a key feature"
                placeholderTextColor={colors.textTertiary}
                style={styles.addFeatureInput}
                onSubmitEditing={addFeature}
                returnKeyType="done"
              />
              <Pressable onPress={addFeature} style={styles.addFeatureButton} hitSlop={8}>
                <Icon name="plus" size={12} color={colors.primary} />
                <Text style={styles.addFeatureButtonText}>Add</Text>
              </Pressable>
            </View>
            {errors.features ? <Text style={styles.errorText}>{errors.features}</Text> : null}
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
  featuresHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featuresList: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  featureDot: {
    width: 5,
    height: 5,
    borderRadius: 9999,
    backgroundColor: colors.primary,
  },
  featureText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
  addFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  addFeatureInput: {
    flex: 1,
    ...typography.caption,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  addFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addFeatureButtonText: {
    ...typography.caption,
    color: colors.primary,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
