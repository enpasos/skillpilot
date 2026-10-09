# SPDX-License-Identifier: Apache-2.0
"""First seal of P11-only whole candidate and normal current-image fingerprints."""
import hashlib,importlib.util,json
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;BASE=OWN.parent;REL=OWN.relative_to(ROOT).as_posix()
def load(p):return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return dict(path=p.relative_to(ROOT).as_posix(),sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(n,x):
 p=OWN/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
seal=OWN/'targeted-p11-own-results.first.freeze.json';assert not seal.exists()
assert load(OWN/'checks/P11-targeted-schema-source-profile-guards.actual-terminal.json')['exitCode']==0
native=BASE/'native-preparation-v1/neutral-fourteen-native-independent-review.entry.json';n=load(native);ID='8375310d-1f7e-542d-9969-55ad4bd37f7c'
entry=dict(schemaVersion=1,artifactRole='neutral P11-only whole candidate: first own analysis results/protocol, then reflection of those own decisions/results; no peer or author verdicts',createdAt=datetime.now(timezone.utc).isoformat(),goalIds=[ID],wholeGoalCount=1,bilingualCaseCount=2,wholePProfileCount=1,wholeCasesPath=REL+'/P11-two-whole-bilingual-cases.neutral-input.json',wholeCasesMarkdownPath=REL+'/P11-two-own-results-whole-cases.author-review.md',wholeFourteenWithOnlyP11MaterialChangePath=REL+'/whole-fourteen-twenty-nine-cases.only-P11-own-results.candidate.json',positiveConfigPath=REL+'/P11-own-results.author-candidate.config.json',positiveRecordPath=REL+'/P11-own-results.author-candidate.review.jsonl',positiveCandidateSpecPath=REL+'/P11-own-results-whole-profile.author-candidates.json',exactOtherThirteenProfileRecordsPath=REL+'/other-thirteen-original-profile-bodies.exact-preserved.json',exactTargetedChangeScopePath=REL+'/targeted-P11-only.exact-scope-guard.actual.json',originalNativeEntry=bind(native),originalNativeFirstSeal=bind(BASE/'native-preparation-v1/fourteen-native-technical-author.first.freeze.json'),originalSourceDutiesPath=n['wholeSourceDutiesPath'],wholeOriginal69SourceDecisionsRetained=True,wholeOriginal68PartnersRetained=True,currentGoalDescriptionAndGraphChanges=[],sourceChanges=[],imageChanges=[],unchangedOtherProfileBodies=13,unchangedOtherBilingualCases=27,mandatoryOwnGeneratedAnalysisResults=True,mandatoryReflectionOfOwnResultsAndOwnDecisions=True,currentImageBytesUnchanged=True,currentGoalFingerprintUnchanged=True,currentReviewInputFingerprintUnchanged=True,profileFingerprintChanges=1,actualPhysicalInvestigation=False,actualLearnerResults=False,ordinaryPStatus='needs_human_review',ordinaryPAuthority='ai_candidate',evidenceLevel='E1',maximumClaimScope='G1',genuineIndependentP11Reviews='PENDING',humanApproval=False,humanTrial=False,independentApproval=False,firstFreezePath=REL+'/targeted-p11-own-results.first.freeze.json',technicalChecks=[bind(p) for p in sorted((OWN/'checks').glob('*.json'))],activeWrites=[],newScientificClosures=0,restoredBindings=0,netStrictGain=0)
old=[json.loads(s) for s in (ROOT/n['positiveRecordPath']).read_text().splitlines() if s];old=next(r for r in old if r['goalId']==ID);new=json.loads((OWN/'P11-own-results.author-candidate.review.jsonl').read_text())
assert old['goalFingerprint']==new['goalFingerprint'] and old['reviewInputFingerprint']==new['reviewInputFingerprint'] and old['profileFingerprint']!=new['profileFingerprint']
write('neutral-P11-own-results-two-whole-cases.independent-review.entry.json',entry)
schema=load(ROOT/'docs/landscape-runtime.schema.json');sp=importlib.util.spec_from_file_location('validator',ROOT/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
for p in OWN.rglob('*.json'):assert m.validate_file(p.relative_to(ROOT).as_posix(),schema),p
files=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and '__pycache__' not in p.parts]
write(seal.name,dict(schemaVersion=1,role='first immutable author P11-only remedy, independently unapproved',createdAt=datetime.now(timezone.utc).isoformat(),fileCount=len(files),files=files,originalScience60Native107V2Science40Exact=True,actualScientificApprovalCount=0,actualHumanReviewCount=0,activeWrites=[],actualStrictGain=0))
print(json.dumps({'neutralEntry':bind(OWN/'neutral-P11-own-results-two-whole-cases.independent-review.entry.json'),'firstSeal':bind(seal),'files':len(files),'otherProfilesExact':13,'otherCasesExact':27,'independentApproval':False,'strictGain':0}))
