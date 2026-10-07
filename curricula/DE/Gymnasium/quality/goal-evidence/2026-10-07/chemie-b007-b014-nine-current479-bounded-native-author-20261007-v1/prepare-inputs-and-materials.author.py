# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import copy, hashlib, json
from datetime import datetime, timezone

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
PREFIX = 'curricula/DE/Gymnasium/quality/goal-evidence'
B7 = ROOT / PREFIX / '2026-10-06/chemie-b007-seven-routines-four-material-corrections-author-v2'
B7N = ROOT / PREFIX / '2026-10-06/chemie-b007-seven-native-source-preparation-author-v3'
B14 = ROOT / PREFIX / '2026-10-05/chemie-b014-eleven-source-remediation-independent-a-v1'
ARR = ROOT / PREFIX / '2026-10-05/chemie-b014-arrhenius-memory-remediation-independent-a-v1'
IDS = ['9e656697-fc05-5aa9-9aca-871af2e89eb7','7be6f951-a614-52dc-94d3-2ce0d33765ff','53fd1bfd-facb-54ae-b2dc-f667ed1414fc','4961130b-1ee8-58f2-a319-dff0a864db6a','f0939f88-a6af-5334-ac4d-5d54732af25a','28bb9d15-f865-5843-a035-6066580fea64','f1ed86f0-534d-57d7-8952-a004a331cc54','1c1420c2-a8e2-520f-8015-6df637a973bd','b4777001-f4ed-5fe9-9d98-02319abdea09']
READY = [IDS[0], IDS[4], IDS[5], IDS[7]]
inputs = []

def read(p):
    p = Path(p); b = p.read_bytes()
    if not any(r['originalPathAtUse'] == str(p.relative_to(ROOT)) for r in inputs):
        dest = OWN/'declared-input-snapshots'/f'{len(inputs)+1:03d}-{p.name}.bin'
        dest.parent.mkdir(parents=True,exist_ok=True); dest.write_bytes(b)
        inputs.append({'path':str(dest.relative_to(ROOT)),'originalPathAtUse':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'exactByteSnapshot':True})
    return json.loads(b)

def bind(p):
    p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}

def put(name,value):
    p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('x')as f:f.write(value if isinstance(value,str) else json.dumps(value,ensure_ascii=False,indent=2)+'\n')

