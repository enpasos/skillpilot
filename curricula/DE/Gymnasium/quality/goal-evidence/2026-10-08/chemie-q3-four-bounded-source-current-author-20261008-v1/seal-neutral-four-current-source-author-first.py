# SPDX-License-Identifier: Apache-2.0
"""Seal only completed inactive author inputs; no independent approvals."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, importlib.util, json, os, shutil, subprocess
R=Path.cwd(); D=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rel(p):return str(Path(p).relative_to(R))
def bind(p):
    p=Path(p);return {'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
def load(p):return json.loads(Path(p).read_text())
def put(name,v):
    p=D/name;p.parent.mkdir(parents=True,exist_ok=True);b=(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode()
    if p.exists():assert p.read_bytes()==b,p
    else:
        t=p.with_suffix(p.suffix+'.tmp');t.write_bytes(b);os.replace(t,p)
    return bind(p)
def copy(p,name):
    p=Path(p);q=D/name;q.parent.mkdir(parents=True,exist_ok=True)
    if q.exists():assert q.read_bytes()==p.read_bytes(),q
    else:shutil.copyfile(p,q)
    return bind(q)
assert not (D/'four-current-whole-source-author.first-input.freeze.json').exists(),'Already frozen; use read-only verification, never mutate.'
guard=load(D/'before/current-four-source-science-memory-image.guard.json');ids=guard['goalIds'];activeChecks=[]
for v in guard['before'].values():
    p=R/v['originalLocator'];assert sha(p)==v['originalDigestAtSnapshot'],p
    assert p.read_bytes()==(R/v['snapshot']['path']).read_bytes(),p
    activeChecks.append({'originalLocator':v['originalLocator'],'sha256':sha(p),'unchanged':True})
for v in guard['allActualCurrentSourceFiles']:
    p=R/v['originalLocator'];assert sha(p)==v['originalDigestAtSnapshot'],p
    assert p.read_bytes()==(R/v['snapshot']['path']).read_bytes(),p
    activeChecks.append({'originalLocator':v['originalLocator'],'sha256':sha(p),'unchanged':True})
root=D.parent/'chemie-q3-two-reviewed-active-integration-root-20261008-v1'
central=load(root/'affected-central.stdout.actual.txt');terminal=load(root/'affected-central.terminal.actual.json')
assert terminal['actualExitCode']==0 and central['blockingIssueCount']==0
ss={s['subject']:s for s in central['subjects']}
assert [(ss[k]['strictComplete'],ss[k]['denominator'])for k in ['chemie','biologie','mathematik','physik']]==[(175,378),(222,392),(807,807),(478,478)]
assert not set(ids)&set(ss['chemie']['strictCompleteGoalIds'])
copy(root/'affected-central.stdout.actual.txt','before/current-central-Chem175-Bio222.actual.json')
copy(root/'affected-central.terminal.actual.json','before/current-central-terminal.actual.json')
copy(root/'strict-current-two-new-scientific-closures.actual.json','before/current-root-two-actual-closures.exact.json')
copy(root/'actual-derived51-only-one-image-bound-receipt-refresh.actual.json','before/current-root-source51-image-receipt-only-adoption.exact.json')
put('checks/current-active-guard-no-new-four-closures.actual.json',{'allActuallyReadCurrentInputs':activeChecks,
 'canonicalCurrentDigest':sha(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),
 'actualTerminalCentralExitCode':0,'blockingIssues':0,
 'subjects':[{'subject':s,'strictComplete':ss[s]['strictComplete'],'denominator':ss[s]['denominator'],'strictCompleteGoalIds':ss[s]['strictCompleteGoalIds']}for s in ss],
 'noneOfFourNewlyStrict':True,'activeWrites':0,'newStrictClosures':0,'humanApproval':False})
for name in ['checks/current378-retained-M.terminal.actual.json','checks/four-retained-original-P-ordinary-cli.terminal.actual.json','checks/current378-pure-context-and-four-P-native-contracts.actual.json']:
    assert load(D/name)['actualExitCode']==0,name
roles=load(D/'source/whole106-concrete-four-goal-roles-original-operators-and-open-questions.author-candidate.json')
assert len(roles['rows'])==106 and sum(len(r['allOriginalPartnerRows'])for r in roles['rows'])==528
assert roles['rows'][26]['sourceOrdinalInWhole106']==27 and roles['rows'][105]['sourceOrdinalInWhole106']==106

# Existing normal classification/parser is used unchanged, bounded to own files.
spec=importlib.util.spec_from_file_location('skillpilot_normal_schema_validator',R/'scripts/validate_schemas.py')
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
schema=load(R/'docs/landscape-runtime.schema.json');files=sorted(p for p in D.rglob('*')if p.is_file())
jsons=[p for p in files if p.suffix=='.json'];failed=[rel(p)for p in jsons if not mod.validate_file(rel(p),schema)]
assert not failed,failed
jsonl_rows=0
for p in files:
    if p.suffix=='.jsonl':
        for line in p.read_text().splitlines():json.loads(line);jsonl_rows+=1
put('checks/own-normal-schema-and-jsonl.actual.json',{'actualExitCode':0,'normalValidator':'scripts/validate_schemas.py::validate_file unchanged',
 'boundedOwnJSONFilesChecked':len(jsons),'jsonlRowsParsed':jsonl_rows,'errors':failed,'globalLongSchemaRunClaim':False,'validatorChanged':False,'activeWrites':0})

# Every required review file is contained and nonignored. Original ignored raw
# PDF/HTML paths are provenance locators only; own whole portable inputs suffice.
files=sorted(p for p in D.rglob('*')if p.is_file())
required={rel(p):bind(p)for p in files}
for cfgname in ['positive/four-current-original-JPEG-retained-ordinary-check.config.json','positive/four-current-correctly-declared-raster.inactive.config.json']:
    cfg=load(D/cfgname)
    for k in ['landscapePath','semanticKindLedgerPath','reviewCriteriaPath','reviewPath']:
        p=R/cfg[k];assert p.is_file(),p;required[rel(p)]=bind(p)
q=subprocess.run(['git','check-ignore','--no-index','--stdin'],input=('\n'.join(required)+'\n').encode(),capture_output=True)
assert q.returncode in [0,1];ignored=q.stdout.decode().splitlines();assert not ignored,ignored
symlinks=[]
for p in D.rglob('*'):
    if p.is_symlink():
        target=os.readlink(p);assert not os.path.isabs(target) and p.resolve(strict=True).is_relative_to(R)
        assert rel(p.resolve())in required;symlinks.append({'path':rel(p),'relativeTarget':target})
put('checks/required-portable-owned-inputs.actual.json',{'actualExitCode':0,'requiredFiles':list(required.values()),
 'requiredFileCount':len(required),'ignoredRequiredFiles':ignored,'brokenRequiredSymlinks':[],'containedRelativeSymlinks':symlinks,
 'rawIgnoredPrimaryLocatorsNotRequired':True,'fakeIsolatedRepository':False,'activeAssetCopiesOrAliases':0,'activeWrites':0})

own=[bind(p)for p in sorted(D.rglob('*'))if p.is_file()]
seal=put('four-current-whole-source-author.first-input.freeze.json',{'schemaVersion':1,
 'kind':'inactive-author-whole-source-role-clarification-first-freeze','sealedAt':datetime.now(timezone.utc).isoformat(),
 'goalIds':ids,'fullCurrentCanonical':480,'currentCurricularAtomic':378,'selectedDirectEdges':155,'selectedWholeSourceDuties':106,'selectedAllPartnerRows':528,
 'unchangedOriginalWholeDEENCases':8,'wholeOriginalPositiveProfiles':4,'originalSourcePair':'A BOUNDED_RETAIN_FULL_ROLE_CHECK_PENDING; B bounded PASS, pair not complete',
 'ownFiles':own,'requiredExternalImmutableFiles':[v for p,v in required.items()if not p.startswith(rel(D)+'/')],
 'requiredReviewInputsPortable':True,'normalBoundedSchemaCheckExitCode':0,'ordinaryRetainedP4CLIExitCode':0,'ordinaryRetainedM378CLIExitCode':0,
 'actualNativeP4FingerprintSchemaSemanticErrors':0,'operativeNewPNG6CLI':'pending independently approved installation',
 'sourceRolePairApproval':False,'nativeDescriptionReviewCampaigns':0,'nativeDescriptionReviewRuns':0,'nativeDescriptionReviewApprovals':0,'nativeVisualizationApprovals':0,
 'newWholeSourceUnionApproval':False,'allOldOtherSourceHoldsRemain':True,'activeWrites':0,'newStrictClosures':0,'restoredStrictBindings':0,'humanApproval':False,'humanTrial':False})
entry=put('neutral-four-current-whole-source-role-author.independent-review.entry.json',{'schemaVersion':1,
 'kind':'neutral-inactive-author-input-for-two-independent-source-role-followups','authorFirstSeal':seal,
 'goalIds':ids,'wholeCurrentScope':bind(D/'scope-four.current480.whole-goals.exact.json'),
 'whole106SourceRolesAndOpenQuestions':bind(D/'source/whole106-concrete-four-goal-roles-original-operators-and-open-questions.author-candidate.json'),
 'whole155OriginalEdges':bind(D/'source/selected155-original-source-edges.exact-retained.json'),
 'whole528CurrentPartnerBodies':bind(D/'source/selected106-whole-duty-current528-partner-body-contexts.json'),
 'whole8OriginalDEENCases':bind(D/'science/whole8-material-task-model-ten-point-scoring-fresh-transfer.de-en.exact-retained.json'),
 'wholeFourOriginalPProfiles':bind(D/'science/original-four-closed-v2-P-whole-records.exact-retained.json'),
 'genuineOriginalSciencePairAndOpenSourceStatus':bind(D/'genuine-original-pair/four-whole-science-KEEP-and-unresolved-source-role.truthful.json'),
 'actualPrimaryReadBoundaries':bind(D/'primary/actual-author-primary-reading-and-normalized-wording-boundaries.receipt.json'),
 'whole24PortablePrimaryDocuments':bind(D/'primary/full-original-official-cached-inputs.portable-index.json'),
 'wholeFourNativeBYCoursePages':bind(D/'primary/actual-four-course-whole-official-BY-pages.capture.json'),
 'actualPureNative378FourContexts':bind(D/'native/four-whole-current-pure-contexts.actual.json'),
 'actualCandidateImage6AndKeep8_14_17':bind(D/'selected-images/four-author-image-decisions-and-complete-guide-link.json'),
 'actualCurrentCentral175_222':bind(D/'before/current-central-Chem175-Bio222.actual.json'),
 'reviewInstructions':'Two independent own first verdicts before peer reading. Judge actual whole original source operators, course/optionality, 155 selected contribution roles and all528 current partners without broad union claims. Preserve genuine unchanged A/B whole science/P judgments; target only real source-role risks or findings. HE water-cycle and TH Fe2OH execution roles stay explicit. No D/P/V/Human release claim; actual final native rasters/PDFs pending source eligibility.',
 'status':'inactive_author_candidate_source_pair_and_final_native_reviews_pending','activeWrites':0,'newStrictClosures':0,'humanApproval':False})
for v in load(R/seal['path'])['ownFiles']:assert sha(R/v['path'])==v['sha256']and (R/v['path']).stat().st_size==v['bytes'],v
for p in [R/seal['path'],R/entry['path']]:assert mod.validate_file(rel(p),schema)
put('checks/first-seal-and-neutral-entry.read-only-verification.actual.json',{'actualExitCode':0,'seal':seal,'neutralEntry':entry,
 'allFrozenOwnFilesVerified':len(own),'newSealAndEntryNormalSchemaExitCode':0,'activeWrites':0,'newStrictClosures':0})
print(json.dumps({'authorFirstSeal':seal,'neutralEntry':entry,'ownFrozenFiles':len(own),'portableRequiredFiles':len(required),
 'ownNormalJSONCheck':len(jsons),'ignoredOrBrokenRequiredFiles':0,'ordinaryM378ExitCode':0,'ordinaryRetainedOriginalP4ExitCode':0,
 'activeWrites':0,'newStrictClosures':0}))
