import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, UploadDropzone } from '../../components';
import { Icon } from '../../icons/Icon';
import { useDisputes, DisputeEvidenceFile } from '../../context/DisputesContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'DisputeUploadEvidence'>;

const MAX_FILES = 5;

// No real file picker exists in this project yet, so uploads are simulated by
// cycling through a small mock-file pool on tap — same pattern used by
// src/screens/support/UploadEvidenceScreen.tsx and
// src/screens/add-product/ProductImagesScreen.tsx.
const MOCK_FILES: Omit<DisputeEvidenceFile, 'id'>[] = [
  { name: 'packing_photo.jpg', type: 'image' },
  { name: 'order_confirmation.png', type: 'image' },
  { name: 'delivery_receipt.pdf', type: 'pdf' },
  { name: 'tracking_screenshot.jpg', type: 'image' },
  { name: 'communication_log.pdf', type: 'pdf' },
];

export function DisputeUploadEvidenceScreen({ navigation, route }: Props) {
  const { disputeId } = route.params;
  const { getDispute, addEvidence, removeEvidence } = useDisputes();
  const dispute = getDispute(disputeId);
  const evidence = dispute?.evidence ?? [];

  function handleAddMock() {
    if (evidence.length >= MAX_FILES) return;
    const next = MOCK_FILES[evidence.length % MOCK_FILES.length];
    addEvidence(disputeId, { id: `ev-${Date.now()}-${evidence.length}`, ...next });
  }

  if (!dispute) {
    return (
      <View style={styles.screen}>
        <Header title="Upload Evidence" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This dispute could not be found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Upload Evidence" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepIndicator current={2} />

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Strong disputes include packing photos, order screenshots, or communication records.
          </Text>
        </View>

        {/*
          UploadDropzone (shared component) only accepts a single `label`
          string — Figma's dropzone shows a bold title plus a separate gray
          meta line ("JPG, PNG, PDF, MP4 · Max 5 files · 20MB each"). Rather
          than fork the shared component, the meta text is rendered as a
          caption directly under it. See final report "shared component
          gaps" for detail.
        */}
        <View style={styles.dropzoneGroup}>
          <UploadDropzone label="Tap to add files" onPress={handleAddMock} />
          <Text style={styles.dropzoneMeta}>JPG, PNG, PDF, MP4 · Max 5 files · 20MB each</Text>
        </View>

        {evidence.length > 0 ? (
          <View style={styles.evidenceList}>
            {evidence.map(file => (
              <View key={file.id} style={styles.evidenceChip}>
                <Icon name="file-text" size={16} color={colors.primary} />
                <View style={styles.evidenceTextColumn}>
                  <Text style={styles.evidenceName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.evidenceType}>{file.type === 'pdf' ? 'PDF' : 'Image'}</Text>
                </View>
                <Icon name="check-circle" size={16} color={colors.primary} />
                <Pressable onPress={() => removeEvidence(disputeId, file.id)} hitSlop={8}>
                  <Icon name="trash" size={15} color={colors.textSecondary} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for Strong Evidence</Text>
          <View style={styles.tipsList}>
            {[
              'Photo of packed order before dispatch',
              'Order confirmation screenshot',
              'Delivery partner receipt or tracking',
            ].map(tip => (
              <View key={tip} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button label="Next" onPress={() => navigation.navigate('DisputeSubmit', { disputeId })} />
      </ScrollView>
    </View>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={colors.textPrimary} />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [1, 2, 3];
  return (
    <View style={styles.stepRow}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={step}>
            <View
              style={[
                styles.stepCircle,
                done && styles.stepCircleDone,
                active && styles.stepCircleActive,
              ]}
            >
              {done ? (
                <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
              ) : (
                <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>{step}</Text>
              )}
            </View>
            {!isLast ? (
              <View style={[styles.stepConnector, step < current && styles.stepConnectorDone]} />
            ) : null}
          </React.Fragment>
        );
      })}
      <Text style={styles.stepLabel}>Step {current} of 3</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
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
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: fontFamilies.semibold,
    fontSize: 17,
    lineHeight: 25.5,
    color: colors.textPrimary,
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg + 2,
    paddingBottom: spacing.huge,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: {
    backgroundColor: colors.primary,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  stepNumberActive: {
    color: colors.white,
  },
  stepConnector: {
    width: 30,
    height: 2,
    backgroundColor: colors.border,
  },
  stepConnectorDone: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
    paddingLeft: spacing.xs,
  },
  infoCard: {
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.sm + 2,
    padding: spacing.lg,
  },
  infoText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.primaryDark,
  },
  dropzoneGroup: {
    width: '100%',
    gap: spacing.sm,
  },
  dropzoneMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    width: '100%',
  },
  evidenceList: {
    gap: spacing.md,
    width: '100%',
  },
  evidenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  evidenceTextColumn: {
    flex: 1,
    gap: 1,
  },
  evidenceName: {
    ...typography.labelSemibold,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  evidenceType: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  tipsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.xl,
    width: '100%',
  },
  tipsTitle: {
    ...typography.labelSemibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipsList: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  tipText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textPrimary,
    flex: 1,
  },
});
