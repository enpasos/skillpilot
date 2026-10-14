// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync}from 'node:fs'
import {resolve}from 'node:path'
import {buildRequiresInventory,assertFreshRequiresInventory,readActiveLandscapes,fileFingerprint}from '../../../app/scripts/lib/crossSubjectRequiresInventory'
const R='tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1'
const configPath='curricula/quality/cross-subject-requires/math-physics.config.json'
const inventoryPath='curricula/quality/cross-subject-requires/math-physics.inventory.json'
const config=JSON.parse(readFileSync(configPath,'utf8'))
const fresh=buildRequiresInventory(resolve('.'),config)
const exactInventorySha256=assertFreshRequiresInventory(fresh,inventoryPath)
const family=fresh.families.find(f=>f.familyId==='by-fachoberschule')!
if(family.counts.stableGoalIds!==539||family.counts.technicalLeaves!==428)throw new Error('Unexpected family counts')
const active=readActiveLandscapes(resolve('.'),config).map(d=>({path:d.file,sha256:fileFingerprint(d.file),landscapeId:d.landscapeId}))
const receipt={schemaVersion:1,status:'exact_persisted_inventory_rebuilt_and_fresh_no_writes_to_active_inputs',createdAt:new Date().toISOString(),configPath,configSha256:fileFingerprint(configPath),inventoryPath,exactInventorySha256,actualActiveLandscapeCount:active.length,activeInputFiles:active,familyCounts:family.counts,semanticApproval:false,nativeM7Approval:false,activeInventoryWritten:false,license:'Apache-2.0'}
if(process.argv.includes('--write-receipt'))writeFileSync(`${R}/inventory-freshness.validation.receipt.json`,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({exactInventorySha256,activeFiles:active.length,familyCounts:family.counts}))
