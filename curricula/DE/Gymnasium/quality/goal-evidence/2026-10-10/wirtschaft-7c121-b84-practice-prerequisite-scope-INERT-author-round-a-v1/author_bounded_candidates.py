#!/usr/bin/env python3
"""Own inert author candidates only; never writes active input files."""
import copy, hashlib, json, pathlib, datetime, shutil

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
SNAP = OUT / 'input-snapshots'
CAN = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
def read(p): return json.loads(pathlib.Path(p).read_text())
def write(name, obj):
    p=OUT/name; p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n')
def binding(p):
    p=pathlib.Path(p); data=p.read_bytes()
    return {'path':str(p.relative_to(ROOT)), 'sha256':'sha256:'+hashlib.sha256(data).hexdigest(), 'bytes':len(data)}
def diff(a,b,path=''):
    if a==b:return []
    if isinstance(a,dict) and isinstance(b,dict):
        rows=[]
        for k in sorted(set(a)|set(b)):
            if k not in a or k not in b:rows.append({'path':path+'/'+k,'before':a.get(k),'after':b.get(k),'beforePresent':k in a,'afterPresent':k in b})
            else:rows.extend(diff(a[k],b[k],path+'/'+k))
        return rows
    return [{'path':path,'before':a,'after':b}]
before=read(SNAP/'seven-current-whole-goals.BEFORE.json')['goals']
by={g['id']:g for g in before}
ids={g['id'][:3]:g['id'] for g in before}
G7=ids['7c7']; G121=ids['121']; B84=ids['b84']; F93=ids['f93']; DA1=ids['da1']; P28=ids['28a']; P81=ids['81f']
EEE='eee7217a-c2fb-58b6-ba84-2a8d5235edb5'
sealed=read(SNAP/'previous-sealed-candidate-whole-goals.json')['goals']
candidates={g['id']:copy.deepcopy(g) for g in before}
for g in sealed:candidates[g['id']]=copy.deepcopy(g)

# Source-independent visibility, explicitly separated from normative target roles.
g=candidates[G121]
g['applicability']['jurisdiction']=sorted(set(g['applicability']['jurisdiction'])|{'DE-HB','DE-TH'})
g.setdefault('extendedData',{})['applicabilityOverrides']={'jurisdiction':['DE-HB','DE-TH']}
g['extendedData']['scopeAuthoringReason']={
    'status':'inert_ai_candidate_needs_independent_scope_review',
    'basis':'whole-current-f93-task-demand',
    'jurisdictions':['DE-HB','DE-TH'],
    'projectionRole':'prerequisiteOnly',
    'reasonDe':'Die volle vorhandene f93-Prüfung verlangt Tarifkosten-/Kaufkraft-, Nachfrage- und Koordinationsdeutung. Das unveränderte ganze Ziel 121 und sein separat geprüfter P-Inhaltskandidat stellen dafür eine didaktische Voraussetzung bereit. HB/TH erhalten ausschließlich diese ausdrücklich authored prerequisiteOnly-Rolle in ihren GK/LK-Views. Die Sichtbarkeit ist keine Behauptung einer vollständigen normativen Tarifzielpflicht oder einer neuen direkten Quellabdeckung.',
    'reasonEn':'The whole existing f93 assessment requires interpretation of bargaining costs/purchasing power, demand and coordination. Unchanged whole goal 121 and its separately reviewed profile content supply a didactic prerequisite. HB/TH receive only this explicitly authored prerequisiteOnly role in their GK/LK views. Visibility asserts neither a complete normative bargaining target nor new direct source coverage.',
    'normativeFullGoalSourceCoverageClaim':False,
    'humanApproval':False,
    'activation':False,
}
candidates[B84]['requires']=[EEE]
candidates[F93]['requires']=[G7,G121]
candidates[F93]['examData']['coveredGoalIds']=[G7,G121]

