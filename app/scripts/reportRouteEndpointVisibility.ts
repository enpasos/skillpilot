// SPDX-License-Identifier: Apache-2.0
// Diagnostic for the explicitly unpinned CQR-104 scopes; never a passing gate
// or a source of endpoint applicability/assessment decisions.
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SkillLandscape } from '../src/landscapeTypes'
import { buildApplicabilityCompilation } from './applicabilityCompiler'
import { createRouteProfiles, evaluateRouteProfile } from './generateCurriculumQualityStatus'
import { PHYSICS_QA_SELECTOR_INPUT_PATHS } from './lib/physicsQaStageTargets'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const sha256 = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
const repoPath = (path: string) => relative(root, path).split('\\').join('/')

function jsonFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? jsonFiles(path) : entry.isFile() && path.endsWith('.json') ? [path] : []
  }).sort()
}

export function reportRouteEndpointVisibility() {
  const inputBytes = new Map<string, Buffer>()
  const readBound = (path: string) => {
    if (!inputBytes.has(path)) inputBytes.set(path, readFileSync(path))
    return inputBytes.get(path)!
  }
  const canonicalFiles = jsonFiles(resolve(root, 'curricula/DE/Gymnasium/canonical'))
  const landscapes = canonicalFiles.map(path => ({
    path,
    landscape: JSON.parse(readBound(path).toString('utf8')) as SkillLandscape,
  }))
  PHYSICS_QA_SELECTOR_INPUT_PATHS.forEach(path => readBound(resolve(root, path)))
  const routeProfiles = createRouteProfiles(root, { readText: path => readBound(path).toString('utf8') })
  const unpinnedProfiles = routeProfiles.filter(profile => profile.compositionViewStage === undefined)
  if (unpinnedProfiles.some(profile => !profile.profileId.endsWith('-sek2'))) {
    throw new Error('An unpinned route scope needs an explicit diagnostic stage before it can be measured.')
  }
  const selectedLandscapeIds = new Set(unpinnedProfiles.map(profile => profile.landscapeId))
  const viewFiles = jsonFiles(resolve(root, 'curricula/DE/Gymnasium/composition-views'))
    .filter(path => selectedLandscapeIds.has(JSON.parse(readBound(path).toString('utf8')).landscapeId))
  const inputPaths = [
    ...canonicalFiles,
    ...viewFiles,
    resolve(root, 'app/scripts/config/curriculum-maturity-floor-policy.json'),
    resolve(root, 'app/scripts/generateCurriculumQualityStatus.ts'),
    ...PHYSICS_QA_SELECTOR_INPUT_PATHS.map(path => resolve(root, path)),
    fileURLToPath(import.meta.url),
  ].sort()
  inputPaths.forEach(readBound)
  const inputs = [...inputBytes].map(([path, bytes]) => ({ path: repoPath(path), sha256: sha256(bytes) }))
    .sort((a, b) => a.path.localeCompare(b.path, 'en'))
  const applicability = buildApplicabilityCompilation()
  const results = unpinnedProfiles.flatMap(profile => {
    const source = landscapes.find(entry => entry.landscape.landscapeId === profile.landscapeId)
    if (!source) throw new Error(`No current canonical source for ${profile.profileId}`)
    return [false, true].map(compiledJurisdiction => {
      const measuredProfile = {
        ...profile,
        compositionViewStage: 'SekII' as const,
        ...(compiledJurisdiction ? { compositionViewApplicabilityMode: 'compiled-jurisdiction' as const } : {}),
      }
      const rule = evaluateRouteProfile(source.landscape, measuredProfile, applicability)
        .rules.find(rule => rule.id === 'CQR-104')
      if (!rule) throw new Error(`Diagnostic failed to evaluate CQR-104 for ${profile.profileId}`)
      return { profileId: profile.profileId, landscapeId: profile.landscapeId, compiledJurisdiction, ...rule }
    })
  })
  // Detect concurrent edits in the files explicitly bound by this diagnostic.
  // Compiler reports are derived outputs, not substitute source/review evidence.
  for (const input of inputs) {
    if (sha256(readFileSync(resolve(root, input.path))) !== input.sha256) {
      throw new Error(`Diagnostic input changed during measurement: ${input.path}`)
    }
  }
  return {
    schemaVersion: 1,
    diagnostic: 'unconfigured-cqr-104-endpoint-visibility',
    acceptance: 'diagnostic-only; no scope pin, source applicability or assessment decision is changed',
    inputBinding: 'Raw current canonical, relevant view and evaluator files; applicability reports are derived output, not a complete provenance receipt.',
    inputs,
    applicabilityReportsSha256: sha256(JSON.stringify(applicability.reports)),
    registeredScopes: routeProfiles.length,
    pinnedVisibilityScopes: routeProfiles.length - unpinnedProfiles.length,
    unpinnedVisibilityScopes: unpinnedProfiles.length,
    results,
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  if (args.length !== 0 && !(args.length === 2 && args[0] === '--output' && args[1].trim())) {
    throw new Error('Usage: reportRouteEndpointVisibility.ts [--output <path>]')
  }
  const report = reportRouteEndpointVisibility()
  const json = `${JSON.stringify(report, null, 2)}\n`
  if (args.length) {
    const output = resolve(args[1])
    mkdirSync(dirname(output), { recursive: true })
    writeFileSync(output, json)
    for (const result of report.results) {
      console.log(`${result.profileId} (${result.compiledJurisdiction ? 'compiled jurisdiction' : 'configured endpoints'}): ${result.status}; ${result.metrics?.evaluatedProjectionScopes} projections`)
    }
    console.log(`Diagnostic written to ${output}`)
  } else {
    process.stdout.write(json)
  }
  if (report.results.some(result => result.status !== 'pass')) process.exitCode = 1
}
