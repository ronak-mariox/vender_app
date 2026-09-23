import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Checkbox, FormSectionCard, Input, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useStoreSetup, type StoreAddressData } from '../../context/StoreSetupContext';
import { useRegistration } from '../../context/RegistrationContext';
import { api, getApiErrorMessage } from '../../services/api';
import { isRequired, isValidMobile, isValidPincode, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreAddress'>;

type Errors = FormErrors<
  'buildingShopNo' | 'street' | 'landmark' | 'area' | 'pincode' | 'city' | 'state' | 'contactNumber'
>;

const DEFAULT_LOCATION: StoreAddressData['location'] = {
  address: 'Plot 42, MG Road',
  cityState: 'Dadar West, Mumbai, Maharashtra 400028',
  latitude: 19.0176,
  longitude: 72.8459,
};

export function StoreAddressScreen({ navigation }: Props) {
  const { data, updateAddress } = useStoreSetup();
  const { data: registrationData } = useRegistration();

  const [form, setForm] = useState<StoreAddressData>(
    data.address ?? {
      buildingShopNo: 'Plot 42, Ground Floor',
      street: 'MG Road',
      landmark: 'Near Dadar Railway Station',
      area: registrationData.businessInfo?.city ? 'Dadar West' : '',
      pincode: registrationData.businessInfo?.pincode ?? '',
      city: registrationData.businessInfo?.city ?? '',
      state: registrationData.businessInfo?.state ?? '',
      contactNumber: registrationData.storeInfo?.contactNumber ?? '',
      sameAsBusinessAddress: true,
      location: DEFAULT_LOCATION,
    },
  );
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function set<K extends keyof StoreAddressData>(key: K, value: StoreAddressData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key in errors) setErrors(prev => ({ ...prev, [key as keyof Errors]: undefined }));
  }

  function toggleSameAddress(checked: boolean) {
    if (checked && registrationData.businessInfo) {
      setForm(prev => ({
        ...prev,
        sameAsBusinessAddress: true,
        buildingShopNo: registrationData.businessInfo!.addressLine1,
        area: registrationData.businessInfo!.city,
        pincode: registrationData.businessInfo!.pincode,
        city: registrationData.businessInfo!.city,
        state: registrationData.businessInfo!.state,
      }));
      setErrors(prev => ({
        ...prev,
        buildingShopNo: undefined,
        area: undefined,
        pincode: undefined,
        city: undefined,
        state: undefined,
      }));
    } else {
      set('sameAsBusinessAddress', checked);
    }
  }

  async function handleContinue() {
    const contactDigits = form.contactNumber.replace(/[^0-9]/g, '').slice(-10);
    const nextErrors: Errors = {};
    if (!isRequired(form.buildingShopNo)) nextErrors.buildingShopNo = 'Required';
    if (!isRequired(form.street)) nextErrors.street = 'Required';
    if (!isRequired(form.landmark)) nextErrors.landmark = 'Required';
    if (!isRequired(form.area)) nextErrors.area = 'Required';
    if (!isValidPincode(form.pincode)) nextErrors.pincode = 'Enter a valid 6-digit pincode';
    if (!isRequired(form.city)) nextErrors.city = 'Required';
    if (!isRequired(form.state)) nextErrors.state = 'Required';
    if (!isValidMobile(contactDigits)) nextErrors.contactNumber = 'Enter a valid 10-digit contact number';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await api.patch('/vendor/store-setup/address', form);
      updateAddress(form);
      navigation.navigate('OperatingHours');
    } catch (err) {
      setErrors({ form: getApiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Setup" onBack={() => navigation.goBack()} />
      <ProgressSteps currentStep={3} totalSteps={7} label="Store Address" />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Store Address</Text>
          <Text style={styles.subtitle}>Used for delivery routing and store discovery</Text>
        </View>

        <FormSectionCard title="Physical Address">
          <Input
            label="Building / Shop No."
            required
            value={form.buildingShopNo}
            onChangeText={text => set('buildingShopNo', text)}
            placeholder="Plot 42, Ground Floor"
            error={errors.buildingShopNo}
          />
          <Input
            label="Street / Road"
            required
            value={form.street}
            onChangeText={text => set('street', text)}
            placeholder="MG Road"
            error={errors.street}
          />
          <Input
            label="Landmark"
            required
            value={form.landmark}
            onChangeText={text => set('landmark', text)}
            placeholder="Near Dadar Railway Station"
            error={errors.landmark}
          />
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Input
                label="Area / Locality"
                required
                value={form.area}
                onChangeText={text => set('area', text)}
                placeholder="Dadar West"
                error={errors.area}
              />
            </View>
            <View style={styles.rowItem}>
              <Input
                label="Pincode"
                required
                value={form.pincode}
                onChangeText={text => set('pincode', text.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="400028"
                keyboardType="number-pad"
                error={errors.pincode}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Input
                label="City"
                required
                value={form.city}
                onChangeText={text => set('city', text)}
                placeholder="Mumbai"
                error={errors.city}
              />
            </View>
            <View style={styles.rowItem}>
              <Input
                label="State"
                required
                value={form.state}
                onChangeText={text => set('state', text)}
                placeholder="Maharashtra"
                error={errors.state}
              />
            </View>
          </View>
          <Input
            label="Store Contact Number"
            required
            leftIcon="phone"
            value={form.contactNumber}
            onChangeText={text => set('contactNumber', text)}
            placeholder="+91 22 2654 7890"
            keyboardType="phone-pad"
            error={errors.contactNumber}
          />
        </FormSectionCard>

        <Pressable style={styles.sameAddressCard} onPress={() => toggleSameAddress(!form.sameAsBusinessAddress)}>
          <Checkbox checked={form.sameAsBusinessAddress} onToggle={toggleSameAddress} />
          <View style={styles.sameAddressTextColumn}>
            <Text style={styles.sameAddressTitle}>Same as registered business address</Text>
            <Text style={styles.sameAddressSubtitle}>Auto-filled from your KYC details</Text>
          </View>
        </Pressable>

        <Pressable style={styles.pinCard} onPress={() => navigation.navigate('StoreLocationConfirm')}>
          <View style={styles.pinIcon}>
            <Icon name="pin" size={20} color={colors.white} />
          </View>
          <View style={styles.pinTextColumn}>
            <Text style={styles.pinTitle}>Pin on Map</Text>
            <Text style={styles.pinSubtitle}>Tap to confirm exact location on map</Text>
          </View>
          <Icon name="chevron-right" size={18} color={colors.primary} />
        </Pressable>

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
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  rowItem: {
    flex: 1,
  },
  sameAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sameAddressTextColumn: {
    flex: 1,
    gap: 2,
  },
  sameAddressTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  sameAddressSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  pinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.primarySurface,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
  },
  pinIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinTextColumn: {
    flex: 1,
    gap: 1,
  },
  pinTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  pinSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
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
