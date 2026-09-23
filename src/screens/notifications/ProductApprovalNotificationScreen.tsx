import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, InfoBanner, NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { NotificationHero } from './NotificationHero';
import { DetailCard } from './DetailCard';
import { useNotifications } from '../../context/NotificationsContext';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { NOTIFICATION_CATEGORY_META } from './notificationMeta';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProductApprovalNotification'>;

const NEXT_STEPS = [
  'Check and verify pricing is accurate',
  'Monitor stock levels regularly',
  'Enable delivery availability',
];

export function ProductApprovalNotificationScreen({ navigation, route }: Props) {
  const { notificationId } = route.params;
  const { getNotification } = useNotifications();
  const { products } = useProductCatalog();
  const notification = getNotification(notificationId);
  const meta = NOTIFICATION_CATEGORY_META['product-approval'];

  const product = useMemo(() => {
    if (!notification?.productName) return undefined;
    return products.find(item => item.name === notification.productName);
  }, [notification, products]);

  if (!notification) {
    return (
      <ScreenContainer backgroundColor={colors.white}>
        <NavHeader title="Product Approved" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Notification not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const isRejected = /reject/i.test(`${notification.title} ${notification.subtitle}`);

  function handleViewProduct() {
    if (product) {
      navigation.navigate('ProductDetails', { productId: product.id });
    } else {
      Alert.alert('Product not found', "We couldn't match this notification to a catalog listing.");
    }
  }

  return (
    <ScreenContainer backgroundColor={colors.white} scrollable>
      <NavHeader title={isRejected ? 'Product Rejected' : 'Product Approved'} onBack={() => navigation.goBack()} />
      <NotificationHero
        icon={meta.icon}
        iconColor={isRejected ? '#D92D20' : meta.iconColor}
        iconBg={isRejected ? '#FEF3F2' : meta.iconBg}
        title={notification.title}
        subtitle={notification.subtitle}
        timeLabel={notification.timeLabel}
      />
      <View style={styles.content}>
        {!isRejected ? (
          <InfoBanner variant="success" message="Status: Now Live on Verdant" />
        ) : null}

        {!isRejected ? (
          <DetailCard title="Next Steps">
            {NEXT_STEPS.map((step, index) => (
              <View key={step} style={[styles.stepRow, index > 0 && styles.stepRowSpacing]}>
                <View style={styles.stepIcon}>
                  <Icon name="check" size={12} color={colors.primary} />
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </DetailCard>
        ) : null}

        <View style={styles.footerRow}>
          <View style={styles.footerButton}>
            <Button label="View Product" onPress={handleViewProduct} />
          </View>
          <View style={styles.footerButton}>
            <Button label="Add Another" variant="outline" onPress={() => navigation.navigate('AddProduct')} />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stepRowSpacing: {
    paddingTop: spacing.md,
  },
  stepIcon: {
    width: 20,
    height: 20,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    ...typography.label,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  footerButton: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
