import { Point, Path } from 'paper';
import { random_points } from '$lib/point_placement';
import { giftWrap } from '$lib/convex_hull';

const giftWrappingSketch = ({ width, height }: SketchOpts) => {

  // Create the random points
  let border = 50;
  let points = random_points(20, width - border * 2, height - border * 2).map(point => point.add([border, border]))
  points.map(point => new Path.Circle({
    center: point,
    radius: 5,
    fillColor: 'red'
  }));

  // // Test to the left
  // let p1 = new Point([100, 100]);
  // let p2 = new Point([200, 50]);
  // let p3 = new Point([200, 200]);
  // let p4 = new Point([100, 200]);
  // [p1, p2, p3, p4].map(p => new Path.Circle({
  //   center: p,
  //   radius: 5,
  //   fillColor: 'blue',
  // }));

  // let vec = [p1, p3];
  // let test = p2;
  // new Path.Circle({
  //   center: test,
  //   radius: 5,
  //   fillColor: toTheLeft(vec[0], vec[1], test) > 0 ? 'green' : 'red',
  // });
  // new Path.Line({
  //   from: vec[0],
  //   to: vec[1],
  //   strokeColor: 'black',
  // });

  let hull = giftWrap(points);
  new Path({
    segments: hull,
    strokeColor: 'black',
    closed: true,
  });
}

export const giftWrapping = {
  title: 'Gift Wrapping Algorithm',
  desc: `An algorithm for find the the convex hull of a set of points. In the 2D case also known as Jarvis Match Algorithm. O(nh) where n is the
  number of points and h is the number of points on the convex hull.
  `,
  sketch: giftWrappingSketch
};