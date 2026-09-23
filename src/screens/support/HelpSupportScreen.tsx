import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon, IconName } from '../../icons/Icon';
import { Input, ScreenContainer } from '../../components';
import { useSupport, SupportCategory } from '../../context/SupportContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'HelpSupport'>;

type QuickAction = {
  key: string;
  icon: IconName;
  label: string;
  onPress: (navigation: Props['navigation']) => void;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    key: 'raise-ticket',
    icon: 'edit',
    label: 'Raise a Ticket',
    onPress: navigation => navigation.navigate('SupportCategories'),
  },
  {
    key: 'track-ticket',
    icon: 'trending-up',
    label: 'Track Ticket',
    onPress: navigation => navigation.navigate('TicketStatus'),
  },
  {
    key: 'faqs',
    icon: 'info',
    label: 'FAQs',
    onPress: () => Alert.alert('FAQs', 'Coming soon.'),
  },
  {
    key: 'call-support',
    icon: 'phone',
    label: 'Call Support',
    onPress: () => Alert.alert('Call Support', 'Calling support is not available in this preview.'),
  },
];

const FAQ_ITEMS = [
  { id: 'accept-order', title: 'How do I accept an order?' },
  { id: 'settlement-timing', title: 'When will I get my settlement?' },
  { id: 'update-stock', title: 'How to update my stock?' },
];

// SupportCategory only carries an `iconBg` tint; this local map derives a matching
// foreground icon color per category so rows visually match the Figma design.
const CATEGORY_ICON_TINTS: Record<string, string> = {
  'order-issues': '#1570EF',
  'payment-issues': '#F79009',
  'settlement-issues': '#16A34A',
  'inventory-issues': '#1CA672',
  'product-issues': '#7C3AED',
  'delivery-issues': '#E11D48',
  'account-issues': '#1570EF',
  other: '#667085',
};

export function HelpSupportScreen({ navigation }: Props) {
  const { categories } = useSupport();
  const [search, setSearch] = useState('');

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(item => item.title.toLowerCase().includes(query));
  }, [search]);

  function renderCategoryRow(category: SupportCategory) {
    const tint = CATEGORY_ICON_TINTS[category.id] ?? colors.textSecondary;
    return (
      <Pressable
        key={category.id}
        style={styles.categoryRow}
        onPress={() => navigation.navigate('SelectIssue', { categoryId: category.id })}
      >
        <View style={styles.categoryLeft}>
          <View style={[styles.categoryIconWrap, { backgroundColor: category.iconBg }]}>
            <Icon name={category.icon} size={20} color={tint} />
          </View>
          <View>
            <Text style={styles.categoryLabel}>{category.label}</Text>
            <Text style={styles.categoryCount}>{category.articleCount} articles</Text>
          </View>
        </View>
        <Icon name="chevron-right" size={16} color={colors.textSecondary} />
      </Pressable>
    );
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input leftIcon="search" placeholder="Search for help..." value={search} onChangeText={setSearch} />

        <View style={styles.tileGrid}>
          {QUICK_ACTIONS.map(action => (
            <Pressable key={action.key} style={styles.tile} onPress={() => action.onPress(navigation)}>
              <Icon name={action.icon} size={22} color={colors.primary} />
              <Text style={styles.tileLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>How can we help?</Text>
        <View style={styles.faqList}>
          {filteredFaqs.map(item => (
            <Pressable
              key={item.id}
              style={styles.faqRow}
              onPress={() => Alert.alert(item.title, 'Coming soon.')}
            >
              <Text style={styles.faqLabel}>{item.title}</Text>
              <Icon name="chevron-right" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, styles.categoriesTitle]}>Support Categories</Text>
        <View style={styles.categoryList}>{categories.map(renderCategoryRow)}</View>

        <View style={styles.contactCard}>
          <View style={styles.contactLeft}>
            <Icon name="phone" size={20} color={colors.textPrimary} />
            <View>
              <Text style={styles.contactTitle}>Contact Support</Text>
              <Text style={styles.contactSubtitle}>Call or chat with us</Text>
            </View>
          </View>
          <View style={styles.contactActions}>
            <Pressable
              style={styles.contactActionButton}
              onPress={() => Alert.alert('Call Support', 'Calling support is not available in this preview.')}
            >
              <Icon name="phone" size={20} color={colors.primary} />
            </Pressable>
            <Pressable
              style={styles.contactActionButton}
              onPress={() => Alert.alert('Chat Support', 'Chat support is not available in this preview.')}
            >
              <Icon name="message-otp" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 18,
    lineHeight: 27,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.huge,
    gap: spacing.xl,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md + 2,
  },
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  tileLabel: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.textPrimary,
  },
  categoriesTitle: {
    marginTop: spacing.xs,
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    paddingRight: spacing.md,
  },
  categoryList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  categoryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  categoryCount: {
    ...typography.caption,
    color: colors.textSecondary,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
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
