<script lang="ts">
  import Canvas from "./canvas.svelte"
  import workletUrl from "../lib/audio-worklet.worker?worker&url"

  import { Textarea } from "$lib/components/ui/textarea"
  import Switch from "$lib/components/ui/switch/switch.svelte"
  
  import Slider from "$lib/components/ui/slider/slider.svelte"
  import ErrorBox from "$lib/components/error-box.svelte"
  import { fly } from "svelte/transition"

  import { HashManager } from "$lib/hash-change"
  import Description from "./description.svelte"

  const hashManager = new HashManager<{ fn: string }>()
  hashManager.onstatechange = (newState) => (fn = newState.fn)

  $effect(() => {
    hashManager.state = { fn }
  })

  let audioContext = $state<AudioContext | undefined>()
  let slider = $state([1])
  let node = $state<AudioWorkletNode | undefined>()
  let fn = $state(
    hashManager.init?.fn
      ? hashManager.init.fn
      : "sum(1,10,n => cos(n*t*pi*100)/n)",
  )
  let playing = $state(false)

  $effect(() => {
    if (!audioContext) {
      init()
    } else {
      if (playing) {
        audioContext.resume()
      } else {
        audioContext.suspend()
      }
    }
  })

  let error = $state<string | undefined>()

  async function init() {
    audioContext = new globalThis.AudioContext()
    audioContext.addEventListener("statechange", () => {
      playing = audioContext?.state === "running"
    })
    await audioContext.audioWorklet.addModule(workletUrl)
    node = new AudioWorkletNode(audioContext, "custom-processor")
    node.connect(audioContext.destination)
    node.port.onmessage = (ev) => {
      error = ev.data.error
    }
  }

  // Guide is open automatically if no hash to start with
  let guideOpen = $state(hashManager.init ? false : true)

  $effect(() => {
    if (node) {
      node.port.postMessage({ fn: fn.trim(), slider: slider[0] })
    }
  })
</script>

<div class="flex gap-4">
  <div class="w-full relative block">
    <Slider
      bind:value={slider}
      min={0}
      max={1}
      step={0.001}
      class="mt-4 mb-2"
    />
    <Description bind:playing bind:guideOpen />
  </div>
  <div class="flex items-center h-fit gap-2 relative">
    Play
    <div class="mt-2 relative">
      <Switch bind:checked={playing} class={playing ? "" : "pulsing"} />
    </div>
  </div>
</div>
<Textarea bind:value={fn} class={error ? "focus:ring-offset-red-400" : ""} />
{#if error}
  <div class="fixed right-0 bottom-0 p-4">
    <div transition:fly>
      <ErrorBox {error} />
    </div>
  </div>
{/if}

{#if fn !== undefined}
  <Canvas
    slider={slider[0]}
    fn={fn.trim()}
    sampleRate={audioContext?.sampleRate}
  />
{/if}

<center class="mt-4">
  <p class="text-sm text-muted-foreground mb-4">
    Created by
    <a
      href="https://petermakeswebsites.co.uk"
      target="_blank"
      class="font-medium text-primary underline underline-offset-4"
    >
      Pete
    </a> <span class="text-xs">/ 0.4</span>
  </p>
</center>

<style>
  :global(.pulsing) {
    position: relative;
    animation: pulse-animation 2s infinite;
  }

  @keyframes pulse-animation {
    0% {
      box-shadow: 0 0 0 0 hsl(0, 90.8%, 20%);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(255, 82, 82, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
    }
  }
</style>
