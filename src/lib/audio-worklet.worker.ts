import { functionMaker } from "./function-maker"

declare var self: AudioWorkletGlobalScope

class CustomProcessor extends AudioWorkletProcessor {
  fn: (x: number, slider: number) => number
  slider = 1
  phase = 0
  fadeDuration = sampleRate // Number of samples to fade over (e.g., 1 second at 44100 samples per second)
  fadeProgress = 0
  lastBit: number = 0
  changed = 0

  constructor() {
    super()
    this.fn = (x) => Math.sin(x * Math.PI * 50)

    this.port.onmessage = (event) => {
      if (event.data.fn && typeof event.data.slider === "number") {
        try {
          const fn = functionMaker(event.data.fn) // new Function(`x, slider`, `return (${event.data.fn.replaceAll('\n', '+')})*0.1`) as (x : number, slider : number) => number
          if (typeof fn(5, 5) === "number") {
            this.fn = fn
            this.slider = event.data.slider
            this.changed = 5
            this.phase = 0
            this.port.postMessage({ error: undefined })
          } else {
            console.log("Error: Script does not take and output a number")
            this.port.postMessage({
              error: "Error: Script does not take and output a number",
            })
          }
        } catch (e) {
          this.port.postMessage({ error: "" + e })
        }
      }
    }
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const output = outputs[0]
    const outputChannel = output[0]
    if (!this.changed) {
      for (let i = 0; i < outputChannel.length; i++) {
        const time = i + this.phase
        outputChannel[i] = this.fn(time / sampleRate, this.slider)
      }
    } else {
      const firstBitOfNextProcess = this.fn(
        (this.changed * outputChannel.length + this.phase) / sampleRate,
        this.slider,
      )
      const delta = firstBitOfNextProcess - this.lastBit
      for (let i = 0; i < outputChannel.length; i++) {
        outputChannel[i] =
          this.lastBit + (delta * (i / outputChannel.length)) / this.changed
      }
      this.changed--
    }

    // Update the phase to account for the processed samples
    this.phase += outputChannel.length
    this.lastBit = outputChannel[outputChannel.length - 1]

    // // Check processing time
    // const processingTime = performance.now() - startTime;
    // if (processingTime > (output[0].length / sampleRate) * 1000) {
    //     console.warn('Processing is too slow, skipping frames');
    //     return false; // Skip further processing
    // }

    return true
  }
}

registerProcessor("custom-processor", CustomProcessor)
