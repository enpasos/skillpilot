import {
  clearActiveSkillpilotId,
  forgetRememberedSkillpilotId,
  isSkillpilotIdRemembered,
  readActiveSkillpilotId,
  readRememberedSkillpilotId,
  readTabSkillpilotId,
  storeActiveSkillpilotId,
} from './skillpilotIdBrowserStorage'

const assert: (condition: unknown, message: string) => asserts condition = (
  condition,
  message,
) => {
  if (!condition) throw new Error(message)
}

const createStorage = (initial: Record<string, string> = {}) => {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
    keys: () => [...values.keys()].sort(),
  }
}

const learnerA = '11111111-1111-4111-8111-111111111111'
const learnerB = '22222222-2222-4222-8222-222222222222'

{
  const local = createStorage()
  const session = createStorage()
  storeActiveSkillpilotId(local, session, learnerA, false)
  assert(
    readTabSkillpilotId(session) === learnerA && readRememberedSkillpilotId(local) === '',
    'the secure choice keeps the ID with the open tab and out of the durable browser storage',
  )
  assert(
    readActiveSkillpilotId(local, session) === learnerA,
    'the tab still has its active access',
  )
  assert(
    readActiveSkillpilotId(local, createStorage()) === '',
    'another tab finds no access after the secure choice',
  )
}

{
  const local = createStorage()
  const session = createStorage({ skillpilot_id: learnerA })
  storeActiveSkillpilotId(local, session, learnerA, true)
  assert(
    readRememberedSkillpilotId(local) === learnerA && readTabSkillpilotId(session) === '',
    'the convenient choice moves the ID into the durable browser storage',
  )
  assert(
    isSkillpilotIdRemembered(local, learnerA) && !isSkillpilotIdRemembered(local, learnerB),
    'only the stored ID counts as remembered',
  )
  assert(
    readActiveSkillpilotId(local, createStorage()) === learnerA,
    'a later visit in a new tab finds the remembered access',
  )
}

{
  // An ID left behind by an earlier version has no marker of its own.
  const local = createStorage({ skillpilot_id: learnerA })
  assert(
    isSkillpilotIdRemembered(local, learnerA),
    'an already stored ID stays a remembered access, so nobody loses it',
  )
  storeActiveSkillpilotId(local, createStorage(), learnerA, false)
  assert(
    readRememberedSkillpilotId(local) === '',
    'switching the same ID to secure removes its remembered copy',
  )
}

{
  const local = createStorage({ skillpilot_id: learnerB })
  const session = createStorage()
  storeActiveSkillpilotId(local, session, learnerA, false)
  assert(
    readRememberedSkillpilotId(local) === learnerB,
    'a secure access never removes another learner\'s remembered ID',
  )
  assert(
    readActiveSkillpilotId(local, session) === learnerA,
    'the tab\'s own access takes precedence over the remembered one',
  )
  forgetRememberedSkillpilotId(local, learnerA)
  assert(
    readRememberedSkillpilotId(local) === learnerB,
    'forgetting names one ID and leaves a different remembered ID alone',
  )
  clearActiveSkillpilotId(local, session)
  assert(
    readActiveSkillpilotId(local, session) === '' && local.keys().length === 0 && session.keys().length === 0,
    'signing out leaves no access entry in the tab or the browser',
  )
}

{
  const blocked = {
    getItem: () => { throw new Error('storage blocked') },
  }
  assert(
    readActiveSkillpilotId(blocked, blocked) === '',
    'blocked browser storage reads as no access instead of failing',
  )
  const local = createStorage()
  storeActiveSkillpilotId(local, createStorage(), '   ', true)
  assert(local.keys().length === 0, 'an empty ID is never stored')
}

console.log('SkillPilot ID browser storage tests passed')
