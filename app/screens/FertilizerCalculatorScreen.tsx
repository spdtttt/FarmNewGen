import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Keyboard,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../src/config/supabase';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import { MainStackParamList } from '../navigation/types';
import {
    ALL_PLANT_OPTIONS,
    calculateFertilizer,
    FertilizerResult,
    GOAL_OPTIONS,
    PALM_STAGE_OPTIONS,
    PlantGoal,
    PLANTS_BY_REGION,
    PlantStage,
    PlantType,
    Region,
    REGION_OPTIONS,
    RUBBER_STAGE_OPTIONS,
    SOIL_OPTIONS,
    SoilType
} from '../utils/fertilizerLogic';

type CalculatorScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'FertilizerCalculator'>;

const FertilizerCalculatorScreen: React.FC = () => {
    const navigation = useNavigation<CalculatorScreenNavigationProp>();
    const { user } = useAuth();

    // State
    const [region, setRegion] = useState<Region>('south');
    const [plantType, setPlantType] = useState<PlantType>('oil_palm');
    const [stage, setStage] = useState<PlantStage>('new_0_3');
    const [soil, setSoil] = useState<SoilType>('loam');
    const [goal, setGoal] = useState<PlantGoal>('growth');
    const [treeCount, setTreeCount] = useState<string>('');

    const [result, setResult] = useState<FertilizerResult | null>(null);

    // Save Logic State
    const [isSaveModalVisible, setSaveModalVisible] = useState(false);
    const [formulaTitle, setFormulaTitle] = useState('');
    const [saving, setSaving] = useState(false);

    // Reset plant type when region changes
    useEffect(() => {
        const availablePlants = PLANTS_BY_REGION[region];
        if (availablePlants && availablePlants.length > 0) {
            setPlantType(availablePlants[0]);
        }
    }, [region]);

    // Reset stage/goal based on plant type
    useEffect(() => {
        if (plantType === 'oil_palm') {
            setStage('new_0_3');
        } else if (plantType === 'rubber') {
            setStage('no_tap');
        } else {
            // New crops don't have displayed stages, use generic or default
            setStage('general');
        }

        // Reset goal to growth mostly, or keep existing if compatible?
        setGoal('growth');
        setResult(null);
    }, [plantType]);

    const handleCalculate = () => {
        const trees = parseFloat(treeCount);
        if (isNaN(trees) || trees <= 0) {
            Alert.alert('ไม่สามารถคำนวณได้', 'กรุณาระบุจำนวนต้น/ไร่ ให้ถูกต้อง');
            return;
        }

        const calcResult = calculateFertilizer(plantType, stage, soil, goal, trees);
        setResult(calcResult);
        Keyboard.dismiss();
    };

    const handleSave = async () => {
        if (!formulaTitle.trim()) {
            Alert.alert('ไม่สามารถบันทึกได้', 'กรุณาระบุชื่อสูตร');
            return;
        }

        if (!user || !user.email) {
            Alert.alert('ไม่สามารถบันทึกได้', 'กรุณาเข้าสู่ระบบก่อนบันทึก');
            return;
        }

        setSaving(true);
        try {
            // Find labels for readable data
            const plantLabel = ALL_PLANT_OPTIONS.find(o => o.value === plantType)?.label;
            const goalLabel = GOAL_OPTIONS.find(o => o.value === goal)?.label;

            // Map stage to readable string
            let stageLabel = '';
            if (plantType === 'oil_palm') {
                stageLabel = PALM_STAGE_OPTIONS.find(o => o.value === stage)?.label || stage;
            } else if (plantType === 'rubber') {
                stageLabel = RUBBER_STAGE_OPTIONS.find(o => o.value === stage)?.label || stage;
            } else {
                stageLabel = '-'; // No stage for new crops
            }

            const isTreeCrop = ['oil_palm', 'rubber'].includes(plantType);
            const unitLabel = isTreeCrop ? 'กก./ปี' : 'กก./ไร่/รอบ';

            const { error } = await supabase
                .from('Templates')
                .insert({
                    email: user.email,
                    title: formulaTitle,
                    plant: plantLabel,
                    goal: goalLabel,
                    solution: result?.formula,
                    amount: `${result?.totalQuantity.toLocaleString()} ${unitLabel}`,
                    countOfYear: stageLabel,
                    createdAt: new Date().toISOString(),
                });

            if (error) {
                console.error('Error saving template:', error);
                throw error;
            }

            alert('บันทึกสูตรเรียบร้อยแล้ว');
            setSaveModalVisible(false);
            setFormulaTitle('');
        } catch (error) {
            console.error('Error saving:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่');
        } finally {
            setSaving(false);
        }
    };

    const currentStageOptions = plantType === 'oil_palm' ? PALM_STAGE_OPTIONS :
        plantType === 'rubber' ? RUBBER_STAGE_OPTIONS : [];

    // Get valid plants for current region
    const validPlants = PLANTS_BY_REGION[region] || [];
    const displayedPlantOptions = ALL_PLANT_OPTIONS.filter(p => validPlants.includes(p.value as PlantType));

    // Should we show stage selector? Only for Palm and Rubber
    const isTreeCrop = ['oil_palm', 'rubber'].includes(plantType);
    const showStageSelector = isTreeCrop;
    const unitLabel = isTreeCrop ? 'กก./ปี' : 'กก./ไร่/รอบ';
    const perUnitLabel = isTreeCrop ? 'ปริมาณต่อหน่วย/ปี:' : 'ปริมาณต่อหน่วย/รอบ:';
    const amountLabel = isTreeCrop ? `ปริมาณรวม (${treeCount} ต้น):` : `ปริมาณรวม (${treeCount} ไร่):`;

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>คำนวณสูตรปุ๋ย</Text>
                    <View style={{ width: 40 }} />
                </View>

                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Form Section */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>ข้อมูลการเพาะปลูก</Text>
                            <View style={styles.divider} />

                            {/* Region Selection */}
                            <Text style={styles.label}>ภูมิภาค (Region)</Text>
                            <View style={styles.regionContainer}>
                                {REGION_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[styles.regionPill, region === option.value && styles.regionPillActive]}
                                        onPress={() => setRegion(option.value as Region)}
                                    >
                                        <Text style={[styles.regionText, region === option.value && styles.regionTextActive]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Plant Type */}
                            <Text style={styles.label}>พืชที่ปลูกใน{REGION_OPTIONS.find(r => r.value === region)?.label}</Text>
                            <View style={styles.pillContainer}>
                                {displayedPlantOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[styles.pill, plantType === option.value && styles.pillActive]}
                                        onPress={() => setPlantType(option.value as PlantType)}
                                    >
                                        <Text style={[styles.pillText, plantType === option.value && styles.pillTextActive]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Stage */}
                            {showStageSelector && (
                                <>
                                    <Text style={styles.label}>ช่วงอายุ/ระยะการเติบโต</Text>
                                    <View style={styles.dropdownContainer}>
                                        {currentStageOptions.map((option) => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[styles.radioRow, stage === option.value && styles.radioRowActive]}
                                                onPress={() => setStage(option.value as PlantStage)}
                                            >
                                                <Ionicons
                                                    name={stage === option.value ? "radio-button-on" : "radio-button-off"}
                                                    size={20}
                                                    color={stage === option.value ? colors.primary : "#666"}
                                                />
                                                <Text style={[styles.radioText, stage === option.value && styles.radioTextActive]}>{option.label}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}

                            {/* Soil */}
                            <Text style={styles.label}>ลักษณะดิน (Soil Type)</Text>
                            <View style={styles.dropdownContainer}>
                                {SOIL_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[styles.radioRow, soil === option.value && styles.radioRowActive]}
                                        onPress={() => setSoil(option.value as SoilType)}
                                    >
                                        <Ionicons
                                            name={soil === option.value ? "radio-button-on" : "radio-button-off"}
                                            size={20}
                                            color={soil === option.value ? colors.primary : "#666"}
                                        />
                                        <Text style={[styles.radioText, soil === option.value && styles.radioTextActive]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Goal */}
                            <Text style={styles.label}>เป้าหมายการปลูก</Text>
                            <View style={styles.dropdownContainer}>
                                {GOAL_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[styles.radioRow, goal === option.value && styles.radioRowActive]}
                                        onPress={() => setGoal(option.value as PlantGoal)}
                                    >
                                        <Ionicons
                                            name={goal === option.value ? "radio-button-on" : "radio-button-off"}
                                            size={20}
                                            color={goal === option.value ? colors.primary : "#666"}
                                        />
                                        <Text style={[styles.radioText, goal === option.value && styles.radioTextActive]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Amount */}
                            <Text style={styles.label}>จำนวน{isTreeCrop ? 'ต้น' : 'ไร่'}</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="leaf-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="ระบุจำนวน"
                                    keyboardType="numeric"
                                    value={treeCount}
                                    onChangeText={setTreeCount}
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
                                <Text style={styles.calculateButtonText}>คำนวณสูตรปุ๋ย</Text>
                                <Ionicons name="calculator-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Result Section */}
                        {result && (
                            <View style={styles.resultCard}>
                                <View style={styles.resultHeader}>
                                    <Ionicons name="flask" size={24} color="#fff" />
                                    <Text style={styles.resultTitle}>ผลลัพธ์การคำนวณ</Text>
                                </View>

                                <View style={styles.resultContent}>
                                    <View style={styles.resultRow}>
                                        <Text style={styles.resultLabel}>สูตรปุ๋ยที่แนะนำ:</Text>
                                        <Text style={styles.resultValueHighlight}>{result.formula}</Text>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.resultRow}>
                                        <Text style={styles.resultLabel}>{perUnitLabel}</Text>
                                        <Text style={styles.resultValue}>{result.quantityPerTree} กก.</Text>
                                    </View>

                                    <View style={styles.resultRow}>
                                        <Text style={styles.resultLabel}>{amountLabel}</Text>
                                        <Text style={styles.resultValueHighlight}>{result.totalQuantity.toLocaleString()} {unitLabel}</Text>
                                    </View>

                                    <View style={styles.divider} />

                                    <Text style={styles.detailText}>
                                        *คำนวณจาก: อัตราพื้นฐาน ({result.details.baseRate}) × ดิน ({result.details.soilFactor}) × เป้าหมาย ({result.details.goalFactor})
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={() => setSaveModalVisible(true)}
                                    >
                                        <Ionicons name="save-outline" size={20} color="#fff" />
                                        <Text style={styles.saveButtonText}>บันทึกสูตรนี้</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </TouchableWithoutFeedback>

                {/* Save Modal */}
                <Modal
                    visible={isSaveModalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setSaveModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>บันทึกสูตรปุ๋ย</Text>
                            <Text style={styles.modalSubtitle}>ตั้งชื่อสูตรเพื่อเก็บไว้ดูภายหลัง</Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="ชื่อสูตร (เช่น แปลงข้าว 1)"
                                value={formulaTitle}
                                onChangeText={setFormulaTitle}
                                autoFocus
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setSaveModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>ยกเลิก</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.confirmButton,
                                        saving && { opacity: 0.5, backgroundColor: colors.secondary }
                                    ]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    <Text style={styles.confirmButtonText}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 12,
        marginTop: 8,
    },
    pillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
        gap: 8,
    },
    pill: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 5,
    },
    pillActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    pillText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    pillTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    // Region specific styles
    regionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
    },
    regionPill: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    regionPillActive: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    regionText: {
        fontSize: 14,
        color: '#555',
    },
    regionTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    dropdownContainer: {
        backgroundColor: '#F9FFF9', // very light green
        borderRadius: 16,
        padding: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 4,
    },
    radioRowActive: {
        backgroundColor: '#fff',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    radioText: {
        marginLeft: 12,
        fontSize: 15,
        color: colors.textSecondary,
    },
    radioTextActive: {
        color: colors.textPrimary,
        fontWeight: '600'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: 5,
        height: 54,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: colors.textPrimary,
    },
    calculateButton: {
        marginTop: 30,
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        gap: 8
    },
    calculateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 50,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    resultHeader: {
        backgroundColor: colors.success,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    resultContent: {
        padding: 24,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    resultLabel: {
        fontSize: 16,
        color: colors.textSecondary,
        flex: 1,
    },
    resultValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    resultValueHighlight: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
    },
    detailText: {
        fontSize: 13,
        color: '#8E8E93',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: colors.warning,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        shadowColor: colors.warning,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(46, 125, 50, 0.25)', // Green tinted overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: colors.textPrimary,
    },
    modalSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 24,
        textAlign: 'center',
    },
    modalInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        marginBottom: 24,
        backgroundColor: '#FAFAFA',
        color: colors.textPrimary
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
    },
    confirmButton: {
        backgroundColor: colors.primary,
    },
    cancelButtonText: {
        color: '#555',
        fontWeight: '600',
        fontSize: 16,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default FertilizerCalculatorScreen;
