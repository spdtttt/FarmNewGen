import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../constants/colors';
import { SUPPORTED_REGIONS } from '../constants/regions';
import { useAuth } from '../contexts/AuthContext';
import { BottomTabParamList, MainStackParamList } from '../navigation/types';
import { getWeatherByCity, getWeatherData } from '../services/weatherService';
import { WeatherData } from '../types';

type HomeScreenNavigationProp = BottomTabNavigationProp<BottomTabParamList, 'Home'> &
  NativeStackNavigationProp<MainStackParamList>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState<boolean>(false);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // ขอ permission และดึงตำแหน่ง
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        await fetchWeatherData();
      } else {
        setLocationPermission(false);
        // ถ้าไม่มี permission ให้ใช้เมือง default (กรุงเทพ)
        await fetchWeatherByCity('Bangkok');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      // Fallback to Bangkok
      await fetchWeatherByCity('Bangkok');
    }
  };

  const fetchWeatherData = async () => {
    setLoadingWeather(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      const weatherData = await getWeatherData(
        location.coords.latitude,
        location.coords.longitude
      );
      setWeather(weatherData);
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Fallback to Bangkok
      await fetchWeatherByCity('Bangkok');
    } finally {
      setLoadingWeather(false);
    }
  };

  const fetchWeatherByCity = async (cityName: string) => {
    setLoadingWeather(true);
    try {
      const weatherData = await getWeatherByCity(cityName);
      setWeather(weatherData);
    } catch (error) {
      console.error('Error fetching weather by city:', error);
      Alert.alert(
        'ไม่สามารถดึงข้อมูลสภาพอากาศได้',
        'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือ API key'
      );
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleCalculateFertilizer = () => {
    navigation.navigate('FertilizerCalculator');
  };

  const handleLogout = async (): Promise<void> => {
    await signOut();
  };

  const getWeatherIcon = (iconCode: string) => {
    // Map OpenWeatherMap icon codes to emoji
    const iconMap: { [key: string]: string } = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️',
    };
    return iconMap[iconCode] || '🌤️';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>หน้าหลัก</Text>
              <Text style={styles.subtitle}>สวัสดี, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'เกษตรกรยุคใหม่'}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutIconBtn}>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>

          {/* สภาพอากาศ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>สภาพอากาศวันนี้</Text>
              <TouchableOpacity
                onPress={locationPermission ? fetchWeatherData : requestLocationPermission}
                style={styles.refreshButton}
              >
                <Ionicons name="refresh" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {loadingWeather ? (
              <View style={styles.weatherCard}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
              </View>
            ) : weather ? (
              <View style={styles.weatherCard}>
                <View style={styles.weatherMain}>
                  <View>
                    <Text style={styles.weatherTemp}>{weather.temperature}°</Text>
                    <Text style={styles.weatherDescription}>{weather.description}</Text>
                    <View style={styles.locationBadge}>
                      <Ionicons name="location" size={12} color="#fff" />
                      <Text style={styles.locationText}>{weather.location}</Text>
                    </View>
                  </View>
                  <Text style={styles.weatherIcon}>{getWeatherIcon(weather.icon)}</Text>
                </View>

                <View style={styles.weatherGrid}>
                  <View style={styles.weatherGridItem}>
                    <Ionicons name="water-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.weatherValue}>{weather.humidity}%</Text>
                    <Text style={styles.weatherLabel}>ความชื้น</Text>
                  </View>
                  <View style={styles.weatherGridItem}>
                    <Ionicons name="speedometer-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.weatherValue}>{weather.pressure}</Text>
                    <Text style={styles.weatherLabel}>ความดัน</Text>
                  </View>
                  <View style={styles.weatherGridItem}>
                    <Ionicons name="leaf-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.weatherValue}>{weather.windSpeed}</Text>
                    <Text style={styles.weatherLabel}>ลม (m/s)</Text>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.weatherCard, styles.errorCard]}
                onPress={locationPermission ? fetchWeatherData : requestLocationPermission}
              >
                <Ionicons name="cloud-offline-outline" size={40} color={colors.textSecondary} />
                <Text style={styles.errorText}>โหลดข้อมูลไม่ได้ แตะเพื่อลองใหม่</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ปุ่มคำนวณปุ๋ย (Hero Button) */}
          <TouchableOpacity
            style={styles.fertilizerButton}
            onPress={handleCalculateFertilizer}
            activeOpacity={0.9}
          >
            <View style={styles.fertilizerContent}>
              <View style={styles.fertilizerIconContainer}>
                <Ionicons name="calculator" size={32} color={colors.primary} />
              </View>
              <View style={styles.fertilizerTextContainer}>
                <Text style={styles.fertilizerButtonTitle}>คำนวณสูตรปุ๋ย & ปริมาณปุ๋ย</Text>
                <Text style={styles.fertilizerButtonDesc}>วิเคราะห์สูตรปุ๋ยที่เหมาะสมกับพืชของคุณ</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* รายชื่อภูมิภาคที่รองรับ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>พืชเศรษฐกิจ</Text>
            <View style={styles.cropsContainer}>
              {SUPPORTED_REGIONS.map((region) => (
                <View key={region.id} style={styles.cropCard}>
                  <Text style={styles.cropIcon}>{region.icon}</Text>
                  <Text style={styles.cropName}>{region.nameThai}</Text>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  logoutIconBtn: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  refreshButton: {
    padding: 4,
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  errorCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  weatherMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherTemp: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.textPrimary,
    lineHeight: 48,
  },
  weatherDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  weatherIcon: {
    fontSize: 64,
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
  },
  weatherGridItem: {
    alignItems: 'center',
    flex: 1,
  },
  weatherValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  weatherLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorText: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
  fertilizerButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 6, // create border effect
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  fertilizerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary, // Inner background
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fertilizerIconContainer: {
    backgroundColor: '#fff',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fertilizerTextContainer: {
    flex: 1,
  },
  fertilizerButtonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  fertilizerButtonDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  cropsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cropCard: {
    width: '48%',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.background,
  },
  cropIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  cropName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default HomeScreen;