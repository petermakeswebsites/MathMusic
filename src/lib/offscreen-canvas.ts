import CalculatorUrl from "$lib/calculator.worker?worker"

const Calculator = new CalculatorUrl()

Calculator.onmessage = ({ data }: { data: ArrayBuffer }) => {
  buffer = new Float32Array(data)
  redraw()
}

let buffer: Float32Array | undefined
let canvas: OffscreenCanvas | undefined
let canvasCircle: OffscreenCanvas | undefined
let canvasCircle2: OffscreenCanvas | undefined
let period = [0, 10] as [number, number]

onmessage = (evt: {
  data:
    | {
        canvas1: OffscreenCanvas
        canvas2: OffscreenCanvas
        canvas3: OffscreenCanvas
      }
    | { fn: string; slider: number; sampleRate: number }
    | { period: [number, number] }
    | {
        canvas: 1 | 2 | 3
        width: number
        height: number
      }
}) => {
  if ("canvas1" in evt.data) {
    // Init
    canvas = evt.data.canvas1
    canvasCircle = evt.data.canvas2
    canvasCircle2 = evt.data.canvas3
  } else if ("fn" in evt.data) {
    // Update buffer if we're init'd
    createBuffer(evt.data.sampleRate, evt.data.fn, evt.data.slider)
  } else if ("period" in evt.data) {
    // Update buffer if we're init'd
    period = evt.data.period
    redraw()
  } else if ("width" in evt.data) {
    const targetCanvas = evt.data.canvas === 1 ? canvas : evt.data.canvas === 2 ? canvasCircle : canvasCircle2
    if (!targetCanvas) return
    targetCanvas.width = evt.data.width
    targetCanvas.height = evt.data.height
    redraw()
  } else {
    console.log("dt", evt.data)
    throw new Error("Unrecognised event")
  }
}

function createBuffer(sampleRate: number, fn: string, slider: number) {
  if (sampleRate === undefined) return
  const length = sampleRate
  const buffer = new ArrayBuffer(length * Float32Array.BYTES_PER_ELEMENT)

  // Post the message to the worker with the buffer, fills the buffer and sends it back!
  const sets = { fn, slider, length, buffer }
  Calculator.postMessage(sets, [buffer])
}

let frame = 0
function redraw() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(render)
}

function render() {
  if (!canvas || !canvasCircle || !canvasCircle2) return
  if (!buffer) return
  if (!period) return
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
      Math.cos(radianForEach * index) * radiusMax * ((element + 1) / 2) + center,
      Math.sin(radianForEach * index) * radiusMax * ((element + 1) / 2) + center,
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
