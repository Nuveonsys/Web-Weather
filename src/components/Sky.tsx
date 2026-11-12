import { useMemo } from 'react';
import type { ConditionGroup } from '../lib/weather';

interface SkyProps {
  group: ConditionGroup;
  isDay: boolean;
}

export function Sky({ group, isDay }: SkyProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: 44 }, (_, index) => ({
        left: (index * 73.7 + 11) % 100,
        top: (index * 47.3 + (index % 5) * 6.4) % 56,
        size: 1 + ((index * 13) % 3) * 0.7,
        delay: (index % 9) * 0.6,
        duration: 3.2 + (index % 5) * 0.8,
      })),
    [],
  );

  const showClouds =
    group === 'cloudy' || group === 'rain' || group === 'thunder' || group === 'fog' || group === 'snow';
  const showOrb = group === 'clear' || group === 'partly';

  return (
    <div className={`sky ${isDay ? 'sky-day' : 'sky-night'}`} aria-hidden="true">
      <div className="sky-glow" />
      {showOrb && (isDay ? <div className="sky-sun" /> : <div className="sky-moon" />)}
      {!isDay && (
        <div className="stars">
          {stars.map((star, index) => (
            <span
              key={index}
              className="star"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            />
          ))}
        </div>
      )}
      {showClouds && (
        <div className="sky-clouds">
          <span className="sky-cloud c1" />
          <span className="sky-cloud c2" />
          <span className="sky-cloud c3" />
        </div>
      )}
      {(group === 'rain' || group === 'thunder') && <div className="rain-layer" />}
      {group === 'snow' && <div className="snow-layer" />}
    </div>
  );
}
