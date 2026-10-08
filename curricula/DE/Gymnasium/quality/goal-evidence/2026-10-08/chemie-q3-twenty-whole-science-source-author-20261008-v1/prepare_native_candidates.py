#!/usr/bin/env python3
"""Prepare inactive native schemas only. Does not edit any active registration."""
import hashlib, json, re, shutil
from pathlib import Path
from datetime import datetime, timezone

R = Path('/home/enpasos/projects/skillpilot')
B = Path(__file__).resolve().parent
REL = str(B.relative_to(R))
def dump(name, obj):
    (B/name).parent.mkdir(parents=True, exist_ok=True)
    (B/name).write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n')
def sha(p): return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def stable(x): return json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',',':'))
def normal(x): return re.sub(r'\s+', ' ', str(x or '')).strip()
ids=json.loads((B/'scope20.json').read_text())
whole=json.loads((B/'whole20.current-native-goals.requires.parents.snapshot.json').read_text())
goals={r['goal']['id']:r['goal'] for r in whole}
cases=json.loads((B/'whole40.material-task-model-scoring-fresh-transfer.de-en.author-candidate.json').read_text())['cases']
now=datetime.now(timezone.utc).isoformat()
lid='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
frozen=f'{REL}/frozen-inputs/01.DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
ledger=f'{REL}/frozen-inputs/semantic-kinds.native-path-adaptation.json'
criteria='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'
shutil.copyfile(R/criteria,B/'frozen-inputs/chemistry-existing-review-criteria.md')

