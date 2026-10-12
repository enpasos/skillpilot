import datetime,hashlib,json,pathlib,subprocess
BASE=pathlib.Path(__file__).resolve().parent
ROOT=BASE.parents[6]
def read(p):return json.loads(p.read_text())
def ref(p):
    b=p.read_bytes()
    return dict(path=str(p.relative_to(ROOT)),bytes=len(b),sha256='sha256:'+hashlib.sha256(b).hexdigest())
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
first=read(BASE/'FIRST.author-exact-inputs-CAS.json')
drift=[]
for r in first['inputs']:
    p=ROOT/r['path']
    if ref(p)['sha256']!=r['sha256']:drift.append(dict(before=r,after=ref(p)))
assert not drift,drift
parsed=[]
for p in sorted(BASE.rglob('*')):
    assert not p.is_symlink(),str(p)
    if not p.is_file():continue
    if p.suffix=='.json':read(p);parsed.append(str(p.relative_to(BASE)))
    elif p.suffix=='.jsonl':
        for l in p.read_text().splitlines():
            if l.strip():json.loads(l)
        parsed.append(str(p.relative_to(BASE)))
historical=[]
history_parent=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
for name in ['chemie-q3-v6-equilibrium-operator-stationarity-targeted-independent-a-v1','chemie-q3-v6-genuine-targeted-independent-b-v1']:
    for p in sorted((history_parent/name).glob('FINAL*.json')):historical.append(ref(p))
core=read(BASE/'checks/normal-live402-source382-M2-P3-and-protected-context.author.actual.json')
write(BASE/'checks/FINAL.external-inputs-portability-and-complete-parse.actual.json',dict(result='PASS',CASinputsVerified=len(first['inputs']),externalInputDrift=drift,ownJsonJsonlParsed=parsed,ownSymlinks=0,historicalIndependentSeals=historical,currentGitHead=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),activeCanonicalExactInitialCAS=True,reviewRole='AUTHOR only',scope='three Chemistry goals',HumanApproval=False,HumanTrial=False))
join=BASE/'inputs/neutral-whole-three-LIVE402-source382-P3-eight-cases-and-authentic-dossier.author.join.json'
mf=dict(schemaVersion=1,createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),role='Complete inactive AUTHOR candidate; no current independent vote',goalIds=first['goalIds'],currentCanonicalGoals=523,currentCurricularAtomic=402,currentSourceUnion=382,sourceViews=48,entry=ref(join),FIRST=ref(BASE/'FIRST.author-exact-inputs-CAS.json'),candidateLandscape=ref(BASE/'candidate/canonical523.live-five-applicability-fixes-Q3-only.inactive.json'),candidateSemanticKinds=ref(BASE/'candidate/semantic402.current-two-normal-fingerprints.inactive.json'),candidateVisualizationQa=ref(BASE/'candidate/visualization-QA.current-three-actual-PNG-author-AI.inactive.json'),P3=ref(BASE/'positive/P3.current402.author.records.jsonl'),M2targeted=ref(BASE/'memory/M2.targeted-author-decisions.current-goals.jsonl'),M402candidateConfig=ref(BASE/'memory/current402.inactive.config.json'),authenticDossier=ref(BASE/'sources/q3-01-d.authentic-published-chemical-dossier.author.json'),authenticWholeCase=ref(BASE/'cases/q3-01-d.authentic-published-evidence-whole-case.author.json'),syntheticSeventhCase=ref(BASE/'cases/q3-01-c.current402.SYNTHETIC-template.technical.json'),retainedSixWholeCases=ref(BASE/'cases/cases6.current402.whole-context.technical.json'),current402Model=ref(BASE/'native/whole402.normal-model.json'),current382Model=ref(BASE/'native/source382.normal-model.json'),normalNativePages={c:{f:ref(BASE/'native'/c/f) for f in ['book-model.json','book.html','book.html.render-manifest.json','book.pdf','book.pdf.render-manifest.json']} for c in ['whole402-three','source382-three']},normalBlindReviewInputs={c:{f:ref(BASE/'review'/c/f) for f in ['description-review-input.json','description-review-campaign.json','review-bundle-manifest.json']} for c in ['round-a','round-b']},normalReviewBundle=ref(BASE/'review/bundle/manifest.json'),normalChecks=ref(BASE/'checks/normal-live402-source382-M2-P3-and-protected-context.author.actual.json'),nativeSchemaCampaignCheck=ref(BASE/'checks/native-HTML-three-source-three-P3-schema-campaigns-and-JSON.actual.json'),finalCASCheck=ref(BASE/'checks/FINAL.external-inputs-portability-and-complete-parse.actual.json'),holds=ref(BASE/'HOLDs.author.json'),historicalIndependentSeals=historical,allFiveB007ApplicabilityFixesPreserved=True,all523RequiresPreserved=True,authenticPublishedChemicalDossierBound=True,fullChemicalExperimentalOperatorCompleted=False,ownChemicalExperimentPerformed=False,actualLearnerPerformance=False,independentVotes=0,machineStrictGain=0,newScientificCompletions=0,restoredActiveBindings=0,activeWrites=False,HumanApproval=False,HumanTrial=False,sealPath=str((BASE/'FINAL.immutable-author-candidate-CAS-seal.json').relative_to(ROOT)))
write(BASE/'FINAL.author-candidate-input-manifest.json',mf)
seal_path=BASE/'FINAL.immutable-author-candidate-CAS-seal.json'
outputs=[ref(p) for p in sorted(BASE.rglob('*')) if p.is_file() and p!=seal_path]
seal=dict(schemaVersion=1,createdAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),role='Immutable complete AUTHOR package seal, not reviewer approval',inputManifest=ref(BASE/'FINAL.author-candidate-input-manifest.json'),FIRST=ref(BASE/'FIRST.author-exact-inputs-CAS.json'),externalInputsCASVerified=len(first['inputs']),files=outputs,allFilesRegular=True,sourceDocumentsThirdPartyRightsPreserved=True,activeWrites=False,independentVotes=0,strictM7Gain=0,HumanApproval=False,HumanTrial=False)
write(seal_path,seal)
for r in seal['files']:assert ref(ROOT/r['path'])==r
print(json.dumps(dict(result='PASS_SEALED_AUTHOR_CANDIDATE',entry=mf['entry']['path'],manifest=str((BASE/'FINAL.author-candidate-input-manifest.json').relative_to(ROOT)),seal=ref(seal_path),CASinputCount=len(first['inputs']),sealedFiles=len(outputs),current402=core['normalModelPages']['whole'],current382=core['normalModelPages']['source'],strictGain=0,independentVotes=0,activeWrites=False)))
