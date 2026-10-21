/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, ChevronDown,
  ChevronRight, ClipboardCheck, FileText, FlaskConical, GraduationCap,
  LayoutDashboard, ListChecks, Search, Send, Settings2, X,
} from 'lucide-react'
import './examCoursePlanPreview.css'

// Deliberately synthetic, inspectable UI data. No canonical goals, learner
// state, plan APIs or browser storage are read or changed by this preview.
type Topic = { id: string; title: string; goals?: string[]; children?: Topic[] }
const TOPICS: Topic[] = [
  { id: 'mechanics', title: 'Mechanik', children: [
    { id: 'motion', title: 'Bewegungen beschreiben', goals: ['position', 'speed', 'velocity-graph'] },
    { id: 'accelerated', title: 'Beschleunigte Bewegungen', children: [
      { id: 'acceleration', title: 'Gleichmäßig beschleunigte Bewegung', goals: ['acceleration', 'motion-law', 'diagram'] },
      { id: 'fall', title: 'Freier Fall', goals: ['acceleration', 'diagram', 'fall-law'] },
      { id: 'vertical', title: 'Senkrechter Wurf', goals: ['acceleration', 'initial-speed', 'turning-point'] },
    ] },
    { id: 'combined', title: 'Zusammengesetzte Bewegungen', children: [
      { id: 'horizontal', title: 'Waagerechter Wurf und Superposition', goals: ['superposition', 'trajectory'] },
      { id: 'vectors', title: 'Vektoren und Bezugssysteme', goals: ['vector-addition', 'reference-frame'] },
    ] },
    { id: 'circular', title: 'Kreisbewegungen', goals: ['circular-speed', 'centripetal-force'] },
    { id: 'forces', title: 'Kräfte und Bewegung', goals: ['newton', 'weight'] },
  ] },
  { id: 'thermo', title: 'Thermodynamik', children: [
    { id: 'temperature', title: 'Temperatur und Wärme', goals: ['temperature', 'heat'] },
    { id: 'gas', title: 'Gase und Zustandsänderungen', goals: ['gas-law', 'gas-model'] },
  ] },
]
const GOALS: Record<string, string> = {
  position: 'Ort und Bewegung beschreiben', speed: 'Geschwindigkeiten bestimmen',
  'velocity-graph': 'Geschwindigkeitsdiagramme lesen', acceleration: 'Beschleunigung deuten',
  'motion-law': 'Bewegungsgleichungen anwenden', diagram: 'Bewegungsdiagramme auswerten',
  'fall-law': 'Fallzeit und Fallstrecke bestimmen', 'initial-speed': 'Mit einer Anfangsgeschwindigkeit rechnen',
  'turning-point': 'Steigzeit und höchste Lage bestimmen', superposition: 'Bewegungen unabhängig überlagern',
  trajectory: 'Die Flugbahn eines waagerechten Wurfs beschreiben',
  'vector-addition': 'Vektoren addieren', 'reference-frame': 'Bezugssysteme wechseln',
  'circular-speed': 'Bahngeschwindigkeit bestimmen', 'centripetal-force': 'Zentripetalkraft erklären',
  newton: 'Kraft und Beschleunigung verknüpfen', weight: 'Gewichtskraft bestimmen',
  temperature: 'Temperaturen vergleichen', heat: 'Wärmeübertragung erklären',
  'gas-law': 'Gasgesetze anwenden', 'gas-model': 'Zustandsänderungen beschreiben',
}
type Task = { title: string; topics: string[]; kind: 'practice' | 'exam' }
const TASKS: Task[] = [
  { title: 'Ein Ball fällt vom Balkon', topics: ['fall'], kind: 'practice' },
  { title: 'Fallzeit und Fallhöhe vergleichen', topics: ['fall'], kind: 'practice' },
  { title: 'Messdaten zum freien Fall auswerten', topics: ['fall'], kind: 'practice' },
  { title: 'Ein Ball wird nach oben geworfen', topics: ['vertical'], kind: 'practice' },
  { title: 'Was passiert am höchsten Punkt?', topics: ['vertical'], kind: 'practice' },
  { title: 'Steig- und Fallbewegung im Diagramm', topics: ['vertical'], kind: 'practice' },
  { title: 'Eine Kugel verlässt die Tischkante', topics: ['horizontal'], kind: 'practice' },
  { title: 'Zwei Bewegungen, eine Flugbahn', topics: ['horizontal'], kind: 'practice' },
  { title: 'Probeklausur A · Freier Fall und senkrechter Wurf', topics: ['fall', 'vertical'], kind: 'exam' },
  { title: 'Probeklausur B · Fall- und Wurfbewegungen', topics: ['fall', 'vertical', 'horizontal'], kind: 'exam' },
]
const leaves = (topic: Topic): Topic[] => topic.children ? topic.children.flatMap(leaves) : [topic]
const ALL_LEAVES = TOPICS.flatMap(leaves)
const DEFAULT_IDS = ['fall', 'vertical', 'horizontal']
const DEFAULT_EXPANDED = ['mechanics', 'accelerated', 'combined']
const matchingTopic = (topic: Topic, query: string): boolean => topic.title.toLocaleLowerCase('de').includes(query)
  || Boolean(topic.children?.some(child => matchingTopic(child, query)))
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
const dateLabel = (date: string) => date ? new Intl.DateTimeFormat('de-DE', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${date}T12:00:00Z`)) : 'Termin wählen'

function TopicCheckbox({ checked, mixed, disabled, label, onChange }: {
  checked: boolean; mixed: boolean; disabled: boolean; label: string; onChange: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { if (input.current) input.current.indeterminate = mixed }, [mixed])
  return <input ref={input} className="topic-checkbox" type="checkbox" aria-label={label}
    aria-checked={mixed ? 'mixed' : checked} checked={checked} disabled={disabled}
    title={disabled ? 'Diesen Themenbereich in der vollständigen Ansicht auswählen' : undefined} onChange={onChange} />
}

function Preview() {
  const [selected, setSelected] = useState(new Set(DEFAULT_IDS))
  const [expanded, setExpanded] = useState(new Set(DEFAULT_EXPANDED))
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('Klausur: Fall- und Wurfbewegungen')
  const [date, setDate] = useState('2026-11-04')
  const [editing, setEditing] = useState(true)
  const [saved, setSaved] = useState({ ids: DEFAULT_IDS, title, date })
  const [notice, setNotice] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const selectedTopics = ALL_LEAVES.filter(topic => selected.has(topic.id))
  const goalIds = [...new Set(selectedTopics.flatMap(topic => topic.goals ?? []))]
  const availableTasks = TASKS.filter(task => task.topics.every(id => selected.has(id)))
  const practices = availableTasks.filter(task => task.kind === 'practice')
  const exams = availableTasks.filter(task => task.kind === 'exam')
  const query = search.trim().toLocaleLowerCase('de')
  const canApply = selected.size > 0 && Boolean(date) && Boolean(title.trim())

  function toggle(topic: Topic) {
    const ids = leaves(topic).map(leaf => leaf.id)
    setSelected(current => {
      const next = new Set(current)
      const remove = ids.every(id => current.has(id))
      ids.forEach(id => { if (remove) next.delete(id); else next.add(id) })
      return next
    })
    setNotice('')
  }
  function removeTopic(id: string) {
    setSelected(current => { const next = new Set(current); next.delete(id); return next })
  }
  function showPlan(apply: boolean) {
    if (apply) {
      setSaved({ ids: [...selected], title: title.trim(), date })
      setTitle(title.trim())
      setNotice('Auswahl für die Vorschau übernommen.')
    } else {
      setSelected(new Set(saved.ids)); setTitle(saved.title); setDate(saved.date); setNotice('')
    }
    setEditing(false)
    setSearch('')
    requestAnimationFrame(() => heading.current?.focus())
  }
  function edit() {
    setEditing(true); setNotice('')
    requestAnimationFrame(() => heading.current?.focus())
  }

  function renderTopic(topic: Topic, level = 0, ancestorMatched = false): React.ReactNode {
    if (query && !ancestorMatched && !matchingTopic(topic, query)) return null
    const ids = leaves(topic).map(leaf => leaf.id)
    const checked = ids.every(id => selected.has(id))
    const mixed = !checked && ids.some(id => selected.has(id))
    const ownMatch = ancestorMatched || Boolean(query && topic.title.toLocaleLowerCase('de').includes(query))
    const open = Boolean(query) || expanded.has(topic.id)
    const count = new Set(leaves(topic).flatMap(leaf => leaf.goals ?? [])).size
    return <li key={topic.id} className={`topic-node depth-${level}`}>
      <div className={`topic-row ${checked ? 'is-selected' : ''} ${topic.children ? 'is-branch' : ''}`}>
        {topic.children ? <button type="button" className="disclosure" aria-label={`${topic.title} ${open ? 'einklappen' : 'aufklappen'}`}
          aria-expanded={open} aria-controls={`children-${topic.id}`} onClick={() => setExpanded(current => {
            const next = new Set(current); if (next.has(topic.id)) next.delete(topic.id); else next.add(topic.id); return next
          })} disabled={Boolean(query)}>{open ? <ChevronDown /> : <ChevronRight />}</button>
          : <span className="leaf-spacer" aria-hidden="true" />}
        <label className="topic-label">
          <TopicCheckbox checked={checked} mixed={mixed} disabled={Boolean(query) && !ownMatch} label={`${topic.title} auswählen`} onChange={() => toggle(topic)} />
          <span className="topic-name">{topic.title}</span>
          <span className="topic-count">{count}<span className="count-label"> Lernziele</span></span>
        </label>
      </div>
      {topic.children && open && <ul id={`children-${topic.id}`} className="topic-children">
        {topic.children.map(child => renderTopic(child, level + 1, ownMatch))}
      </ul>}
    </li>
  }

  return <div className="preview-shell">
    <aside className="app-sidebar" aria-label="Kurskontext">
      <div className="brand"><Send aria-hidden="true" /><span>SkillPilot</span></div>
      <div className="sidebar-label">MEIN LERNEN</div>
      <div className="nav-item muted"><LayoutDashboard aria-hidden="true" />Cockpit</div>
      <div className="nav-item muted"><BookOpen aria-hidden="true" />Lernziele</div>
      <div className="nav-item active" aria-current="page"><CalendarDays aria-hidden="true" />Kursplanung</div>
      <div className="sidebar-course"><span className="subject-symbol"><FlaskConical aria-hidden="true" /></span>
        <div><strong>Physik LK</strong><span>Gymnasium · Hessen</span></div>
      </div>
      <div className="sidebar-bottom"><GraduationCap aria-hidden="true" /><span>Dein Kurs. Dein Lernweg.</span></div>
    </aside>

    <div className="workspace">
      <div className="preview-bar"><span><span className="preview-dot" />Interaktive Vorschau</span><span>Beispieldaten · keine Speicherung</span></div>
      <main>
        <div className="breadcrumb"><CalendarDays aria-hidden="true" />Kursplanung<ChevronRight aria-hidden="true" /><span>Physik LK</span></div>
        <header className="page-heading">
          <div><p className="eyebrow">DEINE KURSPLANUNG</p><h1 ref={heading} tabIndex={-1}>{editing ? 'Klausurstoff auswählen' : 'Deine Klausurvorbereitung'}</h1>
            <p className="page-description">{editing ? 'Wähle die Themen aus, die in deiner Klausur vorkommen.' : 'Deine ausgewählten Themen, Lernziele und Aufgaben an einem Ort.'}</p>
          </div>
          <span className="course-badge"><FlaskConical aria-hidden="true" />Physik LK<span>Hessen</span></span>
        </header>

        {notice && <div className="success-notice" role="status"><Check aria-hidden="true" />{notice}</div>}
        {editing ? <>
          <section className="exam-details" aria-label="Klausurangaben">
            <label className="name-field"><span>Bezeichnung</span><input value={title} maxLength={160} onChange={event => setTitle(event.target.value)} /></label>
            <label className="date-field"><span>Klausurtermin</span><input type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
          </section>

          <div className="selection-layout">
            <section className="topic-panel" aria-labelledby="topics-heading">
              <div className="panel-heading"><h2 id="topics-heading">Themen auswählen</h2><span>Mehrfachauswahl</span></div>
              <div className="tree-tools"><div className="search-field"><Search aria-hidden="true" /><input type="search" aria-label="Themen durchsuchen" placeholder="Thema suchen …" value={search} onChange={event => setSearch(event.target.value)} />
                {search && <button type="button" aria-label="Suche zurücksetzen" onClick={() => setSearch('')}><X /></button>}</div>
                <button type="button" className="text-button clear-button" disabled={selected.size === 0} onClick={() => setSelected(new Set())}>Auswahl aufheben</button>
              </div>
              <ul className="topic-tree" aria-label="Themen in Physik LK">{TOPICS.map(topic => renderTopic(topic))}</ul>
              {query && !TOPICS.some(topic => matchingTopic(topic, query)) && <div className="empty-search"><Search aria-hidden="true" /><strong>Kein passendes Thema gefunden</strong><span>Versuche einen anderen Suchbegriff. Deine Auswahl bleibt erhalten.</span></div>}
              <div className="tree-note"><ListChecks aria-hidden="true" /><span>Ein Häkchen wählt das Thema mit seinen Unterthemen aus.</span></div>
            </section>

            <aside className="selection-summary" aria-labelledby="selection-heading">
              <div className="summary-card"><div className="summary-heading"><span className="summary-icon"><ClipboardCheck aria-hidden="true" /></span><h2 id="selection-heading">Deine Auswahl</h2></div>
                <div className="summary-metric" aria-live="polite"><strong>{goalIds.length}</strong><span>{goalIds.length === 1 ? 'Lernziel' : 'Lernziele'}<small>aus {plural(selectedTopics.length, 'Thema', 'Themen')}</small></span></div>
                {selectedTopics.length > 0 ? <ul className="selected-list">{selectedTopics.map(topic => <li key={topic.id}><Check aria-hidden="true" /><span>{topic.title}</span><button type="button" aria-label={`${topic.title} entfernen`} onClick={() => removeTopic(topic.id)}><X /></button></li>)}</ul>
                  : <p className="empty-selection">Wähle ein oder mehrere Themen für deine Klausur aus.</p>}
                <p className="dedup-note">Gemeinsame Lernziele werden nur einmal gezählt.</p>
                {goalIds.length > 0 && <details className="goal-details"><summary>Lernziele ansehen<ChevronDown aria-hidden="true" /></summary><ul>{goalIds.map(id => <li key={id}>{GOALS[id]}</li>)}</ul></details>}
              </div>
              <div className="task-card"><h3><FileText aria-hidden="true" />Passende Aufgaben</h3><p>Zur ausgewählten Themenkombination</p>
                <div className="task-counts"><span><strong>{practices.length}</strong>Übungen</span><span><strong>{exams.length}</strong>Probeklausuren</span></div>
                {availableTasks.length > 0 ? <details className="goal-details"><summary>Aufgaben ansehen<ChevronDown aria-hidden="true" /></summary><ul>{availableTasks.map(task => <li key={task.title}>{task.title}</li>)}</ul></details>
                  : <p className="empty-tasks">Für diese Auswahl sind keine Beispielaufgaben hinterlegt.</p>}
              </div>
            </aside>
          </div>

          <footer className="selection-footer"><div><span className="footer-check"><Check aria-hidden="true" /></span><p><strong>{plural(selectedTopics.length, 'Thema', 'Themen')} ausgewählt</strong><span>Du kannst die Auswahl später ändern.</span></p></div>
            <div className="footer-actions"><button className="secondary-button" type="button" onClick={() => showPlan(false)}>Abbrechen</button><button className="primary-button" type="button" disabled={!canApply} onClick={() => showPlan(true)}>Auswahl übernehmen<ArrowRight aria-hidden="true" /></button></div>
          </footer>
        </> : <section className="plan-preview" aria-label="Übernommene Klausurplanung">
          <div className="plan-date"><CalendarDays aria-hidden="true" /><span>Klausurtermin<strong>{dateLabel(date)}</strong></span><span className="plan-date-badge">Physik LK</span></div>
          <div className="plan-content"><h2>{title}</h2><p>Diese Themen gehören zu deiner Vorbereitung:</p><ul className="plan-topics">{selectedTopics.map(topic => <li key={topic.id}><Check aria-hidden="true" />{topic.title}</li>)}</ul>
            <div className="plan-counts"><span><BookOpen aria-hidden="true" /><strong>{goalIds.length}</strong> Lernziele</span><span><FileText aria-hidden="true" /><strong>{practices.length}</strong> Übungen</span><span><ClipboardCheck aria-hidden="true" /><strong>{exams.length}</strong> Probeklausuren</span></div>
            <div className="plan-next"><span className="summary-icon"><ListChecks aria-hidden="true" /></span><div><h3>Ein Umfang für beide Lernwege</h3><p>Diese Auswahl bildet die Grundlage für den schrittweisen Aufbau und eine Diagnose zum Einstieg.</p></div></div>
            <button className="secondary-button" type="button" onClick={edit}><Settings2 aria-hidden="true" />Themenauswahl bearbeiten</button>
          </div>
        </section>}
        <p className="preview-footnote">Oberflächenentwurf mit beispielhaften Themen, Lernzielen und Aufgaben. Der Termin ist ein Beispieldatum.</p>
        {!editing && <button type="button" className="text-button back-link" onClick={edit}><ArrowLeft aria-hidden="true" />Zur Themenauswahl</button>}
      </main>
    </div>
  </div>
}

createRoot(document.getElementById('root')!).render(<Preview />)
