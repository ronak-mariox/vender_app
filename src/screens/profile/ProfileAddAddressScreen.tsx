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

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileAddAddress'>;

export function ProfileAddAddressScreen({ navigation }: Props) {
  const { addAddress } = useProfile();

  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
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
      await addAddress({
        label: label.trim(),
        line1: line1.trim(),
        line2: line2.trim(),
        ...(lat.trim() && { lat: Number(lat) }),
        ...(lng.trim() && { lng: Number(lng) }),
      });
      navigation.goBack();
    } catch {
      setErrors({ form: 'Could not save address. Please check your connection and try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer scrollable={false}>
      <NavHeader title="Add Address" onBack={() => navigation.goBack()} />
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
  errorText: {
    ...typography.caption,
    color: colors.error,
    paddingHorizontal: spacing.xl,
  },
});
