import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { GST_ON_FEE_PERCENT_LABEL, PLATFORM_FEE_PERCENT_LABEL } from '../../constants/fees';
import { spacing } from '../../theme';
import { PolicyMetaBar } from './PolicyMetaBar';
import { PolicySection } from './PolicySection';
import { PolicyScrollFooter } from './PolicyScrollFooter';
import { usePolicyScroll } from './usePolicyScroll';

type Props = NativeStackScreenProps<AuthStackParamList, 'PolicyTerms'>;

export function PolicyTermsScreen({ navigation }: Props) {
  const { progress, reachedEnd, scrollProps } = usePolicyScroll();

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Terms & Conditions" onBack={() => navigation.goBack()} />
      <PolicyMetaBar scrollProgress={progress} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} {...scrollProps}>
        <PolicySection
          heading="1. INTRODUCTION"
          paragraphs={[
            'Welcome to Verdant, an online marketplace operated by Verdant ("Verdant", "we", or "us"). By registering as a vendor on our platform, you agree to be bound by these Terms & Conditions.',
            'These terms constitute a legally binding agreement between you (the "Vendor") and Verdant governing your use of the Verdant Vendor application, APIs, and related services. Please read them carefully before proceeding.',
          ]}
        />
        <PolicySection
          heading="2. VENDOR ELIGIBILITY"
          bullets={[
            'You must be a registered business entity with a valid GSTIN operating within India.',
            'You must hold all requisite food safety (FSSAI) and local trade licences applicable to your business category.',
            'You must be at least 18 years of age and have the legal authority to enter into contracts on behalf of your business.',
          ]}
        />
        <PolicySection
          heading="3. ACCOUNT REGISTRATION"
          paragraphs={[
            'You agree to provide accurate, current, and complete information during the registration process. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
            'Verdant reserves the right to suspend or terminate your account if any information provided is found to be inaccurate, misleading, or in violation of applicable law.',
          ]}
        />
        <PolicySection
          heading="4. PRODUCT LISTING STANDARDS"
          bullets={[
            'All products must comply with Food Safety and Standards Authority of India (FSSAI) regulations and bear valid labelling.',
            'Listings must accurately represent the product including weight, grade, MRP, and expiry date.',
            'Vendors must not list products that are recalled, expired, adulterated, or otherwise prohibited by law.',
            'Verdant may remove non-compliant listings without prior notice and may levy penalties for repeated violations.',
          ]}
        />
        <PolicySection
          heading="5. ORDER FULFILLMENT"
          paragraphs={[
            'Upon receiving an order, vendors must promptly accept or reject it in the app. Failure to fulfil accepted orders constitutes a breach and may affect your account standing.',
            'Vendors are responsible for packaging goods in hygienic, tamper-evident containers that prevent damage during transit. Delivery partners collect orders from your store once they are marked ready.',
            'If you cannot fulfil an accepted order, cancel it in the app with a reason as early as possible so the customer is informed.',
          ]}
        />
        <PolicySection
          heading="6. PAYMENTS & SETTLEMENTS"
          paragraphs={[
            `A settlement is recorded for each delivered order. A platform commission of ${PLATFORM_FEE_PERCENT_LABEL} of the order value plus ${GST_ON_FEE_PERCENT_LABEL} GST on that commission is deducted from each settlement.`,
            'Verdant may withhold settlement amounts for orders under dispute, fraud investigation, or regulatory inquiry. Withheld amounts will be released once the matter is resolved.',
          ]}
        />
        <PolicySection
          heading="7. TERMINATION"
          paragraphs={[
            "Either party may terminate this agreement with 30 days' written notice. Verdant may terminate immediately for cause including, but not limited to, fraud, repeated policy violations, or non-compliance with food safety regulations.",
            'Upon termination, all pending settlements will be processed subject to completion of the dispute window. Verdant shall have no further obligation to the vendor after final settlement.',
          ]}
        />
      </ScrollView>
      <PolicyScrollFooter canAccept={reachedEnd} onAccept={() => navigation.goBack()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
