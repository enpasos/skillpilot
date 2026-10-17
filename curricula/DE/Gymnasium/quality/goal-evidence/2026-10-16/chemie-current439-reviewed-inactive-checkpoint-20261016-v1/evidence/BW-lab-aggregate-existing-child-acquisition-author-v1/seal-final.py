import pathlib,json,hashlib,datetime
R=pathlib.Path.cwd();T=R/'tmp/chemie-m7-resumed-20261016';O=T/'BW-lab-aggregate-existing-child-acquisition-author-v1';K=T/'chemie-shared640-recycling-native-author-capsule-L6-v1'
def rd(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def put(n,d):p=O/n;p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return pin(p)
f=O/'FIRST.scientific-source-and-role-semantics.AUTHOR.frozen.json';assert sha(f)=='83ea6c8675a23928347cc06dfa624a0039a5ba3b2381bc0729aae5146ead9caa'
cas=rd(O/'CAS.two-whole-BW-views.existing-lab-aggregate-only.AUTHOR.inactive.json');ck=rd(O/'CHECK.actual-stock-collector-compiler-kind-aware-and-unique-tree.two-views.json')
for x in cas['wholeFileReplacements']:
 assert sha(K/x['targetPath'])==x['expectedCurrentSHA256']==x['beforeWhole']['sha256']
 assert sha(R/x['afterWhole']['path'])==x['afterWhole']['sha256']
for name,p in ck['pins'].items():assert sha(R/p['path'])==p['sha256']
first=rd(f);inp=rd(R/first['selectedWholeInput']['path'])
for p in [inp['canonical'],inp['semanticKinds'],inp['currentWholeProfilesSource'],inp['wholeLinkedMaterialSource'],inp['officialPrimary']]+inp['sourceRoutingInputs']+inp['actualCodeAndExistingTestSources']:
 assert sha(R/p['path'])==p['sha256'],p
for row in inp['twoActualViewsChildRefs']:assert sha(R/row['view']['path'])==row['view']['sha256']
put('CHECK.final-inputs-and-two-whole-CAS-retention.readonly.json',{'executed':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'FIRSTExact':pin(f),'allSelectedWholeInputFilesRetainedExact':True,'canonicalAndSEMRetainedExact':True,'bothCurrentL6ViewBeforeGuardsExact':True,'bothInactiveAfterFilesExact':True,'onlyAuthoredDeltaPerView':cas['wholeFileReplacements'][0]['onlySemanticDelta'],'noNormalOrCapsuleMutationPerformed':True,'scope':'Selected actual files and own package only; no full graph/CQR/APV/build executed.'})
old=[]
for row in ck['views']:
 old.append({'course':row['course'],'count':row['kindAwareAfterErrorCount'],'errors':row['preexistingKindAwareErrorsRetained']})
put('DIAGNOSTIC.preexisting-kind-aware-CPV009-retained.NOT-FULL-PASS.json',{'executed':True,'fullKindAwareCompilePASS':False,'newErrorsIntroduced':0,'exactBeforeAfterErrorSetsRetained':True,'views':old,'disposition':'Out of this finite266a package; retain as explicit current BW view issues for separate source/area-aware author planning. This package is not a waiver or full view acceptance.'})
handoff='''# BW Laboraggregat: inaktiver Autorenkandidat für fremde QS

Die fachliche Quellen-/Rollenentscheidung ist vor der Kandidatenerstellung versiegelt. Es werden genau zwei bestehende vollständige BW-CrossStage-Sichten ersetzt. Je Sicht kommt ausschließlich eine Referenz hinzu:

```json
{"kind":"canonicalSubtree","goalId":"266a2b2a-9ee2-52f6-ae09-59343da9a60b","projectionRole":"prerequisiteOnly"}
```

Die bereits einzeln sichtbaren Kinder416dfd33-8b43-5c49-903c-9847b95e4208 und13d4f336-ab16-54a7-9479-c920b458f385 bleiben jeweils genau einmal Target am gleichen sichtbaren Ort. Ihre direkten goalEntries übersteuern die geerbte Teilbaumrolle. Kein opakes curricularArea-goalEntry und kein zusätzlicher atomarer Lerngegenstand werden eingeführt. Sämtliche vorhandenen Referenzen und sonstigen Felder sind exakt beibehalten.

## Quelle und Erwerb

Die tatsächliche offizielle BW-Fassung25.03.2022 wurde in gedruckt7/9/13 gelesen;9/13 auch als tatsächliche ganze Seiten visuell. Prozesskompetenzen2.1(5)/(6) verlangen Durchführung unter Sicherheits-/Umweltaspekten, Protokollierung/Auswertung und sachgerechten Gerätegebrauch. Klasse8/9/10,3.2.1.1(4) verlangt geplante und durchgeführte Stofftrennung. Dies trägt die bestehenden grundlegenden Kinder in beiden CrossStage-Kursprojektionen. Die zwei Kompetenzen decken nicht sämtliche Prozessanforderungen, Gefahrstoffregeln oder die ganze Piktogramm-/Risikokomponente ab; eine neue vollständige Quellendeckung wird nicht behauptet. Quellen und Mappings werden nicht geändert.

Beide ganzen Kinder und der ganze Aggregatcluster, die zwei vollständigen aktuellen P-Profile, beide vollständigen DE/EN-Methoden-Material-/Lösungs-/Transfer-/Rubrikfälle sowie die beiden vollständigen DE/EN-Sicherheitsfälle wurden tatsächlich gelesen. Reale sichere Handhabung und eigenes Protokoll bleiben spätere Leistungsanforderungen. Lehrdaten und Fallkarten sind keine bereits beobachtete Lernendenhandlung. Alte P-/Bild-/Karten-/Freigaberecords werden nicht umetikettiert.

## Tatsächlich ausgeführte begrenzte Mechanik

| Prüfung | GK | LK |
|---|---:|---:|
| Stockschema vorher/nachher |0Fehler/0Fehler|0Fehler/0Fehler|
| Raw-Stockcompiler vorher/nachher |0Fehler/0Fehler|0Fehler/0Fehler|
| SEM-kind-aware Compiler vorher/nachher |12/12 bestehende CPV-009|13/13 bestehende CPV-009|
| Effektive Targetmenge vorher/nachher |182/182 exakt|190/190 exakt|
| Explizite Supportmenge vorher/nachher |1/2|1/2|
| Fehlende direkte ordinary-Rollen vorher/nachher |48/45|35/32|

Alle neu gemessenen Differenzen betreffen ausschließlich die sechs266a-Direktkontexte: fcc73fb5-7413-557f-aea3-b9692a66ee75,580b3616-f121-5d82-ac6b-fc24f145fbdc und a44af1fa-5988-5b7d-b206-691c6bbf7dd4 in GK und LK. Der komplette kompilierte sichtbare Baum bleibt exakt. Beide Kinder haben weiterhin eine sichtbare Instanz und einen Parent; Aggregat266a hat keine sichtbare Instanz. Alle übrigen fehlenden Rollen bleiben offen.

**Kein voller kind-aware Compiler-PASS:** Die25 alten CPV-009-Kontexte sind mit vollständigen IDs, Pfaden und Fehlertexten im separaten Diagnoseartefakt dokumentiert, vor/nach exakt. Dieser Kandidat führt keinen neuen Compilerfehler ein, behebt aber diese anderen opaken Bereichsreferenzen nicht. Die Fremd-QS soll den eng begrenzten266a-Eingriff gesondert beurteilen; die vollständigen BW-Sichten bleiben dadurch nicht pauschal freigegeben.

## Frontier und Aggregatmastery: Code-/Testquellen gelesen

LearnerService prüft bei direktem known requires zunächst eine explizite Target-/Supportrolle. Fehlende266a-Rolle blockiert daher aktuell auch bei vorhandener Kindmastery. Mit expliziter Aggregatrolle wird danach die reale effektive Voraussetzung geprüft: computeEffectivePrereqMastery nimmt für diesen Cluster das Minimum seiner beiden GK-getaggten Kinder. Fehlt die erforderliche Mastery eines Kindes, bleibt diese Voraussetzung unzureichend. Es werden weder erfundene Kindmastery noch ein neuer gespeicherter Aggregaterfolg geschrieben.

Support266a wird nicht zum wählbaren aktiven atomaren Lernziel, Fortschrittsziel oder zusätzlichen Sessiongegenstand. Erwerb läuft weiterhin über die bestehenden Kindtargets. Die übrigen Voraussetzungen und die normale aktuelle Frontier-Prüfung bleiben wirksam. Code und vorhandene Tests zu Teilbaumhydration, direkter Rollenspezifität und Support-/Frontiergrenzen wurden gelesen; Backendtests/Gradle wurden **nicht ausgeführt**. Die TypeScript-Stockcompiler-/Collector-Prüfung und die Schema-Prüfung wurden tatsächlich ausgeführt.

## Übergabe

CAS enthält genau zwei Before-Hashes und vollständige Afterdateien. Der gesamte Kandidat liegt ausschließlich im eigenen TMP-Verzeichnis. L6, normale Curricula,649/439- oder sonstige zentrale Reihen, Quellen, ordinary-Bodies, requires, Profile, Materialien, Karten und Bilder wurden nicht geschrieben. Keine Voll-APV, kein Native-D-Votum, keine Human-/M7-Freigabe. **Autorenkandidat bleibt inaktiv bis zur fremden QS.**
'''
# Ensure no accidentally invented denominator; current actual landscape is641/439.
handoff=handoff.replace('649/439- oder sonstige zentrale Reihen','641/439- oder sonstige zentrale Reihen')
(O/'HANDOFF.finite-two-BW-views.AUTHOR.inactive.md').write_text(handoff)
files=[pin(p) for p in sorted(O.rglob('*')) if p.is_file() and p.name not in ['MANIFEST.final.two-BW-views.AUTHOR.inactive.json','OUTPUTS.finite-two-BW-views.AUTHOR.inactive.selector.json']]
manifest=put('MANIFEST.final.two-BW-views.AUTHOR.inactive.json',{'documentType':'sealed-author-inactive-package-manifest','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authority':'AUTHOR_ONLY_PENDING_FOREIGN_QA','files':files,'totalBytes':sum(p['bytes'] for p in files),'scope':'Exactly2whole-view replacements,6 selected ordinary direct-role omissions.0 canonical/source/P/card/image mutations.','fullKindAwareCompilePASS':False,'preexistingCPV009':{'GK':12,'LK':13,'new':0}})
selector=put('OUTPUTS.finite-two-BW-views.AUTHOR.inactive.selector.json',{'documentType':'bounded-author-output-selector','authority':'AUTHOR_ONLY_PENDING_FOREIGN_QA','baseCanonicalSHA256':cas['baseCanonicalSHA256'],'baseSemanticKindsSHA256':cas['baseSemanticKindsSHA256'],'FIRST':pin(f),'guardedCAS':pin(O/'CAS.two-whole-BW-views.existing-lab-aggregate-only.AUTHOR.inactive.json'),'schemaCheck':pin(O/'CHECK.real-stock-schema.two-views.before-after.json'),'stockCollectorCompilerCheck':pin(O/'CHECK.actual-stock-collector-compiler-kind-aware-and-unique-tree.two-views.json'),'oldKindAwareErrorDiagnosis':pin(O/'DIAGNOSTIC.preexisting-kind-aware-CPV009-retained.NOT-FULL-PASS.json'),'finalInputRetention':pin(O/'CHECK.final-inputs-and-two-whole-CAS-retention.readonly.json'),'handoff':pin(O/'HANDOFF.finite-two-BW-views.AUTHOR.inactive.md'),'manifest':manifest,'wholeViewReplacements':2,'ordinaryDirectContextsRestored':6,'newOrdinaryCompletionRequirements':0,'newCompileErrors':0,'fullKindAwareViewAcceptance':False,'currentOldCPV009Retained':25,'appliedToCapsuleOrNormal':False})
print(json.dumps({'selector':selector,'manifest':manifest,'CAS':pin(O/'CAS.two-whole-BW-views.existing-lab-aggregate-only.AUTHOR.inactive.json'),'FIRST':pin(f),'packageBytes':sum(p['bytes'] for p in files)},indent=2))
