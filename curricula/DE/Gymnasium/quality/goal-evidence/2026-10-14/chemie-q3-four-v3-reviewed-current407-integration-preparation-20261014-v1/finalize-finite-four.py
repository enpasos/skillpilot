from pathlib import Path
import json,hashlib,datetime,sys,importlib.util,copy
import jsonschema
ROOT=Path('/home/enpasos/projects/skillpilot');OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix()
T=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1'
E12=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';AR=E12/'chemie-q3-thirteen-current402-four-images-author-20261012-v3';AA=E12/'chemie-q3-thirteen-current402-targeted-independent-a-20261012-v3';BB=E12/'chemie-q3-thirteen-current402-targeted-independent-b-20261012-v3'
def rd(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)}
def wr(name,d):
 p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
cas=rd(OWN/'CAS.exact-four-whole-goals.before-after.actual.json');ids=[x['goalId'] for x in cas['rows']]
base=rd(T/'candidate/canonical533.current407.corrected-P8-resources.inactive.json');future=rd(OWN/'candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json');b={g['id']:g for g in base['goals']};f={g['id']:g for g in future['goals']}
protectedPath=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie262-current402-closed34-active-adoption-root-20261013-v1/receipts/ACTUAL.full-registry-current402-five-gate-report.json'
protected=next(x for x in rd(protectedPath)['subjects'] if x['subject']=='chemie')['strictCompleteGoalIds'];assert len(protected)==len(set(protected))==262
assert not(set(protected)&set(ids));assert all(b[i]==f[i] for i in protected)
bs=rd(T/'candidate/semantic533.current407.corrected-P8.inactive.json');fs=rd(OWN/'candidate/semantic533.current407.q3-four-reviewed-v3.inactive.json');bsd={x['goalId']:x for x in bs['decisions']};fsd={x['goalId']:x for x in fs['decisions']}
bq={x['goalId']:x for x in rd(T/'candidate/QA.current407.exact-reviewed-child-images.inactive.json')['records']};fq={x['goalId']:x for x in rd(OWN/'candidate/QA.current407.q3-four-reviewed-v3.inactive.json')['records']}
assert all(bsd[i]==fsd[i] and bq.get(i)==fq.get(i) for i in protected)
wr('checks/protected262-exact-existing-whole-goals-SEM-QA-preservation.actual.json',{'schemaVersion':1,'protectedIdCarrier':bind(protectedPath),'protectedGoalIds':protected,'count':262,'selectedFourDisjoint':True,'wholeCanonicalBodiesExact':True,'semanticDecisionRecordsExact':True,'visualizationQARecordsExact':True,'broadQSPerformed':False,'newScientificVotes':0})
inputs=rd(OWN/'INPUTS.exact-original-and-current407-bindings.actual.json')
def add(p):
 x=bind(p)
 if x not in inputs['bindings']:inputs['bindings'].append(x)
add(protectedPath)
stockdeps=rd(OWN/'checks/stock-book-build-physical-input-bindings.actual.json')
for x in stockdeps['bindings']+stockdeps['additionalNonPageQAAssetBindingsReadActualBytes']:add(ROOT/x['path'])
criteria=[]
for s in 'ab':
 c=rd(OWN/f'positive/P4.original-independent-{s}.config.json');p=ROOT/c['reviewCriteriaPath'];add(p)
 records=[json.loads(x) for x in (OWN/f'positive/P4.original-independent-{s}.review.jsonl').read_text().splitlines()]
 assert all(sha(p)==x['reviewCriteriaFingerprint'] for x in records)
 criteria.append({'independent':s,'criteria':bind(p),'recordsMatchExactCriteriaBytes':True})
