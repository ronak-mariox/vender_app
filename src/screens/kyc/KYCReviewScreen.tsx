import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ReviewSectionCard, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useRegistration } from '../../context/RegistrationContext';
import { api } from '../../services/api';
import { BUSINESS_TYPE_OPTIONS } from '../registration/BusinessTypeScreen';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'KYCReview'>;

export function KYCReviewScreen({ navigation }: Props) {
  const {
    data,
    updateBusinessType,
    updateBusinessInfo,
    updateOwnerInfo,
    updateStoreInfo,
    updateGstDetails,
    updatePanDetails,
    updateBusinessProof,
    updateBankDetails,
  } = useRegistration();

  // Resumability: if the app was restarted mid-registration, RegistrationContext may
  // be missing earlier steps even though the server already persisted them (each
  // registration PATCH call saves to the backend as it happens) — e.g. a restart
  // routes the vendor straight to their next incomplete step, they fill in just
  // that one, and local context now only has that single step. Reconcile by
  // pulling the server's copy and filling in ONLY whichever steps are missing
  // locally — never overwriting a step that's already present in local context —
  // so this runs safely every time regardless of how much local state exists.
  //
  // The local-only `verified` flag (not persisted by the backend) is re-derived as
  // `true` for any step filled in from the server, since a previously-saved step
  // implies it passed validation at the time.
  useEffect(() => {
    (async () => {
      try {
        const { data: remote } = await api.get('/vendor/registration');
        if (remote.businessType && !data.businessType) updateBusinessType(remote.businessType);
        if (remote.businessInfo && !data.businessInfo) updateBusinessInfo(remote.businessInfo);
        if (remote.ownerInfo && !data.ownerInfo) updateOwnerInfo(remote.ownerInfo);
        if (remote.storeInfo && !data.storeInfo) updateStoreInfo(remote.storeInfo);
        if (remote.gstDetails && !data.gstDetails) updateGstDetails({ ...remote.gstDetails, verified: true });
        if (remote.panDetails && !data.panDetails) updatePanDetails({ ...remote.panDetails, verified: true });
        if (remote.businessProof && !data.businessProof) updateBusinessProof(remote.businessProof);
        if (remote.bankDetails && !data.bankDetails) updateBankDetails({ ...remote.bankDetails, verified: true });
      } catch {
        // Best-effort — if this fails (offline, etc.) the screen just shows whatever
        // is already in local context.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const businessTypeOption = BUSINESS_TYPE_OPTIONS.find(option => option.value === data.businessType);

  function handleSubmit() {
    if (
      !data.businessType ||
      !data.businessInfo ||
      !data.ownerInfo ||
      !data.storeInfo ||
      !data.panDetails ||
      !data.businessProof ||
      !data.bankDetails
    ) {
      Alert.alert('Incomplete application', 'Please complete all sections before submitting.');
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
              All 8 sections complete. Please review before submitting. Use Edit to make changes.
            </Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>8/8 Complete</Text>
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
                { label: 'Email', value: `${data.ownerInfo.email} ✓` },
                { label: 'Date of Birth', value: data.ownerInfo.dob },
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
                { label: 'Valid Until', value: data.businessProof.expiryDate },
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
