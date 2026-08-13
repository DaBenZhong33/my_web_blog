import assert from 'node:assert/strict'
import {
  applyInputDelta,
  clamp01,
  createBreathProfile,
  decideSnapTarget
} from '../src/components/footerSpringGlowMotion.js'

assert.equal(clamp01(-0.2), 0)
assert.equal(clamp01(0.4), 0.4)
assert.equal(clamp01(1.4), 1)

assert.equal(applyInputDelta(0.2, 120, 600), 0.4)
assert.equal(applyInputDelta(0.9, 120, 600), 1)
assert.equal(applyInputDelta(0.1, -120, 600), 0)
assert.equal(applyInputDelta(0.5, 80, 0), 0.5)

assert.equal(decideSnapTarget(0.6499, 0.65), 0)
assert.equal(decideSnapTarget(0.65, 0.65), 1)
assert.equal(decideSnapTarget(1, 2), 1)
assert.equal(decideSnapTarget(0.7, Number.NaN), 1)

const firstProfile = createBreathProfile(0)
const repeatedProfile = createBreathProfile(0)
assert.deepEqual(firstProfile, repeatedProfile)

for (let index = 0; index < 9; index += 1) {
  const profile = createBreathProfile(index)
  assert.ok(profile.scale >= 1.02 && profile.scale <= 1.07)
  assert.ok(profile.duration >= 2.8 && profile.duration <= 5.2)
  assert.ok(profile.delay <= 0)
}

assert.notDeepEqual(createBreathProfile(0), createBreathProfile(1))

console.log('Footer spring glow motion verification passed.')
