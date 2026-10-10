import json, hashlib, importlib.util, datetime, os
from pathlib import Path
import jsonschema
from referencing import Registry,Resource

BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
B=BASE/'biologie-3312-authored-operationalization-primary-source-author-successor-v3'
A=BASE/'biologie-3312-authored-source-native-independent-a-20261010-v1'
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def put(p,j):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
def bind(p):return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
entry=json.loads((B/'neutral-current3312-authored-source-and-native-one.independent-review.entry.json').read_text())
first=json.loads((A/'3312-current-source-native.independent-a.actual-FIRST.json').read_text())
model=next(json.loads((B/'native/current3312-source-only-one/round-a/description-review-input.json').read_text())['goals'].__iter__())
paths=[A/'3312-current-source-native.independent-a.actual-FIRST.json',A/'3312-current-source-native.independent-a.pre-records.FIRST.seal.json',A/'checks/own-first-targeted-model-and-whole16-113-41.observation.actual.json',A/'checks/own-394-315-source144-150-and-normal-atlas.actual.json',A/'checks/old-raw-A7-B7-A8-B3312-block-and-AM.exact-preservation.actual.json',A/'ordinary-A1/source-primary-FIRST-and-normal-record.binding.json',A/'terminal/normal-current-A1-results.actual-execution.json',A/'terminal/normal-pure-atlas-and-394-315-preservation.actual-execution.json']
recordPath=next((A/'ordinary-A1/results').glob('*.records.jsonl'));runPath=next((A/'ordinary-A1/results').glob('*.run.json'))
def refs(x):
 if isinstance(x,dict):
  if all(k in x for k in ('path','sha256')):yield x
  for v in x.values():yield from refs(v)
 elif isinstance(x,list):
  for v in x:yield from refs(v)
sourceBindings=[v for v in refs(entry['neutralWholeFirstInputs'])]
for v in sourceBindings:
 assert Path(v['path']).is_file(),v['path'];assert bind(Path(v['path']))['sha256']==v['sha256']
receipt={'schemaVersion':1,'contentLicense':'CC-BY-4.0','reviewId':'biologie3312-bounded-source-native-independent-a-20261010-v1','reviewedAt':now(),'reviewer':'Codex /root/d_context_adoption','reviewAuthority':'ai_candidate','recordStatus':'candidate','independence':{'currentSourceTitleImageAuthor':False,'currentBioMaterialAuthor':False,'ownChemP26TechnicalAuthorOnly':True,'ownFIRSTBeforeHistoryAndSeparateAuthorQA':True,'currentPeerVerdictReadBeforeFIRST':False,'knownGenerationParameters':'See exact normal-run parameter artifact; undisclosed fields remain null.'},'goalId':model['goalId'],'sourceGoalId':'8229f9d4-78f9-4968-8667-0c93aba0c0d6','nativeDecision':'keep','normalDescriptionRecommendation':'none','sourceDecision':'accept_only_bounded_authored_partial_contribution','sourceContract':{'selectedOperativeCount':144,'separate150IsHistoricalComparisonOnly':True,'granularity':'authoredOperationalization','isOfficialBullet':False,'officialNumberingClaim':False,'mappingType':'partial','jurisdiction':'DE-HE','courseProfile':'LK','exactPrimaryStand':'01.08.2025','physicalPageCount':49,'actualPrimaryPhysicalPagesReviewed':[2,38,40],'sourceLocatorPhysicalPage':40,'verifiedContribution':'The unchanged supplied feedback and signalling models operationalize a bounded gene-control principle. Own actual model computations and native observations are sealed in FIRST. This is not a literal official simulation mandate.','wholeSourceOriginalApproved':False,'fullQ15Approved':False,'wholeCourseApproved':False,'developmentalStagesOrganismsHoxTelomeresCovered':False,'courseLegalHoldsClosed':False},'ordinaryNative':{'goalFingerprint':model['goalFingerprint'],'pageFingerprint':model['pageFingerprint'],'actualFullHTMLAndPDFFirstInspected':True,'normalRecord':bind(recordPath),'normalRun':bind(runPath),'campaignA':entry['normalIndependentCampaignA'],'normalResultValidation':'actual EXIT0 valid1'},'unchangedMaterials':{'whole12ProfilesAnd24Cases':True,'whole16OriginalDuties':16,'originalPartnerEdges':113,'originalPartnerBodies':41,'other143OperativeSourceBodiesExact':True,'other149SeparateHistoricalSourceBodiesExact':True,'originalOldQ15PassageRetainedAsDerivedHistory':True,'whole394PagesExact':True,'protected315PageAndSourceScienceDeltaIds':[],'sevenPriorDPerRoundRawBytesRetained':True,'oldAMRowsAndTwoWholeCurrentPModelsRetained':True,'oldA8KEEPandB7KEEPandB3312SourceBLOCKNotRelabelled':True,'newWholePAMVReviewClaim':False},'retainedPHumanStatus':{'contract':'positive-understanding-evidence-v2','evidenceLevel':'E1','maximumClaimScope':'G1','status':'needs_human_review','authority':'ai_candidate','actualLearnerEvidence':False,'humanApproval':False,'humanTrial':False},'newFindings':[],'openBoundaries':first['openBoundaries'],'ownActualProofs':[bind(p) for p in paths],'wholeCurrentInputsExact':sourceBindings,'newScientificStrictCompletions':0,'restoredActiveBindings':0,'strictGain':0,'activeWrites':False,'historicalWrites':False,'formalSourceAdoptionPerformed':False}
put(A/'3312-current-source-native.independent-a.targeted-remediation.receipt.json',receipt)
(A/'README.md').write_text('# Biologie 3312: unabhängige gezielte Quellen-/Native-Prüfung A\n\nDie eigene vollständige FIRST ist vor separater Autoren-QS und aktuellen Peerurteilen versiegelt. Die tatsächlich heruntergeladene offizielle HE-Quelle (Stand 01.08.2025, 49 Seiten) trägt einen begrenzten LK-Prinzipbeitrag. Die neue Quellzeile 8229 ist eine eigene Operationalisierung; die Bindung zu 3312 bleibt partial. Keine vollständige Quellen-, Kurs-, Entwicklungsphasen-, Hox-, Telomer- oder Q1.5-Freigabe.\n\nDie ganze aktuelle HTML-/PDF-Seite erhält KEEP; ein normaler A1-Record/Run wurde mit dem unveränderten Kampagnenprüfer tatsächlich validiert (EXIT0, valid1). Unveränderte sieben D-Zeilen je alter Runde und die alte A8-/B7-/B3312-BLOCK-/AM-Historie bleiben bytegleich erhalten. Die eigene mechanische Prüfung bestätigt zwei normale, ausschließlich im Speicher berechnete Atlasstände, genau 143/149 unveränderte andere Quellkörper, 394 bytegleiche Seiten und keine betroffenen 315 geschützten Abschlüsse.\n\nAktuelle P-v2-Nachweise bleiben E1/G1, needs_human_review und ai_candidate. Neue fachliche Abschlüsse: 0. Wiederhergestellte aktive Bindungen: 0. Netto: 0. Keine aktiven Änderungen, keine menschliche Freigabe und keine Erprobung.\n')
put(A/'neutral-current3312-independent-a-result.entry.json',{'schemaVersion':1,'role':'independent_targeted_source_native_review_A_inactive_candidate','authorNeutralEntry':bind(B/'neutral-current3312-authored-source-and-native-one.independent-review.entry.json'),'authorFrozenInputs':bind(B/'author.final.freeze.json'),'ownFIRST':bind(A/'3312-current-source-native.independent-a.actual-FIRST.json'),'ownPreRecordsSeal':bind(A/'3312-current-source-native.independent-a.pre-records.FIRST.seal.json'),'actualTargetedReceipt':bind(A/'3312-current-source-native.independent-a.targeted-remediation.receipt.json'),'ordinaryResultsDirectory':str(A/'ordinary-A1/results'),'currentNormalRecord':bind(recordPath),'currentNormalRun':bind(runPath),'wholeCurrentPrimary':bind(A/'primary/HE-current-official-whole.actual-independent-download.pdf'),'sourceReviewBoundary':'bounded authored partial contribution only; whole source and course holds preserved','strictGain':0,'humanApproval':False,'activeWrites':False})
spec=importlib.util.spec_from_file_location('normal_validate_schemas','scripts/validate_schemas.py');normal=importlib.util.module_from_spec(spec);spec.loader.exec_module(normal)
schema=json.load(open('docs/landscape-runtime.schema.json'))
reg=Registry();contracts={}
for p in Path('contracts').rglob('*.schema.json'):
 j=json.loads(p.read_text())
 if '$id' in j:
  contracts[j['$id']]=j;reg=reg.with_resource(j['$id'],Resource.from_contents(j))
