import type { HourPoint } from '../lib/model';
import { tempValue, type Units } from '../lib/units';
import { Icon } from './UiIcon';
import { WeatherIcon } from './WeatherIcon';

export function HourlyForecast({ hours, units }: { hours: HourPoint[]; units: Units }) {
  return (
    <section className="panel" aria-label="Hourly forecast">
      <h2 className="panel-head">
        <Icon name="clock" size={13} /> Hourly forecast
      </h2>
      <div className="hourly-scroll">
        {hours.map((hour, index) => (
          <div className="hour" key={hour.time}>
            <span className="hour-time">{index === 0 ? 'Now' : hour.hourLabel}</span>
            <span className="hour-icon">
              <WeatherIcon code={hour.code} isDay={hour.isDay} size={27} />
            </span>
            <span className="hour-temp">{tempValue(hour.temp, units)}°</span>
            <span className="hour-precip">
              {hour.precipProb >= 5 ? `${Math.round(hour.precipProb)}%` : ''}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
