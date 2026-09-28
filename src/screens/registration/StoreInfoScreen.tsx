import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, Input, NavHeader, ProgressSteps, ScreenContainer, SelectField } from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration, type StoreInfoData } from '../../context/RegistrationContext';
import { api } from '../../services/api';
import { isRequired, isValidMobile, type FormErrors } from '../../utils/validators';
import { handleRegistrationSaveError } from './registrationHelpers';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreInfo'>;

const STORE_TYPES = ['Retail Store', 'Warehouse / Dark Store', 'Home Kitchen', 'Kiosk', 'Online Only'];
const OPERATING_HOURS = ['9:00 AM – 9:00 PM', '24 Hours', '8:00 AM – 8:00 PM', '10:00 AM – 10:00 PM'];

const FIELDS = ['storeName', 'storeAddress', 'landmark', 'contactNumber', 'storeType', 'operatingHours'] as const;
type Errors = FormErrors<(typeof FIELDS)[number] | 'location'>;
type StoreInfoForm = Omit<StoreInfoData, 'location'>;

function toForm(info: StoreInfoData): StoreInfoForm {
  return {
    storeName: info.storeName,
    storeAddress: info.storeAddress,
    landmark: info.landmark,
    contactNumber: info.contactNumber,
    storeType: info.storeType,
    operatingHours: info.operatingHours,
  };
}

export function StoreInfoScreen({ navigation }: Props) {
  const { data, updateStoreInfo } = useRegistration();
  const [form, setForm] = useState<StoreInfoForm>(
    data.storeInfo
      ? toForm(data.storeInfo)
      : {
          storeName: data.businessInfo?.displayName ?? '',
          storeAddress: data.businessInfo?.addressLine1 ?? '',
          landmark: '',
          contactNumber: data.ownerInfo?.mobile ?? '',
          storeType: '',
          operatingHours: '',
        },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const location = data.storeLocation ?? data.storeInfo?.location ?? null;

  useEffect(() => {
    if (data.storeInfo) setForm(toForm(data.storeInfo));
  }, [data.storeInfo]);

  useEffect(() => {
    if (location) setErrors(prev => (prev.location ? { ...prev, location: undefined } : prev));
  }, [location]);

  function set<K extends keyof StoreInfoForm>(key: K, value: StoreInfoForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleContinue() {
    const nextErrors: Errors = {};
    if (!isRequired(form.storeName)) nextErrors.storeName = 'Enter the store name';
    if (!isRequired(form.storeAddress)) nextErrors.storeAddress = 'Enter the store address';
    if (!isRequired(form.landmark)) nextErrors.landmark = 'Enter a nearby landmark';
    if (!isValidMobile(form.contactNumber)) nextErrors.contactNumber = 'Enter a valid 10-digit mobile number';
    if (!isRequired(form.storeType)) nextErrors.storeType = 'Select a store type';
    if (!isRequired(form.operatingHours)) nextErrors.operatingHours = 'Select your operating hours';
    if (!location) nextErrors.location = 'Set your store location';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !location) return;

    const payload: StoreInfoData = {
      ...form,
      storeName: form.storeName.trim(),
      storeAddress: form.storeAddress.trim(),
      landmark: form.landmark.trim(),
      location,
    };
    setSaving(true);
    try {
      await api.patch('/vendor/registration/store-info', payload);
      updateStoreInfo(payload);
      navigation.navigate('GSTDetails');
    } catch (err) {
      handleRegistrationSaveError<Errors>(
        err,
        setErrors,
        'Could not save your store information. Please try again.',
        FIELDS,
      );
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
            placeholder="Store name"
            error={errors.storeName}
          />
          <Input
            label="Store Address"
            required
            value={form.storeAddress}
            onChangeText={text => set('storeAddress', text)}
            placeholder="Shop number, street, area"
            error={errors.storeAddress}
          />
          <Input
            label="Landmark"
            required
            value={form.landmark}
            onChangeText={text => set('landmark', text)}
            placeholder="A well-known place nearby"
            error={errors.landmark}
          />
          <Input
            label="Store Contact Number"
            required
            leftIcon="phone"
            value={form.contactNumber}
            onChangeText={text => set('contactNumber', text.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
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
            required
            value={form.operatingHours}
            options={OPERATING_HOURS}
            onChange={value => set('operatingHours', value)}
            error={errors.operatingHours}
          />
        </FormSectionCard>

        <FormSectionCard title="Store Location">
          <Pressable style={styles.locationCard} onPress={handleChangeLocation}>
            <View style={styles.locationIconWrapper}>
              <Icon name="pin" size={18} color={colors.primary} />
            </View>
            {location ? (
              <View style={styles.locationTextColumn}>
                <Text style={styles.locationAddress}>{location.address}</Text>
                <Text style={styles.locationCityState}>{location.cityState}</Text>
                <Text style={styles.locationAccuracy}>
                  Lat {location.latitude.toFixed(6)}, Lng {location.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <View style={styles.locationTextColumn}>
                <Text style={styles.locationAddress}>No location set</Text>
                <Text style={styles.locationCityState}>Enter your store address and coordinates</Text>
              </View>
            )}
            <Text style={styles.changeText}>{location ? 'Change' : 'Set'}</Text>
          </Pressable>
          {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
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
