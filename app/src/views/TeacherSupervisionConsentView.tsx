import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ShieldCheck, UserRoundCheck, XCircle } from 'lucide-react'

import { useLanguage } from '../contexts/LanguageContext'
import {
  acceptTeacherInvitation,
  clearInvitationTokenFragment,
  listLearnerTeacherMemberships,
  previewTeacherInvitation,
  readInvitationTokenFromFragment,
  revokeLearnerTeacherMembership,
  type LearnerTeacherMembership,
  type TeacherInvitationPreview,
  TEACHER_SUPERVISION_ENABLED,
} from '../utils/teacherSupervision'
import { getTeacherSupervisionCopy } from '../utils/teacherSupervisionCopy'

type PageState = 'loading' | 'invite' | 'manage' | 'accepted' | 'invalid'

export const TeacherSupervisionConsentView: React.FC = () => {
  const { language } = useLanguage()
  const copy = useMemo(
    () => getTeacherSupervisionCopy(language === 'en' ? 'en' : 'de'),
    [language],
  )
  const [invitationToken, setInvitationToken] = useState(readInvitationTokenFromFragment)
  const [pageState, setPageState] = useState<PageState>(invitationToken ? 'loading' : 'manage')
  const [preview, setPreview] = useState<TeacherInvitationPreview | null>(null)
  const [skillpilotId, setSkillpilotId] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [memberships, setMemberships] = useState<LearnerTeacherMembership[] | null>(null)
  const [isWorking, setIsWorking] = useState(false)
  const [revokingMemberId, setRevokingMemberId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!invitationToken) return
    clearInvitationTokenFragment()
    if (!TEACHER_SUPERVISION_ENABLED) return
    let cancelled = false
    void previewTeacherInvitation(invitationToken)
      .then((nextPreview) => {
        if (cancelled) return
        const requestedCapabilities = new Set(nextPreview.requestedCapabilities)
        const hasExpectedReadGrant = requestedCapabilities.size === 2
          && requestedCapabilities.has('PERSONAL_CURRICULUM_READ')
          && requestedCapabilities.has('MASTERY_READ')
        if (!hasExpectedReadGrant) {
          setPageState('invalid')
          return
        }
        setPreview(nextPreview)
        setPageState(nextPreview.status.trim().toLowerCase() === 'pending' ? 'invite' : 'invalid')
      })
      .catch(() => {
        if (!cancelled) setPageState('invalid')
      })
    return () => {
      cancelled = true
    }
  }, [invitationToken])

  const handleAccept = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!invitationToken || !acknowledged || !skillpilotId.trim()) return
    setIsWorking(true)
    setError(null)
    try {
      await acceptTeacherInvitation(invitationToken, skillpilotId.trim())
      setInvitationToken('')
      setPageState('accepted')
    } catch {
      setError(copy.genericError)
    } finally {
      setIsWorking(false)
    }
  }

  const handleLoadMemberships = async (event?: React.FormEvent) => {
    event?.preventDefault()
    if (!skillpilotId.trim()) return
    setIsWorking(true)
    setError(null)
    try {
      setMemberships(await listLearnerTeacherMemberships(skillpilotId.trim()))
      setPageState('manage')
    } catch {
      setError(copy.genericError)
    } finally {
      setIsWorking(false)
    }
  }

  const handleRevoke = async (memberId: string) => {
    if (!skillpilotId.trim()) return
    if (!window.confirm(copy.revokeConfirm)) return
    setRevokingMemberId(memberId)
    setError(null)
    try {
      await revokeLearnerTeacherMembership(skillpilotId.trim(), memberId)
      setMemberships((current) => current?.filter((membership) => membership.memberId !== memberId) ?? [])
    } catch {
      setError(copy.genericError)
    } finally {
      setRevokingMemberId(null)
    }
  }

  if (!TEACHER_SUPERVISION_ENABLED) {
    return (
      <main className="min-h-screen bg-app-gradient px-4 py-10 text-text-primary">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border-color bg-sidebar-bg p-8 shadow-xl">
          <h1 className="text-2xl font-bold">{copy.consentTitle}</h1>
          <p className="mt-4 rounded-xl border border-border-color bg-input-bg p-4 text-text-secondary">
            {copy.unavailable}
          </p>
          <Link to="/" className="mt-6 inline-block text-sm text-sky-600 hover:text-sky-500 dark:text-sky-400">← {copy.home}</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-app-gradient px-4 py-10 text-text-primary">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border-color bg-sidebar-bg p-6 shadow-xl md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-sky-100 p-3 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
            <UserRoundCheck size={28} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">SkillPilot</p>
            <h1 className="text-2xl font-bold">{pageState === 'manage' ? copy.manageTitle : copy.consentTitle}</h1>
          </div>
        </div>

        {pageState === 'loading' && (
          <p className="rounded-xl border border-border-color bg-input-bg p-4 text-text-secondary">{copy.checking}</p>
        )}

        {pageState === 'invalid' && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-100">
            <XCircle className="mb-3" aria-hidden="true" />
            <p>{copy.inviteInvalid}</p>
          </div>
        )}

        {pageState === 'invite' && preview && (
          <form onSubmit={handleAccept} className="space-y-5">
            <p className="text-text-secondary">{copy.consentIntro}</p>
            <section className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/25 dark:text-sky-100">
              <p className="text-sm text-sky-800 dark:text-sky-200">{copy.requesterSays}</p>
              <p className="mt-1 text-lg font-semibold">{preview.teacherDisplayName || preview.courseLabel}</p>
              <p className="mt-1 text-sm">{preview.courseLabel}</p>
              <p className="mt-4 rounded-lg bg-amber-100 p-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                {copy.expectedRequestWarning}
              </p>
            </section>
            <section className="rounded-xl border border-border-color p-5">
              <h2 className="font-semibold">{copy.requestedAccessTitle}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-text-secondary">
                {copy.requestedAccessItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="mt-4 flex gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="shrink-0" size={18} aria-hidden="true" />
                {copy.noWriteAccess}
              </p>
              <p className="mt-3 text-sm text-text-secondary">{copy.grantDuration}</p>
            </section>
            <div>
              <label htmlFor="teacher-consent-skillpilot-id" className="mb-1 block text-xs font-bold uppercase text-text-secondary">
                {copy.consentIdLabel}
              </label>
              <input
                id="teacher-consent-skillpilot-id"
                required
                autoComplete="off"
                maxLength={80}
                value={skillpilotId}
                onChange={(event) => setSkillpilotId(event.target.value)}
                className="w-full rounded-lg border border-border-color bg-input-bg p-3 font-mono text-text-primary outline-none focus:border-sky-500"
              />
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-border-color p-4">
              <input
                type="checkbox"
                required
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="mt-1 h-4 w-4 text-sky-600"
              />
              <span className="text-sm">{copy.consentCheckbox}</span>
            </label>
            {error && <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}
            <button
              type="submit"
              disabled={isWorking || !acknowledged}
              className="w-full rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {isWorking ? copy.accepting : copy.accept}
            </button>
          </form>
        )}

        {pageState === 'accepted' && (
          <div className="space-y-5">
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
              <CheckCircle2 className="mb-3" aria-hidden="true" />
              <h2 className="font-semibold">{copy.acceptedTitle}</h2>
              <p className="mt-2 text-sm">{copy.acceptedHint}</p>
            </div>
            <button
              type="button"
              onClick={() => void handleLoadMemberships()}
              disabled={isWorking}
              className="w-full rounded-lg border border-border-color px-5 py-3 font-medium hover:bg-input-bg disabled:opacity-50"
            >
              {copy.loadMemberships}
            </button>
          </div>
        )}

        {pageState === 'manage' && (
          <div className="space-y-5">
            <p className="text-text-secondary">{copy.manageIntro}</p>
            <form onSubmit={handleLoadMemberships} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="teacher-membership-skillpilot-id" className="sr-only">{copy.consentIdLabel}</label>
              <input
                id="teacher-membership-skillpilot-id"
                required
                autoComplete="off"
                maxLength={80}
                value={skillpilotId}
                onChange={(event) => setSkillpilotId(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-border-color bg-input-bg p-3 font-mono text-text-primary outline-none focus:border-sky-500"
                placeholder={copy.consentIdLabel}
              />
              <button
                type="submit"
                disabled={isWorking}
                className="rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
              >
                {copy.loadMemberships}
              </button>
            </form>
            {memberships && memberships.length === 0 && (
              <p className="rounded-xl border border-border-color bg-input-bg p-4 text-sm text-text-secondary">{copy.noMemberships}</p>
            )}
            {memberships && memberships.length > 0 && (
              <ul className="space-y-3">
                {memberships.map((membership) => (
                  <li key={membership.memberId} className="flex items-center justify-between gap-4 rounded-xl border border-border-color p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{membership.courseLabel}</p>
                        <span className="rounded-full border border-border-color bg-input-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                          {membership.status.trim().toLowerCase() === 'active'
                            ? copy.membershipActive
                            : membership.status.trim().toLowerCase() === 'expired'
                              ? copy.membershipExpired
                              : copy.membershipPending}
                        </span>
                      </div>
                      {membership.teacherDisplayName && (
                        <p className="truncate text-sm text-text-secondary">
                          {copy.requesterSays}: {membership.teacherDisplayName}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={revokingMemberId === membership.memberId}
                      onClick={() => void handleRevoke(membership.memberId)}
                      className="shrink-0 rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30 disabled:opacity-50"
                    >
                      {copy.revoke}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}
          </div>
        )}

        <div className="mt-8 border-t border-border-color pt-5">
          <Link to="/" className="text-sm text-sky-600 hover:text-sky-500 dark:text-sky-400">← {copy.home}</Link>
        </div>
      </div>
    </main>
  )
}
