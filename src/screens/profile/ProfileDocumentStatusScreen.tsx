import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile, DocumentStatus } from '../../context/ProfileContext';
import { Button, NavHeader } from '../../components';
import { Icon, IconName } from '../../icons/Icon';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileDocumentStatus'>;

const STATUS_LABEL: Record<DocumentStatus, string> = {
  verified: 'Verified',
  pending: 'Pending Review',
  rejected: 'Rejected',
};

const STATUS_ICON: Record<DocumentStatus, IconName> = {
  verified: 'shield-check',
  pending: 'clock',
  rejected: 'x-circle',
};

const STATUS_COLORS: Record<DocumentStatus, { bg: string; fg: string; sub: string }> = {
  verified: { bg: colors.primarySurface, fg: colors.primaryDark, sub: colors.primary },
  pending: { bg: colors.warningSurface, fg: colors.warningDark, sub: colors.warningDark },
  rejected: { bg: colors.errorSurface, fg: colors.error, sub: colors.errorDark },
};

export function ProfileDocumentStatusScreen({ navigation, route }: Props) {
  const { documentId } = route.params;
  const { getDocument } = useProfile();
  const document = getDocument(documentId);

  if (!document) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <NavHeader title="Document Status" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Icon name="file-text" size={32} color={colors.textTertiary} />
          <Text style={styles.notFoundText}>This document could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const doc = document;
  const tone = STATUS_COLORS[doc.status];

  function handleDownload() {
    if (!doc.url) return;
    Linking.openURL(resolveAssetUrl(doc.url)).catch(() => {
      Alert.alert('Could not open document', 'No app is available to open this file.');
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title={document.name} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: tone.bg }]}>
          <Icon name={STATUS_ICON[document.status]} size={22} color={tone.fg} />
          <View style={styles.heroTextWrap}>
            <Text style={[styles.heroTitle, { color: tone.fg }]}>{STATUS_LABEL[document.status]}</Text>
            <Text style={[styles.heroSubtitle, { color: tone.sub }]}>
              {document.status === 'rejected' && document.rejectionReason
                ? document.rejectionReason
                : `${document.name} is ${document.status === 'verified' ? 'verified' : document.status === 'pending' ? 'awaiting verification' : 'rejected'}`}
            </Text>
          </View>
        </View>

        <View style={styles.previewCardWrap}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewIconWrap}>
                <Icon name="file-text" size={40} color={colors.textSecondary} />
              </View>
              <Text style={styles.previewName} numberOfLines={1}>
                {document.name}
              </Text>
              <Text style={styles.previewMeta}>{document.uploadedLabel}</Text>
            </View>

            <View style={styles.infoRows}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{STATUS_LABEL[document.status]}</Text>
              </View>
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <Text style={styles.infoLabel}>Uploaded</Text>
                <Text style={styles.infoValue}>{document.uploadedLabel}</Text>
              </View>
            </View>
          </View>
        </View>

        {document.status === 'rejected' ? (
          <View style={styles.rejectionCardWrap}>
            <View style={styles.rejectionCard}>
              <Icon name="alert-triangle" size={16} color={colors.error} />
              <View style={styles.rejectionTextWrap}>
                <Text style={styles.rejectionTitle}>Reason for rejection</Text>
                <Text style={styles.rejectionBody}>
                  {document.rejectionReason ?? 'This document did not pass verification. Please replace it with a valid copy.'}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.footer}>
          {doc.url ? (
            <>
              <Button
                label="Download"
                icon={<Icon name="file-text" size={18} color={colors.white} />}
                onPress={handleDownload}
              />
              <View style={styles.footerGap} />
            </>
          ) : null}
          {documentId === 'bankDetails' ? (
            <Button
              label="Manage Bank Details"
              variant="outline"
              onPress={() => navigation.navigate('ProfileBankDetails')}
            />
          ) : (
            <Button
              label="Replace Document"
              variant="outline"
              onPress={() => navigation.navigate('ProfileReplaceDocument', { documentId })}
            />
          )}
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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollBody: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    ...typography.bodySemibold,
    fontWeight: '700',
    fontSize: 15,
  },
  heroSubtitle: {
    ...typography.caption,
    paddingTop: 1,
  },
  previewCardWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  previewCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  previewHeader: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.huge,
  },
  previewIconWrap: {
    marginBottom: spacing.xs,
  },
  previewName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  previewMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoRows: {
    padding: spacing.lg + 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    ...typography.label,
    fontFamily: typography.body.fontFamily,
    color: colors.textSecondary,
    width: 100,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  rejectionCardWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  rejectionCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  rejectionTextWrap: {
    flex: 1,
    gap: 2,
  },
  rejectionTitle: {
    ...typography.labelSemibold,
    color: colors.errorDark,
  },
  rejectionBody: {
    ...typography.caption,
    color: colors.errorDark,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  footerGap: {
    height: spacing.lg,
  },
});
