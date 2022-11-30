<script lang="ts">

  let sketches = [
    { title: 'Delauny', url: '/sketch/delauny' },
    { title: 'Spirals', url: '/sketch/spirals' }
  ]

</script>

<h1>Sketches</h1>

<ul>
  {#each sketches as sketch}
    <li><a href={sketch.url}>{sketch.title}</a></li>
  {/each}
</ul>