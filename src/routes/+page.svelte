<script lang="ts">
  import Canvas from "./canvas.svelte"
  import workletUrl from "../lib/audio-worklet.worker?url"
  import { Globals } from "$lib/globals.svelte"
  import * as Dialog from "$lib/components/ui/dialog"

  import { Textarea } from "$lib/components/ui/textarea"
  import Switch from "$lib/components/ui/switch/switch.svelte"
  import { untrack } from "svelte"
  import Slider from "$lib/components/ui/slider/slider.svelte"
  import ErrorBox from "$lib/components/error-box.svelte"
  import { fly } from "svelte/transition"
  import Code from "$lib/components/ui/code.svelte"
  import { ScrollArea } from "$lib/components/ui/scroll-area"
  import { GlobalMathList } from "$lib/function-maker"
  import * as Table from "$lib/components/ui/table"
  import { HashManager } from "$lib/hash-change"

  const hashManager = new HashManager<string>()

  hashManager.onstatechange = newState => fn = newState

  $effect(() => {
    hashManager.state = fn
  })

  let audioContext = $state<AudioContext | undefined>()
  let slider = $state([1])
  let node = $state<AudioWorkletNode | undefined>()
  let fn = $state(
    hashManager.init ? hashManager.init : "sum(1,10,n => cos(n*t*pi*100)/n)",
  )
  let playing = $state(false)

  $effect(() => {
    if (playing) {
      untrack(() => {
        if (audioContext) {
          audioContext.resume()
        } else {
          init()
        }
      })
    } else {
      untrack(() => {
        audioContext?.suspend()
      })
    }
  })

  let error = $state<string | undefined>()

  async function init() {
    audioContext = new globalThis.AudioContext()
    audioContext.addEventListener("statechange", (d) => {
      playing = audioContext?.state === "running"
    })
    Globals.SAMPLE_RATE = audioContext.sampleRate
    await audioContext.audioWorklet.addModule(workletUrl)
    node = new AudioWorkletNode(audioContext, "custom-processor")
    node.connect(audioContext.destination)
    node.port.onmessage = (ev) => {
      error = ev.data.error
    }
  }

  let bufferData: number[] = []

  let guideOpen = $state(hashManager.init ? false : true)

  $effect(() => {
    if (node) {
      if (bufferData instanceof Error) {
        throw bufferData
      }
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
    <p class="text-sm text-muted-foreground mb-4">
      Use the
      <Code>slider</Code>
      variable in your script.
      <a
            href="#" onclick={(e) => {e.preventDefault; guideOpen = true}}
            class="font-medium text-primary underline underline-offset-4"
          >
            Find out more.
          </a>
      <Dialog.Root bind:open={guideOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>User Guide</Dialog.Title>
            <Dialog.Description>
              Write a function in javascript using <Code>t</Code> representing the
              time in seconds elapsed and <Code>slider</Code> representing the value
              of the slider from <Code>0</Code> to <Code>1</Code>. There is also
              a special <Code>sum</Code> function:
            </Dialog.Description>
            <Dialog.Description>
              <center class="my-4">
                <Code>sum(1,10,n => sin(n*x*pi*440)/n)</Code> <br />
                <span class="text-xs text-muted-foreground"
                  >Sum from 1 to 10 to make a sawtooth sound at 440hz - <a
                    href="#%22sum(1%2C10%2Cn%20%3D%3E%20sin(n*t*pi*440)%2Fn)%22"
                    onclick={(e) => { guideOpen = false; playing = true}}
                    class="font-medium text-primary underline underline-offset-4"
                  >
                    try it
                  </a>.</span
                >
              </center>
            </Dialog.Description>
            <Dialog.Description>
              <ScrollArea class="h-[300px] mt-2 w-full rounded-md border p-0">
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class="w-[200px]">Name</Table.Head>
                      <Table.Head>Example</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each Object.entries(GlobalMathList) as [code, { name, ex }]}
                      <Table.Row>
                        <Table.Cell class="font-medium">{name}</Table.Cell>
                        <Table.Cell>
                          <Code>
                            {ex}
                          </Code>
                        </Table.Cell>
                      </Table.Row>
                    {/each}
                  </Table.Body>
                </Table.Root>
              </ScrollArea>
            </Dialog.Description>
            <Dialog.Footer></Dialog.Footer>
          </Dialog.Header>
        </Dialog.Content>
      </Dialog.Root>
    </p>
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
  <Canvas slider={slider[0]} fn={fn.trim()} />
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
    </a>
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
