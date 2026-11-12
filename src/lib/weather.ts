export type IconKind =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'sleet'
  | 'snow'
  | 'showers'
  | 'snow-showers'
  | 'thunder';

export type ConditionGroup = 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'thunder';

export interface ConditionInfo {
  label: string;
  kind: IconKind;
  group: ConditionGroup;
}

const CONDITIONS: Record<number, ConditionInfo> = {
  0: { label: 'Clear sky', kind: 'clear', group: 'clear' },
  1: { label: 'Mainly clear', kind: 'clear', group: 'clear' },
  2: { label: 'Partly cloudy', kind: 'partly', group: 'partly' },
  3: { label: 'Overcast', kind: 'cloudy', group: 'cloudy' },
  45: { label: 'Fog', kind: 'fog', group: 'fog' },
  48: { label: 'Rime fog', kind: 'fog', group: 'fog' },
  51: { label: 'Light drizzle', kind: 'drizzle', group: 'rain' },
  53: { label: 'Drizzle', kind: 'drizzle', group: 'rain' },
  55: { label: 'Dense drizzle', kind: 'drizzle', group: 'rain' },
  56: { label: 'Freezing drizzle', kind: 'sleet', group: 'rain' },
  57: { label: 'Dense freezing drizzle', kind: 'sleet', group: 'rain' },
  61: { label: 'Light rain', kind: 'rain', group: 'rain' },
  63: { label: 'Rain', kind: 'rain', group: 'rain' },
  65: { label: 'Heavy rain', kind: 'rain', group: 'rain' },
  66: { label: 'Freezing rain', kind: 'sleet', group: 'rain' },
  67: { label: 'Heavy freezing rain', kind: 'sleet', group: 'rain' },
  71: { label: 'Light snow', kind: 'snow', group: 'snow' },
  73: { label: 'Snow', kind: 'snow', group: 'snow' },
  75: { label: 'Heavy snow', kind: 'snow', group: 'snow' },
  77: { label: 'Snow grains', kind: 'snow', group: 'snow' },
  80: { label: 'Light showers', kind: 'showers', group: 'rain' },
  81: { label: 'Showers', kind: 'showers', group: 'rain' },
  82: { label: 'Violent showers', kind: 'showers', group: 'rain' },
  85: { label: 'Light snow showers', kind: 'snow-showers', group: 'snow' },
  86: { label: 'Snow showers', kind: 'snow-showers', group: 'snow' },
  95: { label: 'Thunderstorm', kind: 'thunder', group: 'thunder' },
  96: { label: 'Thunderstorm with hail', kind: 'thunder', group: 'thunder' },
  99: { label: 'Thunderstorm with heavy hail', kind: 'thunder', group: 'thunder' },
};

export function conditionFor(code: number): ConditionInfo {
  return CONDITIONS[code] ?? { label: 'Unknown', kind: 'cloudy', group: 'cloudy' };
}

export const COMPASS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
];

export function compass(degrees: number): string {
  const index = Math.round(((degrees % 360) / 22.5 + 16) % 16);
  return COMPASS[index % 16];
}

export interface Band {
  label: string;
  color: string;
  level: number;
}

const AQI_BANDS: Array<{ max: number; label: string; color: string }> = [
  { max: 20, label: 'Good', color: '#3fae5a' },
  { max: 40, label: 'Fair', color: '#f2c200' },
  { max: 60, label: 'Moderate', color: '#f28c28' },
  { max: 80, label: 'Poor', color: '#e05252' },
  { max: 100, label: 'Very poor', color: '#9b59b6' },
  { max: Infinity, label: 'Extremely poor', color: '#8d6e63' },
];

export function aqiBand(aqi: number): Band {
  const index = AQI_BANDS.findIndex((band) => aqi <= band.max);
  const band = AQI_BANDS[index < 0 ? AQI_BANDS.length - 1 : index];
  return { label: band.label, color: band.color, level: index < 0 ? 5 : index };
}

export const UV_BANDS: Band[] = [
  { label: 'Low', color: '#3fae5a', level: 0 },
  { label: 'Moderate', color: '#f2c200', level: 1 },
  { label: 'High', color: '#f28c28', level: 2 },
  { label: 'Very high', color: '#e05252', level: 3 },
  { label: 'Extreme', color: '#9b59b6', level: 4 },
];

export function uvBand(uv: number): Band {
  if (uv < 3) return UV_BANDS[0];
  if (uv < 6) return UV_BANDS[1];
  if (uv < 8) return UV_BANDS[2];
  if (uv < 11) return UV_BANDS[3];
  return UV_BANDS[4];
}

export function beaufort(kmh: number): number {
  const thresholds = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
  const index = thresholds.findIndex((threshold) => kmh < threshold);
  return index < 0 ? 12 : index;
}

export function windColor(kmh: number): string {
  const level = beaufort(kmh);
  if (level <= 3) return '#3fae5a';
  if (level <= 5) return '#f2c200';
  if (level <= 7) return '#f28c28';
  if (level <= 9) return '#e05252';
  if (level <= 11) return '#9b59b6';
  return '#8d6e63';
}

export function visibilityBand(km: number): Band {
  if (km < 1) return { label: 'Very poor', color: '#e05252', level: 0 };
  if (km < 4) return { label: 'Poor', color: '#f28c28', level: 1 };
  if (km < 10) return { label: 'Moderate', color: '#f2c200', level: 2 };
  if (km < 20) return { label: 'Good', color: '#3fae5a', level: 3 };
  if (km < 40) return { label: 'Clear', color: '#3fae5a', level: 4 };
  return { label: 'Perfectly clear', color: '#3fae5a', level: 5 };
}

export function pollenRisk(value: number): Band {
  if (value < 10) return { label: 'Low', color: '#3fae5a', level: 0 };
  if (value < 30) return { label: 'Moderate', color: '#f2c200', level: 1 };
  if (value < 60) return { label: 'High', color: '#f28c28', level: 2 };
  return { label: 'Very high', color: '#e05252', level: 3 };
}

export function pressureLabel(hpa: number): string {
  if (hpa < 1000) return 'Low pressure';
  if (hpa > 1025) return 'High pressure';
  return 'Normal';
}

export interface MoonPhase {
  name: string;
  /** 0 = new moon, 0.5 = full moon */
  phase: number;
  illumination: number;
}

export function moonPhaseName(phase: number): string {
  const names = [
    'New moon',
    'Waxing crescent',
    'First quarter',
    'Waxing gibbous',
    'Full moon',
    'Waning gibbous',
    'Last quarter',
    'Waning crescent',
  ];
  return names[Math.round(phase * 8) % 8];
}
