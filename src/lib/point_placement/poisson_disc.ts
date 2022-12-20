import { Point } from 'paper';
import { random_point } from './random';
import { random } from 'mathjs';
import { choose } from '$lib/utils';

// https://www.jasondavies.com/poisson-disc/

// Bridson's algorithm - https://sighack.com/post/poisson-disk-sampling-bridsons-algorithm
// https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph07-poissondisk.pdf
export function poisson_disc(radius: number, k: number, width: number, height: number, sentinel = Infinity) {
  let N = 2; // Dimensions
  let points: paper.Point[] = [];
  let active: paper.Point[] = [];

  // Create a grid of square for quick lookup of nearby points.
  // Cell size is radius / sqrt(N).
  // Cell size is chosen so that there can be at most one point per cell.
  const cellSize = radius / Math.sqrt(N);
  let grid: paper.Point[][] = [];
  let nx = Math.ceil(width/cellSize) + 1;
  let ny = Math.ceil(height/cellSize) + 1;
  console.log({ nx, ny });
  for (let x = 0; x < nx; x++) {
    grid.push([]);
  }

  function insertPoint(point: paper.Point) {
    let x = Math.floor(point.x / cellSize);
    let y = Math.floor(point.y / cellSize);
    grid[x][y] = point;
  }

  function isValidPoint(point: paper.Point) {
    if (point.x < 0 || point.x > width || point.y < 0 || point.y > height) {
      return false;
    }

    // Check neighboring cells
    let xind = Math.floor(point.x / cellSize);
    let yind = Math.floor(point.y / cellSize);
    let i0 = Math.max(xind - 1, 0);
    let i1 = Math.min(xind + 1, nx - 1);
    let j0 = Math.max(yind - 1, 0);
    let j1 = Math.min(yind + 1, ny - 1);
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        let exists = grid[i][j];
        if (exists && point.getDistance(exists) < radius) {
          return false;
        }
      }
    }
    return true;
  }

  let p0 = random_point([0, 0], [width, height]);

  insertPoint(p0);
  points.push(p0);
  active.push(p0);

  let i = 0;
  while (active.length && i < sentinel) {
    i++;
    // Uniformly select a random active point.
    let point = choose(active);
    // Try up to k times to find a point that satisfies...
    // 1. It is between r and 2r distance from point
    // 2. It is at a distance > r for all other points.
    let found = false;
    for (let i = 0; i < k; i++) {
      // create the new point
      let theta = random(360);
      let r = random(radius, 2 * radius);
      let vec = new Point({
        length: r,
        angle: theta,
      });
      let candidate = point.add(vec);
      // Test that the point meets the criteria
      if (!isValidPoint(candidate)) {
        continue;
      }

      // Add the point
      points.push(candidate);
      active.push(candidate);
      insertPoint(candidate);
      found = true;
      break;
    }

    if (!found) {
      active = active.filter(p => p !== point);
    }
  }

  return points;
}