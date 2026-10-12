# SPDX-License-Identifier: Apache-2.0
import copy, datetime, hashlib, importlib.util, json, pathlib, shutil, subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot')
BP=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-P9-targeted-remediation-author-20261012-v3')
B=R/BP; V=R/BP.parent/'chemie-q2-naturstoffe-current402-author-20261012-v2'
C=R/'tmp/chemie-natural-P9-author-v3/normal-lean-capsule'
def load(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return dict(path=str(p.relative_to(R)),bytes=p.stat().st_size,sha256=sha(p))
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
now=datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')
cand=load(B/'positive/P9.author.candidate-set.json');ids=[x['goalId'] for x in cand['goals']]
shutil.copyfile(pathlib.Path(__file__),B/'author/finalize-run-bindings-and-seal.py')
schema=R/'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'
book=V/'native/full407.actual.book-model.json'
entry=dict(schemaVersion=1,inputId='chemie-q2-naturstoffe-p9-targeted-author-material-input-v3',candidateAtomicCount=407,goalIds=ids,role='informed_author_synthesis_not_independent_review',fileInputs=[ref(p) for p in [B/'inputs/canonical532.candidate407.exact.json',B/'inputs/semantic407.exact.json',B/'inputs/P-v2.criteria.exact.md',B/'cases/P9-updated-and-retained-whole-DEEN.cases-material-rubrics.json',B/'positive/P9.author.candidate-set.json',B/'author/authoring-prompt.md',B/'author/authoring-generation-parameters.json',book]],newNativeRender=False)
write(B/'inputs/EXACT.P9.material-authoring-input.json',entry)
runid='chemie-q2-naturstoffe-p9-informed-author-v3'
records=[json.loads(s) for s in (B/'positive/P9.normal-materialized.pending.review.jsonl').read_text().splitlines()]
bound=copy.deepcopy(records)
for x in bound:x['reviewRunIds']=[runid]
out=B/'positive/P9.author-run-bound.pending.review.jsonl'
out.write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in bound))
manifest={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'bundleFingerprint':sha(B/'inputs/EXACT.P9.material-authoring-input.json'),'bookDigest':sha(book),'provider':'OpenAI Codex','model':'GPT-6 (session identity)','role':'synthesizer','promptFamilyId':'chemistry-targeted-whole-P-remediation-author-v3','promptFingerprint':sha(B/'author/authoring-prompt.md'),'criteriaFingerprint':sha(B/'inputs/P-v2.criteria.exact.md'),'generationParametersFingerprint':sha(B/'author/authoring-generation-parameters.json'),'independenceGroupId':'informed-author-read-original-a-and-b-not-independent','blindToOtherRuns':False,'goalIds':ids,'inputArtifacts':[dict(role='book_model',digest=sha(book)),dict(role='review_input_json',digest=sha(B/'cases/P9-updated-and-retained-whole-DEEN.cases-material-rubrics.json')),dict(role='review_prompt',digest=sha(B/'author/authoring-prompt.md')),dict(role='review_criteria',digest=sha(B/'inputs/P-v2.criteria.exact.md')),dict(role='run_manifest_schema',digest=sha(schema))],'startedAt':cand['reviewedAt'],'completedAt':now,'status':'completed','outputDigest':sha(out),'toolchainVersion':'normal-P-v2-20261012'}
write(B/'positive/P9.informed-author-synthesis.actual.run.json',manifest)
cfg=load(B/'positive/P9.normal-materializer.inactive.config.json')
cfg['reviewPath']=str(out.relative_to(R));cfg['reviewRunManifestPaths']=[str((B/'positive/P9.informed-author-synthesis.actual.run.json').relative_to(R))]
write(B/'positive/P9.author-run-bound.inactive.config.json',cfg)
write(B/'author/run-authority-disclosure.json',dict(schemaVersion=1,runId=runid,role='informed_author_synthesis',normalManifestRole='synthesizer',blindToOtherRuns=False,originalAandBFindingsRead=True,independentReviewClaimed=False,explanation='This is author remediation informed by both original reviews. The normal synthesizer role truthfully records its non-blind synthesis; it is not a new subject/didactic/independent acceptance run. Baseline book_model is reused only as unchanged candidate407 context. The newly bound whole-case input supplies the corrected tasks. No successor HTML/PDF has been rendered or accepted.',evidenceLevel='E1',maximumClaimScope='G1',strictClosures=0,humanApproval=False,humanTrial=False))
shutil.copytree(B,C/BP,dirs_exist_ok=True)
args=['node','app/node_modules/tsx/dist/cli.mjs','app/scripts/positiveGoalEvidenceReview.ts','--config='+str(BP/'positive/P9.author-run-bound.inactive.config.json'),'--mode=check']
result=subprocess.run(args,cwd=C,text=True,capture_output=True)
(B/'checks/normal-P-v2.author-run-bound-check.txt').write_text(result.stdout+result.stderr)
assert result.returncode==0,result.stdout+result.stderr
checks=load(B/'checks/normal-P-v2.author-actual-results.json')
checks['checks'].append(dict(check='author-run-bound-check',command=args,exitCode=result.returncode));checks['authorRunNormalBindingValid']=True;checks['newIndependentAcceptedRuns']=0
write(B/'checks/normal-P-v2.author-actual-results.json',checks)
# Nine profiles change; each non-target original JSONL line remains byte-exact.
originalLines=(V/'positive/P36.actual-bound.ai-candidate.review.jsonl').read_text().splitlines(keepends=True)
boundmap={r['goalId']:r for r in bound}
merged=''.join(json.dumps(boundmap[json.loads(s)['goalId']],ensure_ascii=False)+'\n' if json.loads(s)['goalId'] in boundmap else s for s in originalLines)
(B/'positive/P36.merged-inactive-nine-updated-27-exact.review.jsonl').write_text(merged)
oldmap={json.loads(s)['goalId']:json.loads(s) for s in originalLines}
comparisons=[]
for x in bound:
    old=oldmap[x['goalId']]
    assert x['goalFingerprint']==old['goalFingerprint'] and x['reviewInputFingerprint']==old['reviewInputFingerprint']
    assert x['profileFingerprint']!=old['profileFingerprint']
    comparisons.append(dict(goalId=x['goalId'],goalFingerprintUnchanged=True,reviewInputFingerprintUnchanged=True,profileFingerprintBefore=old['profileFingerprint'],profileFingerprintAfter=x['profileFingerprint'],status=x['status'],reviewAuthority=x['reviewAuthority']))
