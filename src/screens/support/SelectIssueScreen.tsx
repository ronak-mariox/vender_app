import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { Icon } from '../../icons/Icon';
import { Badge, NavHeader, ScreenContainer } from '../../components';
import { useSupport } from '../../context/SupportContext';
import { useSupportDraft } from '../../context/SupportDraftContext';
import { colors, radii, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SelectIssue'>;

function singularize(label: string): string {
  return label.endsWith('s') ? label.slice(0, -1) : label;
}

export function SelectIssueScreen({ navigation, route }: Props) {
  const { categoryId } = route.params;
  const { categories, issuesForCategory } = useSupport();
  const { setCategory, setIssue } = useSupportDraft();

  const category = categories.find(c => c.id === categoryId);
  const issues = issuesForCategory(categoryId);
  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>(undefined);

  const selectedIssue = issues.find(i => i.id === selectedIssueId);
  const canProceed = Boolean(selectedIssue);

  function handleNext() {
    if (!selectedIssue) return;
    setCategory(categoryId, category?.label ?? '');
    setIssue(selectedIssue.id, selectedIssue.title);
    navigation.navigate('IssueDetails', { categoryId, issueId: selectedIssue.id });
  }

  return (
    <ScreenContainer backgroundColor={colors.white}>
      <NavHeader title={category?.label ?? 'Select Issue'} onBack={() => navigation.goBack()} />
      <View style={styles.pillRow}>
        <Badge label={singularize(category?.label ?? '')} tone="info" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {issues.map(issue => {
          const selected = issue.id === selectedIssueId;
          return (
            <Pressable key={issue.id} style={styles.row} onPress={() => setSelectedIssueId(issue.id)}>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <Icon name="check" size={12} color={colors.white} strokeWidth={3} /> : null}
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.title}>{issue.title}</Text>
                <Text style={styles.description}>{issue.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          disabled={!canProceed}
          onPress={handleNext}
          style={[styles.nextButton, { backgroundColor: canProceed ? colors.primary : colors.textTertiary }]}
        >
          <Text style={styles.nextButtonLabel}>Next</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pillRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  content: {
    paddingBottom: spacing.huge,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg + 2,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodySemibold,
    color: colors.textPrimary,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonLabel: {
    ...typography.button,
    color: colors.white,
  },
});
