import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import type { GoalBookRuntimeModel } from './goalBookRuntime'
import {
  goalBookOriginalSourcesTupleKey,
  goalBookOriginalSourcesUrl,
  loadGoalBookOriginalSources,
  MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES,
  parseGoalBookOriginalSources,
  resetGoalBookOriginalSourcesCacheForTests,
  type GoalBookOriginalSourcesPayload,
} from './goalBookOriginalSources'

const scope = { stage: 'SekI', durationModel: 'G8', courseProfile: null } as const
const model = {
  book: {
    id: 'de-gym-mathematik-bundesweit',
    landscapeId: '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',
    edition: 'curricular-atomic-v1',
  },
  digest: `sha256:${'a'.repeat(64)}`,
  pages: [{ goalId: 'goal-a', applicability: [{ jurisdiction: 'DE-HE', scopes: [scope, { ...scope, durationModel: 'G9' }] }] }],
} as GoalBookRuntimeModel
const payload: GoalBookOriginalSourcesPayload = {
  schemaVersion: '1.0.0', bookId: model.book.id, bookDigest: model.digest,
  documents: [{ id: 'doc', title: 'Original curriculum', url: 'https://education.example/curriculum.pdf' }],
  evidence: [{
    id: 'ref', documentId: 'doc', sourceRef: 'Chapter 2, competence A', kind: 'direct', scopeMatch: 'exact',
    mappedTargetGoalId: 'goal-a', sourceGoalId: 'source-a',
    sourceScope: { jurisdiction: 'DE-HE', stage: ['SekI'], durationModel: ['G8'], courseProfile: [] },
    unspecifiedDimensions: [],
  }],
  goals: { 'goal-a': [
    { jurisdiction: 'DE-HE', ...scope, evidenceIds: ['ref'] },
    { jurisdiction: 'DE-HE', ...scope, durationModel: 'G9', evidenceIds: [] },
  ] },
}
const parsed = parseGoalBookOriginalSources(payload, model)
assert.equal(parsed.byTuple.size, 2)
assert.equal(parsed.byTuple.get(goalBookOriginalSourcesTupleKey('goal-a', 'DE-HE', scope))?.[0].sourceRef,
  'Chapter 2, competence A')
assert.deepEqual(parsed.byTuple.get(goalBookOriginalSourcesTupleKey('goal-a', 'DE-HE', { ...scope, durationModel: 'G9' })), [])
assert.equal(goalBookOriginalSourcesUrl(model), '/lernzielbuch/de-gym-mathematik-bundesweit.original-sources.json')

const invalid = (mutate: (copy: GoalBookOriginalSourcesPayload) => void) => {
  const copy = structuredClone(payload)
  mutate(copy)
  assert.throws(() => parseGoalBookOriginalSources(copy, model))
}
invalid((p) => { p.bookDigest = `sha256:${'b'.repeat(64)}` })
invalid((p) => { p.bookId = 'de-gym-physik-bundesweit' })
invalid((p) => { Object.assign(p, { learnerId: 'not-public-metadata' }) })
invalid((p) => { p.documents.push(p.documents[0]) })
invalid((p) => { p.evidence.push(p.evidence[0]) })
invalid((p) => { p.goals['goal-a'].push(p.goals['goal-a'][0]) })
invalid((p) => { p.goals['goal-a'].pop() })
invalid((p) => { p.goals['goal-a'][0].jurisdiction = 'DE-BY' })
invalid((p) => { p.goals['goal-a'][0].stage = 'SekII' })
invalid((p) => { p.goals['goal-a'][0].courseProfile = 'LK' })
invalid((p) => { p.goals['foreign-goal'] = p.goals['goal-a']; delete p.goals['goal-a'] })
invalid((p) => { p.goals['goal-a'][0].evidenceIds = ['unknown'] })
invalid((p) => { p.goals['goal-a'][0].evidenceIds.push('ref') })
invalid((p) => { p.evidence[0].documentId = 'unknown' })
invalid((p) => { p.evidence[0].mappedTargetGoalId = 'another-goal' })
invalid((p) => { p.evidence[0].kind = 'inherited' })
invalid((p) => { p.evidence[0].unspecifiedDimensions = ['durationModel'] })
invalid((p) => { p.evidence[0].sourceScope.jurisdiction = 'DE-BY' })
invalid((p) => { p.evidence[0].sourceScope.stage = ['SekII'] })
invalid((p) => { p.evidence[0].sourceScope.durationModel = ['G9'] })
invalid((p) => { p.evidence[0].sourceScope.durationModel = [] })
const irrelevantProfile = structuredClone(payload)
irrelevantProfile.evidence[0].sourceScope.courseProfile = ['GK', 'LK']
assert.equal(parseGoalBookOriginalSources(irrelevantProfile, model).byTuple.size, 2,
  'a null matrix axis makes no course-profile claim and preserves the original classification')
