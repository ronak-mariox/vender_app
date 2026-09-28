import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, Checkbox, NavHeader } from '../../components';
import { GST_ON_FEE_PERCENT_LABEL, PLATFORM_FEE_PERCENT_LABEL } from '../../constants/fees';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'VendorAgreement'>;

const SECTIONS = [
  {
    title: '1. Vendor Eligibility',
    body: 'To register as a vendor on the Verdant platform, you must be at least 18 years of age and legally authorized to conduct business in India. You must possess all necessary licenses, permits, and registrations required by applicable law.',
  },
  {
    title: '2. Product Listing Guidelines',
    body: 'Vendors agree to list only genuine, accurately described products. Prohibited items include counterfeit goods, hazardous materials, and items banned under applicable laws. Verdant reserves the right to remove listings that violate these guidelines without prior notice.',
  },
  {
    title: '3. Commission & Payment Terms',
    body: `Verdant charges a commission of ${PLATFORM_FEE_PERCENT_LABEL} on the items total of each order, plus ${GST_ON_FEE_PERCENT_LABEL} GST on that commission. Settlements are paid to your registered bank account. Fee rates are subject to change with prior notice.`,
  },
  {
    title: '4. Fulfillment & Returns',
    body: "Vendors are responsible for accurate order fulfillment within the promised timeline. Return and refund policies must comply with Verdant's Buyer Protection Policy. Unresolved disputes may result in automatic refunds debited from vendor accounts.",
  },
  {
    title: '5. Data & Privacy',
    body: 'By registering, vendors consent to Verdant collecting and processing business and transaction data as described in the Privacy Policy. Verdant will not sell vendor data to third parties without consent. Data is retained for 7 years for regulatory compliance.',
  },
  {
    title: '6. Account Suspension',
    body: 'Verdant may suspend or terminate vendor accounts for repeated policy violations, fraud, or activities harmful to buyers. Vendors will be notified via registered email before suspension except in cases of severe policy breaches.',
  },
];

export function VendorAgreementScreen({ navigation }: Props) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedSignatory, setAgreedSignatory] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);

  const canContinue = agreedTerms && agreedSignatory;

  function handleAccept() {
    if (!canContinue) {
      Alert.alert(
        'Agreement required',
        'Please accept the Terms of Service and confirm you are an authorised signatory to continue.',
      );
      return;
    }
    navigation.navigate('KYCSubmission');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <NavHeader title="Vendor Agreement" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Terms of Service</Text>

        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>Privacy Policy</Text>
          <Text style={styles.privacyBody}>
            Our Privacy Policy describes how we collect, use, and protect your personal and business
            data. By using Verdant, you agree to the terms of our Privacy Policy.
          </Text>
          <Pressable onPress={() => Alert.alert('Privacy Policy', 'Full policy coming soon.')}>
            <Text style={styles.privacyLink}>Read Full Privacy Policy →</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.checkboxGroup}>
          <View style={styles.checkboxRow}>
            <Checkbox checked={agreedTerms} onToggle={setAgreedTerms} />
            <Text style={styles.checkboxLabel}>
              I have read and agree to Verdant's{' '}
              <Text style={styles.checkboxLink}>Terms of Service</Text> and{' '}
              <Text style={styles.checkboxLink}>Privacy Policy</Text>
            </Text>
          </View>
          <View style={styles.checkboxRow}>
            <Checkbox checked={agreedSignatory} onToggle={setAgreedSignatory} />
            <Text style={styles.checkboxLabel}>
              I am authorized to sign this agreement on behalf of the registered business entity
            </Text>
          </View>
          <View style={styles.checkboxRow}>
            <Checkbox checked={agreedMarketing} onToggle={setAgreedMarketing} />
            <Text style={[styles.checkboxLabel, styles.checkboxLabelMuted]}>
              I consent to receive marketing communications (optional)
            </Text>
          </View>
        </View>
        <Button label="Accept & Continue" onPress={handleAccept} disabled={!canContinue} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  section: {
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  sectionBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20.4,
  },
  privacyCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  privacyTitle: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  privacyBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 19.2,
  },
  privacyLink: {
    ...typography.captionSemibold,
    color: colors.primary,
    paddingTop: spacing.xs,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.xl,
  },
  checkboxGroup: {
    gap: spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  checkboxLabel: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
  checkboxLabelMuted: {
    color: colors.textSecondary,
  },
  checkboxLink: {
    color: colors.primary,
    fontFamily: fontFamilies.medium,
  },
});
