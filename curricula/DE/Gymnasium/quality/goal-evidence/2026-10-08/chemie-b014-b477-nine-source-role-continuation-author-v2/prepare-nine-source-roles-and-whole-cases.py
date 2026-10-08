#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Inactive bounded source-role continuation; retain valid goal evidence exactly."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, math, subprocess

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
PARENT = 'b4777001-f4ed-5fe9-9d98-02319abdea09'
BRON = '1c1420c2-a8e2-520f-8015-6df637a973bd'
IND = 'd2ccd1d5-56f7-583f-9724-e97441367f91'
IONS = 'fd309753-4d48-5570-a4ec-09dfeb20ff9c'
PK = '48115ff7-7aca-5d0b-a9e7-7fc6c78434ef'
MODEL = '277a3c20-6082-5a95-be08-c1e386efe79b'
PRIOR = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-eleven-source-remediation-independent-a-v1'
INPUTS = {}
def stable(x): return json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
def sha(b): return hashlib.sha256(b).hexdigest()
def bind(p):
    b=(ROOT/p).read_bytes(); INPUTS[p]=dict(path=p,sha256=sha(b),bytes=len(b));return INPUTS[p]
def read(p): bind(p);return json.loads((ROOT/p).read_text())
def write(p,x): (HERE/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')

registry_path='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry=json.loads((ROOT/registry_path).read_text())
chem=next(x for x in registry['subjects'] if x['subject']=='chemie')
canon=read(chem['landscapePath']);by={g['id']:g for g in canon['goals']}
central_path='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-twelve-reviewed-active-integration-root-v1/active-after-twelve-central.actual.json'
central=next(x for x in read(central_path)['subjects'] if x['subject']=='chemie')
strict=set(central['strictCompleteGoalIds'])
assert all(p in strict for p in [BRON,IND,IONS]) and PARENT not in strict
assert 'jeweilige Überwiegen' in by[IONS]['description']
old=read(PRIOR+'/three-split-holds-with-existing-reuse-first-solutions.json')
old_b477=next(x for x in old['rows'] if x['fromGoalId']==PARENT)
for name in ['fresh-official-url-resolution-and-page-bindings.receipt.json','actual-primary-http-byte-bindings.receipt.json','actual-bayern-http-and-operator-bindings.receipt.json']:
    bind(PRIOR+'/'+name)
bind('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')

atlas_path='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
atlas=read(atlas_path);duties=[]
for mp in atlas['mappingPaths']:
    mapping=json.loads((ROOT/mp).read_text())
    selected=[(i,d) for i,d in enumerate(mapping['decisions']) if PARENT in d.get('canonicalGoalIds',[])]
    if not selected:continue
    bind(mp);ex=read(mapping['sourceExtractionPath']);sb={g['id']:g for g in ex['sourceGoals']}
    for i,d in selected:
        sg=sb[d['sourceGoalId']]
        duties.append(dict(sourceGoalId=sg['id'],jurisdiction=ex.get('jurisdiction'),mappingPath=mp,
            decisionIndex=i,mappingBinding=INPUTS[mp],wholeOriginalDecision=d,wholeOriginalDecisionSha256=sha(stable(d).encode()),
            sourceExtractionPath=mapping['sourceExtractionPath'],sourceExtractionBinding=INPUTS[mapping['sourceExtractionPath']],
            wholeOriginalSourceGoal=sg,wholeOriginalSourceGoalSha256=sha(stable(sg).encode()),
            wholeOriginalPartnerGoalIds=d['canonicalGoalIds'],wholeCurrentPartnerGoals=[by[p] for p in d['canonicalGoalIds']],
            currentStrictPartnerGoalIds=[p for p in d['canonicalGoalIds'] if p in strict],
            wholeOriginalMappingEdges=[e for e in mapping['mappings'] if e['legacyGoalId']==sg['id']]))
assert len(duties)==9
write('nine-current-whole-original-source-duties-and-partners.json',dict(schemaVersion=1,
    role='All nine current direct original source duties, full partner tuples and unchanged source text; no universal obligation inferred from a partner row.',
    currentCentralBinding=INPUTS[central_path],currentChemistryStrict=central['strictComplete'],currentAtomicDenominator=central['denominator'],entries=duties))

pages={
    'BB-acid-base':('curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf',44,44),
    'BE-acid-base':('curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf',44,44),
    'BW-basis':('curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf',27,25),
    'BW-advanced':('curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf',34,32),
    'HB-E-current2026':(PRIOR+'/hb-live-preface2026.pdf',20,20),
    'HB-Q-current2026':(PRIOR+'/hb-live-preface2026.pdf',23,23),
    'HB-E-retained':('curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf',20,20),
    'HB-Q-retained':('curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf',23,23),
    'HE-G9':('curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf',25,24)}
readings={};texts={}
for key,(p,physical,printed) in pages.items():
    text=subprocess.check_output(['pdftotext','-layout','-f',str(physical),'-l',str(physical),str(ROOT/p),'-'],text=True)
    texts[key]=text; readings[key]=dict(primaryBinding=bind(p),physicalPage=physical,printedPage=printed,
        actualWholePageAuthorRead=True,actualWholePageTextSha256=sha(text.encode()),thirdPartyWholePageNewCopy=False)
assert texts['HB-E-current2026']==texts['HB-E-retained']
assert texts['HB-Q-current2026']==texts['HB-Q-retained']
assert 'Nachweisreaktionen' in texts['BB-acid-base'] and 'Grundkurs' in texts['BB-acid-base']
assert '(10) Säure-Base-Reaktionen' in texts['BW-basis'] and 'Carbonat-Ion' in texts['BW-basis']
assert '(1) Säure-Base-Reaktionen' in texts['BW-advanced']
assert 'stellen das Donator-Akzeptor-Prinzip' in texts['HB-E-current2026']
assert 'wenden das Massenwirkungsgesetz' in texts['HB-Q-current2026'] and 'Teilchenebene' in texts['HB-Q-current2026']
assert 'Wassermolekül als Ampholyt' in texts['HE-G9']
write('actual-primary-whole-page-locators-and-operator-boundaries.json',dict(schemaVersion=1,
    role='Actual whole primary pages read for this bounded source-role delta. No new independent review or full historical restart.',
    readings=readings,currentHB2026ExactRelevantWholePagesEqualRetained=True,
    inheritedCurrentHBLocatorReceipt=PRIOR+'/fresh-official-url-resolution-and-page-bindings.receipt.json',
    sourceLocatorCorrection=dict(sourceGoalId='bw-chem-sekii-3-3-2-b10-a01-0ff67bb7',
        retainedOriginalSourceRef='Bildungsplan 2016 Gymnasium Chemie Baden-Wuerttemberg, 3.3.2 (10), S. 24.',
        actualPhysicalPage=27,actualPrintedPage=25,exactOriginalOperator='Säure-Base-Reaktionen mithilfe der Theorie von Brønsted beschreiben (Donator-Akzeptor-Prinzip)',
        smallestInactiveCorrection='Versioned locator correction to printed S.25, physical PDF page27; source ID, full original text and old extraction bytes retained.',activeCorrection=False),
    importantOriginalBoundaries=[
        'BB/BE Nachweisreaktionen is in the acid-base Brønsted GK table; the organic functional-group family is not stated by this row.',
        'BW 3.3.2(10) and 3.4.3(1) describe Brønsted donor/acceptor reactions. Adjacent five-ion detection and equilibrium rows are separate original obligations.',
        'HB E page20 states explanation, donor/acceptor representation and reaction equations. Conjugate-pair phrasing in its extraction is derived rather than a literal separately printed page20 phrase.',
        'HB Q page23 states MWG on protolysis equilibria and particle-level justification of both acid and base strength. The extracted pK wording is derived; pure pK sorting cannot replace those original performances.',
        'HE G9 whole10.3(3.3) states donor/acceptor, conjugate pairs and water ampholyte. It does not impose a new reaction-direction/model-reflection goal there.'
    ],humanApproval=False,humanTrial=False))

roles=[];deltas=[];remaining=[]
for d in duties:
    sid=d['sourceGoalId'];partners=d['wholeOriginalPartnerGoalIds']
    common=dict(sourceGoalId=sid,wholeOriginalTextAndTuplePreserved=True,independentSourceApproval=False,
        currentStrictEvidenceReuseGoalIds=[p for p in [BRON,IND,IONS] if p in strict],activeWrites=False)
    if sid.startswith(('bw-','he-')) or ('-3-2-e-saeure-base-' in sid):
        after=[p for p in partners if p!=PARENT]
        assert BRON in after
        rationale=('Current strict Brønsted whole goal and its unchanged two complete positive cases cover this actual narrow original operator. '
            'Remove only the overbroad B477 operative source role; do not convert adjacent source rows into additional duties or inherit their review. '
            'All other existing partner roles and source identity/text/course/stage metadata are retained for their actual claims.')
        delta=dict(**common,mappingPath=d['mappingPath'],decisionIndex=d['decisionIndex'],
            authorStatus='bounded_source_role_delta_ready_for_independent_recheck',
            fieldDeltas=[dict(pointer='/decisions/'+str(d['decisionIndex'])+'/canonicalGoalIds',before=partners,afterCandidate=after)],
            removeOnlyMappingEdges=[e for e in d['wholeOriginalMappingEdges'] if e['canonicalGoalId']==PARENT],
            retainedMappingEdges=[e for e in d['wholeOriginalMappingEdges'] if e['canonicalGoalId']!=PARENT],
            candidateRationale=rationale,newReviewedAtOrReviewerNotAssigned=True,
            retainedExistingOtherPartnerGoalIds=[p for p in after if p!=BRON],
            wholeOriginalDecision=d['wholeOriginalDecision'],wholeOriginalSourceGoal=d['wholeOriginalSourceGoal'])
        deltas.append(delta)
        roles.append(dict(**common,authorStatus=delta['authorStatus'],wholeOperatorCandidateGoalId=BRON,
            actualPrimaryReadingKeys=(['BW-basis'] if '-3-3-2-' in sid else ['BW-advanced'] if sid.startswith('bw-') else ['HE-G9'] if sid.startswith('he-') else ['HB-E-current2026']),
            retainedWholeUnderstanding='Two unchanged 1c whole cases already demonstrate conjugate proton roles, equations, water in both roles and species-versus-mixture limits.',
            sourceRoleDeltaOnly=True,newScienceReviewOfValidGoal=False))
    else:
        detection=sid.startswith(('bb-','be-'))
        r=dict(**common,authorStatus='whole_original_operator_author_cases_ready_for_independent_review_not_yet_resolved',
            actualPrimaryReadingKeys=[('BB-acid-base' if sid.startswith('bb-') else 'BE-acid-base') if detection else 'HB-Q-current2026'],
            exactRemainingWholeOriginalPerformance=(
                'Apply and interpret an acid-base detection reaction in the Brønsted context. The original one-word content row does not prescribe the organic functional-group family or prove that all aqueous mixtures contain just one ion species.' if detection else
                'Apply MWG to reversible protolysis and justify BOTH acid and base strength on the particle level; preserve the whole Q-stage operator, not only derived pK sorting.'),
            existingReusableGoalIds=([IND,IONS,BRON] if detection else [PK,'ca216bc6-5205-5b46-abbd-fd5628e4ca5b']),
            heldOriginalPartnerScope=(
                '3de is a separate broad organic functional-group detection goal. Neither its unrelated family list nor B477 broad three-performance text is a narrow exact acid-base detection witness.' if detection else
                '481 remains held on its current entire goal; strict ca216 only proves its existing structural acid-strength cases, not every MWG/base-strength source duty. New source cases below do not approve either whole goal.'),
            candidateWholeMaterialCaseIds=(['acid-base-indicator-reaction-and-controls-v2','fresh-bromothymol-proton-reaction-and-interference-v2'] if detection else
                ['weak-carboxyl-protolysis-MWG-strength-and-Q-v2','fresh-inductive-distance-acid-and-base-strength-v2']),
            smallestCorrectNextProposal=(
                'Independently test the unchanged d2/fd/1c union plus the two explicit new reaction source-witness cases. Remove the broad organic-family edge only if the exact acid-base row is actually preserved; no automatic whole-row approval or new detection atom is made here.' if detection else
                'Independently test the two new whole quantitative/particle source-witness cases for the actual Q operator and reuse 481 for its proved MWG role; retain ca216 as structural knowledge only. If they are adopted, require current full 481 D/P/A/M/V and its other actual bindings; do not narrow this row to the old B477 E-stage direction template.'),
            remainingScienceOrReuseDecision=True)
        remaining.append(r);roles.append(r)
assert len(deltas)==6 and len(remaining)==3
write('six-limited-operative-source-role-deltas.inactive.json',dict(schemaVersion=1,
    status='inactive_author_candidate_independent_source_review_pending',entries=deltas,
    sourceIdentityTextCourseStageChanges=0,goalTextOrContextChanges=0,independentApprovals=0,activeBindingRestorations=0))
write('nine-whole-source-role-assessments-and-remaining-performances.json',dict(schemaVersion=1,entries=roles,
    boundedRoleDeltaRows=6,wholeOriginalRemainingSourceRows=3,unresolvedCurrentWholeB477=True,
    trueRemainingGoalFacets=['Three independent current B477 performances remain semantically bundled.',
        'Model reflection has a genuine generic process source, but its exact current goal reuse/stage/placement needs a separate decision; no universal acid-base-specific original clause is invented.',
        'Direction from K or relative strengths must distinguish equilibrium preference from current Q-based thermodynamic direction and from speed. The supplied E-stage old template alone does not fulfil the whole Q MWG/particle-strength operator.'],
    supersededHistoricalHold=dict(priorPath=PRIOR+'/three-split-holds-with-existing-reuse-first-solutions.json',
        oldFd309PresenceConcernNoLongerCurrent=True,actualCurrentFd309Description=by[IONS]['description'],
        resolution='fd309 now explicitly uses whichever ion predominates and its valid whole P cases demonstrate both ions present. Reuse those exact accepted current records; do not review or correct them again.'),
    newScientificWholeGoalApprovals=0,strictNetIncrease=0))

def case(key,source_prefix,existing,material_de,material_en,task_de,task_en,answer_de,answer_en,focus_de,focus_en,transfer_de,transfer_en,limits):
    return dict(caseLocalKey=key,sourceGoalIds=[d['sourceGoalId'] for d in duties if d['sourceGoalId'].startswith(source_prefix)],
        existingReuseCandidates=existing,status='inactive_original_source_operator_author_witness_not_goal_approval',
        material=dict(de=material_de,en=material_en),learnerTask=dict(de=task_de,en=task_en),
        modelAnswer=dict(de=answer_de,en=answer_en),positiveUnderstandingEdge=dict(de=focus_de,en=focus_en),
        transfer=dict(de=dict(task=transfer_de[0],expected=transfer_de[1]),en=dict(task=transfer_en[0],expected=transfer_en[1])),
        materialAndSourceLimits=limits,actualLearnerOrExperimentEvidence=False,license='CC-BY-4.0')

cases=[]
cases.append(case('acid-base-indicator-reaction-and-controls-v2',('bb-','be-'),[IND,IONS,BRON],
    ['Gegeben ist ein vereinfachtes, einprotoniges Indikatormodell bei25°C: HIn ist rot, In− blau; Mischfarben sind möglich. HIn+H₂O ⇌ In−+H₃O⁺. Der Indikator wird nur in Spuren verwendet.',
     'Kalibrierung mit farblosen Referenzen: pH3 rot, pH7 violett, pH11 blau. Unter denselben Bedingungen zeigt unbekannte farblose Probe A rot und Probe B blau; Wasser- und Indikatorblindprobe violett. Die Befunde sind bereitgestellt, kein durchgeführter Lernendenversuch wird behauptet.'],
    ['A simplified monoprotic indicator model at25°C is supplied: HIn is red and In− blue; mixtures may show intermediate colors. HIn+H₂O ⇌ In−+H₃O⁺. Only trace indicator is used.',
     'Colorless calibration references give red at pH3, violet at pH7 and blue at pH11. Under the same conditions unknown colorless A is red, B blue and the water/indicator blank violet. These are supplied observations, not a claim that a learner performed an experiment.'],
    'Deute A und B mithilfe der Kalibrierung und formuliere die Protonenreaktion von In− mit H₃O⁺ sowie von HIn mit OH−. Erkläre, welchen Nachweis die Farben erlauben und ob eine Farbe die Abwesenheit der anderen Ionenart beweist.',
    'Interpret A and B using the calibration and write the proton reaction of In− with H₃O⁺ and of HIn with OH−. Explain what the colors support and whether a color establishes absence of the other ion species.',
    'A ist in diesem kalibrierten Modell sauer, B basisch. In−+H₃O⁺ ⇌ HIn+H₂O: In− akzeptiert, H₃O⁺ spendet ein Proton. HIn+OH− ⇌ In−+H₂O: HIn spendet, OH− akzeptiert. Atome und Ladungen bleiben erhalten. Farbe weist hier den sauren/basischen Zustand über eine Protonenreaktion nach; sie bestimmt weder einen exakten pH noch die Identität des gelösten Stoffes. In Wasser sind beide Ionenarten vorhanden: sauer bedeutet c(H₃O⁺)>c(OH−), basisch umgekehrt. Der violette Blindbefund ist kein Beweis für Ionenfreiheit.',
    'In this calibrated model A is acidic and B basic. In−+H₃O⁺ ⇌ HIn+H₂O: In− accepts and H₃O⁺ donates a proton. HIn+OH− ⇌ In−+H₂O: HIn donates and OH− accepts. Atoms and charge are conserved. Color here indicates acidic/basic conditions through a proton reaction; it supplies neither an exact pH nor the dissolved solute identity. Both ion species occur in water: acidic means c(H₃O⁺)>c(OH−), basic the reverse. The violet blank does not establish absence of ions.',
    'Die Indikatorfarbe wird durch die eigene Protonenreaktion verständlich; qualitative Überwiegen-Aussage, Teilchenpräsenz und Stoffidentität werden unterschieden.',
    'The indicator color is explained by its proton reaction; qualitative predominance, species presence and solute identity are distinguished.',
    ('A wird mit farblosem Wasser verdünnt und bleibt rot; eine zweite unbekannte Probe ist bereits ohne Indikator rot. Welche unterschiedlichen Grenzen gelten?',
     'Bei verdünntem A trägt die kalibrierte Farbe weiter eine qualitative saure Einordnung, nicht den exakten neuen pH oder gleiche Konzentration. Bei der eigenfarbigen Probe kann dieselbe Rotfarbe interferieren; mit Blindprobe/geeigneter anderer Methode kontrollieren und bis dahin keine sichere Indicator-Einordnung behaupten.'),
    ('A is diluted with colorless water and remains red; another unknown is already red without indicator. What different limits apply?',
     'For diluted A the calibrated color still supports qualitative acidic classification, not its exact new pH or unchanged concentration. The intrinsically colored sample may interfere; use a blank/appropriate other method and withhold a reliable indicator classification until controlled.'),
    ['Own simplified trace-indicator model and supplied observations; not copied provider exercise, no actual performance or Human Trial.',
     'Only acid-base detection under the original contextual content row is addressed; no organic functional-group family or five-ion BW adjacent source row is claimed complete.']))
cases.append(case('fresh-bromothymol-proton-reaction-and-interference-v2',('bb-','be-'),[IND,IONS,BRON],
    ['Für einen neuen farblosen Satz wässriger Proben bei25°C ist eine eigene Bromthymolblau-Kalibrierung gegeben: saure Referenz gelb, neutrale Referenz grün, basische Referenz blau. HIn/In− steht hier für das vereinfachte farbwirksame Protonenpaar; HIn gelb, In− blau.',
     'Probe X bleibt mit dem Indikator gelb, Probe Y wird blau, Blindprobe Wasser grün. Probe Z ist vor der Zugabe gelb und danach ebenfalls gelb. Nach geeigneter, separat bereitgestellter pH-Meter-Prüfung ist Z basisch.'],
    ['For a fresh set of colorless aqueous samples at25°C an independently supplied bromothymol-blue calibration gives yellow for acidic, green for neutral and blue for basic reference. HIn/In− denotes the simplified color-active proton pair; HIn yellow, In− blue.',
     'X is yellow with indicator, Y blue and the water blank green. Z is yellow before and after indicator addition. An appropriate separately supplied pH-meter check establishes that Z is basic.'],
    'Begründe X und Y, formuliere die passende Indikator-Protonenreaktion für jede Probe und löse den scheinbaren Widerspruch bei Z. Welche Aussage über die Mengenrelation der beiden Wasserionen ist durch den geeigneten Befund gestützt?',
    'Justify X and Y, write the applicable indicator proton reaction for each and resolve the apparent contradiction for Z. Which relative concentration claim about the two water ions is supported by the appropriate observation?',
    'X ist nach gültiger farbloser Kalibrierung sauer: In−+H₃O⁺ ⇌ HIn+H₂O begünstigt die gelbe Form unter sauren Bedingungen. Y ist basisch: HIn+OH− ⇌ In−+H₂O begünstigt die blaue Form unter basischen Bedingungen. Z kann aus seiner Eigenfarbe nicht sicher gelb=sauer zugeordnet werden. Die unabhängige geeignete Messung stützt dort c(OH−)>c(H₃O⁺), trotz sichtbarer Gelbfarbe. Die jeweils andere Ionenart ist nicht abwesend. Weder X/Y-Farbe noch Z-Meter-Befund identifizieren allein eine funktionelle Gruppe oder den gelösten Stoff.',
    'The valid colorless calibration classifies X as acidic: In−+H₃O⁺ ⇌ HIn+H₂O favors the yellow form in acidic conditions. Y is basic: HIn+OH− ⇌ In−+H₂O favors the blue form in basic conditions. Intrinsic Z color prevents a reliable yellow=acidic assignment. The appropriate independent measurement supports c(OH−)>c(H₃O⁺) in Z despite its visible yellow color. The other ion species is not absent. Neither X/Y color nor the Z measurement alone identifies a functional group or the solute.',
    'Ein neuer Indikator wird über seine eigene Referenz und Protonenreaktion übertragen; Messbefund und störende Eigenfarbe werden fachlich getrennt.',
    'A fresh indicator is transferred using its own reference and proton reaction; valid measurement and interfering sample color are distinguished.',
    ('Ein Lernender überträgt das rote HIn des ersten Falls ungeprüft auf Bromthymolblau. Korrigiere die Prognose fachlich und nenne eine ausreichende Kontrolle.',
     'HIn bezeichnet je nach Indikator ein anderes chemisches Teilchen; gleiche Protonenlogik bedeutet nicht gleiche Farbe. Die aktuelle eigene gelb/grün/blau-Kalibrierung und eine Blindprobe müssen verwendet werden.'),
    ('A learner copies the first case\'s red HIn color directly to bromothymol blue. Correct the prediction and name an adequate control.',
     'HIn denotes different chemical species for different indicators; the same proton logic does not imply the same color. Use the current supplied yellow/green/blue calibration and a blank.'),
    ['Supplied fresh calibrated observations; trace simplified HIn model does not reproduce the complete molecular structure of the real dye.',
     'No learner execution, exact pH inference or new approval of the unchanged d2/fd/1c goals is claimed.']))
cases.append(case('weak-carboxyl-protolysis-MWG-strength-and-Q-v2','hb-chemistry-sekii-gyo2022-3-3-1-2', [PK,'ca216bc6-5205-5b46-abbd-fd5628e4ca5b'],
    ['Gegeben sind verdünnte wässrige Modelle bei25°C mit Aktivitäten näherungsweise c/c°. Wasseraktivität wird in Ka/Kb aufgenommen; pKw=14. Gerundete Modellwerte: CH₃COOH pKa4,8; ClCH₂COOH pKa2,9. Beide Carboxylate teilen die Ladung über zwei O-Atome; Cl wirkt in dieser Reihe über σ-Bindungen elektronenziehend.',
     'Betrachte ClCH₂COOH+CH₃COO− ⇌ ClCH₂COO−+CH₃COOH. Ein bereitgestellter Nichtgleichgewichtszustand hat c(ClCH₂COOH)=0,0001mol/L, c(CH₃COO−)=0,0001mol/L, c(ClCH₂COO−)=0,001mol/L, c(CH₃COOH)=0,008mol/L. Erforderliche Gegenionen sind vorhanden; sie werden im Protonenmodell ausgelassen.'],
    ['Dilute aqueous models at25°C use activities approximated by c/c°. Water activity is incorporated into Ka/Kb and pKw=14. Rounded model inputs: CH₃COOH pKa4.8, ClCH₂COOH pKa2.9. Both carboxylates distribute charge over two oxygens; in this series Cl withdraws electron density through sigma bonds.',
     'Consider ClCH₂COOH+CH₃COO− ⇌ ClCH₂COO−+CH₃COOH. A supplied non-equilibrium composition has c(ClCH₂COOH)=0.0001mol/L, c(CH₃COO−)=0.0001mol/L, c(ClCH₂COO−)=0.001mol/L and c(CH₃COOH)=0.008mol/L. Required counterions are present and omitted from the proton model.'],
    'Formuliere beide Protolysegleichungen mit Wasser und die Ka-Ausdrücke. Vergleiche Säuren UND konjugierte Basen quantitativ und auf Teilchenebene. Leite K der angegebenen Protonenübertragung aus beiden Ka ab und prüfe für den bereitgestellten Zustand Q gegen K. Unterscheide Gleichgewichtspräferenz, thermodynamische Änderungsrichtung und Geschwindigkeit.',
    'Write both protolysis equations with water and their Ka expressions. Compare BOTH acids and conjugate bases quantitatively and at particle level. Derive K for the supplied proton transfer from both Ka values and compare Q with K for the supplied composition. Distinguish equilibrium preference, thermodynamic change direction and speed.',
    'Für HA gilt HA+H₂O ⇌ A−+H₃O⁺ und Ka=a(A−)a(H₃O⁺)/a(HA). Ka(ClCH₂COOH)≈1,26·10⁻³ ist größer als Ka(CH₃COOH)≈1,58·10⁻⁵. Das elektronenziehende Cl stabilisiert relativ das konjugierte Chloracetat; die Säure gibt unter diesen gleichen Modellbedingungen leichter Protonen ab. Die stärker stabilisierte konjugierte Base nimmt weniger bereitwillig Protonen auf: Chloracetat ist die schwächere Base. Kb=Kw/Ka gibt pKb11,1 für Chloracetat und9,2 für Acetat. Addition der Chloracetat-Säureprotolyse und umgekehrten Acetat-Säureprotolyse eliminiert H₃O⁺/Wasser: K=Ka(ClCH₂COOH)/Ka(CH₃COOH)=10^1,9≈79,4. Q=[0,001·0,008]/[0,0001·0,0001]=800>K. K>1 zeigt eine Produktpräferenz unter vergleichbaren Aktivitätsverhältnissen; dieser konkrete produktreiche Zustand hat thermodynamisch die Rückrichtung begünstigt. Weder K noch Q bestimmt die Geschwindigkeit oder behauptet sofortige vollständige Umsetzung. Beide Übertragungsseiten haben Gesamtladung−1.',
    'For HA, HA+H₂O ⇌ A−+H₃O⁺ and Ka=a(A−)a(H₃O⁺)/a(HA). Ka(ClCH₂COOH)≈1.26·10⁻³ exceeds Ka(CH₃COOH)≈1.58·10⁻⁵. Electron-withdrawing Cl relatively stabilizes conjugate chloroacetate, so the acid more readily donates a proton under these same model conditions. The more stabilized conjugate base accepts protons less readily: chloroacetate is weaker as a base. Kb=Kw/Ka gives pKb11.1 for chloroacetate and9.2 for acetate. Add chloroacetic-acid ionization to the reversed acetic-acid ionization to eliminate H₃O⁺/water: K=Ka(ClCH₂COOH)/Ka(CH₃COOH)=10^1.9≈79.4. Q=[0.001·0.008]/[0.0001·0.0001]=800>K. K>1 gives product preference for comparable activity ratios; this specific product-rich composition thermodynamically favors the reverse direction. Neither K nor Q establishes speed or immediate full conversion. Total charge on each transfer side is−1.',
    'MWG, konjugierte Säure-/Basenstärke und stabilisierende Teilchenstruktur begründen gemeinsam den ganzen ursprünglichen Operator; ein pK-Rang allein genügt nicht.',
    'Mass action, conjugate acid/base strength and stabilizing particle structure jointly justify the whole original operator; a pK ranking alone is insufficient.',
    ('Für dieselbe Reaktion werden alle vier genannten Konzentrationen gleich angesetzt. Welcher Schluss ändert sich und welcher nicht?',
     'Q=1<K, daher ist jetzt die Hinrichtung thermodynamisch begünstigt. K, Säure-/Basenrang und Teilchenstruktur bleiben bei gleicher Temperatur/Medium gleich; keine neue Geschwindigkeitsaussage.'),
    ('For the same reaction all four listed concentrations are equal. Which conclusion changes and which does not?',
     'Q=1<K now thermodynamically favors the forward direction. K, acid/base rankings and particle structure remain unchanged at the same temperature/medium; no speed conclusion follows.'),
    ['Own synthetic task with stipulated rounded model constants and activities; not an experimental measurement or source-page verbatim pK clause.',
     'Does not turn an E-phase generic direction atom into the whole original HB Q-stage MWG/particle-strength performance or approve current481 on its other bindings.']))
cases.append(case('fresh-inductive-distance-acid-and-base-strength-v2','hb-chemistry-sekii-gyo2022-3-3-1-2',[PK,'ca216bc6-5205-5b46-abbd-fd5628e4ca5b'],
    ['Neuer verdünnter wässriger Fall bei25°C, gleiche Aktivitätsnäherung, pKw14: CH₃COOH pKa4,8; ClCH₂CH₂COOH pKa4,0. Vergleiche mit dem vorher bereitgestellten ClCH₂COOH pKa2,9. Das Cl ist bei ClCH₂CH₂COOH eine σ-Bindung weiter von der Carboxylgruppe entfernt; in dieser gegebenen Reihe schwächt größerer Abstand den induktiven Einfluss.',
     'Neue Reaktion: ClCH₂CH₂COOH+CH₃COO− ⇌ ClCH₂CH₂COO−+CH₃COOH. Für einen frischen Zustand sind die Aktivitäten a(ClCH₂CH₂COOH)=0,002; a(CH₃COO−)=0,004; a(ClCH₂CH₂COO−)=0,002; a(CH₃COOH)=0,004 vorgegeben.'],
    ['A fresh dilute aqueous case at25°C uses the same activity approximation and pKw14: CH₃COOH pKa4.8 and ClCH₂CH₂COOH pKa4.0. Compare with previously supplied ClCH₂COOH pKa2.9. In ClCH₂CH₂COOH, Cl is one additional sigma bond from the carboxyl group; greater distance weakens its inductive effect in this supplied series.',
     'Fresh reaction: ClCH₂CH₂COOH+CH₃COO− ⇌ ClCH₂CH₂COO−+CH₃COOH. A fresh composition has stipulated activities a(ClCH₂CH₂COOH)=0.002, a(CH₃COO−)=0.004, a(ClCH₂CH₂COO−)=0.002 and a(CH₃COOH)=0.004.'],
    'Formuliere die neuen Wasser-Protolysegleichungen für Säure und konjugierte Base, leite den MWG-Zusammenhang ab und berechne K, Q sowie pKb der konjugierten Basen. Begründe die Säure- UND Basenreihenfolge mit der strukturellen Änderung und bewerte den frischen Zustand.',
    'Write the fresh water-protolysis equations for the acid and conjugate base, derive the mass-action relationship and calculate K, Q and conjugate-base pKb. Justify BOTH acid and base rankings using the structural change and assess the fresh composition.',
    'HA+H₂O ⇌ A−+H₃O⁺, A−+H₂O ⇌ HA+OH−. Ka=a(A−)a(H₃O⁺)/a(HA), Kb=a(HA)a(OH−)/a(A−), daher KaKb=Kw. Für 3-Chlorpropionat pKb10,0, für Acetat9,2; die konjugierte 3-Chlorpropionat-Base ist schwächer als Acetat, aber stärker als Chloracetat(pKb11,1). Der Abstand schwächt die zusätzliche Ladungsstabilisierung: Säurereihe ClCH₂COOH > ClCH₂CH₂COOH > CH₃COOH, Basenreihe umgekehrt. K=10^(4,8−4,0)≈6,31 und Q=(0,002·0,004)/(0,002·0,004)=1<K: die Hinrichtung ist thermodynamisch begünstigt. Beide konjugierten Carboxylate haben weiterhin die gemeinsame Ladungsverteilung über zwei O-Atome; der Unterschied wird nicht durch mehr O-Atome oder eine Änderung der stöchiometrischen Ladung erklärt.',
    'HA+H₂O ⇌ A−+H₃O⁺ and A−+H₂O ⇌ HA+OH−. Ka=a(A−)a(H₃O⁺)/a(HA), Kb=a(HA)a(OH−)/a(A−), hence KaKb=Kw. pKb is10.0 for3-chloropropionate and9.2 for acetate; the conjugate3-chloropropionate base is weaker than acetate but stronger than chloroacetate(pKb11.1). Distance weakens additional charge stabilization: acid ranking ClCH₂COOH > ClCH₂CH₂COOH > CH₃COOH, base ranking reversed. K=10^(4.8−4.0)≈6.31 and Q=(0.002·0.004)/(0.002·0.004)=1<K thermodynamically favor the forward direction. Both carboxylates retain the shared charge distribution over two oxygens; additional oxygens or changed stoichiometric charge do not explain the difference.',
    'Der neue Strukturabstand verändert K und die inverse konjugierte Basenstärke unter gleichbleibendem MWG; die ursprüngliche Säure-/Basen-Teilchenbegründung wird übertragen.',
    'Fresh structural distance changes K and inverse conjugate-base strength under the same mass-action rule; the original acid/base particle explanation is transferred.',
    ('Im selben Medium und bei derselben Temperatur ist für diese Reaktion stattdessen Q=63,1 gegeben. Ändert das die Säurestärke oder die thermodynamische Richtung?',
     '63,1>K≈6,31, daher ist die Rückrichtung begünstigt. Die Konzentrations-/Aktivitätsverhältnisse verändern Q, nicht die unveränderten Ka/Kb oder den Strukturvergleich. Die Reaktionsgeschwindigkeit folgt daraus nicht.'),
    ('At the same temperature and medium the fresh reaction instead has Q=63.1. Does this change acid strength or thermodynamic direction?',
     '63.1>K≈6.31 thermodynamically favors the reverse direction. Composition/activity ratios change Q, not unchanged Ka/Kb or the structure ranking. Reaction speed does not follow.'),
    ['Fresh own synthetic model-case data; medium/temperature bounds remain explicit and no universal pKa/inductive ordering outside this series is claimed.',
     'A source-witness candidate for independent review, not new whole-goal P approval, human performance or a new curricular target ID.']))
write('four-new-whole-original-operator-source-witness-cases.de-en.author-candidate.json',dict(schemaVersion=1,
    role='Four actually supplied whole material/task/model-answer/fresh-transfer cases for the remaining three original source rows. Current accepted goal cases are unchanged.',
    cases=cases,newWholeSourceCases=4,newWholeGoalPositiveProfiles=0,independentScienceApprovals=0,humanApproval=False,humanTrial=False,
    factualChecksOnlyPrimaryLinks=[
        'https://openstax.org/books/chemistry-2e/pages/14-1-bronsted-lowry-acids-and-bases',
        'https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases',
        'https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle'],
    thirdPartyBoundary='Links check general chemical facts only. No provider task, image, prose, table or complete page is copied. Own stipulated task materials/model answers are CC-BY-4.0; linked third-party material retains its rights.'))

partners=sorted({p for d in duties for p in d['wholeOriginalPartnerGoalIds']}|{IND,IONS,MODEL,'ca216bc6-5205-5b46-abbd-fd5628e4ca5b'})
retained=[]
for cp in chem['positiveEvidenceConfigPaths']:
    cfg=json.loads((ROOT/cp).read_text());rp=cfg['reviewPath']
    for n,line in enumerate((ROOT/rp).read_text().splitlines(),1):
        r=json.loads(line)
        if r.get('goalId') not in {BRON,IND,IONS}:continue
        bind(cp);bind(rp)
        retained.append(dict(goalId=r['goalId'],configPath=cp,config=cfg,reviewPath=rp,line=n,
            wholeRecordSha256=sha(stable(r).encode()),wholeRecord=r,repeatedScientificReview=False))
write('existing-valid-three-whole-positive-records-and-reuse-boundaries.raw.json',dict(schemaVersion=1,
    role='Unmodified exact current valid d2/fd/1c records. Native checker selects current full bindings; historical alternate records are not new approvals.',
    selectedReuseGoalIds=[BRON,IND,IONS],wholeCurrentGoals=[by[p] for p in partners],retainedPositiveRecords=retained,
    newScientificReviewCount=0,existingFd309HistoricalConcernSuperseded=True,globalPartnerApprovalNotInferred=True))

write('neutral-independent-review-entry-and-exact-next-decisions.json',dict(schemaVersion=1,
    role='Neutral independent source-role/whole-operator entry; evaluate actual inputs without inheriting author verdict.',
    wholeCurrentHeldGoal=by[PARENT],currentGoalRewrites=0,currentWholeB477AllSourceAndAtomicityReadyForCompletion=False,
    boundedIndependentReviewReadySourceRoleDeltaIds=[d['sourceGoalId'] for d in deltas],
    remainingWholeOperatorSourceCaseReviewIds=[d['sourceGoalId'] for d in remaining],
    instructions=[
        'Check six candidate role removals against full original page/whole source goal and retained strict1c case profile; source identity, all original clauses and regional stage/course must remain preserved. Do not re-review the valid three goals.',
        'Check BB/BE whole contextual Nachweisreaktionen against both new supplied indicator/proton source cases and retained d2/fd/1c scopes. Decide the exact source-role union without inferring all organic-family obligations or a unique ion species from color.',
        'Check HB Q original MWG plus acid AND base strength on particle level against both new quantitative/structure cases; distinguish derived extraction wording, current composition Q, K and kinetics.',
        'The current B477 atomicity issue is not resolved by source-role correction. Decide a scope-preserving reuse/split of all three original performances only after exact source/stage/reuse agreement; no new stable ID, cluster change or narrower original goal is adopted here.',
        'The actual historical generic normative model-reflection clause can support an authored acid/base application, but it is not a literal universal acid/base content requirement. Held277 is not strict simply because it appears as a reusable name.',
        'If whole481 is later used as a source witness, its complete current D/P/A/M/V and other actually affected duties remain required. These cases are a bounded input, not approval of that entire goal.'
    ],oldHeldProposalKeptAsLineage=old_b477,
    strictChemistryBefore=central['strictComplete'],currentDenominator=central['denominator'],
    strictNetIncrease=0,newScientificWholeGoalCompletions=0,activeBindingRestorations=0,
    validWholeGoalsWithEntireCurrentDutiesReusedUnchanged=[BRON,IND,IONS],newWholeB477WithAllBindingsReady=False,
    images='KEEP all accepted existing images. None generated, modified or newly visually approved.',
    humanApproval=False,humanTrial=False))
write('declared-current-owned-input-bindings.actual.json',dict(schemaVersion=1,createdAtUTC=datetime.now(timezone.utc).isoformat(),
    inputBindings=list(INPUTS.values()),currentChemistryRegistrySubject=chem,currentChemistryRegistrySubjectSha256=sha(stable(chem).encode()),
    registryPath=registry_path,registryBindingScope='Chemistry subject only; parallel Biology registry work does not change Chemistry evidence.',
    heldParentId=PARENT,validUntouchedReuseGoalIds=[BRON,IND,IONS],activeWrites=False))
print(json.dumps(dict(currentWholeSourceDuties=9,boundedRoleDeltas=6,remainingWholeOperatorCaseRows=3,
    actualNewWholeMaterialCases=4,validGoalsScientificallyReReviewed=0,newScientificApprovals=0,activeBindingRestorations=0,strictGain=0)))