# The existing task set now supplies its asserted market-form transfer instead
# of only asking for unknown market-structure data. No task/point quota changes.
f=candidates[F93]['examData']
f93_replacements={
 'taskContent':[
  ('Der Betrieb kann Preise, Marge oder Produktion verändern.', 'Der Betrieb kann Preise, Marge oder Produktion verändern. Die Gewerkschaft verlangt Kaufkraft und Einkommenssicherheit; Arbeitgeber nennen Kosten, Absatzrisiken und Lieferpflichten. Für einen ausdrücklich separaten Vergleich möglicher Arbeitsmarktreaktionen sind zwei fiktive Modelle gegeben, keine beobachteten Betriebsergebnisse: K hat viele konkurrierende Arbeitgeber, ausreichendes passend qualifiziertes Angebot und die fest vorgegebene Arbeitsnachfrage L=150−2w bei unveränderten übrigen Bedingungen. E hat einen einzigen regionalen Arbeitgeber: Bei w=20 sind 80 standardisierte Vollzeiteinheiten beschäftigt; w=21 erhöht das angebotene passende Arbeitsvolumen auf 90. Profitable Aufträge für alle 90 und ihre Einstellung beim festen Tariflohn werden ausdrücklich vorausgesetzt. L zählt in beiden Modellen gleiche Vollzeiteinheiten, keine individuelle Personenzahl. Variante für E: profitable Aufträge erlauben nur 85 Einheiten.'),
  ('2. Berechne A-Stücklohnkosten vorher und nachher. Erkläre einen Kosten-/Preis- und einen Einkommens-/Nachfragekanal mit Bedingung.', '2. Berechne A-Stücklohnkosten vorher und nachher. Analysiere beide Tarifinteressen anhand eines Kosten-/Preis- und eines Einkommens-/Nachfragekanals mit Bedingung.'),
  ('3. Prüfe: „Das Modell beweist Jobverluste durch Tarifplus und die Notwendigkeit genau 6% Arbeitslosigkeit“. Begründe ein bedingtes Urteil und eine Informationsfrage.', '3. Prüfe: „Das Modell beweist Jobverluste durch Tarifplus und die Notwendigkeit genau 6% Arbeitslosigkeit“. Vergleiche dazu die Beschäftigungsreaktionen in K und E, prüfe die Auftragsvariante E und begründe die Grenzen gegenüber einer tatsächlichen Jobprognose und einem politischen Soll. Nenne eine gezielte Informationsfrage.')],
 'taskContentEn':[
  ('Workers consume part of extra incomes; the firm may change prices, margins or production.', 'Workers consume part of extra incomes; the firm may change prices, margins or production. The union seeks purchasing power and income security; employers cite costs, sales risks and delivery obligations. An expressly separate comparison of possible labour-market responses supplies two fictional models, not observed firm results: K has many competing employers, enough suitably qualified supply and fixed supplied labour demand L=150−2w, with other conditions unchanged. E has one regional employer: 80 standardised full-time units are employed at w=20; w=21 raises suitably qualified offered labour to 90. Profitable orders for all 90 and their hiring at this fixed negotiated wage are expressly assumed. In both models, L counts equal full-time units, not individual people. Variation for E: profitable orders support only 85 units.'),
  ('2. Calculate A’s old/new unit labour costs and explain a cost/price and an income/demand channel with conditions.', '2. Calculate A’s old/new unit labour costs and analyse both bargaining parties’ interests through a cost/price and an income/demand channel with conditions.'),
  ('3. Assess “The model proves a pay rise destroys jobs and exactly 6% unemployment is required”; give a conditional judgement for A and identify missing evidence.', '3. Assess “The model proves a pay rise destroys jobs and exactly 6% unemployment is required”. Compare employment responses in K and E, examine the order-limit variation in E, and justify limits against an actual job forecast and a policy ideal. Identify a targeted information question.')],
 'solutionContent':[
  ('Wettbewerb und Nachfrage begrenzen Preisüberwälzung; Margen können sinken. Zusatzeinkommen kann Konsum erhöhen, abhängig etwa von Sparen und Preisen.', 'Arbeitgeberinteressen an Kosten, Absatz und Lieferfähigkeit tragen den Kosten-/Preiskanal: Wettbewerb und Nachfrage begrenzen Preisüberwälzung; Margen können sinken. Gewerkschaftliche Kaufkraft-/Sicherheitsinteressen tragen den Einkommens-/Nachfragekanal: Zusatzeinkommen kann Konsum erhöhen, abhängig etwa von Sparen, Preisen und Beschäftigung.'),
  ('Bewertung, je 1 Punkt: Stückkostenrechnung; Kosten-/Preiskanal; Einkommens-/Nachfragekanal; konkrete Bedingung.', 'Bewertung, je 1 Punkt: Stückkostenrechnung; Kosten-/Preiskanal mit Arbeitgeberinteresse; Einkommens-/Nachfragekanal mit Beschäftigteninteresse; konkrete Bedingung.'),
  ('3. Das Inflationsmodell gibt keine sichere Beschäftigungsreaktion des Abschlusses an. Kosten und Nachfrage können gegenläufig wirken; Aufträge oder Margen sind zu prüfen. Eine unsichere Schwelle ist kein politischer Auftrag.\nBewertung, je 1 Punkt: Inflation von Jobprognose getrennt; gegenläufige Tarifwege; Schätz-/Sollgrenze; gezielter Datenbedarf.', '3. K: L=150−2·20=110 und L=150−2·21=108, also −2 Vollzeiteinheiten unter den gegebenen Konkurrenz-/Nachfrageannahmen. E: Das Material setzt Einstellung von 80→90, also +10 Einheiten voraus; bei profitablen Aufträgen nur für 85 sind höchstens 85 getragen. Ein einziger Arbeitgeber oder das Tarifplus allein garantiert keine dieser Richtungen; passendes Angebot, profitable Aufträge und Reaktionsannahmen sind entscheidend. Die zwei bedingten Modelle sind keine beobachtete Jobprognose und L ist keine Personenzählung. Das Inflationsmodell beantwortet diese Beschäftigungsfrage nicht; die unsichere Schwelle ist kein politischer Auftrag. Zu prüfen wären etwa tatsächlich profitable Aufträge, passende angebotene Stunden und die empirische Geltung der Reaktionsannahmen.\nBewertung, je 1 Punkt: beide bedingten Modellreaktionen begründet verglichen; Modellrechnung gegen tatsächliche Jobprognose/Personenzählung abgegrenzt; Schätz-/Sollgrenze; Auftragsvariante und gezielter Datenbedarf.')],
 'solutionContentEn':[
  ('Competition/demand affect pass-through, otherwise margins may fall. Higher income may support consumption depending on saving, prices and employment.', 'Employer interests in costs, sales and delivery support the cost/price channel: competition/demand affect pass-through, otherwise margins may fall. Worker purchasing-power/security interests support the income/demand channel: higher income may support consumption depending on saving, prices and employment.'),
  ('3. The supplied inflation model identifies no certain bargaining-induced employment response. Costs and demand may work differently; examine margins, orders or market structure. An uncertain threshold is no policy mandate; justify both limits.', '3. K gives L=150−2×20=110 and L=150−2×21=108, a fall of 2 full-time units under the supplied competitive-demand assumptions. E expressly assumes hiring rises from 80 to 90, an increase of 10; the order-limit variation supports no more than 85. One employer or higher pay alone guarantees neither direction: qualified available labour, profitable orders and response assumptions matter. Conditional model results are not observed job forecasts, and L is not headcount. The inflation model does not answer that employment question, and an uncertain threshold is no policy mandate. Ask for profitable actual orders, suitable offered hours and empirical applicability of the response assumptions.\nAward one point each for a reasoned comparison of both conditional responses; model calculation versus actual jobs/headcount; estimation/policy limit; order variation and targeted missing evidence.')],
}
for field,pairs in f93_replacements.items():
 for old,new in pairs:
  assert f[field].count(old)==1,(field,old)
  f[field]=f[field].replace(old,new)
