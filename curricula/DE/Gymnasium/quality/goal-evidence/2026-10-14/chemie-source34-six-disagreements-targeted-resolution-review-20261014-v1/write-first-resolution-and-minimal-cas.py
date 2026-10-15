# Apache-2.0. Bounded inactive evidence preparation; no active writes.
import copy, datetime, hashlib, json, pathlib

R = pathlib.Path('/home/enpasos/projects/skillpilot')
E = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14'
O = pathlib.Path(__file__).parent
A = E / 'chemie-current402-no-jurisdiction34-whole-goal-source-and-target-scope-author-20261014-v1'
B = E / 'chemie-current402-source34-independent-scientific-b-first-verdict-20261014-v1'
PA = E / 'chemie-current402-no-jurisdiction34-source-target-scope-independent-a-20261014-v1'
F = E / 'chemie-NI-corrosion413-existing-whole94-target-preservation-counterreview-followup-root-20261014-v1'
T = E / 'chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1/candidate/canonical533.current407.corrected-P8-resources.inactive.json'

def read(p): return json.loads(p.read_text())
def write(name, value):
    p = O/name; p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')
    return p
def bind(p):
    return {'path':str(p.relative_to(R)), 'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes':p.stat().st_size}
def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00','Z')

four = read(O/'INPUT.exact-six-disputed-tuples-four-whole-goals.actual.json')
current = {g['id']:g for g in read(T)['goals']}
original = {g['id']:g for g in four['original402WholeGoals']}
context = read(O/'INPUT.complete-original-source-cells-all-current-mapped-whole-partners.actual.json')
source = {s['jurisdiction']:{g['id']:g for g in s['wholeSourceCells']} for s in context['states']}
corrosion='413c5ee5-7826-549f-ad76-63743c59b188'
aromatic='e96771d3-fd72-59e6-8f4c-573ef8cbde0a'
pu='f947cd04-952a-5a9d-9445-3ffc70e02c3c'
nano='afa7dae7-9378-5687-aa8d-69a04afaa0d8'
whole94='94a62b39-d4a2-5882-99d1-6886ead07726'
pla='0278a515-8990-5a1c-8a1b-a03382a144a3'
def cells(state, fragments):
    return [g for sid,g in source['DE-'+state].items() if any(f in sid for f in fragments)]

completed=now()
common={
 'courseProfile':'LK',
 'role':'Transparent targeted resolving source/scope review after disclosed peer inspection; not a blind first vote or a third-vote quota',
 'currentWholeGoalPreserved':True,
 'wholeSourceDutyClosureGranted':False,
 'operativeApplicabilityOrMappingGrant':False,
 'other27Source34OmissionsApproved':False,
 'newD_P_A_M_V_M7_HumanReleaseDecision':False,
 'actualHumanClassroomSelectionProven':False,
 'activeWrites':False,
}
records=[]
def record(state,gid,scope,reason,primary,fragments,preservation,limit):
    records.append({**common,'resolutionId':f'source34-targeted-resolution-{state.lower()}-{gid[:8]}-lk',
     'tuple':{'goalId':gid,'jurisdiction':'DE-'+state,'courseProfile':'LK'},
     'wholeCurrent407Goal':current[gid],'wholeOriginal402Goal':original[gid],
     'originalAndCurrentWholeGoalExactEqual':current[gid]==original[gid],
     'structuralTargetDecision':scope,
     'sourceContentFitDecision':'WHOLE_CURRENT_GOAL_IS_VALID_CONCRETE_CURRICULAR_OPERATIONALIZATION; no literal state product prescription',
     'scientificReasonDe':reason,'wholePhysicalPrimaryPages':primary,
     'wholeOriginalSourceCells':cells(state,fragments),
     'preservedRelevantWholePartners':[{ 'id':x, 'wholeCurrentGoal':current[x]} for x in preservation],
     'mappingSourceGrantDecision':limit,
     'scienceCompletedAt':completed})

