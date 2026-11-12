export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  countryCode?: string;
  admin1?: string;
  timezone?: string;
}

export interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  utc_offset_seconds: number;
  current_units: Record<string, string>;
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m: number[];
    relative_humidity_2m: number[];
    dew_point_2m: number[];
    uv_index: number[];
    visibility: number[];
    pressure_msl: number[];
    cloud_cover: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_direction_10m_dominant: number[];
    wind_gusts_10m_max: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
    daylight_duration: number[];
    sunshine_duration: number[];
  };
}

export interface AirQualityResponse {
  timezone: string;
  current: {
    time: string;
    european_aqi: number | null;
    pm2_5: number | null;
    pm10: number | null;
    ozone: number | null;
    nitrogen_dioxide: number | null;
    alder_pollen: number | null;
    birch_pollen: number | null;
    grass_pollen: number | null;
    mugwort_pollen: number | null;
    olive_pollen: number | null;
    ragweed_pollen: number | null;
  };
  hourly: {
    time: string[];
    european_aqi: (number | null)[];
  };
}

export interface WeatherBundle {
  forecast: ForecastResponse;
  air: AirQualityResponse | null;
}

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';

const CURRENT_VARS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'weather_code',
  'cloud_cover',
  'pressure_msl',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
];

const HOURLY_VARS = [
  'temperature_2m',
  'apparent_temperature',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'wind_gusts_10m',
  'relative_humidity_2m',
  'dew_point_2m',
  'uv_index',
  'visibility',
  'pressure_msl',
  'cloud_cover',
  'is_day',
];

const DAILY_VARS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'apparent_temperature_max',
  'apparent_temperature_min',
  'precipitation_sum',
  'precipitation_probability_max',
  'wind_speed_10m_max',
  'wind_direction_10m_dominant',
  'wind_gusts_10m_max',
  'uv_index_max',
  'sunrise',
  'sunset',
  'daylight_duration',
  'sunshine_duration',
];

const AIR_VARS = [
  'european_aqi',
  'pm2_5',
  'pm10',
  'ozone',
  'nitrogen_dioxide',
  'alder_pollen',
  'birch_pollen',
  'grass_pollen',
  'mugwort_pollen',
  'olive_pollen',
  'ragweed_pollen',
];

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    let reason = `${res.status} ${res.statusText}`;
    try {
      const body = (await res.json()) as { reason?: string };
      if (body?.reason) reason = body.reason;
    } catch {
      /* ignore malformed error body */
    }
    throw new Error(reason);
  }
  return (await res.json()) as T;
}

export async function loadWeather(latitude: number, longitude: number): Promise<WeatherBundle> {
  const forecastParams = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: CURRENT_VARS.join(','),
    hourly: HOURLY_VARS.join(','),
    daily: DAILY_VARS.join(','),
    timezone: 'auto',
    forecast_days: '10',
  });

  const airParams = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: AIR_VARS.join(','),
    hourly: 'european_aqi',
    timezone: 'auto',
    forecast_days: '5',
  });

  const [forecast, air] = await Promise.all([
    getJson<ForecastResponse>(`${FORECAST_URL}?${forecastParams}`),
    getJson<AirQualityResponse>(`${AIR_URL}?${airParams}`).catch(() => null),
  ]);

  if (!forecast.current || !forecast.hourly?.time?.length) {
    throw new Error('Incomplete forecast data received');
  }

  return { forecast, air };
}

export async function searchLocations(query: string): Promise<Location[]> {
  const params = new URLSearchParams({
    name: query,
    count: '8',
    language: 'en',
    format: 'json',
  });
  const data = await getJson<{ results?: Location[] }>(`${GEO_URL}?${params}`);
  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    countryCode: result.countryCode,
    admin1: result.admin1,
    timezone: result.timezone,
  }));
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<{ name: string; country?: string; countryCode?: string; admin1?: string } | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      localityLanguage: 'en',
    });
    const data = await getJson<{
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
      countryCode?: string;
    }>(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`);
    const name = data.city || data.locality || data.principalSubdivision;
    if (!name) return null;
    return {
      name,
      country: data.countryName,
      countryCode: data.countryCode,
      admin1: data.principalSubdivision,
    };
  } catch {
    return null;
  }
}
