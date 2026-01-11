// Types สำหรับพืชที่รองรับ
export type CropType = 'oil_palm' | 'rubber';

export interface Crop {
  id: CropType;
  name: string;
  nameThai: string;
  icon: string;
  description: string;
}

// Types สำหรับสภาพอากาศ
export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  location: string;
  windSpeed: number;
  pressure: number;
  visibility: number;
  lastUpdated: Date;
}

// Current Weather API 2.5 Response
export interface WeatherAPIResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

// Types สำหรับร้านค้า
export interface Shop {
  id: string;
  name: string;
  address: string;
  distance: number; // in km
  rating?: number;
  userRatingsTotal?: number;
  timeClosed: string; // เช่น "17:30"
  photoUrl?: string;
  location: {
    lat: number;
    lng: number;
  };
  types: string[];
}

// Google Places API Response
export interface GooglePlacesResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  types: string[];
}