nonTarget=[s for s in originalLines if json.loads(s)['goalId'] not in boundmap]
assert ''.join(nonTarget)==(B/'positive/P27.retained-original.exact.jsonl').read_text()
mergedLines=merged.splitlines(keepends=True)
assert [s for s in mergedLines if json.loads(s)['goalId'] not in boundmap]==nonTarget
newwhole=load(B/'cases/P9-updated-and-retained-whole-DEEN.cases-material-rubrics.json')
targetcases=load(B/'cases/P9-only.updated-whole-DEEN.cases-material-rubrics.json')
casemap={(x['goalId'],x['case']['id']):x for x in targetcases['cases']}
assert len(casemap)==len(targetcases['cases'])
for x in bound:
    for brief in x['profile']['applicationCaseBriefs']:
        assert casemap[(x['goalId'],brief['id'])]['case']==brief,(x['goalId'],brief['id'])
originalWhole=load(V/'cases/targeted24-to29.DEEN.tasks-material-rubrics.json')
newmap={(x['goalId'],x['case']['id']):x for x in newwhole['cases']}
changed=[];preserved=[]
for x in originalWhole['cases']:
    key=(x['goalId'],x['case']['id'])
    (preserved if newmap[key]==x else changed).append(dict(goalId=key[0],caseId=key[1]))
assert len(changed)==6 and all(x['goalId'] in ids for x in changed)
assert len(preserved)==44
assert sha(B/'inputs/canonical532.candidate407.exact.json')==sha(V/'candidate/canonical532.complete-inactive.json')
assert sha(B/'inputs/semantic407.exact.json')==sha(V/'candidate/semantic407.inactive-model-input.json')
write(B/'checks/actual-nine-binding-and-untouched-byte-comparison.json',dict(schemaVersion=1,profiles=9,allNineProfileBodiesChanged=True,bindings=comparisons,untouchedP27LinesByteExact=True,mergedP36NonTargetLinesByteExact=True,originalWholeCasesPreserved=len(preserved),originalWholeCasesChangedOnlyInScope=changed,newWholeCaseCount=len(newwhole['cases']),targetedWholeCaseCount=len(targetcases['cases']),everyTargetProfileCaseHasExactWholeCase=True,candidateCanonicalBytesUnchanged=True,semantic407BytesUnchanged=True,sourceMappingsChanged=False,imagesChanged=False,activeWrites=False,newScientificClosures=0,humanApprovals=0,humanTrials=0))
# Historical own-file seals are checked again after all author operations.
initial=load(B/'inputs/EXACT.input-manifest.before-author.json')
for comp in initial['sealedInputComparisons']:
    seal=R/comp['seal']['path'];assert sha(seal)==comp['seal']['sha256']
    data=load(seal)
    for x in data['ownFiles']:
        p=R/x['path'];assert p.is_file() and sha(p)==x['sha256'] and p.stat().st_size==x['bytes'],x['path']
