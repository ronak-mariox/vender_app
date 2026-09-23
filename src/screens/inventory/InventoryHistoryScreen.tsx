import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useProductCatalog } from '../../context/ProductCatalogContext';
import { StockEvent, useInventory } from '../../context/InventoryContext';
import { formatEventTimestamp } from '../../utils/time';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'InventoryHistory'>;

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function InventoryHistoryScreen({ navigation, route }: Props) {
  const productId = route.params?.productId;
  const { products } = useProductCatalog();
  const { events, eventsForProduct } = useInventory();

  const product = productId ? products.find(item => item.id === productId) : undefined;
  const scopedEvents = productId ? eventsForProduct(productId) : events;

  const cutoff = Date.now() - THIRTY_DAYS_MS;
  const added30d = scopedEvents
    .filter(event => event.delta > 0 && event.timestamp >= cutoff)
    .reduce((sum, event) => sum + event.delta, 0);
  const sold30d = scopedEvents
    .filter(event => event.delta < 0 && event.timestamp >= cutoff)
    .reduce((sum, event) => sum + Math.abs(event.delta), 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTextColumn}>
          <Text style={styles.headerTitle}>Stock History</Text>
          <Text style={styles.headerSubtitle}>{product ? product.name : 'All products'}</Text>
        </View>
        {productId ? (
          <Pressable
            style={styles.iconButton}
            onPress={() => Alert.alert('Filter History', 'Coming soon.')}
          >
            <Icon name="sliders" size={15} color={colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      {product ? (
        <View style={styles.summaryRow}>
          <View style={styles.currentPill}>
            <Text style={styles.currentLabel}>Current</Text>
            <Text style={styles.currentValue}>{product.stock}</Text>
          </View>
          <View style={styles.summaryTextColumn}>
            <Text style={styles.summaryText}>+{added30d} added in last 30 days</Text>
            <Text style={styles.summaryText}>−{sold30d} sold in last 30 days</Text>
          </View>
        </View>
      ) : null}

      <FlatList
        data={scopedEvents}
        keyExtractor={item => item.id}
        style={styles.list}
        renderItem={({ item, index }) => (
          <EventRow event={item} last={index === scopedEvents.length - 1} showProductName={!productId} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="refresh-cw" size={32} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No stock events yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function EventRow({ event, last, showProductName }: { event: StockEvent; last: boolean; showProductName: boolean }) {
  const positive = event.delta > 0;
  const iconName = event.type === 'damage' ? 'alert-triangle' : positive ? 'trending-up' : 'package';
  const iconBg = event.type === 'damage' ? colors.errorSurface : positive ? colors.primarySurface : colors.surface;
  const iconColor = event.type === 'damage' ? colors.error : positive ? colors.primary : colors.textSecondary;
  const deltaColor = event.type === 'damage' ? colors.error : positive ? colors.primary : colors.textSecondary;

  return (
    <View style={[styles.eventRow, !last && styles.eventRowDivider]}>
      <View style={[styles.eventIcon, { backgroundColor: iconBg }]}>
        <Icon name={iconName} size={14} color={iconColor} />
      </View>
      <View style={styles.eventTextColumn}>
        <Text style={styles.eventReason} numberOfLines={1}>
          {showProductName ? `${event.productName} · ${event.reason}` : event.reason}
        </Text>
        <Text style={styles.eventMeta}>
          By {event.actor} · After: {event.afterStock} units
        </Text>
        <View style={styles.eventFooterRow}>
          {event.reference ? <Text style={styles.eventReference}>{event.reference}</Text> : null}
          {event.reference ? <Text style={styles.eventDot}>·</Text> : null}
          <Text style={styles.eventTimestamp}>{formatEventTimestamp(event.timestamp)}</Text>
        </View>
      </View>
      <Text style={[styles.eventDelta, { color: deltaColor }]}>
        {positive ? '+' : ''}
        {event.delta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextColumn: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    ...typography.bodySemibold,
    fontSize: 15,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  currentPill: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  currentLabel: {
    ...typography.tiny,
    color: colors.primary,
  },
  currentValue: {
    fontSize: 20,
    fontFamily: fontFamilies.extrabold,
    color: colors.primary,
  },
  summaryTextColumn: {
    flex: 1,
  },
  summaryText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  eventRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  eventTextColumn: {
    flex: 1,
    gap: 1,
  },
  eventReason: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  eventMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  eventFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 2,
  },
  eventReference: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: colors.textSecondary,
  },
  eventDot: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  eventTimestamp: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  eventDelta: {
    fontSize: 14,
    fontFamily: fontFamilies.extrabold,
    letterSpacing: -0.28,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.massive,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
