<script lang="ts">
    let { buffer }: { buffer: AudioBuffer } = $props()
    let canvas: HTMLCanvasElement
    let canvasCircle: HTMLCanvasElement
    let period = $state(44000)
    
    $effect(() => {
        const ctx = canvas.getContext("2d")
        
        const ctxCircle = canvasCircle.getContext("2d")
        const radiusMax = canvasCircle.width/2
        const center = canvasCircle.width/2

        if (!ctx || !ctxCircle || !buffer) {
            return
        }
    
        const data = buffer.getChannelData(0)
    
        // Clear the canvas before drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctxCircle.clearRect(0, 0, canvasCircle.width, canvasCircle.height)
    
        ctx.beginPath()
        ctxCircle.beginPath()


        for (let index = 0; index < period && index < data.length; index++) {
            const element = data[index]
            const xpos = (canvas.width * index) / period
            const ypos = (canvas.height / 2) - ((canvas.height / 2) * element)

            const radianForEach = 2*Math.PI / period

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
        ctxCircle.stroke()
    })
    </script>
    <canvas bind:this={canvas} width="500" height="200"></canvas>
    <canvas bind:this={canvasCircle} width="200" height="200"></canvas>
<input type="range" bind:value={period} step="1" min="1" max="88000" />