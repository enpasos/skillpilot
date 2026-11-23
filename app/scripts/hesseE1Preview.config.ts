import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, mergeConfig, type Plugin } from 'vite'
import baseConfig from '../vite.config'
import { CURRENT_TERMS_VERSION } from '../src/utils/legalTermsVersion'

const appRoot = resolve(import.meta.dirname, '..')
const runtime = process.env.SKILLPILOT_E1_PREVIEW_DIR
if (!runtime) throw new Error('Start this preview with scripts/preview_hessen_physics_e1.py.')
const course = process.env.SKILLPILOT_E1_PHYSICS_COURSE === 'LK' ? 'LK' : 'GK'

const scope = JSON.parse(readFileSync(resolve(appRoot,
  '../docs/concept/skill-graph/examples/hessen-physik-e1/umfang.json'), 'utf8'))
const child = JSON.parse(readFileSync(resolve(appRoot,
  '../curricula/DE/Gymnasium/materials/physics/he-e1-accelerated-and-free-fall.json'), 'utf8')).unit
const profileFile = resolve(runtime, 'profiles.json')

type GradedScenario = {
  asOf: string
  passed: number
  credited: number
  individuallyOpen: number
  completed: number
  planPositionCount: number | null
  unitAssignments?: { title: string, status: string, passedParts: number | null, requiredParts: number }[]
  next: string
  frontier: { id: string, title: string }[]
  targetedFrontier: { id: string, title: string, offered: boolean }[]
  strictTargetedFrontier: { id: string, title: string, offered: boolean }[]
}
const unitEntries: Record<string, string> = { offen: 'unitOpen', CD: 'unitCD', ABCD: 'unitABCD', gemischt: 'mixed' }
const html = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
function compareScenarios(duration: string, assignments = false) {
  const initial: Record<string, GradedScenario> = JSON.parse(readFileSync(resolve(runtime!, 'grading.json'), 'utf8'))
  if (assignments) {
    if (!initial[duration + '/unitOpen']) return null
    const rows = [
      ['offen', 'Einheitenauftrag ohne Beleg'], ['CD', 'Einheitenauftrag mit C und D'],
      ['ABCD', 'Einheitenauftrag mit A bis D'], ['gemischt', 'A bis D und zusätzlicher Einzelauftrag'],
    ].map(([key, title]) => {
      const data = initial[duration + '/' + unitEntries[key]]
      const unit = data.unitAssignments?.[0]
      const state = unit?.status === 'completed' ? 'abgeschlossen' : unit?.status === 'active' ? 'aktiv' : 'nicht verfügbar'
      return `<tr><th scope="row"><a href="/auftraege/${duration}/${key}">${title}</a></th><td>${html(state)}</td>
        <td>${unit?.passedParts ?? '–'} / ${unit?.requiredParts ?? '–'}</td><td>${html(data.next || 'Kein weiterer Vorschlag')}</td></tr>`
    })
    return `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Einheitenaufträge E.1 (${duration} · ${course})</title><style>body{font:1rem/1.5 system-ui;margin:2rem auto;padding:0 1rem;max-width:65rem}
      table{border-collapse:collapse}th,td{text-align:left;vertical-align:top;padding:.6em;border-bottom:1px solid #aaa}a{color:#174e74}</style>
      <h1>Einheitenaufträge E.1 (${duration} · ${course})</h1><p>Die vier Prüfungsteile beenden den ausdrücklich gewählten Einheitenauftrag.
      Einzeln noch offene Fachziele kannst du freiwillig bearbeiten. Ein zusätzlich ausgewählter Einzelauftrag bleibt bestehen.</p>
      <p>Stand beim Start der Vorschau. Die Auftragsnamen öffnen das jeweilige reguläre Cockpit.</p>
      <table><thead><tr><th>Auftrag</th><th>Status</th><th>Bestandene Teile</th><th>Nächster Planvorschlag</th></tr></thead><tbody>${rows.join('')}</tbody></table>
      <p><a href="/vergleich/${duration}">Zum Vergleich mit dem Einzelzielplan</a></p></html>`
  }
  const scenarios = [['viewer', 'Kein Prüfungsteil bestanden'], ['CD', 'C und D bestanden'], ['ABCD', 'Alle vier bestanden']]
  const sections = scenarios.map(([key, label]) => {
    const row = initial[duration + '/' + key]
    const url = key === 'viewer' ? '/nativ/' + duration + '/E1' : '/vergleich/' + duration + '/' + key
    return `<section><h2><a href="${url}">${label}</a></h2>
      <dl><dt>Prüfungsteile</dt><dd>${row.passed} von 4</dd><dt>Für den Plan angerechnete Fachziele</dt><dd>${row.credited}</dd>
      <dt>Erledigte Positionen im E.1-Lernplan</dt><dd>${row.completed}</dd>
      <dt>Weiterhin einzeln nachzuweisende Fachziele</dt><dd>${row.individuallyOpen}</dd>
      <dt>Nächster Planvorschlag</dt><dd>${html(row.next || 'Kein Vorschlag')}</dd></dl>
      <h3>Lernfront im aktuellen Fokus (${row.frontier.length})</h3><ul>${row.frontier.map(goal =>
        '<li>' + html(goal.title) + '</li>').join('')}</ul>
      <h3>Bei gezieltem Fokus auf einen Nachfolger</h3>
      <table><thead><tr><th>Ziel</th><th>Standard</th><th>Strikt</th></tr></thead><tbody>${row.targetedFrontier.map(goal =>
        '<tr><td>' + html(goal.title) + '</td><td>' + (goal.offered ? 'angeboten' : 'nicht angeboten') + '</td><td>'
        + (row.strictTargetedFrontier.find(other => other.id === goal.id)?.offered ? 'angeboten' : 'nicht angeboten') + '</td></tr>').join('')}</tbody></table>
      </section>`
  })
  return `<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>E.1 – Lernplan und Lernfront (${duration} · ${course})</title>
    <style>body{font:1rem/1.5 system-ui;margin:2rem auto;padding:0 1rem;max-width:80rem;color:#17202b}main{display:grid;
    grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr));gap:1.5rem}dt{font-weight:600}dd{margin:0 0 .6em}
    section{border-top:2px solid #436e84}ul{padding-inline-start:1.3em}a{color:#174e74}th,td{text-align:left;vertical-align:top;padding:.3em}</style>
    <h1>E.1 – Lernplan und Lernfront (${duration} · ${course})</h1><p>Stand bei Vorschau-Start am ${html(initial[duration + '/viewer'].asOf)}.
    Alle drei Profile haben den Abschnitt E.1 als Einzelzielplan gewählt. Daraus ergeben sich ${initial[duration + '/viewer'].planPositionCount} Planpositionen.
    ${course === 'LK' ? 'Die Zusatzprüfungen zum waagerechten Wurf und zur Mehrphasenbewegung lassen sich einzeln dazuwählen.' : 'Die Zusatzprüfung zum waagerechten Wurf lässt sich einzeln dazuwählen.'}
    Die verlinkten Überschriften öffnen das jeweilige Cockpit.</p>
    <p>Die Prüfungsbelege stammen aus lokalen Bewertungen mit synthetischen Punkten an der Bestehensgrenze.
    Die Anmeldung des Coaches ist simuliert. Einzelne Fachziele wurden bei der Einrichtung nicht als gemeistert verbucht.</p>
    ${initial[duration + '/unitOpen'] ? '<p><a href="/auftraege/' + duration + '">Zum ausdrücklich gewählten E.1-Einheitenauftrag</a></p>' : ''}
    <main>${sections.join('')}</main></html>`
}

