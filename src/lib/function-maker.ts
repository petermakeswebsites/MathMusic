export function functionMaker(fn : string) {
    return new Function(`x, slider`, `return (${fn.replaceAll('\n', '+')})*0.1`) as (x : number, slider : number) => number
}
