<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import sketch from '$lib/sketch/locust_mural';
  import paper_sizes from '$lib/paper_sizes';
</script>

<svelte:head>
  <title>Locust Mural</title>
</svelte:head>

<h1>Locust Mural</h1>

<Canvas 
  size={paper_sizes.a4} 
  {sketch}
/>