parsedJson=0;parsedJsonl=0;closedRows=0;errors=[]
for p in sorted(A.rglob('*')):
 if p.is_symlink():errors.append('symlink:'+str(p));continue
 if not p.is_file():continue
 if p.suffix=='.json':
  parsedJson+=1
  if not normal.validate_file(str(p),schema):errors.append('normalJSON:'+str(p))
  j=json.loads(p.read_text());sid=j.get('$schema') if isinstance(j,dict) else None
  if sid in contracts:
   errors.extend(str(p)+':'+e.message for e in jsonschema.Draft202012Validator(contracts[sid],registry=reg,format_checker=jsonschema.FormatChecker()).iter_errors(j))
 elif p.suffix=='.jsonl':
  for n,l in enumerate(p.read_text().splitlines(),1):
   j=json.loads(l);parsedJsonl+=1
   sid=j.get('$schema')
   if sid in contracts:
    closedRows+=1
    errors.extend(str(p)+':'+str(n)+':'+e.message for e in jsonschema.Draft202012Validator(contracts[sid],registry=reg,format_checker=jsonschema.FormatChecker()).iter_errors(j))
for v in refs(receipt):
 p=Path(v['path'])
 if p.is_absolute() or '..' in p.parts or p.parts[0]=='tmp':errors.append('nonportable-authoritative-binding:'+str(p))
 if not p.is_file() or p.is_symlink():errors.append('not-regular:'+str(p))
 elif bind(p)['sha256']!=v['sha256']:errors.append('binding-mismatch:'+str(p))
syms=normal.curriculum_symlink_errors();ownSyms=[x for x in syms if str(A) in x or str(B) in x];errors.extend(ownSyms)
assert not errors,errors
put(A/'checks/normal-scoped-schema-json-jsonl-and-portability.actual.json',{'schemaVersion':1,'checkedAt':now(),'normalSchemaLoader':bind(Path('scripts/validate_schemas.py')),'parsedOwnJSONFiles':parsedJson,'parsedOwnJSONLRows':parsedJsonl,'closedContractRowsValidated':closedRows,'ordinaryA1ValidatorAlsoPassed':True,'ownAndAuthorScopedCurriculumSymlinkErrors':ownSyms,'authoritativeBindingErrors':[],'unknownSamplingParametersRemainUnknown':True,'fullRepositorySchemaOrCIPassClaim':False,'humanApproval':False,'strictGain':0})
print(json.dumps({'ownJSON':parsedJson,'ownJSONLRows':parsedJsonl,'closedContractRows':closedRows,'scopedSchemaErrors':errors,'source':'bounded partial only','nativeKEEP':1,'strictGain':0},indent=2))
