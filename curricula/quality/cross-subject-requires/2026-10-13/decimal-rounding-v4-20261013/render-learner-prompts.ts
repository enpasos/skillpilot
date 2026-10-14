// Apache-2.0. Inert candidate renderer; no runtime integration or state writes.
import assert from 'node:assert/strict'
export type LearnerFact = { id: string; number: string; place: 'hundredths' | 'thousandths' | 'ten_thousandths' }
const places = {
  hundredths: { de: 'Hundertstel', en: 'hundredths' },
  thousandths: { de: 'Tausendstel', en: 'thousandths' },
  ten_thousandths: { de: 'Zehntausendstel', en: 'ten-thousandths' },
} as const
export const sharedNeutralComparisonDe = 'Bestimme für dieselbe Ausgangszahl auch den Wert beim Abschneiden hinter der vorgegebenen Stelle. Vergleiche beide Verfahren und begründe den Vergleich.'
export const sharedNeutralComparisonEn = 'For the same original number, also determine the value obtained by truncating after the requested place. Compare the two procedures and justify the comparison.'
export function renderTask(fact: LearnerFact) {
  assert.deepEqual(Object.keys(fact).sort(), ['id', 'number', 'place'])
  assert.match(fact.id, /^decimal-case-00[1-6]$/)
  assert.match(fact.number, /^(0|[1-9][0-9]*)\.[0-9]+$/)
  assert(Object.hasOwn(places, fact.place))
  const place = places[fact.place]
  return {
    id: fact.id,
    taskDemandDe: `Runde ${fact.number.replace('.', ',')} auf ${place.de}. Wähle den nächstgelegenen Wert auf dieser Stelle; bei genau halbem Abstand wähle den größeren Wert. Begründe dein Ergebnis.`,
    taskDemandEn: `Round ${fact.number} to ${place.en}. Choose the nearest value at that place; at an exact halfway point choose the larger value. Justify your answer.`,
  }
}
export function buildPositiveProfile(template: any, facts: { cases: LearnerFact[] }, teacher: any) {
  assert.equal(new Set(facts.cases.map(c => c.id)).size, facts.cases.length)
  return {
    ...structuredClone(template),
    applicationCaseBriefs: facts.cases.map(fact => {
      const key = teacher.cases.filter((c: any) => c.id === fact.id)
      assert.equal(key.length, 1)
      const answer = key[0]
      assert.equal(answer.audience, 'teacher_only')
      return {
        ...renderTask(fact),
        expectedPerformanceDe: answer.expectedPerformanceDe,
        expectedPerformanceEn: answer.expectedPerformanceEn,
        understandingFocusDe: answer.understandingFocusDe,
        understandingFocusEn: answer.understandingFocusEn,
      }
    }),
  }
}
