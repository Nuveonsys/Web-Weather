import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Location } from './lib/api';
import { DEFAULT_LOCATIONS, locationKey } from './lib/locations';
import { buildModel, type Model } from './lib/model';
import { skyFor, skyVars } from './lib/theme';
import { DEFAULT_UNITS, tempValue, type TempUnit, type Units, type WindUnit } from './lib/units';
import { conditionFor } from './lib/weather';
import { useWeather } from './lib/useWeather';
import { Sky } from './components/Sky';
import { Icon } from './components/UiIcon';
import { WeatherIcon } from './components/WeatherIcon';
import { DailyForecast } from './components/DailyForecast';
import { HourlyForecast } from './components/HourlyForecast';
import { Blocks } from './components/Blocks';
import { LocationSheet, SettingsSheet } from './components/Sheets';

const LS_LOCATIONS = 'breezy-web.locations.v1';
const LS_ACTIVE = 'breezy-web.active.v1';
const LS_UNITS = 'breezy-web.units.v1';

function readLocations(): Location[] {
  try {
    const raw = window.localStorage.getItem(LS_LOCATIONS);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter((item): item is Location => {
          if (typeof item !== 'object' || item === null) return false;
          const candidate = item as Location;
          return (
            typeof candidate.name === 'string' &&
            typeof candidate.latitude === 'number' &&
            typeof candidate.longitude === 'number'
          );
        });
        if (valid.length > 0) return valid;
      }
    }
  } catch {
    /* ignore corrupted storage */
  }
  return DEFAULT_LOCATIONS;
}

function readUnits(): Units {
  try {
    const raw = window.localStorage.getItem(LS_UNITS);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Units>;
      const temp: TempUnit = parsed.temp === 'f' ? 'f' : 'c';
      const wind: WindUnit = parsed.wind === 'mph' || parsed.wind === 'ms' ? parsed.wind : 'kmh';
      return { temp, wind };
    }
  } catch {
    /* ignore corrupted storage */
  }
  return DEFAULT_UNITS;
}

function relativeTime(updatedAt: number, nowMs: number): string {
  const minutes = Math.floor((nowMs - updatedAt) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes === 1) return '1 min ago';
  return `${minutes} mins ago`;
}

export default function App() {
  const [locations, setLocations] = useState<Location[]>(readLocations);
  const [activeKey, setActiveKey] = useState<string>(() => {
    const stored = window.localStorage.getItem(LS_ACTIVE);
    const initial = readLocations();
    if (stored && initial.some((item) => locationKey(item) === stored)) return stored;
    return locationKey(initial[0]);
  });
  const [units, setUnits] = useState<Units>(readUnits);
  const [sheet, setSheet] = useState<'locations' | 'settings' | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const active = locations.find((item) => locationKey(item) === activeKey) ?? locations[0];
  const weather = useWeather(active);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LS_LOCATIONS, JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    window.localStorage.setItem(LS_ACTIVE, activeKey);
  }, [activeKey]);

  useEffect(() => {
    window.localStorage.setItem(LS_UNITS, JSON.stringify(units));
  }, [units]);

  const now = useMemo(() => new Date(nowMs), [nowMs]);
  const model = useMemo(
    () => (weather.bundle ? buildModel(weather.bundle, active, now) : null),
    [weather.bundle, active, now],
  );

  const appStyle = skyVars(skyFor(model?.group ?? 'partly', model?.isDay ?? true)) as CSSProperties;

  const selectLocation = (location: Location) => {
    setLocations((current) =>
      current.some((item) => locationKey(item) === locationKey(location))
        ? current
        : [...current, location],
    );
    setActiveKey(locationKey(location));
    setSheet(null);
  };

  const deleteLocation = (location: Location) => {
    const next = locations.filter((item) => locationKey(item) !== locationKey(location));
    if (next.length === 0) return;
    setLocations(next);
    if (locationKey(location) === activeKey) setActiveKey(locationKey(next[0]));
  };

  const updatedLabel = weather.updatedAt ? relativeTime(weather.updatedAt, nowMs) : 'just now';
  const fullName = [active.name, active.country].filter(Boolean).join(', ');

  return (
    <div className="app" style={appStyle}>
      <Sky group={model?.group ?? 'partly'} isDay={model?.isDay ?? true} />
      <div className="shell">
        <header className="topbar">
          <span aria-hidden="true" />
          <h1 className="city" title={fullName}>
            {active.name}
          </h1>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSheet('locations')}
            aria-label="Locations"
            title="Locations"
          >
            <Icon name="list" size={22} />
          </button>
        </header>

        {model ? (
          <main>
            {weather.error && (
              <div className="banner" role="status">
                <Icon name="refresh" size={16} />
                <span>Couldn’t refresh: {weather.error}. Showing the last forecast.</span>
              </div>
            )}
            <Hero model={model} units={units} />
            <HourlyForecast hours={model.hours} units={units} />
            <DailyForecast days={model.days} units={units} currentTemp={model.current.temp} />
            <Blocks model={model} units={units} />
            <footer className="footer">
              <div className="footer-links">
                <a href="https://open-meteo.com/" target="_blank" rel="noreferrer noopener">
                  Weather Data
                </a>
                <span className="dot">•</span>
                <button type="button" className="link-btn" onClick={() => setSheet('settings')}>
                  Units
                </button>
                <span className="dot">•</span>
                <button type="button" className="link-btn" onClick={() => void weather.refresh()}>
                  Updated {updatedLabel}
                </button>
              </div>
              <span className="footer-note">
                Unofficial web recreation of Breezy Weather · Powered by Open-Meteo
              </span>
            </footer>
          </main>
        ) : weather.status === 'error' ? (
          <div className="panel error-card">
            <WeatherIcon code={95} size={62} />
            <h2>Weather Unavailable</h2>
            <p>{weather.error ?? 'Something went wrong while contacting Open-Meteo.'}</p>
            <button type="button" className="btn-primary" onClick={() => void weather.refresh()}>
              Try Again
            </button>
          </div>
        ) : (
          <Loading />
        )}
      </div>

      {sheet === 'locations' && (
        <LocationSheet
          locations={locations}
          activeKey={activeKey}
          onSelect={selectLocation}
          onDelete={deleteLocation}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'settings' && (
        <SettingsSheet units={units} onChange={setUnits} onClose={() => setSheet(null)} />
      )}
    </div>
  );
}

function Hero({ model, units }: { model: Model; units: Units }) {
  const today = model.days[0];

  return (
    <section className="hero" aria-label="Current weather">
      <div className="hero-temp">
        <span>{tempValue(model.current.temp, units)}</span>
        <span className="deg">°</span>
      </div>
      <div className="hero-cond">{conditionFor(model.current.code).label}</div>
      <div className="hero-hl">
        <span>H:{tempValue(today?.tMax ?? model.current.temp, units)}°</span>
        <span>L:{tempValue(today?.tMin ?? model.current.temp, units)}°</span>
      </div>
    </section>
  );
}

function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading weather">
      <div className="skeleton hero-sk">
        <span style={{ width: '40%', height: 16 }} />
        <span style={{ width: '46%', height: 78, marginTop: 12 }} />
        <span style={{ width: '30%', height: 14, marginTop: 14 }} />
      </div>
      <div className="skeleton panel-sk" />
      <div className="skeleton panel-sk" />
    </div>
  );
}
