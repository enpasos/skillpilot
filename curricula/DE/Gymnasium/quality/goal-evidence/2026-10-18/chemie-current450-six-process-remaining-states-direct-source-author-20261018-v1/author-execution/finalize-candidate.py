import json,hashlib,shutil,re
from pathlib import Path
from collections import Counter
from datetime import datetime,timezone
ROOT=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file())
OUT=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-six-process-remaining-states-direct-source-author-20261018-v1'
def read(p):return json.loads((OUT/p).read_text())
def write(p,x):(OUT/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def pin(p):
 p=Path(p);p=p if p.is_absolute() else ROOT/p;b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def bodyhash(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def copy(src,dest):
 p=OUT/dest;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/src,p);assert p.read_bytes()==(ROOT/src).read_bytes();return pin(p)
assert not (OUT/'SEAL.inactive-sixty-pair-source-author.json').exists()
sources=read('INPUT.whole-selected-operative-and-new-source-cells.json');byid={r['wholeSourceGoal']['id']:r for r in sources}
rows=read('MATRIX.sixty-current-goal-country-direct-source-author.json');inputs=read('INPUT.six-whole-current-goals-and-P.exact.json');bygoal={r['wholeGoal']['id']:r for r in inputs}
maps=read('CANDIDATE.partial-mapping-contributions.pending-independent-review.json')
for r in rows:
 r['currentProfileBodySha256']=bodyhash(bygoal[r['goalId']]['wholeProfile'])
 r['profileHashSerialization']=r['goalHashSerialization'].replace('complete native goal','complete native profile')
 for e in r['individualSourceDeltas']:
  s=byid[e['sourceGoalId']];g=s['wholeSourceGoal'];code=g.get('metadata',{}).get('officialStandardCode') or g.get('metadata',{}).get('localLocatorLabel') or ''
  e['wholeSourceLocator']={'path':str((OUT/'INPUT.whole-selected-operative-and-new-source-cells.json').relative_to(ROOT)),'arrayIndex':sources.index(s),'field':'wholeSourceGoal'}
  e['wholeOperatorText']=s['actualPrimaryWording'];e['physicalPrimaryPage']=s['physicalPdfPage'];e['primaryPdf']=s['primaryPdf'];e['operativeSourceCell']=s['baseExtraction'];e['sourceStageCourseBoundary']=s['stageCourseBoundary']
  text=g['sourceText'].lower()
  key=next(k for k,v in [('arguments','431a'),('dataQuality','4aa3'),('sources','5b1b'),('hypothesisData','7d9f'),('documentation','9fc8'),('symbols','e7c3')] if r['goalId'].startswith(v))
  if key=='sources':
   if 'recherch' in text:contrib='Der vollständige Recherche-/Auswahloperator verlangt hier die bereits vorhandene bedingte eigene Rechercheroute verbindlich: selbst suchen/navigieren, öffnen/lesen, begründet auswählen und konkret belegen. Vorgegebene S/T-Quellen allein reichen dafür nicht.'
   elif code=='K2':contrib='Informationsauswahl und Erschließung werden an S/T-Texten, Mengen-/Eigenschaftstabellen und Prozessdarstellungen überprüft. Die neue Mehrwegfrage verlangt neue relevante Informationen und eine begrenzte Deutung; nicht jede denkbare komplexe Repräsentation ist damit belegt.'
   elif code=='K5':contrib='Die Auswahl ändert sich ausdrücklich zwischen jüngerer Klasse, Hausmeisterteam und Schülerzeitung. Diese konkrete sach-/adressaten-/situationsbezogene Auswahl trägt den Teiloperator; eine tatsächliche öffentliche Präsentation bleibt offen.'
   elif code=='K8':contrib='Chemische Erklärung, Modellzahlen, Sicherheit und fehlende Kreislaufinformation werden strukturiert getrennt und zu begrenzten Schlüssen verarbeitet. Eine reine Quellenliste ohne eigene Interpretation genügt nicht.'
   else:contrib='Der wörtliche Informations-/Strukturierungs-/Adressatenanteil trägt die Auswahl und Aufbereitung der S/T-Quellen für den neuen Adressaten. Beim SL-Definitionstext werden argumentativer sozialer Austausch und gesamte Kommunikationskompetenz ausdrücklich nicht beansprucht; Recherche wird daraus nicht erfunden.'
  elif key=='documentation':contrib='Nachvollziehbare Protokollierung mit Einheiten, Herkunft, Bedingungen und sichtbaren fehlenden Angaben ist der direkte Teilbeitrag. Die neue Verdünnungskorrektur erhält Rohdaten und dokumentiert die Ableitungsänderung. Die Quelle wird nicht auf ihre Protokollwörter gekürzt: eigene Gewinnung, sicheres Durchführen oder Präsentieren im ganzen Satz bleiben zusätzlich offen.'
  elif key=='symbols':contrib='Nur der tatsächliche Elementzeichen-/elementare Formelanteil wird gebunden: NH3 sowie Index/Koeffizient und korrekte Zeichenform. Der ganze amtliche Kontext und sein Einblick-/Stufenanspruch bleiben sichtbar; weitere Substanzen, Diagramme, Reaktionsschemata und gesamte Fachsprache sind nicht abgedeckt. Bei HB/MV ist die Formelverwendung erst im ganzen gelesenen Kommunikationskapitel ausdrücklich verankert.'
  elif key=='arguments':contrib='Eigene belegte Gründe, Vergleich vorgegebener Gründe und erneute Gewichtung anhand veränderter Energie-/Grenzwertdaten tragen den Argumentations-/Abwägungsanteil. B5 bzw. die SL-Definition werden nicht auf Abwägen verkürzt: eigenständige Bildung aller Handlungsoptionen, ethische Folgen und reales Handeln bleiben offen.'
  elif key=='dataQuality':contrib='Die Route begründet Kreuzreaktion, Kontrollen und Temperatur-/Matrixeinfluss und grenzt erlaubte Schlüsse ein. Für NI trägt nur das Beschreiben/Deuten von Datenabweichungen; für BW die Aussagekraft der vorliegenden Darstellung; für ST/SL der konkrete Methoden-/Erkenntnisgrenzenanteil. Keine universelle Fehlerrechnung oder tatsächlich ausgeführte Messung.'
  else:
   if r['jurisdiction']=='DE-SL':contrib='Die direkte Teilbeziehung ist ausschließlich die tatsächliche Unterscheidung von Versuchsablauf, beobachtenden Angaben und erklärender Deutung am Datenfall. Ein ganzer eigener Hypothesentest oder eine Durchführung wird aus diesem Quellenbullet ausdrücklich nicht behauptet.'
   elif r['jurisdiction']=='DE-ST':contrib='Der Q-Spaltenoperator trägt die beschreibende/reflectierende Auswertung des gegebenen Erkenntnisprozesses und seiner begrenzten Schlüsse. Der missverständlich gesellschaftsbezogene EP-Datenbullet wurde dafür nicht isoliert oder umgeschrieben. Keine vollständige selbst ausgeführte experimentelle Methode und kein ganzer Q-Standard.'
   else:contrib='Die vorhandene Tabellen-/Trendinterpretation und neue 50°C- bzw. Leitfähigkeitsdaten verlangen begründete Stützung oder Revision der Hypothese. Theoriebezug bleibt am Datenfall konkret. Eigene Datenerhebung und vollständige Hypothesenerzeugung werden nicht nachträglich behauptet.'
  e['operatorSpecificAuthorRationaleDe']=contrib
  e['noWholeSourceCredit']=True
write('MATRIX.sixty-current-goal-country-direct-source-author.json',rows)
for m in maps['mappings']:
 r=next(r for r in rows if r['goalId']==m['canonicalGoalId'] and r['jurisdiction']==m['jurisdiction']);e=next(e for e in r['individualSourceDeltas'] if e['sourceGoalId']==m['legacyGoalId'])
 m['operatorSpecificAuthorRationaleDe']=e['operatorSpecificAuthorRationaleDe'];m['wholeSourceLocator']=e['wholeSourceLocator'];m['currentGoalSha256']=r['currentGoalSha256'];m['currentProfileBodySha256']=r['currentProfileBodySha256'];m['currentTargetViews']=r['currentTargetViews']
write('CANDIDATE.partial-mapping-contributions.pending-independent-review.json',maps)

diag=copy('tmp/chemie450-source-gate003-diagnosis/DIAGNOSIS.CQR003.existing-bindings.json','input-originals/DIAGNOSIS.CQR003.existing-bindings.byte-exact.json')
scope=read('INPUT.scope-selector-and-exclusions.exact.json');scope['diagnosisInput']=diag;scope['rawDiagnosisBoundary']='Byte-exact historical diagnosis snapshot used only for the six forwardGoals selector; its internal historical/ignored-path locators are not review inputs or new source authority.';write('INPUT.scope-selector-and-exclusions.exact.json',scope)
images=[copy(f'tmp/chemie450-process-author-primary-views/{n}.png',f'primary-reading/rendered/{n}.actual.png') for n in ['ST-p12','SN-p18']]
scripts=[copy('tmp/prepare-chemie450-six-process-remaining-author.py','author-execution/prepare-candidate.py'),copy('tmp/chemie450-six-process-author-finite-view-check.ts','author-execution/check-only-sixty-view-pairs.ts'),copy('tmp/finalize-chemie450-six-process-remaining-author.py','author-execution/finalize-candidate.py')]
receipt=read('RECEIPT.actual-primary-reading-and-author-execution.json');receipt['actualViewImage']=images;receipt['additionalOriginalReadsNotUsedAsAnchors'][0]='NI upper PDF3-8 search/context reading only; no upper-source anchor substituted.';receipt['sourceObjectReading']='All19 selected existing operative source-goal objects read in full, including tags, spans and whole relevant primary context. All70 new complete clauses read/checked against actual full primary sections.12 cells are extraction-only contributions requested by parallel author, without mapping decisions on his goals.';receipt['finiteCurrentViewCheck']=pin(OUT/'CHECK.sixty-pairs-existing-current-views.json');receipt['actualTargetScopeFinding']='All60 pairs have an existing current target view. Three BW pairs (4aa/7d/9fc) are LK-only; their GK views are explicitly non-target.117 existing goal-view appearances across26checked views.';receipt['executionScripts']=scripts;receipt['primaryWordConformance']='All new full clauses checked as exact words/operators after declared line-wrap/soft-hyphen/list-end punctuation normalization. ST two-column clauses checked in their actual EP/Q column; actual rendered ST12 inspected. SN22 operative aspect combines table columns; actual primary parent and note are separately distinguished. SH009 original OCR cell remains exact; correct primary wording is separately supplied.';write('RECEIPT.actual-primary-reading-and-author-execution.json',receipt)

# Only finite pin/identity/serialization checks; no global checker or scientific approval is generated.
pins=read('BEFOREPINS.actual-normal-and-native-inputs.json');pins += [s[k] for s in sources for k in ['baseExtraction','primaryPdf']];pins += [v['view'] for r in rows for v in r['currentTargetViews']];pins=list({p['path']:p for p in pins}.values())
for p in pins:assert pin(p['path'])==p,p
write('BEFOREPINS.actual-normal-and-native-inputs.json',pins)
assert len(rows)==60 and Counter(r['authorDisposition'] for r in rows)=={'PROPOSE_PARTIAL':56,'HOLD':4}
assert len(maps['mappings'])==78 and len(byid)==89
assert sum(s['origin']=='NEW_INACTIVE_ADDITION' for s in sources)==70
assert all(m['matchType']=='partial' for m in maps['mappings'])
assert sum(len(r['currentTargetViews']) for r in rows)==117
for s in sources:
 if s['origin']=='EXISTING_OPERATIVE_SOURCE_CELL':assert s['wholeSourceGoal'] in json.loads((ROOT/s['baseExtraction']['path']).read_text())['sourceGoals']
 if s['origin']=='NEW_INACTIVE_ADDITION':assert s['wholeSourceGoal'] in json.loads((ROOT/s['newAdditionFile']['path']).read_text())['sourceGoalsToAppend']
for p in OUT.rglob('*.json'):json.loads(p.read_text())
assert not any(p.is_symlink() for p in OUT.rglob('*'))
check=read('CHECK.finite-author-scope-and-current-inputs.json');check['finalFinitePinsVerified']=len(pins);check['existingWholeSourceCells']=19;check['wholeSourceCellInputs']=89;check['newCompleteSourceCells']=70;check['newCellsForThese60Pairs']=58;check['additionalSharedHE_NWExtractionOnlyCells']=12;check['sourceObjectIdentityAndExistingViewsCheck']='PASS';check['actualTargetViewAppearances']=117;check['threeBW_LK_only_pairsRetained']=True;write('CHECK.finite-author-scope-and-current-inputs.json',check)
(OUT/'README.author-handoff.de.md').write_text('''# Inaktiver Quellen-Autorenkandidat: sechs Prozessziele / übrige Länder

60 bestehende Ziel-Land-Paare in13Ländern: **56 PROPOSE_PARTIAL, 4 HOLD**.78explizit partielle Quellenbeziehungen; keine unabhängige Freigabe, kein Ganzquellennachweis, keine menschliche oder Lernendenausführungsbehauptung.

HOLD: SN×431a,4aa,5b,7d. Die gelesenen allgemeinen Fachtexte und vorhandenen Inhaltszellen werden nicht in passende Einzelstandards umgedeutet. SN-Protokollierung und Symbol/Formel haben konkrete getrennte Belege.

## Prüfeinstieg

- `MATRIX.sixty-current-goal-country-direct-source-author.json`: alle60Paare, tatsächliche Views, aktuelle ganze Ziel-/Profilbindung, individuelle Operatorbeiträge und offene Pflichten.
- `INPUT.whole-selected-operative-and-new-source-cells.json`:89ganze Quellenobjekte, genaue amtliche Seiten, operative Zellpins; nicht jede Zelle besitzt eine neue Mappingbeziehung.
- `INPUT.six-whole-current-goals-and-P.exact.json`: bytegenauer vollständiger C/P-Input; aktuelle native Identität separat geprüft.
- `candidate/extraction-additions/`:11inaktive additive Transporte,70vollständige ausgewählte Quellenzellen.58dienen diesen60Paaren;9weitereHE- und3weitereNW-Zellen sind gemeinsam angefragte reine Extraktionsbeiträge für einen getrennten Autor. Keine Duplikat-ID, keine gegenseitige Autorenfreigabe.
- `CANDIDATE.partial-mapping-contributions.pending-independent-review.json`:78partielle vorgeschlagene Beiträge; **PENDING**.
- `primary-reading/`: ganze gelesene amtliche Abschnitte als tatsächlicher PDF-Text, relevante Spaltentexte und zwei tatsächlich betrachtete Renderbilder. Original-PDFs sind mit Repositorypfad/Hash gebunden.

## Grenzen

E5/Experiment-Mehrfachverben bleiben ganz; Papierdaten beweisen keine reale Durchführung. K1 verlangt auf dem tatsächlichen Rechercheweg eigene Suche, Öffnen und Lesen zusätzlich zu vorgegebenen Quellen. B5/Argumentbewertung ersetzt keine Gruppendiskussion, reale Entscheidung oder ganze Handlungsoptionenentwicklung. Symbol-/Formelanteile decken keine gesamte Fachsprache ab. SL enthält ausdrücklich unnummerierte vollständige Kompetenzdefinitionen; diese sind begrenzte Teilbeiträge und keine erfundenen nummerierten Standards. ST-EP/Q-Spalten, NW-EP/Q sowie Länder-/Kursgrenzen bleiben getrennt. Die drei BW-Paare4aa/7d/9fc sind aktuell nur im LK-View Ziele.

HE-Standards stammen ausschließlich aus current2026 (21.04.2026), nicht aus altenKC2024-Aliasverträgen. Die konkrete vorgesehene Normalextraktion steht im Transport. Alte Inhaltszellen und alte Reviews bleiben unverändert. Neue Pipeline-Metadaten zählen alte Bestände plus genau ausgewählte Zusätze; historische M3-Vollständigkeit wird auf die neuen Zellen nicht fortgeschrieben.

Die22heute registrierten Chemie-Surrogatpaare enthalten weiterhin genau6Paare innerhalb dieser sechsZiele; der während der Arbeit integrierte MV1-Fall betrifft ein anderes Ziel. Nach12BB/BE-Paaren und diesen6Registrypaaren bleiben exakt60.

## Ausführung

Nur endliche JSON-/Pin-/Zellidentitäts- und tatsächliche View-Zuordnungschecks: PASS. Keine Compiler, Builds, Schema- oder Ganzreports. Keine Normal-/Canonical-/P-/Registry-/View-Datei durch diesen Autor verändert. Paket bleibt inaktiv bis zur unabhängigen gezielten Quellen-/Bindungsprüfung. Die drei Skriptkopien dokumentieren die tatsächliche Erstellung; Ausführung aus Repositorywurzel, kein automatischer Freigabe- oder Integrationsbefehl.
''')
files=[pin(p) for p in sorted(OUT.rglob('*')) if p.is_file()]
seal={'artifactRole':'INACTIVE_FINITE_SOURCE_AUTHOR_CANDIDATE_SEAL','timestampUTC':datetime.now(timezone.utc).isoformat(),'authorMode':'informed; independent review pending','modelFamily':'OpenAI Codex, GPT-6 family','exactModelRevision':'unknown','pairDispositions':{'PROPOSE_PARTIAL':56,'HOLD':4},'partialRelations':78,'wholeSourceApprovals':0,'newIndependentApprovals':0,'files':files}
write('SEAL.inactive-sixty-pair-source-author.json',seal)
for p in OUT.rglob('*'):
 if p.is_file():p.chmod(0o444)
print(json.dumps({'seal':pin(OUT/'SEAL.inactive-sixty-pair-source-author.json'),'matrix':pin(OUT/'MATRIX.sixty-current-goal-country-direct-source-author.json'),'check':pin(OUT/'CHECK.finite-author-scope-and-current-inputs.json'),'files':len(files)+1,'finiteCheck':'PASS'},ensure_ascii=False,indent=2))
