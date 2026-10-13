// Apache-2.0. Scoped author bindings only; no independent judgment.
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync,lstatSync,chmodSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
const root='/home/enpasos/projects/skillpilot';
const name='chemie-aromatics20-bounded-source-and-operator-remediation-author-20261013-v4';
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/'+name;
const old='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-aromatics-dyes20-current231-scientific-author-20261013-v1';
const cap='tmp/'+name+'/private-parent';
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex');
const raw=(p:string)=>readFileSync(resolve(root,p),'utf8').trim().split('\n').filter(Boolean);
const write=(p:string,o:any)=>{mkdirSync(dirname(resolve(root,p)),{recursive:true});writeFileSync(resolve(root,p),JSON.stringify(o,null,2)+'\n')};
const cp=(p:string,q:string)=>{const target=resolve(root,q);mkdirSync(dirname(target),{recursive:true});if(existsSync(target)){const st=lstatSync(target);if(!st.isFile()||st.isSymbolicLink()||st.nlink!==1)throw Error('nonregular copy target '+q);chmodSync(target,0o600)}copyFileSync(resolve(root,p),target)};
async function main(){
 const mod=await import(pathToFileURL(resolve(root,'app/scripts/goalEvidenceProfileModel.ts')).href);
 const pmod=await import(pathToFileURL(resolve(root,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href);
 const norm=(x:any)=>String(x??'').normalize('NFKC').replace(/\s+/g,' ').trim();
 const fp=(g:any,ruleVersion:string)=>'sha256:'+createHash('sha256').update(mod.stableGoalEvidenceJson({ruleVersion,goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)})).digest('hex');
 const now=new Date().toISOString(),can=read(out+'/author/canonical-whole523.two-body-three-link.author-candidate.json'),actual=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');
 const specs=read(out+'/author/whole20.normal-materializer-input.author.json'),cases=read(out+'/author/whole40.expanded-cases.author.json').cases;
 const ids=specs.goals.map((g:any)=>g.goalId),P=raw(cap+'/author/P20.normal-v2.author-candidates.jsonl').map(JSON.parse),oldP=raw(old+'/author/P20.normal-v2.author-candidates.jsonl').map(JSON.parse);
 const Araw=raw(old+'/author/A20.normal-author-candidates.jsonl'),Mraw=raw(old+'/author/current20.memory.raw-exact-retained.jsonl');
 const Alines:string[]=[],Mlines:string[]=[],joins:any[]=[],errors:string[]=[],wholeChanges:any[]=[];
 for(const g of can.goals){const before=actual.goals.find((x:any)=>x.id===g.id);if(!before)throw Error('new goal '+g.id);const changed=Object.keys({...before,...g}).filter(k=>JSON.stringify(before[k])!==JSON.stringify(g[k]));if(changed.length)wholeChanges.push({goalId:g.id,changedFields:changed});if(!ids.includes(g.id)&&changed.length)errors.push('outside goal changed '+g.id);if(JSON.stringify(before.requires)!==JSON.stringify(g.requires)||JSON.stringify(before.contains)!==JSON.stringify(g.contains))errors.push('edge change '+g.id)}
 for(const gid of ids){
  const g=can.goals.find((x:any)=>x.id===gid),r=P.find((x:any)=>x.goalId===gid),previous=oldP.find((x:any)=>x.goalId===gid),c=cases.filter((x:any)=>x.goalId===gid);
  if(r.status!=='needs_human_review'||r.reviewAuthority!=='ai_candidate'||r.evidenceLevel!=='E1'||r.maximumClaimScope!=='G1')errors.push('authority '+gid);
  const resourceDigests=Object.fromEntries((g.resourceLinks??[]).filter((l:any)=>l.type==='goal-visualization').map((l:any)=>[l.url,hash(cap+'/app/public'+l.url)]));
  for(const e of pmod.validatePositiveGoalEvidenceRecordSemantics(r,g,resourceDigests,'curricularAtomic'))errors.push(String(e));
  if(r.goalFingerprint!==pmod.fingerprintGoalForPositiveEvidence(g,'curricularAtomic')||r.profileFingerprint!==pmod.fingerprintPositiveGoalEvidenceProfile(r.profile))errors.push('P binding '+gid);
  if(c.length!==2)errors.push('not two cases '+gid);
  for(const x of c){const brief=r.profile.applicationCaseBriefs.find((b:any)=>b.id===x.caseId);for(const lang of ['De','En']){if(brief['taskDemand'+lang]!==x['data'+lang]+'\n'+x['task'+lang]||brief['expectedPerformance'+lang]!==x['modelAnswer'+lang])errors.push('brief parity '+x.caseId);for(const rub of x.rubric){const sp=rub['taskSpan'+lang];if(x['task'+lang].slice(sp.start,sp.end)!==rub['taskClause'+lang])errors.push('rubric span '+rub.criterionId)}}}
  const aline=Araw.find(l=>JSON.parse(l).goalId===gid)!,mline=Mraw.find(l=>JSON.parse(l).goalId===gid)!,a=JSON.parse(aline),m=JSON.parse(mline),bodyChanged=a.fingerprint!==fp(g,'semantic-atomicity-v1');
  if(bodyChanged){a.fingerprint=fp(g,'semantic-atomicity-v1');a.reviewedAt=now;a.reviewer='Codex original author, bounded successor only';a.reason='Bounded successor author rationale only: '+(gid.startsWith('4b981')?'Researching source-specific simple organic-compound information supports the same I/M comparative explanation of acidity and basicity. This is one structure-property comparison with source access, not a separate literature-review skill. Both complete cases explicitly demand locatable source access and explanations; an independent atomicity decision remains required.':'English now includes the four explicitly named German directing examples, aniline and nitrobenzene as well as toluene and phenol, and expressly names directing effects. The same two complete cases already assess those examples and their protonation conditions; scientific scope remains the same. An independent atomicity decision remains required.');m.fingerprint=fp(g,m.ruleVersion);m.status='needs_developer_review';m.memoryUseful=null;m.reviewedAt=now;m.reviewer='Codex author, new whole body requires independent memory decision';m.reason='Previous no_memory_needed input retained separately. '+(gid.startsWith('4b981')?'Added source research is source access and I/M transfer, not an authored list to memorize.':'Translation parity correction does not author a new recall obligation.')+' This pending candidate is not a renewed independent memory approval.';delete m.memoryGoalIds;delete m.deckIds;Alines.push(JSON.stringify(a));Mlines.push(JSON.stringify(m))}
  else{Alines.push(aline);Mlines.push(mline)}
  joins.push({goalId:gid,bodyFingerprintChanged:bodyChanged,goalFingerprintBefore:previous.goalFingerprint,goalFingerprintAfter:r.goalFingerprint,profileFingerprintBefore:previous.profileFingerprint,profileFingerprintAfter:r.profileFingerprint,reviewInputFingerprintBefore:previous.reviewInputFingerprint,reviewInputFingerprintAfter:r.reviewInputFingerprint,profileSubstantivelyChanged:gid.startsWith('4b981'),imageAdded:['f0f67a7a','e5941581','3dbd84de'].some(x=>gid.startsWith(x)),MrawLineRetained:!bodyChanged,Mstatus:m.status,caseIds:c.map((x:any)=>x.caseId),newIndependentVotes:0});
 }
 const tuples=[['A20.normal-author-candidates.jsonl',Alines],['M20.author-successor-pending2-retained18.jsonl',Mlines]] as const;
 for(const [filename,lines] of tuples){writeFileSync(resolve(root,out+'/author/'+filename),lines.join('\n')+'\n');cp(out+'/author/'+filename,cap+'/author/'+filename)}
 cp(old+'/author/current20.memory.raw-exact-retained.jsonl',out+'/inputs/prior-M20.raw-exact.jsonl');
 const cardsBind=read(old+'/author/current20.memory-retention.bindings.json'),oldmc=read(cardsBind.inputConfig.path),cards=raw(oldmc.cardReviewPath).map(JSON.parse),relevant=cards.filter((x:any)=>(x.originGoalIds??[]).some((id:string)=>ids.includes(id)));
 if(relevant.length)errors.push('unexpected relevant card rows');
 const M=read(old+'/configs/M20.exact-retention.inactive.config.json');M.reviewPath='author/M20.author-successor-pending2-retained18.jsonl';M.cardReviewPath='author/M20.no-relevant-cards.jsonl';M.reportPath='checks/M20.scoped.report.md';M.scope.label='18 exact current M rows and2 pending changed-body author candidates';
 mkdirSync(resolve(root,cap+'/author'),{recursive:true});writeFileSync(resolve(root,cap+'/'+M.cardReviewPath),'');
 for(const s of M.visibilityScopes)cp(s.viewPath,cap+'/'+s.viewPath);
 for(const g of can.goals){for(const k of ['vocabularySource','vocabularySourceEn']){const s=g.extendedData?.[k];if(typeof s==='string'){const p=s.startsWith('/data/')?'app/public'+s:s.replace(/^\//,'');cp(p,cap+'/'+p)}}}
 write(cap+'/configs/M20.author.inactive.config.json',M);write(out+'/configs/M20.private-stock.inactive.config.json',M);
 const A=read(old+'/configs/A20.author.inactive.config.json');A.reviewPath='author/A20.normal-author-candidates.jsonl';A.scope.label='20 pending author atomicity rationales;2 current-body successors';write(cap+'/configs/A20.author.inactive.config.json',A);write(out+'/configs/A20.private-stock.inactive.config.json',A);
 for(const script of ['semanticAtomicityReview.ts','memoryCardReview.ts'])cp('app/scripts/'+script,cap+'/app/scripts/'+script);
 write(out+'/checks/actual-P-A-M-case-resource-binding-closure.json',{schemaVersion:1,atUTC:now,counts:{wholeNodes:can.goals.length,profiles:P.length,fullCases:cases.length,criteria:cases.reduce((s:number,c:any)=>s+c.rubric.length,0),authorAtomicityPending:20,MrawRetained:18,MchangedBodyPending:2,actualGlobalCardRowsRead:cards.length,relevantCardOrigins:relevant.length,newScientificStrictGain:0},wholeChanges,joins,relevantCardRows:relevant,visibilityScopes:M.visibilityScopes.map((s:any)=>({...s,sha256:hash(s.viewPath)})),errors,passed:errors.length===0});
 console.log(JSON.stringify({errors,passed:errors.length===0,wholeChanges,normalP20:P.length,Mretained18:18,Mpending2:2,newScientificStrictGain:0}));if(errors.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1});
