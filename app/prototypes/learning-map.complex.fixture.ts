import type { LearningMapEntry, LearningMapFixture, MapEntryKind } from '../src/components/learningUnitMap/types'

// Synthetic layout benchmark: 56 sibling areas, 98 root edges, three isolated optional areas,
// five branches with three unit drill levels, and no learner state or API calls.
// This is navigation material, not reviewed curriculum or an access policy.
// Requires points consumer -> prerequisite; the map draws the inverse direction.
type Area = { id: string; title: string; requires: string[] }

const areas: Area[] = [
  { id: 'tools', title: 'Mathematische Werkzeuge', requires: [] },
  { id: 'quantities', title: 'Größen und Einheiten', requires: ['tools'] },
  { id: 'graphs', title: 'Diagramme', requires: ['tools'] },
  { id: 'linear', title: 'Lineare Zusammenhänge', requires: ['tools'] },
  { id: 'powers', title: 'Potenzen und Skalen', requires: ['tools'] },
  { id: 'geometry', title: 'Geometrie', requires: ['tools'] },
  { id: 'trigonometry', title: 'Winkel und Dreiecke', requires: ['geometry', 'powers'] },
  { id: 'vectors', title: 'Vektoren', requires: ['trigonometry', 'linear'] },
  { id: 'probability', title: 'Zufall und Wahrscheinlichkeit', requires: ['tools'] },
  { id: 'statistics', title: 'Statistik', requires: ['probability', 'graphs'] },
  { id: 'algorithms', title: 'Algorithmen', requires: ['linear'] },
  { id: 'experiments', title: 'Experimente planen', requires: ['quantities', 'graphs'] },
  { id: 'measurement', title: 'Messverfahren', requires: ['experiments'] },
  { id: 'uncertainty', title: 'Messunsicherheit', requires: ['measurement', 'statistics'] },
  { id: 'data-analysis', title: 'Daten auswerten', requires: ['algorithms', 'statistics', 'measurement'] },
  { id: 'models', title: 'Modelle prüfen', requires: ['linear', 'graphs', 'geometry'] },
  { id: 'kinematics', title: 'Bewegungen beschreiben', requires: ['models', 'vectors', 'measurement'] },
  { id: 'dynamics', title: 'Kräfte und Bewegung', requires: ['kinematics'] },
  { id: 'energy', title: 'Energie', requires: ['dynamics'] },
  { id: 'momentum', title: 'Impuls', requires: ['dynamics'] },
  { id: 'rotation', title: 'Drehbewegungen', requires: ['dynamics'] },
  { id: 'oscillation', title: 'Schwingungen', requires: ['energy'] },
  { id: 'waves', title: 'Wellen', requires: ['oscillation'] },
  { id: 'sound', title: 'Schall', requires: ['waves', 'statistics'] },
  { id: 'optics', title: 'Licht und Bilder', requires: ['models'] },
  { id: 'particles', title: 'Teilchenmodelle', requires: ['probability', 'models'] },
  { id: 'charge', title: 'Elektrische Ladung', requires: ['particles', 'quantities'] },
  { id: 'electric-fields', title: 'Elektrische Felder', requires: ['charge', 'vectors'] },
  { id: 'circuits', title: 'Stromkreise', requires: ['charge', 'measurement'] },
  { id: 'magnetic-fields', title: 'Magnetfelder', requires: ['vectors', 'charge'] },
  { id: 'induction', title: 'Induktion', requires: ['magnetic-fields', 'circuits'] },
  { id: 'alternating-current', title: 'Wechselstrom', requires: ['induction', 'oscillation'] },
  { id: 'electromagnetic-waves', title: 'Elektromagnetische Wellen', requires: ['electric-fields', 'magnetic-fields', 'waves'] },
  { id: 'temperature', title: 'Temperatur', requires: ['particles', 'measurement'] },
  { id: 'gases', title: 'Gase', requires: ['temperature', 'statistics'] },
  { id: 'heat', title: 'Wärmeübertragung', requires: ['gases', 'energy'] },
  { id: 'entropy', title: 'Entropie', requires: ['heat'] },
  { id: 'atoms', title: 'Atome', requires: ['particles', 'optics'] },
  { id: 'quantum', title: 'Quantenobjekte', requires: ['atoms', 'electric-fields'] },
  { id: 'matter-waves', title: 'Materiewellen', requires: ['quantum', 'waves'] },
  { id: 'nuclei', title: 'Atomkerne', requires: ['atoms', 'statistics'] },
  { id: 'radioactivity', title: 'Radioaktivität', requires: ['nuclei', 'uncertainty'] },
  { id: 'relativity', title: 'Relativität', requires: ['kinematics', 'electric-fields'] },
  { id: 'astronomy', title: 'Astronomie', requires: ['optics', 'rotation', 'statistics'] },
  { id: 'stars', title: 'Sterne', requires: ['astronomy', 'heat', 'nuclei'] },
  { id: 'cosmology', title: 'Kosmologie', requires: ['stars', 'relativity'] },
  { id: 'climate', title: 'Klimamodelle', requires: ['heat', 'data-analysis', 'electromagnetic-waves'] },
  { id: 'energy-technology', title: 'Energietechnik', requires: ['circuits', 'heat'] },
  { id: 'sensors', title: 'Sensoren', requires: ['measurement', 'optics', 'electric-fields'] },
  { id: 'feedback', title: 'Regelung', requires: ['sensors', 'algorithms', 'dynamics'] },
  { id: 'simulation', title: 'Simulationen', requires: ['models', 'data-analysis'] },
  { id: 'argumentation', title: 'Wissenschaftlich argumentieren', requires: ['uncertainty', 'models'] },
  { id: 'research', title: 'Forschungswerkstatt', requires: ['simulation', 'argumentation', 'feedback'] },
  { id: 'optional-acoustics', title: 'Wahlbereich Akustik', requires: [] },
  { id: 'optional-microscopy', title: 'Wahlbereich Mikroskopie', requires: [] },
  { id: 'optional-astrophoto', title: 'Wahlbereich Astrofotografie', requires: [] },
]

