export type TempUnit = 'c' | 'f';
export type WindUnit = 'kmh' | 'mph' | 'ms';

export interface Units {
  temp: TempUnit;
  wind: WindUnit;
}

export const DEFAULT_UNITS: Units = { temp: 'c', wind: 'kmh' };

export function convertTemp(celsius: number, unit: TempUnit): number {
  return unit === 'f' ? celsius * 1.8 + 32 : celsius;
}

export function tempValue(celsius: number, units: Units): number {
  return Math.round(convertTemp(celsius, units.temp));
}

export function tempUnit(units: Units): string {
  return units.temp === 'f' ? '°F' : '°C';
}

export function degreeUnit(units: Units): string {
  return units.temp === 'f' ? '°F' : '°C';
}

export function convertWind(kmh: number, unit: WindUnit): number {
  if (unit === 'mph') return kmh * 0.621371;
  if (unit === 'ms') return kmh / 3.6;
  return kmh;
}

export function windValue(kmh: number, units: Units): number {
  const value = convertWind(kmh, units.wind);
  return units.wind === 'ms' ? Math.round(value * 10) / 10 : Math.round(value);
}

export function windUnit(units: Units): string {
  if (units.wind === 'mph') return 'mph';
  if (units.wind === 'ms') return 'm/s';
  return 'km/h';
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
