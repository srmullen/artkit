<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import * as sketches from '$lib/sketch/convex_hull';
  import paper_sizes from '$lib/paper_sizes';

  let sketch = Object.values(sketches)[0].sketch;
</script>

<Canvas 
  size={paper_sizes.a5}
  orientation="landscape"
  {sketch}
/>