record('NI',corrosion,'OMIT_EXACT_ADDITIONAL_NI_LK_DEFAULT_TARGET_AS_FULLY_PRESERVED_DUPLICATE',
 'Der ganze 413-Text verlangt die Bewertung von Schutzstrategien für Metalle/Legierungen. NI26 fordert Korrosionswissen, Opferanodenerklärung, tatsächliche Schutzexperimente, Redoxbewertung im Alltag/Technik und wirtschaftliche Schadensbeurteilung; NI47 nennt Schutz exemplarisch. Das ist fachlich passend, daher ist fehlendes Mapping kein Löschgrund. Der bereits vorhandene ganze 94a62-Text verlangt passive/aktive Maßnahmen einschließlich Beschichtungen, Schutzschichten, galvanischer Kopplung und Opferanoden sowie ökologische und ökonomische Bewertung; c95f enthält ausdrücklich Metalle und Legierungen. 94a62 ist vor/nach im NI-GK- und LK-Default Target. Damit bleibt jeder ausdrücklich genannte Aspekt des kurzen 413-Texts erwerbbar und beurteilbar. Ein zweites Default-Atom413 ist für diese Quelle nicht erforderlich. Die begrenzte Auslassung ist als Dublettenbereinigung begründet, nicht als Nichtgeltung von Korrosionsschutz und nicht als Freigabe alter Experiment-Mappings.',
 [26,47],['q-redox-3-kompetenz-003','q-redox-3-kompetenz-006','q-redox-3-kompetenz-007','q-redox-3-kompetenz-008','q-redox-3-kompetenz-009'],
 ['0908b3a2-9937-57de-8bfb-35a6de54aa1f','9f0d6d4c-f918-5a44-a9a2-7732c4e338f3','c95f6059-d7c2-5bcd-b61e-95e3577efdb2',whole94,'1df17884-96ae-57d7-9da9-dbebd082596f'],
 'No new mapping/applicability row to413. Existing whole94 protection/evaluation duty retained. The actual-experiment operator in006 is not discharged by either concise evaluation description; its existing distinct investigation partners/HOLDs remain intact.')

record('NI',aromatic,'RETAIN_CURRENT_NI_LK_TARGET_AS_CURATED_AROMATIC_EVALUATION_CONTEXT',
 'NI30 macht Benzol/Mesomerie/aromatischen Zustand und Erstsubstitution für eA verbindlich. Dieselbe ganze Seite verlangt grundlegende Gefahren-/Sicherheitsbeurteilung in Labor und Alltag sowie Rückführung des Stoffeinsatzes in einem technischen Verfahren auf Stoffeigenschaften. NI6–8 formulieren fach-/alltagsbezogene Anwendung, mehrperspektivische Kriterienbewertung und Transfer; NI11 erklärt, warum nicht jeder grundlegende Kompetenzoperator in jeder Tabellenzeile wiederholt wird. Der ganze e967-Text verbindet genau diese Operatoren mit dem verpflichtenden aromatischen Stoffbereich: Alltag, Industrie, Gesundheitsprobleme, fachliche Einordnung und Kriterienurteil. Er verlangt weder eine zusätzliche Synthesefamilie noch pauschale Giftigkeit aller Aromaten. Er ist ein legitimes kuratiertes verbindliches Lernbeispiel des bestehenden NI-LK-Programms. Allgemeine Bewertung allein könnte jedes beliebige Zusatzthema nicht legitimieren; hier sind der aromatische Stoffbereich und die konkreten Sicherheits-/Stoffeinsatzoperatoren auf NI30 direkt vorhanden. Der ganze Text bleibt erhalten.',
 [6,7,8,11,30],['q-organik-3-kompetenz-007','q-organik-3-kompetenz-011','q-organik-3-kompetenz-012','q-organik-3-kompetenz-013','q-organik-3-kompetenz-014','q-organik-3-kompetenz-015'],
 ['4bdbdf32-3021-5a0a-b412-b611166b2d21','b98f89e2-39f3-595b-9653-83e9412eecd1','1df17884-96ae-57d7-9da9-dbebd082596f','c7d4d9f7-d23f-44fc-bf22-3872e0f2b9a0'],
 'Whole-goal fit is a derived union, not a literal NI-e967 bullet. A bounded PARTIAL direct edge may use original007 for health/safety assessment and011 for technical-use interpretation; aromatic12–15 retain their full model/mechanism partners. No exact/whole-original-operator closure or unconditional mapping transport here.')

