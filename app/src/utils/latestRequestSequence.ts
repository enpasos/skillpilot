export interface LatestRequestSequence {
  current: number
}

export const beginLatestRequest = (
  sequence: LatestRequestSequence,
): number => {
  sequence.current += 1
  return sequence.current
}

export const invalidateLatestRequest = (
  sequence: LatestRequestSequence,
): void => {
  sequence.current += 1
}

export const isLatestRequest = (
  sequence: LatestRequestSequence,
  requestId: number,
): boolean => sequence.current === requestId

export const isLatestRequestForScope = (
  sequence: LatestRequestSequence,
  requestId: number,
  currentScopeKey: string,
  requestScopeKey: string,
): boolean => (
  isLatestRequest(sequence, requestId)
  && currentScopeKey === requestScopeKey
)
