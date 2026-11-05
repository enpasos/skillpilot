import { useEffect, useRef } from 'react'
import { ArrowUpRight, Check, Image as ImageIcon, Send, ShieldCheck, Target, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { CockpitGauges } from './CockpitGauges'
import { GoalImageButton, type CockpitGoalImage, type CockpitImagePreview } from './GoalImage'

type GoalPreview = { id: string; title: string; description: string; kind: string }
type Progress = { total: number; explicit: number; implicit: number; completed: number; percent: number }

export type CockpitPreview = {
  mode: 'goal' | 'assessment' | 'cards'
  goal: GoalPreview
  taskContent?: string
  scoring?: { maxPoints: number; passingPoints: number; steps: { id: string; points: number; description: string }[] }
  cards?: { id: string; front: string; back: string }[]
  image?: CockpitGoalImage | null
}

export function CockpitLearningView({ activeGoal, unitComplete, activeImage, assessmentGoalId,
  onOpenImage, onShowActive, onContinue, onExam }: {
  activeGoal: GoalPreview | null; unitComplete: boolean; activeImage?: CockpitGoalImage | null
  assessmentGoalId: string; onOpenImage: (preview: CockpitImagePreview) => void
  onShowActive: () => void; onContinue: () => void; onExam: () => void
}) {
  return <article className="cp-learning" data-testid="cockpit-active-panel"
    data-active-goal-id={activeGoal?.id ?? ''} aria-label={unitComplete ? 'Ausschnitt abgeschlossen' : 'Aktives Lernziel'}>
    <div className="cp-learning-kicker">
      {unitComplete ? <Check size={17} className="cp-complete-icon" strokeWidth={3} /> : <Send size={16} className="cp-active-icon" />}
      <span>{unitComplete ? 'Erreicht' : activeGoal?.kind === 'assessment' ? 'Deine Prüfung' : 'Dein Lernziel'}</span>
      {!unitComplete && <button type="button" className="cp-icon-button" onClick={onShowActive}
        title="Aktives Ziel in der Lernkarte" aria-label="Aktives Ziel in der Karte"><Target size={15} /></button>}
    </div>
    <h1 data-testid={unitComplete ? undefined : 'cockpit-active-goal'} title={activeGoal?.description}>
      {unitComplete ? 'Ausschnitt abgeschlossen' : activeGoal?.title}
    </h1>
    {!unitComplete && activeGoal && activeImage && <div className="cp-learning-image">
      <GoalImageButton image={activeImage} goalTitle={activeGoal.title}
        onOpen={() => onOpenImage({ goalId: activeGoal.id, goalTitle: activeGoal.title, image: activeImage })} />
    </div>}
    <div className="cp-learning-actions">
      <button type="button" className="cp-primary-button" onClick={onContinue}>
        {unitComplete ? 'Freiwillig vertiefen' : 'Lernen fortsetzen'}<Send size={15} className="cp-active-icon" />
      </button>
      {(unitComplete || activeGoal?.id !== assessmentGoalId) && <button type="button" className="cp-secondary-button" onClick={onExam}>
        {unitComplete ? 'Prüfung freiwillig wiederholen' : 'Prüfung direkt versuchen'}
        {unitComplete ? <Check size={14} className="cp-complete-icon" /> : <Target size={14} className="cp-open-icon" />}
      </button>}
    </div>
  </article>
}

export function CockpitPlanView({ unitTitle, goals, progress, todayExplicit, weekExplicit, demoDate,
  explicitGoalIds, implicitGoalIds, activeGoalId, onShowUnit, onPreview }: {
  unitTitle: string; goals: GoalPreview[]; progress: Progress; todayExplicit: number; weekExplicit: number; demoDate: string
  explicitGoalIds: readonly string[]; implicitGoalIds: readonly string[]; activeGoalId?: string
  onShowUnit: () => void; onPreview: (goalId: string) => void
}) {
  const explicit = new Set(explicitGoalIds)
  const implicit = new Set(implicitGoalIds)
  return <article className="cp-plan-view" aria-labelledby="cockpit-plan-heading">
    <h1 id="cockpit-plan-heading">Mein Plan</h1>
    <section className="cp-plan-scope" aria-label="Geplanter Ausschnitt">
      <div className="cp-plan-scope-heading"><span>Ausschnitt</span>
        <button type="button" className="cp-icon-button" onClick={onShowUnit}
          title="Ausschnitt in der Lernkarte" aria-label="Bereich in der Karte"><ArrowUpRight size={16} /></button>
      </div>
      <h2>{unitTitle}</h2>
      <CockpitGauges progress={progress} todayExplicit={todayExplicit} weekExplicit={weekExplicit} demoDate={demoDate} />
      <ul className="cp-plan-goals" aria-label="Ziele dieses Ausschnitts">
        {goals.map(goal => {
          const status = explicit.has(goal.id) ? 'Direkt erreicht' : implicit.has(goal.id) ? 'Implizit erreicht'
            : activeGoalId === goal.id ? 'Aktives Lernziel' : 'Offen'
          return <li key={goal.id}>
            <span className="cp-plan-status" title={status} aria-label={status}>
              {explicit.has(goal.id) ? <Check size={18} strokeWidth={3} className="cp-complete-icon" />
                : implicit.has(goal.id) ? <ShieldCheck size={18} className="cp-implicit-icon" />
                  : activeGoalId === goal.id ? <Send size={17} className="cp-active-icon" />
                    : <Target size={18} className="cp-open-icon" />}
            </span>
            <button type="button" onClick={() => onPreview(goal.id)} title={goal.description}>
              <span>{goal.kind === 'assessment' ? 'Prüfung' : 'Fachziel'}</span><strong>{goal.title}</strong>
            </button>
          </li>
        })}
      </ul>
    </section>
  </article>
}

function Markdown({ children, inline = false }: { children: string; inline?: boolean }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}
    components={inline ? { p: ({ children: content }) => <span>{content}</span> } : undefined}>{children}</ReactMarkdown>
}

