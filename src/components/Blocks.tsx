import { useId, type ReactNode } from 'react';
import type { AirInfo, Model } from '../lib/model';
import { timeInZone } from '../lib/model';
import { tempValue, windUnit, windValue, type Units } from '../lib/units';
import { aqiBand, compass, pressureLabel, uvBand, visibilityBand } from '../lib/weather';
import { quadPoint, quadSegment } from '../lib/shapes';
import { Icon, type IconName } from './UiIcon';

function SunArc({ progress }: { progress: number }) {
  const p0 = { x: 24, y: 84 };
  const control = { x: 150, y: -34 };
  const p1 = { x: 276, y: 84 };
  const orb = quadPoint(p0, control, p1, progress);

  return (
    <svg viewBox="0 0 300 108" aria-hidden="true">
      <line
        x1="14"
        y1="84"
        x2="286"
        y2="84"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="1"
        strokeDasharray="3 6"
      />
      <path
        d={`M ${p0.x} ${p0.y} Q ${control.x} ${control.y} ${p1.x} ${p1.y}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="2"
        strokeDasharray="4 7"
        strokeLinecap="round"
      />
      {progress > 0.02 && (
        <path
          d={quadSegment(p0, control, p1, progress)}
          fill="none"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      <circle cx={orb.x} cy={orb.y} r="14" fill="rgba(255, 214, 10, 0.3)" />
      <circle cx={orb.x} cy={orb.y} r="7" fill="#ffd60a" />
    </svg>
  );
}

function MoonGlyph({ phase, size = 34 }: { phase: number; size?: number }) {
  const id = `moon-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const offset = Math.cos(phase * Math.PI * 2) * 24;
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="moon-glyph" aria-hidden="true">
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40">
          <rect width="40" height="40" fill="black" />
          <circle cx="20" cy="20" r="17" fill="white" />
          <circle cx={20 + offset} cy="20" r="17" fill="black" />
        </mask>
      </defs>
      <circle cx="20" cy="20" r="17" fill="#eef2ff" mask={`url(#${id})`} />
    </svg>
  );
}

function AirQualityCard({ aq }: { aq: AirInfo }) {
  const band = aqiBand(aq.aqi);
  const position = Math.min(99, Math.max(1, (aq.aqi / 150) * 100));

  return (
    <section className="panel" aria-label="Air quality">
      <h2 className="panel-head">
        <Icon name="aqi" size={13} /> Air quality
      </h2>
      <div className="aq-top">
        <span className="aq-value">{Math.round(aq.aqi)}</span>
        <span className="aq-label">{band.label}</span>
      </div>
      <div className="aq-bar" aria-hidden="true">
        <span className="aq-marker" style={{ left: `${position}%` }} />
      </div>
      <div className="aq-scale" aria-hidden="true">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150+</span>
      </div>
      <p className="aq-foot">
        {aq.pm25 != null ? `PM2.5 ${Math.round(aq.pm25)} µg/m³` : 'Fine particles unavailable'}
        {aq.pm10 != null ? ` · PM10 ${Math.round(aq.pm10)} µg/m³` : ''}
      </p>
    </section>
  );
}

function SunMoonCard({ model }: { model: Model }) {
  const { sun, moon } = model;
  const rise = sun.polarDay
    ? 'Polar day'
    : sun.polarNight
      ? 'Polar night'
      : sun.rise
        ? timeInZone(sun.rise, model.tz)
        : '—';
  const set = sun.polarDay || sun.polarNight ? '' : sun.set ? timeInZone(sun.set, model.tz) : '—';
  const daylight =
    sun.daylightMinutes > 0
      ? `${Math.floor(sun.daylightMinutes / 60)}h ${sun.daylightMinutes % 60}m daylight`
      : '';

  return (
    <section className="panel" aria-label="Sun and moon">
      <h2 className="panel-head">
        <Icon name="sun" size={13} /> Sun &amp; Moon
      </h2>
      <div className="sun-arc">
        <SunArc progress={sun.progress} />
      </div>
      <div className="sun-times">
        <span>{rise}</span>
        <span className="mid">{daylight}</span>
        <span>{set}</span>
      </div>
      <div className="moon-row">
        <MoonGlyph phase={moon.phase} />
        <div>
          <div className="moon-name">{moon.phaseName}</div>
          <div className="moon-sub">
            {Math.round(moon.illumination * 100)}% illuminated
            {moon.rise ? ` · Rise ${timeInZone(moon.rise, model.tz)}` : ''}
            {moon.set ? ` · Set ${timeInZone(moon.set, model.tz)}` : ''}
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({ label, icon, children }: { label: string; icon: IconName; children: ReactNode }) {
  return (
    <section className="panel tile">
      <h3 className="tile-label">
        <Icon name={icon} size={12} /> {label}
      </h3>
      {children}
    </section>
  );
}

export function Blocks({ model, units }: { model: Model; units: Units }) {
  const { current, aq, moon } = model;
  const uv = uvBand(current.uv);
  const visibility = current.visibility;
  const visBand = visibilityBand(visibility);
  const pressurePosition = Math.min(99, Math.max(1, ((current.pressure - 980) / 60) * 100));
  const nextHours = model.hours.slice(0, 24);
  const maxPrecip = Math.max(0.2, ...nextHours.map((hour) => hour.precip));
  const feelsNote =
    current.feels < current.temp - 1
      ? 'Wind is making it feel cooler.'
      : current.feels > current.temp + 1
        ? 'Humidity is making it feel warmer.'
        : 'Similar to the actual temperature.';
  const visibilityNote =
    visibility < 4
      ? 'Visibility is reduced.'
      : visibility < 10
        ? 'Moderate visibility.'
        : 'Clear view of the distance.';

  return (
    <>
      {aq && <AirQualityCard aq={aq} />}
      <SunMoonCard model={model} />

      <div className="tiles">
        <Tile label="UV Index" icon="uv">
          <div className="tile-value">{Math.round(current.uv)}</div>
          <div className="tile-sub">{uv.label}</div>
          <div className="tile-footer-group">
            <div className="scale-bar" aria-hidden="true">
              <span className="scale-gradient uv" />
              <span
                className="scale-marker"
                style={{ left: `${Math.min(99, (current.uv / 11) * 100)}%` }}
              />
            </div>
            <div className="uv-scale" aria-hidden="true">
              <span>0</span>
              <span>3</span>
              <span>6</span>
              <span>8</span>
              <span>11+</span>
            </div>
            <div className="tile-foot">
              {current.uv >= 3 ? 'Sun protection recommended' : 'No protection needed'}
            </div>
          </div>
        </Tile>

        <Tile label="Wind" icon="wind">
          <svg className="compass" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.24)" strokeWidth="1" />
            <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
            <text x="50" y="11" textAnchor="middle">
              N
            </text>
            <text x="93" y="53" textAnchor="middle">
              E
            </text>
            <text x="50" y="97" textAnchor="middle">
              S
            </text>
            <text x="7" y="53" textAnchor="middle">
              W
            </text>
            <g transform={`rotate(${current.windDir + 180} 50 50)`}>
              <path d="M50 16 L59 58 L50 51 L41 58 Z" fill="#fff" />
            </g>
            <circle cx="50" cy="50" r="2.6" fill="#fff" />
          </svg>
          <div className="tile-value">
            {windValue(current.wind, units)}
            <span className="unit">{windUnit(units)}</span>
          </div>
          <div className="tile-foot">
            Gusts {windValue(current.gust, units)} {windUnit(units)} · From {compass(current.windDir)}
          </div>
        </Tile>

        <Tile label="Humidity" icon="humidity">
          <div className="tile-value">
            {Math.round(current.humidity)}
            <span className="unit">%</span>
          </div>
          <div className="tile-sub">Dew point {tempValue(current.dew, units)}°</div>
          <div className="tile-foot">The dew point is {tempValue(current.dew, units)}° right now.</div>
        </Tile>

        <Tile label="Feels Like" icon="thermometer">
          <div className="tile-value">{tempValue(current.feels, units)}°</div>
          <div className="tile-sub">
            Actual {tempValue(current.temp, units)}°
          </div>
          <div className="tile-foot">{feelsNote}</div>
        </Tile>

        <Tile label="Visibility" icon="eye">
          <div className="tile-value">
            {visibility >= 10 ? Math.round(visibility) : visibility.toFixed(1)}
            <span className="unit">km</span>
          </div>
          <div className="tile-sub">{visBand.label}</div>
          <div className="tile-foot">{visibilityNote}</div>
        </Tile>

        <Tile label="Pressure" icon="gauge">
          <div className="tile-value">
            {Math.round(current.pressure).toLocaleString('en-US')}
            <span className="unit">hPa</span>
          </div>
          <div className="tile-sub">{pressureLabel(current.pressure)}</div>
          <div className="scale-bar" aria-hidden="true">
            <span className="scale-marker" style={{ left: `${pressurePosition}%` }} />
          </div>
          <div className="tile-foot">Sea-level pressure</div>
        </Tile>

        <Tile label="Precipitation" icon="droplet">
          <div className="tile-value">
            {model.halfPrecip >= 0.05 ? model.halfPrecip.toFixed(1) : '0'}
            <span className="unit">mm</span>
          </div>
          <div className="tile-sub">{model.halfDay === 'day' ? 'Daytime' : 'Nighttime'} total</div>
          <div className="precip-bars" aria-hidden="true">
            {nextHours.slice(0, 12).map((hour) => (
              <span key={hour.time} style={{ height: `${Math.max(4, (hour.precip / maxPrecip) * 34)}px` }} />
            ))}
          </div>
          <div className="tile-foot">Next 12 hours</div>
        </Tile>

        <Tile label="Moon" icon="moon">
          <div className="moon-line">
            <MoonGlyph phase={moon.phase} size={40} />
            <div>
              <div className="moon-name">{moon.phaseName}</div>
              <div className="moon-sub">{Math.round(moon.illumination * 100)}% illuminated</div>
            </div>
          </div>
          <div className="tile-foot">
            {moon.rise ? `Rise ${timeInZone(moon.rise, model.tz)}` : 'Rise —'}
            {moon.set ? ` · Set ${timeInZone(moon.set, model.tz)}` : ''}
          </div>
        </Tile>
      </div>
    </>
  );
}
