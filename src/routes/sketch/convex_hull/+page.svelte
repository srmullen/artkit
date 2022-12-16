<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import { sketches } from '$lib/sketch/convex_hull';
  import paper_sizes from '$lib/paper_sizes';

  let sketch = sketches.find(sketch => sketch.default) || sketches[0];
</script>

<Canvas 
  size={paper_sizes.a5}
  orientation="landscape"
  sketch={sketch.sketch}
/>