f['scoring']['steps'][1]['description']='Je 1 Punkt: Stückkostenrechnung; Kosten-/Preiskanal mit Arbeitgeberinteresse; Einkommens-/Nachfragekanal mit Beschäftigteninteresse; konkrete Bedingung.'
f['scoring']['steps'][2]['description']='Je 1 Punkt: beide bedingten Modellreaktionen begründet verglichen; Modellrechnung gegen tatsächliche Jobprognose/Personenzählung abgegrenzt; Schätz-/Sollgrenze; Auftragsvariante und gezielter Datenbedarf.'
f['reviewNote']='INERT author candidate: explicit separate 7c/121 requirements and coverage; bounded supplied market-form transfer and bargaining-party analysis within the existing two cases/six tasks. The prior whole-material science receipt belongs to the unchanged BEFORE snapshot and does not qualify this changed material. Existing reviewStatus=released is retained only as an observed machine input field; current independent material/scope qualification, human review/approval and actual trial are pending. No active integration or publication.'

# One bounded material correction: make the actual new NAIRU estimate contract
# demonstrable inside existing task 1; keep all task totals and pass thresholds.
g=candidates[DA1]; e=g['examData']
replacements={
 'taskContent':[
  ('M2 Modelle: Bei NAIRU u*=5% gilt modellhaft Δπ=−0,4(u−u*) Prozentpunkte; tatsächliche Arbeitslosigkeit u=7%.', 'M2 Modelle: Als erste NAIRU-Schätzung ist u*=5% gegeben; modellhaft gilt Δπ=−0,4(u−u*) Prozentpunkte, tatsächliche Arbeitslosigkeit u=7%. Eine alternative Schätzung setzt u*=7%, ohne eine neue Beobachtung von Arbeitslosigkeit oder Preisen; alle anderen Modellbedingungen bleiben für den Vergleich gleich.'),
  ('1. Berechne die NAIRU-Modellimplikation. Vergleiche die zwei Lohnmodelle am Kompromiss und benenne eine fehlende entscheidende Information.', '1. Berechne die NAIRU-Modellimplikation für beide Schätzungen. Erläutere die Schwelle und weshalb die Revision bei gleicher Beobachtung den bedingten Modellschluss, aber weder eine beobachtete Preisänderung noch ein politisches Arbeitslosenziel belegt. Vergleiche die zwei Lohnmodelle am Kompromiss und benenne eine fehlende entscheidende Information.')],
 'taskContentEn':[
  ('M2 A supplied NAIRU model is Δπ=−0.4(u−u*) percentage points, u*=5%, u=7%.', 'M2 A supplied NAIRU model is Δπ=−0.4(u−u*) percentage points, with an initial estimated u*=5% and observed u=7%. An alternative estimate sets u*=7% without a new observation of unemployment or prices; hold all other model conditions equal for comparison.'),
  ('1. Calculate the NAIRU implication, compare the wage models and identify missing decisive evidence.', '1. Calculate the NAIRU implication for both estimates. Explain the threshold and why revision at the same observation changes the conditional model inference without establishing an observed price change or a policy unemployment target. Compare the wage models and identify missing decisive evidence.')],
 'solutionContent':[
  ('1. Δπ=−0,8 Prozentpunkte; das Modell beschreibt sinkende Inflationsrate, nicht notwendig Deflation.', '1. Mit erster Schätzung Δπ=−0,8 Prozentpunkte, mit alternativer Schätzung Δπ=0: Unter den jeweiligen Modellannahmen sinkt die Inflationsrate beziehungsweise bleibt sie konstant; daraus folgt weder notwendig Deflation noch bei Δπ=0 eine Inflationsrate von null. u* ist die geschätzte Schwelle mit Δπ=0 bei u=u*, keine direkt beobachtete Arbeitslosenquote und kein politisches Soll. Die geänderte Schätzung verändert die bedingte Rechnung bei gleichem beobachtetem u; tatsächliche Preisentwicklung, Schätzgrundlage und Modellgeltung sind zusätzlich zu prüfen.')],
 'solutionContentEn':[
  ('1. Δπ=−0.8 percentage points means falling inflation, not necessarily deflation.', '1. The initial estimate gives Δπ=−0.8 percentage points; the alternative gives Δπ=0. Under the respective model assumptions inflation falls or stays constant; neither necessarily means deflation, and zero change does not mean zero inflation. u* is the estimated threshold with Δπ=0 at u=u*, not directly observed unemployment or a policy ideal. Revision changes the conditional calculation at unchanged observed u; actual price developments, the estimation basis and model applicability require further evidence.')],
}
for field,pairs in replacements.items():
    for old,new in pairs:
        assert e[field].count(old)==1,(field,old)
        e[field]=e[field].replace(old,new)
