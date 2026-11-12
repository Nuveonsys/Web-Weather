import type { DayPoint } from '../lib/model';
import { tempColor } from '../lib/theme';
import { tempValue, type Units } from '../lib/units';
import { Icon } from './UiIcon';
import { WeatherIcon } from './WeatherIcon';

interface DailyForecastProps {
  days: DayPoint[];
  units: Units;
  currentTemp: number;
}

export function DailyForecast({ days, units, currentTemp }: DailyForecastProps) {
  const globalMin = Math.min(...days.map((day) => day.tMin));
  const globalMax = Math.max(...days.map((day) => day.tMax));
  const span = Math.max(1, globalMax - globalMin);
  const nowPosition = Math.min(100, Math.max(0, ((currentTemp - globalMin) / span) * 100));

  return (
    <section className="panel" aria-label="10-day forecast">
      <h2 className="panel-head">
        <Icon name="calendar" size={13} /> 10-Day Forecast
      </h2>
      <div className="daily-list">
        {days.map((day) => {
          const low = ((day.tMin - globalMin) / span) * 100;
          const high = ((day.tMax - globalMin) / span) * 100;
          return (
            <div className="day-row" key={day.date}>
              <span className="day-name">{day.weekday}</span>
              <span className="day-icon">
                <WeatherIcon code={day.code} isDay size={26} />
              </span>
              <span className="day-precip">
                {day.precipProb >= 5 ? `${Math.round(day.precipProb)}%` : ''}
              </span>
              <span className="day-low">{tempValue(day.tMin, units)}°</span>
              <span className="range" aria-hidden="true">
                <span
                  className="range-fill"
                  style={{
                    left: `${low}%`,
                    width: `${Math.max(6, high - low)}%`,
                    background: `linear-gradient(90deg, ${tempColor(day.tMin)}, ${tempColor(day.tMax)})`,
                  }}
                />
                {day.isToday && <span className="range-dot" style={{ left: `${nowPosition}%` }} />}
              </span>
              <span className="day-high">{tempValue(day.tMax, units)}°</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
