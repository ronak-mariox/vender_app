import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../theme';

type Props = {
  children: React.ReactNode;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  scrollable?: boolean;
  edges?: Edge[];
};

export function ScreenContainer({
  children,
  backgroundColor = colors.white,
  statusBarStyle = 'dark-content',
  scrollable = false,
  edges = ['top', 'left', 'right', 'bottom'],
}: Props) {
  const Content = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? { contentContainerStyle: styles.scrollContent, keyboardShouldPersistTaps: 'handled' as const }
    : { style: styles.flexContent };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={edges}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={backgroundColor} />
      <KeyboardAvoidingView
        style={styles.flexContent}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Content {...contentProps}>{children}</Content>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
