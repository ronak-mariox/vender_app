import React, { useEffect } from 'react';
import { BackHandler, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { Icon } from '../../icons/Icon';
import { packSizeLabel, useProductDraft, usesVariantPricing } from '../../context/ProductDraftContext';
import { colors, radii, spacing, typography } from '../../theme';
import { ProductThumb } from '../../components/ProductThumb';

type Props = NativeStackScreenProps<AuthStackParamList, 'PublishSuccess'>;

const TIMELINE = [
  { step: 1, title: 'Admin team reviews', meta: 'You will be notified' },
  { step: 2, title: 'Product goes Active', meta: 'After approval' },
  { step: 3, title: 'Customers can order', meta: 'Once active' },
];

export function PublishSuccessScreen({ navigation }: Props) {
  const { draft, effectivePricing, resetDraft } = useProductDraft();
  const basicInfo = draft.basicInfo;
  const packSize = usesVariantPricing(draft.packSize)
    ? `${draft.packSize?.variants.length ?? 0} variants`
    : packSizeLabel(draft.packSize) || '—';

  function handleAddAnother() {
    resetDraft();
    navigation.popTo('AddProduct');
  }

  function handleViewProducts() {
    resetDraft();
    navigation.popToTop();
    navigation.navigate('ProductCatalog');
  }

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleViewProducts();
      return true;
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.checkCircle}>
              <Icon name="check" size={44} color={colors.white} strokeWidth={3} />
            </View>
            <Text style={styles.heading}>Product Submitted!</Text>
            <Text style={styles.subtitle}>
              {basicInfo?.name || 'Your product'} has been submitted and is pending admin review.
            </Text>

            <View style={styles.productCard}>
              <ProductThumb
                imageUrl={draft.images.images[0]}
                style={styles.productIcon}
                iconSize={22}
                iconColor={colors.white}
              />
              <View style={styles.productTextColumn}>
                <Text style={styles.productName} numberOfLines={1}>
                  {basicInfo?.name || '—'}
                </Text>
                <Text style={styles.productMeta}>
                  {packSize} · ₹{effectivePricing?.sellingPrice || 0} · SKU: {draft.identifiers?.sku || '—'}
                </Text>
                <View style={styles.pendingRow}>
                  <View style={styles.pendingDot} />
                  <Text style={styles.pendingText}>Pending Review</Text>
                </View>
              </View>
            </View>

            <View style={styles.timeline}>
              {TIMELINE.map((item, index) => (
                <View
                  key={item.step}
                  style={[styles.timelineRow, index < TIMELINE.length - 1 && styles.timelineRowDivider]}
                >
                  <View style={styles.timelineBubble}>
                    <Text style={styles.timelineBubbleText}>{item.step}</Text>
                  </View>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.timelineMeta}>{item.meta}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Button label="Add Another Product" onPress={handleAddAnother} />
            <Button label="View My Products" variant="outline" onPress={handleViewProducts} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobTop: {
    width: 220,
    height: 220,
    top: -60,
    right: -30,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  blobBottom: {
    width: 160,
    height: 160,
    bottom: 40,
    left: -40,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  heading: {
    ...typography.h1,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.78,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productTextColumn: {
    flex: 1,
    gap: 2,
  },
  productName: {
    ...typography.bodySemibold,
    color: colors.white,
  },
  productMeta: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    backgroundColor: '#FCD34D',
  },
  pendingText: {
    ...typography.tinyBold,
    color: '#FCD34D',
  },
  timeline: {
    width: '100%',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  timelineRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  timelineBubble: {
    width: 22,
    height: 22,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBubbleText: {
    ...typography.tinyBold,
    color: colors.white,
  },
  timelineTitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
  },
  timelineMeta: {
    ...typography.tiny,
    color: 'rgba(255,255,255,0.5)',
  },
  footer: {
    gap: spacing.md,
  },
});
