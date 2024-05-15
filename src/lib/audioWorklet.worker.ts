// @ts-expect-error
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

class SineWaveProcessor extends AudioWorkletProcessor {
    fn : (x : number) => number
    constructor() {
        super();
        this.fn = (x) => x

        this.port.onmessage = (event) => {
            if (event.data.fn) {
                try {
                    const tmpFn =  new Function(`x`, `return ${event.data.fn.replaceAll('\n', '+')}`) as (x : number) => number
                    if (typeof tmpFn(0) === "number") {
                        this.fn = tmpFn
                        this.port.postMessage('clear')
                    } else {
                        this.port.postMessage('Error: Script does not take and output a number')
                    }
                } catch(e) {
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
                outputChannel[i] = this.fn(i)
            }
        }

        return true;
    }
}

registerProcessor('custom-processor', SineWaveProcessor);