import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildApplicabilityCompilation } from '../../app/scripts/applicabilityCompiler'
import { evaluateRouteProfile, routeProfiles } from '../../app/scripts/generateCurriculumQualityStatus'
import type { SkillLandscape } from '../../app/src/landscapeTypes'
const root = resolve(import.meta.dirname, '../..')
const canonical = resolve(root, 'curricula/DE/Gymnasium/canonical')
const catalog = readdirSync(canonical).filter(p => p.endsWith('.json')).sort().map(path => {
  const raw = readFileSync(resolve(canonical, path))
  return { path: 'curricula/DE/Gymnasium/canonical/' + path, sha256: createHash('sha256').update(raw).digest('hex'),
    landscape: JSON.parse(raw.toString()) as SkillLandscape }
})
const compilation = buildApplicabilityCompilation()
const scopes = routeProfiles.map(profile => {
  const entry = catalog.find(entry => entry.landscape.landscapeId === profile.landscapeId)!
  return { profileId: profile.profileId, scope: evaluateRouteProfile(entry.landscape, profile, compilation) }
})
const owner = '7d51b38c-a149-5407-bddc-d2ce7878b020'
const source = catalog.find(entry => entry.landscape.landscapeId === owner)!.landscape
const profile = routeProfiles.find(profile => profile.landscapeId === owner)!
const offeredProfile = { ...profile, terminalAutonomyClusterIds: [...profile.terminalAutonomyClusterIds,
  'bd075253-1e7e-57a2-9df4-2d0099dacba3', 'c764b417-2d6b-5f1f-ba1a-851bfb44fb24'] }
const offeredScope = evaluateRouteProfile(source, offeredProfile, compilation)
console.log(JSON.stringify({ generatorSha256: createHash('sha256').update(readFileSync(resolve(root, 'app/scripts/generateCurriculumQualityStatus.ts'))).digest('hex'),
  sources: catalog.map(({ path, sha256 }) => ({ path, sha256 })), scopes, offeredScope }, null, 2))
