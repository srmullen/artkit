<script lang="ts">
  import { onMount } from 'svelte';
  import convert from 'convert-length';
  import paper from 'paper';

  export let size: [number, number];
  export let sketch: (opts: SketchOpts) => void;

  let canvas: HTMLCanvasElement;

  const PAPER_SIZE = size.map(n => {
    return convert(n, 'in', 'px', { pixelsPerInch: 96 });
  });
  const [width, height] = PAPER_SIZE;

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

<style>
  canvas {
    border: 1px solid black;
  }
</style>