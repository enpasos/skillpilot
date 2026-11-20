// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

/** The review binds one assessment to its actual source, learner/evaluation text and score rubric. */
export function assertLearningUnitAssessmentReview(
  review: string, assessmentId: string, source: string, revisions: { taskRevision: string; rubricRevision: string },
) {
  const sourceHash = createHash('sha256').update(source).digest('hex')
  const bindings = [assessmentId, sourceHash, revisions.taskRevision, revisions.rubricRevision]
  const reviewed = review.split('\n').some((line) => {
    const cells = line.split('|').map((cell) => cell.trim().replace(/^`([^`]+)`$/u, '$1'))
    return bindings.every((value) => cells.includes(value))
  })
  assert(reviewed, `${assessmentId}: review must bind this source, task and scoring in the same review-table row (${bindings.join(', ')})`)
}

// One assessment section of a source file: task, solution and rubric table. The rubric stands
// inside the section (`### Bewertung`) or, in a file with a single assessment, after it (`## Bewertung`).
export function readLearningUnitAssessmentSource(
  source: string,
  sourcePath: string,
  { sectionKey, stepIdPrefix }: { sectionKey: string; stepIdPrefix: string },
) {
  const block = source.split(`## ${sectionKey}\n`)[1]?.split('\n## ')[0]
  assert(block, `${sourcePath}: missing assessment section ${sectionKey}`)
  const taskContent = block.split('### Aufgabe\n')[1]?.split('\n### Lösung')[0]?.trim()
  const ownRubric = block.split('\n### Bewertung\n')[1]
  const solution = block.split('### Lösung\n')[1]?.split('\n### Bewertung\n')[0]?.trim()
  assert(taskContent && solution, `${sectionKey}: missing task or solution`)
  const rubric = ownRubric ?? source.split('\n## Bewertung\n')[1]
  assert(rubric, `${sectionKey}: missing rubric`)
  const [heading, divider, ...rows] = rubric.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('|'))
  assert.equal(heading, '| Schritt | BE | Kriterium |', `${sectionKey}: unexpected rubric columns`)
  // The coach receives solutionContent with the rubric after submission. Preserve instructions that apply across criteria there.
  const gradingNotes = rubric.slice(0, rubric.indexOf(heading)).trim()
  const solutionContent = gradingNotes ? `${solution}\n\n**Hinweise zur Bewertung**\n\n${gradingNotes}` : solution
  assert(/^\|(?:\s*:?-{3,}:?\s*\|)+$/u.test(divider) && divider.split('|').length === heading.split('|').length,
    `${sectionKey}: invalid rubric table`)
  assert(rows.length > 0, `${sectionKey}: empty rubric`)
  const steps = rows.map((row, index) => {
    const cells = /^\| (\d+) \| ([1-9]\d*) \| (.+) \|$/u.exec(row)
    assert(cells && cells[3].trim(), `${sectionKey}: invalid rubric row ${index + 1}`)
    const [, number, points, description] = cells
    assert(number === String(index + 1), `${sectionKey}: rubric steps must be numbered from 1`)
    return { id: `${stepIdPrefix}_${number}`, points: Number(points), description: description.trim() }
  })
  const totals = rubric.match(/Erreichbar sind (\d+) BE\. Bestanden ist die Prüfung mit (\d+) BE\./u)
  assert(totals, `${sectionKey}: missing point totals`)
  const maxPoints = Number(totals[1]), passingPoints = Number(totals[2])
  assert.equal(steps.reduce((sum, step) => sum + step.points, 0), maxPoints, `${sectionKey}: rubric points differ from the stated total`)
  assert(passingPoints > 0 && passingPoints <= maxPoints, `${sectionKey}: passing score is outside attainable points`)
  // The maximum for each part is visible in the task and agrees with its rubric row.
  const parts = `\n${taskContent}`.split(/\n(?=\d+\. )/u).filter((part) => /^\d+\. /u.test(part))
  assert.equal(parts.length, steps.length, `${sectionKey}: the task has other parts than the rubric`)
  for (const [index, step] of steps.entries())
    assert(parts[index].startsWith(`${index + 1}. `) && parts[index].trimEnd().endsWith(`(${step.points} BE)`),
      `${sectionKey}: task part ${index + 1} states other points than the rubric`)
  const sectionHash = createHash('sha256').update(`${taskContent}\n### Lösung\n${solutionContent}`).digest('hex')
  return { taskContent, solutionContent, scoring: { maxPoints, passingPoints, steps }, sectionHash }
}
