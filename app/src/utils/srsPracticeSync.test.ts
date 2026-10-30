import assert from 'node:assert/strict'
import { hasUnsignedLegacySrsData } from './srsPracticeSync'

assert.equal(hasUnsignedLegacySrsData(null), false)
assert.equal(hasUnsignedLegacySrsData({ serverExport: { data: {} }, clientData: { srsState: {} } }), false)
assert.equal(hasUnsignedLegacySrsData({
  serverExport: { data: {} }, clientData: { srsState: { card: { verifiedRecall: { status: 'passed' } } } },
}), true)
assert.equal(hasUnsignedLegacySrsData({
  serverExport: { data: { srsData: { schemaVersion: 1, states: {} } } },
  clientData: { srsState: { card: { verifiedRecall: { status: 'passed' } } } },
}), false)
console.log('SRS import trust boundary tests passed.')
