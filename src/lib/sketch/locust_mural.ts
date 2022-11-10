import paper, { Path, Point } from 'paper';
import { lerp, choose } from '$lib/utils';
import { Pens } from '$lib/pens';
import * as pens from '$lib/pens';

let palette = [
  Pens.STABILO_88_41,
  Pens.STABILO_88_32,
  Pens.STABILO_88_51,
  Pens.STABILO_88_57,
  Pens.STABILO_88_13,
  Pens.STABILO_88_59,

  Pens.STABILO_88_54,
  Pens.STABILO_88_44,
  Pens.STABILO_88_43,
  Pens.STABILO_88_33,
  Pens.STABILO_88_36,
  // Pens.STABILO_88_63,
  Pens.STABILO_88_53,

  Pens.STABILO_88_22,
  Pens.STABILO_88_45,
  Pens.STABILO_88_50,
  Pens.STABILO_88_40,
];

function randomColor() {
  return choose(palette.map(pen => pens.info(pen)!.color));
}

export default ({ width, height }: SketchOpts) => {
  drawShapes();

    function drawShapes() {
      let n_shapes = 100;
      let shapes = [];
      for (let i = 0; i < n_shapes; i++) {
        let center = new Point(lerp(0, width, Math.random()), lerp(0, height, Math.random()));
        shapes.push(randomShape(center, 25, [0.2, 2]));
      }

      for (let i = 0; i < shapes.length - 1; i++) {
        let s1 = shapes[i];
        for (let j = i + 1; j < shapes.length; j++) {
          let s2 = shapes[j];
          let intersection = s1.intersect(s2);
          intersection.set({
            fillColor: randomColor()
          });
        }
      }
    }

    // Create a random shape by rotating equal sized steps around a center point
    // and adjusting the magnitude of the vector at each step randomly.
    function randomShape(center: paper.Point, n_points = 20, range = [0.7, 1.3]) {
      let vec = new Point(50, 0);

      let points = [];
      for (let i = 0; i < n_points; i++) {
        let nv = vec.rotate(i * (360 / n_points), [0, 0]).multiply(lerp(range[0], range[1], Math.random()));
        points.push(center.add(nv));
      }
      
      return new Path({
        segments: points,
        fillColor: randomColor(),
        closed: true
      });
    }
}