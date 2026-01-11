export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Shop: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Factory: undefined; // Assuming you might have other screens
  FertilizerCalculator: undefined;
  ResetPassword: undefined;
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;