record('SH',pu,'RETAIN_CURRENT_SH_LK_TARGET_AS_CURATED_ONE_PLASTIC_MANUFACTURE_EXAMPLE',
 'SH62 nennt die Herstellung eines Kunststoffs; SH63 verlangt alle vier Sachgebiete bei zulässigen Schwerpunkten, SH68–70 machen Kunststoffe und Herstellung/Eigenschaften mindestens eines Kunststoffs verbindlich. Es handelt sich um die Konkretisierung eines verbindlichen Stoffbereichs, nicht um die Auswahl eines fakultativen ganzen Bereichs. Polyurethan ist ein zulässiger ausgewählter Kunststoff: seine Bildung durch Addition von Hydroxy- an Isocyanatgruppen und die dabei einschlägige trockene/wärmekontrollierte Reaktionsführung konkretisieren den Herstellungsoperator. Der knappe ganze f947-Text fordert keinen neuen industriellen Prozess und keinen zusätzlichen detaillierten LK-Kettenmechanismus. Das bereits explizite LK-GoalEntry kann diese statische Programmkuratierung leisten; es belegt keine tatsächliche Wahl einer bestimmten Schulklasse. Herstellung/Eigenschaften, Struktur/Wechselwirkungen, Rohstoffe/Recycling sowie die separat verbindlichen Ester- und radikalischen Mechanismen bleiben vollständig erhalten; PU ersetzt diese nicht.',
 [62,63,68,69,70],['3-2-chemie-der-funktionalen-stoffe-und-materialien-004','3-2-chemie-der-funktionalen-stoffe-und-materialien-008','3-2-chemie-der-funktionalen-stoffe-und-materialien-009'],
 ['3e9eb5d0-3407-5a1e-9492-ad87f98d303d','3aef6d91-04ff-5ec7-b92e-ccf330d9816a','6eb14e47-187c-5ba1-8b08-a0ee95ad88a9','9b942490-ad8f-52ba-8c5a-f8a9792b7db5','8721d943-8368-5304-bd3c-7d7944099662'],
 'Only the formation/manufacture component of original004 can have a new PARTIAL direct relationship. f947 contains no whole polymer-property profile; it cannot alone close original004, nor Ester008, Radical009, recycling or source-wide scope. No SH-GK PU obligation is granted.')

record('NI',nano,'RETAIN_CURRENT_NI_LK_TARGET_AS_CURATED_SELECTED_NANO_MATERIAL_CONTEXT',
 'NI32 und der tatsächlich betrachtete Fettdruck machen Größe, besondere Größeneigenschaften, Nanostruktur/Oberflächeneigenschaft, Oberflächenmodell, Wechselwirkungs-Erklärung und Chancen/Risiken ausgewählter Nanomaterialien für eA verbindlich. NI49 nennt Silberpartikel in Funktionskleidung als mögliches Beispiel; NI50 lässt alternative Kontexte zu. Der ganze afa-Text beschreibt Nano-Silber im ausgewählten Polyolefin-Verpackungskontext und stellt Nutzen-Risiko-Bezüge her. Das ist eine konkrete Anwendung des ausdrücklich verlangten ausgewählten Nanomaterials; es ist keine offizielle Festlegung auf Verpackungen und keine Behauptung allgemeiner antimikrobieller Wirkung beliebiger Nanopartikel. Partikelgröße, zugängliche Oberfläche und mögliche Silberionenfreisetzung dürfen fachlich erklärt werden, ohne Wirkung allein aus der geometrischen Oberfläche abzuleiten. Der breite Nano/Oberflächenpartner dfbcc samt Größenpartner5e2 bleibt erhalten: antimikrobielles Verhalten ersetzt weder die volle Oberflächen-/Wechselwirkungs-Erklärung noch ein tatsächlich zu nutzendes Modell.',
 [11,32,49,50],['q-makro-nano-kompetenz-024','q-makro-nano-kompetenz-025','q-makro-nano-kompetenz-026','q-makro-nano-kompetenz-027','q-makro-nano-kompetenz-028','q-makro-nano-kompetenz-029'],
 ['3e9eb5d0-3407-5a1e-9492-ad87f98d303d','5a30273a-98d5-5163-bb16-c250b7ed4e7f','5e2eb826-6e60-5273-91d6-c23f6dfa33b1','dfbccd62-1203-5d1b-927d-65a4ca41bbad','1df17884-96ae-57d7-9da9-dbebd082596f'],
 'Only original029 selected-material benefit/risk and bounded description aspects of026 justify PARTIAL direct relationships. afa alone closes none of024–029 whole original operator breadth. No NI-GK Nano applicability/target grant; old GK question remains separate.')

