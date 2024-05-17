<script lang="ts">
  import Card from "$lib/components/ui/card/card.svelte"
  import Slider from "$lib/components/ui/slider/slider.svelte"
  import { FrameRunner } from "$lib/effect-anim.svelte"
  import { responsiveCanvas } from "$lib/auto-canvas-size"
  import { onMount } from "svelte"
  import OffscreenCanvas from "$lib/offscreen-canvas?worker&url"
  let {
    fn,
    slider,
    sampleRate,
  }: { slider: number; fn: string; sampleRate: number | undefined } = $props()

  $effect(() => {
    // Create an ArrayBuffer
  })

  let canvas: HTMLCanvasElement
  let canvasCircle: HTMLCanvasElement
  let canvasCircle2: HTMLCanvasElement
  let period = $state([20000, 30000])
  const worker = new Worker(OffscreenCanvas, {type: "module"})

  onMount(() => {
    const canvas1 = canvas.transferControlToOffscreen()
    const canvas2 = canvasCircle.transferControlToOffscreen()
    const canvas3 = canvasCircle2.transferControlToOffscreen()
    // Init
    worker.postMessage({ canvas1, canvas2, canvas3 }, [
      canvas1,
      canvas2,
      canvas3,
    ])
  })

  $effect(() => {
    if (sampleRate != undefined) {
      worker.postMessage({ fn, slider, sampleRate })
    }
  })

  $effect(() => {
    worker.postMessage({period: $state.snapshot(period)})
  })

  function redraw(canvas: 1 | 2 | 3, width: number, height: number) {
    worker.postMessage({ canvas, width, height })
  }
</script>

<Card class="mt-2">
  <canvas
    use:responsiveCanvas={(w, h) => redraw(1, w, h)}
    bind:this={canvas}
    class="w-full h-40"
  ></canvas>
</Card>
<div class="grid grid-cols-2 gap-2 mt-2">
  <Card>
    <canvas
      bind:this={canvasCircle}
      use:responsiveCanvas={(w, h) => redraw(2, w, h)}
      class="w-full aspect-square"
    ></canvas>
  </Card>
  <Card>
    <canvas
      bind:this={canvasCircle2}
      use:responsiveCanvas={(w, h) => redraw(3, w, h)}
      class="w-full aspect-square"
    ></canvas>
  </Card>
</div>

<br />
{#if sampleRate}
  <p class="text-sm text-muted-foreground mb-4">
    Change the viewing range of the graphs between 0 seconds (min) and 1 second
    (max)
  </p>
  <!-- <Slider bind:value={period} step={1} min={1} max={32768} /> -->
  <Slider bind:value={period} step={1} min={0} max={sampleRate} />
{/if}
