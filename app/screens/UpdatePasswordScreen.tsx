import { supabase } from '@/src/config/supabase';
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
import { MainStackParamList } from '../navigation/types';

type UpdatePasswordScreenNavigationProp = NativeStackNavigationProp<
    MainStackParamList,
    'ResetPassword'
>;

interface Props {
    navigation: UpdatePasswordScreenNavigationProp;
}

const UpdatePasswordScreen: React.FC<Props> = ({ navigation }) => {
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const handleUpdatePassword = async (): Promise<void> => {
        if (!password || !confirmPassword) {
            Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านใหม่');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('ข้อผิดพลาด', 'รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (password.length < 6) {
            Alert.alert('ข้อผิดพลาด', 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setIsLoading(true);
        const { error } = await supabase.auth.updateUser({ password: password });
        setIsLoading(false);

        if (error) {
            Alert.alert('ผิดพลาด', error.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
        } else {
            Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
            // In a real app, you might want to clear the 'recovery' state if you track it manually, 
            // but supabase usually handles session updates.
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

                        {/* Logo area */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoCircle}>
                                <Ionicons name="lock-closed" size={60} color="#fff" />
                            </View>
                        </View>

                        {/* Welcome Text */}
                        <Text style={styles.welcomeText}>ตั้งรหัสผ่านใหม่</Text>
                        <Text style={styles.subtitleText}>
                            กรุณากรอกรหัสผ่านใหม่ของคุณ
                        </Text>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="รหัสผ่านใหม่"
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
                                        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <View style={styles.iconBox}>
                                    <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ยืนยันรหัสผ่านใหม่"
                                    placeholderTextColor={colors.textSecondary}
                                    secureTextEntry={!isConfirmPasswordVisible}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.visibilityButton}
                                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                >
                                    <Ionicons
                                        name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                            onPress={handleUpdatePassword}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.loginButtonText}>เปลี่ยนรหัสผ่าน</Text>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                </View>
                            )}
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
        justifyContent: 'center',
    },
    // Logo Styles
    logoContainer: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },

    // Text Styles
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitleText: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },

    // Input Styles
    inputContainer: {
        marginBottom: 20,
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
        borderWidth: 1,
        borderColor: 'transparent',
    },
    iconBox: {
        width: 50,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
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
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Button Styles
    loginButton: {
        height: 56,
        backgroundColor: colors.primary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default UpdatePasswordScreen;
