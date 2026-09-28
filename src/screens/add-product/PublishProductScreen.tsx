import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Badge, Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { packSizeLabel, useProductDraft, usesVariantPricing } from '../../context/ProductDraftContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'PublishProduct'>;

const AFTER_SUBMITTING = [
  { icon: 'clock' as const, text: 'Your product is sent to the admin team for review' },
  { icon: 'bell' as const, text: "You'll get a notification when it's approved or rejected" },
  { icon: 'globe' as const, text: 'Customers can see and order it once approved' },
];

export function PublishProductScreen({ navigation }: Props) {
  const { draft, effectivePricing, publishDraft } = useProductDraft();
  const basicInfo = draft.basicInfo;
  const perVariant = usesVariantPricing(draft.packSize);
  const sizeLabel = perVariant ? `${draft.packSize?.variants.length ?? 0} variants` : packSizeLabel(draft.packSize) || '—';
  const stockCount = perVariant
    ? (draft.packSize?.variants ?? []).reduce((sum, variant) => sum + (parseInt(variant.stock, 10) || 0), 0)
    : parseInt(draft.stock?.opening ?? '', 10) || 0;
  const [publishing, setPublishing] = useState(false);

  async function handlePublishNow() {
    if (publishing) return;
    setPublishing(true);
    try {
      await publishDraft();
      navigation.replace('PublishSuccess');
    } catch (err) {
      Alert.alert('Could not submit product', getApiErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Publish Product" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard}>
          <ProductThumb
            imageUrl={draft.images.images[0]}
            style={styles.summaryIcon}
            iconSize={24}
            iconColor={colors.textTertiary}
          />
          <View style={styles.summaryTextColumn}>
            <Text style={styles.summaryName}>{basicInfo?.name || '—'}</Text>
            <Text style={styles.summaryMeta}>
              {sizeLabel} · ₹{effectivePricing?.sellingPrice || 0} · {stockCount} in stock
            </Text>
            <View style={styles.badgeWrapper}>
              <Badge label="Not submitted" tone="info" />
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>After Submitting</Text>
          {AFTER_SUBMITTING.map((item, index) => (
            <View key={item.text} style={[styles.infoRow, index < AFTER_SUBMITTING.length - 1 && styles.infoRowDivider]}>
              <Icon name={item.icon} size={16} color={colors.primary} />
              <Text style={styles.infoText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button label="Submit for Review" onPress={handlePublishNow} loading={publishing} disabled={publishing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTextColumn: {
    flex: 1,
    gap: 2,
  },
  summaryName: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  summaryMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badgeWrapper: {
    paddingTop: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
  },
  infoTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.72,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    gap: spacing.lg,
  },
});
