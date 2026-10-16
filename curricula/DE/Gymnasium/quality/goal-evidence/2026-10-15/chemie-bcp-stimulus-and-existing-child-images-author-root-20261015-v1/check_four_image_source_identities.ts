import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
const here = path.dirname(fileURLToPath(import.meta.url))
const overlay = JSON.parse(fs.readFileSync(path.join(here, 'candidate-v1/four-whole-goals.primary-images-only.unreviewed.json'), 'utf8'))
const base = JSON.parse(fs.readFileSync(overlay.baseCanonical.path, 'utf8'))
const rows = overlay.wholeGoals.map((after: any) => {
  const before = base.goals.find((g: any) => g.id === after.id)
  const a = fingerprintSemanticKindSourceGoal(before)
  const b = fingerprintSemanticKindSourceGoal(after)
  if (a !== b) throw new Error(`Image-only source identity changed: ${after.id}`)
  return { goalId: after.id, before: a, after: b, exact: true }
})
const result = { role: 'Actual unchanged stock semantic-source fingerprint check for four image-only overlays', rows, mismatches: 0, normalScientificApprovals: 0, fullNativeBuilds: 0 }
fs.writeFileSync(path.join(here, 'CHECK.four-unchanged-stock-source-identities.actual.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify(result))
