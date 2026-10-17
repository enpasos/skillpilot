import { useCallback, useEffect, useRef, useState } from 'react'
import {
  applyPersonalizationOption,
  reopenMigratedPersonalization,
  requestPersonalizationPlan,
  rewindPersonalization,
  restartPersonalization,
} from '../utils/personalCurriculumEditorApi'
import type { PersonalizationPlan } from '../utils/personalCurriculumEditorApi'
import {
  beginLatestRequest,
  invalidateLatestRequest,
  isLatestRequestForScope,
} from '../utils/latestRequestSequence'

export type {
  PersonalizationDecisionPrompt,
  PersonalizationCompletedDecision,
  PersonalizationDecisionSummary,
  PersonalizationOption,
  PersonalizationOptionKind,
  PersonalizationPlan,
  PersonalizationStage,
} from '../utils/personalCurriculumEditorApi'

export interface UsePersonalCurriculumEditorOptions {
  skillpilotId?: string | null
  enabled?: boolean
}

export interface PersonalCurriculumEditorController {
  plan: PersonalizationPlan | null
  loading: boolean
  busy: boolean
  error: Error | null
  applyOption: (optionId: string) => Promise<PersonalizationPlan | null>
  reopen: () => Promise<PersonalizationPlan | null>
  rewind: (rewindId: string) => Promise<PersonalizationPlan | null>
  restart: () => Promise<PersonalizationPlan | null>
  reload: () => Promise<PersonalizationPlan | null>
}

interface ActiveMutation {
  requestSequence: number
  scopeKey: string
}

export const usePersonalCurriculumEditor = ({
  skillpilotId,
  enabled = true,
}: UsePersonalCurriculumEditorOptions): PersonalCurriculumEditorController => {
  const editorScopeKey = `${enabled ? 'enabled' : 'disabled'}\u0000${skillpilotId ?? ''}`
  const [plan, setPlan] = useState<PersonalizationPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const requestSequence = useRef(0)
  const activeMutation = useRef<ActiveMutation | null>(null)
  const currentEditorScopeKey = useRef(editorScopeKey)
  currentEditorScopeKey.current = editorScopeKey

  const reload = useCallback(async (): Promise<PersonalizationPlan | null> => {
    if (!enabled || !skillpilotId) {
      setPlan(null)
      setError(null)
      setLoading(false)
      return null
    }

    const requestScopeKey = editorScopeKey
    const sequence = beginLatestRequest(requestSequence)
    const isCurrentRequest = () => isLatestRequestForScope(
      requestSequence,
      sequence,
      currentEditorScopeKey.current,
      requestScopeKey,
    )
    setLoading(true)
    setError(null)
    try {
      const nextPlan = await requestPersonalizationPlan(skillpilotId)
      if (!isCurrentRequest()) return null
      setPlan(nextPlan)
      return nextPlan
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause))
      if (!isCurrentRequest()) return null
      setPlan(null)
      setError(nextError)
      return null
    } finally {
      if (isCurrentRequest()) {
        setLoading(false)
      }
    }
  }, [editorScopeKey, enabled, skillpilotId])

  useEffect(() => {
    invalidateLatestRequest(requestSequence)
    activeMutation.current = null
    setPlan(null)
    setError(null)
    setLoading(false)
    setBusy(false)
    if (!enabled || !skillpilotId) {
      return
    }
    void reload()
  }, [editorScopeKey, enabled, reload, skillpilotId])

  const mutate = useCallback(async (
    request: () => Promise<PersonalizationPlan>,
  ): Promise<PersonalizationPlan | null> => {
    if (!enabled || !skillpilotId) {
      return null
    }
    const requestScopeKey = editorScopeKey
    if (activeMutation.current?.scopeKey === requestScopeKey) {
      return null
    }
    const sequence = beginLatestRequest(requestSequence)
    const mutation: ActiveMutation = {
      requestSequence: sequence,
      scopeKey: requestScopeKey,
    }
    activeMutation.current = mutation
    const isCurrentRequest = () => isLatestRequestForScope(
      requestSequence,
      sequence,
      currentEditorScopeKey.current,
      requestScopeKey,
    )
    setBusy(true)
    setError(null)
    try {
      const nextPlan = await request()
      if (!isCurrentRequest()) return null
      setPlan(nextPlan)
      return nextPlan
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause))
      if (!isCurrentRequest()) return null
      setError(nextError)
      return null
    } finally {
      if (activeMutation.current === mutation) {
        activeMutation.current = null
        setBusy(false)
      }
    }
  }, [editorScopeKey, enabled, skillpilotId])

  const applyOption = useCallback(async (optionId: string) => (
    mutate(() => applyPersonalizationOption(skillpilotId ?? '', optionId))
  ), [mutate, skillpilotId])

  const restart = useCallback(async () => (
    mutate(() => restartPersonalization(skillpilotId ?? ''))
  ), [mutate, skillpilotId])

  const reopen = useCallback(async () => (
    mutate(() => reopenMigratedPersonalization(skillpilotId ?? ''))
  ), [mutate, skillpilotId])

  const rewind = useCallback(async (rewindId: string) => (
    mutate(() => rewindPersonalization(skillpilotId ?? '', rewindId))
  ), [mutate, skillpilotId])

  return {
    plan,
    loading: loading || (enabled && !!skillpilotId && plan === null && error === null),
    busy,
    error,
    applyOption,
    reopen,
    rewind,
    restart,
    reload,
  }
}
