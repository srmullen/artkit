<script lang="ts">
  import Canvas from '$lib/components/Canvas.svelte';
  import sketch from '$lib/sketch/locust_mural';
</script>

<svelte:head>
  <title>Locust Mural</title>
</svelte:head>

<h1>Artkit</h1>

<Canvas 
  size={[8.5, 5.5]} 
  {sketch}
/>