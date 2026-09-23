import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ProgressSteps, ScreenContainer, SelectableCard } from '../../components';
import type { IconName } from '../../icons/Icon';
import { useRegistration, type BusinessTypeValue } from '../../context/RegistrationContext';
import { api, getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'BusinessType'>;

export const BUSINESS_TYPE_OPTIONS: {
  value: BusinessTypeValue;
  icon: IconName;
  title: string;
  description: string;
}[] = [
  { value: 'individual', icon: 'user', title: 'Individual', description: 'Sole trader operating in personal name' },
  { value: 'proprietorship', icon: 'home', title: 'Proprietorship', description: 'Single owner business entity' },
  { value: 'partnership', icon: 'users', title: 'Partnership', description: 'Two or more persons running a business' },
  { value: 'private-limited', icon: 'briefcase', title: 'Private Limited', description: 'Incorporated company with limited liability' },
  { value: 'other', icon: 'grid', title: 'Other', description: 'LLP, Trust, NGO, or other structure' },
];

export function BusinessTypeScreen({ navigation }: Props) {
  const { data, updateBusinessType } = useRegistration();
  const [selected, setSelected] = useState<BusinessTypeValue | undefined>(
    data.businessType ?? 'proprietorship',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleContinue() {
    if (!selected) return;
    setError(undefined);
    setSaving(true);
    try {
      await api.patch('/vendor/registration/business-type', { businessType: selected });
      updateBusinessType(selected);
      navigation.navigate('BusinessInfo');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save your business type. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Business Registration" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={1} totalSteps={8} label="Business Type" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Business Type</Text>
          <Text style={styles.subtitle}>Select the legal structure of your business</Text>
        </View>

        <View style={styles.options}>
          {BUSINESS_TYPE_OPTIONS.map(option => (
            <SelectableCard
              key={option.value}
              icon={option.icon}
              title={option.title}
              description={option.description}
              selected={selected === option.value}
              onPress={() => setSelected(option.value)}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.footer}>
          <Button label="Continue" onPress={handleContinue} disabled={!selected} loading={saving} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  headingBlock: {
    gap: spacing.xxs,
    paddingBottom: spacing.xxl,
  },
  heading: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  options: {
    gap: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
});
