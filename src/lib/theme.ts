import type { ConditionGroup } from './weather';

export interface SkyPalette {
  top: string;
  mid: string;
  bottom: string;
}

const DAY_SKY: Record<ConditionGroup, SkyPalette> = {
  clear: { top: '#12549f', mid: '#2f7fc4', bottom: '#6fb3dd' },
  partly: { top: '#1f5f9c', mid: '#4a8cbd', bottom: '#7fb4ce' },
  cloudy: { top: '#3f5165', mid: '#5d7186', bottom: '#8497a8' },
  fog: { top: '#46545f', mid: '#6d7b85', bottom: '#94a1a9' },
  rain: { top: '#1a2f42', mid: '#34546c', bottom: '#5b7c95' },
  snow: { top: '#35495a', mid: '#62809a', bottom: '#94aec2' },
  thunder: { top: '#191f2d', mid: '#333c55', bottom: '#5a6280' },
};

const NIGHT_SKY: Record<ConditionGroup, SkyPalette> = {
  clear: { top: '#050b20', mid: '#10214e', bottom: '#2a3f74' },
  partly: { top: '#0a1424', mid: '#1b2a42', bottom: '#384d68' },
  cloudy: { top: '#0e1218', mid: '#212831', bottom: '#3d4855' },
  fog: { top: '#111619', mid: '#242e34', bottom: '#435057' },
  rain: { top: '#071320', mid: '#142a39', bottom: '#294658' },
  snow: { top: '#131c26', mid: '#293746', bottom: '#495e71' },
  thunder: { top: '#0c0916', mid: '#211c32', bottom: '#3b3453' },
};

export function skyFor(group: ConditionGroup, isDay: boolean): SkyPalette {
  return isDay ? DAY_SKY[group] : NIGHT_SKY[group];
}

export function skyVars(sky: SkyPalette): Record<string, string> {
  return {
    '--sky-top': sky.top,
    '--sky-mid': sky.mid,
    '--sky-bottom': sky.bottom,
  };
}

const TEMP_STOPS: ReadonlyArray<{ t: number; color: readonly [number, number, number] }> = [
  { t: -20, color: [150, 190, 255] },
  { t: 0, color: [124, 196, 255] },
  { t: 10, color: [111, 211, 232] },
  { t: 18, color: [168, 224, 99] },
  { t: 24, color: [255, 214, 10] },
  { t: 30, color: [255, 159, 10] },
  { t: 38, color: [255, 69, 58] },
];

/** Apple-style temperature range colour: cold blues through greens, yellows and hot orange. */
export function tempColor(celsius: number): string {
  const first = TEMP_STOPS[0];
  if (celsius <= first.t) return `rgb(${first.color.join(' ')})`;
  for (let index = 1; index < TEMP_STOPS.length; index += 1) {
    const previous = TEMP_STOPS[index - 1];
    const current = TEMP_STOPS[index];
    if (celsius <= current.t) {
      const ratio = (celsius - previous.t) / (current.t - previous.t);
      const channels = previous.color.map((channel, channelIndex) =>
        Math.round(channel + (current.color[channelIndex] - channel) * ratio),
      );
      return `rgb(${channels.join(' ')})`;
    }
  }
  const last = TEMP_STOPS[TEMP_STOPS.length - 1];
  return `rgb(${last.color.join(' ')})`;
}
