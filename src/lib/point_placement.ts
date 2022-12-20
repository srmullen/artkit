import { Point } from 'paper';
import { random } from 'mathjs';
import { isFunction, choose } from '$lib/utils';

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

export function poisson_disc(radius: number, k: number, width: number, height: number, sentinel = Infinity) {
  let N = 2; // Dimensions
  let points: paper.Point[] = [];
  let active: paper.Point[] = [];

  // Create a grid of square for quick lookup of nearby points.
  // Cell size is radius / sqrt(N).
  // Cell size is chosen so that there can be at most one point per cell.
  const cellSize = radius / Math.sqrt(N);
  let grid: paper.Point[][] = [];
  let nx = Math.ceil(width/cellSize) + 1;
  let ny = Math.ceil(height/cellSize) + 1;
  console.log({ nx, ny });
  for (let x = 0; x < nx; x++) {
    grid.push([]);
  }

  function insertPoint(point: paper.Point) {
    let x = Math.floor(point.x / cellSize);
    let y = Math.floor(point.y / cellSize);
    grid[x][y] = point;
  }

  function isValidPoint(point: paper.Point) {
    if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) {
      return false;
    }

    // Check neighboring cells
    let xind = Math.floor(point.x / cellSize);
    let yind = Math.floor(point.y / cellSize);
    let i0 = Math.max(xind - 1, 0);
    let i1 = Math.min(xind + 1, nx - 1);
    let j0 = Math.max(yind - 1, 0);
    let j1 = Math.min(yind + 1, ny - 1);
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        let exists = grid[i][j];
        if (exists && point.getDistance(exists) < radius) {
          return false;
        }
      }
    }
    return true;
  }

  let p0 = random_point([0, 0], [width, height]);

  insertPoint(p0);
  points.push(p0);
  active.push(p0);

  let i = 0;
  while (active.length && i < sentinel) {
    i++;
    // Uniformly select a random active point.
    let point = choose(active);
    // Try up to k times to find a point that satisfies...
    // 1. It is between r and 2r distance from point
    // 2. It is at a distance > r for all other points.
    let found = false;
    for (let i = 0; i < k; i++) {
      // create the new point
      let theta = random(360);
      let r = random(radius, 2 * radius);
      let vec = new Point({
        length: r,
        angle: theta,
      });
      let candidate = point.add(vec);
      // Test that the point meets the criteria
      if (!isValidPoint(candidate)) {
        continue;
      }

      // Add the point
      points.push(candidate);
      active.push(candidate);
      insertPoint(candidate);
      found = true;
      break;
    }

    if (!found) {
      active = active.filter(p => p !== point);
    }
    // console.log(active);
  }

  return points;
}