# The actual semantic check does not equate a leaf or a valid schema with atomicity.
reasons=[
('atomic','Eine dynamische Gleichgewichtscharakterisierung mit zwei komplementären Modellebenen; Artennachweis, konstante Zusammensetzung und gleiche Raten sind Evidenz derselben Kompetenz.'),
('atomic','Eine homogene MWG-Auswertung: Gleichung, Bilanz, Konstante und Deutung bilden eine begründete Ergebnisroutine; erweiterte LK-Quellenpflichten werden nicht allein diesem vereinfachten Ziel zugewiesen.'),
('atomic','Ein gerichtetes Vorhersagemodell für Gleichgewichtsänderungen; Konzentration, Druck und Temperatur sind kontrollierte Variationen desselben Le-Chatelier-Prinzips. Konzentrations-/Ausbeutebegriffe bleiben getrennt.'),
('atomic','Eine quantitative Prozessentscheidung; Bilanz, physikalische Lösung und Optimierungsbegründung gehören zum selben Ergebnis. Alle äußeren Einflüsse werden erhalten.'),
('needs_developer_review','Whole-HOLD: gesellschaftliche fachliche Bedeutung und selbstständige analoge/digitale Urheber-/Vertrauens-/Richtigkeitsprüfung können unabhängig geleistet werden. Die amtliche Verbindung durch Dazu ist erhalten, entscheidet aber allein die semantische Granularität nicht. Keine Textverengung und keine neuen IDs.'),
('atomic','Eine Katalysecharakterisierung im Gleichgewicht: alternative Barrieren, schnellere Einstellung und Phasenzuordnung der Beispiele gehören zur Erklärung; keine K-Änderung behauptet.'),
('atomic','Eine stöchiometrisch korrekte Haber-Bosch-Prozessauswertung mit MWG-Potenzen und Konzentrationen. Die Analyse ist an denselben Reaktionsprozess gebunden; breitere Original-LK-Pflichten bleiben als Partnerpflicht offen.'),
('atomic','Eine elektrochemische Auswahlentscheidung: lokale Potenziale, Halbgleichungen, Zersetzungsspannung und Überspannung bestimmen die beobachtbare Entladung. Keine universelle Rangfolge.'),
('atomic','Eine Faraday-Stoffumsatzroutine in beiden Rechenrichtungen; Q,I,t,n,m und z sind gekoppelte Größen. HE-LK-ohne-Berechnungen wird nicht als quantitative Bundespflicht erklärt.'),
('atomic','Eine Spannungsreihen-Vorhersage mit bilanziertem Zellmodell und Standardspannung; Standard/actual sowie Elektronen-/Ionentransport sind notwendige Interpretationsgrenzen. Nernst bleibt beim vorhandenen Partnerziel.'),
('needs_developer_review','Whole-HOLD: die räumliche Redoxtrennung erklären und eine zeitabhängige UI-Messreihe auswerten sind getrennt assessierbare Routinen. Original-Reaktionsenthalpie bleibt wörtlich im Ziel; Fachgrenze maximale elektrische Arbeit bei T,p=-ΔG wird ausdrücklich erhalten. Keine pauschale Gleichsetzung mit -ΔH.'),
('atomic','Eine materialgestützte Auswahl von Primärzellen; Zellprinzip wird als Begründung für konkrete Gebrauchsvor-/nachteile genutzt, keine separate Akku-/Brennstoffzellenkompetenz hineingezogen.'),
('atomic','Eine Energiespeicherkettenbewertung; Erzeugung, physikalische/chemische Speicherung und Effizienz sind gemeinsam notwendige Entscheidungselemente. Fehlende photokatalytische Partnerpflichten werden nicht freigegeben.'),
('atomic','Ein Donator-Akzeptor-Modell lokaler Korrosion; Sauerstoff und Protonen sind zwei variierende Akzeptoren desselben Prozesses mit korrekten Halbgleichungen.'),
('atomic','Eine Kontaktkorrosions-Erklärung: gekoppelte Elektrodenrollen und getrennte elektronische/ionische Leitungswege bilden ein geschlossenes Modell; Flächeneffekt nur unter angegebenen Grenzen.'),
('atomic','Eine begründete Werkstoffverwendung aus Korrosions-/Passivierungsdaten. Erklärung und Nutzungsurteil beziehen sich auf dieselbe Werkstoff-Umgebungsbeziehung.'),
('atomic','Eine begründete Schutzwahl: passive Barriere, galvanische Rollen und Verbrauch begründen ein ökologisch/ökonomisches Urteil. Kein Schutzverfahren oder Bewertungsaspekt entfernt.'),
('atomic','Eine Diagrammsteigungsroutine mit mehreren Darstellungen: mittlere/momentane Rate, Stoffmengen-/Konzentrations-/Volumenbezug und stöchiometrische Normierung gehören zur selben Rateauswertung.'),
('atomic','Eine Stoßtheorie-Erklärung mit vier kontrollierten Einflussvariationen; Stoffart, Konzentration, Oberfläche und Temperatur bleiben vollständig im Leistungsumfang.'),
('atomic','Eine Aktivierungsenergiebestimmung aus Temperaturabhängigkeit. Mathematische Atomizität ist ein Autorenkandidat; separate Originalquellen-HOLD bleibt bestehen, da die einzige direkte HB-Arrheniuszeile nicht aus der Originalseite24 bestätigt wurde.')]

aconfig={'schemaVersion':1,'reviewId':'chemie-q3-whole20-inactive-author-20261008-v1',
 'ruleVersion':'semantic-atomicity-v1','landscapeId':lid,'landscapePath':frozen,
 'reviewPath':f'{REL}/native/a20.author-candidate.review.jsonl',
 'scope':{'label':'Inaktive Ganzziel-Autorenentscheidungen Chemie Q3: 18 atomic-Kandidaten, 2 Whole-HOLDs','leafGoalIds':ids}}
