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
