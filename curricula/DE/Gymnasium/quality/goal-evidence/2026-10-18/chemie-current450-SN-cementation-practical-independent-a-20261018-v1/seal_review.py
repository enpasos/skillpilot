# SPDX-License-Identifier: Apache-2.0
import json,hashlib,copy,subprocess
from pathlib import Path
from datetime import datetime,timezone
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
P=BASE/'chemie-current450-SN-cementation-practical-author-20261018-v1'
OUT=BASE/'chemie-current450-SN-cementation-practical-independent-a-20261018-v1'
OUT.mkdir(exist_ok=True)
used={};checks=[]
def pin(path):
 p=Path(path);b=p.read_bytes();r={'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)};used[str(p)]=r;return r
def read(path):pin(path);return json.loads(Path(path).read_text())
def ck(n,p,detail=None):checks.append({'check':n,'pass':bool(p),'detail':detail})
def dump(name,obj):
 f=OUT/name;f.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');json.loads(f.read_text())
def at(o,p):
 for k in p.strip('/').split('/')if p else[]:o=o[int(k)]if isinstance(o,list)else o[k]
 return o
def sem(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
common={'role':'INDEPENDENT_INFORMED_COMPONENT_REVIEWER_A','active':False,'reviewAuthority':'ai_candidate','humanApproval':False,'blindDVote':False,'nativeDClaim':False,'nativeVClaim':False,'M7Claim':False,'assessmentReleaseClaim':False,'actualLearnerPerformanceRecorded':False}
pin('AGENTS.md')
seal=read(P/'SEAL.author-candidate.pending-independent-review.json')
print('AUTHORSEALKEYS',list(seal))
for f in sorted(P.rglob('*')):
 if f.is_file():pin(f)
originalauthorpins=read(P/'inputs/final-current-and-original-input-pins.json')
bad=[]
for d in originalauthorpins['pins']:
 a=pin(d['path'])
 if a!=d:bad.append({'expected':d,'actual':a})
ck('Exact bound current/original author inputs preserved',not bad,{'pins':len(originalauthorpins['pins']),'failures':bad})
canonical=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
cm={g['id']:g for g in canonical['goals']}
inventory=read(P/'INVENTORY.gap-and-reuse-decision.pending.json')
reuse=read(P/'inputs/whole-current-reuse-candidates-and-P.EXACT.json')
ck('All20 retained whole goal bodies equal current canonical',all(cm[g['id']]==g for g in reuse['goals']))
ck('All19 whole selected current P records exact',all(json.loads(Path(r['recordPath']).read_text().splitlines()[r['line']-1])==r['record'] for r in reuse['wholeSelectedPRecords']))
for r in reuse['wholeSelectedPRecords']:pin(r['recordPath'])
discovery=read(P/'inputs/current450-P-discovery-provenance.EXACT.json')
cache={};records={}
for r in discovery['selectedRecords']:
 path=r['recordPath']
 if path not in cache:pin(path);cache[path]=[json.loads(x)for x in Path(path).read_text().splitlines()if x.strip()]
 z=cache[path][r['line']-1];records[r['goalId']]=z
ck('450 discovery selected current record identities exact',len(records)==450 and all(records[r['goalId']]['goalId']==r['goalId'] for r in discovery['selectedRecords']))
e81='e81a4aed-9695-533e-8eb7-7a0c714346ea';newid='ce0dae03-4dfe-5265-aeb3-1590cfd73d66'
ck('Missing e81 is real inventory omission, not absent current carrier',e81 in records and e81 in cm and e81 not in {g['id']for g in reuse['goals']})
e81loc=next(r for r in discovery['selectedRecords']if r['goalId']==e81)
dump('INPUT.e81-current-whole-goal-and-selected-P.EXACT.json',{'canonicalPin':pin('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'goal':cm[e81],'selectedCurrentPLocator':e81loc,'wholeCurrentPRecord':records[e81]})
gc=read(P/'candidates/goals.whole-before-after.CAS.pending.json')
candidate=read(P/'candidates/landscape.after.INACTIVE.json');cp=read(P/'candidates/P.one-whole-profile.pending.jsonl')
mem=copy.deepcopy(canonical)
for r in gc['records']:
 if r['before'] is None:
  ck('New candidate ID absent current, exact ce0dae identity',r['goalId']==newid and newid not in cm);mem['goals'].append(r['after'])
 else:
  ck('Whole goal before CAS '+r['goalId'],at(canonical,r['pointer'])==r['before']);mem['goals'][int(r['pointer'].rsplit('/',1)[1])]=r['after']
ck('Whole candidate landscape reproduced only by declared CAS',mem==candidate)
ck('New P retains required min2,fresh,independent and all3expectations',cp['profile']['coverageExpectations']=={'requiredExpectationIds':['own-safe-controlled-execution','own-observations-and-controls','redox-interpretation-and-independent-transfer'],'alternativeExpectationGroups':[],'minimumIndependentDemonstrations':2,'freshVariationRequired':True,'independentTransferRequired':True})
pcas=read(P/'operations/P.one-whole-before-after.CAS.pending.json');ck('P CAS body exactly matches whole new P',pcas['before']is None and pcas['after']==cp)
sources=read(P/'operations/source.two-existing-contributions.whole-CAS.pending.json');scur=read(sources['input']['path']);safter=copy.deepcopy(scur)
for op in sources['operations']:
 ck('Whole source before CAS '+op['pointer'],at(scur,op['pointer'])==op['before'])
 par,key=op['pointer'].rsplit('/',1);at(safter,par)[int(key)]=op['after']
 if par=='/mappings':ck('Only plastic mapping replaced with narrow partial newID '+key,op['before']['canonicalGoalId']=='8721d943-8368-5304-bd3c-7d7944099662' and op['after']['canonicalGoalId']==newid and op['after']['matchType']=='partial')
 if par=='/decisions':ck('All9 other source IDs preserved, historical reviewer removed '+key,[x for x in op['after']['canonicalGoalIds']if x!=newid]==[x for x in op['before']['canonicalGoalIds']if x!='8721d943-8368-5304-bd3c-7d7944099662']and'reviewer'not in op['after']and'reviewedAt'not in op['after'])
ck('Source original exact inputfile guard',pin(sources['input']['path'])==sources['input'])
v=read(P/'operations/views.two-whole-CAS.pending.json')
for row in v['wholeViewBeforeAfter']:ck('Whole SN view before exact '+row['viewId'],read(row['path'])==row['before'])
compiled=read(OUT/'CHECK.actual-independent-41-view-compilation.json')
ck('Actually executed independent compiler:41views,2newSNtargets,no oldrole/parent changes',len(compiled['rows'])==41 and not compiled['failures'])
snrows=[r for r in compiled['rows']if r['viewId']in['de-sn-gym-chemistry-gk','de-sn-gym-chemistry-lk']]
ck('Existing e81 already target in both actual native SN projections',len(snrows)==2 and all(r['existingE81BeforeRole']=='target'for r in snrows))
empty=read(P/'materials/observation-protocol.EMPTY.DE-EN.json')
def leaves(o,p=''):
 if isinstance(o,dict):return[(q,z)for k,v in o.items()for q,z in leaves(v,p+'/'+k)]
 if isinstance(o,list):return[(q,z)for i,v in enumerate(o)for q,z in leaves(v,p+'/'+str(i))]
 return[(p,o)]
observationfields=[(p,z)for p,z in leaves(empty)if p.split('/')[1]in['localRelease','actualConditions','initialState','observations','endComparison','ownActions','returnAndDisposal','interpretation','freshPaperTransfer']and not p.endswith('/nominalTimeMin')]
ck('Every actual release/action/observation/interpretation/transfer field initially null',all(z is None for _,z in observationfields),{'fieldCount':len(observationfields)})
for n in ['cementation.learner.DE.md','cementation.learner.EN.md','cementation.teacher.DE-EN.md']:
 pin(P/'materials'/n)
bindings=read(P/'candidates/material-bindings.exact.pending.json')
ck('New whole goal and P IDs agree',cp['goalId']==newid and gc['records'][-1]['after']['id']==newid)

fetch=json.loads(Path('tmp/chemie-SN-cementation-independent-a-20261018/actual-fetch-metadata.json').read_text())
declaredsafety=read(P/'safety/PRIMARY.current-safety-sources-and-exact-pins.json')
safety=[]
paraphrases={
'ROTH-1E30':'Frisch geladenes SDB5.2de/05.08.2025 gilt für0,010mol/L-Lösung: H411/GHS09, Seitenschutz, geeignete NBR-Handschuhe mit angegebener Dicke>0,11mm und anwendungsspezifischer Prüfung. Kleine Mengen rechtfertigen keinen Ausguss; Flüssigkeiten/Spülwasser sowie kontaminierte Feststoffe sind getrennt kompatibel zu sammeln. Der SOP-Ansatz verwendet keine Feststoffzubereitung, Heizung oder Aerosolquelle. Das dokumentiert keine schulische Freigabe.',
'RiSU':'Die frisch geladene KMK-Fassung21.09.2023 bindet Gefahrstoffarbeit an vorgängige fachkundige Gefährdungs-/Substitutionsprüfung, Unterweisung, Schutz, Aufsicht und geregelte Entsorgung/Erste Hilfe. Der Kandidat behält diese lokalen Voraussetzungen, individuelle Eignung und die exakte Lehrer-Vorprobe als Verweigerungsgrenzen bei. Eine bereits erfolgte Freigabe oder landesspezifische Rechtskonformität wird nicht behauptet.',
'DGUV-PPE':'Die aktuelle DGUV-Seite verlangt risikobezogene Auswahl geeigneter Schutzmittel. Seitenschutzbrille und konkret produktgeeignete Handschuhe werden durch die SOP verbindlich; chemischer Handschutz ersetzt keine mechanische Eignung der entgrateten Eisenstücke und Pinzetten.',
'DGUV-INSTRUCTION':'Aktuelle Verhaltensregeln stützen beaufsichtigte und unterwiesene Arbeit, klare Kennzeichnung, geeignete Geräte und keine Rückgabe von Arbeitsportionen ins Vorratsgebinde. Die SOP verbietet Heim-/Alleinversuch, Eigenverschärfung, Metallbearbeitung und ungenehmigte Wiederholung.',
'DGUV-DISPOSAL':'Die aktuelle Seite fordert vorab geklärte Entsorgung und nach Gefährdung getrennte geeignete gekennzeichnete Behälter. Die SOP sammelt sämtliche Lösungen/Spülwässer und Feststoffe, vermeidet Kanalisation und belässt Endentsorgung bei Schule/Träger/Entsorger.'}
for x in fetch:
 d=next(e for e in declaredsafety['entries']if e['id']==x['id'])
 raw=Path(x['localScratch']).read_bytes()
 ck('Independent fresh raw fetch integrity '+x['id'],hashlib.sha256(raw).hexdigest()==x['sha256'])
 row={'id':x['id'],'url':d['officialOrManufacturerURL'],'resolvedURL':x['url'],'actualFreshRawSHA256':x['sha256'],'bytes':x['bytes'],'rawMatchesAuthor':x['matchesAuthorRaw'],'ownAssessmentDe':paraphrases[x['id']],'rawSourceCopiedPublicly':False}
 if x['id']in['ROTH-1E30','RiSU']:
  row['physicalPagesActuallyRead']=d['physicalPagesActuallyRead'];row['actualPageTextPins']=[]
  for page in d['physicalPagesActuallyRead']:
   txt=subprocess.run(['pdftotext','-f',str(page),'-l',str(page),'-layout',x['localScratch'],'-'],capture_output=True,check=True).stdout
   row['actualPageTextPins'].append({'physicalPage':page,'sha256':hashlib.sha256(txt).hexdigest()})
 else:row['rawDifferenceBoundary']='Fresh HTML differs in raw bytes; substantive current page was actually read. No claim of author-raw-byte identity or unsupported source change.'
 safety.append(row)
snsource=read(P/'source/SN.actual-primary-page-pins-and-own-paraphrase.json')
ck('SN original PDF exact pin',pin(snsource['pdf']['path'])==snsource['pdf'])
sourcepages=[]
for page in [14,43,56]:
 txt=subprocess.run(['pdftotext','-f',str(page),'-l',str(page),'-layout',snsource['pdf']['path'],'-'],capture_output=True,check=True).stdout
 sourcepages.append({'physicalPage':page,'actualTextSHA256':hashlib.sha256(txt).hexdigest(),'fullPageCopiedPublicly':False})
dump('PRIMARY.actual-independent-live-safety-and-SN-readings.json',{**common,'fetchedUTC':datetime.now(timezone.utc).isoformat(),'currentSafetySources':safety,'originalSN':{'pin':snsource['pdf'],'officialURL':snsource['officialURL'],'actualPages':sourcepages,'ownParaphraseDe':'Original14definiert SE als Schülerexperiment und benennt verpflichtende eigene Versuche.43(GK12)/56(LK12) nennen elektrochemische Fällung/Zementation; benachbarte Elektrolyse und Spannungsmessung bleiben eigene Leistungen.'},'noFullPageTextOrOfficialPDFRedistributed':True})

decisions=[
('inventory-and-new-atom-necessity','revise','Das Autoreninventar20/19 lässt den bereits im früheren SN-HOLD benannten e81 ganz aus. Die aktuelle ganze Kompetenz verlangt eine angeleitete sichere chemische Untersuchung zu Alltags-/Technikphänomenen, vorgegebene Variablen/Schritte, eigene Beobachtung oder Messung und Hypothesenprüfung. Das aktuelle ganze P enthält bereits echte Durchführung, eigene Rohdaten, Kontroll-/Störgrößenprüfung und konkrete scoped ST-MgO-/MV-Säurepflichten. e81 ist SN-anwendbar und tatsächlich in beiden SN-GK/LK-Projektionen bereits target. Der neue angeleitete Fe/Cu-Vergleich passt in diesen Operator; das bislang fehlende konkrete Zementationsmaterial verlangt einen ehrlich gebundenen SN-J12-P-/Materialnachfolger, beweist jedoch keinen neuen generischen Praxisoperator. Spezifische Redoxrollen/Deutung können zusätzlich04fa/16da tragen. Neue IDce0 und Nennererhöhung sind deshalb als notwendig noch nicht belegt. Ganze bestehende e81-P-Pflichten erhalten und reale SN-Zementation als zwingenden scoped Praxisnachweis ergänzen; frühere allgemeine e81-Mastery oder Papierantworten belegen keine später tatsächlich ausgeführte Zementation.'),
('cc803-genuine-counterexample','accept','Der ganze aktuelle cc803-Körper und seine erforderliche e4 sind echte eigene Zn/Cu-Thermometrie, kein Papierexperiment. Sie verlangen aber zusätzlich Temperatur-Zeit-Kurve, Wärmekapazität, Wärme-/Umsatzauswertung und weitere unabhängige Energietransfers; der aktuelle Scope ist BB/BE/BY/HE. Ein notwendiger positiver Metallabscheidungs-/Kontrollbefund ist nicht der Mindestbeleg dieser e4. Ganzes Ziel nach SN zu verpflichten würde Thermometrie hinzufügen. Dieses Gegenargument ist berechtigt, ersetzt jedoch nicht die fehlende e81-Prüfung.'),
('new-goal-and-P-atomicity-in-isolation','accept_with_new_ID_disposition_revise','Die angeleitete Durchführung mit eigenen Kontrollbeobachtungen, Protokoll und zugehöriger Erklärung ist eine kohärente Untersuchung. Die neue isolierte D/P-Fassung verwechselt Theorie/Beobachtung/Durchführung nicht; min2/fresh/independent bleiben verbindlich, ohne zweiten Pflichtversuch. Akzeptanz der isolierten Routine belegt wegen e81 nicht die Notwendigkeit einer neuen ID.'),
('Fe-Cu-SOP-and-current-safety-basis','accept_candidate_material_only','5,0mL0,010M-CuSO4 jeA/B, bekanntes blankes entgratetes Eisen, WasserkontrolleC und15min unbeheizter Vergleich passen fachlich zusammen. Die Stoff-/Mengenform vermeidet eigenständiges Feststoffansetzen, Pulver, Säurereinigung, Erwärmung und äußere Stromquelle. Aktuell selbst geladene RiSU/DGUV/Roth-Primärquellen stützen die beschriebenen Schutz-, Stopp- und Abfallgrenzen. Die Lehrkraft muss vor Freigabe gerade den genauen Eisenstock/Gefäß-/Zeit-Vergleich vorprüfen; Unbrauchbarkeit bedeutet Verweigerung, keine stille Konzentrationserhöhung. Keine tatsächliche Eignungsvorprobe oder örtliche Freigabe wurde hier beobachtet.'),
('own-positive-negative-observations-and-empty-log','accept','Alle tatsächlichen Freigabe-, Handlungs-, Beobachtungs-, Auswertungs- und Transferfelder sind null; geplante Zeiten sind als nominal ausgewiesen. DE/EN verlangen eigene Kernhandlungen und eigenes A/B/C-Rohprotokoll. Tragfähige positive Abscheidungsdeutung braucht eigene Kontrolle gegen die Ausgangsoberfläche, metallfreie LösungB und Eisen/WasserC. Ein ehrlicher Null-/Fehlbefund ist Teilbeleg und schließt den fehlenden positiven Praxisanteil nicht durch vorgegebene Gleichungen oder Lehrerfotos. Sichtbare Farbe ist kein eindeutiger Element-/Reinheits-/Ausbeutenachweis.'),
('teacher-reference-and-fresh-independent-transfer','accept','Fe→Fe2++2e− und Cu2++2e−→Cu ergeben die atom-/ladungserhaltende Nettogleichung, Sulfat bleibt Zuschauer. Lehrerreferenz wird vor unabhängiger Arbeit zurückgehalten. Der frische Zn-Fall verlangt neue Rollen/Gleichung und fehlende reale Evidenz; Potenziale belegen weder Geschwindigkeit noch Ausbeute. Belag in metallfreiemB nach Trocknung wird korrekt gegen Kristallisation/Kontamination und ungleiche Bedingungen geprüft. Kein Papiertransfer ersetzt reale Eigenhandlung.'),
('two-source-CAS-and-41-view-roles','technical_exact_but_revise_new_ID_route','Die vier genauen Source-CAS-Beforeobjekte passen zum aktuellen Stand; nur die beiden sachfremden8721-Plastikbeiträge werden jeweils durch einen neuen partiellen Praxisbeitrag ersetzt, neun andere Eingabebeiträge werden erhalten ohne Freigabe. Alle41Sichten wurden unabhängig tatsächlich mit dem unveränderten Produktionscompiler geprüft: ce0 wird genau in SN-GK/LK target, keine alte Rolle/Elternposition geht verloren. Zugleich ist e81 schon in beiden target. Wegen der unbelegten ID-Notwendigkeit sind Source-/Sicht-/Root-/P-CAS vor Integration auf den geprüften Wiederverwendungsweg neu zu erstellen; diese technisch korrekten ce0-CAS werden nicht fachlich aktiviert. Mit anderen Quellenkorrekturen ist eine frische gemeinsame CAS-Komposition erforderlich.'),
('SN108-aluminium-and-release-boundaries','HOLD','Die separate Aluminium-Eigenschafts-/Einsatz-/Verpackungsrecyclingpflicht des amtlichen Wahlbereichs bleibt offen. Dieses Material schließt weder sie noch benachbarte Elektrolyse-/Messpflichten. Reale lokale Risiko-/Substitutionsprüfung, konkrete Vorprobe, Freigabe, Aufsicht und tatsächliche Schülerdaten bleiben Ausführungsvoraussetzungen; keine nativeD/V-, Assessment-, Human- oder M7-Freigabe.')]
dump('FIRST.component-decisions.independent-a.json',{**common,'overallDecision':'revise_new_atom_necessity_and_retarget_CAS_with_e81_whole_P_reuse','authorPackage':str(P),'newGoalIdUnderReview':newid,'components':[{'component':c,'decision':d,'reasonDe':r}for c,d,r in decisions],'blockingFindings':[{'id':'A-01','component':'inventory-and-new-atom-necessity','requiredRemedy':'Whole current e81 operator/P/scoped-case route and existing SN target placements must be adjudicated. Prepare an honest SN-J12 e81 P/material successor retaining all current duties and actual own positive controlled precipitation evidence, with separate04fa/16da theoretical contributions. No newID unless a remaining concrete semantic gap is demonstrated.'}],'reviewMethod':'Informed independent science/component review. The parent supplied a critical e81 inventory hint during review; current whole canonical goal, actual selected wholeP and native views were independently inspected. No other new peer QA bodies opened; not a blindD vote.','noSafetyFaultInvented':'The found blocker concerns semantic reuse and source/CAS design. The SOP safety-material design is separately accepted at candidate level with its real local pretest/release limits.'})
ck('No bounded technical execution failures',all(c['pass']for c in checks))
dump('CHECKS.bounded-actual-CAS-current-bodies-and-empty-log.json',{**common,'checks':checks,'failures':[c for c in checks if not c['pass']],'normalFilesWritten':0,'globalChecksRun':False})
dump('INPUTS.exact-actually-used-pins.json',{**common,'baseGitCommit':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'pins':sorted(used.values(),key=lambda r:r['path']),'rawPrimarySourceReproduction':'Fresh official/manufacturer URLs and hashes are in PRIMARY; full PDFs/HTML remain ignored scratch only and are not public review-package dependencies.','newPeerQABodiesRead':False})
(OUT/'README.md').write_text('''# Unabhängige Komponentensicht A: SN-Zementation

**REVISE für Inventar, Neuatom-Notwendigkeit und die darauf aufbauenden ce0-CAS.** Das vorhandene e81-Ziel wurde im Autoreninventar ausgelassen. Sein ganzer aktueller Operator und P enthalten echte angeleitete Durchführung mit eigenen Rohdaten und bereits scoped Pflichtversuche; es ist in beiden SN-GK/LK-Sichten bereits target. Ein gebundener SN-J12-P-/Materialnachfolger dort plus vorhandene Redoxträger ist deshalb vor einer neuen ID konkret zu prüfen. Eine bloß bislang fehlende SOP belegt keine neue Kompetenz. Das echte cc803-Thermometrie-Gegenbeispiel wurde vollständig berücksichtigt und erzwingt keine zusätzliche Thermometriepflicht.

**Kandidatenkörper fachlich bestätigt:** DE/EN-SOP mit aktuellem Hersteller-/RiSU-/DGUV-Abgleich, Lehrerreferenz, vollständig leeres Rohprotokoll, eigene positive/negative Kontrollbefunde und unabhängiger frischer Transfer. Der Praxisanteil kann durch Papierdaten nicht ersetzt werden. Eine reale Vorprobe mit genau den gewählten Stoff-/Gefäß-/Zeitbedingungen und örtliche Freigabe bleiben erforderlich und werden nicht behauptet.

Die41Sichten wurden unabhängig tatsächlich mit dem Produktionscompiler geprüft; die vorgeschlagenen neuen Rollen sind technisch konsistent. Das ist keine inhaltliche Notwendigkeitsfreigabe der neuen ID. Alle ursprünglichen Quellen-/Material-/P-/Reviewdateien bleiben unverändert; keine Normalaktivierung, Bilder, Fullchecks oder nativeD/V-/Assessment-/M7-/Humanfreigabe. SN108 Aluminium bleibt HOLD.

Die konkreten Gründe stehen in `FIRST.component-decisions.independent-a.json`, aktuelle Primärquellen- und Seitenpins in `PRIMARY.actual-independent-live-safety-and-SN-readings.json`, der ganze zusätzliche e81-Gegenbeleg in `INPUT.e81-current-whole-goal-and-selected-P.EXACT.json` und die tatsächliche41-Sicht-Prüfung in `CHECK.actual-independent-41-view-compilation.json`.
''')
dump('LICENSE-and-attribution.json',{'ownScientificReview':'CC-BY-4.0','technicalHelpers':'Apache-2.0','primarySources':'Official/manufacturer rights retained; no full primary text redistributed.'})
for name in ['compile_readonly.mts','seal_review.py']:(OUT/name).write_bytes(Path(__file__).with_name(name).read_bytes())
outputs=[]
for f in sorted(OUT.iterdir()):
 if f.is_file()and f.name!='SEAL.independent-a.json':outputs.append(pin(f))
dump('SEAL.independent-a.json',{**common,'sealedUTC':datetime.now(timezone.utc).isoformat(),'decision':'revise_new_atom_necessity_and_retarget_CAS_with_e81_whole_P_reuse','blockingScientificFindingCount':1,'actualIndependentCompiledViews':41,'boundedTechnicalFailures':[c for c in checks if not c['pass']],'outputPins':outputs,'normalFilesWritten':0,'globalChecksRun':False,'newPeerQABodiesRead':False})
print(json.dumps({'decision':'revise','blockingFinding':'e81 missing whole-carrier reuse adjudication; newID necessity not established','technicalFailures':[c for c in checks if not c['pass']],'sealSHA256':pin(OUT/'SEAL.independent-a.json')['sha256'],'out':str(OUT)},ensure_ascii=False,indent=2))
