export const clamp01 = (value, fallback = 0) => {
  const safeValue = Number.isFinite(value) ? value : fallback
  return Math.min(Math.max(safeValue, 0), 1)
}

export const applyInputDelta = (progress, delta, travel) => {
  if (!Number.isFinite(travel) || travel <= 0) return clamp01(progress)
  const safeDelta = Number.isFinite(delta) ? delta : 0
  return clamp01(progress + safeDelta / travel)
}

export const decideSnapTarget = (progress, threshold = 0.65) => {
  const safeThreshold = clamp01(threshold, 0.65)
  return clamp01(progress) >= safeThreshold ? 1 : 0
}

const seededUnit = (index, salt) => {
  const value = Math.sin((index + 1) * salt) * 43758.5453123
  return value - Math.floor(value)
}

export const createBreathProfile = (index) => {
  const safeIndex = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0
  const scale = 1.02 + seededUnit(safeIndex, 12.9898) * 0.05
  const duration = 2.8 + seededUnit(safeIndex, 78.233) * 2.4
  const delay = -seededUnit(safeIndex, 39.425) * duration

  return {
    scale: Number(scale.toFixed(4)),
    duration: Number(duration.toFixed(3)),
    delay: Number(delay.toFixed(3))
  }
}