dump('native/a20.author-candidate.config.json',aconfig)
arecs=[]
for i,gid in enumerate(ids):
 g=goals[gid];d=g.get('dimensionTags',{})
 payload={'ruleVersion':'semantic-atomicity-v1','goalId':gid,'shortKey':g.get('shortKey',''),
          'title':normal(g['title']),'titleEn':normal(g.get('titleEn')),
          'description':normal(g['description']),'descriptionEn':normal(g.get('descriptionEn')),
          'phase':normal(d.get('phase')),'area':normal(d.get('area')),'topicCode':normal(d.get('topicCode')),'nodeKind':normal(g.get('nodeKind'))}
 status,reason=reasons[i]
 arecs.append({'schemaVersion':1,'reviewId':aconfig['reviewId'],'ruleVersion':'semantic-atomicity-v1','landscapeId':lid,'goalId':gid,
              'fingerprint':'sha256:'+hashlib.sha256(stable(payload).encode()).hexdigest(),'status':status,
              'semanticAtomic':True if status=='atomic' else None,'reviewedAt':now,
              'reviewer':'Codex author; inactive E1/G1 candidate, independent review pending','reason':reason,
              'suggestedAction':'Neutral independent whole-goal/source review before any activation; keep full body and existing stable ID.'})
(B/'native/a20.author-candidate.review.jsonl').write_text(''.join(stable(x)+'\n' for x in arecs))

# Closed v2 P profiles retain full cases in both languages, not miniature labels.
pconfig={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
 'schemaVersion':2,'reviewId':'chemie-q3-whole20-p-inactive-author-20261008-v1',
 'goalFingerprintRuleVersion':'goal-evidence-v1','profileRuleVersion':'positive-understanding-evidence-v2',
 'landscapeId':lid,'landscapePath':frozen,'semanticKindLedgerPath':ledger,
 'reviewCriteriaPath':f'{REL}/frozen-inputs/chemistry-existing-review-criteria.md',
 'reviewPath':f'{REL}/native/p20.author-candidate.review.jsonl',
 'reviewedResourceTypes':['goal-visualization'],'requireApproved':False,
 'scope':{'label':'Inactive whole20 P candidates, 40 full synthetic bilingual cases','goalIds':ids}}
dump('native/p20.author-candidate.config.json',pconfig)
ps=[]
archetypes=['concept','procedure','modeling','modeling','data','concept','modeling','procedure','procedure','modeling','data','modeling','modeling','modeling','modeling','modeling','modeling','data','concept','data']
for i,gid in enumerate(ids):
 cs=[x for x in cases if x['goalId']==gid]
 # Four named duties remain mandatory. The brief contains material, task,
 # worked model, separate scoring and independently administered transfer.
 ex=[]
 for j in range(4):
  criterion=cs[0]['scoring']['criteria'][j]['criterion']
  other=cs[1]['scoring']['criteria'][j]['criterion']
  ex.append({'id':f'whole-duty-{j+1}',
    'essentialUnderstandingDe':criterion['de'],'essentialUnderstandingEn':criterion['en'],
    'observablePerformanceDe':criterion['de']+' Zweiter unabhängiger Kontext: '+other['de'],
    'observablePerformanceEn':criterion['en']+' Second independent context: '+other['en']})
 briefs=[]
 for c in cs:
  brief={'id':c['caseId']}
  for language,suffix in [('de','De'),('en','En')]:
   scoring='; '.join(f"{q['points']}P: {q['criterion'][language]}" for q in c['scoring']['criteria'])
   brief['taskDemand'+suffix]=c['material'][language]+' '+c['task'][language]+(' Separat frischer Transfer: ' if language=='de' else ' Separate fresh transfer: ')+c['freshTransfer']['task'][language]
   brief['expectedPerformance'+suffix]=c['modelResponse'][language]+(' Transferantwort: ' if language=='de' else ' Transfer response: ')+c['freshTransfer']['modelResponse'][language]+(' Scoring /10: ')+scoring
   brief['understandingFocus'+suffix]=('Ganzes aktuelles Ziel einschließlich aller Operatoren; keine Punktvergabe für nicht ausgeführte Experimente. ' if language=='de' else 'Whole current goal including all operators; no credit for unperformed experiments. ')+reasons[i][1] if language=='de' else 'Whole current goal including all operators; explain the evidence, perform the specified calculation or judgment and apply the separate fresh transfer. Synthetic authored work is not actual learner performance.'
  briefs.append(brief)
 ps.append({'goalId':gid,'reason':reasons[i][1]+' Whole current DE/EN body preserved; 2 full cases and separate fresh transfers. No independent/human approval. All native source roles remain bounded.','evidenceLevel':'E1','maximumClaimScope':'G1',
  'dissent':[reasons[i][1]] if reasons[i][0]!='atomic' or i==19 else [],
  'profile':{'archetype':archetypes[i],'expectations':ex,
    'coverageExpectations':{'requiredExpectationIds':[x['id'] for x in ex],'alternativeExpectationGroups':[],'minimumIndependentDemonstrations':2,'freshVariationRequired':True,'independentTransferRequired':True},
    'variationAxes':[{'id':'whole-case-material','textDe':cs[0]['title']['de']+' / '+cs[1]['title']['de'],'textEn':cs[0]['title']['en']+' / '+cs[1]['title']['en']},
                     {'id':'independent-transfer','textDe':cs[0]['freshTransfer']['task']['de']+' / '+cs[1]['freshTransfer']['task']['de'],'textEn':cs[0]['freshTransfer']['task']['en']+' / '+cs[1]['freshTransfer']['task']['en']}],
    'applicationCaseBriefs':briefs}})
