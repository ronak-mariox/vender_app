import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile } from '../../context/ProfileContext';
import { Badge, Button, Input, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { isRequired, type FormErrors } from '../../utils/validators';
import { colors, spacing, typography } from '../../theme';

type Errors = FormErrors<'label' | 'line1' | 'line2' | 'lat' | 'lng'>;

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileAddressDetails'>;

export function ProfileAddressDetailsScreen({ navigation, route }: Props) {
  const { addressId } = route.params;
  const { getAddress, updateAddress } = useProfile();
  const address = getAddress(addressId);

  if (!address) {
    return (
      <ScreenContainer scrollable={false}>
        <NavHeader title="Address Details" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundWrapper}>
          <Text style={styles.notFoundText}>Address not found.</Text>
          <Button label="Go Back" variant="outline" onPress={() => navigation.goBack()} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <AddressDetailsForm
      addressId={addressId}
      initialLabel={address.label}
      initialLine1={address.line1}
      initialLine2={address.line2}
      initialLat={address.lat}
      initialLng={address.lng}
      onSave={async (value) => {
        await updateAddress(addressId, value);
        navigation.goBack();
      }}
      onBack={() => navigation.goBack()}
    />
  );
}

function AddressDetailsForm({
  initialLabel,
  initialLine1,
  initialLine2,
  initialLat,
  initialLng,
  onSave,
  onBack,
}: {
  addressId: string;
  initialLabel: string;
  initialLine1: string;
  initialLine2: string;
  initialLat: number | null;
  initialLng: number | null;
  onSave: (value: { label: string; line1: string; line2: string; lat: number | null; lng: number | null }) => void | Promise<void>;
  onBack: () => void;
}) {
  const [label, setLabel] = useState(initialLabel);
  const [line1, setLine1] = useState(initialLine1);
  const [line2, setLine2] = useState(initialLine2);
  const [lat, setLat] = useState(initialLat != null ? String(initialLat) : '');
  const [lng, setLng] = useState(initialLng != null ? String(initialLng) : '');
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const isVerified = isRequired(lat) && isRequired(lng);

  async function handleSave() {
    if (saving) return;
    const nextErrors: Errors = {};
    if (!isRequired(label)) nextErrors.label = 'Address label is required';
    if (!isRequired(line1)) nextErrors.line1 = 'Address line 1 is required';
    if (!isRequired(line2)) nextErrors.line2 = 'Address line 2 is required';
    if (lat.trim() && Number.isNaN(Number(lat))) nextErrors.lat = 'Enter a valid latitude';
    if (lng.trim() && Number.isNaN(Number(lng))) nextErrors.lng = 'Enter a valid longitude';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        label,
        line1,
        line2,
        lat: lat.trim() ? Number(lat) : null,
        lng: lng.trim() ? Number(lng) : null,
      });
    } catch {
      setErrors({ form: 'Could not save address. Please check your connection and try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scrollable={false}>
      <NavHeader title="Address Details" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Input
            label="Address Label"
            required
            value={label}
            onChangeText={text => {
              setLabel(text);
              if (errors.label) setErrors(prev => ({ ...prev, label: undefined }));
            }}
            placeholder="Store Address"
            error={errors.label}
          />
          <Input
            label="Address Line 1"
            required
            value={line1}
            onChangeText={text => {
              setLine1(text);
              if (errors.line1) setErrors(prev => ({ ...prev, line1: undefined }));
            }}
            placeholder="Shop 12, Laxmi Market"
            error={errors.line1}
          />
          <Input
            label="Address Line 2"
            required
            value={line2}
            onChangeText={text => {
              setLine2(text);
              if (errors.line2) setErrors(prev => ({ ...prev, line2: undefined }));
            }}
            placeholder="Andheri West"
            error={errors.line2}
          />
        </View>

        <View style={styles.mapCard}>
          <View style={styles.mapPreview}>
            <Icon name="pin" size={40} color={colors.primary} />
            {isVerified ? (
              <View style={styles.badgeWrapper}>
                <Badge label="Verified on Map" tone="success" />
              </View>
            ) : null}
          </View>
          <View style={styles.mapFields}>
            <Input
              label="Latitude"
              value={lat}
              onChangeText={text => {
                setLat(text);
                if (errors.lat) setErrors(prev => ({ ...prev, lat: undefined }));
              }}
              placeholder="19.1197"
              keyboardType="numbers-and-punctuation"
              error={errors.lat}
            />
            <Input
              label="Longitude"
              value={lng}
              onChangeText={text => {
                setLng(text);
                if (errors.lng) setErrors(prev => ({ ...prev, lng: undefined }));
              }}
              placeholder="72.8468"
              keyboardType="numbers-and-punctuation"
              error={errors.lng}
            />
          </View>
        </View>

        {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}

        <View style={styles.buttonGroup}>
          <Button label="Save Address" onPress={handleSave} loading={saving} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.surface,
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  mapCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.white,
  },
  mapPreview: {
    height: 180,
    width: '100%',
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrapper: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  mapFields: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  buttonGroup: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  notFoundWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.xxxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    paddingHorizontal: spacing.xl,
  },
});
