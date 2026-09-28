import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, IconName } from '../../icons/Icon';
import { Offer } from '../../context/OffersContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = {
  visible: boolean;
  offer: Offer | null;
  onClose: () => void;
  onEdit: () => void;
  onPauseResume: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function OfferActionsSheet({ visible, offer, onClose, onEdit, onPauseResume, onDuplicate, onDelete }: Props) {
  if (!offer) return null;

  const items: { icon: IconName; label: string; tone: 'default' | 'danger'; onPress: () => void }[] = [
    { icon: 'edit', label: 'Edit Offer', tone: 'default', onPress: onEdit },
  ];
  if (offer.status === 'active' || offer.status === 'paused') {
    items.push({
      icon: 'pause-circle',
      label: offer.status === 'paused' ? 'Resume Offer' : 'Pause Offer',
      tone: 'default',
      onPress: onPauseResume,
    });
  }
  items.push({ icon: 'copy', label: 'Duplicate Offer', tone: 'default', onPress: onDuplicate });
  items.push({ icon: 'trash', label: 'Delete Offer', tone: 'danger', onPress: onDelete });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetWrapper} onPress={event => event.stopPropagation()}>
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title} numberOfLines={1}>
              {offer.title}
            </Text>
            {items.map(item => (
              <Pressable
                key={item.label}
                style={styles.row}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
              >
                <Icon
                  name={item.icon}
                  size={18}
                  color={item.tone === 'danger' ? colors.error : colors.textPrimary}
                />
                <Text style={[styles.rowLabel, item.tone === 'danger' && styles.rowLabelDanger]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,24,40,0.4)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.captionSemibold,
    color: colors.textSecondary,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  rowLabelDanger: {
    color: colors.error,
  },
});
