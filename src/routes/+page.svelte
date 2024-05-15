<script lang="ts">
  import { onMount, untrack } from "svelte";
  import Canvas from "./canvas.svelte";
  import workletUrl from "../lib/audioWorklet.worker?url"

    let audioContext = $state<AudioContext| undefined>()
    let source : AudioBufferSourceNode;
    const sampleRate = 44100*8; // Sample rate (samples per second)
    // @ts-expect-error
    globalThis.sin = (num : number) => Math.sin(num / sampleRate)
    // @ts-expect-error
    globalThis.cos = (num : number) => Math.cos(num / sampleRate)
    // @ts-expect-error
    globalThis.sum = (start : number, end : number, fn : (n : number) => number) => {
        let rtn = 0
        while (start <= end) {
            rtn += fn(start)
            start++
        }
        return rtn
    }
    // @ts-expect-error
    globalThis.exp = Math.exp
    // @ts-expect-error
    globalThis.pi = Math.PI


    let slider = $state(1)
    $effect(() => console.log(slider))


    let node = $state<AudioWorkletNode | undefined>()
    let fn = $state("sum(1,10,n => cos(n*x*pi*100)/n)")
    
    async function init() {
        audioContext = new globalThis.AudioContext();
        await audioContext.audioWorklet.addModule(workletUrl);
        node = new AudioWorkletNode(audioContext, 'custom-processor');
        node.connect(audioContext.destination);
    }

    let bufferData = [1]

    // let bufferData : AudioBuffer | Error = $derived.by(() => {
    //     try {
    //         if (!audioContext) {
    //             audioContext = new globalThis.AudioContext();
    //         }
    //         const func = new Function(`x, slider`, `return ${fn.replaceAll('\n', '+')}`)

    //         func(0)
    //         func(100)
    //         const buff = audioContext.createBuffer(channels, sampleRate * duration, sampleRate);
    //         const curr = buff.getChannelData(0)
    //         const myslider = slider
    //         for (let i = 0; i < curr.length; i++) {
    //             curr[i] = func(i, myslider)/10; 
    //         }
    //         return buff
    //     } catch(e) {
    //         return e as Error
    //     }
    // })

    $effect(() => {
        if (node) {
            source?.stop()
            if (bufferData instanceof Error) {
                throw bufferData
            }
            node.port.postMessage({ fn: fn, slider: slider });
        }
    })
</script>
<button onclick={() => init()}>play</button>
Formula:
<input type="range" bind:value={slider} step="0.01" />
    <textarea style:width={"300px"} bind:value={fn}></textarea>

    {#if audioContext && node}
    <Canvas {audioContext} {node} {fn} />
    {/if}
<!-- {#if (bufferData instanceof Error)}
<p>

    {bufferData.toString()}
</p>
{:else}
<br />

{/if}
<p>
    <br />
    <b>Usable variables: </b>
    <br />
    pi x (n in sum) <br />
    <b>Usable functions: </b>
    <br />
    sin() cos() sum(start, finish, function)<br />
    eg sawtooth: <i>sum(1,10,n => sin(n*x*pi*100)/n)</i>
</p> -->