# SPDX-License-Identifier: Apache-2.0
"""Final finite author-only handoff, normal portability, last-write seal."""
import ast,hashlib,importlib.util,json,sys
from datetime import datetime,timezone
from pathlib import Path
sys.dont_write_bytecode=True
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix();SEAL='FILES.finite-author-successor.seal.json'
assert not (OWN/SEAL).exists()
def read(p):return json.loads((ROOT/p).read_text())
def get(p):return json.loads((OWN/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):assert bind(r['path'])==r,r['path']
def write(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
sel=get('INPUTS.exact-current560-author-successor.json');allInputs=[]
for name in ['currentNative20Selector','currentNative20Seal','currentWhole560','currentSemantic560','currentQA438','wholeOriginalAuthorSelector','wholeOriginalAuthorSeal','originalAFirstSelector','originalAFirstSeal','originalAWhole20','beforeProfiles20','beforeWhole42Cases','blankOwnRecords','originalM422','originalWholeM422Selector','originalM4Radius','originalHolds','whole560PhysicalInputMap']:
 verify(sel[name]);allInputs.append({'inputRole':name,**sel[name]})
for r in sel['completePrimarySourcesAndPartnerUnions']:verify(r);allInputs.append({'inputRole':'complete original primary/source/partner body',**r})
closure=[]
for name in ['currentNative20Seal','wholeOriginalAuthorSeal','originalAFirstSeal']:
 s=read(sel[name]['path']);rows=s['files']
 for r in rows:verify(r)
 closure.append({'seal':sel[name],'allListedOriginalFilesByteExact':True,'verifiedFiles':len(rows)})
before=read(sel['currentWhole560']['path']);after=get('candidate/canonical560.current422.two-description-successors.author.json');B={g['id']:g for g in before['goals']};A={g['id']:g for g in after['goals']}
changed=[g['id'] for g in after['goals'] if g!=B[g['id']]];assert len(changed)==2
assert {k:v for k,v in before.items() if k!='goals'}=={k:v for k,v in after.items() if k!='goals'}
assert len(A)==560 and all(A[i].get('requires')==B[i].get('requires') and A[i].get('contains')==B[i].get('contains') and A[i].get('resourceLinks')==B[i].get('resourceLinks') for i in A)
old=read(sel['beforeWhole42Cases']['path']);new=get('materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json');OB={r['id']:r for r in old['cases']};changedCases=[c['id'] for c in new['cases'] if c!=OB[c['id']]]
assert changedCases==['energy20-05-a','energy20-17-b']
for c in new['cases']:
 for field in ['criterionToObservableRubric','taskDe','taskEn','materialsDe','freshIndependentTransferDe','freshIndependentTransferEn']:assert c[field]==OB[c['id']][field]
assert {k:v for k,v in old.items() if k!='cases'}=={k:v for k,v in new.items() if k!='cases'}
rows=[json.loads(l) for l in (OWN/'candidate/twenty-raw-profiles.E0G0.material-successor.author.jsonl').read_text().splitlines()];assert len(rows)==20
assert all(r['evidenceLevel']=='E0' and r['maximumClaimScope']=='G0' and r['reviewRunIds']==[] for r in rows)
for r in get('CAS.twenty-whole-raw-author-profiles.metadata-material-bindings-only.json')['rows']:
 b=r['wholeBefore']['profile'];a=r['wholeAfter']['profile']
 for field in ['archetype','expectations','coverageExpectations','variationAxes']:assert a[field]==b[field]
 assert a['coverageExpectations']['minimumIndependentDemonstrations']==2 and a['coverageExpectations']['freshVariationRequired'] and a['coverageExpectations']['independentTransferRequired']
for name in ['checks/PROFILE20.normal-closed-schema-and-production-helper.actual.json','checks/DATA560.normal-schema-canonical-direct-contains-effective.actual.json','checks/M422.original-rows-old4-plus-new2-stales-no-refresh.actual.json','checks/BOOK321.actual-unrendered-isolated-two-description-radius.json']:assert get(name)['pass']
write('checks/READ_INVENTORY.exact-input-and-original-seal-byte-closure.actual.json',{'role':'Actual technical/content-author reads and exact closure, no independent source approval','pass':True,'inputs':allInputs,'sealedOriginalClosures':closure,'wholeAFirstReadForTwoGoalAndSeparateTwoMaterialFindings':True,'whole560LoadedAndTargetedValidated':True,'whole42CasesAnd20OriginalProfilesRead':True,'separateBReviewsRead':False,'sealedInputsWritten':False,'ownWritesOnly':REL})
holds=read(sel['originalHolds']['path']);m=get('checks/M422.original-rows-old4-plus-new2-stales-no-refresh.actual.json')
write('HOLDS.original-all-plus-six-M-text-stales.author-successor.json',{'role':'No source/course/atomicity/assessment-design hold waived by these local corrections','wholeOriginalHolds':sel['originalHolds'],'wholeOriginalHoldObject':holds,'sixCurrentMTextStales':m['totalSixStales'],'newTwoMTextStales':m['newTwoTextStales'],'originalMRows':sel['originalM422'],'originalMRowsUnchanged':True,'MHashRefreshes':0,'0773SourceAndImageOpen':True,'c21TwoIndependentLKCompetenciesAtomicityOpen':True,'e64GKPlantOilVersusLKTransesterificationCourseBoundaryOpen':True,'allOriginalOptionalInventoryAndSourcePartnerHoldsOpen':True,'newHumanLearnerLabGateIntroduced':False,'futureObservablePracticalResearchOperatorsRetained':True,'ownFictionalDataAreNotLearnerEvidence':True,'newScientificVotes':0,'nativeRebuild':False,'activeIntegration':False,'M7':False})
whole=bind(REL+'/candidate/canonical560.current422.two-description-successors.author.json');semantic=bind(REL+'/candidate/semantic560.same-decisions-two-description-source-bindings.json');cases=bind(REL+'/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json');profiles=bind(REL+'/candidate/twenty-raw-profiles.E0G0.material-successor.author.jsonl')
selector={'schemaVersion':1,'role':'Finite informed four-defect AUTHOR successor after immutable original A-FIRST. No independent review, native rebuild or integration.','originalScope20':sel['scopeGoalIds'],'wholeBefore560':sel['currentWhole560'],'wholeAfter560':whole,'semanticBefore560':sel['currentSemantic560'],'semanticAfter560':semantic,'twoWholeGoalCAS':bind(REL+'/CAS.two-whole-goals.exact-before-after.json'),'originalAFirstSelector':sel['originalAFirstSelector'],'originalAFirstSeal':sel['originalAFirstSeal'],'originalWhole20AFirst':sel['originalAWhole20'],'wholeBefore42Cases':sel['beforeWhole42Cases'],'wholeAfter42Cases':cases,'twoWholeCaseCAS':bind(REL+'/CAS.two-whole-cases.exact-before-after.json'),'whole20RawE0G0Profiles':profiles,'whole20ProfileCAS':bind(REL+'/CAS.twenty-whole-raw-author-profiles.metadata-material-bindings-only.json'),'completeWholeSourceAndPartnerInputs':sel['completePrimarySourcesAndPartnerUnions'],'originalBlankOwnRecords':sel['blankOwnRecords'],'originalWholeAuthorMaterialSelector':sel['wholeOriginalAuthorSelector'],'originalAuthorSeal':sel['wholeOriginalAuthorSeal'],'originalNative20Selector':sel['currentNative20Selector'],'originalNative20Seal':sel['currentNative20Seal'],'QA438ExactReuse':sel['currentQA438'],'images':'All original resourceLinks, physical bytes and QA438 bindings retained; no image generation or visual judgment.0773 missing image remains open.','sourceBoundFourAuthorRationales':bind(REL+'/sources/FOUR.source-bound-own-author-rationale.json'),'oldHoldsPlusSixMStales':bind(REL+'/HOLDS.original-all-plus-six-M-text-stales.author-successor.json'),'normalProfileSchemaHelper':bind(REL+'/checks/PROFILE20.normal-closed-schema-and-production-helper.actual.json'),'normalDataSchemaAndDAG':bind(REL+'/checks/DATA560.normal-schema-canonical-direct-contains-effective.actual.json'),'actualMStaleRadius':bind(REL+'/checks/M422.original-rows-old4-plus-new2-stales-no-refresh.actual.json'),'actualUnrenderedBook321Radius':bind(REL+'/checks/BOOK321.actual-unrendered-isolated-two-description-radius.json'),'actualReadInventoryAndImmutableClosure':bind(REL+'/checks/READ_INVENTORY.exact-input-and-original-seal-byte-closure.actual.json'),'wholeGoalCount':560,'ordinaryAtomicDenominator':422,'other558WholeGoalsExact':True,'other40WholeCasesExact':True,'all126RubricRowsExact':True,'all560DirectEffectiveRequiresContainsAndResourceLinksExact':True,'sourceMappingsChanged':0,'viewsChanged':0,'splitsAdopted':0,'newD':0,'newPositiveP':0,'newA':0,'newM':0,'newV':0,'MHashRefreshes':0,'newStrict':0,'lastActualMeasuredStrict':321,'lastActualDenominator':422,'nativeSuccessorPrepared':False,'centralExecuted':False,'activeIntegration':False,'humanApproval':False,'humanTrial':False,'M7':False}
write('INPUTS.final-four-defects-author-successor.selector.json',selector)
write('NEUTRAL.final-four-defects-author-successor.json',{'schemaVersion':1,'role':'Author-only targeted successor after real independent A findings; not an approval','selector':bind(REL+'/INPUTS.final-four-defects-author-successor.selector.json'),'wholeCanonical560':whole,'semanticCompanion560':semantic,'complete42Cases':cases,'whole20RawE0G0Profiles':profiles,'changedWholeGoalIds':changed,'changedWholeCaseIds':changedCases,'other558WholeGoalsExact':True,'other40WholeCasesExact':True,'all126RubricsExact':True,'originalAFirst':sel['originalAFirstSelector'],'originalAFirstSeal':sel['originalAFirstSeal'],'QA438AndAllImagesRetained':True,'oldFourPlusNewTwoMStales':m['totalSixStales'],'unchangedMeasured321BookContexts':321,'newScientificVotes':0,'newStrict':0,'sourceCourseHoldsCleared':False,'nativeSuccessorPrepared':False,'centralExecuted':False,'activeIntegration':False,'M7':False,'finiteSealPath':REL+'/'+SEAL})
(OWN/'RESUME.md').write_text('''# Vier gezielte Energie20-Autorenkorrekturen

Dieses eigene additive Paket wurde erst nach dem echten A-FIRST-Siegel und ausdrücklichem Root-Auftrag geschrieben. Es bindet dessen unveränderten ganzen Erstbefund und die aktuelle 560/422-Provenienz. Kein B-Befund gelesen und keine unabhängige Reviewerrolle für das eigene Material.

Genau zwei ganze Zielkörper:16b ergänzt im englischen Text die Bewertung der Einsatzmöglichkeiten entsprechend dem ganzen BY C12-GA8.10-Quellenkontext; Deutsch bleibt exakt. a338 präzisiert DE/EN auf reversible Brennstoffzellspannungen unter vorgegebenen Temperatur-/Aktivitätsbedingungen. Die vorhandenen ganzen Fälle12a/b trennen reversible Nernstspannung bereits von Aktivierungs-, ohmschen und Stofftransportverlusten. Kein zusätzlicher Verlustrechnungsauftrag, keine Kurs-/Quellenfreigabe.

Genau zwei ganze Fälle:05a korrigiert ausschließlich die englische verwechselte FePO4-Zustandsangabe und nennt die Lithiation zu LiFePO4 beim Entladen.17b wählt X nur unter Priorität des besser belegten Abbauverhaltens und hält fehlende aquatische Wirkungs-/Expositionsdaten für beide Produkte ausdrücklich in DE/EN offen. Abbauverhalten ist keine nachgewiesene aquatische Verträglichkeit. Alle Aufgaben, Daten, Transfers und126 Rubrikzeilen bleiben exakt;558 andere ganze Ziele und40 andere ganze Fälle ebenfalls.

Zwanzig vollständige neue Autoren-Rohprofilkandidaten bleiben E0/G0, ai_candidate, ohne Reviewruns oder positive P-Wertung. Alte Profilkörper bleiben im ganzen CAS erhalten. Die aktuellen Materialpfade/-Hashes sind transparent auf die korrigierte ganze42-Fallquelle gebunden; nur die17b-Lösung wird im Profilbrief gespiegelt. Fachliche Erwartungen, Coverage, zwei Demonstrationen, frische Variation und unabhängiger Transfer bleiben exakt. Zwei neue Beschreibungseingänge und zwei mechanische Semantic-Source-Bindungen, keine neue A-Entscheidung.

Normale Stock-Schema-/Profilhelper, canonicalAuthoring, direkte und contains-DAGs sowie alle560 effektiven Voraussetzungen bestanden/unverändert. Die isolierte ungerenderte StockBookprobe mit beidseitig P=[] hält alle321 Bestandskontexte exakt. Original-M422 bleibt unverändert: vier alte plus zwei neue Textstales(16b/a338), insgesamt sechs;416 weiterhin aktuelle Bindungen. Kein M-Fingerprintrefresh.0773 Quelle/Bild, c21 Atomarität, e64 Kursgrenze und alle übrigen alten Quellen-/Kurs-/Auswahl-/Inventoryholds bleiben offen. Keine neue Lerner-/Human-/Labor-Ausführung wird erfunden oder als Maschinen-M7-Gate verlangt.

Keine neuen Bilder, kein Host, keine native V2-Vorbereitung, kein Central/Git/CI/Runtime-/Aktivwrite. QA438 und sämtliche ResourceLinks/Bildbytes bleiben unverändert gebunden. Das alte50-Dateien-Autorenpaket und69-Dateien-Nativepaket bleiben exakt. Der ganze finale Selektor bindet komplette aktuelle Material-/Quellenkontexte und alle Vorher-/Nachher-CAS. Eigene fachliche Inhalte behalten CC-BY-4.0, technische Skripte/Metadaten Apache-2.0; externe Quellen bleiben separat attribuiert und wurden nicht als ganze Webtexte kopiert. Nach endlichem Siegel STOP.
''')
jsonCount=jsonlCount=pyCount=0
for p in OWN.rglob('*'):
 assert not p.is_symlink(),p
 if not p.is_file():continue
 if p.suffix=='.json':assert p.read_bytes().endswith(b'\n'),p;json.loads(p.read_bytes());jsonCount+=1
 elif p.suffix=='.jsonl':
  b=p.read_bytes();assert not b or b.endswith(b'\n'),p
  for l in b.splitlines():json.loads(l)
  jsonlCount+=1
 elif p.suffix=='.py':ast.parse(p.read_text(),filename=str(p));pyCount+=1
spec=importlib.util.spec_from_file_location('skillpilot_normal_validator',ROOT/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
errors=module.curriculum_symlink_errors(ROOT);assert not errors,errors
write('checks/FINAL.serialization-AST-normal-portability.actual.json',{'pass':True,'normalHelper':bind('scripts/validate_schemas.py'),'function':'curriculum_symlink_errors','errors':errors,'helperUsesReadOnlyGitDiscovery':True,'wholeJsonFilesParsedBeforeReceipt':jsonCount,'wholeJsonlFilesParsed':jsonlCount,'pythonASTFilesParsed':pyCount,'actualTerminalNewlines':True,'newVotes':0,'sealedOriginalPayloadsUnchanged':closure,'nativePrepared':False,'centralExecuted':False})
files=[bind(p.relative_to(ROOT).as_posix()) for p in sorted(OWN.rglob('*')) if p.is_file()]
seal={'schemaVersion':1,'role':'Finite final four-defect informed author successor seal, self excluded; STOP','sealedAtUTC':datetime.now(timezone.utc).isoformat(),'neutralSelector':bind(REL+'/NEUTRAL.final-four-defects-author-successor.json'),'payloadFiles':len(files),'payloadBytes':sum(r['bytes'] for r in files),'files':files,'correctedWholeGoals':2,'correctedWholeCases':2,'wholeGoals':560,'ordinaryAtomic':422,'rawE0G0Profiles':20,'newScientificVotes':0,'MHashRefreshes':0,'sourceCourseHoldsCleared':False,'newStrict':0,'nativePrepared':False,'centralExecuted':False,'activeIntegration':False,'M7':False,'STOP':True}
write(SEAL,seal)
print(json.dumps({'neutralSelector':bind(REL+'/NEUTRAL.final-four-defects-author-successor.json'),'seal':bind(REL+'/'+SEAL),'payloadFiles':len(files),'payloadBytes':seal['payloadBytes'],'normalPortabilityErrors':len(errors),'STOP':True}))
