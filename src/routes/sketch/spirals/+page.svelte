<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import sketch from '$lib/sketch/spirals';
  // import sketch from '$lib/sketch/voronoi';
  import paper_sizes from '$lib/paper_sizes';
</script>

<svelte:head>
  <title>Spirals</title>
</svelte:head>

<h1>Spirals</h1>

<Canvas 
  size={paper_sizes.a4}
  orientation="portrait"
  {sketch}
/>