import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, FormSectionCard, InfoBanner, Input, NavHeader, ScreenContainer } from '../../components';
import { useRegistration } from '../../context/RegistrationContext';
import { isRequired, type FormErrors } from '../../utils/validators';
import { colors, fontFamilies, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'StoreLocation'>;

type Errors = FormErrors<'address' | 'cityState' | 'latitude' | 'longitude'>;

function parseCoordinate(value: string, limit: number): number | null {
  const trimmed = value.trim();
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null;
  const parsed = parseFloat(trimmed);
  return Math.abs(parsed) <= limit ? parsed : null;
}

export function StoreLocationScreen({ navigation }: Props) {
  const { data, updateStoreLocation } = useRegistration();
  const initial = data.storeLocation ?? data.storeInfo?.location;
  const [address, setAddress] = useState(initial?.address ?? data.storeInfo?.storeAddress ?? '');
  const [cityState, setCityState] = useState(
    initial?.cityState ??
      (data.businessInfo
        ? [data.businessInfo.city, data.businessInfo.state, data.businessInfo.pincode].filter(Boolean).join(', ')
        : ''),
  );
  const [latitude, setLatitude] = useState(initial ? String(initial.latitude) : '');
  const [longitude, setLongitude] = useState(initial ? String(initial.longitude) : '');
  const [errors, setErrors] = useState<Errors>({});

  function clear(key: keyof Errors) {
    setErrors(prev => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function handleConfirm() {
    const lat = parseCoordinate(latitude, 90);
    const lng = parseCoordinate(longitude, 180);
    const nextErrors: Errors = {};
    if (!isRequired(address)) nextErrors.address = 'Enter the store street address';
    if (!isRequired(cityState)) nextErrors.cityState = 'Enter the city, state and pincode';
    if (lat === null) nextErrors.latitude = 'Enter a latitude between -90 and 90';
    if (lng === null) nextErrors.longitude = 'Enter a longitude between -180 and 180';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || lat === null || lng === null) return;

    updateStoreLocation({ address: address.trim(), cityState: cityState.trim(), latitude: lat, longitude: lng });
    navigation.goBack();
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Store Location" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>Where is your store?</Text>
          <Text style={styles.subtitle}>Delivery partners use this address and these coordinates to reach you</Text>
        </View>

        <FormSectionCard title="Address">
          <Input
            label="Street Address"
            required
            leftIcon="pin"
            value={address}
            onChangeText={text => {
              setAddress(text);
              clear('address');
            }}
            placeholder="Shop number, building, street"
            error={errors.address}
          />
          <Input
            label="City, State, Pincode"
            required
            value={cityState}
            onChangeText={text => {
              setCityState(text);
              clear('cityState');
            }}
            placeholder="City, State 000000"
            error={errors.cityState}
          />
        </FormSectionCard>

        <FormSectionCard title="Coordinates">
          <Input
            label="Latitude"
            required
            value={latitude}
            onChangeText={text => {
              setLatitude(text.replace(/[^0-9.-]/g, ''));
              clear('latitude');
            }}
            placeholder="e.g. 12.971599"
            keyboardType="numbers-and-punctuation"
            error={errors.latitude}
          />
          <Input
            label="Longitude"
            required
            value={longitude}
            onChangeText={text => {
              setLongitude(text.replace(/[^0-9.-]/g, ''));
              clear('longitude');
            }}
            placeholder="e.g. 77.594566"
            keyboardType="numbers-and-punctuation"
            error={errors.longitude}
          />
        </FormSectionCard>

        <InfoBanner
          variant="info"
          message="Open any maps app, long-press your store's position and copy the latitude and longitude shown there."
        />

        <View style={styles.footer}>
          <Button label="Confirm Location" onPress={handleConfirm} />
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
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
