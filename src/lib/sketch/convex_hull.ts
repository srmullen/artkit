import { Point, Path } from 'paper';
import { random_points } from '$lib/point_placement';
import { giftWrap, grahamScan } from '$lib/convex_hull';

const giftWrappingSketch = ({ width, height }: SketchOpts) => {
  // Create the random points
  let border = 50;
  let points = random_points(20, width - border * 2, height - border * 2).map(point => point.add([border, border]))
  points.map(point => new Path.Circle({
    center: point,
    radius: 5,
    fillColor: 'red'
  }));

  let hull = giftWrap(points);
  new Path({
    segments: hull,
    strokeColor: 'black',
    closed: true,
  });
}

function grahamScanSketch({ width, height }: SketchOpts) {
  let border = 50;
  let points = random_points(20, width - border * 2, height - border * 2).map(point => point.add([border, border]))
  points.map(point => new Path.Circle({
    center: point,
    radius: 5,
    fillColor: 'red'
  }));

  grahamScan(points);
}

export const sketches = [
  {
    title: 'Gift Wrapping Algorithm',
    desc: `An algorithm for find the the convex hull of a set of points. In the 2D case also known as Jarvis Match Algorithm. O(nh) where n is the
    number of points and h is the number of points on the convex hull.
    `,
    sketch: giftWrappingSketch,
  },
  {
    title: 'Graham Scan',
    desc: `Finds the convex hull of a set of points with time complexity of O(n log n). Uses a stack to detect and remove concavities in the boundary`,
    sketch: grahamScanSketch,
  }
]