/// <reference lib="webworker" />

import { functionMaker } from './function-maker';

self.addEventListener('message', (event) => {
    const { fn, slider, length, buffer } = event.data;
    
    const func = functionMaker(fn);
    const resultArray = new Float32Array(buffer);
    
    for (let i = 0; i < length; i++) {
        resultArray[i] = func(i, slider);
    }

    // Post the buffer back to the main thread
    self.postMessage(buffer, [buffer]);
});