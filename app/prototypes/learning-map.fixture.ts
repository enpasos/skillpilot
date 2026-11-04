import type { LearningMapEntry, LearningMapFixture, MapEntryKind } from '../src/components/learningUnitMap/types'

// Synthetic navigation data only: no curriculum, learner result or access policy.
// `requires` points from the consumer to its preparation. The map reverses it.
// Motivation is authored into each applicable scope's entry routes below;
// the map does not invent these dependencies from node types.
const entry = (
  id: string,
  title: string,
  description: string,
  kind: MapEntryKind,
  x: number,
  y: number,
  requires: string[] = [],
  children?: string[],
): LearningMapEntry => ({
  id: `demo:${id}`,
  title,
  description,
  kind,
  requires: requires.map(value => `demo:${value}`),
  ...(children ? { children: children.map(value => `demo:${value}`) } : {}),
  position: { x, y },
  eyebrow: {
    unit: 'Lerneinheit',
    motivation: 'Motivation',
    goal: 'Fachliches Lernziel',
    assessment: 'Prüfung',
    memory: 'Lernkarten',
  }[kind],
})

const entries: LearningMapEntry[] = [
  entry('root', 'Physik verstehen', 'Eine kleine erfundene Lernkarte zum Ausprobieren.', 'unit', 0, 0, [],
    ['tools', 'mechanics', 'models', 'motion']),
  entry('tools', 'Mathematische Werkzeuge', 'Mit Größen, Einheiten und Diagrammen sicher umgehen.', 'unit', 60, 200, [],
    ['tools:motivation', 'tools:units', 'tools:graphs']),
  entry('mechanics', 'Mechanik', 'Bewegung beschreiben und ihre Ursachen untersuchen.', 'unit', 420, 40, ['tools'],
    ['mechanics:motivation', 'kinematics', 'dynamics', 'mechanics:synthesis']),
  entry('models', 'Modelle', 'Annahmen erkennen und Beschreibungen mit Beobachtungen vergleichen.', 'unit', 420, 360, ['tools'],
    ['models:motivation', 'models:assumptions', 'models:compare', 'models:assessment']),
  entry('motion', 'Bewegung verstehen', 'Mechanik und Modelle zu einer begründeten Erklärung verbinden.', 'unit', 780, 200, ['mechanics', 'models'],
    ['motion:motivation', 'motion:plan', 'motion:synthesis']),

  entry('tools:motivation', 'Eine gemeinsame Sprache', 'Warum helfen Einheiten und Diagramme beim Beschreiben einer Bewegung?', 'motivation', 60, 180),
  entry('tools:units', 'Größen und Einheiten', 'Messgrößen lesen, Einheiten unterscheiden und passend umrechnen.', 'unit', 420, 180, ['tools:motivation'],
    ['tools:units:motivation', 'tools:units:convert', 'tools:units:assessment', 'tools:units:memory']),
  entry('tools:graphs', 'Diagramme lesen', 'Aus einem Diagramm Größen und Veränderungen entnehmen.', 'unit', 780, 180, ['tools:motivation'],
    ['tools:graphs:read', 'tools:graphs:assessment']),
  entry('tools:units:motivation', 'Was bedeutet die Zahl?', 'Eine Messzahl wird erst mit ihrer Größe und Einheit verständlich.', 'motivation', 60, 180),
  entry('tools:units:convert', 'Einheiten passend umrechnen', 'Zwischen gebräuchlichen Längen- und Zeiteinheiten wechseln.', 'goal', 420, 180, ['tools:units:motivation']),
  entry('tools:units:assessment', 'Eine Messung verständlich berichten', 'Platz für einen selbstständigen Anwendungsversuch mit Einheiten.', 'assessment', 780, 180, ['tools:units:convert']),
  entry('tools:units:memory', 'Einheiten abrufen', 'Ein eigener Kartenbereich für benötigte Größen und Einheiten.', 'memory', 420, 430, ['tools:units:motivation']),
  entry('tools:graphs:read', 'Achsen und Verlauf deuten', 'Achsenbeschriftung, Einheit und Verlauf eines Diagramms erklären.', 'goal', 60, 180),
  entry('tools:graphs:assessment', 'Ein unbekanntes Diagramm erklären', 'Platz für eine eigenständige Diagrammdeutung.', 'assessment', 420, 180, ['tools:graphs:read']),

  entry('mechanics:motivation', 'Was bewegt sich hier?', 'An einer Alltagsbewegung zwischen Beschreibung und Erklärung unterscheiden.', 'motivation', 60, 40),
  entry('kinematics', 'Kinematik', 'Beschreiben, wie sich ein Körper bewegt.', 'unit', 60, 290, ['mechanics:motivation'],
    ['kinematics:motivation', 'uniform', 'accelerated']),
  entry('dynamics', 'Dynamik', 'Untersuchen, wie Kräfte eine Bewegung verändern.', 'unit', 420, 290, ['kinematics'],
    ['dynamics:motivation', 'dynamics:forces', 'dynamics:assessment', 'dynamics:memory']),
  entry('mechanics:synthesis', 'Mechanik zusammenführen', 'Eine eigene Syntheseprüfung verbindet Bewegungsbeschreibung und Kräfte. Sie ersetzt keine Kindprüfung oder Kartenpflicht.', 'assessment', 780, 290, ['dynamics']),
  entry('kinematics:motivation', 'Zuerst genau beschreiben', 'Welche Größen braucht eine nachvollziehbare Beschreibung von Bewegung?', 'motivation', 60, 180),
  entry('uniform', 'Gleichförmige Bewegung', 'Bewegungen mit konstantem Tempo beschreiben und vorhersagen.', 'unit', 420, 180, ['kinematics:motivation'],
    ['uniform:motivation', 'uniform:quantities', 'uniform:linear', 'uniform:assessment', 'uniform:memory']),
  entry('accelerated', 'Veränderte Geschwindigkeit', 'Eine Veränderung des Tempos erkennen und beschreiben.', 'unit', 780, 180, ['uniform'],
    ['accelerated:change', 'accelerated:assessment']),
  entry('uniform:motivation', 'Den Treffpunkt planen', 'Wie lässt sich ein Treffpunkt vorhersagen, wenn jemand mit konstantem Tempo unterwegs ist?', 'motivation', 60, 40),
  entry('uniform:quantities', 'Weg, Zeit und Tempo', 'Die Größen einer gleichförmigen Bewegung zuordnen. Die Vorbereitung „Größen und Einheiten“ liegt außerhalb dieses Ausschnitts.', 'goal', 60, 290, ['tools:units', 'uniform:motivation']),
  entry('uniform:linear', 'Eine Bewegung im Diagramm', 'Ein Weg-Zeit-Diagramm erstellen und seinen Verlauf erklären.', 'goal', 420, 290, ['uniform:quantities']),
  entry('uniform:assessment', 'Eine Fahrt selbstständig untersuchen', 'Platz für eine vollständige Anwendung mit Darstellung, Vorhersage und Begründung; hier wird kein Ergebnis gespeichert.', 'assessment', 780, 290, ['uniform:linear']),
  entry('uniform:memory', 'Wichtige Größen abrufen', 'Ein eigener Kartenbereich. Ein Prüfungsversuch ersetzt den verifizierten Abruf nicht.', 'memory', 420, 540, ['uniform:motivation']),
  entry('accelerated:change', 'Tempoänderung beschreiben', 'Aus Beobachtungen und Diagrammen eine Tempoänderung begründen.', 'goal', 60, 180, ['uniform:linear']),
  entry('accelerated:assessment', 'Zwei Bewegungen vergleichen', 'Platz für einen selbstständigen Vergleich gleichförmiger und veränderter Bewegung.', 'assessment', 420, 180, ['accelerated:change']),
  entry('dynamics:motivation', 'Warum ändert sich die Bewegung?', 'Eine Erklärung suchen, die über die reine Beschreibung hinausgeht.', 'motivation', 60, 40),
  entry('dynamics:forces', 'Kräfte und Bewegung verbinden', 'Die Wirkung von Kräften an einer Bewegung beschreiben und begründen.', 'goal', 60, 290, ['uniform:linear', 'dynamics:motivation']),
  entry('dynamics:assessment', 'Eine Bewegung mit Kräften erklären', 'Platz für eine selbstständige Erklärung mit einer begründeten Modellwahl.', 'assessment', 420, 290, ['dynamics:forces']),
  entry('dynamics:memory', 'Begriffe und Größen abrufen', 'Ein eigener Kartenbereich für die benötigten Grundbegriffe.', 'memory', 780, 290, ['dynamics:motivation']),

  entry('models:motivation', 'Eine nützliche Vereinfachung', 'Warum kann eine vereinfachte Beschreibung trotzdem hilfreich sein?', 'motivation', 60, 40),
  entry('models:assumptions', 'Annahmen sichtbar machen', 'Die Annahmen einer einfachen Bewegungsbeschreibung benennen.', 'goal', 60, 290, ['tools:graphs', 'models:motivation']),
  entry('models:compare', 'Modell und Beobachtung vergleichen', 'Aussagen des Modells mit Beobachtungen vergleichen und Grenzen benennen.', 'goal', 420, 290, ['models:assumptions']),
  entry('models:assessment', 'Ein Modell begründet auswählen', 'Platz für eine eigenständige Entscheidung zwischen einfachen Modellen.', 'assessment', 780, 290, ['models:compare']),
  entry('motion:motivation', 'Eine tragfähige Erklärung', 'Wie helfen Bewegungsbeschreibung, Kräfte und Modellannahmen gemeinsam?', 'motivation', 60, 180),
  entry('motion:plan', 'Eine Untersuchung planen', 'Beschreibung, Erklärung und Modellvergleich zu einem Untersuchungsvorschlag verbinden.', 'goal', 420, 180, ['mechanics:synthesis', 'models:assessment', 'motion:motivation']),
  entry('motion:synthesis', 'Bewegung verständlich erklären', 'Eine eigene Syntheseprüfung für das übergreifende Lernversprechen; keine automatische Freigabe oder Mastery.', 'assessment', 780, 180, ['motion:plan']),
]

export const learningMapFixture: LearningMapFixture = {
  rootId: 'demo:root',
  title: 'Eine Lernkarte zum Erkunden',
  entries: Object.fromEntries(entries.map(value => [value.id, value])),
}
