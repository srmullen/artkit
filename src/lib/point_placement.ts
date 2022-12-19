import { Point } from 'paper';
import { random } from 'mathjs';
import { isFunction } from '$lib/utils';

export function random_point(from: paper.PointLike, to: paper.PointLike) {
  let min = new Point(from);
  let max = new Point(to);
  return new Point(random(min.x, max.x), random(min.y, max.y));
}

export function random_points(n_points:number, width: number, height: number) {
  let points = [];
  for (let i = 0; i < n_points; i++) {
    points.push(random_point([0, 0], [width, height]));
  }

  return points;
}

interface RelaxationDisplacementOpts {
  distance: number, // The distance at which points will begin ignoring each other.
  stepDistance: number, // The size of the step taken away from the point.
}

// TODO: Optimization - Use grid to collect points in certain distance rather than checking every point.
function relaxation_displacement_step(
  points: paper.Point[], 
  // { distance = 20, stepDistance = 1 }: Partial<RelaxationDisplacementOpts> = {}
  optsFn: (p: paper.Point) => Partial<RelaxationDisplacementOpts>,
  cull?: (p: paper.Point) => boolean
): [paper.Point[], boolean] {
  const ret = [];
  let changed = false;
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    let force = new Point(0, 0);
    let { distance = 20, stepDistance = 1 } = optsFn(point);
    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        const vec = points[j].subtract(point);
        if (vec.length < distance) {
          force = force.subtract(vec.normalize().multiply(stepDistance));
          changed = true;
        }
      }
    }
    let moved = point.add(force);
    if (cull && cull(moved)) {
      // Don't add the point to the array
      continue;
    } else {
      ret.push(moved);
    }
  }
  return [ret, changed];
}

export function relaxation_displacement(
  points: paper.Point[], 
  opts?: Partial<RelaxationDisplacementOpts> | ((p: paper.Point) => Partial<RelaxationDisplacementOpts>),
  cull?: (p: paper.Point) => boolean
) {
  const max_steps = 10000;
  let step = 0;
  let changed = true;
  let displaced = points;
  let optsFn = isFunction(opts) ? opts : (_: paper.Point) => opts || {};
  while (changed && step < max_steps) {
    [displaced, changed] = relaxation_displacement_step(displaced, optsFn, cull);
    step++;
  }
  return displaced;
}

export function* relaxation_displacement_gen(
  points: paper.Point[], 
  opts?: Partial<RelaxationDisplacementOpts> | ((p: paper.Point) => Partial<RelaxationDisplacementOpts>),
  cull?: (p: paper.Point) => boolean
) {
  const max_steps = 10000;
  let step = 0;
  let changed = true;
  let displaced = points;
  let optsFn = isFunction(opts) ? opts : (_: paper.Point) => opts || {};
  while (changed && step < max_steps) {
    [displaced, changed] = relaxation_displacement_step(displaced, optsFn, cull);
    yield displaced;
    step++;
  }
  return displaced;
}

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

export function poisson_disc() {}