e['scoring']['steps'][0]['description']='1 Getrennte Modelldeutung: NAIRU – beide bedingten Rechnungen1P, geschätzte Schwelle/Revision und Beobachtungs-/Sollgrenze1P; Tariflohnmodelle – zwei Annahmen/Mechanismen4P; fehlende entscheidende Modellinformation2P / Separate model interpretation: NAIRU – both conditional calculations1, estimated threshold/revision and observation/policy limit1; bargaining wage models – two mechanisms/assumptions4; missing decisive model evidence2'
artifact_relative=str((OUT/'da1-whole-material-and-two-atom-performance-map.INERT.json').relative_to(ROOT))
e['sourceArtifactPath']=artifact_relative
e['reviewNote']+=' INERT successor author delta: task1 now supplies a revised NAIRU estimate and demands the estimated/observed/policy distinction; separate 7c/121 performance map. Prior qualification does not approve this changed task/solution/rubric. Existing released machine field is preserved as input only; current independent material/scope review and bindings are pending.'

nativeP=[json.loads(x) for x in (SNAP/'previous-sealed-positive-understanding-evidence-v2.author-records.jsonl').read_text().splitlines() if x.strip()]
currentP=[json.loads(x) for x in (SNAP/'all-selected-current-whole-P-records.jsonl').read_text().splitlines() if x.strip()]
profileBy={p['goalId']:p for p in currentP}
profileBy.update({p['goalId']:p for p in nativeP})
oldArtifact=ROOT/by[DA1]['examData']['sourceArtifactPath']
shutil.copyfile(oldArtifact,SNAP/'da1-current-whole-bound-material.BEFORE.json')
write('da1-whole-material-and-two-atom-performance-map.INERT.json',{
 'schemaVersion':1,'kind':'inert-whole-assessment-and-explicit-performance-map-author-candidate',
 'predecessor':binding(oldArtifact), 'wholeAssessmentGoal':g,
 'actualIntendedPerformanceMap':[
  {'goalId':goalId,'wholeProposedGoal':candidates[goalId],
   'wholeProfileInputContract':profileBy[goalId],
   'profileBindingStatus':'input_contract_only_current_goal_fingerprint_pending',
   'taskAndSolutionItems':items,'performanceDe':de,'performanceEn':en}
  for goalId,items,de,en in [
   (G7,[1],'Schwelle, beide Modellrechnungen, geänderte Schätzung bei gleicher Beobachtung und Grenzen gegenüber empirischem Preisverlauf/politischem Soll. Kein Tarifmechanismus wird 7c zugeschlagen.','Threshold, both model calculations, revised estimate at unchanged observation and limits against empirical prices/policy ideals. No bargaining mechanism is attributed to 7c.'),
   (G121,[1,2],'Aufgabe1 vergleicht vorgegebene Lohnmodelle; Aufgabe2 analysiert Tarifinteressen/Macht, Kaufkraft/Stückkosten und bedingte Streik-/Kompromissfolgen. Kein NAIRU-Anteil wird 121 zugeschlagen.','Task1 compares supplied wage models; task2 analyses parties/power, purchasing power/unit costs and conditional strike/compromise effects. No NAIRU component is attributed to 121.')]],
 'remainingWholePerformanceInputs':[
  {'goalId':r['goalId'],'wholeCurrentGoal':r['wholeCurrentGoal'],'wholeCurrentPositiveRecord':r['wholeCurrentPositiveRecord'],'taskAndSolutionItem':r['taskAndSolutionItem'],'rubricStep':r['rubricStep']}
  for r in read(oldArtifact)['actualIntendedPerformanceMap'] if r['goalId'] not in [G7,G121]],
 'assessmentCountersPreserved':{'maxPoints':44,'passingPoints':27,'taskCount':5},
 'status':'ai_candidate_needs_independent_material_scope_review','evidenceLevel':'E1','maximumClaimScope':'G1',
 'machineStatusDisclosure':'The existing active examData.reviewStatus=released value is preserved as an input machine field, not a new author release or approval of this INERT material.',
 'humanApproval':False,'actualLearnerPerformance':False,'activation':False,
})

