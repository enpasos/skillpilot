# SPDX-License-Identifier: Apache-2.0
"""Seal only this new additive technical stage; no approval or integration."""
import datetime,hashlib,json,pathlib
R=pathlib.Path.cwd();D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';ROOT=D/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3';B=ROOT/'later-stage-source6'
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def ref(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
sealpath=B/'FINAL.technical-preparation.freeze.json';assert not sealpath.exists()
seals=[]
for name in ['chemie-q2-naturstoffe-current402-author-20261012-v2','chemie-q2-naturstoffe-source4-MM-targeted-remediation-author-20261012-v3','chemie-q2-naturstoffe-P9-targeted-remediation-author-20261012-v3']:
 p=D/name/'FINAL.author-package.freeze.json';s=read(p)
 for x in s['ownFiles']:
  q=R/x['path'];assert sha(q)==x['sha256'] and q.stat().st_size==x['bytes'],x['path']
 seals.append({**ref(p),'verifiedOwnedFiles':len(s['ownFiles'])})
initial=read(B/'inputs/INITIAL.technical-role-and-original-CAS.json')
for k in ['rootOriginalFirst','rootPreS6Canonical']:
 x=initial[k];assert ref(R/x['path'])==x
origins=read(B/'inputs/P37-and-current-M1-3fb7-exact-origins.json')
for x in origins['origins'].values():
 if 'sha256' in x:assert sha(R/x['path'])==x['sha256']
land=read(B/'candidate/canonical532.current-active-plus-N2-P9-source6-ee4.inactive.json');gm={x['id']:x for x in land['goals']};live={x['id']:x for x in read(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')['goals']}
assert gm['2fdd759f-8349-5f7e-b29a-6ac7fb0299f9']==live['2fdd759f-8349-5f7e-b29a-6ac7fb0299f9']
P=[];rawlines={}
for name in ['P37.current-whole-retained-and-targeted.pending.review.jsonl','P2.current-M1-and-3fb7-retained.exact.jsonl','P1.current-fcc-collateral.exact.jsonl']:
 for line in (B/'positive'/name).read_text().splitlines():
  if line.strip():x=json.loads(line);assert x['goalId'] not in rawlines;P.append(x);rawlines[x['goalId']]=line
assert len(P)==40
for i in ['014e6d85-eecf-5228-9031-52a39981cd0d','127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a']:
 current=next(s for s in (R/origins['origins'][i]['path']).read_text().splitlines() if s.strip() and json.loads(s)['goalId']==i);assert rawlines[i]==current
for i,x in origins['currentAdditional'].items():assert rawlines[i]==x['line']
f=read(B/'inputs/P1.current-fcc-collateral-exact-origin.json');assert rawlines[f['record']['goalId']]==f['line']
campaigncheck=read(B/'checks/FINAL.empty-first-pass-campaign24-normal-tuples.actual.json');assert len(campaigncheck['checks'])==6
nativeIds=read(B/'neutral/actual-targeted-native-goal-ids.json');sourceOnly=['b4ca3af2-77f1-59e8-955d-c4959e284242'];assert len(nativeIds)==23;reviewIds=nativeIds+sourceOnly
campaigns=[]
for k in range(1,4):
 for rd in ['a','b']:
  p=B/f'native/targeted-batch-{k}/round-{rd}';assert not list((p/'results').iterdir());c=read(p/'description-review-campaign.json');assert c['reviewPass']=='first_pass' and c['blindToOtherReviews']
  campaigns.append({'batch':k,'round':rd,'campaign':ref(p/'description-review-campaign.json'),'input':ref(p/'description-review-input.json'),'bundle':ref(p/'review-bundle-manifest.json'),'emptyResultsDirectory':str((p/'results').relative_to(R))})
for x in read(B/'inputs/all-current-candidate-image-tuples.json')['records']:
 assert sha(R/x['path'])==x['sha256']
 if x['goalId'] in reviewIds:assert sha(B/'native-public'/x['url'].lstrip('/'))==x['sha256']
cases=read(B/'cases/P37.unique-whole-case-and-current-brief-bindings.json');assert len(cases['cases'])==88 and not cases['missingCases'] and all(not x['technicalTextFieldDifferences'] for x in cases['cases'])
write(B/'neutral/targeted24.whole-canonical-P-and-current-context.extract.json',{'nativeChangedTupleGoalIds':nativeIds,'sourceOnlyGoalIds':sourceOnly,'goals':[{'goalId':i,'wholeCanonicalGoal':gm[i],'wholeCurrentPRecord':next(x for x in P if x['goalId']==i),'reviewScope':'source-only HE temperature owner; original exact D tuple retained' if i in sourceOnly else 'actual changed native tuple or actual source/P/prerequisite collateral','newScientificVote':False} for i in reviewIds]})
cli=read(B/'checks/FINAL.normal-current-check-exits.actual.json');assert all(x['exitCode']==0 for x in cli['checks']);fcc=read(B/'checks/normal-P-current-fcc-collateral.actual.json');assert fcc['exitCode']==0
scope=read(B/'checks/FINAL.compiled48-scope40-readiness-and-collaterals.actual.json');assert not scope['compiledErrors'];atlas=read(B/'atlas/full-expanded-normal-receipt.actual.json')
write(B/'checks/FINAL.original-CAS-and-normal-targeted-readiness.actual.json',{'originalSeals':seals,'rootOriginalFirstAndPreS6CanonicalExact':True,'rootP3InputExact':True,'current014e127ePBytesExact':True,'currentM1CanonicalPAndPNGExact':True,'canonicalCount':532,'countedAtomicGoals':407,'sourceAtlasCounts':atlas['counts'],'normalPRecordCount':40,'normalMRows':407,'normalMemoryCards':75,'memoryVisibilityScopes':9,'normalSourceScopes':48,'normalErrors':0,'nativeChangedTupleGoals':23,'sourceOnlyOwnerGoals':1,'emptyCampaigns':6,'wholeP37CaseBindings':88,'nativeExactUnchangedD29Tuples':12,'independentScientificVotes':0,'humanApprovals':0,'humanTrials':0,'activeOrGitWrites':False})
holds=['All new scientific source/P/page/context decisions require two genuinely independent exact-current reviews; this informed preparer supplies no votes.','Whole broad source-map unions remain unapproved; historical rationale text is preserved as historical claims only.','496 unresolved source-scope decisions and 20 source-atlas omissions remain. 407 canonical atoms and 387 source-projected atoms are different reported universes.','Scope-specific earlier prerequisite availability remains a scientific readiness question wherever a required lower-stage goal lies outside a source target view; no required edge is removed.','Teacher-authorized GC and bromine practical operators require actual supervised learner execution; authored fixtures and paper observations claim no human or lab performance.','M407 necessity/visibility inputs and MM own-enrichment scope remain candidates pending exact independent acceptance; MM means Michaelis–Menten.']
write(B/'FINAL.current24.neutral-review-input.json',{'artifactRole':'new inactive exact-current neutral technical review preparation','preparerRole':'informed author/technical preparer, not independent reviewer','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'canonical':ref(B/'candidate/canonical532.current-active-plus-N2-P9-source6-ee4.inactive.json'),'semanticKinds':ref(B/'candidate/semantic407.current-normal-input.json'),'visualizationQA':ref(B/'candidate/visualization-QA.current-exact-assets.pending.json'),'nativeChangedTupleGoalIds':nativeIds,'sourceOnlyGoalIds':sourceOnly,'targetedWholeCanonicalAndPExtract':ref(B/'neutral/targeted24.whole-canonical-P-and-current-context.extract.json'),'positiveInputs':[ref(B/'positive'/x) for x in ['P37.current-whole-retained-and-targeted.pending.review.jsonl','P2.current-M1-and-3fb7-retained.exact.jsonl','P1.current-fcc-collateral.exact.jsonl']],'wholeP37Cases':ref(B/'cases/P37.unique-whole-case-and-current-brief-bindings.json'),'wholeCaseConservation':ref(B/'cases/P37.exact-original-case-conservation-and-binding-index.json'),'memoryConfig':ref(B/'memory/M407.current-normal.inactive.config.json'),'currentWhole407BookModel':ref(B/'native/full407.current.actual.book-model.json'),'normalSource387BookModel':ref(B/'atlas/source387.actual.book-model.json'),'sourceAtlasReceipt':ref(B/'atlas/full-expanded-normal-receipt.actual.json'),'sourceViewManifest':ref(B/'atlas/atlas.sources.owned-locators.json'),'compiledScope40Readiness':ref(B/'checks/FINAL.compiled48-scope40-readiness-and-collaterals.actual.json'),'rawAllSourceBindings':ref(B/'sources/all-current-raw-source-bindings.no-display-dedup.json'),'sourceCaseOperatorTable':ref(B/'sources/actual-source-case-operator-table-and-preserved-whole-audits.json'),'exactNativeTupleComparison':ref(B/'checks/exact-D29-current-D4-retained7-current-M1-tuple-comparison.actual.json'),'normalGateSummary':ref(B/'checks/FINAL.original-CAS-and-normal-targeted-readiness.actual.json'),'emptyCampaignNormalValidation':ref(B/'checks/FINAL.empty-first-pass-campaign24-normal-tuples.actual.json'),'campaigns':campaigns,'originalSeals':seals,'remainingHolds':holds,'newScientificVotes':0,'grantsM7Closure':False,'activeOrGitWrites':False})
(B/'README.review-boundaries.md').write_text('''# Exact-current chemistry preparation — inactive

Prepared by the informed S6 author and technical preparer. This package contains no independent scientific decisions, human approval, learner performance or active integration.

The candidate preserves the current five closures, current M1 PNG/canonical/P bytes and current 014e/127e P lines. It applies the four sealed S6 canonical deltas and combines P9/P6 with retained whole cases. MM means Michaelis–Menten. No new goal IDs or atomic-denominator change is proposed: 532 nodes, 407 counted atoms.

The exact same-batch normal API audit finds 17 changed original D29 tuples and 12 exact tuples. Current 197b/7b require fresh binding. e81/3fb and fcc/f7 require narrow source/P/prerequisite context follow-up. Nested page-number shifts alone are recorded as bookkeeping and do not trigger scientific reassessment. Current M1/014e/127e native tuples remain exact.

Two native batches contain the 23 changed contexts (12+11). A third one-goal batch contains the new HE temperature-source owner b4ca; its old exact D vote remains historical, and this scope is only the new source ownership context. All six unmodified NORMAL first_pass campaigns have empty results and distinct A/B independence groups. All current whole P records are included; their existing pending status is retained.

Normal gates pass for 40 current P records, M407/75 existing cards/nine visibility scopes, and 48 source views. The source atlas projects 387 of 407 atoms, retains 496 unresolved scope decisions and 20 omissions. No source-map union is approved. Required and inherited prerequisites remain present, with outside-view prerequisites reported for independent readiness assessment.

The case index resolves 88 P37 whole case/material/model-answer/rubric bodies without conflicting duplicates or differing brief fields. Current M1/3fb/fcc whole P rows remain byte-exact sidecars. The source table retains all 1,242 raw mapped bindings from 32 current mapping inputs, whole literal source goals, original decisions and actual compiled witnesses. Broad contains relationships are never treated as direct coverage.

Preparation corrected two technical invocation issues before successful checks: the normal P CLI requires --config=PATH, and renderer real-path containment requires exact local raster copies instead of external symlinks. No source image was edited. The exact copies and normal print derivatives are content-bound in this seal.

Entry: FINAL.current24.neutral-review-input.json. Seal: FINAL.technical-preparation.freeze.json. Root commissions the two independent reviewers and owns integration. Source/P/context acceptance, cross-stage readiness and all remaining source/M7 holds stay open.

Own authored didactic content is CC-BY-4.0; preparation scripts and technical documentation are Apache-2.0. Third-party curriculum text and historical source rights are retained unchanged.
''')
files=[ref(p) for p in sorted(B.rglob('*')) if p.is_file() and p!=sealpath]
write(sealpath,{'artifactRole':'immutable additive inactive technical preparation seal','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'neutralEntry':ref(B/'FINAL.current24.neutral-review-input.json'),'ownFiles':files,'originalSeals':seals,'newScientificVotes':0,'grantsM7Closure':False,'activeOrGitWrites':False,'remainingHolds':holds})
for x in read(sealpath)['ownFiles']:assert ref(R/x['path'])==x
print(json.dumps({'neutral':ref(B/'FINAL.current24.neutral-review-input.json'),'seal':ref(sealpath),'sealedFiles':len(files),'nativeTargets':24,'emptyCampaigns':6,'normalErrors':0,'newScientificVotes':0},ensure_ascii=False))
