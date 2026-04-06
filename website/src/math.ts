/**
 * Generate points along a superellipse |x|^n + |y|^n = r^n
 * in the first quadrant. Returns [{x, y}, ...] from (r, 0) to (0, r).
 *
 * Parametric form: x = r * |cos(θ)|^(2/n), y = r * |sin(θ)|^(2/n)
 * for θ from 0 to π/2.
 *
 * @param n — mathematical exponent (n=2 is circle). CSS `superellipse(K)`
 *   maps to math exponent n = 2^K, so pass `Math.pow(2, K)` here.
 */
export function superellipsePoints(r: number, n: number, numPoints: number = 100): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * (Math.PI / 2);
    const cosT = Math.cos(t);
    const sinT = Math.sin(t);
    points.push({
      x: r * Math.pow(Math.abs(cosT), 2 / n) * Math.sign(cosT),
      y: r * Math.pow(Math.abs(sinT), 2 / n) * Math.sign(sinT),
    });
  }
  return points;
}

/**
 * Generate points along a circular arc (quarter circle) of radius r.
 * Returns [{x, y}, ...] from (r, 0) to (0, r).
 */
export function circleArcPoints(r: number, numPoints: number = 100): Point[] {
  return superellipsePoints(r, 2, numPoints);
}

/**
 * Correction formula: r * (1 - 2^(-1/2)) / (1 - 2^(-1/n))
 * Analytically derived so perceived radius exactly matches a circle.
 * @param r — the circle's radius
 * @param n — mathematical exponent (n=2 is circle)
 */
export function correctedRadius(r: number, n: number): number {
  return (r * (1 - Math.pow(2, -0.5))) / (1 - Math.pow(2, -1 / n));
}

/**
 * Bevel depth for a circle of radius r.
 * For a superellipse |x|^n + |y|^n = r^n, the tangent line x+y=k
 * touches the curve when k = r * 2^(1 - 1/n).
 * Bevel depth = perpendicular distance from origin to that line = k / √2.
 * For a circle (n=2): depth = r.
 */
export function bevelDepthCircle(r: number): number {
  return bevelDepth(r, 2);
}

/**
 * Bevel depth for a superellipse with exponent n and radius r.
 * depth = r * 2^(1 - 1/n) / √2
 */
export function bevelDepthSuperellipse(r: number, n: number): number {
  return bevelDepth(r, n);
}

function bevelDepth(r: number, n: number): number {
  const k = r * Math.pow(2, 1 - 1 / n);
  return k / Math.SQRT2;
}

/**
 * Perceived radius: distance from a reference center to where a curve
 * crosses the diagonal line from that center to the box corner.
 *
 * The reference center is at (centerR, centerR) — typically the circle's
 * center. The curve with span arcR and exponent n intersects the diagonal
 * at (arcR(1 - 2^(-1/n)), arcR(1 - 2^(-1/n))).
 *
 * @param centerR — radius of the reference circle (defines the center point)
 * @param arcR — the curve's specified radius (axis extent)
 * @param n — mathematical exponent (n=2 is circle)
 */
export function perceivedRadius(centerR: number, arcR: number, n: number): number {
  const apexFromCorner = arcR * (1 - Math.pow(2, -1 / n));
  return Math.SQRT2 * (centerR - apexFromCorner);
}

/**
 * Convert array of {x, y} points to SVG path "d" attribute.
 */
export function pointsToPath(points: Point[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  return `M ${first!.x} ${first!.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(" ");
}

export interface Point {
  x: number;
  y: number;
}
