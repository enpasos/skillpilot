# SPDX-License-Identifier: Apache-2.0
"""Freeze actual inactive whole author inputs; no independent science approval."""
from pathlib import Path
import json, hashlib, datetime, subprocess, importlib.util
import jsonschema
ROOT=Path.cwd(); D=Path(__file__).resolve().parent; P=D.relative_to(ROOT).as_posix()
def read(n):return json.loads((D/n).read_text())
def put(n,d):
 f=D/n; f.parent.mkdir(parents=True,exist_ok=True)
 if f.exists():
  assert json.loads(f.read_text())==d,f'Frozen output differs: {f}'
  return f
 f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return f
def bind(f):
 if isinstance(f,str):f=D/f
 b=f.read_bytes();return {'path':f.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
# Exact semantic/source diffs preserve every old obligation and partner.
old=read('inputs/whole-original-126-duty-217-edge-mapping.exact.json');new=read('candidate/whole-BW126-220-partners.practical-successor.review.json')
assert len(old['decisions'])==len(new['decisions'])==126
assert len(old['mappings'])==217 and len(new['mappings'])==220
assert new['mappings'][:217]==old['mappings']
source_changed=[{'index':i,'before':a,'after':b} for i,(a,b) in enumerate(zip(old['decisions'],new['decisions'])) if a!=b]
assert len(source_changed)==3
put('candidate/exact-whole-source-decisions-and-added-partners.actual-diff.json',{'schemaVersion':1,'oldWholeDecisionCount':126,'newWholeDecisionCount':126,'all217OriginalMappingEdgesExactRetained':True,'addedActualMappingEdges':new['mappings'][217:],'changedWholeDecisions':source_changed,'unaffectedWholeDecisionsExactRetained':123,'originalPracticalOperatorsNotDeleted':True,'authorProposalOnly':True})
# Existing production contracts, targeted actual inputs; no exceptions.
parse=[]
for f in sorted(D.rglob('*')):
 if f.is_file() and f.suffix=='.json':json.loads(f.read_text());parse.append(bind(f))
 elif f.is_file() and f.suffix=='.jsonl':
  for l in f.read_text().splitlines():
   if l.strip():json.loads(l)
  parse.append(bind(f))
contracts=[]
def schema(n,s):
 jsonschema.validate(read(n),json.loads((ROOT/s).read_text()));contracts.append({'input':bind(n),'schema':bind(ROOT/s)})
for n in ['inputs/canonical.exact.json','candidate/full484-381.inactive-canonical.json']:schema(n,'docs/landscape-runtime.schema.json')
schema('candidate/full484-381.semantic-kinds.inactive-input.json','contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json')
# These are the existing normal compiler's compatibility view inputs, not exported
# closed curriculum-package view envelopes. Their actual normal compilation and
# actual source-atlas tool validation are retained, without altering any contract.
assert len(read('checks/BW-practical-course-target-projection.actual.json')['views'])==2
assert len(read('checks/completed-normal-BW-source-atlas-before-after.actual.json')['runs'])==2
for l in (D/'positive/three-whole-practical.author.review.jsonl').read_text().splitlines():
 r=json.loads(l);assert r['status']=='needs_human_review' and r['reviewAuthority']=='ai_candidate' and r['evidenceLevel']=='E1' and r['maximumClaimScope']=='G1'
spec=importlib.util.spec_from_file_location('ordinary_schema_guard',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
symlink_errors=mod.curriculum_symlink_errors(ROOT);assert not symlink_errors,symlink_errors
ignored=[]
for f in D.rglob('*'):
 if f.is_file():
  r=subprocess.run(['git','check-ignore','--quiet',str(f)],cwd=ROOT)
  if r.returncode==0:ignored.append(f.relative_to(ROOT).as_posix())
assert not ignored,ignored
pdf=D/'primary/official-BW-chemistry-20220325.actual-original.pdf'
staged=subprocess.run(['git','show',':'+pdf.relative_to(ROOT).as_posix()],capture_output=True,check=True).stdout
assert staged==pdf.read_bytes()
put('checks/complete-targeted-json-schema-portability.actual.json',{'schemaVersion':1,'allActualJSONJSONLBindings':parse,'wholeContractsPassed':contracts,'compatibilityCompositionInputValidation':{'normalCompilerReceipt':bind('checks/BW-practical-course-target-projection.actual.json'),'normalSourceAtlasReceipt':bind('checks/completed-normal-BW-source-atlas-before-after.actual.json'),'closedExportPackageViewsClaimed':False},'ordinaryCurriculumSymlinkErrors':symlink_errors,'ignoredUncommittableOwnedInputs':ignored,'originalOfficialPDFExactInIndex':bind(pdf),'newIndependentApprovals':0,'humanApproval':False})
source_after='source-atlas/after-exact-output-archive/app/scripts/config/goal-books/chemie-q3-BW-source3-inactive-after/'
source_before='source-atlas/before-exact-output-archive/app/scripts/config/goal-books/chemie-q3-BW-source3-inactive-before/'
neutral_names=[
'inputs/canonical.exact.json','inputs/semantic-kinds.exact.json','inputs/chemistry-existing-review-criteria.md',
'candidate/full484-381.inactive-canonical.json','candidate/full484-381.semantic-kinds.inactive-input.json','candidate/semantic-kind-authority-boundary.json',
'candidate/three-current-whole-theory-goals.exact-retained.json','candidate/three-new-whole-DEEN-practical-goals.json',
'inputs/whole-original-126-duty-217-edge-mapping.exact.json','inputs/whole-original-source-extraction.exact.json',
'candidate/whole-BW126-220-partners.practical-successor.review.json','candidate/whole-BW126.source-extraction.json',
'candidate/exact-whole-source-decisions-and-added-partners.actual-diff.json',
'primary/official-BW-chemistry-20220325.actual-original.pdf','primary/BW-physical-027-printed-025.whole.txt','primary/BW-physical-033-printed-031.whole.txt','primary/BW-physical-041-printed-039.whole.txt','primary/supplemental-laboratory-primary-reading.receipt.json',
'science/six-current-whole-theory-cases.exact-selected.json','science/whole-original40-DEEN-cases.exact-retained.json','science/three-current-whole-theory-P-profiles.exact-retained.json',
'science/whole-six-new-practical-protocol-cases.de-en.author-candidate.json','positive/three-whole-practical-P-materializer.author-candidate.json','positive/three-whole-practical.author.config.json','positive/three-whole-practical.author.review.jsonl',
'inputs/BW-gk.learner-view.exact.json','inputs/BW-lk.learner-view.exact.json','candidate/BW-gk.learner-view.inactive-successor.json','candidate/BW-lk.learner-view.inactive-successor.json',
'inputs/whole-duration-policy153.exact.json','candidate/BW-only-exact-duration-policy.scope-projection.json',
'native/full378.before.actual-model.json','native/full381.after.actual-model.json','native/full-context-goal-page-and-protected177.actual-diff.json',
source_after+'source-views/chemie-q3-BW-source3-inactive-after-source-de-bw-sekii-gk.view.json',
source_after+'source-views/chemie-q3-BW-source3-inactive-after-source-de-bw-sekii-lk.view.json',
source_after+'source-views/chemie-q3-BW-source3-inactive-after-source-de-bw-seki.view.json',
source_after+'source-manifest.json',source_before+'source-manifest.json']
neutral_names += [f.relative_to(D).as_posix() for f in sorted((D/'inputs/current-BW-source-tree').rglob('*.json'))]
ids=[g['id'] for g in read('candidate/three-new-whole-DEEN-practical-goals.json')]
entry={'schemaVersion':1,'entryRole':'Neutral whole inactive author material/primary/source/view handoff for independent FIRST','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'author':'Codex candidate author; no independent approval',
'FIRSTReadingRule':'Read complete neutral inputs and form your own whole science/source/operator/atomicity/P/Memory FIRST before reading author A/M judgments, technical QS receipts, original B FIRST or peer verdicts. The brief P fields reference complete six-case protocol material; assess both together, never the brief alone.',
'neutralFirstInputs':[bind(n) for n in neutral_names],
'wholeScope':{'currentNodes':480,'currentCurricularAtomic':378,'candidateNodes':484,'candidateCurricularAtomic':381,'newPracticalGoalIds':ids,'originalWholeSourceDuties':126,'originalWholePartnerEdges':217,'newWholePartnerEdges':220,'wholeOldMaterialCases':40,'selectedOldTheoryCases':6,'newWholePracticalCases':6,'languages':['de','en'],'actualLearnerExperiments':0,'protectedStrict177GoalObjectsAndPagesUnchanged':True},
'actualViewPaths':{'BWGK':P+'/'+source_after+'source-views/chemie-q3-BW-source3-inactive-after-source-de-bw-sekii-gk.view.json','BWLK':P+'/'+source_after+'source-views/chemie-q3-BW-source3-inactive-after-source-de-bw-sekii-lk.view.json','learnerGK':P+'/candidate/BW-gk.learner-view.inactive-successor.json','learnerLK':P+'/candidate/BW-lk.learner-view.inactive-successor.json'},
'ordinaryAtlasTransportBoundary':'Archived views/manifests are exact normal-generator bytes. Their app/scripts/config output namespace denotes the isolated generating capsule, not an active publication. Actual reviewer inputs use these portable archive paths. The reproducible capsule helper writes no active app/canonical/registry files. National atlas and whole course closure are not claimed.',
'checkAfterOwnFIRSTOnly':[bind(n) for n in ['author.input-FIRST.actual-reading-and-finding-boundary.json','inputs/whole-B-FIRST.exact.json','atomicity/three-whole-practical.author.review.jsonl','atomicity/three-whole-practical.author.config.json','memory/three-whole-practical.author.review.jsonl','memory/three-whole-practical.author.config.json','checks/completed-author-A3-M3-and-isolated-ordinary-P3.actual.json','checks/completed-normal-BW-source-atlas-before-after.actual.json','checks/complete-targeted-json-schema-portability.actual.json']],
'openGates':['Two genuine independent whole source/operator/atomicity/material/Memory judgments pending','Two actual native D campaigns for the three changed theory pages and three new practical pages pending','Three actual PNG visualizations and independent current V approvals absent','B008 whole programme/choice and all unrelated source/material holds remain open'],
'noReleaseClaims':{'sourceApproval':False,'independentApproval':False,'humanApproval':False,'humanTrial':False,'machineM7':False,'activeWrites':0,'strictGain':0},'finalSealPath':P+'/author.final.freeze.json'}
entryfile=put('neutral-three-whole-BW-context-practical-companions.independent-review.entry.json',entry)
allfiles=[f for f in sorted(D.rglob('*')) if f.is_file()]
seal=put('author.final.freeze.json',{'schemaVersion':1,'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Final additive inactive author package; no science or human approval','neutralEntry':bind(entryfile),'allWholeOperativeAndDiagnosticBindings':[bind(f) for f in allfiles],'current378Strict177Unchanged':True,'newCandidateGoals':3,'newWholeCases':6,'strictGain':0,'historicalArtifactMutations':0})
print(json.dumps({'entry':bind(entryfile),'seal':bind(seal),'boundFiles':len(allfiles),'normalP3':'ai_candidate/needs_human_review/E1/G1','newStrict':0}))
