import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';
import type { AuthStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<AuthStackParamList>();

export function resetNavigation<Name extends keyof AuthStackParamList>(
  name: Name,
  params?: AuthStackParamList[Name],
) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name, params }] }));
}

export function currentRoute() {
  return navigationRef.isReady() ? navigationRef.getCurrentRoute() : undefined;
}
