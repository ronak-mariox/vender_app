import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useProfile } from '../../context/ProfileContext';
import { Button, Input, NavHeader } from '../../components';
import { Icon } from '../../icons/Icon';
import { pickAndUploadVendorDocument } from '../../services/documentUpload';
import { getApiErrorMessage } from '../../services/api';
import { isRequired, type FormErrors } from '../../utils/validators';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileAddDocument'>;

type Errors = FormErrors<'name'>;

export function ProfileAddDocumentScreen({ navigation }: Props) {
  const { addAdditionalDocument } = useProfile();
  const [name, setName] = useState('');
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  async function handlePickFile() {
    setIsUploading(true);
    try {
      const url = await pickAndUploadVendorDocument('gallery');
      if (url) {
        setUploadedUrl(url);
        setPickedFileName('document.jpg');
      }
    } catch (err) {
      Alert.alert('Upload failed', getApiErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    const nextErrors: Errors = {};
    if (!isRequired(name)) nextErrors.name = 'Document name is required';
    if (!uploadedUrl) nextErrors.form = 'Please upload a document first';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await addAdditionalDocument(name.trim(), uploadedUrl!);
      navigation.goBack();
    } catch (err) {
      setErrors({ form: getApiErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <NavHeader title="Add Document" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scrollBody} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.fieldWrap}>
          <Input
            label="Document Name"
            required
            value={name}
            onChangeText={text => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
            placeholder="e.g. Trade License"
            error={errors.name}
          />
        </View>

        <Text style={styles.sectionHeader}>Upload Document</Text>
        <View style={styles.dropzoneWrap}>
          <Pressable style={styles.dropzone} onPress={handlePickFile} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Icon name="upload" size={32} color={colors.textSecondary} />
            )}
            <Text style={styles.dropzoneTitle}>
              {pickedFileName ? pickedFileName : isUploading ? 'Uploading…' : 'Tap to upload document'}
            </Text>
            <Text style={styles.dropzoneSubtitle}>
              {pickedFileName ? 'Tap to choose a different photo' : 'Photo of the document · JPG, PNG'}
            </Text>
          </Pressable>
        </View>

        {errors.form ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{errors.form}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Button
            label={isSubmitting ? 'Adding…' : 'Add Document'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
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
    paddingBottom: spacing.xxxl,
  },
  fieldWrap: {
    backgroundColor: colors.white,
    padding: spacing.xl,
  },
  sectionHeader: {
    ...typography.tinyBold,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  dropzoneWrap: {
    paddingHorizontal: spacing.xl,
  },
  dropzone: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
  },
  dropzoneTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  dropzoneSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  errorWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
});
