import { createHash } from 'node:crypto';
import { readFileSync,writeFileSync,mkdirSync,mkdtempSync,copyFileSync,rmSync } from 'node:fs';
import { dirname,resolve } from 'node:path';
import { createVisualizationContextVerifier as proposed, hasVerifiedVisualizationContext as hasPrivate } from '/home/enpasos/projects/skillpilot/qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-candidate/goalVisualizationReviewedContext.private.ts';
import { createVisualizationContextVerifier as original, hasVerifiedVisualizationContext as hasActive } from '/home/enpasos/projects/skillpilot/app/scripts/goalVisualizationReviewedContext.ts';
const root='/home/enpasos/projects/skillpilot';const dir=root+'/qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-candidate';const out=root+'/qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-independent-peer';
const idx=JSON.parse(readFileSync(dir+'/candidate-index.json','utf8'));const source=JSON.parse(readFileSync(root+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','utf8'));
const hash=(x:Buffer)=>createHash('sha256').update(x).digest('hex');const evidence:any[]=[];const calls=new Map();const tmp=mkdtempSync('/dev/shm/econ-ind-peer-main-');
const write=(value:any,name='receipt.json')=>{const raw=Buffer.from(JSON.stringify(value,null,2)+'\n');writeFileSync(tmp+'/'+name,raw);return{path:name,sha256:hash(raw)}};
const privateVerify=proposed({repositoryRoot:root,acceptedRepositoryCommit:idx.acceptedRepositoryCommit,onAuthenticatedOriginalRead:(ref,current)=>calls.set(ref.gitCommit+':'+ref.path,{...ref,currentCopyRequired:current})});
const activeVerify=original({repositoryRoot:tmp,originalEvidenceRepositoryRoot:root,acceptedRepositoryCommit:idx.acceptedRepositoryCommit});
const ramVerify=proposed({repositoryRoot:tmp,originalEvidenceRepositoryRoot:root,acceptedRepositoryCommit:idx.acceptedRepositoryCommit});
const profiles=['matrix-candidate-v1','economics-native-v1','diagram-current-b-v1','economics-q3-embedded-v1','economics-q3-trade-finance-v1'];
const result=(x:any)=>x.ok?{ok:true,receiptSha256:x.capability.receiptSha256,contextFields:Object.keys(x.capability.context)}:{ok:false,status:x.status,issues:x.issues};
const check=(name:string,x:any,expected:boolean)=>{evidence.push({name,expectedOk:expected,result:result(x)});if(x.ok!==expected)throw new Error('Unexpected: '+name+' '+JSON.stringify(result(x)))};
const context=(gid:string)=>{const list=source.goals.filter((g:any)=>g.id===gid);if(list.length!==1)throw new Error('Goal cardinality');const g=list[0];const links=g.resourceLinks.filter((l:any)=>l.type==='goal-visualization'&&(!l.role||l.role==='primary'));if(links.length!==1)throw new Error('Primary cardinality');const url=links[0].url;return{landscapeId:source.landscapeId,goalId:gid,subject:'wirtschaftswissenschaften',title:g.title,description:g.description,titleEn:g.titleEn,descriptionEn:g.descriptionEn,demandLevel:g.dimensionTags?.demandLevel,assetSha256:'sha256:'+hash(readFileSync(root+'/app/public'+url)),imageUrl:url,publicAssetPath:'app/public'+url,canonicalAssetPath:'curricula/DE/Gymnasium/visualizations/'+url.slice('/assets/goal-visualizations/'.length)}};
try {
 for(let i=0;i<idx.rows.length;i++){
  const row=idx.rows[i],ref=idx.candidateReceipts[i],ctx=context(row.goalId);const rc=JSON.parse(readFileSync(root+'/'+ref.path,'utf8'));
  const pass=privateVerify({path:ref.path,sha256:ref.sha256},ctx);check('original-current-'+row.goalId,pass,true);
  if(!pass.ok)throw new Error('Unreachable');if(!hasPrivate(pass.capability,ctx)||hasActive(pass.capability,ctx)||hasPrivate({...pass.capability},ctx))throw new Error('Capability domain boundary');
  for(const profile of profiles)check('unchanged-profile-'+profile+'-'+row.goalId,activeVerify(write({...rc,reviewProfile:profile}),ctx),false);
 }
 const selected=[idx.rows[0],idx.rows.find((r:any)=>r.corrected)];
 for(const row of selected){
  const pos=idx.rows.findIndex((r:any)=>r.goalId===row.goalId),rc=JSON.parse(readFileSync(root+'/'+idx.candidateReceipts[pos].path,'utf8')),ctx=context(row.goalId);
  for(const path of [ctx.publicAssetPath,ctx.canonicalAssetPath]){mkdirSync(dirname(resolve(tmp,path)),{recursive:true});copyFileSync(resolve(root,path),resolve(tmp,path));}
  const ref=write(rc);check('ram-current-positive-'+row.goalId,ramVerify(ref,ctx),true);
  check('whitespace-normalization-'+row.goalId,ramVerify(ref,{...ctx,title:'  '+ctx.title.replaceAll(' ','\n\t ')+'  ',description:ctx.description.replaceAll(' ','  ')}),true);
  check('full-description-drop-last-sentence-part-'+row.goalId,ramVerify(ref,{...ctx,description:ctx.description.slice(0,-12)}),false);
  check('translated-full-DE-description-'+row.goalId,ramVerify(ref,{...ctx,description:ctx.descriptionEn}),false);
  check('current-subject-case-fold-'+row.goalId,ramVerify(ref,{...ctx,subject:'Wirtschaftswissenschaften'}),false);
  check('current-owner-swap-'+row.goalId,ramVerify(ref,{...ctx,landscapeId:'68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'}),false);
  check('EN-drift-within-original-scope-'+row.goalId,ramVerify(ref,{...ctx,titleEn:'Completely different English topic',descriptionEn:'Unreviewed new English description'}),row.corrected);
  check('demand-drift-within-original-scope-'+row.goalId,ramVerify(ref,{...ctx,demandLevel:'AB9'}),row.corrected);
  const rc2=structuredClone(rc);rc2.context.titleEn='Invented new review scope';check('receipt-false-expanded-EN-'+row.goalId,ramVerify(write(rc2),ctx),false);
  check('receipt-new-timestamp-'+row.goalId,ramVerify(write({...rc,reviewedAt:'2026-11-07T04:00:00Z'}),ctx),false);
  check('receipt-new-reviewer-'+row.goalId,ramVerify(write({...rc,reviewer:'A current fabricated reviewer'}),ctx),false);
 }
 const refs=JSON.parse(readFileSync(dir+'/private-family-pins.json','utf8')).originalReferences;
 if(calls.size!==refs.length||refs.some((r:any)=>{const a=calls.get(r.gitCommit+':'+r.path);return!a||a.sha256!==r.sha256||a.currentCopyRequired!==r.currentCopyRequired}))throw new Error('Full raw read closure differs');
 writeFileSync(out+'/own-verifier-tests.json',JSON.stringify({kind:'independent-positive-negative-verifier-run',cases:evidence.length,privateCurrentPositive:17,unchangedProfileRejects:85,allExpected:true,capturedOriginalReferences:calls.size,capabilityCloneRejected:true,privateCapabilityNotActiveCapability:true,correctedEnglishAndDemandDriftPassOnlyMeansOutsideAttestedFields:true,results:evidence},null,2)+'\n');
 console.log(JSON.stringify({cases:evidence.length,allExpected:true,capturedOriginalReferences:calls.size}));
} finally {rmSync(tmp,{recursive:true,force:true})}
