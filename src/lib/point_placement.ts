import { Point } from 'paper';
import { random } from 'mathjs';

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

function relaxation_displacement_step(
  points: paper.Point[], 
  { distance = 20, stepDistance = 1 }: Partial<RelaxationDisplacementOpts> = {}
): [paper.Point[], boolean] {
  const ret = [];
  let changed = false;
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    let force = new Point(0, 0);
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

export function relaxation_displacement(points: paper.Point[], opts?: Partial<RelaxationDisplacementOpts>) {
  const max_steps = 10000;
  let step = 0;
  let changed = true;
  let displaced = points;
  while (changed && step < max_steps) {
    [displaced, changed] = relaxation_displacement_step(displaced, opts);
    step++;
  }
  // console.log('steps', step);
  return displaced;
}