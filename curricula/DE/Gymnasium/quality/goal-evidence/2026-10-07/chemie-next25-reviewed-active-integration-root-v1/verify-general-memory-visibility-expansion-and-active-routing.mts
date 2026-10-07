// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { preservesMemoryVisibilityScopes, discoverActiveMemoryCardReviewConfigs } from '../../../../../../../app/scripts/memoryCardReviewConfigDiscovery'
const old=[{label:'Existing',viewPath:'existing.view.json'}]
const added={label:'Additional',viewPath:'additional.view.json'}
assert.equal(preservesMemoryVisibilityScopes(old,[...old,added]),true)
assert.equal(preservesMemoryVisibilityScopes(old,[]),false)
assert.equal(preservesMemoryVisibilityScopes(old,[{...old[0],viewPath:'other.view.json'},added]),false)
assert.equal(preservesMemoryVisibilityScopes(old,[{...old[0],label:'Changed'},added]),false)
assert.equal(preservesMemoryVisibilityScopes(old,[added,...old]),false)
assert.equal(preservesMemoryVisibilityScopes(old,[...old,...old]),false)
assert.equal(preservesMemoryVisibilityScopes(old,[...old,{label:'',viewPath:'bad.view.json'}]),false)
const actual=discoverActiveMemoryCardReviewConfigs()
assert.ok(actual.some(x=>x.reviewId==='canonical-biology-full'&&x.configPath.includes('eight-current-scopes')))
assert.ok(actual.some(x=>x.reviewId==='canonical-chemistry-full'&&x.configPath.includes('seven-real-scopes')))
assert.equal(new Set(actual.map(x=>x.reviewId)).size,actual.length)
console.log('PASS generic additive visibility, removal/rebinding/relabel/reorder/duplicate rejection and actual current subject routing without historical configuration changes')