canonical_path=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical=read(canonical_path);assert len(canonical['goals'])==479
by={g['id']:g for g in canonical['goals']}
registry=read(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
subject=next(s for s in registry['subjects']if s['subject']=='chemie')
ledger=read(ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
kind=read(ROOT/subject['semanticKindLedgerPath']);qa=read(ROOT/subject['visualizationQaPath'])
read(ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json')
view=read(ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json')
b14rows=read(B14/'eight-complete-text-source-prerequisite-deltas.json')['rows']
b14provenance=read(B14/'ten-current-provenance-before-after-candidate.json')
b14groups=read(B14/'nine-complete-source-row-remediation-groups.json')
b7routines=read(B7/'seven-routines.de-en.author-candidate.json')
b7cases=read(B7/'cases.de-en.author-candidate.json')['cases']
b7routes=read(B7N/'seven-source-placement-intents-and-national-holds.author-candidate.json')
current_memory_config=read(ROOT/subject['memoryReviewConfigPath'])
prototype=next(p for p in b7routines['prototypes']if p['localKey']=='label')
candidate=copy.deepcopy(canonical);cand={g['id']:g for g in candidate['goals']}
for id in READY[1:]:
    old=next(r for r in b14rows if r['goalId']==id)
    for field in ['description','descriptionEn','requires','extendedData','resourceLinks']:
        cand[id][field]=copy.deepcopy(old['after'][field])
for field in ['title','titleEn','description','descriptionEn']:
    cand[READY[0]][field]=prototype[field]
# Retain current prerequisite and all current context: the broad B007 split is not adopted.
prov=cand[READY[0]]['extendedData']['provenance']
prov['sourceGoalId']='he-chem-seki-8-1-b07-a01-26ab40c7'
prov['sourceLandscapeTitle']='Chemie Sekundarstufe I (Hessen, G9 Source-Extraction)'
prov['sourceRef']='Lehrplan Chemie Gymnasium Hessen G9, Jahrgang 8, 8.1, gedruckt 11 / physisch 12: Gefahrstoffkennzeichnungen.'
for link in cand[READY[0]]['resourceLinks']:
    link['altText']='Vier vereinfachte Gefahrstoffkennzeichnungen mit Flamme, Ätzwirkung, Ausrufezeichen und Umweltgefahr; ergänzende Schutz- und Entsorgungshinweise sind Beispiele, keine vollständige Stoffinformation.'
    link['description']=link['altText']
put('candidate/canonical.current479-four-bounded-proposals.json',candidate)
put('candidate/semantic-kinds.original-input.json',kind)
put('candidate/visualization-qa.original-input.json',qa)
put('candidate/review-view.original-input.json',view)

holds={IDS[1]:'Handling and disposal are independent routines. Prior B007 split requires two children, actual source-specific placements, protected prerequisite consumer/context checks and national view repair; current whole goal remains unchanged.',IDS[2]:'Performed preparation, solubility/saturation and required mass/volume fractions need separate source-bound routines. Quantitative HE saturation is facultative; NI qualitative evidence does not make it mandatory. Prior6 UUID split leaves40 source views /72CPV findings; preserve403 duties/413 mappings.',IDS[3]:'Oxidation-number assignment/recognition and full redox equation balancing need the previously proposed survivor plus existing22133f29, with organic and inorganic coverage. Current aggregate remains unchanged; no new UUID assigned.',IDS[6]:'Own preparation and strong-acid/base pH calculation are independent. Existingc224281a pH atom plus concentration/preparation survivor need source/placement/prerequisite/native checks; current aggregate remains unchanged.',IDS[8]:'Reaction direction, detection of ions and model reflection are independent. Existingd2/fd309/277 companion routines and relative-concentration correction remain review-required; current aggregate remains unchanged.'}
selection={'role':'AUTHOR current9 selection;4 bounded candidates +5 unresolved broad-goal boundaries','currentWholeGoals':479,'currentCurricularAtomicGoals':378,'selectedGoalIds':IDS,'currentWholeGoalsDEEN':[by[id]for id in IDS],'candidateWholeGoalsDEEN':[cand[id]for id in IDS],'reviewReadyGoalIds':READY,'heldGoalIds':list(holds),'holds':holds,'activeLedger':bind(ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'),'noNewCurricularAtomicIds':True,'onlyFourCurrentGoalChanges':True,'independentApproval':False,'humanApproval':False,'strictGain':0}
put('nine-current-goals-and-four-bounded-candidates.author.raw.json',selection)
put('first-nine-selection-and-boundaries.author.freeze.json',{'role':'Immutable incremental selection snapshot; additional separate packet files follow','payloads':[bind(OWN/'nine-current-goals-and-four-bounded-candidates.author.raw.json')],'strictGain':0})

sources=[]
for path,source_ids in [('curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_CHEMIE_SEKI_G9.source-extraction.json',['he-chem-seki-8-1-b07-a01-26ab40c7']),('curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json',['he-chem-sekii-e-1-b07-a01-e3d57612','he-chem-sekii-e-2-b01-a01-4b89f4d7','he-chem-sekii-e-2-b05-a01-0713a913'])]:
    d=read(ROOT/path)
    for sid in source_ids:
        s=next(s for s in d['sourceGoals']if s['id']==sid)
        sources.append({'extractionBinding':bind(ROOT/path),'wholeCurrentSourceGoal':s,'sourceScopeLimit':'bounded named component only, not all source obligations or nationwide approval'})
put('source/four-bounded-existing-source-rows-and-original-partner-duties.author.json',{'role':'Exact prior source science reused as history; no new source approval','fourExistingSourceRows':sources,'priorB007FullRoutesAndHolds':b7routes,'priorB014WholeProvenanceAndPartnerGroups':b14provenance,'wholePartnerGroupsRetained':b14groups,'fiveHolds':holds,'newSourceApproval':False,'wholeSourceApproval':False})

asset_rows=[]
qby={r['goalId']:r for r in qa['records']}
for id in IDS:
    q=qby[id];link=next(l for l in by[id]['resourceLinks']if l['type']=='goal-visualization')
    refs=[ROOT/q['canonicalAssetPath'],ROOT/q['publicAssetPath'],ROOT/('backend/src/main/resources/static'+link['url'])]
    hashes=[bind(p) for p in refs];assert len({h['sha256']for h in hashes})==1
    dest=OWN/'selected-existing-images'/Path(link['url']).name;dest.parent.mkdir(exist_ok=True);dest.write_bytes(refs[0].read_bytes())
    asset_rows.append({'goalId':id,'wholeCurrentResourceLink':link,'candidateResourceLinks':cand[id]['resourceLinks'],'wholeExistingQaRecord':q,'exactThreeCopies':hashes,'candidateCopy':bind(dest),'actuallyViewedAtAuthorStage':id in READY,'authorIntent':'KEEP_existing_exact_asset_pending_independent_current_text_page_binding'if id in READY else'retain_unmodified_asset_while_whole_goal_is_held','newRasterGenerated':False,'independentCurrentVApproval':False,'humanApproval':False})
put('visualization/nine-exact-existing-assets-and-four-actual-author-KEEP-intents.raw.json',{'role':'Author actual4 image inspection and9 exact copies; no independent V approval','rows':asset_rows,'observedConcreteFaultsInFourAtThisStage':[],'comments':{'9e':'Four symbols and examples remain a suitable orientation; full hazard statements come from task material. This image alone never establishes complete classification, handling or disposal.','f093':'Zn oxidation / Cu reduction, negative anode / positive cathode, external electrons toward Cu and charge-compensation bridge; qualitative potential-difference model.','28':'Names/formulas and Arrhenius aqueous-ion model retained. H+(aq) is a solvated-proton shorthand; task distinguishes it from bare H+ and does not assert all acids fully dissociate.','1c':'Donor/acceptor and conjugate pairs, aqueous mixture versus species retained; water ampholyte is assessed in full P cases.'},'historicalRecordsUnchanged':True,'newApproval':False})

# Exact existing independently reviewed support: no historical re-authoring.
for name in ['a-scoped.review.jsonl','m-scoped.review.jsonl']:
    b=(B14/name).read_bytes();snapshot=OWN/'reused-evidence'/name;snapshot.parent.mkdir(exist_ok=True);snapshot.write_bytes(b)
for name in ['one-goal.memory-review.reviewed.candidate.jsonl','eighteen.cards-review.reviewed.candidate.jsonl','de_gymnasium_chemistry_arrhenius_names_formulas.de.reviewed.inactive.candidate.json','de_gymnasium_chemistry_arrhenius_names_formulas.en.reviewed.inactive.candidate.json']:
    p=ARR/name;put('reused-evidence/'+name,p.read_text())
arrcan=read(ARR/'canonical-with-one-memory-goal.reviewed.inactive.candidate.json');memory=next(g for g in arrcan['goals']if g['id']=='417e65ec-68be-5f2e-9452-c3ba9b1d362f')
put('memory/arrhenius-existing-reviewed-support-node.author-proposal.json',{'role':'Exact previously reviewed inactive supporting memory-node template, current activation/visibility pending','wholeMemoryNode':memory,'newCurricularAtomicGoal':False,'futureWholeCanonicalCountIfAdopted':480,'futureCurricularAtomicCountIfAdopted':378,'existingOrdinaryGoalId':IDS[5],'sourceSaltsNotCoveredByCards':True,'requiredCurrentChecks':'Attach retained memory child underf97b; preserve16 jurisdiction support scope; compile actual current7visibility scopes including BB/BE; add exact unchanged18primary/36DEEN cards and bind current ordinary28 record. No old full canonical or375historical records may overwrite current378.'})

def new_case(id,key,task_de,task_en,answer_de,answer_en,focus_de,focus_en):
    return {'goalId':id,'id':key,'taskDemandDe':task_de,'taskDemandEn':task_en,'expectedPerformanceDe':answer_de,'expectedPerformanceEn':answer_en,'understandingFocusDe':focus_de,'understandingFocusEn':focus_en,'authorStatus':'ai_candidate / needs_human_review','syntheticMaterial':True,'actualLearnerPerformance':False,'humanApproval':False}

cases=[]
retained_labels=[c for c in b7cases if c['routineLocalKey']=='label']
for c in retained_labels:
    cases.append(new_case(IDS[0],c['caseLocalKey'],' '.join(c['material']['de'])+' '+c['learnerTask']['de']+' Transfer: '+c['transferOrCountercase']['de']['task'],' '.join(c['material']['en'])+' '+c['learnerTask']['en']+' Transfer: '+c['transferOrCountercase']['en']['task'],c['expectedResponseOrSolution']['de']+' Transfer: '+c['transferOrCountercase']['de']['expected'],c['expectedResponseOrSolution']['en']+' Transfer: '+c['transferOrCountercase']['en']['expected'],c['essentialUnderstanding']['de'],c['essentialUnderstanding']['en']))
put('materials/two-exact-previously-reviewed-label-material-bodies.json',{'role':'Two exact full B007v2 bodies; native briefs losslessly compose their supplied material, tasks, solutions and transfer','cases':retained_labels,'originalBodiesUnchanged':True,'newScienceReviewClaim':False})
cases.append(new_case(IDS[4],'zinc-copper-charge-path',
'Fiktives Demonstrationsprotokoll: Eine Zinkelektrode in Zinksulfatlösung und eine Kupferelektrode in Kupfersulfatlösung sind durch einen äußeren Leiter mit Verbraucher und eine KNO3-Salzbrücke verbunden. Zink verliert Masse, Kupfer gewinnt Masse; Cu2+/Cu hat unter diesen Bedingungen das höhere Reduktionspotenzial. Formuliere beide Elektrodenreaktionen, ordne Anode/Kathode und ihre Vorzeichen zu, begründe Elektronen- und Brückenionenbewegung und erkläre die Zellspannung qualitativ. Ein zweiter Aufbau entfernt die Salzbrücke: Begründe, warum dann kein dauerhafter Strom fließt. Eine kurzzeitig beobachtete Voltmeteranzeige ist kein Nachweis dauerhaften Stroms. Keine numerischen Potenziale sind vorgegeben.',
'Fictional demonstration log: Zinc in zinc sulfate and copper in copper sulfate are connected by an external conductor with a load and a KNO3 salt bridge. Zinc loses mass and copper gains mass; Cu2+/Cu has the higher reduction potential under these conditions. Write both electrode reactions, assign anode/cathode and their signs, justify electron and bridge-ion movement and explain cell voltage qualitatively. A second setup removes the bridge: explain why sustained current cannot flow. A transient voltmeter reading does not demonstrate sustained current. No numerical potentials are supplied.',
'Zn→Zn2++2e− ist Oxidation an der negativen Anode; Cu2++2e−→Cu ist Reduktion an der positiven Kathode. Elektronen fließen außen von Zn zu Cu. NO3− wandert zur Zinkhalbzelle, K+ zur Kupferhalbzelle, um die Ladungsänderungen auszugleichen. Die verschiedenen Elektrodenpotenziale erzeugen die Potenzialdifferenz; ohne Potenzialdaten wird keine Zahl berechnet. Ohne ionische Verbindung würde sich Ladung aufbauen und den dauerhaften Strom unterbinden; eine kurzzeitige Anzeige kann trotzdem auftreten.',
'Zn→Zn2++2e− is oxidation at the negative anode; Cu2++2e−→Cu is reduction at the positive cathode. Electrons move externally from Zn to Cu. NO3− enters the zinc half-cell and K+ the copper half-cell to compensate charge changes. Different electrode potentials create the potential difference; no numerical voltage is inferred without potential data. Removing ionic connection permits charge buildup and prevents sustained current; a transient reading may still occur.',
'Elektrodenreaktion, äußere Elektronenbewegung und innere Ionenbewegung bilden einen zusammenhängenden Zellmechanismus; Spannung und dauerhafter Strom sind verschiedene Größen.',
'Electrode reactions, external electron flow and internal ion flow form one cell mechanism; voltage and sustained current are different quantities.'))
cases.append(new_case(IDS[4],'copper-silver-and-identical-halves',
'Neues fiktives Modell: Cu in Cu(NO3)2 links und Ag in AgNO3 rechts sind über Verbraucher und NaNO3-Salzbrücke verbunden. Cu verliert Masse, Ag wächst; Ag+/Ag besitzt hier das höhere Reduktionspotenzial. Formuliere Teilreaktionen und Gesamtreaktion, begründe Pole, Elektronen- und Brückenionenrichtung sowie das Entstehen einer Zellspannung. Dann werden nur die Standorte der Becher vertauscht: Welche fachlichen Zuordnungen bleiben? Ein Gegenfall hat zwei identische Cu/Cu2+-Halbzellen mit gleicher Konzentration und Temperatur. Begründe dessen fehlende Potenzialdifferenz ohne Zahlenrechnung.',
'Fresh fictional model: Cu in Cu(NO3)2 on the left and Ag in AgNO3 on the right are connected through a load and a NaNO3 bridge. Cu loses mass and Ag grows; Ag+/Ag has the higher reduction potential here. Write half-reactions and the overall reaction and justify poles, electron/bridge-ion directions and cell voltage. Only beaker locations are then swapped: which chemical assignments remain? A contrast has two identical Cu/Cu2+ half-cells at the same concentration and temperature. Explain its lack of potential difference without numerical calculation.',
'Cu→Cu2++2e−; 2Ag++2e−→2Ag; insgesamt Cu+2Ag+→Cu2++2Ag. Cu ist negative Anode und Ag positive Kathode; Elektronen fließen außen Cu→Ag, NO3− zur Cu- und Na+ zur Ag-Halbzelle. Unterschiedliche Potenziale begründen die Spannung. Ein Standorttausch ändert Oxidations-/Reduktionsrollen und Pole nicht; die räumliche Pfeilrichtung kehrt sich um. Gleiche Halbzellen bei gleichen Bedingungen haben gleiche Potenziale und somit keine Potenzialdifferenz.',
'Cu→Cu2++2e−; 2Ag++2e−→2Ag; overall Cu+2Ag+→Cu2++2Ag. Cu is the negative anode and Ag the positive cathode; electrons move externally Cu→Ag, NO3− into the Cu and Na+ into the Ag half-cell. Different potentials explain voltage. Swapping locations does not change chemical roles or polarity, although the spatial arrow reverses. Identical half-cells under identical conditions have equal potentials and no potential difference.',
'Zuordnungen werden aus Reaktionen und Bedingungen begründet, statt links/rechts oder ein bestimmtes Metall als dauerhafte Regel auswendig zu setzen.',
'Assignments follow reactions and conditions rather than memorized left/right or fixed-metal rules.'))
cases.append(new_case(IDS[5],'five-acid-names-and-aqueous-model',
'Fiktive Unterrichtskarten nennen Chlorwasserstoff, Salpetersäure, Schwefelsäure, Phosphorsäure und Kohlensäure; ein Laborblatt nennt Salzsäure als wässrige Chlorwasserstofflösung. Gib die fünf Stoffformeln an und ordne HNO3 und H3PO4 ihre Namen zu. Erläutere nach Arrhenius, warum die genannten sauren Lösungen eine gegenüber reinem Wasser erhöhte Oxoniumionenkonzentration haben. Formuliere die wässrige Reaktion von HCl mit Wasser. Vergleiche Chlorwasserstoffgas mit Salzsäure und beurteile „H3PO4 beschreibt alle tatsächlich vorhandenen Teilchen der Lösung“. Materialhinweis: schwache Säuren enthalten in Wasser undissoziierte Moleküle und Ionen; vollständige Dissoziation darf nicht für alle angenommen werden. Keine reale Tätigkeit und keine pH-Rechnung.',
'Fictional teaching cards name hydrogen chloride, nitric acid, sulfuric acid, phosphoric acid and carbonic acid; a lab sheet calls aqueous hydrogen chloride hydrochloric acid. Give the five substance formulas and name HNO3 and H3PO4. Use Arrhenius to explain the increased hydronium-ion concentration in these acidic solutions compared with pure water. Write the aqueous HCl/water reaction. Compare hydrogen chloride gas with hydrochloric acid and assess “H3PO4 describes every species actually present in the solution”. Given information: weak acids in water contain undissociated molecules and ions; complete dissociation must not be assumed for every acid. No real activity or pH calculation.',
'HCl, HNO3, H2SO4, H3PO4, H2CO3; HNO3 heißt Salpetersäure und H3PO4 Phosphorsäure. Im Arrhenius-Modell steigt durch die Säure in Wasser die H3O+-Konzentration; HCl+H2O→H3O++Cl−. H+(aq) ist eine Kurzschreibweise für solvatisierte Protonen und kein freies nacktes Proton in der Lösung. HCl(g) ist der Stoff, Salzsäure seine wässrige Lösung. Eine Stoffformel beschreibt die Zusammensetzung des Stoffs, nicht die vollständige Teilchenverteilung der Lösung; H3PO4 kann neben Ionen und Wasser als undissoziiertes Molekül vorliegen. Kartenabruf allein erklärt dies nicht.',
'HCl, HNO3, H2SO4, H3PO4, H2CO3; HNO3 is nitric acid and H3PO4 phosphoric acid. In the Arrhenius model the acid increases H3O+ in water; HCl+H2O→H3O++Cl−. H+(aq) denotes solvated protons rather than a bare free proton in solution. HCl(g) is the substance; hydrochloric acid is its aqueous solution. A substance formula specifies composition, not the complete distribution of solution species; undissociated H3PO4 can coexist with ions and water. Formula recall alone does not explain this.',
'Namen/Formeln dienen einer begründeten Unterscheidung von Stoff und wässrigem Teilchenmodell; starke und schwache Säuren werden nicht gleichgesetzt.',
'Names and formulas support a reasoned substance/aqueous-species distinction; strong and weak acids are not equated.'))
cases.append(new_case(IDS[5],'four-hydroxides-and-solution-names',
'Neuer fiktiver Datensatz: Natriumhydroxid, Kaliumhydroxid, Calciumhydroxid und Bariumhydroxid; zugehörige wässrige Lösungen heißen Natronlauge, Kalilauge, Kalkwasser und Barytwasser. Kalkwasser bezeichnet hier ausdrücklich die klare Lösung nach Abtrennung ungelösten Feststoffs. Gib die vier Stoffformeln an und beantworte die Rückwärtsfrage nach dem gelösten Stoff in Kalilauge und Barytwasser. Erläutere nach Arrhenius die Basenwirkung der gelösten Hydroxide und die beim Lösen von Ca(OH)2 entstehenden Ionen samt Verhältnis. Beurteile „Kalkwasser ist eine Suspension“ und „Die Lösung besitzt selbst die Summenformel NaOH“. Erkläre, warum gleiche Stoffmengen gelösten NaOH und Ca(OH)2 im gleichen Endvolumen im vollständigen Dissoziationsmodell unterschiedliche OH−-Beiträge liefern. Keine reale Herstellung.',
'Fresh fictional data: sodium hydroxide, potassium hydroxide, calcium hydroxide and barium hydroxide; aqueous solutions are sodium hydroxide solution, potassium hydroxide solution, limewater and baryta water. Limewater here explicitly means the clear solution after undissolved solid is removed. Give the four substance formulas and identify the solute in potassium hydroxide solution and baryta water. Use Arrhenius to explain dissolved hydroxides and state the ions and ratio produced by dissolved Ca(OH)2. Assess “limewater is a suspension” and “the solution itself has molecular formula NaOH”. Explain why equal amounts of dissolved NaOH and Ca(OH)2 at the same final volume produce different OH− contributions in the complete-dissociation model. No actual preparation.',
'NaOH, KOH, Ca(OH)2, Ba(OH)2; Kalilauge enthält gelöstes KOH, Barytwasser gelöstes Ba(OH)2. Die gelösten Hydroxide erhöhen die OH−-Konzentration. NaOH→Na++OH−; gelöstes Ca(OH)2→Ca2++2OH−. Das Ca2+:OH−-Verhältnis ist1:2; pro gelöster Formeleinheit entstehen zwei statt eines OH−. Dies ist eine stöchiometrische Modellfolge, keine Aussage über beliebig hohe Löslichkeit. Das definierte klare Kalkwasser ist keine Suspension. NaOH ist die Stoffformel des gelösten Hydroxids; die Lösung ist ein Gemisch aus Wasser und gelösten Teilchen und besitzt diese Formel nicht als Ganzes.',
'NaOH, KOH, Ca(OH)2, Ba(OH)2; potassium hydroxide solution contains dissolved KOH and baryta water dissolved Ba(OH)2. Dissolved hydroxides increase OH− concentration. NaOH→Na++OH−; dissolved Ca(OH)2→Ca2++2OH−. The Ca2+:OH− ratio is1:2 and each dissolved formula unit provides two rather than one OH−. This is a stoichiometric model consequence, not unlimited solubility. The stipulated clear limewater is not a suspension. NaOH is the solute formula; the whole solution is a mixture of water and dissolved species and does not have that formula.',
'Geänderte Namen/Formeln und mehrwertiges Hydroxid prüfen Transfer; der gelöste Stoff wird von der ganzen Lösung und ungelösten Bestandteilen getrennt.',
'Changed names/formulas and a divalent hydroxide test transfer; solute, whole solution and undissolved material remain distinct.'))
cases.append(new_case(IDS[7],'water-donor-and-acceptor',
'Fiktive Teilchenmodelle zeigen zwei getrennte wässrige Ansätze: HF mit Wasser und NH3 mit Wasser. Ergänze aus den vorgegebenen möglichen Teilchen HF,F−,H3O+,H2O beziehungsweise NH3,NH4+,OH−,H2O je eine Protonenübertragungs-Gleichung mit Gleichgewichtspfeil. Kennzeichne für die Hinreaktion Säure/Base, markiere den übertragenen Protonenweg und beide korrespondierenden Paare. Begründe aus beiden Fällen Wasser als Ampholyt. Erkläre den Unterschied zwischen einem H3O+-Teilchen und der ganzen sauren Lösung. Beurteile „Wasser ist immer nur eine Base“ und „Ein Säure-Base-Paar unterscheidet sich durch ein Elektron“. Gleichgewichtsmengen oder pH sollen nicht berechnet werden.',
'Fictional species models show two separate aqueous mixtures: HF with water and NH3 with water. From supplied possible species HF,F−,H3O+,H2O and NH3,NH4+,OH−,H2O, complete one proton-transfer equation with equilibrium arrows for each. Assign acid/base for the forward step, mark the proton path and both conjugate pairs. Use both cases to explain water as an ampholyte. Distinguish an H3O+ species from the entire acidic solution. Assess “water can only be a base” and “a conjugate pair differs by one electron”. Do not calculate equilibrium amounts or pH.',
'HF+H2O⇌F−+H3O+: HF spendet ein Proton, Wasser nimmt es auf; HF/F− und H3O+/H2O sind Paare. NH3+H2O⇌NH4++OH−: Wasser spendet ein Proton, NH3 nimmt es auf; NH4+/NH3 und H2O/OH− sind Paare. Wasser kann abhängig vom Partner Donator oder Akzeptor sein und ist Ampholyt. Korrespondierende Paare unterscheiden sich durch genau ein Proton, nicht durch ein Elektron. H3O+ ist eine Teilchenart; die saure Lösung ist ein Gemisch mit Wasser und weiteren Teilchen. Die Gleichungen bestimmen keine Gleichgewichtsmengen.',
'HF+H2O⇌F−+H3O+: HF donates a proton and water accepts it; pairs are HF/F− and H3O+/H2O. NH3+H2O⇌NH4++OH−: water donates and NH3 accepts; pairs are NH4+/NH3 and H2O/OH−. Water acts as donor or acceptor depending on its partner and is an ampholyte. Conjugate pairs differ by exactly one proton, not one electron. H3O+ is one species; an acidic solution is a mixture containing water and other species. Equations alone do not give equilibrium amounts.',
'Rollen, Paare und Stoffgemisch werden aus tatsächlichem Protonenwechsel begründet; Wasser erhält keine starre Rolle.',
'Roles, pairs and mixture distinctions follow actual proton transfer; water has no fixed role.'))
cases.append(new_case(IDS[7],'phosphate-ionic-ampholyte-transfer',
'Ein neuer formaler Modellfall enthält das Ion H2PO4− und Wasser. Vorgabe: H2PO4− kann in einer Protonenübertragung ein Proton abgeben oder eines aufnehmen. Formuliere beide möglichen Schritte mit Wasser und Gleichgewichtspfeilen; als weitere mögliche Teilchen stehen HPO4^2−,H3PO4,H3O+ und OH− bereit. Ordne für jeden Hin-Schritt Donator/Akzeptor und korrespondierende Paare zu und prüfe Atom- und Ladungserhaltung. Begründe, warum sowohl H2PO4− als auch Wasser je nach Partner/Schritt Säure oder Base sein können. Eine Lösung enthält Wasser sowie mehrere dieser Teilchenarten: Warum ist sie nicht identisch mit dem einzelnen H2PO4−-Ion? Aus der formalen Möglichkeit folgt keine Aussage, dass beide Schritte gleich stark ablaufen oder die Lösung neutral ist.',
'A fresh formal model contains H2PO4− and water. Given: H2PO4− may donate or accept one proton in a proton-transfer step. Write both possible water reactions with equilibrium arrows; other available species are HPO4^2−,H3PO4,H3O+ and OH−. Assign donor/acceptor and conjugate pairs for each forward step and check atom/charge conservation. Explain why both H2PO4− and water can be acid or base depending on partner/step. A solution contains water and several of these species: why is it not identical to an individual H2PO4− ion? Formal possibility does not establish equal reaction extent or a neutral solution.',
'H2PO4−+H2O⇌HPO4^2−+H3O+: H2PO4− ist Donator/Säure und H2O Akzeptor/Base; Paare H2PO4−/HPO4^2− sowie H3O+/H2O. H2PO4−+H2O⇌H3PO4+OH−: H2O ist Donator/Säure und H2PO4− Akzeptor/Base; Paare H3PO4/H2PO4− sowie H2O/OH−. Atome bleiben erhalten und beide Seiten haben jeweils Gesamtladung−1. Die Teilchen sind rollenabhängige Ampholyte; die ganze Lösung ist das Gemisch, nicht ein einzelnes Ion. Gleichgewichtslage, gleich große Umsatzanteile oder Neutralität werden ohne weitere Daten nicht behauptet.',
'H2PO4−+H2O⇌HPO4^2−+H3O+: H2PO4− is donor/acid and H2O acceptor/base; pairs H2PO4−/HPO4^2− and H3O+/H2O. H2PO4−+H2O⇌H3PO4+OH−: H2O is donor/acid and H2PO4− acceptor/base; pairs H3PO4/H2PO4− and H2O/OH−. Atoms are conserved and each side has total charge−1. These species have role-dependent ampholytic behaviour; the solution is their mixture, not a single ion. Equilibrium position, equal extents or neutrality are not inferred without further data.',
'Frischer Transfer mit geladenem Ampholyten, Ladungsprüfung und klarer Trennung formaler Gleichung von quantitativer Gleichgewichtsaussage.',
'Fresh transfer with a charged ampholyte, charge checking and a distinction between formal equations and quantitative equilibrium claims.'))
assert len(cases)==8
put('materials/eight-complete-DE-EN-native-P-case-materials.author.json',{'role':'AUTHOR complete tasks/material/answers/fresh transfer;2 exact earlier-reviewed label bodies and6 newly authored complete cases','cases':cases,'syntheticMaterial':True,'observedLearnerWork':False,'humanApproval':False})
put('materials/label-prototype-existing-reviewed-whole-understanding.json',prototype)
put('declared-input-snapshot-index.actual.json',{'role':'Exact author inputs at preparation; later tool input receipts are separately bound','inputs':inputs,'humanApproval':False})
print(json.dumps({'selected':9,'ready':4,'held':5,'cases':8,'wholeCandidateGoals':479,'newCurricularAtomicGoals':0,'inputSnapshots':len(inputs),'activeWrites':0}))
