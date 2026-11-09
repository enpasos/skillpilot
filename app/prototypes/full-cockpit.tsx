/* eslint-disable react-refresh/only-export-components -- Isolated browser entry owns its React root. */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import { LanguageProvider } from '../src/contexts/LanguageContext'
import { ThemeProvider } from '../src/contexts/ThemeContext'
import { SessionSetup } from '../src/components/SessionSetup'
import { LearnerView } from '../src/views/LearnerView'
import { FullCockpitMap } from './FullCockpitMap'
import { fullCockpitData } from './fullCockpitData'
import { createFullCockpitApi } from './fullCockpitApi'
import '../src/index.css'
import 'katex/dist/katex.min.css'
import './full-cockpit.css'

// The preview shares an origin with other local previews, never their storage.
function isolatedStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() { return values.size },
    clear: () => values.clear(),
    getItem: key => values.get(String(key)) ?? null,
    key: index => [...values.keys()][index] ?? null,
    removeItem: key => { values.delete(String(key)) },
    setItem: (key, value) => { values.set(String(key), String(value)) },
  }
}
Object.defineProperty(window, 'localStorage', { configurable: true, value: isolatedStorage() })
Object.defineProperty(window, 'sessionStorage', { configurable: true, value: isolatedStorage() })
const api = createFullCockpitApi(fullCockpitData)
api.install()
const noRefresh = () => {}

