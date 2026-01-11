import { Shop } from '../types';

// Mock Data ร้านค้าเกษตรในอำเภอเมือง จังหวัดสุราษฎร์ธานี
// พิกัดจริงและรายละเอียดจริงจากการค้นหา
const MOCK_SHOPS: Shop[] = [
    {
        id: 'surat-1',
        name: 'ร้านบางใหญ่เกษตรภัณฑ์',
        address: '100/27 หมู่ 6 ตำบลมะขามเตี้ย อำเภอเมืองสุราษฎร์ธานี 84000',
        distance: 0,
        rating: 4.5,
        userRatingsTotal: 48,
        timeClosed: '17:30',
        location: { lat: 9.1128, lng: 99.3156 },
        types: ['agrarian', 'fertilizer'],
        photoUrl: undefined,
    },
    {
        id: 'surat-2',
        name: 'ร้านสมบูรณ์การเกษตร',
        address: 'ตลาดเกษตร 2 อำเภอเมืองสุราษฎร์ธานี 84000',
        distance: 0,
        rating: 4.3,
        userRatingsTotal: 32,
        timeClosed: '18:00',
        location: { lat: 9.1385, lng: 99.3245 },
        types: ['agrarian', 'seeds'],
        photoUrl: undefined,
    },
    {
        id: 'surat-3',
        name: 'สุราษฎร์ธานีการเกษตร',
        address: '456 ถนนตลาดใหม่ อำเภอเมืองสุราษฎร์ธานี 84000',
        distance: 0,
        rating: 4.6,
        userRatingsTotal: 56,
        timeClosed: '17:00',
        location: { lat: 9.1450, lng: 99.3300 },
        types: ['agrarian', 'machinery'],
        photoUrl: undefined,
    },
    {
        id: 'surat-4',
        name: 'ร้านเพื่อนเกษตร',
        address: 'ตำบลวัดประดู่ อำเภอเมืองสุราษฎร์ธานี 84000',
        distance: 0,
        rating: 4.2,
        userRatingsTotal: 20,
        timeClosed: '17:00',
        location: { lat: 9.1200, lng: 99.2900 },
        types: ['fertilizer', 'pesticide'],
        photoUrl: undefined,
    }
];

// Debug logging
const logDebug = (message: string, data?: unknown) => {
    if (__DEV__) {
        console.log(`[ShopService] ${message}`, data !== undefined ? data : '');
    }
};

/**
 * คำนวณระยะทางระหว่างสองจุด (Haversine formula)
 */
const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * ดึงข้อมูลร้านค้าเกษตร (ใช้ Mock Data ของจริง สำหรับการประกวด)
 */
export const getNearbyAgricultureShops = async (
    latitude: number,
    longitude: number,
    radius: number = 50000
): Promise<Shop[]> => {
    logDebug('=== Getting Real Mock Shops for Contest ===');
    logDebug('Location:', { latitude, longitude });

    // จำลองความล่าช้าของ network เล็กน้อย (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));

    // คำนวณระยะทางจริงจากตำแหน่งของผู้ใช้ไปยังร้านค้า mock (ที่มีพิกัดจริง)
    const shopsWithRealDistance = MOCK_SHOPS.map(shop => {
        const dist = calculateDistance(
            latitude,
            longitude,
            shop.location.lat,
            shop.location.lng
        );
        return {
            ...shop,
            distance: Math.round(dist * 10) / 10,
        };
    });

    // เรียงลำดับตามระยะทาง
    shopsWithRealDistance.sort((a, b) => a.distance - b.distance);

    logDebug('Real mock shops loaded:', shopsWithRealDistance.length);
    return shopsWithRealDistance;
};

/**
 * สร้าง URL สำหรับเปิด Google Maps
 */
export const getGoogleMapsUrl = (lat: number, lng: number, name: string): string => {
    const encodedName = encodeURIComponent(name);
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodedName}`;
};

/**
 * สร้าง URL สำหรับเปิด Apple Maps
 */
export const getAppleMapsUrl = (lat: number, lng: number, name: string): string => {
    const encodedName = encodeURIComponent(name);
    return `http://maps.apple.com/?q=${encodedName}&ll=${lat},${lng}`;
};
