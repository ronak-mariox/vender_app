import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, InfoBanner, NavHeader, ScreenContainer } from '../../components';
import { DetailCard, DetailRow } from './DetailCard';
import { NotificationHero } from './NotificationHero';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { useNotifications } from '../../context/NotificationsContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OutOfStockNotification'>;

const FALLBACK_PRODUCT_NAME = 'Tata Salt 1kg';
const FALLBACK_MISSED_ORDERS = '12 / day';
const FALLBACK_LOST_REVENUE = '₹348 / day';

export function OutOfStockNotificationScreen({ navigation, route }: Props) {
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
        <NavHeader title="Out of Stock" onBack={() => navigation.goBack()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Notification not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const meta = NOTIFICATION_CATEGORY_META[notification.category];
  const productName = matchedProduct?.name ?? notification.productName ?? FALLBACK_PRODUCT_NAME;

  function handleAddStock() {
    if (matchedProduct) {
      navigation.navigate('UpdateQuantity', { productId: matchedProduct.id });
    } else {
      Alert.alert('Product not found', `We couldn't find "${productName}" in your catalog.`);
    }
  }

  function handleMarkUnavailable() {
    if (matchedProduct) {
      navigation.navigate('DeactivateProduct', { productId: matchedProduct.id });
    } else {
      Alert.alert('Product not found', `We couldn't find "${productName}" in your catalog.`);
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title="Out of Stock" onBack={() => navigation.goBack()} />
      <View style={styles.heroWrapper}>
        <NotificationHero
          icon={meta.icon}
          iconColor={meta.iconColor}
          iconBg={meta.iconBg}
          title={notification.title}
          subtitle={notification.subtitle}
          timeLabel={notification.timeLabel}
        />
        <View style={styles.urgencyDot} pointerEvents="none" />
      </View>
      <View style={styles.content}>
        <InfoBanner variant="error" message="This product is hidden from customers until restocked." />

        <DetailCard title="Estimated Impact">
          <DetailRow label="Est. missed orders" value={FALLBACK_MISSED_ORDERS} />
          <DetailRow label="Est. lost revenue" value={FALLBACK_LOST_REVENUE} bold />
        </DetailCard>

        <View style={styles.footerRow}>
          <View style={styles.footerButton}>
            <Button label="Add Stock Now" onPress={handleAddStock} />
          </View>
          <View style={styles.footerButton}>
            <Button label="Mark Unavailable" variant="outline" onPress={handleMarkUnavailable} />
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
  heroWrapper: {
    position: 'relative',
    width: '100%',
  },
  urgencyDot: {
    position: 'absolute',
    top: spacing.xxl - 4,
    left: '50%',
    marginLeft: 18,
    width: 14,
    height: 14,
    borderRadius: radii.full,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
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
