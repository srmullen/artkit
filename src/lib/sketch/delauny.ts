import { random_points, relaxation_displacement } from "$lib/point_placement";
import paper, { Point, Path } from "paper";
import { randomInt } from "mathjs";
import Voronoi from 'voronoi';
import Delaunator from 'delaunator';
import { timer, choose } from '$lib/utils';
import { giftWrap } from "$lib/convex_hull";


const voronoiSketch = ({ width, height }: SketchOpts) => {
  let points = random_points(300, width, height);

  points = relaxation_displacement(points, { stepDistance: 2, distance: 50 });

  for (let point of points) {
    new Path.Circle({
      center: point,
      radius: 5,
      fillColor: 'blue',
    });
  }

  const voronoi = new Voronoi();

  const bbox = { 
    xl: 0, 
    xr: width,
    yt: 0, 
    yb: height, 
  };

  const diagram = voronoi.compute(points, bbox);

  diagram.cells.forEach((cell: any) => {
    if (cell && cell.halfedges.length > 2) {
      const segments = cell.halfedges.map((edge: any) => edge.getEndpoint());
      const path = new Path({
        segments,
        closed: true,
        strokeColor: 'blue',
      });
    }
  });
}

/** 
 * Given a vertex of the delauny triangulation, find all the triangles it belongs to. 
 **/
const delaunyTrianglesByVertexSketch = ({ width, height }: SketchOpts) => {  
  let points = random_points(300, width, height);

  points = relaxation_displacement(points, { stepDistance: 2, distance: 20 });

  for (let point of points) {
    new Path.Circle({
      center: point,
      radius: 5,
      fillColor: 'blue',
    });
  }

  let d_points = points.map(point => [point.x, point.y]);

  let delauny = Delaunator.from(d_points);

  for (let i = 0; i < delauny.triangles.length; i += 3) {
    let coords = [
      points[delauny.triangles[i]],
      points[delauny.triangles[i + 1]],
      points[delauny.triangles[i + 2]],
    ];
    
    new Path({
      segments: coords,
      strokeColor: 'red'
    });
  }

  // - Choose a random point for testing
  const chosen = points[Math.floor(points.length/4)];
  // Brute force
  let triangles = [];
  for (let i = 0; i < delauny.triangles.length; i += 3) {
    let triangle = [
      points[delauny.triangles[i]],
      points[delauny.triangles[i + 1]],
      points[delauny.triangles[i + 2]],
    ];
    if (chosen === triangle[0] || chosen === triangle[1] || chosen === triangle[2]) {
      triangles.push(triangle);
    }
  }

  triangles.map(triangle => {
    new Path({
      segments: triangle,
      fillColor: 'orange'
    });
  })

  new Path.Circle({
    center: chosen,
    radius: 15,
    fillColor: 'green',
  });
}

/** 
 * Given a random point not part of the triangulation, find the delauny triangle that contains it. 
 **/ 
const delaunyTriangleByRandomPointSketch = ({ width, height }: SketchOpts)=> {
  window.paper = paper;
  let points = random_points(300, width, height);

  points = relaxation_displacement(points, { distance: 20, stepDistance: 2 });

  debugPoints(points);

  // Calculat delauny triangulation.
  const delauny = Delaunator.from(points.map(p => [p.x, p.y]));

  // Create a random points. Want to find which triangles contains these point.
  let chosen = random_points(5, width, height);

  // Draw the triangulation outline
  debugDelauny(delauny, points);

  let paths = chosen.map(point => {
    return new Path.Circle({
      center: point,
      fillColor: 'green',
      radius: 5,
    });
  });

  // Fill in triangles containing a chosen point
  highlightTriangles(delauny, chosen);

  function highlightTriangles(delauny: Delaunator<ArrayLike<number>>, chosen: paper.Point[]) {
    let paths = [];
    for (let i = 0; i < delauny.triangles.length; i += 3) {
      let triangle = [
        points[delauny.triangles[i]],
        points[delauny.triangles[i + 1]],
        points[delauny.triangles[i + 2]],
      ];
      if (chosen.find(point => triangleContains(triangle, point))) {
        paths.push(new Path({
          segments: triangle,
          fillColor: 'purple',
        }));
      }
    }
    return paths;
  }

  paper.view.onFrame = (frame: PaperAnimationFrame) => {
    paths.forEach(path => {
      path.translate([1, 0]);
      if (!inBounds({ top: 0, left: 0, bottom: height, right: width }, path.position)) {
        paths = paths.filter(p => p !== path);
      }
    });

    highlightTriangles(delauny, paths.map(p => p.position));

    if (!paths.length) {
      console.log('done');
      paper.view.pause();
    }
  }

  function inBounds(bounds: { top: number, left: number, bottom: number, right: number}, point: paper.Point) {
    return !(
      point.y < bounds.top || 
      point.y > bounds.bottom || 
      point.x < bounds.left || point.x > bounds.right
    );
  }
}

