<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import { sketches } from '$lib/sketch/grid_experiments';
  import paper_sizes from '$lib/paper_sizes';

  let sketch = sketches.find(sketch => sketch.default) || sketches[0];
</script>

<Canvas 
  size={sketch.paperSize || paper_sizes.a5}
  orientation={sketch.orientation || 'portrait'}
  sketch={sketch.sketch}
/>