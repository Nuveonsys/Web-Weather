import * as SunCalc from 'suncalc';
import type { AirQualityResponse, ForecastResponse, Location, WeatherBundle } from './api';
import { conditionFor, type ConditionGroup } from './weather';

export interface HourPoint {
  time: string;
  hourLabel: string;
  isMidnight: boolean;
  dayLabel: string;
  temp: number;
  feels: number;
  code: number;
  isDay: boolean;
  precipProb: number;
  precip: number;
  wind: number;
  windDir: number;
  gust: number;
  humidity: number;
  dew: number;
  uv: number;
  visibility: number;
  pressure: number;
  cloud: number;
  aqi: number | null;
}

export interface DayPoint {
  date: string;
  weekday: string;
  dateLabel: string;
  isToday: boolean;
  code: number;
  nightCode: number;
  tMax: number;
  tMin: number;
  feelsMax: number;
  feelsMin: number;
  precipProb: number;
  precipSum: number;
  windMax: number;
  windDir: number;
  gustMax: number;
  uvMax: number;
  aqiMax: number | null;
  sunshine: number;
}

export interface AirInfo {
  aqi: number;
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
  no2: number | null;
}

export interface PollenInfo {
  name: string;
  value: number;
}

export interface SunInfo {
  rise: Date | null;
  set: Date | null;
  progress: number;
  daylightMinutes: number;
  polarDay: boolean;
  polarNight: boolean;
}

export interface MoonInfo {
  rise: Date | null;
  set: Date | null;
  progress: number;
  phase: number;
  phaseName: string;
  illumination: number;
  alwaysUp: boolean;
  alwaysDown: boolean;
}

export interface CurrentInfo {
  temp: number;
  feels: number;
  code: number;
  isDay: boolean;
  humidity: number;
  dew: number;
  pressure: number;
  wind: number;
  windDir: number;
  gust: number;
  precip: number;
  uv: number;
  visibility: number;
  cloud: number;
  aqi: number | null;
}

export interface Model {
  location: Location;
  tz: string;
  now: Date;
  current: CurrentInfo;
  halfDay: 'day' | 'night';
  halfPrecip: number;
  days: DayPoint[];
  hours: HourPoint[];
  aq: AirInfo | null;
  pollens: PollenInfo[];
  sun: SunInfo;
  moon: MoonInfo;
  group: ConditionGroup;
  isDay: boolean;
}

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});
export function timeInZone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(date);
}

export function dateOnlyLabel(date: string): string {
  return dateFormatter.format(new Date(`${date}T12:00:00Z`));
}

function compactHourLabel(iso: string): string {
  const hour = Number(iso.slice(11, 13));
  const suffix = hour < 12 ? 'AM' : 'PM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${suffix}`;
}

function weekdayLabel(date: string): string {
  return weekdayFormatter.format(new Date(`${date}T12:00:00Z`));
}

