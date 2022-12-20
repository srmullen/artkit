import { Point } from 'paper';
import { random } from 'mathjs';

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