function shapesFromDelaunyTriangulation({ width, height }: SketchOpts) {
  let points = random_points(100, width, height);

  points = relaxation_displacement(points, { distance: 50, stepDistance: 2 });

  let delauny = Delaunator.from(points.map(p => [p.x, p.y]));

  debugDelauny(delauny, points);  

  const start = new Point(width / 2, height / 2);

  interface Triangle {
    coords: paper.Point[],
    siblings: number[],
  }

  // Create a triangles data structure.
  const triangles: Triangle[] = [];
  for (let i = 0; i < delauny.triangles.length; i+= 3) {
    let coords = [
      points[delauny.triangles[i]],
      points[delauny.triangles[i + 1]],
      points[delauny.triangles[i + 2]],
    ];

    triangles.push({ 
      coords, 
      siblings: [],
    });
  }

  // Get the triangle siblings
  for (let i = 0; i < triangles.length; i++) {
    let t1 = triangles[i];
    for (let j = i + 1; j < triangles.length; j++) {
      let t2 = triangles[j];
      if (is_sibling(t1.coords, t2.coords)) {
        t2.siblings.push(i);
        t1.siblings.push(j);
      }
      if (t1.siblings.length === 3) {
        break;
      }
    }
  }

  let n_shapes = 5
  for (let i = 0; i < n_shapes; i++) {
    // let path = createShape(triangles, randomInt(0, triangles.length));
    // // @ts-ignore
    // path.fillColor = 'purple';

    let segments = createConvexHull(triangles, randomInt(0, triangles.length));
    new Path({
      segments,
      fillColor: 'green',
    });
  }

  function createShape(tris: Triangle[], startIdx: number) {
    let shape = [startIdx]; // shape will contain the indexes of the triagles that will belong to the shape.
    for (let i = 0; i < 5; i++) {
      let tri: Triangle = tris[shape[shape.length-1]];
      let sib = choose(tri.siblings);
      if (!shape.includes(sib)) {
        shape.push(sib);
      }
    }

    let shapeTris = shape.map(idx => tris[idx]);
    // // Create the paths and then join them together
    // // Another option could be to use a convex-hull algorithm
    let paths = shapeTris.map(tri => new Path({
      segments: tri.coords,
      fillColor: 'blue',
    }));
    paths.map(path => path.translate([200, 0]))

    let path = paths.reduce((shape, path) => {
      let item = shape.unite(path);
      const ret = new Path(item.pathData);
      item.remove();
      return ret;
    });
    // @ts-ignore
    // path.fillColor = 'purple';

    // paths.forEach(path => path.translate([200, 100]));
    paths.forEach(path => path.remove());

    return path;    
  }

  function createConvexHull(tris: Triangle[], startIdx: number) {
    let shape = [startIdx]; // shape will contain the indexes of the triagles that will belong to the shape.
    // shape.push(0);
    for (let i = 0; i < 5; i++) {
      let tri: Triangle = tris[shape[shape.length-1]];
      let sib = choose(tri.siblings);
      if (!shape.includes(sib)) {
        shape.push(sib);
      }
    }

    // let shapeTris = shape.map(idx => tris[idx]);
    // let paths = shapeTris.map(tri => new Path({
    //   segments: tri.coords,
    //   fillColor: 'blue',
    // }));
    // paths.map(path => path.translate([200, 0]))

    let points = shape.reduce((acc, idx) => {
      let tri = tris[idx];
      return acc.concat(tri.coords);
    }, [] as paper.Point[]);

    return giftWrap(points);
  }

  function is_sibling(t1: paper.Point[], t2: paper.Point[]) {
    // t1 and t2 are siblings if they share two points.
    let count = 0;
    for (let p of t1) {
      if (t2.includes(p)) {
        count++;
      }
    }
    return count === 2;
  }
  
}

function debugPoints(points: paper.Point[]) {
  points.forEach(point => {
    new Path.Circle({
      center: point,
      fillColor: 'blue',
      radius: 5,
    });
  });
}

function debugDelauny(delauny: Delaunator<ArrayLike<number>>, points: paper.Point[]) {
  for (let i = 0; i < delauny.triangles.length; i += 3) {
    let triangle = [
      points[delauny.triangles[i]],
      points[delauny.triangles[i + 1]],
      points[delauny.triangles[i + 2]],
    ];

    new Path({
      segments: triangle,
      strokeColor: 'red',
    });
  }
}

function triangleArea(a: paper.Point, b: paper.Point, c: paper.Point) {
  // Area A = [ x1(y2 – y3) + x2(y3 – y1) + x3(y1-y2)]/2 
  return Math.abs(( a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2);
}

// https://www.geeksforgeeks.org/check-whether-a-given-point-lies-inside-a-triangle-or-not/
function triangleContains(triangle: paper.Point[], p: paper.Point) {
  let tolerance = 0.00000001;
  let a = triangle[0];
  let b = triangle[1];
  let c = triangle[2];
  let abc = triangleArea(a, b, c);
  let pab = triangleArea(p, a, b);
  let pbc = triangleArea(p, b, c);
  let pac = triangleArea(p, a, c);
  return ((pab + pbc + pac) - abc) < tolerance;
}

// export default voronoiSketch;
// export default delaunyTrianglesByVertexSketch;
// export default delaunyTriangleByRandomPointSketch;
export default shapesFromDelaunyTriangulation;