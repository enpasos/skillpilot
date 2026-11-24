import { sanitizeSkillpilotId } from './skillpilotId'

/**
 * Where the browser keeps the SkillPilot ID of the active access.
 *
 * The learner decides: "convenient" keeps the ID in the browser's durable
 * storage, so a later visit continues without entering it; "secure" keeps it
 * for the open tab only. An ID that an earlier version already left in the
 * durable storage counts as remembered, so nobody loses a working access.
 *
 * Scope: this governs the access entry itself. Learning caches written by the
 * Cockpit are separate browser data.
 */
const SKILLPILOT_ID_KEY = 'skillpilot_id'

type ReadableStorage = Pick<Storage, 'getItem'>
type WritableStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const readId = (storage: ReadableStorage) => {
  try {
    return sanitizeSkillpilotId(storage.getItem(SKILLPILOT_ID_KEY))
  } catch {
    // Blocked storage simply holds no access.
    return ''
  }
}

/** The ID this browser was asked to remember, or an empty string. */
export const readRememberedSkillpilotId = (local: ReadableStorage) => readId(local)

/** The ID kept for this tab only, or an empty string. */
export const readTabSkillpilotId = (session: ReadableStorage) => readId(session)

/** The active access of this tab: its own ID first, then the remembered one. */
export const readActiveSkillpilotId = (local: ReadableStorage, session: ReadableStorage) => (
  readTabSkillpilotId(session) || readRememberedSkillpilotId(local)
)

export const isSkillpilotIdRemembered = (local: ReadableStorage, skillpilotId: string) => {
  const id = sanitizeSkillpilotId(skillpilotId)
  return !!id && readRememberedSkillpilotId(local) === id
}

/** Drops the remembered copy of exactly this ID; another learner's ID stays. */
export const forgetRememberedSkillpilotId = (local: WritableStorage, skillpilotId: string) => {
  if (isSkillpilotIdRemembered(local, skillpilotId)) local.removeItem(SKILLPILOT_ID_KEY)
}

/**
 * Stores the active access according to the learner's choice. Remembering
 * moves the ID into the durable storage; otherwise it stays with this tab and
 * a remembered copy of the same ID is removed.
 */
export const storeActiveSkillpilotId = (
  local: WritableStorage,
  session: WritableStorage,
  skillpilotId: string,
  remember: boolean,
) => {
  const id = sanitizeSkillpilotId(skillpilotId)
  if (!id) return
  if (remember) {
    local.setItem(SKILLPILOT_ID_KEY, id)
    session.removeItem(SKILLPILOT_ID_KEY)
    return
  }
  session.setItem(SKILLPILOT_ID_KEY, id)
  forgetRememberedSkillpilotId(local, id)
}

/** Ends the access in this browser: neither the tab nor the browser keeps the ID. */
export const clearActiveSkillpilotId = (local: WritableStorage, session: WritableStorage) => {
  local.removeItem(SKILLPILOT_ID_KEY)
  session.removeItem(SKILLPILOT_ID_KEY)
}
