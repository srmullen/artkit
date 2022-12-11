// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface PageData {}
	// interface Error {}
	// interface Platform {}
}


declare module 'convert-length';
declare module 'voronoi';

interface SketchOpts {
  width: number,
  height: number,
}

interface PaperSize {
	units: string,
	dimensions: number[],
}

interface PaperAnimationFrame {
	delta: number,
	time: number,
	counter: number,
}

interface SketchDescription {
	paperSize?: PaperSize,
	orientation?: 'landscape' | 'portrait',
	title?: string,
	desc?: string,
	sketch: (opts: SketchOpts) => void,
}