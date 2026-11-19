import assert from 'node:assert/strict'
import { hasUnsignedLegacySrsData, runSrsPracticeWrite, waitForSrsPracticeWrites } from './srsPracticeSync'

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

let releaseFirst!: () => void
const firstPending = new Promise<void>(resolve => { releaseFirst = resolve })
const order: string[] = []
const firstWrite = runSrsPracticeWrite('learner', 'memory', async () => { order.push('first-start'); await firstPending; order.push('first-end') })
const secondWrite = runSrsPracticeWrite('learner', 'memory', async () => { order.push('second') })
const otherWrite = runSrsPracticeWrite('learner', 'another-memory', async () => { order.push('other') })
let loaded = false
const nextDrillLoad = waitForSrsPracticeWrites('learner', 'memory').then(() => { loaded = true; order.push('load') })
await otherWrite
assert.equal(loaded, false, 'a successor drill waits for its predecessor saves')
assert.deepEqual(order, ['first-start', 'other'], 'a second write is serialized only for the same learner and goal')
releaseFirst()
await Promise.all([firstWrite, secondWrite, nextDrillLoad])
assert.deepEqual(order, ['first-start', 'other', 'first-end', 'second', 'load'])
await assert.rejects(runSrsPracticeWrite('learner', 'memory', async () => { throw new Error('failed save') }), /failed save/)
await waitForSrsPracticeWrites('learner', 'memory')
console.log('SRS same-goal write ordering and reload barrier tests passed.')
