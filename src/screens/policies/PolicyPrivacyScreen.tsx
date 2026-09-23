import React, { useCallback, useState } from 'react';
import { Alert, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { usePolicies } from '../../context/PoliciesContext';
import { colors, spacing, typography } from '../../theme';
import { PolicyMetaBar } from './PolicyMetaBar';
import { PolicySection } from './PolicySection';
import { PolicyScrollFooter } from './PolicyScrollFooter';

type Props = NativeStackScreenProps<AuthStackParamList, 'PolicyPrivacy'>;

export function PolicyPrivacyScreen({ navigation }: Props) {
  const { getDocument, acceptPolicy } = usePolicies();
  const doc = getDocument('privacy');

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
    acceptPolicy('privacy');
    Alert.alert('Accepted', 'Privacy Policy accepted.');
  }, [acceptPolicy]);

  const handleDownload = useCallback(() => {
    Alert.alert('Download PDF', 'Coming soon.');
  }, []);

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <NavHeader title="Privacy Policy" onBack={() => navigation.goBack()} />
      <PolicyMetaBar lastUpdatedLabel={doc.lastUpdatedLabel} scrollProgress={scrollProgress} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        onLayout={e => setLayoutHeight(e.nativeEvent.layout.height)}
      >
        <PolicySection
          heading="1. WHAT WE COLLECT"
          bullets={[
            'Device information: model, OS version, unique device identifiers, IP address.',
            'Location: GPS coordinates at order pickup, delivery zones for logistics optimization.',
            'Transaction data: order history, invoices, payment methods (tokenised), settlement records.',
            'Business data: GSTIN, FSSAI licence number, bank account details (encrypted at rest).',
          ]}
        />
        <PolicySection
          heading="2. HOW WE USE YOUR DATA"
          bullets={[
            'Order processing and logistics co-ordination with delivery partners.',
            'Platform analytics to improve product recommendations and demand forecasting.',
            'Fraud prevention and account security monitoring.',
            'Regulatory compliance reporting as mandated by Indian law.',
          ]}
        />
        <PolicySection
          heading="3. DATA SHARING"
          bullets={[
            'Delivery partners: order address, contact number, and pickup window.',
            'Payment processors: tokenised card/UPI references for settlement.',
            'Regulatory authorities: when required by law or court order.',
          ]}
        />
        <Text style={[styles.trailingParagraph, styles.tightSpacing]}>
          We do not sell your personal data to third parties for advertising purposes.
        </Text>
        <PolicySection
          heading="4. YOUR RIGHTS"
          bullets={[
            'Access: Request a copy of all personal data we hold about you.',
            'Correction: Request correction of inaccurate or incomplete data.',
            'Deletion: Request deletion subject to legal retention obligations.',
            'Portability: Export your data in a machine-readable format.',
          ]}
        />
        <PolicySection
          heading="5. DATA RETENTION"
          bullets={[
            'Transaction data: 7 years from the date of transaction (GST compliance).',
            'Personal and business data: 3 years after account closure.',
            'Logs: 90 days rolling retention, then purged.',
          ]}
        />
        <PolicySection
          heading="6. SECURITY MEASURES"
          paragraphs={[
            'We employ AES-256 encryption at rest, TLS 1.3 in transit, and role-based access controls. Security audits are conducted quarterly by an independent third-party firm. We notify you within 72 hours of detecting any data breach affecting your account.',
          ]}
        />
        <PolicySection heading="7. CONTACT" />
        <Text style={styles.trailingParagraph}>
          For privacy-related inquiries, reach our Data Protection Officer at{' '}
          <Text style={styles.emailText}>privacy@verdant.in</Text> or write to Verdant Technologies Pvt.
          Ltd., 4th Floor, Nexus Tower, Koramangala, Bengaluru — 560034.
        </Text>
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
  trailingParagraph: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 22.1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  tightSpacing: {
    marginTop: spacing.sm,
  },
  emailText: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.primary,
  },
});
