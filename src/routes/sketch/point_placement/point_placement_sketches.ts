import paper, { Path, Color, Rectangle } from 'paper';
import { Grid, ProximityGrid } from '$lib/grid';
// @ts-ignore
import { Noise } from 'noisejs';
import { Point } from 'paper';
import { create, all } from 'mathjs';
import { random_points, random_point, relaxation_displacement, relaxation_displacement_gen, proximity_culling, poisson_disc } from '$lib/point_placement';
import { timer } from '$lib/utils';

let math = create(all, {
  randomSeed: `${Math.random()}`
});

const noise = new Noise();
noise.seed(math.random());

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

function poissonDiscSketch({ width, height }: SketchOpts) {
  let points = poisson_disc(20, 30, width, height);

  points.forEach(point => {
    new Path.Circle({
      center: point,
      radius: 2,
       fillColor: 'red',
    });
  });
}

export const sketches: SketchDescription[] = [
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
  },
  {
    title: 'Poisson Disc',
    sketch: poissonDiscSketch,
    default: true,
  }
];