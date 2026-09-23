import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useSupportDraft } from '../../context/SupportDraftContext';
import { EvidenceFile } from '../../context/SupportContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'UploadEvidence'>;

const MAX_FILES = 5;

const MOCK_FILES: Omit<EvidenceFile, 'id'>[] = [
  { name: 'screenshot_01.jpg', type: 'image' },
  { name: 'order_detail.pdf', type: 'pdf' },
  { name: 'screenshot_02.jpg', type: 'image' },
  { name: 'chat_log.pdf', type: 'pdf' },
  { name: 'product_photo.jpg', type: 'image' },
];

export function UploadEvidenceScreen({ navigation }: Props) {
  const { draft, addEvidence, removeEvidence } = useSupportDraft();

  function handleAddMock() {
    if (draft.evidence.length >= MAX_FILES) return;
    const next = MOCK_FILES[draft.evidence.length % MOCK_FILES.length];
    addEvidence({ id: `ev-${Date.now()}-${draft.evidence.length}`, ...next });
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Upload Evidence</Text>
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressRow}>
          {[0, 1, 2, 3].map(index => (
            <View key={index} style={[styles.progressSegment, index < 3 && styles.progressSegmentFilled]} />
          ))}
        </View>
        <Text style={styles.stepLabel}>Step 3 of 4</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Screenshots, photos, or documents help resolve your issue faster.</Text>

        <Pressable style={styles.dropzone} onPress={handleAddMock}>
          <Icon name="upload" size={32} color={colors.textSecondary} />
          <Text style={styles.dropzoneTitle}>Tap to upload</Text>
          <Text style={styles.dropzoneSubtitle}>Drag files here</Text>
          <View style={styles.dropzoneMetaPill}>
            <Text style={styles.dropzoneMetaText}>JPG, PNG, PDF — max 10MB each · up to 5 files</Text>
          </View>
        </Pressable>

        {draft.evidence.length > 0 ? (
          <View style={styles.chipsRow}>
            {draft.evidence.map(file => (
              <View key={file.id} style={styles.chip}>
                <Text style={styles.chipText} numberOfLines={1}>
                  {file.name}
                </Text>
                <Pressable onPress={() => removeEvidence(file.id)} hitSlop={8}>
                  <Icon name="x" size={12} color={colors.primary} strokeWidth={2.5} />
                </Pressable>
              </View>
            ))}
            {draft.evidence.length < MAX_FILES ? (
              <Pressable style={styles.addMoreChip} onPress={handleAddMock}>
                <Text style={styles.addMoreText}>+ Add More</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for better evidence</Text>
          <Text style={styles.tipsBody}>
            Good evidence includes order screenshots, chat records, and product photos.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Next: Review" onPress={() => navigation.navigate('PreviewEvidence')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
  headerTitle: {
    fontFamily: fontFamilies.semibold,
    fontSize: 17,
    lineHeight: 25.5,
    color: colors.textPrimary,
  },
  progressWrap: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  progressSegmentFilled: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  intro: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  dropzone: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.lg,
    paddingVertical: spacing.huge - 4,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
    paddingTop: spacing.md,
  },
  dropzoneSubtitle: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
    paddingTop: spacing.xs,
  },
  dropzoneMetaPill: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  dropzoneMetaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySurface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 1,
    maxWidth: '100%',
  },
  chipText: {
    ...typography.captionSemibold,
    color: colors.primary,
    flexShrink: 1,
  },
  addMoreChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 1,
  },
  addMoreText: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
  },
  tipsCard: {
    backgroundColor: '#FFFAEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radii.sm + 2,
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  tipsTitle: {
    ...typography.label,
    color: colors.warning,
  },
  tipsBody: {
    ...typography.caption,
    color: '#92400E',
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
