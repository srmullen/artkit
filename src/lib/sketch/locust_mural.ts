import { Path, Point, CompoundPath } from 'paper';
import { lerp, cerp, invlerp, smoothStep, range, choose, linspace, radiansToDegrees } from '$lib/utils';
import { Pens } from '$lib/pens';
import * as pens from '$lib/pens';
import { Grid } from '$lib/grid';
import * as math from 'mathjs';

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

const randomShapes = ({ width, height }: SketchOpts) => {
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

// Change size of random shape based on width/ height on the canvas.
const varySize = ({ width, height }: SketchOpts) => {

  let n_shapes = 200;

  let shapes = [];
  for (let i = 0; i < n_shapes; i++) {
    let center = new Point(lerp(0, width, Math.random()), lerp(0, height, Math.random()));
    shapes.push(randomShape(center, range(0, height, 10, 70, center.y)));
  }

  function randomShape(center: paper.Point, radius = 50, range = [0.7, 1.3]) {
    let vec = new Point(radius, 0);
    let n_points = 20;

    let segments = [];
    for (let i = 0; i < n_points; i++) {
      let nv = vec.rotate(i * (360 / n_points), [0, 0]).multiply(lerp(range[0], range[1], Math.random()));
      segments.push(center.add(nv));
    }

    return new Path({
      segments,
      fillColor: randomColor(),
      closed: true,
    });
  }
}

const createGridSketch = ({ width, height }: SketchOpts) => {
  let nx = 40;
  let ny = 60;
  let x_step = width / nx;
  let y_step = height / ny;

  let grid = new Grid(nx, ny, (i, j) => {
    let x = i * x_step;
    let y = j * y_step;
    return new Point(x, y).add([x_step / 2, y_step / 2]);
  });

  for (let { x, y, idx } of grid.zigZagCols()) {
    let point = grid.at(x, y);
    new Path.Circle({
      center: point,
      fillColor: ['red', 'green', 'blue', 'orange'][idx % 4],
      radius: lerp(2, 10, point.y / height),
      // radius: cerp(2, 10, point.y / height),
      // radius: smoothStep(2, 10, point.y / height),
    });
  }
}

const spiralCircleSketch = ({ width, height }: SketchOpts) => {

  const createGrid = (nx: number, ny: number) => {
    let xs = linspace(nx);
    let ys = linspace(ny);
  
    let grid = [];
  
    for (let x of xs) {
      let col = [];
      for (let y of ys) {
        col.push([x, y]);
      }
      grid.push(col);
    }
  
    return grid;
  }

  let grid = createGrid(15, 25);

  let border  = 50;

  for (let i = 0; i < grid.length; i++) {
    let col = grid[i];
    for (let j = 0; j < col.length; j++) {
      let point = new Point(col[j]).multiply([width - border * 2, height - border * 2]).add(border);
      spiral(point, { 
        inner: math.random(2, 5), 
        rotations: math.random(3, 7), 
        diff: math.random(2, 4),
        color: randomColor(),
      });
    }
  }

  function spiral(center: paper.Point, opts: { inner: number, diff: number, rotations: number, color: string | paper.Color }) {
    let vec = new Point(opts.inner, 0);

    let steps = 20; // Number of steps it takes to make one full rotation.
    // let diff = 2;

    let segments = [];
    for (let i = 0; i < steps * opts.rotations; i++) {
      let nv = vec.rotate(i * (360 / steps), [0, 0]).multiply(1 + i * (opts.diff / steps));
      segments.push(center.add(nv));
    }

    let path = new Path({
      segments,
      strokeColor: opts.color,
    });

    path.smooth();
    path.simplify();

    return path;
  }
}

// Rotate spiral.
// Create all the points in a straigt line from the center point.
// Then rotate them around the center so they are no longer in a straight line.

const pointRotationCircleSketch = ({ width, height }: SketchOpts) => {
  
  function mySpiral() {
    let center = new Point(width / 2, height / 2);

    let radius = 200;
    let n_points = radius / 5;
    let n_steps = 20;

    let points: paper.Point[] = [];
    for (let i = 0; i < n_points; i++) {
      let point = center.add([cerp(0, radius, i / n_points), 0]);
      points.push(point);
    }

    for (let i = 0; i < n_steps; i++) {
      let next = [];
      for (let j = 0; j < points.length; j++) {
        let point = points[j];
        let vec = point.subtract(center);
        let mag = vec.length;
        let angle = radiansToDegrees(Math.atan(Math.tan((radius / 10) / mag)));
        next[j] = point.rotate(angle, center);
      }
      points = next;
    }

    new Path({
      segments: points,
      strokeColor: 'red'
    });
  }

  // https://stackoverflow.com/questions/6824391/drawing-a-spiral-on-an-html-canvas-using-javascript
  function archimedeanSpiral(center: paper.Point, radius = 20, density = 1) {
    // let center = new Point(width / 2, height / 2);
    let points = [];
    let dist = 0;
    // let radius = 100;
    let i = 0;
    while(dist < radius && i < 10000) {
      let angle = 0.1 * i;
      let x = (angle) * Math.cos(angle);
      let y = (angle) * Math.sin(angle);
      let point = center.add([x / density, y / density]);
      dist = point.subtract(center).length;
      points.push(point);
      i++;
    }

    // new Path.Circle({
    //   center,
    //   radius,
    //   strokeColor: 'blue',
    // });

    return new Path({
      segments: points,
      strokeColor: 'red',
    });
  }

  let border = 50;
  let nx = 20;
  let diam = (width - border * 2) / nx;
  let radius = diam / 2;
  let ny = Math.floor((height - border * 2) / diam);

  let grid = new Grid(nx, ny, (col, row) => {
    let x = col * diam;
    let y = row * diam;
    return new Point(x, y).add((radius / 2) + border);
  });

  let paths = [];
  for (let { x, y, idx } of grid.rowByCol()) {
    let point = grid.at(x, y);
    paths.push(archimedeanSpiral(point, radius, range(0, nx * ny, 0.1, 2.5, idx)));
    // paths.push(archimedeanSpiral(point, radius, cerp(0.1, 2.5, invlerp(0, nx * ny, idx))))
  }
}

// export default randomShapesSketch;
// export default varySizeSketch;
// export default createGridSketch;
// export default spiralCircleSketch;
export default pointRotationCircleSketch;
