import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../icons/Icon';
import { colors, fontFamilies, radii, spacing, typography } from '../theme';

type Props = {
  fileName: string;
  thumbnailUri?: string;
  onReplace?: () => void;
  onDelete?: () => void;
  compact?: boolean;
};

export function FileCard({ fileName, thumbnailUri, onReplace, onDelete, compact = false }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.thumbnail, compact && styles.thumbnailCompact]}>
        {thumbnailUri ? (
          <Image source={{ uri: thumbnailUri }} style={styles.thumbnailImage} resizeMode="cover" />
        ) : (
          <Icon name="check" size={16} color={colors.primary} />
        )}
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.fileName} numberOfLines={1}>
          {fileName}
        </Text>
        <View style={styles.statusRow}>
          <Icon name="check-circle" size={12} color={colors.primary} />
          <Text style={styles.statusText}>Uploaded</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {onReplace ? (
          <Pressable onPress={onReplace} hitSlop={8}>
            <Text style={styles.replaceText}>Replace</Text>
          </Pressable>
        ) : null}
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={8}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    width: '100%',
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailCompact: {
    width: 44,
    height: 44,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    ...typography.labelSemibold,
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    ...typography.tinyBold,
    color: colors.primary,
    fontFamily: fontFamilies.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  replaceText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.primary,
  },
  deleteText: {
    ...typography.caption,
    fontFamily: fontFamilies.medium,
    color: colors.error,
  },
});
