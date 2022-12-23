<script>
  import '../app.css';
</script>

<slot />

<style lang="postcss">
  :global(body) {
    @apply bg-slate-50;
  }
</style>