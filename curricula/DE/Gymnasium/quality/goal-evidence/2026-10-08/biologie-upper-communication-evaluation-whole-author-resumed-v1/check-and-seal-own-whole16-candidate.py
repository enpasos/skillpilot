# SPDX-License-Identifier: Apache-2.0
"""Ordinary technical checks and neutral first author freeze; no QA approvals."""
import hashlib,importlib.util,json,subprocess
from datetime import datetime,timezone
from pathlib import Path
import jsonschema
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix();CHECKS=OWN/'checks';CHECKS.mkdir(exist_ok=True)
def data(path):return json.loads(path.read_text())
def write(name,x):(OWN/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def bind(path):
 b=path.read_bytes();return {'path':path.relative_to(ROOT).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
assert not (OWN/'whole-sixteen-author-candidate.first.freeze.json').exists(),'First freeze is immutable; create a new addendum if needed.'
commands=[['./node_modules/.bin/tsx','scripts/materializePositiveGoalEvidenceCandidates.ts','--config',REL+'/sixteen-whole-positive-understanding.author-candidate.config.json','--candidates',REL+'/sixteen-whole-profile-candidates.author-candidates.json'],['./node_modules/.bin/tsx','scripts/positiveGoalEvidenceReview.ts','--config='+REL+'/sixteen-whole-positive-understanding.author-candidate.config.json','--mode=check']]
runs=[]
for i,cmd in enumerate(commands,1):
 r=subprocess.run(cmd,cwd=ROOT/'app',capture_output=True,text=True);log=CHECKS/f'ordinary-positive-check-{i}.actual.stdout.txt';log.write_text(r.stdout+r.stderr);runs.append({'argv':cmd,'cwd':'app','exitCode':r.returncode,'output':bind(log)});assert r.returncode==0,r.stdout+r.stderr
write('checks/ordinary-positive-checks.actual-terminal.json',{'schemaVersion':1,'role':'ordinary technical validation only, no independent scientific verdict','runs':runs,'exitCode':0,'independentApproval':False})
schema=data(ROOT/'docs/landscape-runtime.schema.json');spec=importlib.util.spec_from_file_location('schema_validate',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
jsonchecks=[]
for p in sorted(OWN.rglob('*.json')):
 assert not p.is_symlink(),str(p)
 assert mod.validate_file(p.relative_to(ROOT).as_posix(),schema),str(p)
 jsonchecks.append(bind(p))
canonical=data(OWN/'input/current-whole-canonical.snapshot.json');jsonschema.validate(canonical,schema)
pconfig=data(OWN/'sixteen-whole-positive-understanding.author-candidate.config.json');jsonschema.validate(pconfig,data(ROOT/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
records=[json.loads(s) for s in (OWN/'sixteen-whole-positive-understanding.author-candidate.review.jsonl').read_text().splitlines() if s.strip()];assert len(records)==16
profileSchema=data(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
for r in records:
 jsonschema.validate(r,profileSchema);assert r['reviewAuthority']=='ai_candidate' and r['status']=='needs_human_review' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1' and r['reviewRunIds']==[],r['goalId']
 writecount=len(r['profile']['applicationCaseBriefs']);assert writecount==2
kind=data(OWN/'input/current-semantic-kind-ledger.snapshot.json');atomic=[d['goalId'] for d in kind['decisions'] if d['semanticKind']=='curricularAtomic'];assert len(atomic)==392
snapshot=data(OWN/'whole-sixteen-current-goals-and-context.input.snapshot.json');current=data(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json');cb={g['id']:g for g in current['goals']};entries=snapshot['entries'];assert len(entries)==16
for e in entries:
 assert e['wholeCurrentGoal']==cb[e['goalId']],e['goalId']
 assert e['wholeDirectParents']==[g for g in current['goals'] if e['goalId'] in g.get('contains',[])],e['goalId']
 assert e['wholeDirectPrerequisites']==[cb[k] for k in cb[e['goalId']].get('requires',[])],e['goalId']
ids=[e['goalId'] for e in entries]
reg=data(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');bio=next(s for s in reg['subjects'] if s['subject']=='biologie')
for key in ['semanticAtomicityConfigPath','memoryReviewConfigPath']:
 cfg=data(ROOT/bio[key]);rr=[json.loads(s) for s in (ROOT/cfg['reviewPath']).read_text().splitlines() if s.strip()];sel=[r for r in rr if r.get('goalId') in ids];assert sel==snapshot['existingDecisions'][key]['unchangedSelectedRecords'],key
qa=data(ROOT/bio['visualizationQaPath']);qr={r['goalId']:r for r in qa['records']}
for gid in ids:assert qr[gid]['visualizationState']=='missing' and not cb[gid].get('resourceLinks'),gid
materials=data(OWN/'sixteen-whole-thirty-two-bilingual-cases.author-candidate.json');cases=[c for e in materials['entries'] for c in e['authoredCases']];assert len(cases)==32 and len({c['caseId'] for c in cases})==32
for c in cases:
 assert not c['actualLearnerPerformance'] and not c['actualExperimentPerformed']
 for fld in ['material','task','workedResponse','freshTransfer','freshTransferWorkedResponse']:assert set(c[fld])=={'de','en'}
media=data(OWN/'analog-digital-media.author-manifest.json');index=data(OWN/'checks/seven-own-media-git-index-bytes.actual.json')
for e in index['entries']:
 p=ROOT/e['path'];assert bind(p)['sha256']==e['sha256'];assert subprocess.run(['git','show',':'+e['path']],check=True,capture_output=True).stdout==p.read_bytes()
ign=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(e['path'] for e in media['entries'])+'\n',text=True,capture_output=True);assert ign.returncode==1 and ign.stdout==''
write('checks/whole-sixteen-targeted-schema-context-and-portability.actual-terminal.json',{'schemaVersion':1,'role':'technical author candidate validation only','schemaValidator':'unchanged scripts/validate_schemas.py validate_file plus direct ordinary landscape/P/config JSON schemas','checkedJSONFiles':jsonchecks,'PRecords':16,'profileStatusCounts':{'approved':0,'needs_human_review':16,'rejected':0},'authority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','authoredBilingualCases':32,'fullLanguageCases':64,'wholeCurrentGoalBodiesUnchanged':16,'wholeCurrentDirectParentAndPrerequisiteContextsUnchanged':16,'unchangedExistingAtomicityDecisions':16,'unchangedExistingMemoryDecisions':16,'missingActiveImages':16,'newActiveWrites':[],'caseMaterialIsOwnFictitiousModel':True,'portableIndexedHTMLOriginals':7,'ordinaryCheckIgnoreExitCode':ign.returncode,'currentBaselineCanonicalGoals':len(current['goals']),'boundSnapshotCurricularAtomicGoals':len(atomic),'currentCanonical':bind(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),'exitCode':0,'independentScientificApproval':False,'humanApproval':False})
receipt=data(OWN/'author-technical-materialization.receipt.json');receipt['createdProfileFingerprintsByOrdinaryToolPending']=False;receipt['ordinaryMaterializedCurrentPRecords']=16;receipt['ordinaryTechnicalTerminalPath']=REL+'/checks/ordinary-positive-checks.actual-terminal.json';write('author-technical-materialization.receipt.json',receipt)
imageKeep='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-upper-communication-evaluation-seven-keep-images-author-root-v1/neutral-seven-keep-images.author.entry.json'
keep=data(ROOT/imageKeep);keepids={e['goalId'] for e in keep['images']};assert len(keepids)==7 and keepids.issubset(ids)
plan=[]
for e in materials['entries']:
 gid=e['goalId'];plan.append({'goalId':gid,'wholeCurrentGoal':e['wholeCurrentGoal'],'wholeCaseIds':[c['caseId'] for c in e['authoredCases']],'caseMaterialsPath':REL+'/sixteen-whole-thirty-two-bilingual-cases.author-candidate.json','currentActiveVisualization':'missing','candidateImageRole':'KEEP of a good existing PNG in a new target context; review pending' if gid in keepids else 'necessary missing image candidate authored by separate assigned image author; original/full/360/680 and independent review pending','keepImageAuthorEntry':imageKeep if gid in keepids else None,'wholeScientificProfileReviewPending':True,'visualizationApproval':False,'imageGenerationInThisPackage':False,'formatGuidance':'new images PNG, friendly abstract comic-like, near16:9 about1600x900, sparse legible labels at360/680; actual existing good PNG KEEP irrespective of original format/provider'})
write('sixteen-whole-image-role-plan.neutral-pending.json',{'schemaVersion':1,'entries':plan,'parallelSevenKeepEntry':bind(ROOT/imageKeep),'newImagesByThisAuthor':0,'candidateReviewIsNotActiveGate':True,'humanApproval':False})
entry={'schemaVersion':1,'artifactRole':'neutral inactive author handoff; whole16 current upper-secondary communication/evaluation goals and32 bilingual worked cases','reviewStatus':'author_candidate','reviewAuthority':'ai_candidate','authoredAt':datetime.now(timezone.utc).isoformat(),'scopeGoalIds':ids,'goalCount':16,'authoredBilingualCaseCount':32,'DEENLanguageCaseBodies':64,'currentCanonicalGoalCount':len(current['goals']),'currentCurricularAtomicCount':len(atomic),'wholeCurrentGoalsAndContextPath':REL+'/whole-sixteen-current-goals-and-context.input.snapshot.json','wholeMaterialsPath':REL+'/sixteen-whole-thirty-two-bilingual-cases.author-candidate.json','wholeMaterialsReviewMarkdownPath':REL+'/whole-sixteen-thirty-two-cases.author-review.md','positiveEvidenceConfigPath':REL+'/sixteen-whole-positive-understanding.author-candidate.config.json','positiveEvidenceCandidateSpecPath':REL+'/sixteen-whole-profile-candidates.author-candidates.json','positiveEvidenceReviewPath':REL+'/sixteen-whole-positive-understanding.author-candidate.review.jsonl','wholeExpectationCoveragePath':REL+'/sixteen-whole-expectation-coverage.author-matrix.json','sourceContextInventoryPath':REL+'/sixteen-current-gates-and-source-context.author-inventory.json','fullOfficialClauseBindingsPath':REL+'/sixteen-official-full-clause-author-context-bindings.json','analogDigitalCaseMediaManifestPath':REL+'/analog-digital-media.author-manifest.json','neutralImageRolesPath':REL+'/sixteen-whole-image-role-plan.neutral-pending.json','targetedTechnicalSchemaContextCheckPath':REL+'/checks/whole-sixteen-targeted-schema-context-and-portability.actual-terminal.json','technicalMediaExecutionPath':REL+'/checks/offline-analog-digital-media.actual-terminal.json','indexByteProofPath':REL+'/checks/seven-own-media-git-index-bytes.actual.json','existingGateReuse':{'A':'16 exact current existing decisions retained; no new atomicity review','M':'16 exact current existing no_memory_needed decisions retained; no new memory review','D':'none valid current resolution for16','P':'no preexisting current profiles for16;16 newly authored candidates only','V':'16 active missing; separate7KEEP/new9 candidates pending'},'descriptionPatches':[],'sourceMappingPatches':[],'firstFreezePath':REL+'/whole-sixteen-author-candidate.first.freeze.json','nextRequiredReviews':['two genuine independent whole native D/P reviews with full original-source/context and32wholecases; actual native materials not yet prepared here','actual images in current whole-goal/context with independent scientific/visual review; generation not approval','targeted current P/resource/frame binding after actual reviewed PNG links','strict central/Layer-A checks only after all actual reviews resolved and protected integration by Root'],'activeWrites':[],'commitPerformed':False,'pushPerformed':False,'netStrictGain':0,'newScientificClosures':0,'restoredBindings':0,'independentApproval':False,'humanApproval':False,'humanTrial':False,'candidateTechnicalBlockers':[],'M7GateReadiness':False}
write('neutral-whole-sixteen-thirty-two-material-author.entry.json',entry)
outputs=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p.name!='whole-sixteen-author-candidate.first.freeze.json']
freeze={'schemaVersion':1,'freezeRole':'first immutable actual author-candidate input/output bindings; not independent review','createdAt':datetime.now(timezone.utc).isoformat(),'entry':bind(OWN/'neutral-whole-sixteen-thirty-two-material-author.entry.json'),'fileCount':len(outputs),'files':outputs,'actualIndependentReviewCount':0,'actualHumanReviewCount':0,'actualStrictGain':0,'activeWrites':[]}
write('whole-sixteen-author-candidate.first.freeze.json',freeze)
print(json.dumps({'neutralEntry':bind(OWN/'neutral-whole-sixteen-thirty-two-material-author.entry.json'),'firstAuthorFreeze':bind(OWN/'whole-sixteen-author-candidate.first.freeze.json'),'files':len(outputs),'wholeGoalCount':16,'caseCount':32,'technicalBlockers':0,'independentApproved':0,'netStrictGain':0}))
