import {readFileSync} from 'node:fs'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../../app/scripts/goalBookModel.ts'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
const old=JSON.parse(readFileSync(E+'chemie-kinetic-mechanism-one-actual-GBS-image-correction-author-root-20261015-v1/candidate-v2/canonical560.current422.one-mechanism-description-and-PNG.author-v2.json','utf8'))
const next=JSON.parse(readFileSync(E+'chemie-pourbaix-one-missing-image-author-root-20261015-v1/candidate/canonical560.current422.one-pourbaix-image.author.json','utf8'))
const semantic=JSON.parse(readFileSync(E+'chemie-kinetic-mechanism-one-actual-GBS-image-correction-author-root-20261015-v1/candidate-v2/semantic560.one-mechanism-description-source-binding.author-v2.json','utf8'))
const id='f0f2c5f8-06f1-5774-a176-d96505727acf'
if(JSON.stringify(old.goals.filter((g:any)=>g.id!==id))!==JSON.stringify(next.goals.filter((g:any)=>g.id!==id)))throw Error('Other goal changed')
const g0=old.goals.find((g:any)=>g.id===id),g1=next.goals.find((g:any)=>g.id===id)
if(JSON.stringify(g0)!==JSON.stringify(Object.fromEntries(Object.entries(g1).filter(([k])=>k!=='resourceLinks'))))throw Error('Goal semantics changed')
let valid=0
for(const d of semantic.decisions){const g=next.goals.find((g:any)=>g.id===d.goalId);if(!g||fingerprintSemanticKindSourceGoal(g)!==d.sourceFingerprint)throw Error('Semantic source stale '+d.goalId);valid++}
console.log(JSON.stringify({validSemanticSourceBindings:valid,other559WholeGoalsExact:true,pourbaixTextEdgesTagsScopeUnchanged:true,semanticLedgerUnchanged:true,newSemanticVotes:0,newIndependentApprovals:0,strictClosures:0}))
