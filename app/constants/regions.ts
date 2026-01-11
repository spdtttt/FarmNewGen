
export interface SupportedRegion {
    id: string;
    nameThai: string;
    icon: string;
    description: string;
    crops: string;
}

export const SUPPORTED_REGIONS: SupportedRegion[] = [
    {
        id: 'south',
        nameThai: 'ภาคใต้',
        icon: '🏝️',
        description: 'ยางพารา, ปาล์มน้ำมัน',
        crops: 'oil_palm,rubber'
    },
    {
        id: 'central',
        nameThai: 'ภาคกลาง',
        icon: '🌾',
        description: 'ข้าว',
        crops: 'rice'
    },
    {
        id: 'northeast',
        nameThai: 'ภาคอีสาน',
        icon: '🏜️',
        description: 'อ้อย, มันสำปะหลัง',
        crops: 'sugar_cane,cassava'
    },
    {
        id: 'north',
        nameThai: 'ภาคเหนือ',
        icon: '⛰️',
        description: 'ข้าวโพด',
        crops: 'corn'
    },
];
