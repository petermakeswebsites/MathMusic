<script lang="ts">
  import { effect$anim, effect$debounce } from "$lib/effect-anim.svelte";

    let { audioContext, node, fn }: { audioContext: AudioContext, node :AudioNode , fn : string} = $props()
    let canvas: HTMLCanvasElement
    let canvasCircle: HTMLCanvasElement
    let period = $state(1000)
    
    const analyser = audioContext.createAnalyser();
    node.connect(analyser);

    let buffer = $state<Float32Array | undefined>()

    effect$debounce(() => {
        fn;
        return () => {
            analyser.fftSize = 32768
            const bufferLength = analyser.fftSize;
            const data = new Float32Array(bufferLength)
            analyser.getFloatTimeDomainData(data)
            buffer = data
            console.log(buffer)
        }
    }, 1000)

    effect$anim(() => {
        fn
        if (!buffer) return
        const ctx = canvas.getContext("2d")
        
        const ctxCircle = canvasCircle.getContext("2d")
        const radiusMax = canvasCircle.width/2
        const center = canvasCircle.width/2

        if (!ctx || !ctxCircle) {
            return
        }

        const currentPeriod = period

        return () => {
            console.log('analysing..')
            if (!buffer) return
        
            // Clear the canvas before drawing
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctxCircle.clearRect(0, 0, canvasCircle.width, canvasCircle.height)
        
            ctx.beginPath()
            ctxCircle.beginPath()

            for (let index = 0; index < currentPeriod && index < buffer.length; index++) {
                const element = buffer[index]
                const xpos = (canvas.width * index) / currentPeriod
                const ypos = (canvas.height / 2) - ((canvas.height / 2) * element)

                const radianForEach = 2*Math.PI / currentPeriod

                const direction = [Math.cos(radianForEach*index)*radiusMax*element+center, Math.sin(radianForEach*index)*radiusMax*element+center] as const
                if (index === 0) {
                    ctx.moveTo(xpos, ypos)
                    ctxCircle.moveTo(...direction)
                } else {
                    ctx.lineTo(xpos, ypos)
                    ctxCircle.lineTo(...direction)
                }
            }


            ctx.stroke()
            ctxCircle.lineWidth=2
            ctxCircle.stroke()
        }
    })
    </script>
    <canvas bind:this={canvas} width="500" height="200"></canvas>
    <canvas bind:this={canvasCircle} width="1000" height="1000" style:width={"500px"} style:height={"500px"}></canvas>
    <br />
<input type="range" style:width={"100%"} bind:value={period} step="0.1" min="1" max="32768" />