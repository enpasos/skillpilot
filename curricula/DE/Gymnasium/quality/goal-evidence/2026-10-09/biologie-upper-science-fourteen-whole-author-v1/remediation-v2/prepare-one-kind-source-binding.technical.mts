// SPDX-License-Identifier: Apache-2.0
// Technical source-fingerprint candidate only; genuine Kind/A/M confirmation remains pending.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../../app/scripts/goalBookModel.ts'
const own=dirname(fileURLToPath(import.meta.url)),old=resolve(own,'..')
const canon=JSON.parse(readFileSync(resolve(own,'input/canonical479-one-en-fidelity.candidate.json'),'utf8'))
const ledger=JSON.parse(readFileSync(resolve(old,'input/current-kinds394.original.snapshot.json'),'utf8'))
const id='8375310d-1f7e-542d-9969-55ad4bd37f7c'
const goal=canon.goals.find((g:any)=>g.id===id);const row=ledger.decisions.find((r:any)=>r.goalId===id)
assert.ok(goal&&row);const before=structuredClone(row)
row.sourceFingerprint=fingerprintSemanticKindSourceGoal(goal)
writeFileSync(resolve(own,'input/kinds394-one-en-fingerprint.technical-candidate.json'),JSON.stringify(ledger,null,2)+'\n')
writeFileSync(resolve(own,'input/one-kind-binding-targeted-review-pending.actual.json'),JSON.stringify({schemaVersion:1,goalId:id,beforeWholeDecision:before,technicalCandidateWholeDecision:row,changedPointers:['/sourceFingerprint'],semanticKindUnchanged:true,decisionStatusUnchanged:true,genuineTargetedKindConfirmation:'PENDING',genuineTargetedAtomicityConfirmation:'PENDING',genuineTargetedMemoryConfirmation:'PENDING',technicalBindingIsNotScientificReview:true,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({technicalBindings:1,genuineTargetedKindAMReview:'PENDING',activeWrites:0}))