# Actual whole clinic material is not rewritten. Its new source snapshot binds
# the proposed b84 prerequisite route explicitly without old "current" labels.
old81=ROOT/by[P81]['examData']['sourceArtifactPath']; old81data=read(old81)
shutil.copyfile(old81,SNAP/'81-current-whole-bound-material.BEFORE.json')
new81path=str((OUT/'81-whole-unchanged-material-current-prerequisite-contracts.INERT.json').relative_to(ROOT))
candidates[P81]['examData']['sourceArtifactPath']=new81path
write('81-whole-unchanged-material-current-prerequisite-contracts.INERT.json',{
 'schemaVersion':1,'kind':'inert-whole-unchanged-clinic-material-prerequisite-binding-author-candidate',
 'predecessor':binding(old81),'wholeAssessmentGoal':candidates[P81],
 'actualIntendedPerformanceMap':[
  {'goalId':r['goalId'],'wholeProposedGoal':candidates.get(r['goalId'],r['wholeCurrentGoal']),
   'wholeProfileInputContract':profileBy.get(r['goalId'],r['wholeCurrentPositiveRecord']),
   'profileBindingStatus':'input_contract_only_changed_b84_goal_fingerprint_pending',
   'taskAndSolutionItem':r['taskAndSolutionItem'],'rubricStep':r['rubricStep']}
  for r in old81data['actualIntendedPerformanceMap']],
 'wholeScientificMaterialEqualsCurrent':True,
 'task3BoundaryDe':'Task3 prüft Arbeitsstunden/VZÄ, Dauer und Einkommen. Die Beteiligungs-/Mitentscheidungsbegriffe allein prüfen nicht die ganze Unternehmensmitbestimmungs- oder Gewinnbeteiligungskompetenz 776/a500; kein zusätzlicher coveredGoalId und kein neues P-Profil.',
 'task3BoundaryEn':'Task3 assesses hours/FTE, duration and income. Participation/voice terms alone do not assess whole corporate codetermination or profit-sharing goals 776/a500; no additional coveredGoalId or new profile.',
 'status':'ai_candidate_needs_independent_binding_scope_review','evidenceLevel':'E1','maximumClaimScope':'G1',
 'machineStatusDisclosure':'Existing released is a machine input field; this author snapshot does not release or qualify material.',
 'humanApproval':False,'actualLearnerPerformance':False,'activation':False,
})

