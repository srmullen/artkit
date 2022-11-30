// Test that point is to the left of the vector from->to,
function toTheLeft(from: paper.Point, to: paper.Point, point: paper.Point) {
  // https://math.stackexchange.com/questions/274712/calculate-on-which-side-of-a-straight-line-is-a-given-point-located
  let d = (point.x - from.x) * (to.y - from.y) - (point.y - from.y) * (to.x - from.x);
  if (d < 0) {
    return -1;
  } else if (d > 0) {
    return 1
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
      if (endpoint === pointOnHull || toTheLeft(pointOnHull, endpoint, point) > 0) {
        endpoint = point; // Found greater left turn, update endpoint
      }
    }
    i++;
    pointOnHull = endpoint;
  }
  return hull;
}