record('RP',nano,'RETAIN_CURRENT_RP_LK_TARGET_AS_CURATED_NANO_APPLICATION_AND_RISK_EXAMPLE',
 'Die vollständigen RP19/20 und tatsächlichen W/P-Ränder auf66/67 unterscheiden Grundfach-Wahl von Leistungsfach-Pflicht. 14.1–14.3 sind LK-Pflicht: mindestens eine Struktur/Eigenschaft, mindestens zwei Anwendungen, Chancen-/Risiko-Betrachtung anhand physikalisch-chemischer Eigenschaften, Persistenz, Bioakkumulation, Freisetzung/Umweltbelastung. RP66 nennt Nano-Silber und verlangt die Anpassung exemplarischer Kontexte an Forschung. Das ganze afa-Verpackungsziel ist eine zulässige konkrete kuratierte Anwendung mit Nutzen-Risiko-Bezügen innerhalb dieser LK-Pflicht. Es ist keine tatsächliche menschliche Schulwahl, kein universelles gesetzliches Produkturteil und kein ganzer Ersatz des Pflichtbereichs. Insbesondere ist eine Silber-Verpackung nur eine Anwendung; mindestens die zweite Anwendung und alle weiteren originalen Operatoren bleiben vollständig über getrennte Inhalte/Partner zu erhalten.',
 [19,20,66,67],['baustein-14-1-001','baustein-14-1-003','baustein-14-1-004','baustein-14-2-001','baustein-14-3-001','baustein-14-3-002'],
 ['5e2eb826-6e60-5273-91d6-c23f6dfa33b1','dfbccd62-1203-5d1b-927d-65a4ca41bbad','3e9eb5d0-3407-5a1e-9492-ad87f98d303d','1df17884-96ae-57d7-9da9-dbebd082596f'],
 'One application contribution to whole14.2 and limited selected-risk contributions to14.3 may be PARTIAL. >=2 application obligation is not closed by this single case or the generic dfbcc description without its actual evidence. Existing dubious broad mappings are preserved as history, not approved. RP-GK-Wahl remains unresolved; no optional-skip.')

record('SN',nano,'RETAIN_CURRENT_SN_LK_TARGET_AS_CURATED_NANO_STRUCTURE_PROPERTY_CONTEXT',
 'Die ganze physische59/gedruckte47 gehört ausdrücklich Jahrgang12-LK. Sie verlangt Anwenden von Struktur-Eigenschaftswissen auf Nanomaterialien, Nanostrukturen/Nanoteilchen und Einfluss der Nanostrukturen auf Oberflächeneigenschaften; rechts sind exemplarische Betrachtung, selbstreinigende/Riblet-Oberflächen als Hinweise abgesetzt. Die ebenfalls ganze Seite erhält nachhaltigen Umgang mit Wertstoffen und systematische Stoffstruktur/Eigenschaft/Verwendung. Der ganze afa-Text ist eine begrenzte ausgewählte Nano-/Polymeranwendung mit Nutzen-Risiko-Bezügen, die diese strukturelle Pflicht curricular konkretisieren darf. Er behauptet keine bakterielle Wirkung jeder Nanostruktur. Das ist ein kuratiertes Lernbeispiel im verbindlichen LK-Bereich; der fehlende Nachweis einer bestimmten tatsächlichen Klassenwahl macht dieses bereits geschriebene Programmbeispiel nicht fakultativ. Der volle dfbcc-Oberflächenoperator bleibt bestehen; Silberantimikrobiologie allein erfüllt keine ganze Oberflächentextur-Erklärung.',
 [44,45,58,59],['leistungskurs-lb3-082-01','leistungskurs-lb3-082-02','leistungskurs-lb3-082-03','leistungskurs-lb3-082-04'],
 ['5e2eb826-6e60-5273-91d6-c23f6dfa33b1','dfbccd62-1203-5d1b-927d-65a4ca41bbad','3e9eb5d0-3407-5a1e-9492-ad87f98d303d','1df17884-96ae-57d7-9da9-dbebd082596f','8721d943-8368-5304-bd3c-7d7944099662'],
 'A bounded PARTIAL descriptive link to original082-01 can be proposed; no full082 or source-wide closure. Original082-02 has a captured extraction bleed at the next sustainability heading, and082-03/04 belong to the separate sustainability/recycling duty per actual page. Old bytes/partners remain untouched. No SN-GK Nano grant or recycling remap to antimicrobial packaging.')

