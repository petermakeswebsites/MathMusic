export function responsiveCanvas(node: HTMLCanvasElement, changeTo?: (w: number, h : number) => void) {
  let resizeObserver: ResizeObserver

  const resizeCanvas = () => {
    const width = node.clientWidth * window.devicePixelRatio
    const height = node.clientHeight * window.devicePixelRatio
    changeTo?.(width, height)
  }

  resizeCanvas() // Initial resize
  resizeObserver = new ResizeObserver(resizeCanvas)
  resizeObserver.observe(node)

  return {
    destroy() {
      resizeObserver.disconnect()
    },
  }
}
