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