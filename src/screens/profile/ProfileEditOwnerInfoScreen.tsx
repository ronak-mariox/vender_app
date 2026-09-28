import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Input, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useProfile } from '../../context/ProfileContext';
import { isRequired, isValidEmail, isValidMobile, type FormErrors } from '../../utils/validators';
import { getApiErrorMessage, getFieldErrors } from '../../services/api';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileEditOwnerInfo'>;

type Errors = FormErrors<'name' | 'phone' | 'email'>;

export function ProfileEditOwnerInfoScreen({ navigation }: Props) {
  const { profile, updateOwnerInfo } = useProfile();
  const { owner } = profile;

  const [name, setName] = useState(owner.name);
  const [phone, setPhone] = useState(owner.phone);
  const [email, setEmail] = useState(owner.email);
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (isSaving) return;
    const nextErrors: Errors = {};
    if (!isRequired(name)) nextErrors.name = 'Required';
    if (!isValidMobile(phone)) nextErrors.phone = 'Enter a valid 10-digit mobile number';
    if (email && !isValidEmail(email)) nextErrors.email = 'Enter a valid email address';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await updateOwnerInfo({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      navigation.goBack();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors({
        name: fieldErrors.fullName,
        phone: fieldErrors.mobile,
        email: fieldErrors.email,
        form: getApiErrorMessage(err, 'Could not save owner details.'),
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenContainer scrollable={false} backgroundColor={colors.white}>
      <NavHeader title="Edit Owner Information" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.banner}>
            <Icon name="info" size={13} color={colors.primaryDark} />
            <Text style={styles.bannerText}>Date of birth is a verified KYC detail and can't be edited here.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              required
              value={name}
              onChangeText={text => {
                setName(text);
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
            />
            <Input
              label="Mobile Number"
              required
              value={phone}
              onChangeText={text => {
                setPhone(text.replace(/[^0-9]/g, '').slice(0, 10));
                if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
              }}
              keyboardType="number-pad"
              error={errors.phone}
            />
            <Input
              label="Email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            {owner.dateOfBirth ? <Input label="Date of Birth" value={owner.dateOfBirth} onChangeText={() => {}} editable={false} /> : null}

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
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.sm + 2,
    padding: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    color: colors.primaryDark,
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
