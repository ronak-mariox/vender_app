import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DispatchQueue'>;

const NEARBY_PARTNERS = [
  { name: 'Raju S.', rating: 4.8, distance: '1.2 km away', eta: '4 min' },
  { name: 'Mohan K.', rating: 4.6, distance: '2.1 km away', eta: '7 min' },
];

export function DispatchQueueScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder, ordersByStatus } = useOrders();
  const order = getOrder(orderId);
  const otherQueued = ordersByStatus(['ready-for-dispatch', 'dispatched']).filter(item => item.id !== orderId);

  // There's no real driver-assignment system wired up on the backend yet, so this screen no
  // longer fabricates a delivery partner — it just paces on to the next step in the flow, which
  // now shows a generic "partner will be assigned shortly" placeholder instead of fake details.
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('PartnerAssigned', { orderId });
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigation, orderId]);

  if (!order) return null;

  const queue = [order, ...otherQueued].slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Dispatch Queue</Text>
      </View>

      <View style={styles.statusBanner}>
        <View style={styles.spinnerRing} />
        <View style={styles.statusTextColumn}>
          <Text style={styles.statusTitle}>Awaiting delivery partner assignment</Text>
          <Text style={styles.statusSubtitle}>System is finding the nearest partner...</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Orders in Queue ({queue.length})</Text>
        {queue.map((item, index) => {
          const active = item.id === orderId;
          return (
            <View
              key={item.id}
              style={[styles.queueCard, active ? styles.queueCardActive : styles.queueCardInactive]}
            >
              <View style={[styles.queueNumber, active && styles.queueNumberActive]}>
                <Text style={[styles.queueNumberText, active && styles.queueNumberTextActive]}>
                  #{index + 1}
                </Text>
              </View>
              <View style={styles.queueTextColumn}>
                <Text style={styles.queueOrderId}>{item.id}</Text>
                <Text style={styles.queueMeta}>{item.customerName}</Text>
              </View>
              <View style={styles.queueRightColumn}>
                <Text style={[styles.queueAmount, active && styles.queueAmountActive]}>₹{item.amount}</Text>
                <Text style={styles.queueTime}>{active ? 'Just now' : item.timeLabel}</Text>
              </View>
            </View>
          );
        })}

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Partners Nearby</Text>
        {NEARBY_PARTNERS.map(partner => (
          <View key={partner.name} style={styles.partnerRow}>
            <View style={styles.partnerAvatar}>
              <Icon name="bike" size={18} color={colors.primary} />
            </View>
            <View style={styles.queueTextColumn}>
              <Text style={styles.partnerName}>{partner.name}</Text>
              <Text style={styles.partnerMeta}>
                ★ {partner.rating} · {partner.distance}
              </Text>
            </View>
            <View style={styles.queueRightColumn}>
              <Text style={styles.partnerEta}>ETA {partner.eta}</Text>
              <Text style={styles.unassignedTag}>Unassigned</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.bodySemibold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: '#ECFEFF',
    borderBottomWidth: 1,
    borderBottomColor: '#A5F3FC',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  spinnerRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#0891B2',
  },
  statusTextColumn: {
    flex: 1,
    gap: 1,
  },
  statusTitle: {
    ...typography.labelSemibold,
    color: '#0E7490',
  },
  statusSubtitle: {
    ...typography.tiny,
    color: '#0E7490',
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    paddingBottom: spacing.sm,
  },
  sectionLabelSpaced: {
    paddingTop: spacing.xxl,
  },
  queueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  queueCardActive: {
    borderWidth: 1.5,
    borderColor: '#0891B2',
  },
  queueCardInactive: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  queueNumber: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueNumberActive: {
    backgroundColor: '#ECFEFF',
  },
  queueNumberText: {
    ...typography.bodySemibold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  queueNumberTextActive: {
    color: '#0891B2',
  },
  queueTextColumn: {
    flex: 1,
    gap: 1,
  },
  queueOrderId: {
    ...typography.captionSemibold,
    fontVariant: ['tabular-nums'],
    color: colors.textPrimary,
  },
  queueMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  queueRightColumn: {
    alignItems: 'flex-end',
    gap: 1,
  },
  queueAmount: {
    ...typography.bodySemibold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  queueAmountActive: {
    color: '#0891B2',
  },
  queueTime: {
    ...typography.tiny,
    fontSize: 10,
    color: colors.textSecondary,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerName: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  partnerMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  partnerEta: {
    ...typography.labelSemibold,
    color: colors.primary,
  },
  unassignedTag: {
    ...typography.tiny,
    fontSize: 10,
    color: colors.textTertiary,
  },
});
