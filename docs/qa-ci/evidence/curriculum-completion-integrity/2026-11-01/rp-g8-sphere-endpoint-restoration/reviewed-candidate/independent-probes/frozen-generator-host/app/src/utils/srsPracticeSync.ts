export type SrsPracticeSnapshot = {
  srsState: Record<string, unknown>
  expectedUpdatedAt: string | null
}

export const SRS_STATE_RELOADED_EVENT = 'skillpilot:srs-state-reloaded'

export type SrsStateReloaded = SrsPracticeSnapshot & { goalId: string }

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
