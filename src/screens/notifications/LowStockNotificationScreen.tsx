import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, NavHeader, ScreenContainer } from '../../components';
import { DetailCard, DetailRow } from './DetailCard';
import { NotificationHero } from './NotificationHero';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { useNotifications } from '../../context/NotificationsContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'LowStockNotification'>;

const FALLBACK_PRODUCT_NAME = 'Amul Gold Milk 1L';
const FALLBACK_STOCK = 8;
const FALLBACK_REORDER = 10;
const FALLBACK_MAX = 50;

function parseLeadingNumber(text?: string): number | undefined {
  if (!text) return undefined;
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

export function LowStockNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification } = useNotifications();
  const { products } = useProductCatalog();

  const notification = getNotification(notificationId);
  const matchedProduct = notification?.productName
    ? products.find(product => product.name === notification.productName)
    : undefined;

  if (!notification) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="Low Stock Alert" onBack={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Notification not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const meta = NOTIFICATION_CATEGORY_META[notification.category];
  const productName = matchedProduct?.name ?? notification.productName ?? FALLBACK_PRODUCT_NAME;
  const currentStock = matchedProduct?.stock ?? parseLeadingNumber(notification.subtitle) ?? FALLBACK_STOCK;
  const reorderThreshold = matchedProduct?.reorderLevel ?? FALLBACK_REORDER;
  const maxCapacity = matchedProduct?.maxStock ?? FALLBACK_MAX;
  const stockRatio = Math.min(1, Math.max(0, maxCapacity > 0 ? currentStock / maxCapacity : 0));
  const otherLowStockCount = products.filter(
    product => product.status === 'low-stock' && product.id !== matchedProduct?.id,
  ).length;

  function handleUpdateStock() {
    if (matchedProduct) {
      navigation.navigate('UpdateQuantity', { productId: matchedProduct.id });
    } else {
      Alert.alert('Product not found', `We couldn't find "${productName}" in your catalog.`);
    }
  }

  function handleSetThreshold() {
    Alert.alert('Set Alert Threshold', 'Threshold settings are not available yet.');
  }

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="Low Stock Alert" onBack={() => navigation.goBack()} />
      <NotificationHero
        icon={meta.icon}
        iconColor={meta.iconColor}
        iconBg={meta.iconBg}
        title={notification.title}
        subtitle={notification.subtitle}
        timeLabel={notification.timeLabel}
      />
      <View style={styles.content}>
        <DetailCard>
          <DetailRow label="Product" value={productName} />
          <DetailRow label="Current Stock" value={`${currentStock} units`} />
          <DetailRow label="Reorder Threshold" value={`${reorderThreshold} units`} />
          <DetailRow label="Max Capacity" value={`${maxCapacity} units`} />
          <View style={styles.stockLevelBlock}>
            <View style={styles.stockLevelRow}>
              <Text style={styles.stockLevelLabel}>Stock level</Text>
              <Text style={[styles.stockLevelValue, { color: meta.accentColor }]}>
                {currentStock} / {maxCapacity} units
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stockRatio * 100}%`, backgroundColor: meta.accentColor },
                ]}
              />
            </View>
          </View>
        </DetailCard>

        {otherLowStockCount > 0 ? (
          <Pressable onPress={() => navigation.navigate('LowStock')} hitSlop={8}>
            <Text style={styles.linkText}>
              + {otherLowStockCount} other product{otherLowStockCount === 1 ? '' : 's'} also low — view all
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.footerButton}>
            <Button label="Update Stock" onPress={handleUpdateStock} />
          </View>
          <View style={styles.footerButton}>
            <Button label="Set Alert Threshold" variant="outline" onPress={handleSetThreshold} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  stockLevelBlock: {
    paddingTop: spacing.lg,
    width: '100%',
  },
  stockLevelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLevelLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stockLevelValue: {
    ...typography.captionSemibold,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.xs,
    width: '100%',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  linkText: {
    ...typography.label,
    color: colors.primary,
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