bindings=[bind(A/'NEUTRAL.exact34-whole-goal-source-and-scope-author-inputs.json'),bind(PA/'RECORDS.exact34-whole-goal-source-target-scope.independent-a.actual.jsonl'),bind(B/'REVIEW.first34-whole-goal-source-and-course-scope.independent-b.actual.json'),bind(B/'FIRST-SCIENCE-SEAL.manifest.json'),bind(F/'SCIENCE.one-NI-default-scope-HOLD-resolved-by-existing-whole-judgement-partner.actual.json'),bind(F/'CHECK.whole94-and-413-original-bodies-and-two-course-stock-target-preservation.actual.json'),bind(T),bind(A/'inputs/canonical.whole.before.json')]
for s in context['states']:
    bindings.extend([s['wholeSourceExtractionBinding'],*[c['wholeCarrierBinding'] for c in s['existingMappingCarriers']]])
for s in ['NI','SH','RP','SN']:
    primary=read(O/f'PRIMARY.{s}.actual-full-pages.independent-reread.json')
    bindings.extend([primary['sourcePdf'],bind(O/f'PRIMARY.{s}.actual-full-pages.independent-reread.json')])
bindings.extend([bind(O/'INPUT.exact-six-disputed-tuples-four-whole-goals.actual.json'),bind(O/'INPUT.complete-original-source-cells-all-current-mapped-whole-partners.actual.json')])
bindings.extend(bind(p) for p in sorted((O/'primary-layouts').glob('*.png')))
seen=set();bindings=[b for b in bindings if not (b['path'] in seen or seen.add(b['path']))]
note={
 'schemaVersion':1,'startedAt':read(O/'STARTED.actual.json')['startedAt'],'scienceCompletedAt':completed,
 'reviewer':'/root/chemie_native8_fresh_independent_b','provider':'OpenAI','model':'GPT-6','servingModelVersion':'not exposed','samplingControls':'not exposed',
 'role':common['role'],
 'priorHistoryDisclosure':['Original Source34 proposal author; not original independent Source34 ScienceA or ScienceB','Author of39-entry technical scope-preservation plan; that plan was not a source/science vote','Prior PE2652 case author and scoped NI2652-source-A role do not grant any new P science here','Original A/B disagreements and Root94 followup read openly before this reconciliation; no blind independence claim'],
 'fullActualInputBindings':bindings,
 'actualReadMethod':'Independent pdftotext -layout full physical pages; PDF SHA rechecked; entire selected whole DE/EN goal descriptions/requires/contains and all63 original cells/all131 current mapped partner and contained-child descriptions read; actual NI32/SH70/RP66/SN59 full-page PNGs inspected for columns/course markers.',
 'pageExtractionNormalization':'Independent single-page extraction differs in final formfeed/whitespace from previously sealed capture; all23 independently reread pages match after whitespace normalization. Raw independent text and original capture both preserved.',
 'records':records,
 'summary':{'exactDisputedTuples':6,'distinctWholeGoals':4,'retainCuratedMandatoryLKTargets':5,'omitExactAdditionalDuplicateLKTarget':1,'sourceWholeOperatorClosureGrants':0,'actualHumanSelectionsProven':0,'other27OmissionsApproved':0,'activeWrites':0},
 'separateGraphFinding':{'goalId':corrosion,'exactWrongCurrentGlobalEdge':{'from':corrosion,'requires':pla},'wholeCurrentDependent':current[corrosion],'wholeCurrentPLA':current[pla],
  'scientificReasonDe':'PLA-Synthese/Eigenschaften sind keine fachliche Voraussetzung für die Bewertung von metallischem Korrosionsschutz. Die tatsächlichen benötigten Korrosions-/Redox- und Bewertungsgrundlagen liegen bei0908/9f0/c95/94 und1df. Diese eine globale Requires-Kante ist ein getrenntes Graphproblem. Sie darf weder die Löschung der ganzen PLA-Kompetenz noch einen NI-Polykondensationsnachweis rechtfertigen. Eine Ersatz-Kantenentscheidung/native-Bindung ist nicht Bestandteil dieser sechs Scope-Auflösungen.',
  'globalEdgeChanged':False,'PLAWholeCompetenceRemoved':False,'NIPolycondensationDutyClaimed':False},
 'preservation':'Original source cells, complete existing mapping partner unions and goal/resource bodies preserved; old science verdicts remain historical findings. The new reconciliation changes the limited scope interpretation explicitly and never relabels old A/B decisions.',
 'strictGain':0,'humanApproval':False,'releaseClaim':False
}
p=write('SCIENCE.first-six-disagreements-targeted-transparent-resolution.actual.json',note)
first=write('SEAL.first-science-six-disagreements.actual.json',{'schemaVersion':1,'sealedAt':now(),'scienceCompletedAt':completed,'science':bind(p),'fullActualInputBindings':bindings,'scope':'Exactly6 LK tuples; transparent resolving review; no third-vote quota/whole-source closure or other27 approval'})
print('FIRST SCIENCE SEALED',bind(first))