allCandidates=[candidates[g['id']] for g in before]
write('seven-whole-proposed-goals.INERT.json',{'goals':allCandidates})
write('exact-seven-goal-scoped-deltas.AUTHOR.json',[
 {'goalId':g['id'],'changes':diff(g,candidates[g['id']])} for g in before])

viewRows=[]
for country in ['hb','th']:
 for course in ['gk','lk']:
  p=ROOT/f'curricula/DE/Gymnasium/composition-views/wirtschaft/de-{country}-gym-economics-{course}.view.json'
  original=read(p); proposed=copy.deepcopy(original)
  shutil.copyfile(p,SNAP/f'{country}-{course}-whole-view.BEFORE.json')
  def visit(nodes):
   for n in nodes:
    if n.get('goalId')==G121:yield n
    yield from visit(n.get('children',[]))
  found=list(visit(proposed['rootNodes']))
  if country=='hb':
   assert not found
   proposed['rootNodes'][0]['children'].append({'kind':'goalEntry','goalId':G121,'projectionRole':'prerequisiteOnly'})
  else:
   assert len(found)==1 and found[0]['projectionRole']=='prerequisiteOnly'
  path=f'views/{country}-{course}-whole-view.INERT.json';write(path,proposed)
  viewRows.append({'source':binding(p),'candidate':path,'changes':diff(original,proposed),
    'explicitAuthorDecisionDe':'Vorhandene ganze f93-Prüfung benötigt Tarifkompetenz. 121 ist in diesem Scope ausschließlich eine ausdrücklich geschriebene Voraussetzung, kein normatives Target; TH-Eintrag bleibt exakt bestehen.',
    'explicitAuthorDecisionEn':'The existing whole f93 assessment requires bargaining competence. In this scope, 121 is only an explicitly authored prerequisite, not a normative target; the TH entry stays exact.'})
write('four-whole-view-author-decisions.INERT.json',viewRows)

write('author-status.json',{
 'role':'AUTHOR_INERT_NOT_INDEPENDENT_REVIEW','authoredAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'provider':'OpenAI','model':'GPT-6','runtime':'Codex','exactModelRevision':'not_exposed','samplingParameters':'not_exposed',
 'evidenceLevel':'E1','maximumClaimScope':'G1','status':'needs_human_review','reviewAuthority':'ai_candidate',
 'priorRootScienceScope':'Only unchanged two whole semantic/P content candidates and six cases; this new scope/prerequisite/material package has not been independently approved.',
 'activeMutation':False,'humanApproval':False,'actualLearnerPerformance':False,'sourceCountryApproval':False,
 'noNewCardsOrImages':True,'noRegistryLedgerVotesOrCheckerChanges':True,
})
print(json.dumps({'candidateGoals':len(allCandidates),'changedGoals':sum(g!=candidates[g['id']] for g in before),'viewCandidates':4,'authorDirectory':str(OUT.relative_to(ROOT))},ensure_ascii=False))