const upperModel = structuredClone(model)
upperModel.pages[0].applicability = [{ jurisdiction: 'DE-HE', scopes: [{ stage: 'SekII', durationModel: null, courseProfile: 'GK' }] }]
const upperPayload = structuredClone(payload)
upperPayload.goals['goal-a'] = [{ jurisdiction: 'DE-HE', stage: 'SekII', durationModel: null, courseProfile: 'GK', evidenceIds: ['ref'] }]
upperPayload.evidence[0].sourceScope = { jurisdiction: 'DE-HE', stage: ['SekII'], durationModel: ['G9'], courseProfile: ['GK'] }
assert.equal(parseGoalBookOriginalSources(upperPayload, upperModel).byTuple.size, 1,
  'a duration-neutral upper-secondary row does not invent a duration restriction')
upperPayload.evidence[0].sourceScope.courseProfile = ['LK']
assert.throws(() => parseGoalBookOriginalSources(upperPayload, upperModel), 'relevant GK/LK mismatches still fail closed')
for (const url of ['javascript:alert(1)', 'http://education.example/a', '//education.example/a',
  'https://user:password@education.example/a', 'https://education.example/\nunsafe']) {
  invalid((p) => { p.documents[0].url = url })
}
const inherited = structuredClone(payload)
Object.assign(inherited.evidence[0], {
  kind: 'inherited', mappedTargetGoalId: 'topic-area', scopeMatch: 'source-context', unspecifiedDimensions: ['durationModel'],
})
inherited.evidence[0].sourceScope.durationModel = []
assert.equal(parseGoalBookOriginalSources(inherited, model).byTuple.values().next().value?.[0].scopeMatch, 'source-context')

let calls = 0
let lastInit: RequestInit | undefined
const fetcher: typeof fetch = async (url, init) => {
  calls += 1
  lastInit = init
  assert.equal(url, goalBookOriginalSourcesUrl(model))
  return new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json; charset=utf-8' } })
}
const first = loadGoalBookOriginalSources(model, fetcher)
assert.equal(loadGoalBookOriginalSources(model, fetcher), first, 'rows share one bounded request')
assert.equal((await first).bookDigest, model.digest)
assert.equal(calls, 1)
assert.equal(lastInit?.method, 'GET')
assert.equal(lastInit?.credentials, 'omit')
assert.equal(lastInit?.redirect, 'error')
assert.equal(lastInit?.referrerPolicy, 'no-referrer')
assert.throws(() => goalBookOriginalSourcesUrl({ ...model, book: { ...model.book, id: '../unregistered' } }))

const rejectsResponse = async (response: () => Response) => {
  resetGoalBookOriginalSourcesCacheForTests()
  await assert.rejects(loadGoalBookOriginalSources(model, (async () => response()) as typeof fetch))
}
await rejectsResponse(() => new Response('Not found', { status: 404 }))
await rejectsResponse(() => new Response('<html>', { headers: { 'content-type': 'text/html' } }))
await rejectsResponse(() => new Response('{', { headers: { 'content-type': 'application/json' } }))
await rejectsResponse(() => new Response('{}', { headers: {
  'content-type': 'application/json', 'content-length': String(MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES + 1),
} }))
let cancelled = false
await rejectsResponse(() => new Response(new ReadableStream({
  start(controller) { controller.enqueue(new Uint8Array(MAX_GOAL_BOOK_ORIGINAL_SOURCES_BYTES + 1)) },
  cancel() { cancelled = true },
}), { headers: { 'content-type': 'application/json' } }))
assert(cancelled, 'an oversized stream is cancelled without trusting Content-Length')
await rejectsResponse(() => new Response(JSON.stringify({ ...payload, bookDigest: `sha256:${'c'.repeat(64)}` }), {
  headers: { 'content-type': 'application/json' },
}))
assert.equal((await loadGoalBookOriginalSources(model, fetcher)).bookDigest, model.digest,
  'a failed fetch never poisons the cache')
const newerModel = { ...model, digest: `sha256:${'d'.repeat(64)}` }
assert.equal((await loadGoalBookOriginalSources(newerModel, (async () => new Response(
  JSON.stringify({ ...payload, bookDigest: newerModel.digest }), { headers: { 'content-type': 'application/json' } },
)) as typeof fetch)).bookDigest, newerModel.digest, 'a new book digest cannot reuse stale source metadata')
resetGoalBookOriginalSourcesCacheForTests()
for (const subject of ['mathematik', 'physik']) {
  const base = `../../public/lernzielbuch/de-gym-${subject}-bundesweit`
  const realModel = JSON.parse(await readFile(new URL(`${base}.book-model.json`, import.meta.url), 'utf8')) as GoalBookRuntimeModel
  const realPayload: unknown = JSON.parse(await readFile(new URL(`${base}.original-sources.json`, import.meta.url), 'utf8'))
  const realIndex = parseGoalBookOriginalSources(realPayload, realModel)
  assert.equal(realIndex.bookDigest, realModel.digest)
  assert.equal(realIndex.byTuple.size, realModel.pages.reduce((total, page) => total
    + (page.applicability ?? []).reduce((count, group) => count + group.scopes.length, 0), 0))
}
console.log('Goal-book original-source tests passed: exact tuple coverage, safe links, digest binding, lazy shared requests and byte limits.')
