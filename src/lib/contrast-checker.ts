export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function rgbToOklch(r: number, g: number, b: number): string {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const rLinear = rNorm <= 0.04045 ? rNorm / 12.92 : Math.pow((rNorm + 0.055) / 1.055, 2.4)
  const gLinear = gNorm <= 0.04045 ? gNorm / 12.92 : Math.pow((gNorm + 0.055) / 1.055, 2.4)
  const bLinear = bNorm <= 0.04045 ? bNorm / 12.92 : Math.pow((bNorm + 0.055) / 1.055, 2.4)

  const l = 0.4122214708 * rLinear + 0.5363325363 * gLinear + 0.0514459929 * bLinear
  const m = 0.2119034982 * rLinear + 0.6806995451 * gLinear + 0.1073969566 * bLinear
  const s = 0.0883024619 * rLinear + 0.2817188376 * gLinear + 0.6299787005 * bLinear

  const lCube = Math.cbrt(l)
  const mCube = Math.cbrt(m)
  const sCube = Math.cbrt(s)

  const L = 0.2104542553 * lCube + 0.793617785 * mCube - 0.0040720468 * sCube
  const a = 1.9779984951 * lCube - 2.428592205 * mCube + 0.4505937099 * sCube
  const bVal = 0.0259040371 * lCube + 0.7827717662 * mCube - 0.808675766 * sCube

  const lightness = L
  const chroma = Math.sqrt(a * a + bVal * bVal)
  let hue = Math.atan2(bVal, a) * (180 / Math.PI)
  if (hue < 0) hue += 360

  return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(3)})`
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rNorm, gNorm, bNorm] = [r, g, b].map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm
}

export function getContrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function checkContrastCompliance(colorHex: string): {
  contrastWithWhite: number
  contrastWithBlack: number
  contrastWithBackground: number
  passesAAWhite: boolean
  passesAABlack: boolean
  passesAABackground: boolean
  passesAAAWhite: boolean
  passesAAABlack: boolean
  recommendedForeground: 'white' | 'black'
  isAccessible: boolean
} {
  const rgb = hexToRgb(colorHex)
  if (!rgb) {
    return {
      contrastWithWhite: 0,
      contrastWithBlack: 0,
      contrastWithBackground: 0,
      passesAAWhite: false,
      passesAABlack: false,
      passesAABackground: false,
      passesAAAWhite: false,
      passesAAABlack: false,
      recommendedForeground: 'white',
      isAccessible: false,
    }
  }

  const white = { r: 255, g: 255, b: 255 }
  const black = { r: 0, g: 0, b: 0 }
  const background = { r: 250, g: 250, b: 250 }

  const contrastWithWhite = getContrastRatio(rgb, white)
  const contrastWithBlack = getContrastRatio(rgb, black)
  const contrastWithBackground = getContrastRatio(rgb, background)

  const passesAAWhite = contrastWithWhite >= 4.5
  const passesAABlack = contrastWithBlack >= 4.5
  const passesAABackground = contrastWithBackground >= 4.5
  const passesAAAWhite = contrastWithWhite >= 7
  const passesAAABlack = contrastWithBlack >= 7

  const recommendedForeground = contrastWithWhite > contrastWithBlack ? 'white' : 'black'

  const isAccessible = passesAAWhite || passesAABlack

  return {
    contrastWithWhite,
    contrastWithBlack,
    contrastWithBackground,
    passesAAWhite,
    passesAABlack,
    passesAABackground,
    passesAAAWhite,
    passesAAABlack,
    recommendedForeground,
    isAccessible,
  }
}