dump('native/p20.native-materializer.candidates.json',{'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':pconfig['reviewId'],'reviewedAt':now,'reviewer':'Codex author; synthetic E1/G1, independent review pending','goals':ps})

# Reuse exact current M decisions/cards. Full configured visibility check must
# still pass; no artificial card or hidden no_memory_needed decision is added.
active=json.loads((R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').read_text())
chem=next(s for s in active['subjects'] if s['subject']=='chemie')
mc=json.loads((R/chem['memoryReviewConfigPath']).read_text())
(B/'memory').mkdir(exist_ok=True)
for key,name in [('reviewPath','current378.existing.records.jsonl'),('cardReviewPath','current-existing.cards.jsonl')]:
 shutil.copyfile(R/mc[key],B/'memory'/name);mc[key]=f'{REL}/memory/{name}'
mc['landscapePath']=frozen;mc['reportPath']=f'{REL}/memory/current378.existing-visibility.native.report.md'
for i,scope in enumerate(mc['visibilityScopes']):
 src=scope['viewPath'];name=f'visibility-{i:02d}.{Path(src).name}'
 shutil.copyfile(R/src,B/'memory'/name);scope['viewPath']=f'{REL}/memory/{name}'
dump('memory/current378.existing-reuse.native.config.json',mc)
mr=[json.loads(x) for x in (B/'memory/current378.existing.records.jsonl').read_text().splitlines() if x.strip()]
cr=[json.loads(x) for x in (B/'memory/current-existing.cards.jsonl').read_text().splitlines() if x.strip()]
selected=[x for x in mr if x['goalId'] in ids]
cards=[x for x in cr if set(x.get('originGoalIds',[])).intersection(ids)]
dump('memory/whole20.existing-decisions-cards.reuse.json',{'scope':ids,'decisions':selected,'relatedExistingCards':cards,'newCards':0,'newReviewDecisions':0,'meaning':'Existing exact M decisions are retained. Native full378 visibility/card check is separate actual output, not new memory review.'})

# The first snapshot binds original canonical bytes. Rebinding this COPY's
# sourceLandscapePath enables native builder use without changing a semantic
# decision, source fingerprint, current body, published resource, or active file.
dump('native/path-only-adaptation.receipt.json',{'source':f'{REL}/frozen-inputs/02.chemie.semantic-kinds.json',
 'adapted':ledger,'operation':'sourceLandscapePath only','canonicalBytes':sha(R/frozen),
 'newSemanticDecision':False,'sourceFingerprintChanged':False,'activeWrite':False})
print('Prepared native P20, A20 (18 atomic candidates,2 HOLDs), and existing M visibility configuration.')
