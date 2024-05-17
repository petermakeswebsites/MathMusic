const {
  sin,
  PI: pi,
  E: e,
  cos,
  tan,
  pow,
  sqrt,
  exp,
  log10,
  log2,
  log,
  log1p,
  expm1,
  cosh,
  sinh,
  tanh,
  acosh,
  asinh,
  atanh,
  hypot,
  trunc,
  cbrt,
  round,
  abs,
  acos,
  asin,
  atan2: atan,
} = Math

const sum = (start: number, end: number, fn: (n: number) => number) => {
  let rtn = 0
  while (start <= end) {
    rtn += fn(start)
    start++
  }
  return rtn
}

export const GlobalMathList = {
  pi: {
    name: "PI (π)",
    ex: "pi",
    value: true,
  },
  e: {
    name: "Euler's number",
    ex: "e",
    value: true,
  },
  sin: {
    name: "Sine",
    ex: "sin(pi / 2)",
  },
  cos: {
    name: "Cosine",
    ex: "cos(pi)",
  },
  acos: {
    name: "Inverse cosine",
    ex: "acos(1)",
  },
  asin: {
    name: "Inverse sine",
    ex: "asin(0)",
  },
  tan: {
    name: "Tangent",
    ex: "tan(pi / 4)",
  },
  atan: {
    name: "Inverse tangent",
    ex: "atan(1, 1)",
  },
  pow: {
    name: "Power",
    ex: "pow(2, 3)",
  },
  sqrt: {
    name: "Square root",
    ex: "sqrt(9)",
  },
  exp: {
    name: "Exponential",
    ex: "exp(1)",
  },
  log10: {
    name: "Base-10 logarithm",
    ex: "log10(100)",
  },
  log2: {
    name: "Base-2 logarithm",
    ex: "log2(8)",
  },
  log: {
    name: "Natural logarithm",
    ex: "log(e)",
  },
  log1p: {
    name: "Natural logarithm of 1 + x",
    ex: "log1p(1)",
  },
  expm1: {
    name: "ex - 1",
    ex: "expm1(1)",
  },
  cosh: {
    name: "Hyperbolic cosine",
    ex: "cosh(0)",
  },
  sinh: {
    name: "Hyperbolic sine",
    ex: "sinh(0)",
  },
  tanh: {
    name: "Hyperbolic tangent",
    ex: "tanh(0)",
  },
  acosh: {
    name: "Inverse hyperbolic cosine",
    ex: "acosh(1)",
  },
  asinh: {
    name: "Inverse hyperbolic sine",
    ex: "asinh(0)",
  },
  atanh: {
    name: "Inverse hyperbolic tangent",
    ex: "atanh(0)",
  },
  hypot: {
    name: "Hypotenuse",
    ex: "hypot(3, 4)",
  },
  trunc: {
    name: "Truncate",
    ex: "trunc(4.9)",
  },
  cbrt: {
    name: "Cube root",
    ex: "cbrt(27)",
  },
  round: {
    name: "Round",
    ex: "round(4.5)",
  },
  abs: {
    name: "Absolute value",
    ex: "abs(-1)",
  },
}

export function functionMaker(fn: string) {
  return eval(`(t, slider) => { return (${fn.replaceAll("\n", "+")})*0.1 }`) as (t: number, slider: number) => number
}

/**
 * Naughty hack to get around tree shaking issue
 */
// @ts-expect-error
globalThis.mathFns = {
  sin,
  PI: pi,
  E: e,
  cos,
  tan,
  pow,
  sqrt,
  exp,
  log10,
  log2,
  log,
  log1p,
  expm1,
  cosh,
  sinh,
  tanh,
  acosh,
  asinh,
  atanh,
  hypot,
  trunc,
  cbrt,
  round,
  abs,
  acos,
  asin,
  atan,
  sum,
}
