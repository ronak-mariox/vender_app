import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, ProgressSteps, ScreenContainer, SelectField } from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration, type StoreInfoData } from '../../context/RegistrationContext';
import { api, getApiErrorMessage, getFieldErrors } from '../../services/api';
import { isRequired, isValidMobile, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreInfo'>;

const STORE_TYPES = ['Retail Store', 'Warehouse / Dark Store', 'Home Kitchen', 'Kiosk', 'Online Only'];
const OPERATING_HOURS = ['9:00 AM – 9:00 PM', '24 Hours', '8:00 AM – 8:00 PM', '10:00 AM – 10:00 PM'];

const DEFAULT_LOCATION: StoreInfoData['location'] = {
  address: 'Plot 42, MG Road',
  cityState: 'Dadar West, Mumbai, Maharashtra 400028',
  latitude: 19.0176,
  longitude: 72.8459,
};

type Errors = FormErrors<'storeName' | 'storeAddress' | 'contactNumber' | 'storeType'>;

export function StoreInfoScreen({ navigation }: Props) {
  const { data, updateStoreInfo } = useRegistration();
  const [form, setForm] = useState<StoreInfoData>(
    data.storeInfo ?? {
      storeName: data.businessInfo?.displayName ?? '',
      storeAddress: data.businessInfo?.addressLine1 ?? '',
      landmark: '',
      contactNumber: '',
      storeType: '',
      operatingHours: '',
      location: DEFAULT_LOCATION,
    },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function set<K extends keyof StoreInfoData>(key: K, value: StoreInfoData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleContinue() {
    const nextErrors: Errors = {};
    if (!isRequired(form.storeName)) nextErrors.storeName = 'Enter the store name';
    if (!isRequired(form.storeAddress)) nextErrors.storeAddress = 'Enter the store address';
    if (!isValidMobile(form.contactNumber)) nextErrors.contactNumber = 'Enter a valid 10-digit mobile number';
    if (!isRequired(form.storeType)) nextErrors.storeType = 'Select a store type';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await api.patch('/vendor/registration/store-info', form);
      updateStoreInfo(form);
      navigation.navigate('GSTDetails');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors as Errors);
      } else {
        setErrors({ form: getApiErrorMessage(err, 'Could not save your store information. Please try again.') });
      }
    } finally {
      setSaving(false);
    }
  }

  function handleChangeLocation() {
    navigation.navigate('StoreLocation');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Business Registration" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={4} totalSteps={8} label="Store Information" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Store Information</Text>
          <Text style={styles.subtitle}>Details about your physical or online store</Text>
        </View>

        <FormSectionCard title="Store Details">
          <Input
            label="Store Name"
            required
            leftIcon="home"
            value={form.storeName}
            onChangeText={text => set('storeName', text)}
            placeholder="Sharma Kirana Store"
            error={errors.storeName}
          />
          <Input
            label="Store Address"
            required
            value={form.storeAddress}
            onChangeText={text => set('storeAddress', text)}
            placeholder="Plot 42, MG Road, Dadar West"
            error={errors.storeAddress}
          />
          <Input
            label="Landmark"
            value={form.landmark}
            onChangeText={text => set('landmark', text)}
            placeholder="Near Dadar Station"
          />
          <Input
            label="Store Contact Number"
            required
            leftIcon="phone"
            value={form.contactNumber}
            onChangeText={text => set('contactNumber', text.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder="9876543210"
            keyboardType="phone-pad"
            error={errors.contactNumber}
          />
          <SelectField
            label="Store Type"
            required
            value={form.storeType}
            options={STORE_TYPES}
            onChange={value => set('storeType', value)}
            error={errors.storeType}
          />
          <SelectField
            label="Operating Hours"
            value={form.operatingHours}
            options={OPERATING_HOURS}
            onChange={value => set('operatingHours', value)}
          />
        </FormSectionCard>

        <FormSectionCard title="Store Location">
          <Pressable style={styles.locationCard} onPress={handleChangeLocation}>
            <View style={styles.locationIconWrapper}>
              <Icon name="pin" size={18} color={colors.primary} />
            </View>
            <View style={styles.locationTextColumn}>
              <Text style={styles.locationAddress}>{form.location.address}</Text>
              <Text style={styles.locationCityState}>{form.location.cityState}</Text>
              <Text style={styles.locationAccuracy}>
                {form.location.latitude.toFixed(4)}° N, {form.location.longitude.toFixed(4)}° E
              </Text>
            </View>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </FormSectionCard>

        {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

        <View style={styles.footer}>
          <Button label="Save & Continue" onPress={handleContinue} loading={saving} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  headingBlock: {
    gap: spacing.xxs,
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
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    width: '100%',
  },
  locationIconWrapper: {
    paddingTop: 2,
  },
  locationTextColumn: {
    flex: 1,
    gap: 1,
  },
  locationAddress: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  locationCityState: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locationAccuracy: {
    ...typography.tiny,
    color: colors.primary,
    paddingTop: 2,
  },
  changeText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
