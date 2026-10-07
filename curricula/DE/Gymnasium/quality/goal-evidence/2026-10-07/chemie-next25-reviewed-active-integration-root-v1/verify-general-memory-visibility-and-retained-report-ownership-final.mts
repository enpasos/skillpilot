// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { preservesMemoryVisibilityScopes, discoverActiveMemoryCardReviewConfigs, discoverRetainedMemoryCardReviewConfigs } from '../../../../../../../app/scripts/memoryCardReviewConfigDiscovery'
const old=[{label:'Existing',viewPath:'existing.view.json'}]
const added={label:'Additional',viewPath:'additional.view.json'}
assert.equal(preservesMemoryVisibilityScopes(old,[...old,added]),true)
assert.equal(preservesMemoryVisibilityScopes(old,[]),false)
assert.equal(preservesMemoryVisibilityScopes(old,[{...old[0],viewPath:'other.view.json'},added]),false)
assert.equal(preservesMemoryVisibilityScopes(old,[{...old[0],label:'Changed'},added]),false)
assert.equal(preservesMemoryVisibilityScopes(old,[added,...old]),false)
assert.equal(preservesMemoryVisibilityScopes(old,[...old,...old]),false)
assert.equal(preservesMemoryVisibilityScopes(old,[...old,{label:'',viewPath:'bad.view.json'}]),false)
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const actual=discoverActiveMemoryCardReviewConfigs()
for (const [reviewId,expected] of [['canonical-biology-full',8],['canonical-chemistry-full',7]] as const) {
 const selected=actual.find(x=>x.reviewId===reviewId)!
 const config=JSON.parse(readFileSync(resolve(selected.configPath),'utf8'))
 assert.equal(config.visibilityScopes.length,expected)
 assert.equal(config.reportPath,selected.reportPath)
}
const retained=discoverRetainedMemoryCardReviewConfigs(new Set(actual.map(x=>x.reportPath)))
assert.equal(retained.length,3)
for (const snapshot of retained) {
 const config=JSON.parse(readFileSync(resolve(snapshot.configPath),'utf8'))
 assert.equal(config.reportPath??`docs/qa-ci/status/memory-card-review-${config.reviewId}.md`,snapshot.reportPath)
 assert.ok(readFileSync(resolve(snapshot.reportPath),'utf8').includes(`> Source of truth: \`${snapshot.configPath}\``))
}
assert.equal(new Set(actual.map(x=>x.reviewId)).size,actual.length)
console.log('PASS generic additive visibility, removal/rebinding/relabel/reorder/duplicate rejection and actual current subject routing without historical configuration changes')
