import { Path } from 'paper';

// Test that point is to the left of the vector from->to,
function orientation(from: paper.Point, to: paper.Point, point: paper.Point) {
  // https://math.stackexchange.com/questions/274712/calculate-on-which-side-of-a-straight-line-is-a-given-point-located
  let d = (point.x - from.x) * (to.y - from.y) - (point.y - from.y) * (to.x - from.x);
  if (d < 0) {
    return -1; // right / clockwise
  } else if (d > 0) {
    return 1; // left / counter clockwise
  } else {
    return 0; // They are on the same line.
  }
}

// Gift wrapping algorithm
export function giftWrap(points: paper.Point[]) {
  // 1. Start with a point known to be on the convex hull (i.e. the left-most point).
  let pointOnHull = points.reduce((min, p) => {
    return min.x < p.x ? min : p;
  });
  let hull: paper.Point[] = []; // Array containing the points on the hull.
  let i = 0;
  while (pointOnHull !== hull[0] && i < 10000) {
    hull.push(pointOnHull);
    let endpoint = points[0];
    for (let j = 0; j < points.length; j++) {
      let point = points[j];
      if (endpoint === pointOnHull || orientation(pointOnHull, endpoint, point) > 0) {
        endpoint = point; // Found greater left turn, update endpoint
      }
    }
    i++;
    pointOnHull = endpoint;
  }
  return hull;
}

export function grahamScan(points: paper.Point[]) {

  // Find the lowest and left-most point.
  let minIdx = 0;
  let minPoint = points[minIdx];
  for (let i = 1; i < points.length; i++) {
    let p = points[i];
    if (p.y < minPoint.y || (p.y === minPoint.y && p.x < minPoint.x)) {
      minPoint = p;
      minIdx = i;
    }
  }
  new Path.Circle({
    center: minPoint,
    radius: 10,
    fillColor: 'blue',
  });

  // Place the point in the first position
  points[0], points[minIdx] = points[minIdx], points[0];

  const compare = (p1: paper.Point, p2: paper.Point) => {
    return orientation(minPoint, p1, p2);
  }

  points.sort(compare);

  // TODO: Remove points that have the same angle. Is the just an optimization?

  // Create a stack with the first three points
  let stack = [points[0], points[1], points[2]];
  for (let i = 3; i < points.length; i++) {
    // Remove points from top while the angle makes a non-left turn
    while (true) {
      if (stack.length < 2) {
        break;
      }
      if (orientation(stack[stack.length-2], stack[stack.length-1], points[i]) === -1) {
        break;
      }
      stack.pop();
    }
    stack.push(points[i]);
  }

  console.log(stack);

  new Path({
    segments: stack,
    strokeColor: 'black',
  });

  return stack;
}