function FullCockpitPreview() {
  const location = useLocation()
  const navigate = useNavigate()
  const coachSetupOpen = new URLSearchParams(location.search).get('start') === 'coach'
  const [role, setRole] = useState<'learner' | 'trainer' | 'explorer' | null>('learner')
  const [setupLearnerId, setSetupLearnerId] = useState(fullCockpitData.learnerId)
  const snapshot = useSyncExternalStore(api.subscribe, api.getSnapshot)
  const [selectedId, setSelectedId] = useState(fullCockpitData.initialGoalId)
  const initialGoal = fullCockpitData.goalIndexAll.get(fullCockpitData.initialGoalId)!
  const [landscapeId, setLandscapeId] = useState(fullCockpitData.rootLandscapeId)
  const [notice, setNotice] = useState(false)
  const [toast, setToast] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const currentGoal = fullCockpitData.goalIndexAll.get(selectedId) ?? initialGoal
  const notify = useCallback((_kind: unknown, message: string) => {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(''), 4500)
  }, [])
  useEffect(() => {
    if (notice && !dialog.current?.open) dialog.current?.showModal()
    else if (!notice) dialog.current?.close()
  }, [notice])
  useEffect(() => {
    // Original actions/dialogs remain inspectable; starts never leave this preview.
    const open = window.open
    const showStart = () => {
      notify('info', 'Lokale Vorschau: Es wird keine echte Coach-Sitzung gestartet.')
      return null
    }
    window.open = showStart
    const preventNavigation = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest?.('a')
      const href = anchor?.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('blob:') || anchor?.hasAttribute('download')) return
      // React Router handles these original setup/return links in memory.
      if (href.startsWith('/?start=coach') || href.startsWith('/learner/')) return
      event.preventDefault()
      event.stopPropagation()
      notify('info', 'Dieser Link wird in der lokalen Vorschau nicht geöffnet.')
    }
    document.addEventListener('click', preventNavigation, true)
    return () => {
      window.open = open
      document.removeEventListener('click', preventNavigation, true)
      clearTimeout(toastTimer.current)
    }
  }, [notify])

  const select = useCallback((id: string) => {
    const goal = fullCockpitData.goalIndexAll.get(id)
    if (!goal) return
    setSelectedId(id)
  }, [])
  const selectInLandscape = useCallback((_nextLandscapeId: string, id: string) => select(id), [select])
  const getMastery = useCallback((id: string) => snapshot.mastery[id] ?? 0, [snapshot.mastery])
  const logout = useCallback(() => notify('info', 'Lokale Vorschau: Abmelden verändert keinen echten Account.'), [notify])
  return <div className="full-cockpit-shell" data-testid="full-cockpit-comparison"
    data-selected-goal-id={selectedId} data-active-goal-id={snapshot.activeGoalId}>
    <header className="full-cockpit-comparison">
      <span className="full-cockpit-preview-label">Lokale Cockpit-Vorschau</span>
      <div className="full-cockpit-local-tools">
        <span className="full-cockpit-local-label">Lokale Testdaten</span>
        <select aria-label="Lokales Testprofil" data-testid="full-cockpit-scenario" value={snapshot.scenario}
          onChange={event => {
            const scenario = event.target.value as 'ordinary' | 'exam' | 'memory' | 'completed'
            api.selectScenario(scenario)
            select(scenario === 'memory' ? fullCockpitData.memoryId : scenario === 'exam' || scenario === 'completed'
              ? fullCockpitData.assessmentId : fullCockpitData.ordinaryId)
          }}>
          <option value="ordinary">Lernziel</option><option value="exam">Prüfung</option>
          <option value="memory">Lernkarten</option><option value="completed">Abgeschlossen</option>
        </select>
        <button type="button" className="full-cockpit-info" aria-label="Informationen zur lokalen Vorschau" title="Informationen zur lokalen Vorschau"
          onClick={() => setNotice(true)}><Info size={16} /></button>
      </div>
    </header>
    <div className="full-cockpit-host" hidden={coachSetupOpen} inert={coachSetupOpen}>
      <LearnerView rootGoals={fullCockpitData.rootGoals} goalIndexAll={fullCockpitData.goalIndexAll}
        getMastery={getMastery} currentGoal={currentGoal}
        onSelectGoal={select} onSelectGoalInLandscape={selectInLandscape}
        routeGoalId={selectedId} skillpilotId={fullCockpitData.learnerId} landscapeId={landscapeId}
        currentLandscapeHasMatchedCompositionView={false}
        availableLandscapes={fullCockpitData.availableLandscapes} rootLandscapeId={fullCockpitData.rootLandscapeId}
        parentMap={fullCockpitData.parentMap} onLandscapeChange={setLandscapeId}
        onRefresh={noRefresh} onScopeDataRefresh={noRefresh}
        onLogout={logout}
        onNotify={notify}
        renderGoalNavigationMap={props => <FullCockpitMap {...props} active={props.active && !coachSetupOpen && !notice} />} />
    </div>
    {coachSetupOpen && <section className="full-cockpit-coach-setup" aria-label="Coach einrichten">
      <button type="button" className="full-cockpit-setup-back" onClick={() => navigate('/learner/local')}>← Zum Cockpit</button>
      <SessionSetup role={role} setRole={setRole} skillpilotId={setupLearnerId} setSkillpilotId={setSetupLearnerId}
        onStart={() => navigate('/learner/local')} />
    </section>}
    <dialog ref={dialog} className="full-cockpit-notice" aria-label="Lokale Cockpitvorschau" onClose={() => setNotice(false)}>
      <p>Das vollständige Cockpit erhält eine zusätzliche Lernkarte neben dem gewohnten Baum.
        Einstellungen und Testaktionen bleiben ausschließlich in dieser Vorschau. Ein Neuladen setzt sie zurück.
        Coach-Starts verlassen die Vorschau nicht. Die Testhierarchie ist keine freigegebene Curriculumsaufteilung.</p>
      <button type="button" onClick={() => setNotice(false)}>Schließen</button>
    </dialog>
    {toast && <div className="full-cockpit-toast" role="status">{toast}</div>}
  </div>
}

const root = document.getElementById('root')
if (!root) throw new Error('Missing Cockpit preview root')
const reactRoot = createRoot(root)
reactRoot.render(<MemoryRouter initialEntries={['/learner/local']}><LanguageProvider><ThemeProvider><FullCockpitPreview /></ThemeProvider></LanguageProvider></MemoryRouter>)
import.meta.hot?.dispose(() => { reactRoot.unmount(); api.uninstall() })
