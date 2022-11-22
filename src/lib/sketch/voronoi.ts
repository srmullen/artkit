import { random_points, relaxation_displacement } from "$lib/point_placement";
import { Point, Path } from "paper";
import Voronoi from 'voronoi';
import Delaunator from 'delaunator';
import { timer } from '$lib/utils';

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
  let points = random_points(300, width, height);

  points = relaxation_displacement(points, { distance: 20, stepDistance: 2 });

  // Draw the points
  for (let point of points) {
    new Path.Circle({
      center: point,
      radius: 5,
      fillColor: 'blue'
    });
  }

  // Calculat delauny triangulation.
  const delauny = Delaunator.from(points.map(p => [p.x, p.y]));

  // Create a random points. Want to find which triangles contains these point.
  let chosen = random_points(5, width, height);

  // Draw the triangulation
  for (let i = 0; i < delauny.triangles.length; i += 3) {
    let triangle = [
      points[delauny.triangles[i]],
      points[delauny.triangles[i + 1]],
      points[delauny.triangles[i + 2]],
    ];

    if (chosen.find(point => triangleContains(triangle, point))) {
      new Path({
        segments: triangle,
        strokeColor: 'red',
        fillColor: 'purple',
      });
    } else {
      new Path({
        segments: triangle,
        strokeColor: 'red',
      });
    }
  }

  chosen.forEach(point => {
    new Path.Circle({
      center: point,
      fillColor: 'green',
      radius: 5,
    });
  });

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

}

// export default voronoiSketch;
// export default delaunyTrianglesByVertexSketch;
export default delaunyTriangleByRandomPointSketch;