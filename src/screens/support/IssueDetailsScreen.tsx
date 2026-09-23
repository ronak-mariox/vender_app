import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Badge, Input, ScreenContainer } from '../../components';
import { useSupport } from '../../context/SupportContext';
import { useSupportDraft } from '../../context/SupportDraftContext';
import { useOrders } from '../../context/OrdersContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'IssueDetails'>;

const DESCRIPTION_MAX_LENGTH = 500;

function formatNow(): string {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();
  let hours = now.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

export function IssueDetailsScreen({ navigation, route }: Props) {
  const { categoryId, issueId } = route.params;
  const { categories, issues } = useSupport();
  const { setDescription: setDraftDescription } = useSupportDraft();
  const { orders } = useOrders();

  const category = categories.find(c => c.id === categoryId);
  const issue = issues.find(i => i.id === issueId);
  const isOrderRelated = categoryId === 'order-issues';

  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedLoss, setEstimatedLoss] = useState('');
  const occurredAt = useMemo(formatNow, []);

  const recentOrderIds = useMemo(() => orders.slice(0, 5).map(o => o.id), [orders]);

  function handleNext() {
    let finalDescription = description.trim();
    if (estimatedLoss.trim()) {
      finalDescription = finalDescription
        ? `${finalDescription}\n\nEstimated loss: ₹${estimatedLoss.trim()}`
        : `Estimated loss: ₹${estimatedLoss.trim()}`;
    }
    setDraftDescription(finalDescription, orderId.trim() || undefined);
    navigation.navigate('UploadEvidence');
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backButton}>
          <Icon name="arrow-left" size={18} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Issue Details</Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          {[0, 1, 2, 3].map(index => (
            <View key={index} style={[styles.progressSegment, index < 2 && styles.progressSegmentActive]} />
          ))}
        </View>
        <Text style={styles.progressLabel}>Step 2 of 4</Text>
      </View>

      <View style={styles.pillRow}>
        <Badge label={issue?.title ?? category?.label ?? 'Issue'} tone="info" />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isOrderRelated ? (
          <View style={styles.field}>
            <Text style={styles.label}>Order ID</Text>
            <View style={styles.fieldSpacing}>
              <View style={styles.readonlyBox}>
                <TextInput
                  style={styles.orderIdInput}
                  value={orderId}
                  onChangeText={setOrderId}
                  placeholder="e.g. ORD-8821"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="characters"
                />
                <Icon name="copy" size={16} color={colors.primary} />
              </View>
            </View>
            {recentOrderIds.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.orderChipRow}
                contentContainerStyle={styles.orderChipContent}
              >
                {recentOrderIds.map(id => (
                  <Pressable
                    key={id}
                    style={[styles.orderChip, orderId === id && styles.orderChipSelected]}
                    onPress={() => setOrderId(id)}
                  >
                    <Text style={[styles.orderChipLabel, orderId === id && styles.orderChipLabelSelected]}>
                      {id}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <View style={styles.fieldSpacing}>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={text => setDescription(text.slice(0, DESCRIPTION_MAX_LENGTH))}
                placeholder="Describe what happened"
                placeholderTextColor="rgba(31,41,55,0.5)"
                multiline
                textAlignVertical="top"
                maxLength={DESCRIPTION_MAX_LENGTH}
              />
            </View>
            <Text style={styles.charCount}>
              {description.length}/{DESCRIPTION_MAX_LENGTH}
            </Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>When did this happen?</Text>
          <View style={styles.fieldSpacing}>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{occurredAt}</Text>
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Estimated loss amount ₹ </Text>
            <Text style={styles.labelOptional}>(optional)</Text>
          </View>
          <View style={styles.fieldSpacing}>
            <Input
              value={estimatedLoss}
              onChangeText={text => setEstimatedLoss(text.replace(/[^0-9]/g, ''))}
              placeholder="Enter amount"
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonLabel}>Next: Add Evidence</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.bodySemibold,
    fontSize: 17,
    lineHeight: 25.5,
    color: colors.textPrimary,
  },
  progressWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressSegmentActive: {
    backgroundColor: colors.primary,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pillRow: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.lg + 2,
  },
  field: {
    gap: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  label: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  labelOptional: {
    ...typography.label,
    color: colors.textSecondary,
  },
  fieldSpacing: {
    paddingTop: spacing.sm,
  },
  readonlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md - 2,
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: spacing.lg - 2,
  },
  orderIdInput: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    padding: 0,
  },
  readonlyText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  orderChipRow: {
    marginTop: spacing.md,
  },
  orderChipContent: {
    gap: spacing.md,
  },
  orderChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.white,
  },
  orderChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  orderChipLabel: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
  },
  orderChipLabelSelected: {
    color: colors.primary,
  },
  textAreaBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md - 2,
    padding: spacing.lg,
    minHeight: 100,
  },
  textArea: {
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
    minHeight: 76,
  },
  charCount: {
    ...typography.tiny,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  nextButton: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonLabel: {
    ...typography.button,
    color: colors.white,
  },
});
