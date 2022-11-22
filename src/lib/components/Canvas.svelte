<script lang="ts">
  import { onMount } from 'svelte';
  import convert from 'convert-length';
  import paper from 'paper';
  import SaveButton from '$lib/components/SaveButton.svelte';

  export let size: PaperSize;
  export let sketch: (opts: SketchOpts) => void;
  export let orientation: 'portrait' | 'landscape' | undefined = undefined;

  let canvas: HTMLCanvasElement;
  let width: number;
  let height: number;

  let PAPER_SIZE = size.dimensions.map(n => {
    return convert(n, size.units, 'px', { pixelsPerInch: 96 });
  });

  if (orientation && orientation === 'portrait') {
    if (PAPER_SIZE[0] > PAPER_SIZE[1]) {
      PAPER_SIZE = [PAPER_SIZE[1], PAPER_SIZE[0]];
    }
  } else if (orientation && orientation === 'landscape') {
    if (PAPER_SIZE[0] < PAPER_SIZE[1]) {
      PAPER_SIZE = [PAPER_SIZE[1], PAPER_SIZE[0]];
    }
  }
  [width, height] = PAPER_SIZE;

  const toSVG = () => { 
    return paper.project.exportSVG({ asString: true, embedImages: false }) as string; 
  }

  onMount(() => {
    paper.setup(canvas);

    sketch({ width, height });
  });
</script>

<canvas 
  bind:this={canvas}
  {width} 
  {height}
></canvas>
<SaveButton {toSVG} />

<style>
  canvas {
    border: 1px solid black;
  }
</style>