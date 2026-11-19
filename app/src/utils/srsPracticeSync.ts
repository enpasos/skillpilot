export type SrsPracticeSnapshot = {
  srsState: Record<string, unknown>
  expectedUpdatedAt: string | null
}

export const SRS_STATE_RELOADED_EVENT = 'skillpilot:srs-state-reloaded'

export type SrsStateReloaded = SrsPracticeSnapshot & { goalId: string }

// A topic and the complete deck share one server revision. A newly mounted
// practice must see the write its predecessor started while leaving.
const practiceWrites = new Map<string, Promise<unknown>>()
const practiceKey = (learnerId: string, goalId: string) => JSON.stringify([learnerId, goalId])

export function runSrsPracticeWrite<T>(learnerId: string, goalId: string, write: () => Promise<T>): Promise<T> {
  const key = practiceKey(learnerId, goalId)
  const previous = practiceWrites.get(key)
  const current = (previous ? previous.catch(() => undefined) : Promise.resolve()).then(write)
  practiceWrites.set(key, current)
  const finish = () => { if (practiceWrites.get(key) === current) practiceWrites.delete(key) }
  void current.then(finish, finish)
  return current
}

export async function waitForSrsPracticeWrites(learnerId: string, goalId: string): Promise<void> {
  const key = practiceKey(learnerId, goalId)
  while (practiceWrites.has(key)) await practiceWrites.get(key)!.catch(() => undefined)
}

/** Unsigned legacy card data cannot reconstruct the authoritative recall state. */
export const hasUnsignedLegacySrsData = (archive: unknown): boolean => {
  if (!archive || typeof archive !== 'object') return false
  const wrapper = archive as Record<string, unknown>
  const signed = (wrapper.serverExport ?? wrapper) as { data?: { srsData?: unknown } }
  if (signed?.data?.srsData) return false
  const clientData = wrapper.clientData as { srsState?: unknown } | undefined
  return !!clientData?.srsState && typeof clientData.srsState === 'object'
    && Object.keys(clientData.srsState).length > 0
}
