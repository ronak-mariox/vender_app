import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { NavHeader, ScreenContainer } from '../../components';
import { useSupport, SupportCategory } from '../../context/SupportContext';
import { useSupportDraft } from '../../context/SupportDraftContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SupportCategories'>;

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

// SupportCategory has no short "blurb" field — this local copy mirrors the exact
// Figma subtitle text per category.
const CATEGORY_BLURBS: Record<string, string> = {
  'order-issues': 'Acceptance, preparation, dispatch',
  'payment-issues': 'Payments, charges, refunds',
  'settlement-issues': 'Delays, discrepancies, failed credits',
  'inventory-issues': 'Stock updates, alerts, bulk upload',
  'product-issues': 'Listing, approval, pricing',
  'delivery-issues': 'Partner, handover, tracking',
  'account-issues': 'Profile, KYC, security',
  other: 'Anything else',
};

export function SupportCategoriesScreen({ navigation }: Props) {
  const { categories } = useSupport();
  const { setCategory } = useSupportDraft();

  function handleSelect(category: SupportCategory) {
    setCategory(category.id, category.label);
    navigation.navigate('SelectIssue', { categoryId: category.id });
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <NavHeader title="Support Categories" onBack={() => navigation.goBack()} />
      <Text style={styles.subtitle}>Select a category to find help.</Text>
      <ScrollView contentContainerStyle={styles.content}>
        {categories.map(category => {
          const tint = CATEGORY_ICON_TINTS[category.id] ?? colors.textSecondary;
          return (
            <Pressable key={category.id} style={styles.row} onPress={() => handleSelect(category)}>
              <View style={[styles.iconWrap, { backgroundColor: category.iconBg }]}>
                <Icon name={category.icon} size={20} color={tint} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.label}>{category.label}</Text>
                <Text style={styles.blurb}>{CATEGORY_BLURBS[category.id] ?? ''}</Text>
                <Text style={styles.count}>{category.articleCount} articles</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.textSecondary} />
            </Pressable>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg + 2,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.bodySemibold,
    fontSize: 15,
    lineHeight: 22.5,
    color: colors.textPrimary,
  },
  blurb: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  count: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
