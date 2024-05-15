import { functionMaker } from "./function-maker";

declare var self: AudioWorkletGlobalScope;

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

class CustomProcessor extends AudioWorkletProcessor {
    fn : (x : number, slider : number) => number
    slider = 1
    phase = 0
    constructor() {
        super();
        // @ts-expect-error
        this.fn = (x) => sin(x*pi*50)

        this.port.onmessage = (event) => {
            if (event.data.fn && typeof event.data.slider === "number") {
                try {
                    const tmpFn = functionMaker(event.data.fn) // new Function(`x, slider`, `return (${event.data.fn.replaceAll('\n', '+')})*0.1`) as (x : number, slider : number) => number
                    if (typeof tmpFn(0,0) === "number") {
                        this.fn = tmpFn
                        this.slider = event.data.slider
                        this.port.postMessage('clear')
                    } else {
                        console.log('Error: Script does not take and output a number')
                        this.port.postMessage('Error: Script does not take and output a number')
                    }
                } catch(e) {
                    console.log('Error: ' + e)
                    this.port.postMessage('Error: ' + e)
                }
            }
        };
    }

    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean {
        const output = outputs[0];

        for (let channel = 0; channel < output.length; channel++) {
            const outputChannel = output[channel];
            for (let i = 0; i < outputChannel.length; i++) {
                const time = (i + this.phase);
                outputChannel[i] = this.fn(time, this.slider);
            }
        }

        // Update the phase to account for the processed samples
        this.phase += output[0].length;

        return true;
    }
}

registerProcessor('custom-processor', CustomProcessor);