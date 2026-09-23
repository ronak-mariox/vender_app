import React, { useCallback, useState } from 'react';
import { Alert, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { usePolicies } from '../../context/PoliciesContext';
import { spacing } from '../../theme';
import { PolicyMetaBar } from './PolicyMetaBar';
import { PolicySection } from './PolicySection';
import { PolicyScrollFooter } from './PolicyScrollFooter';

type Props = NativeStackScreenProps<AuthStackParamList, 'PolicyTerms'>;

export function PolicyTermsScreen({ navigation }: Props) {
  const { getDocument, acceptPolicy } = usePolicies();
  const doc = getDocument('terms');

  const [contentHeight, setContentHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      const percent =
        contentHeight <= layoutHeight ? 100 : (scrollY / (contentHeight - layoutHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, percent)));
    },
    [contentHeight, layoutHeight],
  );

  const handleAccept = useCallback(() => {
    acceptPolicy('terms');
    Alert.alert('Accepted', 'Terms & Conditions accepted.');
  }, [acceptPolicy]);

  const handleDownload = useCallback(() => {
    Alert.alert('Download PDF', 'Coming soon.');
  }, []);

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Terms & Conditions" onBack={() => navigation.goBack()} />
      <PolicyMetaBar
        lastUpdatedLabel={doc.lastUpdatedLabel}
        effectiveLabel={doc.effectiveLabel}
        scrollProgress={scrollProgress}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        onLayout={e => setLayoutHeight(e.nativeEvent.layout.height)}
      >
        <PolicySection
          heading="1. INTRODUCTION"
          paragraphs={[
            'Welcome to Verdant, a B2B grocery procurement platform operated by Verdant Technologies Pvt. Ltd. ("Verdant", "we", or "us"). By registering as a vendor on our platform, you agree to be bound by these Terms & Conditions.',
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
            'Upon receiving an order, vendors must acknowledge within 10 minutes and confirm stock availability. Failure to fulfil confirmed orders constitutes a breach and may result in rating penalties.',
            'Vendors are responsible for packaging goods in hygienic, tamper-evident containers that prevent damage during transit. Verdant-empanelled logistics partners will collect orders from your designated pickup point.',
            'In the event of partial fulfilment, the vendor must notify Verdant support immediately. Partial orders will be settled at the proportion of items delivered, subject to buyer acceptance.',
          ]}
        />
        <PolicySection
          heading="6. PAYMENTS & SETTLEMENTS"
          paragraphs={[
            'Settlements are processed weekly every Monday for orders delivered and confirmed by the preceding Sunday. A platform commission of 8% of the net order value plus applicable GST will be deducted from each settlement.',
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
      <PolicyScrollFooter
        mode="accept-download"
        scrollProgress={scrollProgress}
        onAccept={handleAccept}
        onDownload={handleDownload}
      />
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