wr('checks/exact-P4-reviewed-criteria-byte-bindings.actual.json',{'schemaVersion':1,'rows':criteria,'pass':True})
# Preserve the original B P13 run as historical provenance. The four records are
# a byte-exact slice of that original13 output, never a newly fabricated P4 run.
pr=BB/'positive/P13.independent-b.run.json';add(pr)
(OWN/'positive/P13.original-independent-b.run.json').write_bytes(pr.read_bytes())
assert rd(pr)['outputDigest']==sha(BB/'positive/P13.independent-b.review.jsonl')
pair=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-four-bounded-source-current-author-20261008-v1/genuine-original-pair'
for fn in ['a.whole20-40-science-source-A-P.independent-a.first.freeze.json','b.whole20-whole40-science-source.independent-b.first.freeze.json']:add(pair/fn)
# Verify only bound dependencies against their original published finite seals.
seals=[AR/'author-package.freeze.json',AR/'committable-package.freeze.json',AA/'independent-a.successor-original.freeze.json',BB/'ORIGINAL.successor-judgment-seal.json',pair/'a.whole20-40-science-source-A-P.independent-a.first.freeze.json',pair/'b.whole20-whole40-science-source.independent-b.first.freeze.json']
sealMatches=[];sealErrors=[]
for seal in seals:
 add(seal);d=rd(seal);rows=d.get('rows',d.get('files',[]))
 for x in rows:
  if not isinstance(x,dict) or 'path' not in x:continue
  if x['path'] not in {a['path'] for a in inputs['bindings']}:continue
  p=ROOT/x['path'];actual=sha(p);expected=x.get('sha256',x.get('digest'))
  if expected and not expected.startswith('sha256:'):expected='sha256:'+expected
  same=actual==expected and (x.get('bytes') is None or x['bytes']==p.stat().st_size)
  sealMatches.append({'seal':bind(seal),'path':x['path'],'expected':expected,'actual':actual,'pass':same})
  if not same:sealErrors.append(x['path'])
assert not sealErrors,sealErrors
wr('checks/exact-needed-original-seal-member-bindings.actual.json',{'schemaVersion':1,'boundMemberMatches':sealMatches,'errors':sealErrors,'unusedHistoricalMembersNotRereviewed':True})
for x in inputs['bindings']:
 assert (ROOT/x['path']).stat().st_size==x['bytes'] and sha(ROOT/x['path'])==x['sha256'],x['path']
wr('INPUTS.exact-original-and-current407-bindings.actual.json',inputs)
tupleRows=rd(OWN/'inputs/exact-four-original-whole-v3-goal-page-source-profile-case-context-tuples.json')['rows']
wr('positive/exact-four-nine-full-bilingual-case-bodies.original-v3.json',{'schemaVersion':1,'sourceWholeTupleCarrier':bind(AR/'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json'),'rows':[{'goalId':x['goalId'],'wholeMaterialCases':x['wholeMaterialCases']} for x in tupleRows],'caseCounts':{x['goalId']:len(x['wholeMaterialCases']) for x in tupleRows},'allCasesPreservedExact':True,'newScience':False})
ctx=rd(OWN/'D4.current407-exact-original-v3-versus-owned-candidate-context-binding-deltas.actual.json');pjoin=rd(OWN/'checks/stock-whole533-SEM-and-exact-P4-A-B-fingerprint-joins.actual.json');assert pjoin['pass']
carryRows=[]
for x in ctx['rows']:
 a=x['originalReviewedV3Page'];c=x['currentOwned407Page']
 assert a['goalFingerprint']==c['goalFingerprint']
 assert {k:v for k,v in a['evidenceReview'].items() if k!='reviewId'}=={k:v for k,v in c['evidenceReview'].items() if k!='reviewId'}
 assert a['breadcrumbs']==c['breadcrumbs'][1:]
 n=[]
 for y in x['wholeContextNeighbors']:
  if not y['wholeExact']:
   changed=[k for k in set(y['oldWhole'])|set(y['currentWhole']) if y['oldWhole'].get(k)!=y['currentWhole'].get(k)]
   n.append({'goalId':y['goalId'],'changedFields':sorted(changed),'oldWhole':y['oldWhole'],'currentWhole':y['currentWhole'],'scienceReopened':False,'scope':'global autonomy terminal already changed in base407; remains excluded from native reverseRequires' if y['goalId'].startswith('14577339') else 'pre-existing contextual resource link change only'})
 carryRows.append({'goalId':x['goalId'],'wholeV3BodyAndGoalFingerprintExact':True,'nativeImageBytesExact':True,'wholePProfileAndInputFingerprintExact':True,'current407PageFingerprint':c['pageFingerprint'],'originalV3PageFingerprint':a['pageFingerprint'],'pageBindingStillDifferent':True,'pageContentDeltas':'page locations/chapter IDs; one additional review-view root breadcrumb; P reviewId provenance only','contextNeighborDeltas':n,'currentFreshNativeDRunPerformed':False,'integrationContentResourcesReady':True,'additionalScientificBodyReviewRequiredByObservedDelta':False,'currentDClosureAutomaticallyGranted':False})
