import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProfile } from '../../context/ProfileContext';
import { isRequired, isValidGSTIN, isValidPAN, isValidPincode, type FormErrors } from '../../utils/validators';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileEditVendorInfo'>;

type Errors = FormErrors<
  'legalName' | 'businessType' | 'addressLine1' | 'city' | 'state' | 'pincode' | 'gstNumber' | 'panNumber'
>;

export function ProfileEditVendorInfoScreen({ navigation }: Props) {
  const { profile, updateVendorInfo } = useProfile();
  const { vendor } = profile;

  const [legalName, setLegalName] = useState(vendor.legalName);
  const [businessType, setBusinessType] = useState(vendor.businessType);
  const [addressLine1, setAddressLine1] = useState(vendor.addressLine1);
  const [addressLine2, setAddressLine2] = useState(vendor.addressLine2);
  const [city, setCity] = useState(vendor.city);
  const [state, setState] = useState(vendor.state);
  const [pincode, setPincode] = useState(vendor.pincode);
  const [gstNumber, setGstNumber] = useState(vendor.gstNumber);
  const [panNumber, setPanNumber] = useState(vendor.panNumber);
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (isSaving) return;
    const nextErrors: Errors = {};
    if (!isRequired(legalName)) nextErrors.legalName = 'Required';
    if (!isRequired(businessType)) nextErrors.businessType = 'Required';
    if (!isRequired(addressLine1)) nextErrors.addressLine1 = 'Required';
    if (!isRequired(city)) nextErrors.city = 'Required';
    if (!isRequired(state)) nextErrors.state = 'Required';
    if (pincode && !isValidPincode(pincode)) nextErrors.pincode = 'Enter a valid 6-digit pincode';
    if (gstNumber && !isValidGSTIN(gstNumber)) nextErrors.gstNumber = 'Enter a valid GSTIN';
    if (panNumber && !isValidPAN(panNumber)) nextErrors.panNumber = 'Enter a valid PAN';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await updateVendorInfo({
        legalName: legalName.trim(),
        businessType: businessType.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
        panNumber: panNumber.trim().toUpperCase(),
      });
      navigation.goBack();
    } catch {
      setErrors({ form: 'Could not save business details — please check your connection and try again.' });
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
            <Text style={styles.warningText}>Some details require re-verification if changed.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Business Name"
              required
              value={legalName}
              onChangeText={text => {
                setLegalName(text);
                if (errors.legalName) setErrors(prev => ({ ...prev, legalName: undefined }));
              }}
              error={errors.legalName}
            />
            <Input
              label="Business Type"
              required
              value={businessType}
              onChangeText={text => {
                setBusinessType(text);
                if (errors.businessType) setErrors(prev => ({ ...prev, businessType: undefined }));
              }}
              placeholder="e.g. Proprietorship, Partnership"
              error={errors.businessType}
            />
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
            <Input
              label="GSTIN"
              value={gstNumber}
              onChangeText={text => {
                setGstNumber(text.toUpperCase().slice(0, 15));
                if (errors.gstNumber) setErrors(prev => ({ ...prev, gstNumber: undefined }));
              }}
              autoCapitalize="characters"
              error={errors.gstNumber}
            />
            <Input
              label="PAN"
              value={panNumber}
              onChangeText={text => {
                setPanNumber(text.toUpperCase().slice(0, 10));
                if (errors.panNumber) setErrors(prev => ({ ...prev, panNumber: undefined }));
              }}
              autoCapitalize="characters"
              error={errors.panNumber}
            />

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
