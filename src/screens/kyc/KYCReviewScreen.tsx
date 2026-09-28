import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ReviewSectionCard, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration } from '../../context/RegistrationContext';
import { BUSINESS_TYPE_OPTIONS } from '../registration/BusinessTypeScreen';
import { formatDisplayDate } from '../registration/registrationHelpers';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'KYCReview'>;

export function KYCReviewScreen({ navigation }: Props) {
  const { data, refresh } = useRegistration();

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const steps: { done: boolean; screen: keyof AuthStackParamList }[] = [
    { done: Boolean(data.businessType), screen: 'BusinessType' },
    { done: Boolean(data.businessInfo), screen: 'BusinessInfo' },
    { done: Boolean(data.ownerInfo), screen: 'OwnerInfo' },
    { done: Boolean(data.storeInfo), screen: 'StoreInfo' },
    { done: Boolean(data.gstDetails), screen: 'GSTDetails' },
    { done: Boolean(data.panDetails), screen: 'PANVerification' },
    { done: Boolean(data.businessProof), screen: 'BusinessProof' },
    { done: Boolean(data.bankDetails), screen: 'BankDetails' },
  ];
  const completedSteps = steps.filter(step => step.done).length;
  const totalSteps = steps.length;
  const firstMissing = steps.find(step => !step.done)?.screen;
  const allComplete = completedSteps === totalSteps;

  const businessTypeOption = BUSINESS_TYPE_OPTIONS.find(option => option.value === data.businessType);

  function handleSubmit() {
    if (!allComplete) {
      Alert.alert('Incomplete application', 'Please complete all sections before submitting.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            if (firstMissing) navigation.navigate(firstMissing as 'BusinessType');
          },
        },
      ]);
      return;
    }
    navigation.navigate('VendorAgreement');
  }

  return (
    <ScreenContainer backgroundColor={colors.surface} scrollable>
      <NavHeader title="Review Application" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Icon name="shield-check" size={20} color={colors.white} />
          </View>
          <View style={styles.bannerTextColumn}>
            <Text style={styles.bannerTitle}>Review your application</Text>
            <Text style={styles.bannerSubtitle}>
              {allComplete
                ? 'All sections complete. Please review before submitting. Use Edit to make changes.'
                : `${totalSteps - completedSteps} of ${totalSteps} sections still need to be completed.`}
            </Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(completedSteps / totalSteps) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedSteps}/{totalSteps} Complete
          </Text>
        </View>

        <View style={styles.sections}>
          {businessTypeOption ? (
            <ReviewSectionCard
              icon="briefcase"
              title="Business Type"
              rows={[
                { label: 'Type', value: businessTypeOption.title },
                { label: 'Structure', value: businessTypeOption.description },
              ]}
              onEdit={() => navigation.navigate('BusinessType')}
            />
          ) : null}

          {data.businessInfo ? (
            <ReviewSectionCard
              icon="file-text"
              title="Business Information"
              rows={[
                { label: 'Legal Name', value: data.businessInfo.legalName },
                { label: 'Display Name', value: data.businessInfo.displayName },
                { label: 'Category', value: data.businessInfo.category },
                {
                  label: 'Address',
                  value: `${data.businessInfo.addressLine1}, ${data.businessInfo.city} ${data.businessInfo.pincode}`,
                },
              ]}
              onEdit={() => navigation.navigate('BusinessInfo')}
            />
          ) : null}

          {data.ownerInfo ? (
            <ReviewSectionCard
              icon="user"
              title="Owner Information"
              rows={[
                { label: 'Full Name', value: data.ownerInfo.fullName },
                { label: 'Mobile', value: `+91 ${data.ownerInfo.mobile} ✓` },
                { label: 'Email', value: data.ownerInfo.email },
                { label: 'Date of Birth', value: formatDisplayDate(data.ownerInfo.dob) },
                { label: 'PAN', value: data.ownerInfo.pan },
              ]}
              onEdit={() => navigation.navigate('OwnerInfo')}
            />
          ) : null}

          {data.storeInfo ? (
            <ReviewSectionCard
              icon="home"
              title="Store Information"
              rows={[
                { label: 'Store Name', value: data.storeInfo.storeName },
                { label: 'Store Address', value: data.storeInfo.storeAddress },
                { label: 'Contact', value: data.storeInfo.contactNumber },
                { label: 'Type', value: data.storeInfo.storeType },
              ]}
              onEdit={() => navigation.navigate('StoreInfo')}
            />
          ) : null}

          {data.gstDetails && !data.gstDetails.registered ? (
            <ReviewSectionCard
              icon="check-circle"
              title="GST Details"
              rows={[{ label: 'GST', value: 'Not registered under GST' }]}
              onEdit={() => navigation.navigate('GSTDetails')}
            />
          ) : null}

          {data.gstDetails?.registered ? (
            <ReviewSectionCard
              icon="check-circle"
              title="GST Details"
              rows={[
                { label: 'GSTIN', value: data.gstDetails.gstin },
                { label: 'Business Name', value: data.gstDetails.businessName },
                {
                  label: 'Certificate',
                  value: data.gstDetails.certificateUrl ? 'Uploaded ✓' : 'Not uploaded',
                },
              ]}
              onEdit={() => navigation.navigate('GSTDetails')}
            />
          ) : null}

          {data.panDetails ? (
            <ReviewSectionCard
              icon="shield-check"
              title="PAN Verification"
              rows={[
                { label: 'PAN Number', value: data.panDetails.panNumber },
                { label: 'PAN Holder', value: data.panDetails.holderName },
                {
                  label: 'Document',
                  value: data.panDetails.documentUrl ? 'Uploaded ✓' : 'Not uploaded',
                },
              ]}
              onEdit={() => navigation.navigate('PANVerification')}
            />
          ) : null}

          {data.businessProof ? (
            <ReviewSectionCard
              icon="file-text"
              title="Business Proof"
              rows={[
                { label: 'Document Type', value: data.businessProof.documentType },
                { label: 'Number', value: data.businessProof.documentNumber },
                {
                  label: 'Valid Until',
                  value: data.businessProof.expiryDate ? formatDisplayDate(data.businessProof.expiryDate) : 'No expiry',
                },
              ]}
              onEdit={() => navigation.navigate('BusinessProof')}
            />
          ) : null}

          {data.bankDetails ? (
            <ReviewSectionCard
              icon="credit-card"
              title="Bank Details"
              rows={[
                { label: 'Account Holder', value: data.bankDetails.accountHolderName },
                {
                  label: 'Account Number',
                  value: `•••• •••• ${data.bankDetails.accountNumber.slice(-4)}`,
                },
                { label: 'IFSC', value: data.bankDetails.ifsc },
                { label: 'Bank', value: `${data.bankDetails.bankName} – ${data.bankDetails.branch}` },
              ]}
              onEdit={() => navigation.navigate('BankDetails')}
            />
          ) : null}
        </View>

        <View style={styles.footer}>
          <Button label="Submit Application" onPress={handleSubmit} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.primarySurface,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextColumn: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  bannerSubtitle: {
    ...typography.captionSemibold,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    width: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.captionSemibold,
    color: colors.primary,
  },
  sections: {
    gap: spacing.lg,
  },
  footer: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
});
