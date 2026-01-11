import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../constants/colors';
import { getGoogleMapsUrl, getNearbyAgricultureShops } from '../services/shopService';
import { Shop } from '../types';

const ShopScreen: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    setError(null);

    try {
      // ขอ permission location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('กรุณาอนุญาตการเข้าถึงตำแหน่งเพื่อค้นหาร้านค้าใกล้เคียง');
        setLoading(false);
        return;
      }

      // ดึงตำแหน่งปัจจุบัน
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      // ค้นหาร้านค้าใกล้เคียง (50 km)
      const nearbyShops = await getNearbyAgricultureShops(latitude, longitude, 50000);
      setShops(nearbyShops);

      if (nearbyShops.length === 0) {
        setError('ไม่พบร้านค้าเกษตรในรัศมี 50 กม.');
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('ไม่สามารถโหลดข้อมูลร้านค้าได้ กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchShops();
    setRefreshing(false);
  }, []);

  const openInMaps = (shop: Shop) => {
    const url = Platform.OS === 'ios'
      ? getGoogleMapsUrl(shop.location.lat, shop.location.lng, shop.name)
      : getGoogleMapsUrl(shop.location.lat, shop.location.lng, shop.name);

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${shop.location.lat},${shop.location.lng}`
          );
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปิดแผนที่ได้');
      });
  };

  const renderShopCard = (shop: Shop) => (
    <TouchableOpacity
      key={shop.id}
      style={styles.shopCard}
      onPress={() => openInMaps(shop)}
      activeOpacity={0.8}
    >
      {/* รูปภาพร้าน (ถ้ามี) */}
      {shop.photoUrl ? (
        <Image
          source={{ uri: shop.photoUrl }}
          style={styles.shopImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.shopImagePlaceholder}>
          <Ionicons name="storefront-outline" size={32} color={colors.secondary} />
        </View>
      )}

      <View style={styles.shopInfo}>
        <View style={styles.shopHeaderRow}>
          {/* ชื่อร้าน */}
          <Text style={styles.shopName} numberOfLines={1}>
            {shop.name}
          </Text>
          {/* Rating */}
          {shop.rating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#fff" />
              <Text style={styles.ratingText}>
                {shop.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>

        {/* ที่อยู่ */}
        <View style={styles.shopDetailRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.shopAddress} numberOfLines={1}>
            {shop.address}
          </Text>
        </View>

        <View style={styles.shopFooter}>
          {/* ระยะทาง */}
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={12} color={colors.primary} />
            <Text style={styles.shopDistance}>{shop.distance} กม.</Text>
          </View>

          {/* เวลาปิดทำการ */}
          {shop.timeClosed && (
            <Text style={styles.timeText}>
              ปิด {shop.timeClosed} น.
            </Text>
          )}
        </View>
      </View>

      <View style={styles.navAction}>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>

    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>ร้านค้าด้านการเกษตร</Text>
          <Text style={styles.subtitle}>
            ค้นหาร้านค้าการเกษตรในอำเภอเมืองสุราษฎร์ธานี
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>กำลังค้นหาร้านค้า...</Text>
        </View>
      ) : error && shops.length === 0 ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconBg}>
            <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchShops}>
            <Text style={styles.retryButtonText}>ลองอีกครั้ง</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* จำนวนร้านค้าที่พบ */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              พบ {shops.length} ร้านค้าใกล้เคียง
            </Text>
            <TouchableOpacity onPress={fetchShops} style={styles.refreshButton}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* รายการร้านค้า */}
          {shops.map(renderShopCard)}

          {/* Tips */}
          <View style={styles.tipBox}>
            <Ionicons name="map-outline" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              แตะที่ร้านค้าเพื่อเปิดระบบนำทาง
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  refreshButton: {
    padding: 8,
  },
  shopCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center', // Align center vertically
    padding: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  shopImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopInfo: {
    flex: 1, // Take up remaining space
    paddingLeft: 16,
    paddingRight: 8,
    justifyContent: 'center',
  },
  shopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shopName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  shopDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  shopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shopDistance: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '500',
  },
  navAction: {
    paddingLeft: 4,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  tipText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default ShopScreen;

