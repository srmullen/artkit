<script lang="ts">
  import { onMount } from 'svelte';
  import convert from 'convert-length';
  import paper from 'paper';

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

  onMount(() => {
    paper.setup(canvas);

    sketch({ width, height });
  });

  $: if (paper.project) {
    paper.project.clear();

    sketch({ width, height });
  }
</script>

<canvas 
  class="mx-auto mt-8 shadow-md bg-white"
  bind:this={canvas}
  {width} 
  {height}
></canvas>
