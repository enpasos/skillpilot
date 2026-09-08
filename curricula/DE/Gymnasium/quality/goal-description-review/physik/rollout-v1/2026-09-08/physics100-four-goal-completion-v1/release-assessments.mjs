// Read-only guarded release preparation; --emit-patch outputs a minimal apply_patch document.
// The immutable body receipt is an informed AI counter-review, not human approval or blind D.
import fs from 'node:fs'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {paths} from './authoring-spec.mjs'
const base='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-four-goal-completion-v1', read=p=>JSON.parse(fs.readFileSync(p,'utf8'))
const hash=x=>'sha256:'+createHash('sha256').update(x).digest('hex'), fileHash=p=>hash(fs.readFileSync(p))
const receiptPath=base+'/informed-assessment-counterreview-b-20260908.json', b=read(receiptPath)
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(process.cwd()+'/app/scripts/goalBookModel.ts'))
const original=fs.readFileSync(paths.canonical,'utf8'),c=JSON.parse(original),kText=fs.readFileSync(paths.kinds,'utf8'),k=JSON.parse(kText)
const reviewedIds=new Set(b.records.map(r=>r.goalId))
if(b.summary.reviewed!==8||b.summary.keepBody!==8||b.summary.requiredBodyRevisions!==0||reviewedIds.size!==8||b.provenance.humanApprovalClaim!==false)throw Error('Counter-review not complete, positive and AI-only')
for(const spec of b.sourceBodyChecks.specFiles)if(fileHash(spec.path)!==spec.sha256)throw Error('Spec changed since counter-review: '+spec.path)
const aFindings=[
 'Audio: the 400/800-Hz input frequencies are inside [398,404]/[794,802] Hz. Path interruption tests the optical link. The complete observed S-build, own measurements and control evidence share an indivisible 8/0 unit; other 8 points cannot reach pass 10. D does not certify a build.',
 'Multiplex: 1010 and 0110 yield red, blue, both, none. The designed combining/filtering path separates two independent channels. Equal received intensity and absence of additional coding make same-colour 10/01 indistinguishable; industrial construction is not required.',
 'Bistability: cross-coupled collector-to-opposite-base resistors produce two stable supplied-model states. P1 grounds B1, switches T1 off and T2 on, makes Q=C2 low and leaves the feedback state after release; P2 reverses it. Undefined initialization is kept distinct from periodic oscillation.',
 'Elements: production in earlier stellar environments and later transport/mixing are separate causal steps. Carbon/gold detected around a younger star do not prove local direct hydrogen fusion. The task asks for a material-supported argument, not a complete quantitative fusion chain.',
 'End states: early remaining totals are 0.6/10/16 solar masses, while the supplied 1.6/5 compact remnants for B/C are different quantities. White dwarf/neutron star/black hole conclusions use the stated evolution; 2.1–2.5 across assumed 2.3 remains conditional, not a universal initial-mass boundary.',
 'Reactor: the thermal schematic separates fuel, slowing moderator, neutron-absorbing rods and coolant heat transport. Pump loss is not neutron absorption, and supplied decay heat remains after shutdown. This paper task makes no construction or reactor-operation qualification claim.',
 'Amplifier: active I_C=100 I_B with 1-kohm load gives 10 V minus I_C R_C. A 50-microampere bias gives 5 V; 40/60 gives 6/4 V, with inverted small-signal change. The 0.2/10-V limits and biased 80±30 case correctly require shifting the operating point for the retained amplitude.',
 'Switch: the complete 5-V LED/330-ohm collector path, 10-kohm base path, common return and physical pin labels permit real specified assembly. The thin-base model explains transistor action. S requires observed own setup and measurements in the indivisible 8/0 unit; D never certifies hands-on performance.'
]
const records=[]
for(let i=0;i<b.records.length;i++){
 const r=b.records[i],g=c.goals.find(x=>x.id===r.goalId),d=k.decisions.find(x=>x.goalId===r.goalId)
 if(!g||!d||g.examData.reviewStatus!=='draft'||r.decision!=='keep_body'||r.requiredBodyChanges.length)throw Error('Unsafe release target '+r.goalId)
 if(d.sourceFingerprint!==fingerprintSemanticKindSourceGoal(g))throw Error('Current K stale before own release '+r.goalId)
 const e=g.examData,body=JSON.stringify({taskContent:e.taskContent,taskContentEn:e.taskContentEn,solutionContent:e.solutionContent,solutionContentEn:e.solutionContentEn,scoring:e.scoring})
 if(hash(body)!==r.bodySha256)throw Error('Current task body changed since independent B review '+r.goalId)
 if(JSON.stringify(g.requires)!==JSON.stringify(e.coveredGoalIds))throw Error('Requires differs from actual reviewed coverage '+r.goalId)
 const materials=[]
 for(const [field,suffix] of [['taskContent','task.de'],['taskContentEn','task.en'],['solutionContent','solution.de'],['solutionContentEn','solution.en']]){
  const path=base+'/materials/'+r.goalId+'.'+suffix+'.md'
  if(fs.readFileSync(path,'utf8')!==e[field]+'\n')throw Error('Material body mismatch '+path)
  materials.push({path,sha256:fileHash(path)})
 }
 const before={reviewStatus:e.reviewStatus,reviewNote:e.reviewNote,kindFingerprint:d.sourceFingerprint}
 e.reviewStatus='released'
 e.reviewNote='Locally released on 2026-09-08 after individual informed AI author review A and independent informed AI body/solution/scoring counter-review B (b034-current-eight-assessments-informed-counterreview-b-20260908, exact body hash bound). No human approval, blind D review, deployment or observed learner performance is claimed. S-mode, where designated, requires genuinely observed personal assembly and own evidence; D does not certify a build.'
 d.sourceFingerprint=fingerprintSemanticKindSourceGoal(g)
 records.push({goalId:r.goalId,bodySha256:r.bodySha256,before,after:{reviewStatus:e.reviewStatus,reviewNote:e.reviewNote,kindFingerprint:d.sourceFingerprint},authorReviewA:{reviewer:'OpenAI Codex /root/physics_d043s_blind_a',mode:'informed-author-content-review',decision:'keep_body',finding:aFindings[i],humanApproval:false},counterReviewB:{receiptPath,decision:r.decision,bodySha256:r.bodySha256},materials})
}
const after=JSON.stringify(c,null,2)+'\n',kAfter=JSON.stringify(k,null,2)+'\n'
const initial=JSON.parse(original),initialK=JSON.parse(kText)
for(const g of initial.goals)if(!reviewedIds.has(g.id)&&JSON.stringify(g)!==JSON.stringify(c.goals.find(x=>x.id===g.id)))throw Error('Unrelated canonical mutation')
for(const d of initialK.decisions)if(!reviewedIds.has(d.goalId)&&JSON.stringify(d)!==JSON.stringify(k.decisions.find(x=>x.goalId===d.goalId)))throw Error('Unrelated K mutation')
const receipt={schemaVersion:1,status:'applied-local-AI-release-via-guarded-patch',preparedAt:new Date().toISOString(),provider:'OpenAI',agent:'Codex /root/physics_d043s_blind_a',model:'unknown',modelVersion:'unknown',reviewMode:'informed-author-review-plus-informed-independent-AI-counterreview',humanApproval:false,blindDReview:false,deploymentClaim:false,counterReview:{path:receiptPath,sha256:fileHash(receiptPath)},canonicalBeforeSha256:hash(original),canonicalAfterSha256:hash(after),kBeforeSha256:hash(kText),kAfterSha256:hash(kAfter),changedFields:['Eight examData.reviewStatus values','Eight examData.reviewNote values','Eight corresponding native semantic-kind sourceFingerprint values'],bodyChanges:0,unrelatedCanonicalGoalChanges:0,unrelatedKindDecisionChanges:0,records}
if(process.argv[2]==='--emit-patch'){
 const out=['*** Begin Patch']
 for(const [file,content] of [[paths.canonical,after],[paths.kinds,kAfter]]){
  const diff=spawnSync('diff',['-u',file,'-'],{input:content,encoding:'utf8',maxBuffer:5000000})
  if(diff.status!==1)throw Error('Expected scoped native diff '+file)
  out.push('*** Update File: '+file,...diff.stdout.trimEnd().split('\n').slice(2).map(s=>/^@@ .* @@/u.test(s)?'@@':s))
 }
 const output=base+'/assessment-release-receipt-a-20260908.json'
 if(fs.existsSync(output))throw Error('Existing release receipt; do not replay release')
 out.push('*** Add File: '+output,...(JSON.stringify(receipt,null,2)+'\n').split('\n').map(s=>'+'+s),'*** End Patch')
 console.log(out.join('\n'))
}else console.log(JSON.stringify({status:'PASS',action:'read-only guarded draft-to-released preparation',taskCount:records.length,bodyChanges:0,materialFilesChecked:records.reduce((n,r)=>n+r.materials.length,0),counterReviewSha256:receipt.counterReview.sha256,records:records.map(r=>({goalId:r.goalId,bodySha256:r.bodySha256}))},null,2))

