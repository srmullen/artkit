<script lang="ts">
  import paper from 'paper';
  import Canvas from '$lib/components/Canvas.svelte';
  import SaveButton from '$lib/components/SaveButton.svelte';
  import { sketches } from './point_placement_sketches';
  import paper_sizes from '$lib/paper_sizes';

  let sketch = sketches.find(sketch => sketch.default) || sketches[0];

  const toSVG = () => { 
    return paper.project.exportSVG({ asString: true, embedImages: false }) as string; 
  }
</script>

<div class="m-auto">
  <Canvas 
    size={sketch.paperSize || paper_sizes.a5}
    orientation={sketch.orientation || 'portrait'}
    sketch={sketch.sketch}
  />
</div>

<div class="flex justify-center mt-8">
  <select bind:value={sketch}>
    {#each sketches as sketch}
      <option value={sketch}>{sketch.title}</option>
    {/each}
  </select>
  <SaveButton {toSVG} />
</div>