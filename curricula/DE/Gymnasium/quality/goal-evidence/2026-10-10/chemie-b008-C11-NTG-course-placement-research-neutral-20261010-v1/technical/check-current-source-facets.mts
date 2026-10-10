import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { sourceAtlasFacet } = await import(pathToFileURL(resolve('app/scripts/goalBookSourceAtlasInputs.ts')).href)
const extraction = JSON.parse(readFileSync('curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json', 'utf8'))
const source = extraction.sourceGoals.find((v: any) => v.id === '7ee6a5cd-dce6-57ad-b126-c1e3a05f234c')
const passage = extraction.passages.find((v: any) => v.id === source.passageId)
const levels = [source, passage, extraction.sourceDocument, extraction]
const stage = sourceAtlasFacet(levels, 'stage')
const course = sourceAtlasFacet(levels, 'courseProfile')
assert.deepEqual(stage, ['SekII'])
assert.deepEqual(course, [])
assert.equal(source.courseLevel, 'unspecified')
const config = JSON.parse(readFileSync('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json', 'utf8'))
assert.equal(config.expectedUnresolvedScopeDecisionCount, 496)
assert.equal(config.fallbackViewPaths.length, 4)
console.log(JSON.stringify({ normalUnmodifiedSourceAtlasFacetActual: { stage, courseProfile: course },
  originalCourseLevel: source.courseLevel, actualFallbackViewPaths: config.fallbackViewPaths,
  originalUnresolvedSourceDecisionCount: config.expectedUnresolvedScopeDecisionCount,
  primaryInterpretationDoesNotPromoteSourceFacet: true, activeWrites: false, strictNetGain: 0 }))
