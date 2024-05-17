/// <reference lib="webworker" />

import { functionMaker } from './function-maker';
import { Globals } from './globals.svelte';


self.addEventListener('message', (event) => {
    const { fn, slider, length, buffer } = event.data;
    try {
        const func = functionMaker(fn);
        func(0,0)
        const resultArray = new Float32Array(buffer);
        
        for (let i = 0; i < length; i++) {
            resultArray[i] = func(i/Globals.SAMPLE_RATE, slider);
        }
        // Post the buffer back to the main thread
        self.postMessage(buffer, [buffer]);
    } catch(e) {
        console.log(e)
    }
});