wr('D4.exact-current-page-and-whole-context-technical-carry-boundaries.actual.json',{'schemaVersion':1,'role':'technical_retention_proof_and_explicit_current_D_binding_boundary','rows':carryRows,'originalD13CampaignsAndRunBytesPreservedExact':True,'originalD4SlicesRemainHistorical':True,'noNewScientificDRecordsOrRunsFabricated':True,'nextBoundedDuty':'Bind four actual final407 native pages in the final operative book. Either use an applicable stock compatibility/carry contract after its exact full-context checks or perform genuine targeted native page followup. Current page fingerprints are not original v3 page fingerprints. Retained exact raster V decisions need no replacement image or new chemical pixel vote; final-page placement/readability remains a native-render check.','nineExcludedSourceScopeHoldsPreserved':True,'sourceExperimentUnionNotApproved':True,'globalAutonomyTerminalNotReReviewed':True})
checks=rd(OWN/'checks/stock-finite-original-D-AM-results.actual.json');assert checks['allPass']
manifest={'schemaVersion':1,'role':'finite_authorized_technical_integration_preparation_of_four_existing_independently_reviewed_Q3_goals','startedAtUTC':inputs['startedAtUTC'],'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'provider':'OpenAI Codex','model':'GPT-6 session identity; exact serving revision and sampling unknown','newBlindScientificRun':False,'newScientificVoteCount':0,'scopeGoalIds':ids,'baseWhole533Current407':bind(T/'candidate/canonical533.current407.corrected-P8-resources.inactive.json'),'candidateWhole533Current407':bind(OWN/'candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json'),'candidateSemanticLedger':bind(OWN/'candidate/semantic533.current407.q3-four-reviewed-v3.inactive.json'),'candidateQA':bind(OWN/'candidate/QA.current407.q3-four-reviewed-v3.inactive.json'),'stockCurrent407Model':bind(OWN/'models/whole407.q3-four-reviewed-v3.stock-model.inactive.json'),'wholeGoalCAS':bind(OWN/'CAS.exact-four-whole-goals.before-after.actual.json'),'resourceAndVBindings':bind(OWN/'V4.exact-existing-independent-pixel-decisions-and-installation-bindings.actual.json'),'originalAuthorManifest':bind(AR/'FINAL.neutral-input-manifest.json'),'originalIndependentAManifest':bind(AA/'FINAL.targeted-independent-a.manifest.json'),'originalIndependentBManifest':bind(BB/'FINAL.targeted-independent-b.manifest.json'),'bodySuccessorsExactExistingV3':ids[:2],'goodCorrosionBodiesAndJpegsExactRetained':ids[2:],'allOther531WholeNodesExact':True,'wholeGlobalRequiresContainsApplicabilityExamplesUnchangedFromBase407':True,'all533SemanticClassificationDecisionsUnchanged':True,'protected262MeasuredExact':True,'existingD13OriginalCampaignsPassBoth':True,'existingP4OriginalRecordsExactBoth':True,'existingP4StockCurrentJoinsPassBoth':True,'existingA4StockCurrentBindingsPassBoth':True,'existingM4StockCurrentBindingsPass':True,'existingV4ActualIndependentPixelVotesExactBoth':True,'currentPageBindingBoundary':bind(OWN/'D4.exact-current-page-and-whole-context-technical-carry-boundaries.actual.json'),'intrinsicNewScientificSourceHoldForSelectedFour':False,'excludedNineAndExperimentSourceUnionHolds':bind(OWN/'HOLDS.excluded-nine-and-broader-experiment-source-unions.actual.json'),'contentResourceIntegrationReadyForRoot':True,'currentFreshDClosureClaim':False,'sourceUnionApproved':False,'strictGainClaim':0,'humanApproval':False,'humanTrial':False,'actualExperimentPerformance':False,'actualLearnerPerformance':False,'activeCurriculumWrites':False,'registryWrites':False,'engineWrites':False,'gitWrites':False,'originalT407HostWrites':False,'suggestedCurrentCandidateConfigs':{'P':[REL+'/positive/P4.original-independent-'+s+'.config.json' for s in 'ab'],'A':[REL+'/atomicity/'+sub+'.original-independent-'+s+'.config.json' for sub in ['two-v3','two-corrosion'] for s in 'ab'],'M':[REL+'/memory/two-v3.original-independent-'+s+'.config.json' for s in 'ab']+[REL+'/memory/two-corrosion.existing-unchanged.config.json']},'wholeOriginal402FilesCopiedOverCurrent407':False,'originalRunsNotRelabelledAsNewFourRuns':True}
wr('FINAL.four-existing-reviewed-v3-current407-technical-integration.manifest.json',manifest)
(OWN/'FINDINGS.technical-integration-and-remaining-bindings.md').write_text('''# Vier Q3-Ziele: vorbereitete technische Integration\n\nDer eigene inaktive 533/407-Kandidat übernimmt genau die beiden bereits unabhängig doppelt geprüften ganzen v3-Nachfolger für c0463225 (MWG einschließlich physikalisch zulässiger quadratischer Modelllösung) und 96fd8608 (abgegebene elektrische Arbeit aus U/I/t, begrenzte Energieinterpretation) sowie die dazu exakt geprüften PNGs. Die beiden ganzen Korrosionsziele und ihre guten JPEGs bleiben unverändert. Alle anderen 531 ganzen Ziele sowie globale Beziehungen, Anwendbarkeit und Beispiele bleiben gegenüber dem T407-Basiskandidaten exakt. Die exakten 262 geschützten Ziele, SEM-Entscheidungen und QA-Zellen wurden anhand des vorhandenen 262-ID-Carriers geprüft und sind unverändert.\n\nDie alten v3-D13-Records und vollständigen ursprünglichen Runs werden bytegetreu bewahrt; beide originalen Stockkampagnen bestehen. Die vier D-Record-Auszüge bleiben historische Auszüge. P4 wird für A und B mit unverändertem vollständigem Profil, ursprünglichem Urteil, Datum und Fingerprints übernommen; alle acht Stock-P-Joins und die vollständige Kriterienbindung bestehen. Die ursprünglichen v3-A2/M2-Records bleiben exakt; die zwei vorhandenen ganzen ursprünglichen Korrosions-A-Entscheidungen werden transparent in das Stockformat materialisiert, ohne neue wissenschaftliche Entscheidung. Vorhandene konservative Korrosions-M2-Records bleiben exakt. Alle begrenzten Stock-A/M-Prüfungen bestehen. V4 übernimmt echte vorherige Pixelentscheidungen beider Reviewer; die alte JPEG-Freigabe wird für die zwei neuen PNGs nicht übertragen. Menschenfreigaben bleiben unverändert ohne neue Freigabe.\n\n## Noch erforderliche aktuelle D-Bindung\n\nDie vier ganzen v3-Zieltexte, Goal-Fingerprints, Bildbytes und P-Profil-/Input-Fingerprints passen exakt zum Vorschlagskandidaten. Die vier nativen Seiten unterscheiden sich von v3 nach Entfernen numerischer Lagefelder ausschließlich durch einen zusätzlichen M7-Prüfsicht-Wurzel-Breadcrumb und die P-reviewId als Herkunft. Tatsächliche aktuelle Page-Fingerprints und Buchdigest sind deshalb anders. Globale ganze Kontextnachbarn haben außerdem bereits im T407-Basiskandidaten zwei Resource-Link-Änderungen (5a24dae0, c8844ac6) und das geänderte requires/extendedData des autonomen Abschlussziels14577339; dieses bleibt aus den nativen reverseRequires ausgeschlossen. Diese konkreten Unterschiede sind vollständig gebunden.\n\nFür den endgültigen operativen 407-Buchstand müssen die vier tatsächlichen nativen Seiten und ihre aktuelle D-Bindung kontrolliert werden: ein anwendbarer Stock-Carry-/Kompatibilitätsvertrag mit seinen vollständigen Voraussetzungen oder ein echter enger Native-Followup. Dieser technische Auftrag behauptet keinen neuen D-Lauf und ersetzt keine aktuelle Page-Bindung durch bloßen Hashwechsel. Für dieselben unveränderten Rasterbytes ist keine neue chemische Pixelentscheidung oder Bildersetzung erforderlich; Platzierung/Lesbarkeit im endgültigen nativen Seitenrender bleibt eine Renderprüfung.\n\n## Erhaltene Grenzen\n\nAlle neun ausgeschlossenen Source-/Scope-Holds und die breiteren NI/SN/TH-Experimentpflichten bleiben bestehen. Vier ganze Zielkompetenzen mit begrenzten Quellenanteilen freizuhalten ist keine Vollfreigabe ihrer Experimentpartner-Union. Das Paket enthält keine neue wissenschaftliche Abstimmung, aktive Adoption, Registry-/Engine-/Git-Schreiboperation, tatsächliche Versuchs- oder Lernendenleistung, Human-Freigabe oder Strictzuwachsbehauptung. Der ursprüngliche T407-Kandidat und dessen Host werden nicht verändert.\n''')
# Validate finite owned artifacts only, with the actual stock schemas.
schemas={'canonical':'docs/landscape-runtime.schema.json','sem':'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json','P':'contracts/goal-evidence/v2/goal-evidence-profile.schema.json','Pconfig':'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','D':'contracts/goal-description-review/v1/goal-description-review-record.schema.json','run':'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','model':'contracts/goal-book/v1/goal-book-model-1.1.schema.json'}
validators={}
for k,path in schemas.items():
 p=ROOT/path;s=rd(p);cl=jsonschema.validators.validator_for(s);cl.check_schema(s);validators[k]=cl(s,resolver=jsonschema.RefResolver(base_uri=p.resolve().as_uri(),referrer=s))
validation=[]
targets=[('canonical',OWN/'candidate/canonical533.current407.q3-four-reviewed-v3.inactive.json'),('sem',OWN/'candidate/semantic533.current407.q3-four-reviewed-v3.inactive.json'),('model',OWN/'models/whole407.q3-four-reviewed-v3.stock-model.inactive.json')]
for s in 'ab':
 targets += [('P',OWN/f'positive/P4.original-independent-{s}.review.jsonl'),('Pconfig',OWN/f'positive/P4.original-independent-{s}.config.json'),('D',OWN/f'description/D4.original-independent-{s}.records.jsonl')]
 for p in (OWN/f'description/original-{s}/results').glob('*.run.json'):targets.append(('run',p))
targets.append(('run',OWN/'positive/P13.original-independent-b.run.json'))
for k,p in targets:
 ds=[json.loads(l) for l in p.read_text().splitlines() if l.strip()] if p.suffix=='.jsonl' else [rd(p)]
 errors=[{'message':e.message,'instancePath':list(e.absolute_path),'schemaPath':list(e.absolute_schema_path)} for d in ds for e in validators[k].iter_errors(d)]
 validation.append({'kind':k,'path':p.relative_to(ROOT).as_posix(),'records':len(ds),'errors':errors});assert not errors,(p,errors[:2])
wr('checks/stock-targeted-schema-validation.actual.json',{'schemaVersion':1,'rows':validation,'pass':True,'broadSchemaRunPerformed':False})
# Finite JSON parsing includes all original copies and all written results.
parse=[]
for p in sorted(OWN.rglob('*')):
 if p.is_file() and p.suffix in ['.json','.jsonl']:
  ds=[json.loads(l) for l in p.read_text().splitlines() if l.strip()] if p.suffix=='.jsonl' else [rd(p)]
  def scan(x):
   if isinstance(x,dict):
    for v in x.values():scan(v)
   elif isinstance(x,list):
    for v in x:scan(v)
   elif isinstance(x,str):
    assert not x.startswith(('tmp/','/home/enpasos/projects/skillpilot/tmp/')),('ignored tmp public pointer',p,x)
  for d in ds:scan(d)
  parse.append({'path':p.relative_to(ROOT).as_posix(),'records':len(ds),'bytes':p.stat().st_size,'sha256':sha(p)})
wr('checks/finite-owned-json-jsonl-full-parse.actual.json',{'schemaVersion':1,'rows':parse,'pass':True,'noIgnoredTmpPublicPointers':True})
spec=importlib.util.spec_from_file_location('stockschemas',ROOT/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
errors=mod.curriculum_symlink_errors(str(ROOT));wr('checks/stock-global-curriculum-symlink-guard.actual.json',{'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stockFunction':'scripts/validate_schemas.py:curriculum_symlink_errors','errors':errors,'pass':not errors});assert not errors,errors
# Recheck every exact input and original candidate after the guard, then seal
# only owned regular files; never include the seal in its own output hash list.
for x in inputs['bindings']:assert sha(ROOT/x['path'])==x['sha256'] and (ROOT/x['path']).stat().st_size==x['bytes'],x['path']
rows=[bind(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p.name!='SEAL.finite-four-reviewed-v3-current407-technical-integration.actual.json']
assert not any(p.is_symlink() for p in OWN.rglob('*'))
seal={'schemaVersion':1,'role':'finite_authorized_technical_integration_preparation_seal_not_new_scientific_review','sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startedAtUTC':inputs['startedAtUTC'],'inputBindings':inputs['bindings'],'outputBindings':rows,'fileCount':len(rows),'totalBytes':sum(x['bytes'] for x in rows),'manifest':bind(OWN/'FINAL.four-existing-reviewed-v3-current407-technical-integration.manifest.json'),'goalIds':ids,'whole533Current407ProposalOnly':True,'protected262Exact':True,'allFiniteStockChecksPass':True,'currentDPageBindingsPendingTruthfullyDocumented':True,'newScientificVotes':0,'newStrictCompletions':0,'humanApproval':False,'humanTrial':False,'activeWrites':False}
wr('SEAL.finite-four-reviewed-v3-current407-technical-integration.actual.json',seal)
for p in OWN.rglob('*'):
 if p.is_file() and p.suffix=='.json':rd(p)
 elif p.is_file() and p.suffix=='.jsonl':
  for l in p.read_text().splitlines():
   if l.strip():json.loads(l)
print(json.dumps({'root':REL,'seal':sha(OWN/'SEAL.finite-four-reviewed-v3-current407-technical-integration.actual.json'),'files':len(rows),'bytes':sum(x['bytes'] for x in rows),'protected262':True,'stockChecks':True,'guard':True,'currentDPageBindingPending':True,'contentResourceIntegrationReady':True}))
