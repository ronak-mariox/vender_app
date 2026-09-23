import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { useOrders } from '../../context/OrdersContext';
import { getApiErrorMessage } from '../../services/api';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';
import { ProgressHeader } from './ProgressHeader';
import { FlexButton } from './FlexButton';
import { findFlaggedItem } from './flowMock';

type Props = NativeStackScreenProps<AuthStackParamList, 'QualityCheckFlow'>;

const QC_ACCENT = '#7C3AED';
const DEFAULT_CRITERIA = ['Seal intact', 'Not expired', 'Correct qty'];
const FAILED_ITEM_CRITERIA = ['Not sour', 'Packaging undamaged', 'Correct qty'];
const FAIL_CRITERION_INDEX = 1;
const FAIL_REASON = '2 packets have dented lids, may be leaking';

type ItemState = 'passed' | 'failed' | 'pending';
type CriterionState = 'pass' | 'fail' | 'neutral';

function CriterionToggle({ state }: { state: CriterionState }) {
  return (
    <View style={styles.criterionButtons}>
      <View style={[styles.circleBtn, state === 'pass' ? styles.circleBtnCheckActive : styles.circleBtnNeutral]}>
        <Icon name="check" size={13} strokeWidth={2.5} color={state === 'pass' ? colors.white : colors.textTertiary} />
      </View>
      <View style={[styles.circleBtn, state === 'fail' ? styles.circleBtnXActive : styles.circleBtnNeutral]}>
        <Icon name="x" size={13} strokeWidth={2.5} color={state === 'fail' ? colors.error : colors.textTertiary} />
      </View>
    </View>
  );
}

export function QualityCheckFlowScreen({ navigation, route }: Props) {
  const { orderId } = route.params;
  const { getOrder, passQualityCheck } = useOrders();
  const order = getOrder(orderId);
  const [passing, setPassing] = useState(false);
  if (!order) return null;

  const flagged = findFlaggedItem(order.products);
  const flaggedIndex = flagged ? order.products.indexOf(flagged) : -1;
  const checkedCount = flaggedIndex >= 0 ? flaggedIndex + 1 : order.products.length;

  async function handlePass() {
    if (passing) return;
    setPassing(true);
    try {
      await passQualityCheck(orderId);
      navigation.replace('QCPassed', { orderId });
    } catch (err) {
      Alert.alert('Could not update order', getApiErrorMessage(err));
    } finally {
      setPassing(false);
    }
  }

  function handleFail() {
    if (!flagged) return;
    navigation.navigate('QCFailedDecision', {
      orderId,
      itemName: flagged.name,
      itemPrice: flagged.price,
      itemQty: flagged.qty,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.headerWrap}>
        <ProgressHeader
          title="Quality Check"
          subtitle={`${order.id} · ${checkedCount} of ${order.products.length} items checked`}
          current={checkedCount}
          total={order.products.length}
          accentColor={QC_ACCENT}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.headerBadge}>
          <Icon name="check-circle" size={16} color={QC_ACCENT} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {order.products.map((product, index) => {
          const state: ItemState =
            index < flaggedIndex || flaggedIndex < 0 ? 'passed' : index === flaggedIndex ? 'failed' : 'pending';
          const criteria = state === 'failed' ? FAILED_ITEM_CRITERIA : DEFAULT_CRITERIA;

          return (
            <View
              key={`${product.name}-${index}`}
              style={[
                styles.card,
                state === 'passed' && styles.cardPassed,
                state === 'failed' && styles.cardFailed,
              ]}
            >
              <View
                style={[
                  styles.cardHeaderRow,
                  state === 'passed' && styles.cardHeaderPassed,
                  state === 'failed' && styles.cardHeaderFailed,
                ]}
              >
                <Icon
                  name="package"
                  size={16}
                  color={state === 'passed' ? colors.primary : state === 'failed' ? colors.error : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.itemName,
                    state === 'passed' && styles.itemNamePassed,
                    state === 'failed' && styles.itemNameFailed,
                  ]}
                  numberOfLines={1}
                >
                  {product.name} ×{product.qty}
                </Text>
                <Text
                  style={[
                    styles.badgeText,
                    state === 'passed' && styles.badgeTextPassed,
                    state === 'failed' && styles.badgeTextFailed,
                  ]}
                >
                  {state === 'passed' ? '✓ Passed' : state === 'failed' ? '✗ Failed' : 'Pending'}
                </Text>
              </View>

              <View style={styles.criteriaBody}>
                {criteria.map((criterion, criterionIndex) => {
                  const isFailingCriterion = state === 'failed' && criterionIndex === FAIL_CRITERION_INDEX;
                  const criterionState: CriterionState =
                    state === 'pending' ? 'neutral' : isFailingCriterion ? 'fail' : 'pass';
                  return (
                    <View
                      key={criterion}
                      style={[
                        styles.criterionRow,
                        criterionIndex < criteria.length - 1 && styles.criterionRowDivider,
                      ]}
                    >
                      <Text style={styles.criterionText}>{criterion}</Text>
                      <CriterionToggle state={criterionState} />
                    </View>
                  );
                })}
                {state === 'failed' ? <Text style={styles.failReason}>{FAIL_REASON}</Text> : null}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        {flagged ? (
          <FlexButton
            label="Fail QC"
            onPress={handleFail}
            background={colors.errorSurface}
            textColor={colors.error}
            borderColor={colors.errorBorder}
            flex={1}
            disabled={passing}
          />
        ) : null}
        <FlexButton
          label={passing ? 'Updating…' : 'Pass QC →'}
          onPress={handlePass}
          background={QC_ACCENT}
          textColor={colors.white}
          flex={1}
          disabled={passing}
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
  headerWrap: {
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.xxl,
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  cardPassed: {
    borderColor: colors.primary,
  },
  cardFailed: {
    borderColor: colors.error,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  cardHeaderPassed: {
    backgroundColor: colors.primarySurface,
  },
  cardHeaderFailed: {
    backgroundColor: colors.errorSurface,
  },
  itemName: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
    flex: 1,
  },
  itemNamePassed: {
    color: colors.primary,
  },
  itemNameFailed: {
    color: colors.error,
  },
  badgeText: {
    ...typography.tinyBold,
    color: colors.textSecondary,
  },
  badgeTextPassed: {
    color: colors.primary,
  },
  badgeTextFailed: {
    color: colors.error,
  },
  criteriaBody: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  criterionRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  criterionText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
  },
  criterionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  circleBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnCheckActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleBtnXActive: {
    backgroundColor: colors.errorSurface,
    borderColor: colors.error,
  },
  circleBtnNeutral: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  failReason: {
    ...typography.tiny,
    color: colors.error,
    fontFamily: fontFamilies.semibold,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
