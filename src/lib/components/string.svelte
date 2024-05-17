<script lang="ts">
    let {fn = $bindable()} : {fn : string} = $props()
    import { onMount } from "svelte";
    let canvas : HTMLCanvasElement

    const point1 = $state([0, 150] as const)
    const point2 = $state([400, 150] as const)
    let thirdPoint = $state<readonly [number, number] | undefined>()
    let ctx = $state<CanvasRenderingContext2D | undefined>()
    onMount(() => {
        ctx = canvas.getContext("2d")!
    })

    $effect(() => {
        if (!ctx || !thirdPoint) return
        ctx.clearRect(0,0, canvas.width, canvas.height)
        ctx.beginPath()
        ctx.moveTo(...point1)
        ctx.lineTo(...thirdPoint)
        ctx.lineTo(...point2)
        ctx.stroke()
        ctx.closePath()
    })

    let isDown = false
    function moving(e : PointerEvent) {
        if (!isDown) return
        const {x,y} = canvas.getBoundingClientRect()
        thirdPoint = [e.clientX - x, e.clientY - y] as const
    }
    function up(e : PointerEvent) {
        canvas.releasePointerCapture(e.pointerId)
        isDown = false
    }
    function down(e : PointerEvent) {
        isDown = true
        canvas.setPointerCapture(e.pointerId)
    }
</script>
<canvas width="500" height="300" bind:this={canvas} onpointermove={moving} onpointerdown={down} onpointerup={up}>

</canvas>