import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile, DocumentStatus, type ProfileDocument, type AdditionalDocument } from '../../context/ProfileContext';
import { Badge, BadgeTone, Button, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileDocuments'>;

const STATUS_LABEL: Record<DocumentStatus, string> = {
  verified: 'Verified',
  pending: 'Pending',
  rejected: 'Rejected',
};

const STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  verified: 'success',
  pending: 'warning',
  rejected: 'error',
};

export function ProfileDocumentsScreen({ navigation }: Props) {
  const { documents, additionalDocuments, removeAdditionalDocument } = useProfile();

  const total = documents.length;
  const verifiedCount = documents.filter(d => d.status === 'verified').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected').length;
  const allVerified = total > 0 && verifiedCount === total;

  function handleAddDocument() {
    navigation.navigate('ProfileAddDocument');
  }

  function handleDownload(doc: ProfileDocument) {
    if (!doc.url) {
      Alert.alert('Not available', 'This document has not been uploaded yet.');
      return;
    }
    Linking.openURL(resolveAssetUrl(doc.url));
  }

  function handleDownloadAdditional(doc: AdditionalDocument) {
    Linking.openURL(resolveAssetUrl(doc.url));
  }

  function handleRemoveAdditional(doc: AdditionalDocument) {
    Alert.alert('Remove Document', `Remove "${doc.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeAdditionalDocument(doc.id).catch(() => {
            Alert.alert('Error', 'Could not remove document. Please try again.');
          });
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Documents & KYC" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {allVerified ? (
          <View style={[styles.banner, styles.bannerSuccess]}>
            <Icon name="shield-check" size={20} color={colors.primaryDark} />
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerTitleSuccess}>KYC Verified</Text>
              <Text style={styles.bannerSubtitleSuccess}>All documents verified successfully</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.banner, styles.bannerWarning]}>
            <Icon name="alert-circle" size={20} color={colors.warningDark} />
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerTitleWarning}>
                {rejectedCount > 0 ? 'Action Required' : 'Verification Pending'}
              </Text>
              <Text style={styles.bannerSubtitleWarning}>
                {rejectedCount > 0
                  ? `${rejectedCount} document${rejectedCount > 1 ? 's' : ''} need attention · ${verifiedCount}/${total} verified`
                  : `${verifiedCount} of ${total} documents verified`}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.listCard}>
          {documents.map((doc, index) => (
            <View key={doc.id} style={[styles.row, index < documents.length - 1 && styles.rowDivider]}>
              <View style={styles.fileIcon}>
                <Icon name="file-text" size={18} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.docName} numberOfLines={1}>
                  {doc.name}
                </Text>
                <Text style={styles.docMeta} numberOfLines={1}>
                  {doc.uploadedLabel}
                </Text>
              </View>
              <Badge label={STATUS_LABEL[doc.status]} tone={STATUS_TONE[doc.status]} />
              <View style={styles.rowActions}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => navigation.navigate('ProfileDocumentStatus', { documentId: doc.id })}
                  hitSlop={6}
                >
                  <Icon name="eye" size={14} color={colors.primaryDark} />
                </Pressable>
                <Pressable style={styles.iconButton} onPress={() => handleDownload(doc)} hitSlop={6}>
                  <Icon name="file-text" size={14} color={colors.primaryDark} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {additionalDocuments.length > 0 ? (
          <>
            <Text style={styles.sectionHeader}>Additional Documents</Text>
            <View style={styles.listCard}>
              {additionalDocuments.map((doc, index) => (
                <View
                  key={doc.id}
                  style={[styles.row, index < additionalDocuments.length - 1 && styles.rowDivider]}
                >
                  <View style={styles.fileIcon}>
                    <Icon name="file-text" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.docName} numberOfLines={1}>
                      {doc.name}
                    </Text>
                    <Text style={styles.docMeta} numberOfLines={1}>
                      {doc.uploadedLabel}
                    </Text>
                  </View>
                  <View style={styles.rowActions}>
                    <Pressable
                      style={styles.iconButton}
                      onPress={() => handleDownloadAdditional(doc)}
                      hitSlop={6}
                    >
                      <Icon name="file-text" size={14} color={colors.primaryDark} />
                    </Pressable>
                    <Pressable
                      style={styles.iconButton}
                      onPress={() => handleRemoveAdditional(doc)}
                      hitSlop={6}
                    >
                      <Icon name="trash" size={14} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.footer}>
          <Button
            label="Add Document"
            variant="outline"
            icon={<Icon name="plus" size={16} color={colors.primary} />}
            onPress={handleAddDocument}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollBody: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginHorizontal: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.md,
  },
  bannerSuccess: {
    backgroundColor: colors.primarySurface,
  },
  bannerWarning: {
    backgroundColor: colors.warningSurface,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitleSuccess: {
    ...typography.bodySemibold,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  bannerSubtitleSuccess: {
    ...typography.caption,
    color: colors.primary,
    paddingTop: 1,
  },
  bannerTitleWarning: {
    ...typography.bodySemibold,
    fontWeight: '700',
    color: colors.warningDark,
  },
  bannerSubtitleWarning: {
    ...typography.caption,
    color: colors.warningDark,
    paddingTop: 1,
  },
  listCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.white,
  },
  sectionHeader: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + spacing.xs,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  docName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  docMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rowActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 1,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
});
