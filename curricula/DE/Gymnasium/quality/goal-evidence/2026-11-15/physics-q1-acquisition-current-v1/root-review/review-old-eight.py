import hashlib
import json
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
CANDIDATE = Path('tmp/physics-q1-successor-integration-20261115/canonical.candidate.json')
INPUT = Path('tmp/physics-release809-20261115/q1-whole-goal-review-priorities.actual.json')
NEW = Path('tmp/physics-q1-current-acquisition-20261115-v3/content-candidate.json')
OUT = Path(__file__).with_name('old-eight-coverage-disposition.actual.json')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def objsha(o): return hashlib.sha256(json.dumps(o,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
def goals(p): return {g['id']:g for g in json.loads(p.read_text())['goals']}
before, after = goals(BASE), goals(CANDIDATE)
tasks = json.loads(INPUT.read_text())['existingFullTaskInputs']
new_tasks = json.loads(NEW.read_text())['tasks']
reasons = {
 '5e64eacd': [
  'Polarisation in Nichtleitern wird nicht erklärt; der Quotient der Kapazitäten allein deckt 73b309ed nicht vollständig ab.',
  '09f2cdbd verlangt die Wahl eines Exponentialansatzes und dessen Prüfung durch Ableiten samt Anfangsbedingung. Kein Teilauftrag verlangt dies.',
  '330808f6 verlangt eine selbst aufgestellte Entlade-DGL aus konsistenter Strom-/Spannungskonvention, Lösung und Deutung. Gegeben ist bereits eine Lade-DGL, die nur qualitativ erläutert werden soll.'
 ],
 '72ee642f': [
  '8d34228c verlangt relativistische Energie UND Impuls sowie die Einordnung der historischen Massenzunahme bei invariabler Ruhemasse. Diese wesentlichen Zielbestandteile werden weder erhoben noch bewertet.',
  'Auch für 74a74132 kann die gesamte qualitative Begründung des Modellwechsels entfallen und die Aufgabe trotzdem bestanden werden. Die Energie- und Geschwindigkeitsrechnungen allein tragen keine ganze Zielaussage.'
 ],
 '783c1ffe': [
  '0b4f2020 verlangt zeitlichen Verlauf, Stromrichtung und Einfluss von R und RC beim Laden/Entladen; die Aufgabe ist vollständig statisch.',
  'e3bce51c verlangt Definition und Verwendung der Flächenladungsdichte; 38e0ff49 die Herleitung des Feldes daraus. Beides fehlt.',
  '9f59a088 umfasst neben einer C-Berechnung die Erklärung der Geometrie-/Dielektrikumsabhängigkeit und der homogenen Feldnäherung; fd9fd8ad auch den Energieübertrag bei Laden/Entladen. Diese Teile werden nicht erhoben.',
  'Ein einzelner Schwebefall mit q/e ungefähr 0,857 kann die Quantelung nach 0f803c37 nicht begründen. Ohne Unsicherheitsgrenzen ist die behauptete Vereinbarkeit mit einem ganzzahligen Vielfachen nicht belegt.'
 ],
 '841edfdb': [
  '25998fed fordert Ladungserhaltung/Umverteilung, f3de5922 Dipol-/Leiterfeldlinien samt Faraday-Käfig und Spitzen, 9fb1dd85 Influenzexperiment und Ladungsverschiebung, e3bce51c Flächenladungsdichte. Keiner dieser Zielbestandteile wird erhoben.',
  '455c65ca verlangt auch orthogonale Superposition; geliefert wird nur der kollineare Fall. 2622bef1 verlangt Potenzialnullpunkt und Äquipotentiallinien; beides fehlt. Für 1730c01d fehlt die explizite Vorzeichenkonvention.',
  'Die Musterlösung benutzt eine 15-mm-Strecke vollständig parallel zum homogenen Feld in einem 8-mm-Plattenspalt. Das ist innerhalb dieses Spalts unmöglich; 3000 V übersteigen die Plattenspannung 1600 V. Eine längere schräge Strecke würde eine Projektion erfordern und rechtfertigt E*s nicht.'
 ],
 '8ff2a728': [
  '1730c01d verlangt Spannung als Potenzialdifferenz und eine offengelegte Vorzeichenkonvention für Arbeit/Änderung der potenziellen Energie. Die reine positive W/q-Rechnung und Betragsformel erheben diese Teile nicht.',
  'Die gesamte 5-Punkte-Aufgabe zur elektrischen Arbeit und Spannungsdeutung kann fehlen; 10 von 15 Punkten bestehen bei Schwelle 9. Das ist kein vollständiger Erwerbsnachweis für 1730c01d.'
 ],
 'ba29e928': [
  'c6355a22 verlangt Betrag und Richtung einschließlich Winkelabhängigkeit sowie B aus einer Kraftmessung. Die Aufgabe berechnet nur einen ungerichteten Kraftbetrag ohne spezifizierte Leiterorientierung.',
  '8c9394cb verlangt Richtung unter Ladungsvorzeichen, Winkel und parallelen/senkrechten Grenzfall. Ein Radius aus vorausgesetzter Kreisbewegung und ein allgemeiner Vergleich mit Leiterkraft reichen nicht.',
  'Die Musterlösung F=B*I*l setzt eine nicht im Material festgelegte senkrechte Leiteranordnung voraus.'
 ],
 'd8442d03': [
  '58db62d4 verlangt die Gaußsche Ablenkungs- und Schwingungsmethode; beide fehlen vollständig.',
  '52bdabb2 verlangt Netto-Kernspinmagnetisierung, resonante HF-Anregung, Relaxation und räumliche Codierung durch Gradienten. Eine Homogenitätsprüfung belegt das nicht.',
  'b39ae8fb verlangt auch die Erklärung von Betrag/Vorzeichen der Hall-Spannung und deren Messbedeutung. Ein positives Kalibrierdiagramm allein deckt das nicht vollständig. d02438ba verlangt neben dem Drehmoment die Begründung der Ausrichtung; diese wird nicht erfragt.',
  'Die ausdrücklich strenge Anforderung unter 2 Prozent ist bei genau 2 Prozent Maximalabweichung vom Mittelwert nicht erfüllt. Die Musterlösung erklärt den Grenzwert fälschlich für knapp ausreichend. Bei Deutung als gesamte Schwankungsbreite ergeben sich sogar 4 Prozent.'
 ],
 'db5f4121': [
  '0f803c37 verlangt Millikan-Schwebefall und Quantelung; es gibt weder Tropfen noch einen entsprechenden Auftrag.',
  '5fda8623 verlangt Zeitbasis, zeitlichen Spannungsverlauf und qualitative Abgrenzung magnetischer Ablenkung. Eine statische Flugbahnrechnung erfasst diese wesentlichen Teile nicht.'
 ]}

catalog = {}
catalog_pins = []
for p in sorted(Path('curricula/DE/Gymnasium/canonical').rglob('*.json')):
 d=json.loads(p.read_text())
 if 'goals' not in d: continue
 catalog_pins.append({'path':str(p),'sha256':sha(p),'goals':len(d['goals'])})
 for g in d['goals']: catalog[g['id']] = g
catalog.update(after)
selected=[t for t in tasks if t['id'][:8] in reasons]
assert len(selected)==8 and len(catalog_pins)==21
rows=[]
for t in selected:
 i=t['id']; exam=t['examData']; assert before[i]['examData']==exam
 incoming=[{'id':g['id'],'title':g['title']} for g in catalog.values() if i in g.get('requires',[])]
 assert not incoming, (i,incoming)
 replacements={g:[n['id'] for n in new_tasks if g in n.get('examData',{}).get('coveredGoalIds',[])] for g in exam['coveredGoalIds']}
 assert all(replacements.values()), replacements
 scoring=exam['scoring']
 omission=[{'stepId':s['id'],'omittedPoints':s['points'],'remainingPoints':scoring['maxPoints']-s['points'],'stillPasses':scoring['maxPoints']-s['points']>=scoring['passingPoints']} for s in scoring['steps']]
 rows.append({'id':i,'title':t['title'],'originalExamDataSha256CanonicalJson':objsha(exam),
 'wholeGoalClaimsWithdrawn':exam['coveredGoalIds'],'currentWholeGoalTexts':[{k:after[g][k] for k in ('id','title','description')} for g in exam['coveredGoalIds']],
 'contentFindings':reasons[i[:8]],'scoreOmissionCounterexamples':omission,
 'acceptedNewTaskIdsByClaim':replacements,'incomingRequiresAfterK12Repair':incoming,
 'decision':'WITHDRAW_WHOLE_CLAIMS_AND_EXCLUDE_FROM_ACTIVE_ASSESSMENT_ROUTES_PRESERVE_HISTORICAL_TASK_CONTRACT'})

D=Decimal
numerical={'841edfdb':{'gapMeters':'0.008','pathAssumedParallelMeters':'0.015','impossibleInsideGap':D('.015')>D('.008'),'field_V_per_m':str(D(1600)/D('.008')),'solutionPotentialDifference_V':str(D(1600)/D('.008')*D('.015'))},
'd8442d03':{'maxDeviationPercent':str(D('.012')/D('.600')*100),'requiredStrictlyBelowPercent':'2','passes':D('.012')/D('.600')*100<D(2),'fullRangePercent':str(D('.024')/D('.600')*100)},
'783c1ffe':{'q_over_e':str(D('2.4e-15')*D('9.81')/(D(600)/D('.0035'))/D('1.602e-19')),'uncertaintySupplied':False}}
report={'at':datetime.now(timezone.utc).isoformat(),'reviewer':'root; actual independent reading of all eight retained task, solution and scoring bodies against current complete German goal statements',
'kind':'bounded current content disposition; not classroom validation, blind D review or native gate acceptance',
'inputPins':[{'path':str(p),'sha256':sha(p)} for p in (BASE,CANDIDATE,INPUT,NEW)],'canonicalCatalogPins':catalog_pins,
'rows':rows,'numericCounterexamples':numerical,
'totals':{'tasks':len(rows),'claimOccurrences':sum(len(r['wholeGoalClaimsWithdrawn']) for r in rows),'uniqueWholeGoals':len({g for r in rows for g in r['wholeGoalClaimsWithdrawn']}),'currentCatalogsChecked':len(catalog_pins),'incomingRequiresAfterK12Repair':0},
'requiredImplementation':['Retain every old task ID, taskContent, solutionContent, scoring and existing learner result unchanged.','Remove the unsupported current coveredGoalIds, record this disposition, and put the tasks in excluded historical placement with native applicability exclusion.','Use already independently accepted replacement tasks only on routes whose genuine prerequisite closure permits them. Do not enlarge ordinary learner scope just to make a task available.','Revalidate final whole-task contracts, 21-catalog reference graph, native applicability, real views, assessment routes and quality gates.'],
'limits':['This record does not accept every unaffected old task or old claim.','The earlier limited disposition on 8ff2a728 withdrew bbee only; this current review newly withdraws the remaining 1730 claim. History remains intact.','No official source claim, curriculum quality floor, immutable V9 registry or learner result is modified by this review.']}
OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'path':str(OUT),'sha256':sha(OUT),'totals':report['totals'],'numerical':numerical},ensure_ascii=False))
