import { useEffect, useState, type ReactNode } from 'react';
import { reverseGeocode, searchLocations, type Location } from '../lib/api';
import { locationKey } from '../lib/locations';
import type { Units } from '../lib/units';
import { Icon } from './UiIcon';

function flagEmoji(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '📍';
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map((char) => 0x1f1e6 - 65 + char.charCodeAt(0)),
  );
}

function subtitle(location: Location): string {
  return [location.admin1 === location.name ? undefined : location.admin1, location.country]
    .filter(Boolean)
    .join(', ');
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="sheet-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="grabber" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface LocationSheetProps {
  locations: Location[];
  activeKey: string;
  onSelect: (location: Location) => void;
  onDelete: (location: Location) => void;
  onClose: () => void;
}

export function LocationSheet({
  locations,
  activeKey,
  onSelect,
  onDelete,
  onClose,
}: LocationSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    let cancelled = false;
    const timer = window.setTimeout(() => {
      searchLocations(term)
        .then((found) => {
          if (cancelled) return;
          setResults(found);
          setStatus('done');
        })
        .catch(() => {
          if (cancelled) return;
          setResults([]);
          setStatus('error');
        });
    }, 320);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoState('error');
      return;
    }
    setGeoState('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void (async () => {
          const info = await reverseGeocode(position.coords.latitude, position.coords.longitude);
          onSelect({
            id: -Date.now(),
            name: info?.name ?? 'Current location',
            country: info?.country,
            countryCode: info?.countryCode,
            admin1: info?.admin1,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGeoState('idle');
        })();
      },
      () => setGeoState('error'),
      { timeout: 10000, maximumAge: 300000 },
    );
  };

  return (
    <Sheet title="Locations" onClose={onClose}>
      <div className="field">
        <Icon name="search" size={20} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a city"
          aria-label="Search for a city"
          autoComplete="off"
          spellCheck={false}
        />
        {query !== '' && (
          <button
            type="button"
            className="icon-btn"
            style={{ width: 28, height: 28, color: 'rgba(255, 255, 255, 0.6)' }}
            onClick={() => setQuery('')}
            aria-label="Clear search"
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      <button type="button" className="ghost-btn" onClick={useMyLocation} disabled={geoState === 'loading'}>
        <Icon name="my-location" size={19} />
        {geoState === 'loading' ? 'Locating…' : 'Use my location'}
      </button>
      {geoState === 'error' && (
        <p className="hint">Location access is unavailable. Search for a city instead.</p>
      )}

      {status === 'loading' && <p className="hint">Searching…</p>}
      {status === 'error' && <p className="hint">Search is unavailable right now. Try again in a moment.</p>}

      {results.length > 0 && (
        <>
          <div className="section-label">Search results</div>
          <ul className="list">
            {results.map((location) => (
              <li key={`${location.id}-${locationKey(location)}`}>
                <button type="button" className="list-item" onClick={() => onSelect(location)}>
                  <span className="flag" aria-hidden="true">
                    {flagEmoji(location.countryCode)}
                  </span>
                  <span className="meta">
                    <span className="name">{location.name}</span>
                    <span className="sub">{subtitle(location)}</span>
                  </span>
                  <Icon name="location" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="section-label">Saved locations</div>
      <ul className="list">
        {locations.map((location) => {
          const isActive = locationKey(location) === activeKey;
          return (
            <li key={locationKey(location)} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                className="list-item"
                onClick={() => onSelect(location)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="flag" aria-hidden="true">
                  {flagEmoji(location.countryCode)}
                </span>
                <span className="meta">
                  <span className="name">{location.name}</span>
                  <span className="sub">{subtitle(location) || 'Saved location'}</span>
                </span>
                {isActive && (
                  <span className="check">
                    <Icon name="check" size={20} />
                  </span>
                )}
              </button>
              {locations.length > 1 && (
                <button
                  type="button"
                  className="icon-btn"
                  style={{ width: 34, height: 34, color: 'rgba(255, 255, 255, 0.6)' }}
                  onClick={() => onDelete(location)}
                  aria-label={`Remove ${location.name}`}
                >
                  <Icon name="trash" size={17} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}

interface SettingsSheetProps {
  units: Units;
  onChange: (units: Units) => void;
  onClose: () => void;
}

export function SettingsSheet({ units, onChange, onClose }: SettingsSheetProps) {
  return (
    <Sheet title="Settings" onClose={onClose}>
      <div className="settings-group">
        <div className="settings-label">Temperature</div>
        <div className="seg" role="group" aria-label="Temperature unit">
          <button
            type="button"
            aria-pressed={units.temp === 'c'}
            onClick={() => onChange({ ...units, temp: 'c' })}
          >
            Celsius (°C)
          </button>
          <button
            type="button"
            aria-pressed={units.temp === 'f'}
            onClick={() => onChange({ ...units, temp: 'f' })}
          >
            Fahrenheit (°F)
          </button>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-label">Wind speed</div>
        <div className="seg" role="group" aria-label="Wind speed unit">
          <button
            type="button"
            aria-pressed={units.wind === 'kmh'}
            onClick={() => onChange({ ...units, wind: 'kmh' })}
          >
            km/h
          </button>
          <button
            type="button"
            aria-pressed={units.wind === 'mph'}
            onClick={() => onChange({ ...units, wind: 'mph' })}
          >
            mph
          </button>
          <button
            type="button"
            aria-pressed={units.wind === 'ms'}
            onClick={() => onChange({ ...units, wind: 'ms' })}
          >
            m/s
          </button>
        </div>
      </div>

      <p className="about">
        Forecast, air quality and pollen data comes from{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer noopener">
          Open-Meteo
        </a>{' '}
        (CC BY 4.0), the free and open source weather source also supported by Breezy Weather.
        Weather refreshes automatically every 10 minutes.
        <br />
        <br />
        This is an unofficial web recreation of the{' '}
        <a
          href="https://github.com/breezy-weather/breezy-weather"
          target="_blank"
          rel="noreferrer noopener"
        >
          Breezy Weather
        </a>{' '}
        Android app, which is licensed under LGPL-3.0.
      </p>
    </Sheet>
  );
}
