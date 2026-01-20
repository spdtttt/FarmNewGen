import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { useAuth } from "../contexts/AuthContext";
import { AuthStackParamList } from "../navigation/types";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", "ตรวจสอบอีเมลและรหัสผ่านอีกครั้ง");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo area */}
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={[styles.logoImage, styles.roundedSquareImage]}
              />
            </View>

            {/* Welcome Text */}
            <Text style={styles.welcomeText}>ยินดีต้อนรับ</Text>
            <Text style={styles.subtitleText}>Sign In to Farm New Gen</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.visibilityButton}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>หรือ</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Register")}
            >
              <Ionicons
                name="person-add-outline"
                size={20}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.registerButtonText}>สมัครสมาชิก</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 30,
    justifyContent: "center",
  },
  // Logo Styles
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  roundedSquareImage: {
    borderRadius: '50%',
  },

  // Text Styles
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },

  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  iconBox: {
    width: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: colors.textPrimary,
    paddingRight: 16,
  },
  visibilityButton: {
    width: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },

  // Forgot Password
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
    padding: 8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },

  // Button Styles
  loginButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.secondary,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontWeight: "500",
    fontSize: 14,
  },

  // Register Button
  registerButton: {
    height: 56,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});

export default LoginScreen;