function validDate(date: Date | undefined): Date | null {
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function hourOf(iso: string): number {
  return Number(iso.slice(11, 13));
}

function addDays(date: string, days: number): string {
  const base = new Date(`${date}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

function valueAt(values: number[] | undefined, index: number): number {
  const value = values?.[index];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function buildAqiMap(air: AirQualityResponse | null): Map<string, number | null> {
  const map = new Map<string, number | null>();
  if (!air?.hourly?.time) return map;
  air.hourly.time.forEach((time, index) => {
    map.set(time, air.hourly.european_aqi?.[index] ?? null);
  });
  return map;
}

function aqiForTime(map: Map<string, number | null>, iso: string): number | null {
  const key = `${iso.slice(0, 13)}:00`;
  const value = map.get(key);
  return typeof value === 'number' ? value : null;
}

function dailyAqi(air: AirQualityResponse | null, date: string): number | null {
  if (!air?.hourly?.time) return null;
  let max: number | null = null;
  air.hourly.time.forEach((time, index) => {
    if (!time.startsWith(date)) return;
    const value = air.hourly.european_aqi?.[index];
    if (typeof value === 'number' && (max === null || value > max)) max = value;
  });
  return max;
}

function nightCodeFor(forecast: ForecastResponse, date: string): number {
  const candidates = ['T21:00', 'T22:00', 'T23:00', 'T20:00'];
  for (const suffix of candidates) {
    const index = forecast.hourly.time.indexOf(`${date}${suffix}`);
    if (index >= 0) return valueAt(forecast.hourly.weather_code, index);
  }
  const dayIndex = forecast.daily.time.indexOf(date);
  return dayIndex >= 0 ? valueAt(forecast.daily.weather_code, dayIndex) : 0;
}

function halfDayPrecip(forecast: ForecastResponse, currentTime: string): number {
  const hour = hourOf(currentTime);
  const isDay = hour >= 6 && hour < 18;
  const today = currentTime.slice(0, 10);
  const start = isDay ? `${today}T06:00` : `${today}T18:00`;
  const end = isDay ? `${today}T18:00` : `${addDays(today, 1)}T06:00`;
  let total = 0;
  forecast.hourly.time.forEach((time, index) => {
    if (time >= start && time < end) total += valueAt(forecast.hourly.precipitation, index);
  });
  return Math.round(total * 10) / 10;
}

function pollenList(air: AirQualityResponse | null): PollenInfo[] {
  if (!air?.current) return [];
  const entries: Array<[string, number | null]> = [
    ['Alder', air.current.alder_pollen],
    ['Birch', air.current.birch_pollen],
    ['Grass', air.current.grass_pollen],
    ['Mugwort', air.current.mugwort_pollen],
    ['Olive', air.current.olive_pollen],
    ['Ragweed', air.current.ragweed_pollen],
  ];
  return entries
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && entry[1] > 0.5)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 2);
}

export function buildModel(bundle: WeatherBundle, location: Location, now: Date): Model {
  const { forecast, air } = bundle;
  const { current, hourly, daily } = forecast;
  const tz = forecast.timezone;
  const aqiMap = buildAqiMap(air);

  const currentHourKey = `${current.time.slice(0, 13)}:00`;
  let currentIndex = hourly.time.indexOf(currentHourKey);
  if (currentIndex < 0) currentIndex = hourly.time.findIndex((time) => time >= current.time);
  if (currentIndex < 0) currentIndex = 0;

  const hours: HourPoint[] = hourly.time
    .slice(currentIndex, currentIndex + 24)
    .map((time, offset) => {
      const index = currentIndex + offset;
      const date = time.slice(0, 10);
      const isNow = offset === 0;
      return {
        time,
        hourLabel: compactHourLabel(time),
        isMidnight: hourOf(time) === 0,
        dayLabel: dateOnlyLabel(date),
        temp: valueAt(hourly.temperature_2m, index),
        feels: valueAt(hourly.apparent_temperature, index),
        code: isNow ? current.weather_code : valueAt(hourly.weather_code, index),
        isDay: isNow ? current.is_day === 1 : valueAt(hourly.is_day, index) === 1,
        precipProb: valueAt(hourly.precipitation_probability, index),
        precip: valueAt(hourly.precipitation, index),
        wind: valueAt(hourly.wind_speed_10m, index),
        windDir: valueAt(hourly.wind_direction_10m, index),
        gust: valueAt(hourly.wind_gusts_10m, index),
        humidity: valueAt(hourly.relative_humidity_2m, index),
        dew: valueAt(hourly.dew_point_2m, index),
        uv: valueAt(hourly.uv_index, index),
        visibility: valueAt(hourly.visibility, index) / 1000,
        pressure: valueAt(hourly.pressure_msl, index),
        cloud: valueAt(hourly.cloud_cover, index),
        aqi: aqiForTime(aqiMap, time),
      };
    });

  const days: DayPoint[] = daily.time.map((date, index) => ({
    date,
    weekday: index === 0 ? 'Today' : weekdayLabel(date),
    dateLabel: dateOnlyLabel(date),
    isToday: index === 0,
    code: valueAt(daily.weather_code, index),
    nightCode: nightCodeFor(forecast, date),
    tMax: valueAt(daily.temperature_2m_max, index),
    tMin: valueAt(daily.temperature_2m_min, index),
    feelsMax: valueAt(daily.apparent_temperature_max, index),
    feelsMin: valueAt(daily.apparent_temperature_min, index),
    precipProb: valueAt(daily.precipitation_probability_max, index),
    precipSum: valueAt(daily.precipitation_sum, index),
    windMax: valueAt(daily.wind_speed_10m_max, index),
    windDir: valueAt(daily.wind_direction_10m_dominant, index),
    gustMax: valueAt(daily.wind_gusts_10m_max, index),
    uvMax: valueAt(daily.uv_index_max, index),
    aqiMax: dailyAqi(air, date),
    sunshine: valueAt(daily.sunshine_duration, index) / 3600,
  }));

  const currentUv = hours[0]?.uv ?? 0;
  const currentVisibility = hours[0]?.visibility ?? 0;
  const currentDew = hours[0]?.dew ?? 0;
  const currentAqi = aqiForTime(aqiMap, current.time);

  const aq: AirInfo | null =
    air?.current && typeof air.current.european_aqi === 'number'
      ? {
          aqi: air.current.european_aqi,
          pm25: air.current.pm2_5,
          pm10: air.current.pm10,
          ozone: air.current.ozone,
          no2: air.current.nitrogen_dioxide,
        }
      : null;

  const hourLocal = hourOf(current.time);

  const sunTimes = SunCalc.getTimes(now, location.latitude, location.longitude);
  const sunRise = validDate(sunTimes.sunrise);
  const sunSet = validDate(sunTimes.sunset);
  const sunPosition = SunCalc.getPosition(now, location.latitude, location.longitude);
  const polarDay = !sunRise && sunPosition.altitude > 0;
  const polarNight = !sunRise && sunPosition.altitude <= 0;
  let sunProgress = 0.5;
  if (sunRise && sunSet && sunSet > sunRise) {
    sunProgress = clamp01((now.getTime() - sunRise.getTime()) / (sunSet.getTime() - sunRise.getTime()));
  }

  const moonTimes = SunCalc.getMoonTimes(now, location.latitude, location.longitude, true);
  const moonRise = validDate(moonTimes.rise);
  const moonSet = validDate(moonTimes.set);
  const illumination = SunCalc.getMoonIllumination(now);
  let moonProgress = 0.5;
  if (moonRise && moonSet && moonSet > moonRise) {
    moonProgress = clamp01(
      (now.getTime() - moonRise.getTime()) / (moonSet.getTime() - moonRise.getTime()),
    );
  }
  const phaseNames = [
    'New moon',
    'Waxing crescent',
    'First quarter',
    'Waxing gibbous',
    'Full moon',
    'Waning gibbous',
    'Last quarter',
    'Waning crescent',
  ];

  const isDay = current.is_day === 1;
  const group = conditionFor(current.weather_code).group;

  return {
    location,
    tz,
    now,
    current: {
      temp: current.temperature_2m,
      feels: current.apparent_temperature,
      code: current.weather_code,
      isDay,
      humidity: current.relative_humidity_2m,
      dew: currentDew,
      pressure: current.pressure_msl,
      wind: current.wind_speed_10m,
      windDir: current.wind_direction_10m,
      gust: current.wind_gusts_10m,
      precip: current.precipitation,
      uv: currentUv,
      visibility: currentVisibility,
      cloud: current.cloud_cover,
      aqi: currentAqi,
    },
    halfDay: hourLocal >= 6 && hourLocal < 18 ? 'day' : 'night',
    halfPrecip: halfDayPrecip(forecast, current.time),
    days,
    hours,
    aq,
    pollens: pollenList(air),
    sun: {
      rise: sunRise,
      set: sunSet,
      progress: sunProgress,
      daylightMinutes:
        sunRise && sunSet && sunSet > sunRise
          ? Math.round((sunSet.getTime() - sunRise.getTime()) / 60000)
          : 0,
      polarDay,
      polarNight,
    },
    moon: {
      rise: moonRise,
      set: moonSet,
      progress: moonProgress,
      phase: illumination.phase,
      phaseName: phaseNames[Math.round(illumination.phase * 8) % 8],
      illumination: illumination.fraction,
      alwaysUp: Boolean(moonTimes.alwaysUp),
      alwaysDown: Boolean(moonTimes.alwaysDown),
    },
    group,
    isDay,
  };
}