const entry: Plugin = {
  name: 'hesse-e1-synthetic-profile-entry',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1')
      const match = /^\/(nativ|testlauf)\/(G8|G9)\/(E1(?:\/freier-fall)?|[ABCD])\/?$/.exec(url.pathname)
      const math = url.pathname === '/vergleich/mathematik'
      const graded = /^\/vergleich\/(G8|G9)(?:\/(CD|ABCD|einstiege|elterneinstieg))?\/?$/.exec(url.pathname)
      const units = /^\/auftraege\/(G8|G9)(?:\/(offen|CD|ABCD|gemischt))?\/?$/.exec(url.pathname)
      if ((!match && !math && !graded && !units) || request.method !== 'GET') return next()
      if ((graded && !graded[2]) || (units && !units[2])) {
        const body = compareScenarios((graded ?? units)![1], !!units)
        if (!body) return next()
        response.setHeader('Cache-Control', 'no-store')
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.end(body)
        return
      }
      const [, entryType, duration, part] = match ?? ['', 'vergleich', (graded ?? units)?.[1], 'E1']
      if (entryType === 'testlauf' && !['A', 'B'].includes(part)) return next()
      const profiles = JSON.parse(readFileSync(profileFile, 'utf8'))
      if (math && !profiles.mathematik) return next()
      if (units && !profiles[duration!]?.[unitEntries[units[2]]]) return next()
      const scenario = graded?.[2] === 'einstiege' ? 'oriented' : graded?.[2] === 'elterneinstieg' ? 'parentOriented' : graded?.[2]
      const id = units ? profiles[duration!][unitEntries[units[2]]] : math ? profiles.mathematik.viewer : profiles[duration!][scenario ?? (entryType === 'nativ' ? 'viewer' : part)]
      const goals = [...scope.ownAssessmentGoalIds, ...scope.childAssessmentGoalIds]
      let goal = math ? profiles.mathematik.goal : part === 'E1' ? profiles[duration!].E1 : goals['ABCD'.indexOf(part!)]
      if (part === 'E1/freier-fall') {
        const parent: string = profiles[duration!].E1
        goal = parent.slice(0, parent.lastIndexOf(':') + 1) + child.compositionNodeId
      }
      const keys = {
        skillpilot_id: id,
        skillpilot_role: 'learner',
        skillpilot_lang: url.searchParams.get('lang') === 'en' ? 'en' : 'de',
        skillpilot_learner_landscape: 'a0e13c56-c25f-4742-9272-3a1a603ee52e',
        skillpilot_terms_accepted_version: CURRENT_TERMS_VERSION,
      }
      response.setHeader('Cache-Control', 'no-store')
      response.setHeader('Referrer-Policy', 'no-referrer')
      response.setHeader('Content-Type', 'text/html; charset=utf-8')
      response.end('<!doctype html><meta charset="utf-8"><title>SkillPilot</title><script>' +
        'for(const [key,value] of Object.entries(' + JSON.stringify(keys) + '))localStorage.setItem(key,value);' +
        'location.replace(' + JSON.stringify('/learner/' + goal + '?l=' + keys.skillpilot_learner_landscape) + ')</script>')
    })
  },
}

export default defineConfig(async env => {
  const base = typeof baseConfig === 'function' ? await baseConfig(env) : await baseConfig
  return mergeConfig(base, {
    root: appRoot,
    cacheDir: resolve(runtime, 'vite-cache'),
    define: { 'import.meta.env.VITE_API_BASE': JSON.stringify('') },
    plugins: [entry],
  })
})
