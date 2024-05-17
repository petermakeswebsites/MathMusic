export function effect$anim(cb : () => (void | ((timeElapsed : number) => void))) {
    $effect(() => {
        const fn = cb()
        if (!fn) return
        const frame = requestAnimationFrame(fn)
        return () => cancelAnimationFrame(frame)
    })
}

export function effect$debounce(cb : () => (void | ((timeElapsed : number) => void)), ms : number) {
    $effect(() => {
        const fn = cb()
        if (!fn) return
        const tm = setTimeout(fn, ms)
        return () => clearTimeout(tm)
    })
}

/**
 * Init synchronously in component to attach to root node. Every time you change fn,
 * it cancels the last animation frame and resets it.
 */
export class FrameRunner<T extends () => void> {
    fn = $state<T>()

    constructor() {
        $effect(() => {
            if (this.fn) {
                const ref = requestAnimationFrame(this.fn)
                return () => cancelAnimationFrame(ref)
            }
        })
    }
}