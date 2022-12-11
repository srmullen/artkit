import { Point, Path } from 'paper';
import { processOptions } from '$lib/utils';
// import sortBy from 'lodash.sortby';
import { random } from 'mathjs';
import * as pens from '$lib/pens';

const sortBy = <T, U>(arr: T[], fn: (v: T) => U): T[] => {
  return arr.sort((a, b) => {
    let av = fn(a);
    let bv = fn(b);
    if (av === bv) {
      return 0;
    } else if (a < b) {
      return -1;
    } else {
      return 1;
    }
  });
}

export function hatch(shape: paper.Path, opts = {}) {
  const {
    stepSize = 5,
    wobble = 0,
    angle,
    pen,
    debug
  } = processOptions(opts);

  // const center = new Point(shape.bounds.centerX, shape.bounds.centerY);
  const center = new Point(shape.bounds.center.x, shape.bounds.center.y);
  const disectionVec = new Point({
    length: 1,
    angle: angle + 90
  });
  const disectionFrom = center.add(disectionVec.multiply(shape.bounds.width + shape.bounds.height));
  const disectionTo = center.subtract(disectionVec.multiply(shape.bounds.width + shape.bounds.height));

  if (debug) {
    new Path.Line({
      from: disectionFrom,
      to: disectionTo,
      strokeColor: 'red'
    });
  }

  const traceVec = disectionVec.rotate(90, [0, 0]);
  const width = 10000;
  const trace = new Path.Line({
    visible: false,
    from: disectionFrom.subtract(traceVec.multiply(width)),
    to: disectionFrom.add(traceVec.multiply(width)),
    strokeColor: 'blue'
  });

  const disectionLength = disectionFrom.getDistance(disectionTo);
  const steps = disectionLength / stepSize;

  const xrand = () => {
    return random(-wobble, wobble);
  }

  const yrand = () => {
    return random(-wobble, wobble);
  }

  const paths: paper.Path[] = [];
  for (let i = 0; i < steps; i++) {
    trace.translate(disectionVec.normalize().multiply(-stepSize));
    let intersections = shape.getIntersections(trace);
    if (intersections.length === 3) {
      // Both ends of the hatching line should always begin outside the shape, so assume
      // the mid-point come from clipping a corner.
      // FIXME: Need to extend this to handle all odd-numbered intersections.
      const from = intersections[0].point.add([xrand(), yrand()]);
      const to = intersections[2].point.add([xrand(), yrand()]);
      const segments = i % 2 === 0 ? [from, to] : [to, from] // reverse the direction of each stroke for faster drawing.
      pens.withPen(pen, ({ color, strokeWidth }) => {
        const path = new Path({
          segments,
          strokeWidth: strokeWidth,
          strokeColor: color
        });
        paths.push(path);
      });
    } else if (intersections.length && intersections.length % 2 === 0) {
      intersections = sortBy(intersections, loc => loc.point.x);
      for (let j = 0; j < intersections.length; j += 2) {
        const fromIdx = j;
        const toIdx = j + 1;
        const from = intersections[fromIdx].point.add([xrand(), yrand()]);
        const to = intersections[toIdx].point.add([xrand(), yrand()]);
        const segments = i % 2 === 0 ? [from, to] : [to, from] // reverse the direction of each stroke for faster drawing.
        pens.withPen(pen, ({ color, strokeWidth }) => {
          const path = new Path({
            segments,
            strokeWidth: strokeWidth,
            strokeColor: color
          });
          paths.push(path);
        });
      }
    }
  }
  trace.remove();
  return paths;
}

// Rather than returning paths, returns a set of points.
// Doesn't correctly fill concave shapes.
export function hatch_points(shape: paper.Path, opts: Record<string, any> = {}) {
  let {
    stepSize = 5,
    angle = 45,
  } = opts;

  const center = new Point(shape.bounds.center.x, shape.bounds.center.y);
  const disectionVec = new Point({
    length: 1,
    angle: angle + 90
  });
  const disectionFrom = center.add(disectionVec.multiply(shape.bounds.width + shape.bounds.height));
  const disectionTo = center.subtract(disectionVec.multiply(shape.bounds.width + shape.bounds.height));

  const traceVec = disectionVec.rotate(90, [0, 0]);
  const width = 10000;
  const trace = new Path.Line({
    visible: false,
    from: disectionFrom.subtract(traceVec.multiply(width)),
    to: disectionFrom.add(traceVec.multiply(width)),
    strokeColor: 'blue'
  });

  const disectionLength = disectionFrom.getDistance(disectionTo);
  const steps = disectionLength / stepSize;

  let points: paper.Point[] = [];
  for (let i = 0; i < steps; i++) {
    trace.translate(disectionVec.normalize().multiply(-stepSize));
    let intersections = shape.getIntersections(trace);
    if (intersections.length === 3) {
      // Both ends of the hatching line should always begin outside the shape, so assume
      // the mid-point come from clipping a corner.
      // FIXME: Need to extend this to handle all odd-numbered intersections.
      const from = intersections[0].point;
      const to = intersections[2].point;
      const segments = i % 2 === 0 ? [from, to] : [to, from] // reverse the direction of each stroke for faster drawing.
      points = points.concat(segments);
    } else if (intersections.length && intersections.length % 2 === 0) {
      intersections = sortBy(intersections, loc => loc.point.x);
      for (let j = 0; j < intersections.length; j += 2) {
        const fromIdx = j;
        const toIdx = j + 1;
        const from = intersections[fromIdx].point;
        const to = intersections[toIdx].point;
        const segments = i % 2 === 0 ? [from, to] : [to, from] // reverse the direction of each stroke for faster drawing.
        points = points.concat(segments);
      }
    }
  }
  trace.remove();
  return points;
}