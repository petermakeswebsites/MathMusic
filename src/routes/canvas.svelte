<script lang="ts">
  import Card from "$lib/components/ui/card/card.svelte"
  import Slider from "$lib/components/ui/slider/slider.svelte"
  import { FrameRunner } from "$lib/effect-anim.svelte"
  import { onMount } from "svelte"
  import MyWorker from "../lib/calculator.worker?worker"
  import { responsiveCanvas } from "$lib/auto-canvas-size"
  let {
    fn,
    slider,
    sampleRate,
  }: { slider: number; fn: string; sampleRate: number | undefined } = $props()

  const frameRunner = new FrameRunner()

  const worker = new MyWorker()
  let buffer = $state<Float32Array | undefined>()
  worker.addEventListener("message", (event) => {
    buffer = new Float32Array(event.data)
  })

  $effect(() => {
    // Create an ArrayBuffer
    if (sampleRate === undefined) return
    const length = sampleRate
    const buffer = new ArrayBuffer(length * Float32Array.BYTES_PER_ELEMENT)

    // Post the message to the worker with the buffer
    const sets = { fn, slider, length, buffer }
    worker.postMessage(sets, [buffer])
  })

  let canvas: HTMLCanvasElement
  let canvasCircle: HTMLCanvasElement
  let canvasCircle2: HTMLCanvasElement
  let period = $state([20000, 30000])

  const redraw = () => {
    fn
    if (!buffer) return
    const ctx = canvas.getContext("2d")
    const ctxCircle = canvasCircle.getContext("2d")
    const ctxCircle2 = canvasCircle2.getContext("2d")
    const radiusMax = canvasCircle.width / 2
    const center = canvasCircle.width / 2

    if (!ctx || !ctxCircle || !ctxCircle2) {
      return
    }

    const [start, end] = period
    const periodSize = end - start
    frameRunner.fn = () => {
      if (!buffer) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctxCircle.clearRect(0, 0, canvasCircle.width, canvasCircle.height)
      ctxCircle2.clearRect(0, 0, canvasCircle.width, canvasCircle.height)

      ctx.beginPath()
      ctxCircle.beginPath()
      ctxCircle2.beginPath()

      for (let index = start; index < end && index < buffer.length; index++) {
        const element = buffer[index]
        const xpos = (canvas.width * (index - start)) / periodSize
        const ypos = canvas.height / 2 - (canvas.height / 2) * element

        const radianForEach = (2 * Math.PI) / periodSize

        const direction = [
          Math.cos(radianForEach * index) * radiusMax * element + center,
          Math.sin(radianForEach * index) * radiusMax * element + center,
        ] as const
        const direction2 = [
          Math.cos(radianForEach * index) * radiusMax * ((element + 1) / 2) +
            center,
          Math.sin(radianForEach * index) * radiusMax * ((element + 1) / 2) +
            center,
        ] as const
        if (index === 0) {
          ctx.moveTo(xpos, ypos)
          ctxCircle.moveTo(...direction)
          ctxCircle2.moveTo(...direction2)
        } else {
          ctx.lineTo(xpos, ypos)
          ctxCircle.lineTo(...direction)
          ctxCircle2.lineTo(...direction2)
        }
      }

      ctx.lineWidth = 2
      ctx.stroke()
      ctxCircle.lineWidth = 2
      ctxCircle.stroke()
      ctxCircle2.lineWidth = 2
      ctxCircle2.stroke()
    }
  }

  $effect(redraw)
</script>

<Card class="mt-2">
  <canvas use:responsiveCanvas={redraw} bind:this={canvas} class="w-full h-40"
  ></canvas>
</Card>
<div class="grid grid-cols-2 gap-2 mt-2">
  <Card>
    <canvas
      bind:this={canvasCircle}
      use:responsiveCanvas={redraw}
      class="w-full aspect-square"
    ></canvas>
  </Card>
  <Card>
    <canvas
      bind:this={canvasCircle2}
      use:responsiveCanvas={redraw}
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
