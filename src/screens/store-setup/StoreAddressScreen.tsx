import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Checkbox, FormSectionCard, InfoBanner, Input, NavHeader, ProgressSteps, ScreenContainer } from '../../components';
import { useStoreSetup, type StoreAddressData } from '../../context/StoreSetupContext';
import { useRegistration } from '../../context/RegistrationContext';
import { api } from '../../services/api';
import { isRequired, isValidMobile, isValidPincode, type FormErrors } from '../../utils/validators';
import { handleFormSaveError } from '../registration/registrationHelpers';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreAddress'>;

const FIELDS = [
  'buildingShopNo',
  'street',
  'landmark',
  'area',
  'pincode',
  'city',
  'state',
  'contactNumber',
  'latitude',
  'longitude',
] as const;
type Errors = FormErrors<(typeof FIELDS)[number]>;

type AddressForm = Omit<StoreAddressData, 'location'> & { latitude: string; longitude: string };

function toForm(address: StoreAddressData): AddressForm {
  return {
    buildingShopNo: address.buildingShopNo,
    street: address.street,
    landmark: address.landmark,
    area: address.area,
    pincode: address.pincode,
    city: address.city,
    state: address.state,
    contactNumber: address.contactNumber,
    sameAsBusinessAddress: address.sameAsBusinessAddress,
    latitude: address.location ? String(address.location.latitude) : '',
    longitude: address.location ? String(address.location.longitude) : '',
  };
}

function parseCoordinate(value: string, limit: number): number | null {
  const trimmed = value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  const parsed = parseFloat(trimmed);
  return Math.abs(parsed) <= limit ? parsed : null;
}

export function StoreAddressScreen({ navigation }: Props) {
  const { data, updateAddress } = useStoreSetup();
  const { data: registrationData } = useRegistration();

  const [form, setForm] = useState<AddressForm>(() => {
    if (data.address) return toForm(data.address);
    const storeInfo = registrationData.storeInfo;
    const business = registrationData.businessInfo;
    return {
      buildingShopNo: '',
      street: '',
      landmark: storeInfo?.landmark ?? '',
      area: '',
      pincode: business?.pincode ?? '',
      city: business?.city ?? '',
      state: business?.state ?? '',
      contactNumber: storeInfo?.contactNumber ?? '',
      sameAsBusinessAddress: false,
      latitude: storeInfo?.location ? String(storeInfo.location.latitude) : '',
      longitude: storeInfo?.location ? String(storeInfo.location.longitude) : '',
    };
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data.address) setForm(toForm(data.address));
  }, [data.address]);

  function set<K extends keyof AddressForm>(key: K, value: AddressForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key in errors) setErrors(prev => ({ ...prev, [key as keyof Errors]: undefined }));
  }

  function toggleSameAddress(checked: boolean) {
    const business = registrationData.businessInfo;
    if (checked && business) {
      setForm(prev => ({
        ...prev,
        sameAsBusinessAddress: true,
        buildingShopNo: business.addressLine1,
        street: business.addressLine2 || prev.street,
        pincode: business.pincode,
        city: business.city,
        state: business.state,
      }));
      setErrors(prev => ({
        ...prev,
        buildingShopNo: undefined,
        street: undefined,
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
    const latitude = parseCoordinate(form.latitude, 90);
    const longitude = parseCoordinate(form.longitude, 180);
    const nextErrors: Errors = {};
    if (!isRequired(form.buildingShopNo)) nextErrors.buildingShopNo = 'Required';
    if (!isRequired(form.street)) nextErrors.street = 'Required';
    if (!isRequired(form.landmark)) nextErrors.landmark = 'Required';
    if (!isRequired(form.area)) nextErrors.area = 'Required';
    if (!isValidPincode(form.pincode)) nextErrors.pincode = 'Enter a valid 6-digit pincode';
    if (!isRequired(form.city)) nextErrors.city = 'Required';
    if (!isRequired(form.state)) nextErrors.state = 'Required';
    if (!isValidMobile(contactDigits)) nextErrors.contactNumber = 'Enter a valid 10-digit contact number';
    if (latitude === null) nextErrors.latitude = 'Enter a latitude between -90 and 90';
    if (longitude === null) nextErrors.longitude = 'Enter a longitude between -180 and 180';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || latitude === null || longitude === null) return;

    const address: StoreAddressData = {
      buildingShopNo: form.buildingShopNo.trim(),
      street: form.street.trim(),
      landmark: form.landmark.trim(),
      area: form.area.trim(),
      pincode: form.pincode,
      city: form.city.trim(),
      state: form.state.trim(),
      contactNumber: contactDigits,
      sameAsBusinessAddress: form.sameAsBusinessAddress,
      location: {
        address: `${form.buildingShopNo.trim()}, ${form.street.trim()}`,
        cityState: `${form.area.trim()}, ${form.city.trim()}, ${form.state.trim()} ${form.pincode}`,
        latitude,
        longitude,
      },
    };

    setSaving(true);
    try {
      await api.patch('/vendor/store-setup/address', address);
      updateAddress(address);
      navigation.navigate('StoreLocationConfirm');
    } catch (err) {
      handleFormSaveError<Errors>(err, setErrors, 'Could not save your store address. Please try again.', FIELDS);
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
            placeholder="Shop / building number"
            error={errors.buildingShopNo}
          />
          <Input
            label="Street / Road"
            required
            value={form.street}
            onChangeText={text => set('street', text)}
            placeholder="Street or road name"
            error={errors.street}
          />
          <Input
            label="Landmark"
            required
            value={form.landmark}
            onChangeText={text => set('landmark', text)}
            placeholder="A well-known place nearby"
            error={errors.landmark}
          />
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Input
                label="Area / Locality"
                required
                value={form.area}
                onChangeText={text => set('area', text)}
                placeholder="Locality"
                error={errors.area}
              />
            </View>
            <View style={styles.rowItem}>
              <Input
                label="Pincode"
                required
                value={form.pincode}
                onChangeText={text => set('pincode', text.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
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
                placeholder="City"
                error={errors.city}
              />
            </View>
            <View style={styles.rowItem}>
              <Input
                label="State"
                required
                value={form.state}
                onChangeText={text => set('state', text)}
                placeholder="State"
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
            placeholder="10-digit number"
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

        <FormSectionCard title="Coordinates">
          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Input
                label="Latitude"
                required
                value={form.latitude}
                onChangeText={text => set('latitude', text.replace(/[^0-9.-]/g, ''))}
                placeholder="e.g. 12.971599"
                keyboardType="numbers-and-punctuation"
                error={errors.latitude}
              />
            </View>
            <View style={styles.rowItem}>
              <Input
                label="Longitude"
                required
                value={form.longitude}
                onChangeText={text => set('longitude', text.replace(/[^0-9.-]/g, ''))}
                placeholder="e.g. 77.594566"
                keyboardType="numbers-and-punctuation"
                error={errors.longitude}
              />
            </View>
          </View>
        </FormSectionCard>

        <InfoBanner
          variant="info"
          message="Delivery partners navigate to these coordinates. Copy them from any maps app by long-pressing your store's position."
        />

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
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
