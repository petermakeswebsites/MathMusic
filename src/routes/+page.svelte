<script lang="ts">
  import { untrack } from "svelte";
  import Canvas from "./canvas.svelte";
  import workletUrl from "../lib/audioWorklet.worker?url"

    let audioContext : AudioContext
    let source : AudioBufferSourceNode;
    let isPlaying = false;
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
    const duration = 10; // Duration in seconds
    const channels = 1; // Number of audio channels

    let slider = $state(1)
    $effect(() => console.log(slider))


    let fn = $state("sum(1,10,n => cos(n*x*pi*100)/n)")
    let bufferData : AudioBuffer | Error = $derived.by(() => {
        try {
            if (!audioContext) audioContext = new globalThis.AudioContext();
            const func = new Function(`x, slider`, `return ${fn.replaceAll('\n', '+')}`)

            func(0)
            func(100)
            const buff = audioContext.createBuffer(channels, sampleRate * duration, sampleRate);
            const curr = buff.getChannelData(0)
            const myslider = slider
            for (let i = 0; i < curr.length; i++) {
                curr[i] = func(i, myslider)/10; 
            }
            return buff
        } catch(e) {
            return e as Error
        }
    })
    $effect(() => {
        try {
            source?.stop()
            if (bufferData instanceof Error) {
                throw bufferData
            }
            
            source = audioContext.createBufferSource();
            source.buffer = bufferData;
            source.loop = true;
            source.connect(audioContext.destination); // Connect the source to the context's destination (the speakers)
            source.start();

            isPlaying = true;
            console.log("playing...")
        } catch(e) {
            console.log(e)
        }
    })

    function stopSound() {
        if (!isPlaying) return;

        source.stop();
        isPlaying = false;
        audioContext.close();
    }
</script>
<button onclick={() => source?.start}>play</button>
<button onclick={stopSound}>pause</button>
Formula:
<input type="range" bind:value={slider} step="0.01" />
    <textarea style:width={"300px"} bind:value={fn}></textarea>
{#if (bufferData instanceof Error)}
<p>

    {bufferData.toString()}
</p>
{:else}
<br />
<Canvas buffer={bufferData} />
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
</p>