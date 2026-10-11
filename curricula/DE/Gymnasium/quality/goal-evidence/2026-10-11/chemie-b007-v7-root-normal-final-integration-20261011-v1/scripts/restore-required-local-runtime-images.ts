import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { copyGoalVisualizationAsset } from '../../../../../../../../scripts/deploy_goal_visualizations'

// Restore generated local copies with the unchanged normal deployment helper.
// Canonical images, scientific decisions and production are not modified.
const root = process.cwd()
const receiptPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-root-normal-final-integration-20261011-v1/checks/required-local-runtime-images-restored.actual.json')
if (existsSync(receiptPath)) throw new Error('Refuse to overwrite an existing restoration receipt')
const canonicalRoot = resolve(root, 'curricula/DE/Gymnasium/canonical')
const urls = new Set<string>()
for (const name of readdirSync(canonicalRoot).filter(name => name.endsWith('.json'))) {
  const landscape = JSON.parse(readFileSync(resolve(canonicalRoot, name), 'utf8'))
  for (const goal of landscape.goals ?? []) {
    for (const link of goal.resourceLinks ?? []) {
      if ((link.type === 'goal-visualization' || link.resourceType === 'goal-visualization')
        && typeof link.url === 'string' && link.url.startsWith('/assets/goal-visualizations/')) urls.add(link.url)
    }
  }
}
const sha = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex')
const rows: { url: string; targetPath: string; beforeSha256: string | null; sourceSha256: string; afterSha256: string }[] = []
for (const url of [...urls].sort()) {
  const relative = url.slice('/assets/goal-visualizations/'.length)
  if (!/^[a-z-]+\/[0-9a-f-]+\/[0-9a-f-]+\.(png|jpg|jpeg|webp|svg)$/.test(relative)) throw new Error(`Unexpected image path: ${url}`)
  const source = resolve(root, 'curricula/DE/Gymnasium/visualizations', relative)
  const sourceSha256 = sha(source)
  for (const output of ['app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']) {
    const target = resolve(root, output, relative)
    const beforeSha256 = existsSync(target) ? sha(target) : null
    if (beforeSha256 === sourceSha256) continue
    copyGoalVisualizationAsset(source, resolve(root, output), relative)
    const afterSha256 = sha(target)
    if (afterSha256 !== sourceSha256) throw new Error(`Failed normal copy: ${target}`)
    rows.push({ url, targetPath: `${output}/${relative}`, beforeSha256, sourceSha256, afterSha256 })
  }
}
writeFileSync(receiptPath, `${JSON.stringify({ status: 'PASS', activeUrlsChecked: urls.size, restoredCopies: rows.length, canonicalChanges: 0, scientificApprovalsAdded: 0, rows }, null, 2)}\n`)
console.log(`Normal runtime-copy restoration: ${urls.size} active URLs checked, ${rows.length} copies restored`)
