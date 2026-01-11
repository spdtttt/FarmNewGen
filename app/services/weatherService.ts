import axios from 'axios';
import Constants from 'expo-constants';
import { WeatherAPIResponse, WeatherData } from '../types';

// อ่าน API key จาก Constants (Expo) หรือ hardcode
const getApiKey = (): string => {
  // ลองอ่านจาก Constants.expoConfig?.extra ก่อน (สำหรับ Expo)
  const fromConstants = Constants.expoConfig?.extra?.OPENWEATHER_API_KEY;
  
  // ลองอ่านจาก Constants.manifest?.extra (สำหรับบางเวอร์ชัน)
  const fromManifest = Constants.manifest?.extra?.OPENWEATHER_API_KEY;
  
  // Hardcode API key (อัปเดตจาก .env)
  const hardcodedKey = 'a81a3e1d722b1be39e9e1cbee2a0627f';
  
  const apiKey = fromConstants || fromManifest || hardcodedKey || '';
  
  // Debug logging
  if (__DEV__) {
    console.log('=== Weather API Key Debug ===');
    console.log('From Constants.expoConfig?.extra:', fromConstants ? `Found (${fromConstants.substring(0, 8)}...)` : 'Not found');
    console.log('From Constants.manifest?.extra:', fromManifest ? `Found (${fromManifest.substring(0, 8)}...)` : 'Not found');
    console.log('Using hardcoded key:', hardcodedKey ? `Yes (${hardcodedKey.substring(0, 8)}...)` : 'No');
    console.log('Final API Key:', apiKey ? `Yes (length: ${apiKey.length}, preview: ${apiKey.substring(0, 8)}...)` : 'No');
    console.log('===========================');
  }
  
  return apiKey;
};

const API_KEY = getApiKey();
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * ดึงข้อมูลสภาพอากาศจาก OpenWeatherMap API
 * @param latitude ละติจูด
 * @param longitude ลองจิจูด
 * @returns ข้อมูลสภาพอากาศ
 */
export async function getWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key is not configured. Please set OPENWEATHER_API_KEY in .env file');
  }
  
  try {
    const url = `${BASE_URL}/weather`;
    const params = {
      lat: latitude,
      lon: longitude,
      appid: API_KEY,
      units: 'metric',
      lang: 'th',
    };
    
    if (__DEV__) {
      console.log('Fetching weather from:', url, 'with params:', { ...params, appid: '***' });
    }
    
    const response = await axios.get<WeatherAPIResponse>(url, { params });
    const data = response.data;
    
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: data.name || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
      windSpeed: data.wind?.speed || 0,
      pressure: data.main.pressure,
      visibility: (data.visibility || 10000) / 1000, // แปลงเป็น km
      lastUpdated: new Date(),
    };
  } catch (error: any) {
    console.error('Error fetching weather data:', error);
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 401) {
        throw new Error(
          `Invalid API key. Please check:\n` +
          `1. API key is correct\n` +
          `2. Email is verified in OpenWeatherMap account\n` +
          `3. Wait 10-15 minutes after creating new API key\n` +
          `Error: ${JSON.stringify(errorData)}`
        );
      }
      
      throw new Error(`Weather API error: ${status} - ${JSON.stringify(errorData)}`);
    }
    
    throw error;
  }
}

/**
 * ดึงข้อมูลสภาพอากาศจากชื่อเมือง (fallback)
 * @param cityName ชื่อเมือง
 * @returns ข้อมูลสภาพอากาศ
 */
export async function getWeatherByCity(cityName: string): Promise<WeatherData> {
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key is not configured. Please set OPENWEATHER_API_KEY in .env file');
  }
  
  try {
    const url = `${BASE_URL}/weather`;
    const params = {
      q: cityName,
      appid: API_KEY,
      units: 'metric',
      lang: 'th',
    };
    
    if (__DEV__) {
      console.log('Fetching weather by city from:', url, 'with params:', { ...params, appid: '***' });
    }
    
    const response = await axios.get<WeatherAPIResponse>(url, { params });
    const data = response.data;
    
    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: data.name || cityName,
      windSpeed: data.wind?.speed || 0,
      pressure: data.main.pressure,
      visibility: (data.visibility || 10000) / 1000,
      lastUpdated: new Date(),
    };
  } catch (error: any) {
    console.error('Error fetching weather data by city:', error);
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      if (status === 401) {
        throw new Error(
          `Invalid API key. Please check:\n` +
          `1. API key is correct\n` +
          `2. Email is verified in OpenWeatherMap account\n` +
          `3. Wait 10-15 minutes after creating new API key\n` +
          `Error: ${JSON.stringify(errorData)}`
        );
      }
      
      throw new Error(`Weather API error: ${status} - ${JSON.stringify(errorData)}`);
    }
    
    throw error;
  }
}
