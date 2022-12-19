import paper, { Path, Color, Rectangle } from 'paper';
import { Grid, ProximityGrid } from '$lib/grid';
// @ts-ignore
import { Noise } from 'noisejs';
import { Point } from 'paper';
import { create, all } from 'mathjs';
import { random_points, random_point, relaxation_displacement, relaxation_displacement_gen, proximity_culling } from '$lib/point_placement';
import { lerp, range, timer, isFunction } from '$lib/utils';

let math = create(all, {
  randomSeed: `${Math.random()}`
});

const noise = new Noise();
noise.seed(math.random());

function gridNoiseSketch({ width, height }: SketchOpts) {
  let rate = 0.08;

  let border = 20;
  let size = 10;
  let nx = Math.floor((width - border * 2) / size);
  let ny = Math.floor((height - border * 2) / size);

  const grid = new Grid(nx, ny, (x, y) => {
    return noise.simplex2(x * rate, y * rate);
  });

  let paths = [];
  for (let { x, y } of grid.colByRow()) {
    let val = range(-1, 1, 0, 1, grid.at(x, y));
    let from = new Point([x, y]).multiply(size)
    let to = from.add([size, size]);
    let path = new Path.Rectangle({
      from,
      to,
      fillColor: new Color(val, val, val),
      // strokeColor: 'black',
    });
    path.translate([border, border]);
    paths.push(path);
  }
}

function gridRelaxationDisplacementSketch({ width, height }: SketchOpts) {
  let rate = 0.08;
  let border = 20;
  let size = 10;
  let nx = Math.floor((width - border * 2) / size);
  let ny = Math.floor((height - border * 2) / size);

  let grid = new Grid(nx, ny, (x, y) => {
    return noise.simplex2(x * rate, y * rate);
  });

  let paths = [];
  for (let { x, y } of grid.colByRow()) {
    let val = range(-1, 1, 0, 1, grid.at(x, y));
    let from = new Point([x, y]).multiply(size);
    let to = from.add([size, size]);
    let path = new Path.Rectangle({
      from, 
      to,
      fillColor: new Color(val, val, val),
    });
    path.translate([border, border]);
    paths.push(path);
  }

  let points = random_points(100, width, height);
  points = relaxation_displacement(points, (point) => {
    let x = Math.floor(((point.x - border) / size))
    let y = Math.floor(((point.y - border) / size))
    let val = grid.at(x, y);
    console.log('val: ', val);
    if (!val) {
      console.log(point.x, point.y, x, y);
    }
    return { distance: range(-1, 1, 5, 20, val) };
  });
  points.map(point => {
    new Path.Circle({
      fillColor: 'red',
      radius: 4,
      center: point,
    });
  });

}

function relaxationDisplacementOptimizationSketch({ width, height }: SketchOpts) {
  let points = random_points(500, width, height);
  let displaced = timer(() => {
    return relaxation_displacement(points, { distance: 25 });
  });
  
  let grid = new ProximityGrid(new Point(0, 0), new Point(width, height), 5);
  points.forEach(point => {
    new Path.Circle({
      center: point,
      radius: 4, 
      fillColor: 'red',
    });
  });

  displaced.forEach(point => {
    new Path.Circle({
      center: point,
      radius: 4,
      fillColor: 'blue',
      // opacity: 0.5,
    });
  });
}

function relaxationDisplacementAnimationSketch({ width, height }: SketchOpts) {
  let points = random_points(500, width, height);

  let rect = new Rectangle({
    from: [0, 0],
    to: [width, height],
  });

  let gen = relaxation_displacement_gen(
    points, 
    { distance: 50, stepDistance: 1 },
    (p) => !rect.contains(p)
  );

  let paths = points.map(point => {
    return new Path.Circle({
      center: point,
      fillColor: 'red',
      radius: 4,
    });
  });

  paper.view.onFrame = (frame: PaperAnimationFrame) => {
    let next = gen.next();
    if (next.done) {
      paths.forEach(path => {
        path.fillColor = new Color('blue');
      });
      paper.view.pause();
      return;
    }
    paths.map(path => path.remove());
    paths = next.value.map(points => {
      return new Path.Circle({
        center: points,
        radius: 4,
        fillColor: 'red',
      });
    });
  }
}

function proximityCullingSketch({ width, height }: SketchOpts) {
  let points = proximity_culling(100, 60, () => random_point([0, 0], [width, height]));

  points.forEach(point => {
    new Path.Circle({
      center: point,
      fillColor: 'red',
      radius: 5,
    });
  });
}

export const sketches: SketchDescription[] = [
  {
    title: 'Grid noise',
    sketch: gridNoiseSketch,
  },
  {
    title: 'Grid Relaxation Displacement',
    sketch: gridRelaxationDisplacementSketch,
  },
  {
    title: 'Relaxation Displacement Optimization',
    sketch: relaxationDisplacementOptimizationSketch,
  },
  {
    title: 'Relaxation Displacement Animation',
    sketch: relaxationDisplacementAnimationSketch,
  },
  {
    title: 'Proximity Culling',
    sketch: proximityCullingSketch,
    default: true,
  }
];