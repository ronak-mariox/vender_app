import React, { useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { useSupport, TicketMessage } from '../../context/SupportContext';
import { NavHeader, ScreenContainer } from '../../components';
import { Icon } from '../../icons/Icon';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SupportResponse'>;

export function SupportResponseScreen({ navigation, route }: Props) {
  const { ticketId } = route.params;
  const { getTicket, addMessage } = useSupport();
  const ticket = getTicket(ticketId);

  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<TicketMessage>>(null);

  if (!ticket) {
    return (
      <ScreenContainer scrollable={false}>
        <NavHeader title="Conversation" onBack={() => navigation.goBack()} />
        <View style={styles.notFoundWrap}>
          <Icon name="alert-circle" size={36} color={colors.textTertiary} />
          <Text style={styles.notFoundText}>Ticket not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    addMessage(ticketId, text);
    setDraft('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }

  return (
    <ScreenContainer scrollable={false}>
      <NavHeader title={`Ticket #${ticket.id}`} onBack={() => navigation.goBack()} />
      <FlatList
        ref={listRef}
        data={ticket.messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />
      <View style={styles.inputBar}>
        <Pressable
          style={styles.attachButton}
          onPress={() => Alert.alert('Attach File', 'Coming soon.')}
          hitSlop={4}
        >
          <Icon name="upload" size={18} color={colors.textSecondary} />
        </Pressable>
        <View style={styles.inputField}>
          <TextInput
            style={styles.textInput}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>
        <Pressable style={styles.sendButton} onPress={handleSend} hitSlop={4}>
          <Icon name="arrow-right" size={18} color={colors.white} />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const isVendor = message.from === 'vendor';
  return (
    <View style={[styles.messageRow, isVendor ? styles.messageRowVendor : styles.messageRowSupport]}>
      {!isVendor ? (
        <View style={styles.avatar}>
          <Icon name="user" size={16} color={colors.textSecondary} />
        </View>
      ) : null}
      <View style={styles.bubbleColumn}>
        <View style={[styles.bubble, isVendor ? styles.bubbleVendor : styles.bubbleSupport]}>
          <Text style={[styles.bubbleText, isVendor && styles.bubbleTextVendor]}>{message.text}</Text>
        </View>
        <Text style={[styles.timeLabel, isVendor && styles.timeLabelVendor]}>{message.timeLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  notFoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  messageRowVendor: {
    justifyContent: 'flex-end',
  },
  messageRowSupport: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleColumn: {
    maxWidth: '75%',
  },
  bubble: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
  },
  bubbleVendor: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleSupport: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    ...typography.label,
    color: colors.textPrimary,
  },
  bubbleTextVendor: {
    color: colors.white,
  },
  timeLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    paddingTop: 3,
    textAlign: 'left',
  },
  timeLabelVendor: {
    textAlign: 'right',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputField: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 3,
    maxHeight: 96,
  },
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    padding: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
