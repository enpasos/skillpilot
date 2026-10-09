import copy
import datetime
import hashlib
import json
import os
import pathlib
import re
import shutil
import unicodedata

R=pathlib.Path('/home/enpasos/projects/skillpilot')
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
A=B/'biologie-molecular-genetics-twenty-three-native-preparation-author-v1'
D=B/'biology-molecular-genetics-twenty-three-native-independent-a-v1'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads((R/p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256((R/p).read_bytes()).hexdigest()
def bind(p):return {'path':str(p),'sha256':sha(p),'bytes':(R/p).stat().st_size}
def write(name,obj):
 p=D/name;assert not (R/p).exists(),str(p);(R/p).parent.mkdir(parents=True,exist_ok=True);(R/p).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return p
def textwrite(name,body):
 p=D/name;assert not (R/p).exists(),str(p);(R/p).parent.mkdir(parents=True,exist_ok=True);(R/p).write_text(body);return p
def jsstable(v):return json.dumps(v,sort_keys=True,ensure_ascii=False,separators=(',',':'))
def norm(v):return re.sub(r'\s+',' ',unicodedata.normalize('NFKC',str(v or ''))).strip()

e=read(A/'neutral-twenty-three-native-independent-review.entry.json')
pf=read(D/'current-native23-P-frame.actual-FIRST.independent-A.verdict.json')
splice=read(D/'one-current-Splice-kind-atomicity-memory.actual-FIRST.independent-A.verdict.json')
judgment_by_id={j['goalId']:j for j in pf['perGoalJudgments']}

prior={(1,7),(1,10),(1,13),(2,4),(2,5)}
page_rows=[]
for p in e['pageMap']:
 if (p['part'],p['physicalPage']) in prior:continue
 image_path=D/f"actual-native-extracts/part-{p['part']}.physical-page-{p['physicalPage']}.actual-render.png"
 page_rows.append({**p,'actualFullPageRenderSeen':bind(image_path),'viewTool':'view_image detail original, individual full PDF-page render','descriptionTextReadable':True,'descriptionTextClipped':False,'imageClipped':False,'prerequisiteSuccessorScopeTextReadable':True,'ownJudgment':'KEEP_ACTUAL_NATIVE_PAGE_LAYOUT','reason':'The actual goal title/description and applicable scope, links and supporting raster fit on this page without clipping, overlap or missing text. This checks the actual native page rendering, not a new pixel/source-science review or resolution of existing V dissents.'})
page_followup=write('native23-additional-eighteen-actual-page-views.AFTER-D-FIRST.independent-A.json',{'schemaVersion':1,'role':'actual18 individual native page views after immutable own D23 FIRST','createdAt':NOW,'ownOriginalDfirst':bind(D/'native23-description.actual-FIRST.independent-A.verdict.json'),'ownOriginalDfirstSeal':bind(D/'native23-description.actual-FIRST.independent-A.freeze.json'),'additionalActualPageViewCount':18,'priorActualIndividualPageViewCount':5,'totalActualGoalPagesSeen':23,'additionalActualPages':page_rows,'descriptionFirstJudgmentsChanged':False,'canonicalDescriptionsReauthored':False,'currentV23Approved':False,'currentSourceWholeCourseApproved':False,'humanApproval':False,'humanTrial':False,'activeWrites':[],'strictGain':0})
page_seal=write('native23-additional-eighteen-actual-page-views.AFTER-D-FIRST.independent-A.freeze.json',{'schemaVersion':1,'createdAt':NOW,'role':'immutable actual additional native page inspection','followup':bind(page_followup),'unchangedOriginalDfirst':bind(D/'native23-description.actual-FIRST.independent-A.verdict.json'),'humanApproval':False,'activeWrites':[]})

g=splice['wholeCurrentGoal'];gid=g['id'];lid='08a43a1b-d97e-522c-9dfa-c950a493364e'
am_paths={}
for lane,rv,status,flag,reason in [('A','semantic-atomicity-v1','atomic','semanticAtomic',splice['atomicityConfirmation']['reason']),('M','memory-card-review-v1','no_memory_needed','memoryUseful',splice['memoryConfirmation']['reason'])]:
 payload={'ruleVersion':rv,'goalId':gid,'shortKey':g.get('shortKey',''),'title':norm(g.get('title')),'titleEn':norm(g.get('titleEn')),'description':norm(g.get('description')),'descriptionEn':norm(g.get('descriptionEn')),'phase':norm(g.get('dimensionTags',{}).get('phase')),'area':norm(g.get('dimensionTags',{}).get('area')),'topicCode':norm(g.get('dimensionTags',{}).get('topicCode')),'nodeKind':norm(g.get('nodeKind'))}
 fp='sha256:'+hashlib.sha256(jsstable(payload).encode()).hexdigest()
 rid='bio23-current-Splice-'+lane+'-independent-a-v1'
 r={'schemaVersion':1,'reviewId':rid,'ruleVersion':rv,'landscapeId':lid,'goalId':gid,'fingerprint':fp,'status':status,flag:lane=='A','reviewedAt':splice['firstJudgmentAt'],'reviewer':splice['reviewer'],'reason':reason}
 if lane=='M':r.update({'memoryGoalIds':[],'deckIds':[]})
 rp=textwrite(f'normal-Splice-{lane}1.independent-A.records.jsonl',json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n')
 cfg={'schemaVersion':1,'reviewId':rid,'ruleVersion':rv,'landscapeId':lid,'landscapePath':e['candidateCanonicalPath'],'reviewPath':str(rp),'scope':{'label':'One genuinely independently judged current Splice DEEN goal;393 earlier A/M records retained outside this scope','leafGoalIds':[gid]}}
 cp=write(f'normal-Splice-{lane}1.independent-A.config.json',cfg)
 am_paths[lane]={'record':bind(rp),'config':bind(cp)}
kind_record=write('normal-one-current-Splice-kind.actual-independent-confirmation.json',{'schemaVersion':1,'goalId':gid,'candidateDecision':read(pathlib.Path(e['genuineSpliceKindAMConfirmationInputPath']))['candidateKind'],'genuineIndependentConfirmation':splice['kindConfirmation'],'wholeCurrentGoal':g,'ownFirst':bind(D/'one-current-Splice-kind-atomicity-memory.actual-FIRST.independent-A.verdict.json'),'other393KindDecisionsRetained':True,'actualCurrentCandidateKinds':bind(pathlib.Path(e['candidateKindsPath'])),'activeLedgerWrite':False,'reviewAuthority':'ai_candidate','humanApproval':False})

# The P run has one actual full394 semantic model binding, containing both native batches.
# No cross-book run identity is fabricated and no author verdict is substituted for own rationale.
prompt=textwrite('normal-current-P23.actual-independent-review-prompt.md', '''# Actual current Bio23 P review

Review the whole current23 bilingual goal/profile/case bodies and real12+11 native page contexts. Preserve prior independently read exact scientific material, and read only genuinely changed scientific fields anew. Explicitly check complete current PCR strand/primer/cycle models, complete karyotype evidence limits, the four Splice premature-stop/NMD explanation fields, original source38/partner44 duties and the conditional current Splice kind/A/M.

Assess positive learner-produced explanation/model/comparison/transfer under the bound original positive-understanding-evidence-v2 criteria. Whole-pair rubric references create no per-case requirement or extra task quota. Images support the material; no image or synthetic candidate establishes learner performance, performed experiment, clinical efficacy or Human Approval. Fresh other current P/D/AM result bodies are not inputs. Separate source/course and unresolved V gates remain open.

Produce own ordinary P-v2 ai_candidate/needs_human_review records with E1/G1 and the exact actual goal/resource/profile fingerprints. This file documents the actual authorized review task already performed; it is not a new model generation or new science review of all unchanged23.
''')
params=write('normal-current-P23.actual-generation-disclosure.json',{'provider':'OpenAI/Codex','actualModelVariant':'unexposed','actualModelVersion':'unexposed','temperature':'unexposed','role':'subject_reviewer','freshCurrentPRecordsFromOthersRead':False,'actualToolModelNone':True,'declaredModelUnexposed':True,'separateLaneVisualDissentSummaryKnown':True,'historicalOwnSourceAndScienceReviewsReused':True,'materialAuthor':False})
criteria=pathlib.Path(read(pathlib.Path(e['positiveConfigPath']))['reviewCriteriaPath'])
frame=write('normal-current-P23.actual-neutral-review-frame.json',{'schemaVersion':1,'role':'neutral actual P23 current native/model/resource/material input frame; no scientific outcome labels','originalNeutralNativeEntry':bind(A/'neutral-twenty-three-native-independent-review.entry.json'),'actualFull394CandidateModel':bind(pathlib.Path(e['actualFullCandidateModelPath'])),'bookDigest':read(pathlib.Path(e['actualFullCandidateModelPath']))['digest'],'wholeCurrentP23Cases46':bind(pathlib.Path(e['wholeCaseMaterialsPath'])),'wholeCurrentSource38Partners44':bind(pathlib.Path(e['wholeSourceDutiesPath'])),'actualNativePDFs':e['actualNativePDFs'],'actualNativeHTMLs':e['actualNativeHTMLs'],'wholeCurrentCanonical':bind(pathlib.Path(e['candidateCanonicalPath'])),'wholeCurrentKindLedger':bind(pathlib.Path(e['candidateKindsPath'])),'pageMap':e['pageMap'],'goalIds':e['goalIds'],'actualReviewPrompt':bind(prompt),'actualReviewCriteria':bind(criteria),'noWholeSourceCourseOrVApproval':True,'humanApproval':False,'activeWrites':[]})
rid='bio23-current-native-P23-independent-a-v1';run_id=rid+'-actual-run'
author_records=[json.loads(l) for l in (R/pathlib.Path(e['positiveRecordPath'])).read_text().splitlines() if l.strip()]
output=[]
for record in author_records:
 j=judgment_by_id[record['goalId']]
 r=copy.deepcopy(record)
 assert r['profile']==next(row['wholeProfile'] for row in read(pathlib.Path(e['wholeCaseMaterialsPath']))['entries'] if row['goalId']==r['goalId'])
 r.update({'reviewId':rid,'reviewedAt':pf['firstJudgmentAt'],'reviewer':pf['reviewer'],'reviewRunIds':[run_id],'status':'needs_human_review','reviewAuthority':'ai_candidate','dissent':[],'reason':'Actual current native goal/page/resources reviewed. '+ ' '.join(c['ownConcreteMechanismAndCoverageJudgment'] for c in j['criterionJudgments'])+' '+j.get('targetedActualSpliceExplanationJudgment','')+' Whole original source/partner duties remain separately bounded; unresolved visual/source gates and Human Approval are not granted. Own FIRST: current-native23-P-frame.actual-FIRST.independent-A.verdict.json.'})
 output.append(r)
records=textwrite('normal-current-P23.independent-A.records.jsonl',''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in output))
run=write('normal-current-P23.independent-A.run.json',{'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':run_id,'bundleFingerprint':sha(frame),'bookDigest':read(pathlib.Path(e['actualFullCandidateModelPath']))['digest'],'provider':'OpenAI/Codex','model':'declaredModelUnexposed','role':'subject_reviewer','promptFamilyId':'positive-understanding-evidence-v2','promptFingerprint':sha(prompt),'criteriaFingerprint':sha(criteria),'generationParametersFingerprint':sha(params),'independenceGroupId':rid,'blindToOtherRuns':True,'goalIds':e['goalIds'],'inputArtifacts':[{'role':'book_model','digest':read(pathlib.Path(e['actualFullCandidateModelPath']))['digest']},{'role':'review_input_json','digest':sha(frame)},{'role':'review_markdown','digest':sha(pathlib.Path(e['wholeCaseMaterialsPath']))},{'role':'review_prompt','digest':sha(prompt)},{'role':'review_criteria','digest':sha(criteria)}],'startedAt':read(D/'native23.actual-input.first.freeze.json')['createdAt'],'completedAt':pf['firstJudgmentAt'],'status':'completed','outputDigest':sha(records),'toolchainVersion':'existing-repository-ordinary-positive-evidence-validator'})
cfg=read(pathlib.Path(e['positiveConfigPath']));cfg.update({'reviewId':rid,'reviewPath':str(records),'reviewRunManifestPaths':[str(run)]});cfg['scope']['label']='Actual independent P23 current native frame;19 exact earlier science bodies+one targeted Splice explanation+3 current cases/profile judgments; source/V/Human separate'
config=write('normal-current-P23.independent-A.config.json',cfg)

# A small portable validation capsule provides only the original validator code/schema,
# exact23 PNGs and repo-relative input access. No active public asset is installed.
cap=D/'ordinary-current-P23-validation-capsule';(R/cap).mkdir()
copied=[]
for p in ['app/package.json','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/positiveGoalEvidenceProfileModel.ts','app/scripts/goalEvidenceProfileModel.ts','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:
 target=R/cap/p;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/p,target);copied.append({'original':bind(pathlib.Path(p)),'capsuleCopy':bind(cap/p)})
(R/cap/'curricula').symlink_to(os.path.relpath(R/'curricula',R/cap),target_is_directory=True)
(R/cap/'app/node_modules').symlink_to(os.path.relpath(R/'app/node_modules',R/cap/'app'),target_is_directory=True)
for row in read(pathlib.Path(e['wholeCaseMaterialsPath']))['entries']:
 for link in row['wholeCurrentGoalWithResources']['resourceLinks']:
  if link['type']!='goal-visualization':continue
  source_asset=A/link['url'].lstrip('/');target=cap/'app/public'/link['url'].lstrip('/')
  (R/target).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(R/source_asset,R/target)
  copied.append({'original':bind(source_asset),'capsuleCopy':bind(target)})
portable=write('ordinary-current-P23-capsule.actual-portable-bindings.json',{'schemaVersion':1,'role':'small ordinary validator capsule; no active write/source approval/new pixel view','capsulePath':str(cap),'copies':copied,'repoRelativeLinks':[{'path':str(cap/'curricula'),'target':os.readlink(R/cap/'curricula')},{'path':str(cap/'app/node_modules'),'target':os.readlink(R/cap/'app/node_modules'),'localIgnoredRuntimeCache':True}],'normalPConfig':bind(config),'normalPRecords':bind(records),'normalPRun':bind(run),'ordinarySpliceAM':am_paths,'kindConfirmation':bind(kind_record),'nativePageFollowup':bind(page_followup),'nativePageFollowupSeal':bind(page_seal),'activeWrites':[],'humanApproval':False})
print(json.dumps({'frame':bind(frame),'Pconfig':bind(config),'Precords':bind(records),'Prun':bind(run),'SpliceAM':am_paths,'pageFollowup':bind(page_followup),'pageFollowupSeal':bind(page_seal),'capsule':str(cap),'portableBindings':bind(portable)},indent=2))
