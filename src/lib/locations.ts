import type { Location } from './api';

export const DEFAULT_LOCATIONS: Location[] = [
  {
    id: 2988507,
    name: 'Paris',
    country: 'France',
    countryCode: 'FR',
    latitude: 48.85341,
    longitude: 2.3488,
  },
  {
    id: 2643743,
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    latitude: 51.50853,
    longitude: -0.12574,
  },
  {
    id: 5128581,
    name: 'New York',
    country: 'United States',
    countryCode: 'US',
    admin1: 'New York',
    latitude: 40.71427,
    longitude: -74.00597,
  },
  {
    id: 1850147,
    name: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    latitude: 35.6895,
    longitude: 139.69171,
  },
];

export function locationKey(location: Location): string {
  return `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)}`;
}
