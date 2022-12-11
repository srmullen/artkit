<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import { sketches } from '$lib/sketch/convex_hull';
  import paper_sizes from '$lib/paper_sizes';

  let sketch = sketches[1].sketch;
</script>

<Canvas 
  size={paper_sizes.a5}
  orientation="landscape"
  {sketch}
/>