initial['files'].append(ref(R/BP.parent/'chemie-q2-naturstoffe-current402-author-20261012-v1/cases/whole31.DEEN.cases-and-current-context.author.json'))
initial['finalSealedInputRecheckAt']=now
write(B/'inputs/EXACT.input-manifest.before-author.json',initial)
# Current committable curriculum links, including the new package, use the existing gate.
spec=importlib.util.spec_from_file_location('validate_schemas',R/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
symlink_errors=module.curriculum_symlink_errors(R)
write(B/'checks/curriculum-symlink-errors.actual.json',dict(check='scripts.validate_schemas.curriculum_symlink_errors',errors=symlink_errors,newPackageSymlinks=[],scope='current committable curricula',activeWrites=False))
assert not symlink_errors,symlink_errors
parsecount=0
for p in B.rglob('*'):
    assert not p.is_symlink(),p
    if not p.is_file():continue
    if p.suffix=='.json':load(p);parsecount+=1
    if p.suffix=='.jsonl':
        for s in p.read_text().splitlines():
            if s.strip():json.loads(s)
        parsecount+=1
write(B/'checks/complete-owned-json-jsonl-parse.actual.json',dict(allOwnedJsonJsonlParsed=True,filesParsed=parsecount,actualNewlines=True,ownSymlinks=0))
(B/'README.author.md').write_text('''# Inactive targeted Chemistry P9 author successor

This package changes only nine positive-evidence profiles and their task material
against the exact sealed candidate407. It is informed author work after reading
the original sealed A/B findings; it is not independent acceptance.

Use `FINAL.P9.neutral-review-input.json` for the exact inputs, and the normal
`positive/P9.author-run-bound.inactive.config.json` plus its pending ledger for
the nine P candidates. The author run is explicitly a non-blind synthesizer.
The baseline book model is unchanged context; no successor native HTML/PDF was
produced. Root owns combination and subsequent independent targeted review.

The full updated case file has 58 entries. Twenty-four whole DE/EN entries bind
all nine target profiles. Forty-four original whole-case objects remain exact;
six original incomplete cases are completed, six missing cases are added, and
two retained 9abd briefs now have explicit working material. All 27 non-target
P JSONL lines remain byte-exact in the optional merged P36 ledger.

Synthetic activity, electrophoresis, kitchen and fat-use dossiers are task
fixtures. Practical Benedict/Fehling execution and real learner research remain
required where the source route calls for them. No real learner/lab performance
or human approval/trial is claimed. All nine records remain E1/G1,
`needs_human_review`, `ai_candidate`. Normal technical checks have zero blockers;
no strict gain is granted.

Separate source/operator work for 978a6f25, d8eeed29, dfaef897 and 2f3cdec5, and
the ee359c2e image correction are outside this package. The original reviews,
source mappings, canonical goals, images, runtime and active configuration were
not changed by this author.

Own learning content: CC-BY-4.0, attribution SkillPilot, AI-generated and
SkillPilot-curated. Author helper software: Apache-2.0. Third-party source text,
references and previous immutable licenses retain their existing rights.
''')
entryfiles=[p for p in B.rglob('*') if p.is_file() and p.name not in ['FINAL.P9.neutral-review-input.json','FINAL.author-package.freeze.json']]
entry=dict(schemaVersion=1,inputId='chemie-q2-naturstoffe-p9-targeted-remediation-v3-final-input',candidateAtomicCount=407,goalIds=ids,role='informed_author_not_independent_acceptance',fileInputs=[ref(p)for p in sorted(entryfiles)],reusedInputRefs=initial['files'],statuses=dict(evidenceLevel='E1',maximumClaimScope='G1',needsHumanReview=9,aiCandidate=9,independentAcceptance=False,strictClosures=0,humanApprovals=0,humanTrials=0),activeWrites=False,newNativeHTMLorPDF=False)
write(B/'FINAL.P9.neutral-review-input.json',entry)
own=[ref(p) for p in sorted(B.rglob('*')) if p.is_file() and p.name!='FINAL.author-package.freeze.json']
seal=dict(schemaVersion=1,packageId='chemie-q2-naturstoffe-p9-targeted-remediation-author-20261012-v3',role='informed-author-remediation-only',sealedAt=now,neutralEntry=ref(B/'FINAL.P9.neutral-review-input.json'),ownFiles=own,ownFileCount=len(own),ownedBytes=sum(x['bytes']for x in own),reusedInputRefs=initial['files'],newScientificClosures=0,newIndependentAcceptedRuns=0,newHumanApprovals=0,humanTrials=0,activeCanonicalWrites=False,gitWrites=False)
write(B/'FINAL.author-package.freeze.json',seal)
print(json.dumps(dict(entry=ref(B/'FINAL.P9.neutral-review-input.json'),seal=ref(B/'FINAL.author-package.freeze.json'),normalChecks=4,blockingIssues=0,wholeCases=len(newwhole['cases']),targetWholeCases=len(targetcases['cases']),ownFileCount=len(own),strictClosures=0),ensure_ascii=False))
