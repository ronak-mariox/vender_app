import React, { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Input, NavHeader, ScreenContainer } from '../../components';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'HelpSupport'>;

const SUPPORT_PHONE = '+911800123456';
const SUPPORT_PHONE_DISPLAY = '1800 123 456';
const SUPPORT_EMAIL = 'support@verdant.example';

const FAQ_ITEMS = [
  {
    id: 'accept-order',
    title: 'How do I accept an order?',
    answer:
      'Open Orders → New, tap the order and choose Accept (or Reject with a reason). Once accepted, start preparing it and mark it Ready when packed so a delivery partner can pick it up.',
  },
  {
    id: 'cancel-order',
    title: 'Can I cancel an order after accepting it?',
    answer:
      'Yes — until a delivery partner picks it up, you can cancel an accepted, preparing or ready order from its details screen. Stock for the items is returned to your inventory.',
  },
  {
    id: 'settlement-timing',
    title: 'When will I get my settlement?',
    answer:
      'A settlement is recorded for each order once it is delivered. Track pending and paid settlements under Payments.',
  },
  {
    id: 'update-stock',
    title: 'How do I update my stock?',
    answer:
      'Go to Inventory, choose a product and tap Update Quantity. Every change is saved to Inventory History.',
  },
  {
    id: 'product-approval',
    title: 'Why is my product not live yet?',
    answer:
      'New products are reviewed by our team before they go live. You will get a notification once a product is approved or rejected.',
  },
  {
    id: 'bank-details',
    title: 'How do I change my bank details?',
    answer:
      'Go to Profile → Bank Details → Edit Bank Details. Your request is reviewed by our team, and your current account stays active until it is approved.',
  },
];

function openLink(url: string, fallback: string) {
  Linking.openURL(url).catch(() => Alert.alert('Could not open', fallback));
}

export function HelpSupportScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      item => item.title.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query),
    );
  }, [search]);

  const callSupport = () => openLink(`tel:${SUPPORT_PHONE}`, `Please dial ${SUPPORT_PHONE_DISPLAY}.`);
  const emailSupport = () => openLink(`mailto:${SUPPORT_EMAIL}`, `Please email ${SUPPORT_EMAIL}.`);

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <NavHeader title="Help & Support" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input leftIcon="search" placeholder="Search FAQs..." value={search} onChangeText={setSearch} />

        <Text style={styles.sectionTitle}>Frequently asked questions</Text>
        <View style={styles.faqList}>
          {filteredFaqs.length === 0 ? (
            <Text style={styles.emptyText}>No matching questions. Contact support below.</Text>
          ) : null}
          {filteredFaqs.map(item => {
            const expanded = expandedId === item.id;
            return (
              <View key={item.id} style={styles.faqItem}>
                <Pressable style={styles.faqRow} onPress={() => setExpandedId(expanded ? null : item.id)}>
                  <Text style={styles.faqLabel}>{item.title}</Text>
                  <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={16} color={colors.textSecondary} />
                </Pressable>
                {expanded ? <Text style={styles.faqAnswer}>{item.answer}</Text> : null}
              </View>
            );
          })}
        </View>

        <View style={styles.contactCard}>
          <View style={styles.contactLeft}>
            <Icon name="phone" size={20} color={colors.textPrimary} />
            <View>
              <Text style={styles.contactTitle}>Contact Support</Text>
              <Text style={styles.contactSubtitle}>
                {SUPPORT_PHONE_DISPLAY} · {SUPPORT_EMAIL}
              </Text>
            </View>
          </View>
          <View style={styles.contactActions}>
            <Pressable style={styles.contactActionButton} onPress={callSupport} accessibilityLabel="Call support">
              <Icon name="phone" size={20} color={colors.primary} />
            </Pressable>
            <Pressable style={styles.contactActionButton} onPress={emailSupport} accessibilityLabel="Email support">
              <Icon name="mail" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.textPrimary,
  },
  faqList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg + 1,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqAnswer: {
    ...typography.label,
    color: colors.textSecondary,
    paddingBottom: spacing.lg,
  },
  emptyText: {
    ...typography.label,
    color: colors.textSecondary,
    paddingVertical: spacing.lg,
  },
  faqLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    paddingRight: spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + 2,
  },
  contactLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    paddingRight: spacing.md,
  },
  contactTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  contactSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.md + 2,
  },
  contactActionButton: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
