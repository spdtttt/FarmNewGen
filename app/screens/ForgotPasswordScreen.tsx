import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { AuthStackParamList } from '../navigation/types';


type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
    AuthStackParamList,
    'ForgotPassword'
>;

interface Props {
    navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleResetPassword = async (): Promise<void> => {
        if (!email) {
            Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมล');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมลให้ถูกต้อง');
            return;
        }

        setIsLoading(true);
        const { error } = await resetPassword(email);
        setIsLoading(false);

        if (error) {
            console.log('Reset Password Error:', error);
            Alert.alert('ผิดพลาด', error.message || 'ไม่สามารถส่งอีเมลได้');
        } else {
            Alert.alert(
                'สำเร็จ!',
                'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้คุณ',
                [{ text: 'ตกลง', onPress: () => navigation.goBack() }]
            );
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Back Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>

                        <View style={styles.innerContent}>
                            {/* Icon */}
                            <View style={styles.iconContainer}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="key-outline" size={48} color="#fff" />
                                </View>
                            </View>

                            {/* Title */}
                            <Text style={styles.title}>ลืมรหัสผ่าน?</Text>
                            <Text style={styles.subtitle}>
                                ไม่ต้องกังวล กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่านใหม่
                            </Text>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name="mail-outline" size={20} color={colors.primary} />
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

                            {/* Reset Button */}
                            <TouchableOpacity
                                style={[styles.resetButton, isLoading && styles.buttonDisabled]}
                                onPress={handleResetPassword}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <View style={styles.buttonContent}>
                                        <Text style={styles.resetButtonText}>ส่งลิงก์รีเซ็ต</Text>
                                        <Ionicons name="send" size={18} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Back to Login */}
                            <TouchableOpacity
                                style={styles.backToLoginContainer}
                                onPress={() => navigation.navigate('Login')}
                            >
                                <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
                                <Text style={styles.backToLoginText}>กลับไปหน้าเข้าสู่ระบบ</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView >
            </SafeAreaView >
        </View >
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
        padding: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        marginBottom: 20,
    },
    innerContent: {
        alignItems: 'center',
        marginTop: 20,
    },
    // Icon Styles
    iconContainer: {
        marginBottom: 30,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },

    // Text Styles
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
        paddingHorizontal: 20,
    },

    // Input Styles
    inputContainer: {
        width: '100%',
        marginBottom: 30,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        height: 56,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    iconBox: {
        width: 50,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 56,
        fontSize: 16,
        color: colors.textPrimary,
        paddingRight: 16,
    },

    // Button Styles
    resetButton: {
        width: '100%',
        height: 56,
        backgroundColor: colors.primary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },

    // Back to Login
    backToLoginContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },
    backToLoginText: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});

export default ForgotPasswordScreen;