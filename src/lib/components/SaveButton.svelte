<script lang="ts">
  import pako from 'pako';

  export let toSVG: () => string;

  async function saveAsSvg() {
    const svg = toSVG();
    const content = pako.deflate(svg);
    const res = await fetch('/api/save/test.svg', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/svg+xml',
      },
      body: content
    });
  }
</script>

<button on:click={saveAsSvg}>Save as SVG</button>