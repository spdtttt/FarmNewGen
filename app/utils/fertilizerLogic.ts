export type Region = 'south' | 'central' | 'northeast' | 'north';

export type PlantType = 'oil_palm' | 'rubber' | 'rice' | 'sugar_cane' | 'cassava' | 'corn';

export type PalmStage = 'new_0_3' | 'production_4_plus';
export type RubberStage = 'no_tap' | 'tapping' | 'post_tap';
// For new crops, we can use a generic 'general' stage if they don't have specific age stages in the requirement
export type GeneralStage = 'general';

export type PlantStage = PalmStage | RubberStage | GeneralStage;

export type SoilType = 'sandy' | 'loam' | 'clay';

export type PlantGoal = 'growth' | 'yield' | 'maintenance';

export interface FertilizerResult {
    formula: string;
    quantityPerTree: number; // kg/tree/year
    totalQuantity: number;
    details: {
        baseRate: number;
        soilFactor: number;
        goalFactor: number;
    };
}

// Soil Factors
const SOIL_FACTORS: Record<SoilType, number> = {
    sandy: 1.3,
    loam: 1.0,
    clay: 1.1,
};

// Goal Factors
const GOAL_FACTORS: Record<PlantGoal, number> = {
    growth: 1.1,
    yield: 1.2,
    maintenance: 1.0,
};

// Base Rates (kg/tree/year OR kg/rai/cycle for field crops)
const BASE_RATES: Record<string, number> = {
    'oil_palm_new_0_3': 1.5,
    'oil_palm_production_4_plus': 4.0,
    'rubber_no_tap': 1.2,
    'rubber_tapping': 2.0,
    'rubber_post_tap': 1.5,
    // New Crops (Unit: kg/rai/cycle)
    'rice_general': 30,
    'sugar_cane_general': 45,
    'cassava_general': 25,
    'corn_general': 30,
};

/**
 * คำนวณสูตรและปริมาณปุ๋ย
 */
export const calculateFertilizer = (
    plantType: PlantType,
    stage: PlantStage,
    soil: SoilType,
    goal: PlantGoal,
    amountOfTrees: number
): FertilizerResult => {
    let formula = '15-15-15'; // Default

    // 1. Determine Formula
    if (plantType === 'oil_palm') {
        if (stage === 'new_0_3') {
            if (goal === 'growth') formula = '15-15-15';
            else formula = '15-15-15';
        } else if (stage === 'production_4_plus') {
            if (goal === 'yield') formula = '16-8-24';
            else if (goal === 'maintenance') formula = '13-13-21';
            else formula = '16-8-24';
        }
    } else if (plantType === 'rubber') {
        if (stage === 'no_tap') {
            formula = '20-10-12';
        } else if (stage === 'tapping') {
            formula = '15-7-18';
        } else if (stage === 'post_tap') {
            formula = '15-15-15';
        }
    } else if (plantType === 'rice') {
        if (goal === 'growth') formula = '16-20-0';
        else if (goal === 'yield') formula = '21-7-18';
        else if (goal === 'maintenance') formula = '15-15-15';
    } else if (plantType === 'sugar_cane') {
        if (goal === 'growth') formula = '16-16-16';
        else if (goal === 'yield') formula = '21-7-18';
        else if (goal === 'maintenance') formula = '15-15-15';
    } else if (plantType === 'cassava') {
        if (goal === 'growth') formula = '15-15-15';
        else if (goal === 'yield') formula = '15-7-18';
        else if (goal === 'maintenance') formula = '13-13-21';
    } else if (plantType === 'corn') {
        if (goal === 'growth') formula = '16-16-16';
        else if (goal === 'yield') formula = '21-7-18';
        else if (goal === 'maintenance') formula = '15-15-15';
    }

    // 2. Calculate Quantity
    const baseKey = `${plantType}_${stage}`;
    const baseRate = BASE_RATES[baseKey] || BASE_RATES[`${plantType}_general`] || 0.05; // safe fallback
    const soilFactor = SOIL_FACTORS[soil];
    const goalFactor = GOAL_FACTORS[goal];

    const quantityPerTree = baseRate * soilFactor * goalFactor;
    const totalQuantity = quantityPerTree * amountOfTrees;

    return {
        formula,
        quantityPerTree: parseFloat(quantityPerTree.toFixed(4)), // More precision for small rates
        totalQuantity: parseFloat(totalQuantity.toFixed(2)),
        details: {
            baseRate,
            soilFactor,
            goalFactor,
        },
    };
};

export const REGION_OPTIONS = [
    { label: 'ภาคใต้', value: 'south' },
    { label: 'ภาคกลาง', value: 'central' },
    { label: 'ภาคตะวันออกเฉียงเหนือ', value: 'northeast' }, // Isan
    { label: 'ภาคเหนือ', value: 'north' },
];

export const ALL_PLANT_OPTIONS = [
    { label: 'ปาล์มน้ำมัน (Oil Palm)', value: 'oil_palm' },
    { label: 'ยางพารา (Rubber)', value: 'rubber' },
    { label: 'ข้าว (Rice)', value: 'rice' },
    { label: 'อ้อย (Sugarcane)', value: 'sugar_cane' },
    { label: 'มันสำปะหลัง (Cassava)', value: 'cassava' },
    { label: 'ข้าวโพด (Corn)', value: 'corn' },
];

export const PLANTS_BY_REGION: Record<string, PlantType[]> = {
    south: ['oil_palm', 'rubber'],
    central: ['rice'],
    northeast: ['sugar_cane', 'cassava'],
    north: ['corn'],
};

export const PALM_STAGE_OPTIONS = [
    { label: 'ปลูกใหม่ (0-3 ปี)', value: 'new_0_3' },
    { label: 'ให้ผลผลิต (4 ปีขึ้นไป)', value: 'production_4_plus' },
];

export const RUBBER_STAGE_OPTIONS = [
    { label: 'ยังไม่กรีด', value: 'no_tap' },
    { label: 'กำลังกรีด', value: 'tapping' },
    { label: 'หลังพักกรีด', value: 'post_tap' },
];

export const SOIL_OPTIONS = [
    { label: 'ดินทราย (Sandy)', value: 'sandy' },
    { label: 'ดินร่วน (Loam)', value: 'loam' },
    { label: 'ดินเหนียว (Clay)', value: 'clay' },
];

export const GOAL_OPTIONS = [
    { label: 'เร่งการเจริญเติบโต', value: 'growth' },
    { label: 'เพิ่มผลผลิต', value: 'yield' },
    { label: 'บำรุงต้น', value: 'maintenance' },
];
