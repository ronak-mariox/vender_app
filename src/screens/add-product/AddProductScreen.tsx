import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { useStoreSetup } from '../../context/StoreSetupContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'AddProduct'>;

const STEP_CHIPS = [
  '1. Basic Info',
  '2. Images',
  '3. Category',
  '4. Description',
  '5. Pack Size',
  '6. Pricing',
  '7. Tax',
  '8. Identifiers',
  '9. Stock',
];

const METHODS: {
  key: string;
  icon: IconName;
  title: string;
  description: string;
  badge?: string;
  background: string;
  border: string;
  iconBackground: string;
}[] = [
  {
    key: 'manual',
    icon: 'edit',
    title: 'Add Manually',
    description: 'Fill in product details step by step',
    badge: 'Recommended',
    background: colors.primarySurface,
    border: colors.primary,
    iconBackground: colors.overlayLight50,
  },
  {
    key: 'scan',
    icon: 'barcode',
    title: 'Scan Barcode',
    description: 'Auto-fill details by scanning product barcode',
    badge: 'Coming soon',
    background: '#EFF8FF',
    border: '#B2DDFF',
    iconBackground: colors.overlayLight50,
  },
  {
    key: 'bulk',
    icon: 'upload',
    title: 'Bulk Upload',
    description: 'Upload multiple products via Excel/CSV file',
    badge: 'Coming soon',
    background: '#F5F3FF',
    border: '#C4B5FD',
    iconBackground: colors.overlayLight50,
  },
];

export function AddProductScreen({ navigation }: Props) {
  const storeSetup = useStoreSetup();
  const [checking, setChecking] = useState(true);
  const alerted = useRef(false);

  // Enforces the intended flow (registration -> store setup -> products): this is
  // the single screen every "Add Product" entry point funnels through (Dashboard,
  // the product catalog's "+" button, and the product-approval notification's
  // "Add Another"), so gating here catches all of them at once instead of
  // duplicating the check at every call site. The backend enforces the same rule
  // on the actual create call — this is just to redirect before the vendor wastes
  // time filling out the whole wizard only to be blocked at the end.
  useFocusEffect(
    useCallback(() => {
      alerted.current = false;
      setChecking(true);
      storeSetup.refresh().finally(() => setChecking(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    if (checking || alerted.current) return;
    if (!storeSetup.data.setupCompletedAt) {
      alerted.current = true;
      Alert.alert(
        'Finish store setup first',
        "Complete your store setup so customers can find and order from you before you start adding products.",
        [
          { text: 'Not now', style: 'cancel', onPress: () => navigation.goBack() },
          { text: 'Set Up Now', onPress: () => navigation.replace('StoreSetupIntro') },
        ],
        { cancelable: false },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking, storeSetup.data.setupCompletedAt]);

  function handleMethod(key: string) {
    if (key === 'manual') {
      navigation.navigate('ProductBasicInfo');
      return;
    }
    Alert.alert('Coming soon', 'This add-product method is not available yet. Please add products manually.');
  }

  if (checking) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="Add Product" onBack={() => navigation.goBack()} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </ScreenContainer>
    );
  }

  if (!storeSetup.data.setupCompletedAt) {
    // Alert above is already showing / about to show — render nothing behind it.
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="Add Product" onBack={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <NavHeader title="Add Product" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headingBlock}>
          <Text style={styles.heading}>How would you like to add?</Text>
          <Text style={styles.subtitle}>Choose a method to add products to your catalog</Text>
        </View>

        <View style={styles.methodList}>
          {METHODS.map(method => (
            <Pressable
              key={method.key}
              onPress={() => handleMethod(method.key)}
              style={[styles.methodCard, { backgroundColor: method.background, borderColor: method.border }]}
            >
              <View style={[styles.methodIconWrapper, { backgroundColor: method.iconBackground }]}>
                <Icon name={method.icon} size={28} color={colors.textPrimary} />
              </View>
              <View style={styles.methodTextColumn}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  {method.badge ? (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgePillText}>{method.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>Manual entry · {STEP_CHIPS.length} steps</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {STEP_CHIPS.map(chip => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.xxl,
  },
  headingBlock: {
    gap: spacing.xs,
  },
  heading: {
    ...typography.h3,
    fontSize: 20,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  methodList: {
    gap: spacing.xl,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1.5,
  },
  methodIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  methodTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  badgePill: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgePillText: {
    ...typography.tinyBold,
    color: colors.white,
  },
  methodDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  summaryText: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  chipText: {
    ...typography.tinyBold,
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
});
