interface Point {
  x: number;
  y: number;
}

function closedSmoothPath(points: Point[]): string {
  const n = points.length;
  if (n < 3) return '';
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return `${d} Z`;
}

function polarPoints(
  cx: number,
  cy: number,
  radii: number[],
  rotationDeg = -90,
  stretch = 1,
): Point[] {
  const n = radii.length;
  const rotation = (rotationDeg * Math.PI) / 180;
  return radii.map((radius, i) => {
    const angle = rotation + (i / n) * Math.PI * 2;
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius * stretch };
  });
}

/** Soft closed blob with gentle asymmetry, used for the squircle-ish pressure card. */
export function blobPath(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const radii = [0.49, 0.47, 0.5, 0.48, 0.5, 0.46, 0.49, 0.5, 0.47, 0.5, 0.48, 0.49].map(
    (r) => r * size,
  );
  return closedSmoothPath(polarPoints(cx, cy, radii));
}

/** Many-lobed ripple, like the UV index starburst card. */
export function ripplePath(size: number, lobes = 20, depth = 0.055): string {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.5;
  const inner = outer * (1 - depth);
  const radii = Array.from({ length: lobes * 2 }, (_, i) => (i % 2 === 0 ? outer : inner));
  return closedSmoothPath(polarPoints(cx, cy, radii));
}

/** Soft flower/scallop card, like the visibility block. */
export function scallopPath(size: number, lobes = 9, depth = 0.1): string {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.5;
  const radii = Array.from({ length: lobes * 2 }, (_, i) =>
    i % 2 === 0 ? outer : outer * (1 - depth),
  );
  return closedSmoothPath(polarPoints(cx, cy, radii));
}

/** Arc helper: returns an SVG arc path between two angles of a circle. */
export function arcPath(
  cx: number,
  cy: number,
  radius: number,
  startDeg: number,
  endDeg: number,
): string {
  const start = ((startDeg - 90) * Math.PI) / 180;
  const end = ((endDeg - 90) * Math.PI) / 180;
  const x1 = cx + Math.cos(start) * radius;
  const y1 = cy + Math.sin(start) * radius;
  const x2 = cx + Math.cos(end) * radius;
  const y2 = cy + Math.sin(end) * radius;
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** Smooth open path through points (Catmull-Rom converted to cubic beziers). */
export function smoothLine(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i += 1) {
    const p0 = points[i - 2] ?? points[i - 1];
    const p1 = points[i - 1];
    const p2 = points[i];
    const p3 = points[i + 1] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/** Point at t along a quadratic bezier. */
export function quadPoint(
  p0: Point,
  c: Point,
  p1: Point,
  t: number,
): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p1.x,
    y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p1.y,
  };
}

/** Left half of a quadratic bezier, for drawing the traversed part of an arc. */
export function quadSegment(p0: Point, c: Point, p1: Point, t: number): string {
  const a = { x: p0.x + (c.x - p0.x) * t, y: p0.y + (c.y - p0.y) * t };
  const b = { x: c.x + (p1.x - c.x) * t, y: c.y + (p1.y - c.y) * t };
  const mid = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} Q ${a.x.toFixed(2)} ${a.y.toFixed(2)}, ${mid.x.toFixed(2)} ${mid.y.toFixed(2)}`;
}
