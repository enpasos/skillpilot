import assert from 'node:assert/strict'
import {
  ContentMaterialsApiError,
  getContentSelection,
  getGoalAdditionalMaterials,
  parseContentSelection,
  parseResolvedMaterials,
  safeMaterialUrl,
  saveContentSelection,
} from './contentMaterialsApi'

const selection = {
  revision: 2,
  selectedPackageIds: [],
  packages: [{
    packageId: 'physics-pilot', version: '0.1.0', title: 'Physik-Pilot', description: 'Optionale Materialien',
    providerName: 'Public provider', providerUrl: 'https://provider.example/', access: 'public-link', aiUsage: 'link-only', materialCount: 1,
  }],
}
const material = {
  title: 'Motion analysis', url: 'https://provider.example/motion#analysis', provider: 'Public provider',
  resourceType: 'article', language: 'en', sections: ['Motion analysis'], access: 'public-link', aiUsage: 'link-only',
}
assert.deepEqual(parseContentSelection(selection), selection)
assert.deepEqual(parseContentSelection({ ...selection, selectedPackageIds: ['retired-pilot'] }).selectedPackageIds, ['retired-pilot'],
  'retired package IDs remain visible to the UI so the learner can explicitly remove them')
assert.deepEqual(parseResolvedMaterials([material]), [material])
for (const url of ['javascript:alert(1)', 'data:text/html,hi', 'http://provider.example', 'https://secret@provider.example']) {
  assert.throws(() => safeMaterialUrl(url))
}
assert.throws(() => parseContentSelection({ ...selection, revision: -1 }))
assert.throws(() => parseContentSelection({ ...selection, selectedPackageIds: [null] }))
assert.throws(() => parseResolvedMaterials(Array.from({ length: 5 }, () => material)))
assert.throws(() => parseResolvedMaterials([{ ...material, sections: ['safe', {}] }]))

const calls: { input: string; init?: RequestInit }[] = []
let responseBody: unknown = selection
let status = 200
const fetcher: typeof fetch = async (input, init) => {
  calls.push({ input: String(input), init })
  return new Response(JSON.stringify(responseBody), { status, headers: { 'Content-Type': 'application/json' } })
}
const options = { fetcher, apiBase: 'https://skillpilot.example/' }
await getContentSelection('learner/a', 'en', options)
assert.equal(calls.at(-1)?.input, 'https://skillpilot.example/api/ui/learners/learner%2Fa/content-selection?lang=en')
assert.equal(calls.at(-1)?.init?.cache, 'no-store')
assert.equal(calls.at(-1)?.init?.referrerPolicy, 'no-referrer')
assert.equal(calls.at(-1)?.init?.headers, undefined, 'reads use the ordinary learner context')

await saveContentSelection('learner/a', 'de', 2, ['physics-pilot'], options)
const save = calls.at(-1)!
assert.equal(save.init?.method, 'PUT')
assert.deepEqual(JSON.parse(String(save.init?.body)), { expectedRevision: 2, selectedPackageIds: ['physics-pilot'] })
assert.deepEqual([...new Headers(save.init?.headers)], [['content-type', 'application/json']],
  'saving is an ordinary Cockpit setting and sends no separate grant or authorization header')
assert.equal(new Headers(save.init?.headers).get('X-SkillPilot-Content-Capability'), null)

responseBody = [material]
await getGoalAdditionalMaterials('learner/a', 'public/goal', 'en', options)
assert.equal(calls.at(-1)?.input, 'https://skillpilot.example/api/ui/learners/learner%2Fa/content-materials?goalId=public%2Fgoal&lang=en')
assert.equal(calls.at(-1)?.init?.headers, undefined)

for (status of [403, 404, 409, 503]) {
  await assert.rejects(getContentSelection('learner/a', 'de', options), (error: unknown) => error instanceof ContentMaterialsApiError && error.status === status)
}
const count = calls.length
await assert.rejects(saveContentSelection(' ', 'de', 2, [], options), /Missing learner context/)
assert.equal(calls.length, count, 'missing learner context causes no request')
status = 200
responseBody = selection
await saveContentSelection('learner/a', 'de', 2, [], options)
assert.deepEqual(JSON.parse(String(calls.at(-1)?.init?.body)), { expectedRevision: 2, selectedPackageIds: [] },
  'the learner can explicitly remove all optional materials without a separate credential')
console.log('Content material API tests passed')
