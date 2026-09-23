import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Button, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { useSupportDraft } from '../../context/SupportDraftContext';
import { EvidenceFile } from '../../context/SupportContext';
import { colors, fontFamilies, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'PreviewEvidence'>;

const MAX_FILES = 5;

const MOCK_FILES: Omit<EvidenceFile, 'id'>[] = [
  { name: 'screenshot_01.jpg', type: 'image' },
  { name: 'order_detail.pdf', type: 'pdf' },
  { name: 'screenshot_02.jpg', type: 'image' },
  { name: 'chat_log.pdf', type: 'pdf' },
  { name: 'product_photo.jpg', type: 'image' },
];

function mockMeta(file: EvidenceFile): string {
  let hash = 0;
  for (let i = 0; i < file.id.length; i++) hash = (hash * 31 + file.id.charCodeAt(i)) % 500;
  const sizeKb = 120 + hash;
  const ext = file.name.split('.').pop()?.toUpperCase() ?? (file.type === 'pdf' ? 'PDF' : 'JPG');
  return `${sizeKb} KB · ${ext}`;
}

export function PreviewEvidenceScreen({ navigation }: Props) {
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
        <Text style={styles.headerTitle}>Preview Evidence</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {draft.evidence.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="image" size={28} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No evidence added</Text>
            <Text style={styles.emptySubtitle}>You can still submit your ticket without evidence.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {draft.evidence.map(file => (
              <View key={file.id} style={styles.card}>
                <View style={[styles.tile, file.type === 'pdf' && styles.tilePdf]}>
                  <Pressable
                    style={styles.removeBadge}
                    onPress={() => removeEvidence(file.id)}
                    hitSlop={8}
                  >
                    <Icon name="x" size={11} color={colors.white} />
                  </Pressable>
                  {file.type === 'pdf' ? (
                    <>
                      <Icon name="file-text" size={32} color="#E11D48" />
                      <Text style={styles.viewText}>View</Text>
                    </>
                  ) : (
                    <Icon name="image" size={28} color={colors.textTertiary} />
                  )}
                </View>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileMeta}>{mockMeta(file)}</Text>
              </View>
            ))}
          </View>
        )}

        {draft.evidence.length < MAX_FILES ? (
          <Pressable style={styles.addMoreButton} onPress={handleAddMock}>
            <Text style={styles.addMoreText}>+ Add More Files</Text>
          </Pressable>
        ) : null}

        <View style={styles.banner}>
          <Text style={styles.bannerText}>Files look good? Proceed to submit.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Submit Ticket" onPress={() => navigation.navigate('SubmitTicket')} />
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
  content: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  card: {
    width: '47%',
    flexGrow: 1,
  },
  tile: {
    width: '100%',
    height: 120,
    borderRadius: radii.md,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tilePdf: {
    backgroundColor: '#FFF1F3',
    gap: spacing.sm,
  },
  viewText: {
    ...typography.captionSemibold,
    color: '#E11D48',
  },
  removeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: radii.sm - 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  fileName: {
    ...typography.label,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
    paddingTop: spacing.sm,
  },
  fileMeta: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.huge,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
  emptyTitle: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  addMoreButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.sm + 2,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreText: {
    ...typography.bodySemibold,
    color: colors.textSecondary,
  },
  banner: {
    backgroundColor: colors.primarySurface,
    borderRadius: radii.sm + 2,
    paddingHorizontal: spacing.lg + 2,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  bannerText: {
    ...typography.label,
    fontFamily: fontFamilies.regular,
    color: colors.primaryDark,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
