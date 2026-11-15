// SPDX-License-Identifier: Apache-2.0
// Read-only current/counterfactual derivation; does not change the catalog.
import fs from 'node:fs'
import { loadCurrentCurriculumCatalog } from '../../../../../../../app/scripts/currentCurriculumCatalog.ts'
import { liveVerificationInputs } from '../../../../../../../app/scripts/lib/verificationInputSnapshot.ts'
import { KnowledgeContextIndex } from '../../../../../../../app/scripts/lib/knowledgeContext.ts'
const catalog=loadCurrentCurriculumCatalog(liveVerificationInputs,process.cwd()).entries.map(x=>x.landscape)
const id='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const before=JSON.parse(fs.readFileSync('curricula/DE/Gymnasium/quality/goal-model-review/physics-semiconductor-learning-path-20261115/post-independent-review-v2/reviewed-input-before.json','utf8')).canonicalBefore
const bi=new KnowledgeContextIndex(catalog.map(x=>x.landscapeId===id?before:x)), ci=new KnowledgeContextIndex(catalog)
const ordinary=(index:KnowledgeContextIndex,g:string)=>index.context(g).secured.flatMap(x=>x.goals)
const delta=(a:any[],b:any[])=>a.filter(x=>!b.some(y=>x.id===y.id))
for(const g of ['853dbe54-85b0-59ab-8f3a-000c2b7746ec','7d4d6a39-0c78-5fb0-b7bf-182ed00972f7','af50bb9a-fd7b-50f5-9698-48c4efe99032','c2af45aa-e3fc-5119-9159-c5a260b4135a']) console.log(JSON.stringify({goal:g,addedOrdinary:delta(ordinary(ci,g),ordinary(bi,g)),removedOrdinary:delta(ordinary(bi,g),ordinary(ci,g))}))
const hypothesis=structuredClone(catalog)
hypothesis.find(x=>x.landscapeId===id)!.goals.find(x=>x.id==='af50bb9a-fd7b-50f5-9698-48c4efe99032')!.requires.push('267170bd-f880-56a7-9719-ffb9751872c5')
const hi=new KnowledgeContextIndex(hypothesis)
console.log(JSON.stringify({hypothesisOnlyNotApplied:'amplifier267',addedOrdinary:delta(ordinary(hi,'af50bb9a-fd7b-50f5-9698-48c4efe99032'),ordinary(ci,'af50bb9a-fd7b-50f5-9698-48c4efe99032'))}))
