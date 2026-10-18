// SPDX-License-Identifier: Apache-2.0
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput,fingerprintPositiveGoalEvidenceProfile} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel';
import {parseGoalBookEvidenceReviewRecord} from '../../../../../../../app/scripts/goalBookEvidenceReviewLoader';
import {buildResolutionSupersessionChains,validateResolutionSemanticRetirements} from '../../../../../../../app/scripts/reportDeepUnderstandingRollout';
export const OUT='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-final-native-input-prerequisites-technical-20261018-v1';
export const REGISTRY='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';
export const CANONICAL='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
export const SEMANTIC='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';
export const QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json';
export const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
export const sha=(b:any)=>createHash('sha256').update(b).digest('hex');
export const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length}};
export const must=(c:any,m:string)=>{if(!c)throw Error(m)};
export const check=(p:any)=>{must(p&&typeof p.path==='string'&&/^[a-f0-9]{64}$/.test(p.sha256),'Exact raw pin required');const a=pin(p.path);must(a.sha256===p.sha256&&(p.bytes===undefined||p.bytes===a.bytes),'Input drift '+p.path);return a};
export const fields=(a:any,b:any)=>[...new Set([...Object.keys(a??{}),...Object.keys(b??{})])].filter(k=>!isDeepStrictEqual(a?.[k],b?.[k]));
export function currentInputs(){const registry=read(REGISTRY),chem=registry.subjects.find((s:any)=>s.subject==='chemie');must(chem?.landscapePath===CANONICAL&&chem.semanticKindLedgerPath===SEMANTIC,'Normal Chemistry canonical/semantic registration mismatch');const landscape=read(CANONICAL),ledger=read(SEMANTIC);const ordinary=new Set<string>(ledger.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic'&&r.decisionStatus==='authoritative').map((r:any)=>r.goalId));must(ordinary.size===450,'Expected exactly450 authoritative ordinary goals');return{registry,chem,landscape,ledger,ordinary};}
export function selectedP450(inputs=currentInputs()){
 const {chem,landscape,ledger,ordinary}=inputs,by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g])),kind=new Map<string,string>(ledger.decisions.map((r:any)=>[r.goalId,r.semanticKind]));
 const selected=new Map<string,any>(),cache=new Map<string,any>(),assetPins=new Map<string,any>(),sources:any[]=[];
 for(const configPath of chem.positiveEvidenceConfigPaths){
  const cfg=read(configPath);must(cfg.landscapePath===CANONICAL&&cfg.semanticKindLedgerPath===SEMANTIC,'P config is not normal Chemistry '+configPath);
  must(Array.isArray(cfg.scope.goalIds)&&new Set(cfg.scope.goalIds).size===cfg.scope.goalIds.length,'P config scope repeats goals '+configPath);
  if(!cache.has(cfg.reviewPath)){const lines=readFileSync(cfg.reviewPath,'utf8').split(/\r?\n/);cache.set(cfg.reviewPath,lines.flatMap((rawLine,line)=>rawLine.trim()?[{rawLine,line:line+1,record:parseGoalBookEvidenceReviewRecord(JSON.parse(rawLine),cfg.reviewPath+':'+(line+1))}]:[]));}
  for(const id of cfg.scope.goalIds){
   must(ordinary.has(id),'Selected P scope includes nonordinary goal '+id);must(!selected.has(id),'Duplicate selected current P owner '+id);
   const rows=cache.get(cfg.reviewPath).filter((x:any)=>x.record.goalId===id);must(rows.length===1,'Selected P record missing/repeated '+id);const row=rows[0],r=row.record,g=by.get(id);
   must(r.schemaVersion===2&&r.reviewId===cfg.reviewId,'Selected P record namespace/contract mismatch '+id);
   must(r.reviewCriteriaFingerprint==='sha256:'+sha(readFileSync(cfg.reviewCriteriaPath)),'Selected P criteria fingerprint stale '+id);
   const digests:Record<string,string>={};
   if(cfg.reviewedResourceTypes.includes('goal-visualization'))for(const link of g.resourceLinks??[]){if(link.type!=='goal-visualization')continue;must(link.url.startsWith('/assets/goal-visualizations/'),'Unexpected visualization URL '+id);const p='app/public'+link.url;if(!assetPins.has(p))assetPins.set(p,pin(p));digests[link.url]='sha256:'+assetPins.get(p).sha256;}
   must(r.goalFingerprint===fingerprintGoalForPositiveEvidence(g,kind.get(id)),'Current P science goal fingerprint stale '+id);
   must(r.reviewInputFingerprint===fingerprintPositiveGoalEvidenceReviewInput(g,r.reviewCriteriaFingerprint,digests,kind.get(id)),'Current P review-input fingerprint stale '+id);
   must(r.profileFingerprint===fingerprintPositiveGoalEvidenceProfile(r.profile),'Current P whole profile fingerprint stale '+id);
   selected.set(id,{...row,configPath,reviewPath:cfg.reviewPath,reviewId:r.reviewId,status:r.status,rawLineSha256:sha(row.rawLine)});
  }
  sources.push({config:pin(configPath),review:pin(cfg.reviewPath),criteria:pin(cfg.reviewCriteriaPath),goalIds:cfg.scope.goalIds});
 }
 must(selected.size===450&&[...ordinary].every(id=>selected.has(id)),'Selected P owners do not exactly cover450 ordinary goals');
 return{selected,sources,assetPins:[...assetPins.values()]};
}
export function activeDOwners(inputs=currentInputs()){
 const {chem,landscape,ledger,ordinary}=inputs;
 const indices=chem.resolutionIndexPaths.map((path:string)=>({path,index:read(path)}));
 const retirement=validateResolutionSemanticRetirements({config:chem,landscape,semanticKindLedger:ledger,indices,scopeIssues:[]});must(retirement.issues.length===0,'Existing native semantic retirements invalid');
 const chains=buildResolutionSupersessionChains(chem.resolutionSupersessions,chem.resolutionIndexPaths,ordinary,retirement);must(chains.issues.length===0,'Existing native D supersession chains invalid');
 const tips=new Map(chains.chains.map((c:any)=>[c.goalId,c.indexPaths.at(-1)])),withdrawals=new Set(chem.resolutionWithdrawals.map((r:any)=>r.indexPath+'#'+r.goalId));
 const owners=new Map<string,any>();
 for(const i of indices)for(const entry of i.index.resolutions){const id=entry.goalId;if(!ordinary.has(id)||withdrawals.has(i.path+'#'+id)||(tips.has(id)&&tips.get(id)!==i.path))continue;must(!owners.has(id),'Duplicate active D owner '+id);const group=i.index.groups.find((g:any)=>g.groupId===entry.groupId);must(group,'Missing native D group '+id);owners.set(id,{indexPath:i.path,entry,group});}
 must(owners.size===450,'Active D owners do not cover exactly450 ordinary goals');return{owners,indices,retirement,chains};
}
