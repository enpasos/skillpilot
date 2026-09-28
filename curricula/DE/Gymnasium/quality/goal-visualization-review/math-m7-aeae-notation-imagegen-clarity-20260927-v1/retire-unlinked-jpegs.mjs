import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../../../')
const here = 'curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-aeae-notation-imagegen-clarity-20260927-v1'
const goalId = 'aeae526e-b3a4-5a17-b177-351df0307cb9'
const expected = 'fd230b4a6ec4071bf78335622e3699a0c73502c8ed3635d84d349f015ca6f287'
const pairs = [
  [`curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.jpg`, `${here}/prior/former-canonical.jpg`],
  [`app/public/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`, `${here}/prior/former-app-public.jpg`],
  [`backend/src/main/resources/static/assets/goal-visualizations/mathematik/${goalId}/${goalId}.jpg`, `${here}/prior/former-backend.jpg`],
]
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex')
const at = (path) => resolve(root, path)
const archived = await readFile(at(`${here}/prior/${goalId}.jpg`))
if (sha(archived) !== expected) throw new Error('Prior archive digest differs')
for (const [source, target] of pairs) {
  const bytes = await readFile(at(source))
  if (sha(bytes) !== expected || !bytes.equals(archived)) throw new Error(`Old production asset differs: ${source}`)
  try {
    await stat(at(target))
    throw new Error(`Retirement target already exists: ${target}`)
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }
}
for (const [source, target] of pairs) {
  await mkdir(dirname(at(target)), { recursive: true })
  await rename(at(source), at(target))
  if (sha(await readFile(at(target))) !== expected) throw new Error(`Retired asset digest differs: ${target}`)
  console.log(`${source} -> ${target}: sha256:${expected}`)
}