# Mechanical candidate preparation follows the first sealed scientific note.
cas=[]
for state in ['NI','SH','RP','SN']:
    before=A/f'inputs/{state}.lk.view.whole.before.json';v=read(before);removed=[]
    def walk(nodes):
        out=[]
        for n in nodes:
            if state=='NI' and n.get('kind')=='goalEntry' and n.get('goalId')==corrosion:
                removed.append(copy.deepcopy(n));continue
            n=copy.deepcopy(n)
            if 'children' in n:n['children']=walk(n['children'])
            out.append(n)
        return out
    v['rootNodes']=walk(v['rootNodes'])
    assert len(removed)==(1 if state=='NI' else 0)
    after=write(f'proposals/{state}.lk.view.exact-six-resolution-only.inactive.json',v)
    cas.append({'jurisdiction':'DE-'+state,'courseProfile':'LK','beforeFrozenWholeFile':bind(before),'afterInactiveWholeFile':bind(after),'removedExplicitEntries':removed,
      'retainedDisputedExplicitGoalIds':[r['tuple']['goalId'] for r in records if r['tuple']['jurisdiction']=='DE-'+state and r['structuralTargetDecision'].startswith('RETAIN')],
      'scientificResolutionBinding':bind(p),'allUnrelatedGoalEntriesAndViewMetadataPreserved':True,'scope':'Only these6 decisions; original other27 omissions NOT applied'})
write('CAS.four-whole-LK-views-exact-six-resolution-only.inactive.json',{'schemaVersion':1,'rows':cas,'newMappingRows':0,'globalCanonicalMutation':False,'sourceRowsMutation':False,'wholeOriginalPartnerUnionMutation':False,'other27Source34OmissionsApplied':False,'activation':False})
write('NEUTRAL.exact-six-resolving-source-scope-inputs-and-candidate-bindings.json',{'schemaVersion':1,'role':'transparent targeted reconciliation, prior author role disclosed','exactTuples':[r['tuple'] for r in records],'fullActualInputBindings':bindings,'firstScience':bind(p),'firstScienceSeal':bind(first),'CAS':bind(O/'CAS.four-whole-LK-views-exact-six-resolution-only.inactive.json'),'strictGain':0,'activeWrites':False})
