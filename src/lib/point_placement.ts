import { Point } from 'paper';
import { random } from 'mathjs';
import { isFunction } from '$lib/utils';

export function random_points(n_points:number, width: number, height: number) {
  let points = [];
  for (let i = 0; i < n_points; i++) {
    points.push(new Point(random(0, width), random(0, height)));
  }

  return points;
}

interface RelaxationDisplacementOpts {
  distance: number, // The distance at which points will begin ignoring each other.
  stepDistance: number // The size of the step taken away from the point.
}

// TODO: Optimization - Use grid to collect points in certain distance rather than checking every point.
function relaxation_displacement_step(
  points: paper.Point[], 
  // { distance = 20, stepDistance = 1 }: Partial<RelaxationDisplacementOpts> = {}
  optsFn: (p: paper.Point) => Partial<RelaxationDisplacementOpts>
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
    ret.push(point.add(force));
  }
  return [ret, changed];
}

export function relaxation_displacement(
  points: paper.Point[], 
  opts?: Partial<RelaxationDisplacementOpts> | ((p: paper.Point) => Partial<RelaxationDisplacementOpts>)
) {
  const max_steps = 10000;
  let step = 0;
  let changed = true;
  let displaced = points;
  let optsFn = isFunction(opts) ? opts : (_: paper.Point) => opts || {};
  while (changed && step < max_steps) {
    // console.log('step: ', step);
    [displaced, changed] = relaxation_displacement_step(displaced, optsFn);
    step++;
  }
  return displaced;
}