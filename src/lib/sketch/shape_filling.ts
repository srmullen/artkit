import { Point, Path } from 'paper';
import paper_sizes from '$lib/paper_sizes';
import { hatch, hatch_points } from '$lib/hatch';
import { Pens, withPen} from '$lib/pens';

type Coords = [paper.Point, paper.Point, paper.Point];

// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
export function intersects (a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};

// Fill the triangle by drawing smaller triangles within the triangle. 
// Could be generalized to other shapes.
function triangleFillSketchConvergence({ width, height }: SketchOpts) {
  let triangles: Coords[] = [
    [ // Right
      new Point(width * 0.25 - 75, height / 2 - 75),
      new Point(width * 0.25 - 75, height / 2 + 75),
      new Point(width * 0.25 + 75, height / 2 + 75),
    ],
    [ // Acute
      new Point(width * 0.5, height / 2 - 75),
      new Point(width * 0.5 - 75, height / 2 + 75),
      new Point(width * 0.5 + 75, height / 2 + 75),
    ],
    [ // Obtuse
      new Point(width * 0.75 + 75, height / 2 - 75),
      new Point(width * 0.75 - 75, height / 2 + 75),
      new Point(width * 0.75 + 50, height / 2 + 50),
    ],
  ];

  for (let triangle of triangles) {
    // Can use different convergence points. This is just a good place to start testing.
    // The `path.position` is the center of the shapes bounding box. Not neccessarily what would
    // be considered the center of the shape. 
    // Another option for the convergence point would be the point and triangle coordinates are equidistant from.
    // let convergencePoint = path.position;

    let convergencePoint = triangleCentriod(...triangle);

    new Path.Circle({
      center: convergencePoint,
      radius: 5,
      fillColor: 'red',
    });

    fillTriangleConvergence(triangle, convergencePoint);
  }

  function fillTriangleConvergence(triangle: Coords, convergencePoint: paper.Point, n_steps = 20) {
    let paths = [];
    for (let i = 0; i < n_steps; i++) {
      let coords = triangle.map(point => {
        let vec = convergencePoint.subtract(point);
        let step = vec.normalize().multiply((vec.length / n_steps) * i);
        return point.add(step);
      });
      paths.push(new Path({
        segments: coords,
        strokeColor: 'black',
        closed: true,
      }));
    }
    return paths;
  }

  // Returns the point that is the average of the three points.
  // This method doesn't work for polygons larger than 3 sides.
  function triangleCentriod(p1: paper.Point, p2: paper.Point, p3: paper.Point) {
    return new Point(
      (p1.x + p2.x + p3.x) / 3,
      (p1.y + p2.y + p3.y) / 3,
    );
  }
}

function triangleFillZigZag({ width, height}: SketchOpts) {
  let triangles: Coords[] = [
    [ // Right
      new Point(width * 0.25 - 75, height / 2 - 75),
      new Point(width * 0.25 - 75, height / 2 + 75),
      new Point(width * 0.25 + 75, height / 2 + 75),
    ],
    [ // Acute
      new Point(width * 0.5, height / 2 - 75),
      new Point(width * 0.5 - 75, height / 2 + 75),
      new Point(width * 0.5 + 75, height / 2 + 75),
    ],
    [ // Obtuse
      new Point(width * 0.75 + 75, height / 2 - 75),
      new Point(width * 0.75 - 75, height / 2 + 75),
      new Point(width * 0.75 + 50, height / 2 + 50),
    ],
  ];

  let triangle = triangles[1];
  let outline = new Path({
    visible: false,
    segments: triangle,
    closed: true,
  });
  
  // hatch(outline, { stepSize: 10, wobble: 0, angle: -45, pen: Pens.BLACK });
  let points = hatch_points(outline, { stepSize: 5, angle: -14, pen: Pens.BLACK });
  new Path({
    segments: points,
    strokeColor: 'black',
  });

  // let star = new Path.Star({
  //   center: [ width/2, height/ 2],
  //   strokeColor: 'black',
  //   points: 7,
  //   radius1: 50,
  //   radius2: 100,
  // });

  // let points = hatch_points(star, { stepSize: 10, wobble: 0, angle: -4, pen: Pens.BLACK });
  // new Path({
  //   segments: points,
  //   strokeColor: 'black',
  // });
}

export const sketches: SketchDescription[] = [
  {
    title: 'Triangle Fill Convergence',
    paperSize: paper_sizes.a5,
    orientation: 'landscape',
    sketch: triangleFillSketchConvergence,
  },
  {
    title: 'Triangle Fill ZigZag',
    paperSize: paper_sizes.a5,
    orientation: 'landscape',
    sketch: triangleFillZigZag,
  }
];