import { randomInt } from 'mathjs';

export const isFunction = (f: any): f is Function => {
  return typeof f === 'function';
}

export const lerp = (x: number, y: number, a: number) => 
  x * (1 - a) + y * a;

// Cosine interpolation
export function cerp(from: number, to: number, val: number) {
  return lerp(from, to, -Math.cos(Math.PI * val) / 2 + 0.5);
}

// Smooth step interpolation
export function smoothStep(from: number, to: number, val: number) {
  return lerp(from, to, val * val * (3 - 2 * val));
}

export const clamp = (a: number, min = 0, max = 1) => 
  Math.min(max, Math.max(min, a));

export const invlerp = (x: number, y: number, a: number) => 
  clamp((a - x) / (y - x));

export const range = (x1: number, y1: number, x2: number, y2: number, a: number) => 
  lerp(x2, y2, invlerp(x1, y1, a));

export const choose = <T>(arr: T[]) => {
  return arr[randomInt(arr.length)];
}

/**
 * Return evenly spaced number over an interval inclusive of start and stop.
 **/
export const linspace = (n_steps: number, start = 0, stop = 1) => {
  let step = (stop - start) / (n_steps - 1);
  let space = [];
  for (let i = 0; i < n_steps; i++) {
    space.push(start + i * step);
  }
  return space;
}

export function radiansToDegrees (n: number) {
  return (n * 180) / Math.PI;
}

export function degreesToRadians(n: number) {
  return n * Math.PI / 180;
}

export function timer<T>(fn: (args?: any[]) => T) {
  const now = Date.now();
  const ret = fn();
  if (ret instanceof Promise) {
    ret.then(() => {
      const dur = Date.now() - now;
      console.log('Duration: ', dur);
    });
  } else {
    const dur = Date.now() - now;
    console.log('Duration: ', dur);
  }
  return ret;
}

export function processOptions (options: Record<string, any>, input?: any) {
  const ret: Record<string, any> = {};
  for (let name in options) {
    if (isFunction(options[name])) {
      ret[name] = options[name](input);
    } else {
      ret[name] = options[name];
    }
  }
  return ret;
}