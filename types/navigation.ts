import type { StackScreenProps } from '@react-navigation/stack';

export type RootStackParamList = {
  index: undefined;
  '(onboarding)': undefined;
  '(paywall)': { 
    paywall: undefined;
  };
  '(app)': {
    '(tabs)': {
      dashboard: undefined;
      tools: undefined;
      learn: undefined;
      community: undefined;
      coach: undefined;
    };
  };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}