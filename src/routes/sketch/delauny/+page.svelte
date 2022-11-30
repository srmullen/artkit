<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  // import sketch from '$lib/sketch/spirals';
  import sketch from '$lib/sketch/voronoi';
  import paper_sizes from '$lib/paper_sizes';
</script>

<svelte:head>
  <title>Delauny</title>
</svelte:head>

<h1>Delauny</h1>

<Canvas 
  size={paper_sizes.a5}
  orientation="landscape"
  {sketch}
/>