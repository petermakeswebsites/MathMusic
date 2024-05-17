export function responsiveCanvas(node: HTMLCanvasElement, rerun? : () => void) {
    let resizeObserver: ResizeObserver;

    const resizeCanvas = () => {
        node.width = node.clientWidth * window.devicePixelRatio;
        node.height = node.clientHeight * window.devicePixelRatio;
        rerun?.()
    };

    resizeCanvas(); // Initial resize
    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(node);

    return {
        destroy() {
            resizeObserver.disconnect();
        }
    }
}
