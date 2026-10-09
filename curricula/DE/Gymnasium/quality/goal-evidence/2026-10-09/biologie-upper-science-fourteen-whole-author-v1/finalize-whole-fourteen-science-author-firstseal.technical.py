# SPDX-License-Identifier: Apache-2.0
"""Neutral first science author seal; no image/native/scientific approval."""
import hashlib,importlib.util,json,subprocess
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
def load(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return dict(path=p.relative_to(ROOT).as_posix(),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(name,x):(OWN/name).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
freezePath=OWN/'whole-fourteen-science-author.first.freeze.json';assert not freezePath.exists(),'First science seal is immutable.'
html=OWN/'media/inquiry-finite-model.html';htmlRel=html.relative_to(ROOT).as_posix()
index=subprocess.run(['git','show',':'+htmlRel],cwd=ROOT,capture_output=True)
assert index.returncode==0,'Root must stage exactly the necessary own HTML before final portable seal.'
assert index.stdout==html.read_bytes(),'Index bytes differ from actual task medium.'
ig=subprocess.run(['git','check-ignore','--stdin'],cwd=ROOT,input=htmlRel+'\n',capture_output=True,text=True)
assert ig.returncode==1 and not ig.stdout,'Ordinary check-ignore must confirm actual index versionability.'
write('checks/required-task-html-git-index-bytes.actual.json',dict(schemaVersion=1,role='actual specific Root-staged HTML index-byte equality; no ignore/validator exception',indexBinding=bind(html),indexBytes=len(index.stdout),indexSha256='sha256:'+hashlib.sha256(index.stdout).hexdigest(),actualCheckIgnoreExitCode=ig.returncode,actualCheckIgnoreOutput=ig.stdout,commitPerformed=False,pushPerformed=False))
sp=importlib.util.spec_from_file_location('schema_validator',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(sp);sp.loader.exec_module(mod);schema=load(ROOT/'docs/landscape-runtime.schema.json')
validated=[]
for p in sorted(OWN.rglob('*.json')):
 assert not p.is_symlink() and mod.validate_file(p.relative_to(ROOT).as_posix(),schema)
 validated.append(bind(p))
whole=load(OWN/'whole-fourteen-current-goals-source-and-context.input.snapshot.json');ids=whole['scopeGoalIds']
active=[]
for b in whole['bindings']:
 current=bind(ROOT/b['path']);assert current['sha256']==b['sha256'] and current['bytes']==b['bytes'],b['path']
 active.append(current)
source=load(OWN/'fourteen-current-ordinary-source-partner-frame.neutral-input.json')
for b in [source['bookModelBinding'],source['originalSourcesBinding'],source['sourceAtlasInputsBinding']]:assert bind(ROOT/b['path'])==b
for r in source['wholeAffectedMappingDecisions']:
 for key in ['mappingBinding','sourceExtractionBinding']:assert bind(ROOT/r[key]['path'])==r[key]
for name in ['ordinary-positive.actual-terminal.json','targeted-schema-context.actual-terminal.json','finite-task-browser.actual-terminal.json','raw-task-data-and-arithmetic.actual-terminal.json']:
 assert load(OWN/'checks'/name)['exitCode']==0
write('checks/final-science-schema-portability-and-active-guard.actual-terminal.json',dict(schemaVersion=1,checkedAt=datetime.now(timezone.utc).isoformat(),exitCode=0,validatedOwnJsonCount=len(validated),ownJsonBindings=validated,unchangedCurrentInputBindings=active,unchangedWholeSourceFrame=True,wholeGoals=14,wholeBilingualCases=28,ordinaryPProfiles=14,newScientificClosures=0,restoredBindings=0,netStrictGain=0,independentApproval=False,humanApproval=False,activeWrites=[]))
entry=dict(schemaVersion=1,artifactRole='neutral inactive whole14 science/inquiry author input with28 worked bilingual model cases; no image/native independent approval',reviewStatus='author_candidate',reviewAuthority='ai_candidate',createdAt=datetime.now(timezone.utc).isoformat(),scopeGoalIds=ids,goalCount=14,bilingualCaseCount=28,DEENWholeCaseBodies=56,currentCanonicalNodeCount=479,currentCurricularAtomicCount=394,wholeCurrentGoalSourceContextPath=REL+'/whole-fourteen-current-goals-source-and-context.input.snapshot.json',wholeMaterialsPath=REL+'/fourteen-whole-twenty-eight-bilingual-cases.author-candidate.json',wholeMaterialsMarkdownPath=REL+'/whole-fourteen-twenty-eight-cases.author-review.md',expectationCoveragePath=REL+'/fourteen-whole-expectation-coverage.author-matrix.json',positiveEvidenceConfigPath=REL+'/fourteen-whole-positive-understanding.author-candidate.config.json',positiveEvidenceCandidateSpecPath=REL+'/fourteen-whole-profile-candidates.author-candidates.json',positiveEvidenceReviewPath=REL+'/fourteen-whole-positive-understanding.author-candidate.review.jsonl',wholeOfficialClauseContextPath=REL+'/fourteen-whole-original-source-context.neutral-input.json',existingFourOfficialPrimaryBindingsPath=REL+'/existing-four-whole-official-primary-bindings.author.json',wholeCurrentOrdinarySourcePartnerFramePath=REL+'/fourteen-current-ordinary-source-partner-frame.neutral-input.json',affectedCurrentSourceDecisionCount=source['affectedDecisionCount'],wholeCurrentSourcePartnerCount=len(source['wholePartnerGoalIds']),proceduralDigitalTaskMediaManifestPath=REL+'/procedural-digital-task-media.neutral-manifest.json',actualTaskBrowserExecutionPath=REL+'/checks/finite-task-browser.actual-terminal.json',actualTaskRawDataConsistencyPath=REL+'/checks/raw-task-data-and-arithmetic.actual-terminal.json',actualIndexBytesPath=REL+'/checks/required-task-html-git-index-bytes.actual.json',ordinaryTargetedPChecksPath=REL+'/checks/ordinary-positive.actual-terminal.json',finalTargetedTechnicalChecksPath=REL+'/checks/final-science-schema-portability-and-active-guard.actual-terminal.json',imagePromptHandoffPath=REL+'/neutral-fourteen-image-prompts.author.entry.json',actualImageFilesInThisSciencePacket=[],actualImagesBySeparateRootAuthorPending=True,nativeReviewFramePending=True,firstFreezePath=REL+'/whole-fourteen-science-author.first.freeze.json',existingGateReuse={'A':'14 exact current existing decisions, no new review','M':'14 exact current existing decisions, no new review','D':'current14 none; two independent current native whole-description reviews pending','P':'14 newly authored normal v2 candidates only, ai_candidate/needs_human_review E1/G1; fresh independent whole science review pending','V':'current14 missing; actual new image candidates separate and pending'},descriptionPatches=[],sourceMappingPatches=[],activeWrites=[],newScientificClosures=0,restoredBindings=0,netStrictGain=0,independentApproval=False,humanApproval=False,humanTrial=False,nextRequiredWork=['two genuine independent whole14 scientific/source-context reviews of all28 model cases, original complete source duties and partner roles','actual separateRoot14 PNG candidates and actual full/360/680 review with exact provenance','regular current native whole394 context and14-target frame preparation with actual image links and P fingerprints','two independent native D/P plus actual V reviews with genuine finding resolution before guarded integration','strict central and dependent Layer-A checks at stable protected integration'])
write('neutral-whole-fourteen-science-twenty-eight-cases.author.entry.json',entry)
files=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p!=freezePath]
write('whole-fourteen-science-author.first.freeze.json',dict(schemaVersion=1,freezeRole='first immutable actual whole science author input/output binding; no independent verdict',createdAt=datetime.now(timezone.utc).isoformat(),entry=bind(OWN/'neutral-whole-fourteen-science-twenty-eight-cases.author.entry.json'),fileCount=len(files),files=files,actualIndependentReviewCount=0,actualHumanReviewCount=0,actualNewScientificClosures=0,actualRestoredBindings=0,actualStrictGain=0,activeWrites=[]))
print(json.dumps({'entry':bind(OWN/'neutral-whole-fourteen-science-twenty-eight-cases.author.entry.json'),'firstScienceFreeze':bind(freezePath),'files':len(files),'wholeGoals':14,'wholeCases':28,'strictGain':0}))
