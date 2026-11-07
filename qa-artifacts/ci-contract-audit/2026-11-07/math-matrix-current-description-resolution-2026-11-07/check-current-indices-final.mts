// SPDX-License-Identifier: Apache-2.0
// Bounded actual D-index and supersession replay; no whole-subject or active writes.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { validateResolutionIndex, buildResolutionSupersessionChains, hasIntactResolutionSupersessionChain, type DeepUnderstandingSubjectConfig } from '/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout.ts'
import { fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
const load=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex')
const G='ce198bc9-b014-52ba-814f-25cc3e020668'
const old='qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/resolution-index.json'
const diagram='qa-artifacts/ci-contract-audit/2026-11-06/math-single-description-input-2026-11-06/packet/resolution-index.json'
const current='qa-artifacts/ci-contract-audit/2026-11-07/math-matrix-current-description-resolution-2026-11-07/packet/resolution-index.json'
const source='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
assert.equal(hash(source),'e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06')
const raw=load(source)
const ledger=load('curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json')
const config=load('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').subjects.find((x:DeepUnderstandingSubjectConfig)=>x.subject==='mathematik') as DeepUnderstandingSubjectConfig
const plan=load('qa-artifacts/ci-contract-audit/2026-11-06/math-diagram-description-resolution-2026-11-06/registry-change-plan.json')
const rawGoalById=new Map<string,Record<string,unknown>>(raw.goals.map((g:Record<string,unknown>)=>[g.id,g]));assert.equal(rawGoalById.size,raw.goals.length)
const atoms=new Set<string>();const ids=new Set<string>()
for(const d of ledger.decisions){assert(!ids.has(d.goalId));ids.add(d.goalId);const g=rawGoalById.get(d.goalId);assert(g);assert.equal(d.decisionStatus,'authoritative');assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(g));if(d.semanticKind==='curricularAtomic')atoms.add(d.goalId)}
assert.equal(ids.size,1252);assert.equal(atoms.size,807)
type Scope=Parameters<typeof validateResolutionIndex>[2]
const scope:Scope={rawLandscape:raw,landscape:raw,rawGoalById,goalById:new Map(raw.goals.map((g:Scope['landscape']['goals'][number])=>[g.id,g])),atomicGoalIds:atoms,denominator:atoms.size,issues:[]}
const oldMatrix=load(old).resolutions.find((x:{goalId:string})=>x.goalId===G)
assert(oldMatrix)
const edge={goalId:G,supersededIndexPath:old,historicalResolutionDigest:oldMatrix.resolutionDigest,replacementIndexPath:current}
const newEdges=[...plan.dSupersessionsToAdd,edge]
for(const e of newEdges){const ix=load(e.supersededIndexPath);assert.equal(ix.resolutions.find((x:{goalId:string})=>x.goalId===e.goalId).resolutionDigest,e.historicalResolutionDigest)}
const edges=[...(config.resolutionSupersessions??[]),...newEdges]
const indexPaths=[...config.resolutionIndexPaths,old,diagram,current];assert.equal(new Set(indexPaths).size,indexPaths.length)
const chains=buildResolutionSupersessionChains(edges,indexPaths,atoms);assert.deepEqual(chains.issues,[])
const targetIds=new Set(['0c2ddfcd-1399-41ad-aaed-4f061812602a',G,'d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe'])
const relevant=chains.chains.filter(x=>targetIds.has(x.goalId));assert.equal(relevant.length,3)
const supersededByPath=new Map<string,Set<string>>()
for(const c of chains.chains)for(const p of c.indexPaths.slice(0,-1)){const s=supersededByPath.get(p)??new Set<string>();s.add(c.goalId);supersededByPath.set(p,s)}
const paths=[...new Set(relevant.flatMap(x=>x.indexPaths))]
const checks=[]
for(const path of paths){const result=await validateResolutionIndex(path,config,scope,supersededByPath.get(path));assert.deepEqual(result.issues,[],path);checks.push({path,...result})}
for(const c of relevant)assert(hasIntactResolutionSupersessionChain(c,checks),c.goalId)
const currentChecks=checks.filter(x=>[old,diagram,current].includes(x.path));const allReady=currentChecks.flatMap(x=>[...x.ready]);assert.equal(new Set(allReady).size,3);assert.deepEqual(allReady.sort(),[...targetIds].sort())
assert.deepEqual([...currentChecks.find(x=>x.path===old)!.ready],['d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe'])
const changed=structuredClone(raw);const changedGoal=changed.goals.find((x:{id:string})=>x.id===G);changedGoal.description+=' Zusätzliche beliebige allgemeine Matrixpflicht.'
const changedScope={...scope,rawLandscape:changed,landscape:changed,rawGoalById:new Map<string,Record<string,unknown>>(changed.goals.map((g:Record<string,unknown>)=>[g.id,g])),goalById:new Map(changed.goals.map((g:Scope['landscape']['goals'][number])=>[g.id,g]))}
const stale=await validateResolutionIndex(current,config,changedScope);assert(stale.issues.length>0);assert(!stale.ready.has(G))
const broken=buildResolutionSupersessionChains(edges,indexPaths.filter(x=>x!==old),atoms);assert(broken.invalidGoalIds.has(G))
const missing=checks.filter(x=>x.path!==current);assert(!hasIntactResolutionSupersessionChain(relevant.find(x=>x.goalId===G)!,missing))
console.log(JSON.stringify({status:'three-current-D-claims-valid-with-intact-per-goal-history-unapplied',sourceRawSha256:hash(source),actualKindFingerprintsChecked:ids.size,actualAtomicDenominator:atoms.size,newMatrixEdge:edge,chains:relevant,checks:checks.map(x=>({path:x.path,ready:[...x.ready],claimed:[...x.claimedGoalIds],historical:[...x.historicalClaimedGoalIds],issues:x.issues})),newCurrentUnion:allReady,negativeControls:{actualCurrentGoalChanged:{rejected:true,issues:stale.issues},missingIntermediateIndex:{rejected:true,issues:broken.issues},missingTerminalEvidence:{rejected:true}},wholeSubjectDeepOrMaturityPassClaimed:false},null,2))
