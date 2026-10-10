# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,subprocess
R=pathlib.Path('/home/enpasos/projects/skillpilot');B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');P=B/'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3';N=B/'biologie-biotechnologie-evolution-eight-current353-source-raster-native-technical-preparation-20261010-v1'
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,o):
 f=R/P/p;assert not f.exists();f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
at=read(P/'sources/final-four-book-local-execution-atlas.normal.config.json');primary=read(P/'sources/all-actual-portable-primary-bindings.json')['records'];snap={r['path']:r for r in at['sourceDocumentSnapshots']};sha={r['actualPortableExactByteCopy']['sha256']:r['actualPortableExactByteCopy'] for r in primary};rows=[];pairs=[]
ids=read(P/'images/current-KEEP-and-new-candidate-bindings.author.json')['records'];ids={r['goalId'] for r in ids}|{'8eb86a82-122d-5cae-8f80-bb2850b29c2f'}
for path in at['mappingPaths']:
 mp=read(path);ep=mp['sourceExtractionPath'];ex=read(ep);doc=ex['sourceDocument'];dp=doc.get('path');matching=snap.get(dp)
 if matching:actual=sha[matching['sha256']]
 else:
  digest='sha256:'+hashlib.sha256((R/dp).read_bytes()).hexdigest();actual=sha[digest]
 pairs.append({'mapping':ref(pathlib.Path(path)),'extraction':ref(pathlib.Path(ep)),'actualPrimaryBytes':actual,'sourceDocument':doc})
 goals={g['id']:g for g in ex['goals']};dec={g['sourceGoalId']:g for g in mp['decisions']}
 for m in mp['mappings']:
  if m['canonicalGoalId'] in ids:
   rows.append({'canonicalGoalId':m['canonicalGoalId'],'wholeLiteralSourceGoal':goals[m['legacyGoalId']],'wholeMappingRecord':m,'wholeSourceDecision':dec[m['legacyGoalId']],'wholeMapping':ref(pathlib.Path(path)),'wholeExtraction':ref(pathlib.Path(ep)),'actualPrimaryBytes':actual,'sourceDocumentMetadataOnly':doc,'newSourceApproval':False})
