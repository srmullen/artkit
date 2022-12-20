import { random_point } from './random';

/**
 * 
 * @param n_points - The number of points to attempt to create
 * @param min - The minimum distance between pixels.
 * @param point_generator - Function for generating points,
 * @param sentinel - The number of iterations after which to stop trying to place any more points
 * @returns 
 */
 export function proximity_culling(n_points: number, min: number, point_generator: (..._: any[]) => paper.Point = random_point, sentinel = 100000) {
  let points: paper.Point[] = [];
  let i = 0;
  while (points.length < n_points && i < sentinel) {
    let candidate = point_generator()
    if (points.every(point => candidate.getDistance(point) > min)) {
      points.push(candidate);
    }
    i++;
  }
  return points;
}