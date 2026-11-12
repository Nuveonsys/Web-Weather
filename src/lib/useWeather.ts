import { useCallback, useEffect, useRef, useState } from 'react';
import { loadWeather, type Location, type WeatherBundle } from './api';

export interface WeatherState {
  bundle: WeatherBundle | null;
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  updatedAt: number | null;
  refreshing: boolean;
}

const REFRESH_INTERVAL = 10 * 60 * 1000;

export function useWeather(location: Location) {
  const [state, setState] = useState<WeatherState>({
    bundle: null,
    status: 'loading',
    error: null,
    updatedAt: null,
    refreshing: false,
  });
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = requestId.current + 1;
    requestId.current = id;
    setState((previous) => ({
      ...previous,
      status: previous.bundle ? 'ready' : 'loading',
      refreshing: Boolean(previous.bundle),
      error: null,
    }));

    try {
      const bundle = await loadWeather(location.latitude, location.longitude);
      if (requestId.current !== id) return;
      setState({
        bundle,
        status: 'ready',
        error: null,
        updatedAt: Date.now(),
        refreshing: false,
      });
    } catch (error) {
      if (requestId.current !== id) return;
      setState((previous) => ({
        ...previous,
        status: previous.bundle ? 'ready' : 'error',
        refreshing: false,
        error: error instanceof Error ? error.message : 'Unable to load weather data',
      }));
    }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    setState({
      bundle: null,
      status: 'loading',
      error: null,
      updatedAt: null,
      refreshing: false,
    });
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, REFRESH_INTERVAL);
    return () => window.clearInterval(timer);
  }, [load]);

  return { ...state, refresh: load };
}
