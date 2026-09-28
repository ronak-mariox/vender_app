import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProfile } from '../../context/ProfileContext';
import { isRequired, isValidPincode, type FormErrors } from '../../utils/validators';
import { getApiErrorMessage, getFieldErrors } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileEditVendorInfo'>;

type Errors = FormErrors<'addressLine1' | 'city' | 'state' | 'pincode'>;

export function ProfileEditVendorInfoScreen({ navigation }: Props) {
  const { profile, updateVendorInfo } = useProfile();
  const { vendor } = profile;

  const [addressLine1, setAddressLine1] = useState(vendor.addressLine1);
  const [addressLine2, setAddressLine2] = useState(vendor.addressLine2);
  const [city, setCity] = useState(vendor.city);
  const [state, setState] = useState(vendor.state);
  const [pincode, setPincode] = useState(vendor.pincode);
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (isSaving) return;
    const nextErrors: Errors = {};
    if (!isRequired(addressLine1)) nextErrors.addressLine1 = 'Required';
    if (!isRequired(city)) nextErrors.city = 'Required';
    if (!isRequired(state)) nextErrors.state = 'Required';
    if (pincode && !isValidPincode(pincode)) nextErrors.pincode = 'Enter a valid 6-digit pincode';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await updateVendorInfo({
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      });
      navigation.goBack();
    } catch (err) {
      setErrors({ ...getFieldErrors(err), form: getApiErrorMessage(err, 'Could not save business details.') });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Edit Vendor Information" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.warningBanner}>
            <Icon name="info" size={14} color={colors.warningDark} />
            <Text style={styles.warningText}>
              Business name, type, GSTIN and PAN are verified identity details and can't be edited here. Use Documents to
              replace a verified document.
            </Text>
          </View>

          <View style={styles.form}>
            <Input label="Business Name" value={vendor.legalName} onChangeText={() => {}} editable={false} />
            <Input label="Business Type" value={vendor.businessType} onChangeText={() => {}} editable={false} />
            <Input
              label="Address Line 1"
              required
              value={addressLine1}
              onChangeText={text => {
                setAddressLine1(text);
                if (errors.addressLine1) setErrors(prev => ({ ...prev, addressLine1: undefined }));
              }}
              error={errors.addressLine1}
            />
            <Input label="Address Line 2" value={addressLine2} onChangeText={setAddressLine2} placeholder="Optional" />
            <Input
              label="City"
              required
              value={city}
              onChangeText={text => {
                setCity(text);
                if (errors.city) setErrors(prev => ({ ...prev, city: undefined }));
              }}
              error={errors.city}
            />
            <Input
              label="State"
              required
              value={state}
              onChangeText={text => {
                setState(text);
                if (errors.state) setErrors(prev => ({ ...prev, state: undefined }));
              }}
              error={errors.state}
            />
            <Input
              label="Pincode"
              value={pincode}
              onChangeText={text => {
                setPincode(text.replace(/[^0-9]/g, '').slice(0, 6));
                if (errors.pincode) setErrors(prev => ({ ...prev, pincode: undefined }));
              }}
              keyboardType="number-pad"
              error={errors.pincode}
            />
            {vendor.gstNumber ? <Input label="GSTIN" value={vendor.gstNumber} onChangeText={() => {}} editable={false} /> : null}
            {vendor.panNumber ? <Input label="PAN" value={vendor.panNumber} onChangeText={() => {}} editable={false} /> : null}

            {errors.form ? <Text style={styles.errorText}>{errors.form}</Text> : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Save Changes" onPress={handleSave} loading={isSaving} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.warningSurface,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  warningText: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 20.8,
    color: colors.warningDark,
    flex: 1,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
