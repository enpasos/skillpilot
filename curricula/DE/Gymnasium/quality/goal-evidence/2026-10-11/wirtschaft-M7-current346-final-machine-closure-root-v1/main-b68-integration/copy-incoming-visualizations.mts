import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import nativeVisualizationDeployment from '/home/enpasos/projects/skillpilot/scripts/deploy_goal_visualizations.ts'
const { copyGoalVisualizationAsset } = nativeVisualizationDeployment
const root = '/home/enpasos/projects/skillpilot'
const oldMain = '5344554de0cb8243fbca26275978cb5396e1ded9'
const newMain = 'b68f8e5b579807837845ed91969d4293b35a503d'
const changed = execFileSync('git', ['diff', '--name-only', '--diff-filter=A', oldMain, newMain], {cwd: root, encoding: 'utf8'}).trim().split('\n')
const prefix = 'curricula/DE/Gymnasium/visualizations/'
const files = changed.filter(p => p.startsWith(prefix) && p.endsWith('.png'))
if (files.length !== 13 || files.some(p => !p.startsWith(prefix + 'biologie/'))) throw new Error('Unexpected incoming image scope')
const digest = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const rows = []
for (const source of files) {
  const relative = source.slice(prefix.length)
  const original = path.join(root, source)
  const app = path.join(root, 'app/public/assets/goal-visualizations', relative)
  if (digest(original) !== digest(app)) throw new Error('Incoming published asset differs from source: ' + source)
  const targetRoot = path.join(root, 'backend/src/main/resources/static/assets/goal-visualizations')
  copyGoalVisualizationAsset(original, targetRoot, relative)
  const backend = path.join(targetRoot, relative)
  if (digest(original) !== digest(backend)) throw new Error('Native generated copy differs from source: ' + source)
  rows.push({source, app, backend, sha256: digest(original)})
}
console.log(JSON.stringify({kind: 'native incoming-main asset byte copy, no image editing or scientific review', newMain, copied: rows.length, rows}, null, 2))