export function CockpitPreviewDialog({ preview, coachStartText, onOpenImage, onClose }: {
  preview: CockpitPreview | null; coachStartText: string; onOpenImage: (preview: CockpitImagePreview) => void; onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const body = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (preview) { if (!element.open) element.showModal(); element.scrollTop = 0; body.current?.scrollTo(0, 0) }
    else if (element.open) element.close()
  }, [preview])
  return <dialog ref={dialog} className="cp-dialog" data-testid="cockpit-preview-dialog"
    data-preview-goal-id={preview?.goal.id} data-preview-mode={preview?.mode} aria-labelledby="cockpit-preview-title"
    onKeyDownCapture={event => { if (event.key === 'Escape' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f')) event.stopPropagation() }}
    onCancel={event => { event.preventDefault(); onClose() }} onClose={onClose}>
    {preview && <>
      <div className="cp-dialog-top"><span title="Lokale Vorschau. Keine Sitzung oder Bewertung.">{preview.mode === 'assessment' ? 'Prüfungsvorschau' : preview.mode === 'cards' ? 'Karten · Kontext' : 'Lernzielvorschau'}</span>
        <button type="button" onClick={onClose} aria-label="Vorschau schließen"><X size={18} /></button></div>
      <div ref={body} className="cp-dialog-body">
        <h1 id="cockpit-preview-title" title={preview.goal.description}>{preview.goal.title}</h1>
        {preview.mode === 'goal' && preview.image && <button type="button" className="cp-preview-image-action cp-icon-button"
          title="Lernzielbild anzeigen" aria-label={`Lernzielbild zu „${preview.goal.title}“ anzeigen`}
          onClick={() => onOpenImage({ goalId: preview.goal.id, goalTitle: preview.goal.title, image: preview.image! })}><ImageIcon size={17} /></button>}
        {preview.mode === 'goal' && <div className="cp-dialog-description"><Markdown>{preview.goal.description}</Markdown></div>}
        {preview.mode === 'assessment' && preview.taskContent && <div className="cp-markdown" data-testid="cockpit-task-preview"><Markdown>{preview.taskContent}</Markdown></div>}
        {preview.mode === 'assessment' && preview.scoring && <details className="cp-rubric"><summary>Bewertungsregeln</summary>
          <p className="cp-dialog-description">Maximal {preview.scoring.maxPoints} Punkte · bestanden ab {preview.scoring.passingPoints} Punkten.</p>
          <div className="cp-markdown"><ul>{preview.scoring.steps.map(step => <li key={step.id}>
            <Markdown inline>{step.description}</Markdown> <strong>({step.points} Punkte)</strong></li>)}</ul></div>
        </details>}
        {preview.mode === 'cards' && <div className="cp-card-preview">{preview.cards?.map(card => <details key={card.id}>
          <summary><Markdown inline>{card.front}</Markdown></summary><div className="cp-markdown"><Markdown>{card.back}</Markdown></div>
        </details>)}</div>}
        {preview.mode !== 'cards' && <details className="cp-coach-preview" data-testid="cockpit-coach-preview">
          <summary>Coach-Startvorschau</summary>
          <div className="cp-markdown"><Markdown>{coachStartText}</Markdown></div>
        </details>}
      </div>
    </>}
  </dialog>
}

export function CockpitAboutDialog({ open, notice, sourcePaths, demoDate, onClose }: {
  open: boolean; notice: string; sourcePaths: string[]; demoDate: string; onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) element.showModal()
    else if (!open && element.open) element.close()
  }, [open])
  return <dialog ref={dialog} className="cp-dialog" data-testid="cockpit-about-dialog" aria-labelledby="cockpit-about-title"
    onKeyDownCapture={event => { if (event.key === 'Escape' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f')) event.stopPropagation() }}
    onCancel={event => { event.preventDefault(); onClose() }} onClose={onClose}>
    <div className="cp-dialog-top"><span>Quellen und Grenzen</span><button type="button" onClick={onClose} aria-label="Quellenhinweis schließen"><X size={18} /></button></div>
    <div className="cp-dialog-body"><h1 id="cockpit-about-title">Ein begrenzter Cockpit-Prototyp</h1>
      <p className="cp-dialog-description">{notice}</p>
      <div className="cp-markdown"><ul>
        <li>Die Lernziele, Prüfungsaufgabe und normale Rubrik stammen aus dem vorhandenen Mathematikbestand.</li>
        <li>Der Fortschrittsnenner enthält ausschließlich das Fachziel und seine Prüfung. Sichtbare Vorbereitungen und Karten sind Kontext.</li>
        <li>Die Szenarien sind lokale Testlernstände. Sie schreiben keine Ergebnisse und stellen keinen neuen curricularen Anerkennungsvertrag frei.</li>
        <li>Es gibt keine KI-Bewertung, keinen OAuth-Ablauf und keine echte Coach-Sitzung.</li>
      </ul></div>
      <div className="cp-dialog-source">Beispieldatum: {demoDate}<br />Verwendete Bestandsquellen:{sourcePaths.map(path => <div key={path}>{path}</div>)}</div>
    </div>
  </dialog>
}