const entries: Record<string, LearningMapEntry> = {}
const id = (value: string) => `demo:complex:${value}`
const labels: Record<MapEntryKind, string> = {
  unit: 'Lerneinheit',
  motivation: 'Motivation',
  goal: 'Fachliches Lernziel',
  assessment: 'Prüfung',
  memory: 'Lernkarten',
}

const add = (
  suffix: string,
  title: string,
  kind: MapEntryKind,
  description: string,
  requires: string[] = [],
  children?: string[],
) => {
  const entryId = id(suffix)
  entries[entryId] = {
    id: entryId,
    title,
    kind,
    description,
    requires: requires.map(id),
    ...(children ? { children: children.map(id) } : {}),
    // Deliberately neutral: the layout engine must place every current scope.
    position: { x: 0, y: 0 },
    eyebrow: labels[kind],
  }
}

// The demo authoring templates explicitly connect each scope's entry branches
// to its own motivation; the UI never manufactures those requires edges.
const addLeafScope = (suffix: string, title: string, withMemory = false) => {
  const children = [`${suffix}:motivation`, `${suffix}:idea`, `${suffix}:application`, `${suffix}:assessment`]
  if (withMemory) children.push(`${suffix}:memory`)
  entries[id(suffix)].children = children.map(id)
  add(`${suffix}:motivation`, 'Worum geht es?', 'motivation', `Den Nutzen von „${title}“ an einer Alltagssituation erkunden.`)
  add(`${suffix}:idea`, 'Die Grundidee erklären', 'goal', `Wesentliche Größen und Zusammenhänge im Bereich „${title}“ beschreiben.`, [`${suffix}:motivation`])
  add(`${suffix}:application`, 'Eine Situation untersuchen', 'goal', 'Die Grundidee auf eine neue Beispielsituation beziehen.', [`${suffix}:idea`])
  add(`${suffix}:assessment`, 'Selbstständig anwenden', 'assessment', 'Platzhalter für eine vollständige Anwendung; die Demo vergibt kein Ergebnis.', [`${suffix}:application`])
  if (withMemory) add(`${suffix}:memory`, 'Grundbegriffe abrufen', 'memory', 'Eine eigene Abrufpflicht; ein Prüfungsversuch ersetzt sie nicht.', [`${suffix}:motivation`])
}

const deepBranches: Record<string, [string, string]> = {
  kinematics: ['Bewegungen vergleichen', 'Gleichförmige Bewegung'],
  circuits: ['Elektrische Netzwerke', 'Reihenschaltungen'],
  'data-analysis': ['Messdaten ordnen', 'Verteilungen vergleichen'],
  models: ['Modellgrenzen untersuchen', 'Vorhersagen vergleichen'],
  astronomy: ['Den Himmel beobachten', 'Helligkeiten vergleichen'],
}

for (const area of areas) {
  add(area.id, area.title, 'unit', `Ein erfundener Demolernbereich: ${area.title}.`, area.requires)
  const deep = deepBranches[area.id]
  if (!deep) {
    addLeafScope(area.id, area.title, ['quantities', 'dynamics', 'atoms', 'temperature'].includes(area.id))
    continue
  }
  const topic = `${area.id}:topic`
  const detail = `${area.id}:topic:detail`
  entries[id(area.id)].children = [`${area.id}:motivation`, topic, `${area.id}:synthesis`].map(id)
  add(`${area.id}:motivation`, 'Ein größerer Zusammenhang', 'motivation', 'Den gemeinsamen Nutzen der kleineren Einheiten entdecken.')
  add(topic, deep[0], 'unit', 'Eine untergeordnete Einheit mit eigenem Lernversprechen.', [`${area.id}:motivation`],
    [`${topic}:motivation`, detail, `${topic}:connect`, `${topic}:assessment`])
  add(`${topic}:motivation`, 'Eine konkrete Frage', 'motivation', 'Den Einstieg in diesen Teilbereich erkunden.')
  add(detail, deep[1], 'unit', 'Eine dritte Unit-Ebene mit fachlichen Zielen, Prüfung und Karten.', [`${topic}:motivation`])
  addLeafScope(detail, deep[1], true)
  add(`${topic}:connect`, 'Zusammenhänge verbinden', 'goal', 'Die Ergebnisse der kleineren Einheit in einen Zusammenhang einordnen.', [detail])
  add(`${topic}:assessment`, 'Den Zusammenhang begründen', 'assessment', 'Eine eigene Anwendung des Lernversprechens dieser Einheit.', [`${topic}:connect`])
  add(`${area.id}:synthesis`, 'Eine Synthese versuchen', 'assessment', 'Ein eigener Integrationsversuch auf Grundlage der untergeordneten Einheit; er besteht keine Kindprüfung und keine Karten.', [topic])
}

add('root', 'Eine große Lernkarte', 'unit', '56 Demobereiche zum Prüfen von Übersicht, Navigation und automatischer Anordnung.', [], areas.map(area => area.id))

export const complexLearningMapFixture: LearningMapFixture = {
  rootId: id('root'),
  title: '56 Lernbereiche erkunden',
  entries,
}