put('sources/all-final31-source-pairs-with-regular-primary-bundle-bindings.author.json',{'role':'author_pending_independent_source_course_review','wholePairs':pairs,'records':rows,'originalNeutral32WholeWitnesses':ref(N/'sources/current32-direct-witnesses-with-actual-primary-byte-bindings.neutral.json'),'ignoredCachedSpellingsRequired':False,'allPrimaryFilesRegular':True,'sourceCoverageCompleteClaim':False})
operator_notes={
 '523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0':'Echte Overviewaggregation von Restriktionsanalyse, PCR und Gel. Keine einzelne Atomic-Freigabe; teilweiser Cluster-Sourcepfad macht keine vollständige Quelle aus einem Atom.',
 'd11b3b18-deec-5d1a-bff6-512cddf595a2':'Echte Overviewaggregation; DNA-Transfer/Klonierung und Proteinexpression sind getrennte Produkte. BY-Transferroute führt gezielt nur528, HE-Spezifitäten bleiben ausdrücklich partial.',
 '73a3419c-09a9-5415-a3c6-d56a3cdf5a29':'Eine sequenzspezifische Spaltungs-/Fragmentfolgerung. Methoden-Quelle enthält weitere Routinen; gemeinsame Methodenclusterquelle nur partial, PCR/Gel bleiben eigenständig.',
 '374e6de5-0747-57cb-99e3-e50ccb371124':'Kompatible Signale und Wirtsbedingungen begründen rekombinante Proteinexpression. Konkreter Beitrag zum optionalen HEQ1.4-LK-Beispiel, keine universal verpflichtende LK-Behauptung und keine BY9-Transferüberschreitung.',
 '430b2b73-641a-5122-bb6d-162b0d1eaf2d':'Biologischer Fossil-/Zeit-/Verwandtschaftsoperator bleibt auf stabiler ID. BY10B10.4 biological AND culture verteilt auf430und802; einzeln ausdrücklich partial. RP-Verhalten wird nicht durch Fossilleistung abgehakt.',
 '80235254-ca58-5ba0-9319-b842350d6eb2':'Gesellschaftlich weitergegebenes Wissen verändert heutige Menschen/Umwelt; erfüllt den getrennten kulturellen Wirkungsoperator. Die BY-Ganzpflicht benötigt zusätzlich430. RP/SN/TH-Direktrouten bleiben begrenzte partielle Beiträge.',
 '7d2da9ab-aed0-562b-a99a-840825fca009':'Amtliche RP-Sek-I-TF12-Pflicht: Abstammungswissen auf ausgewähltes Verhalten wie Stressreaktion anwenden. Vorhandene Kandidaten-ID beibehalten; neues aktuelles Vollprodukt verbindet Auslöser, abstammungsbezogene Mechanismushypothese und begrenzte Funktion. Kein Sek-II/LK-Primatenersatz und kein Ganzquellenapproval.',
 'a3f483ce-126e-595c-999c-aa4d95106221':'Originale PCR-Kompetenz/wholePscience exakt. Alter HE-Gellesenoperator bleibt literal partial und gemeinsam mit Gel8eb; daraus keine volle PCR-Quellendeckung.',
 '8eb86a82-122d-5cae-8f80-bb2850b29c2f':'Geschützter Gelatom behält ganzen Zieltext, P-Fachprofil und PNG. Neue Chapterplatzierung erfordert genuine targetedD; keine neue P/V-Wissenschaftsprüfung.',
 '27b22c33-908c-5fa8-9d9f-a08aff8da143':'V2-Transfercases/profile sind exakt retained. HEQ1.4 ist optional; Beispiel istLK-Zusatz innerhalb des optionalen Themenfelds. SOURCE/P-Anteile bleiben getrennt von allgemeiner LK-Pflicht.',
 '4a8a6cec-a2cc-56fe-b3ab-7ca017f640cf':'Ganze Zellkompetenz/Materialleistung retained. Echte alte Membranpfeil-Ambiguität durch getrennte äußere Zellwand und innere Membran im aktuellen Raster korrigiert. Kein Sourceoperator erweitert.',
 '528a3cd3-4a4d-550d-939a-8dc8656446e4':'Tatsächlich gelesenes bestehendes P-Produkt umfasst plasmid-/virusvermittelte gezielte DNA-Übertragung mit clonaler Weitergabe. Wiederverwendung verhindert ein dupliziertes Klonierungsatom.'}
for goalId,note in operator_notes.items():put('sources/individual/'+goalId+'.whole-operator-rationale.author.json',{'goalId':goalId,'wholeCurrentDirectMappings':[r for r in rows if r['canonicalGoalId']==goalId],'inheritedClusterSourceWitnessesNotDirectEvidence':[r for r in rows if goalId in ['73a3419c-09a9-5415-a3c6-d56a3cdf5a29'] and r['canonicalGoalId']=='523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0'],'rationaleDe':note,'approval':False,'independentSOURCE':'PENDING','courseApproval':'PENDING'})
put('checks/source-findings-operator-performance-separation.author.json',{'RP_TF11_chancesRisks':'523+d11 theory directedges removed. Correct independent ethical products0f/5ee/f53/954 retained; theory alone does not execute argument performance.','RP_TF12_behavior':'7d2 actual ancestry-to-behavior product supplied; source/P/A/M/native independent judgments still pending.','BY10_human_AND':'430 fossil +802 culture jointly, each partial.','HE_Q1_4_optional':True,'HE_medicineUniversalLKRequiredClaim':False,'PCR_old_gel_source_role':'literal partial; joint genuine gel companion8eb; no full-PCR claim','allUnchangedLegacyRestarted':False,'SOURCE_course_approval':False,'sourcePairCount':len(pairs),'directRows':len(rows)})
print(json.dumps({'wholeSourcePairs':len(pairs),'wholeDirectRows':len(rows),'individualAuthorOperatorProducts':len(operator_notes)}))
