// SPDX-License-Identifier: Apache-2.0
// Execute only in the isolated capsule; normal full-count assertions remain authoritative.
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {buildGoalBookSourceAtlasInputs} from './goalBookSourceAtlasInputs.ts'
const root=resolve('.'), p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1'
const config=JSON.parse(readFileSync(resolve(root,p+'/source-atlas/whole398-source24.normal-probe.inputs.json'),'utf8'))
try { const result=buildGoalBookSourceAtlasInputs(config,root); console.log(JSON.stringify({role:'Actual full normal source compiler result',receipt:result.receipt,strictGain:0,humanApproval:false})) }
catch(error) { console.error(error instanceof Error ? error.stack : String(error)); process.exitCode=1 }
