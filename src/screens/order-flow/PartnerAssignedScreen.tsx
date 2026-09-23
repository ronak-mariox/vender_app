import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { FlexButton } from './FlexButton';

type Props = NativeStackScreenProps<AuthStackParamList, 'PartnerAssigned'>;

const NEXT_STEPS = [
  'Keep {order} at the handover counter',
  'Have order receipt ready for verification',
  'You will be notified once a partner is assigned',
  'Confirm handover when the partner arrives',
];

export function PartnerAssignedScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder } = useOrders();
  const order = getOrder(orderId);
  if (!order) return null;

  const distanceLabel = (order.distanceLabel ?? '3.0 km away').replace(' away', '');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Partner Assigned</Text>
      </View>

      <View style={styles.banner}>
        <Icon name="check-circle" size={16} color={colors.primaryDark} />
        <Text style={styles.bannerText}>Delivery partner will be assigned shortly!</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.partnerCard}>
          <View style={styles.partnerTopRow}>
            <View style={styles.avatar}>
              <Icon name="bike" size={28} color={colors.white} />
            </View>
            <View style={styles.partnerTextColumn}>
              <Text style={styles.partnerName}>Pending assignment</Text>
              <Text style={styles.partnerRating}>Details will appear here once a partner accepts</Text>
            </View>
            <Pressable style={styles.callButton} onPress={() => Alert.alert('Call Partner', 'Coming soon.')}>
              <Icon name="phone" size={16} color={colors.white} />
            </Pressable>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Vehicle</Text>
            <Text style={styles.rowValue}>—</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>ETA to store</Text>
            <Text style={styles.rowValue}>—</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Delivery to</Text>
            <Text style={styles.rowValue}>
              {order.location} ({distanceLabel})
            </Text>
          </View>
        </View>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Next Steps</Text>
          {NEXT_STEPS.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step.replace('{order}', order.id)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <FlexButton
          label="Ready to Hand Over →"
          onPress={() => navigation.navigate('HandoverChecklist', { orderId })}
          background={colors.primary}
          textColor={colors.white}
          flex={1}
        />
      </View>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryBorder,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  bannerText: {
    ...typography.labelSemibold,
    color: colors.primaryDark,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  partnerCard: {
    backgroundColor: colors.primarySurface,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  partnerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerTextColumn: {
    flex: 1,
    gap: 2,
  },
  partnerName: {
    ...typography.bodySemibold,
    fontSize: 18,
    fontFamily: fontFamilies.extrabold,
    color: colors.primaryDark,
  },
  partnerRating: {
    ...typography.caption,
    color: colors.primaryDark,
  },
  starText: {
    color: '#F59E0B',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.primaryBorder,
    marginVertical: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  rowLast: {
    paddingBottom: 0,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.primaryDark,
    opacity: 0.7,
  },
  rowValue: {
    ...typography.captionSemibold,
    color: colors.primaryDark,
  },
  stepsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  stepsTitle: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    ...typography.tinyBold,
    color: colors.primary,
  },
  stepText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
