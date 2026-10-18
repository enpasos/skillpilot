import datetime
import hashlib
import json
from pathlib import Path

ROOT=Path('/home/enpasos/projects/skillpilot')
N=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17'
AUTHOR=N/'chemie-current442-five-description-two-duty-split-author-20261017-v1'
OUT=Path(__file__).parent
def pin(p):
    p=Path(p)
    if not p.is_absolute(): p=ROOT/p
    b=p.read_bytes()
    return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def oh(v):
    return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def ptr(v,p):
    for x in p.strip('/').split('/') if p else []:
        v=v[int(x)] if isinstance(v,list) else v[x.replace('~1','/').replace('~0','~')]
    return v
def write(name,value):
    p=OUT/name;p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n');return pin(p)

a=json.loads((AUTHOR/'AUTHOR.five-current-remediations-and-two-narrow-duty-candidates.pending.json').read_text())
s=json.loads((AUTHOR/'SCOPE.two-duty-partitions-and-core-retentions.pending.json').read_text())
mb=json.loads((AUTHOR/'MATERIAL.seven-complete-operative-bindings.json').read_text())
sp=json.loads((AUTHOR/'SOURCE.two-carrier-partitions.pending.json').read_text())
canonical=json.loads((ROOT/a['inputCanonical']['path']).read_text());by={x['id']:x for x in canonical['goals']}
targets=json.loads((OUT/'CHECK.actual-current-target-roles.json').read_text())
profiles={}
for line in (ROOT/a['inputWholeProfiles']['path']).read_text().splitlines():
    r=json.loads(line)
    if r['goalId'] in {x['goalId'] for x in a['records']}: profiles[r['goalId']]=r['profile']
now=datetime.datetime.now(datetime.timezone.utc).isoformat()

findings=[
 ('72236f2c-771e-4ab6-933a-e549ee49d15b','revise_titleEn_only',
  'Der deutsche Titel korrigiert den echten Elementarteilchenfehler. Protonen/Neutronen sind Atombausteine; D und beide ganzen P-Fälle bleiben richtig. Rutherfordzählung, Ladung/Masse, Na-Isotopen-/Na+- sowie Cl−-Transfer sind vollständig erhalten. Der neue englische Titel nuclear-shell model ist jedoch missverständlich fachlich belegt: das nuclear shell model beschreibt Nukleonen im Atomkern, nicht Rutherfords Kern plus Elektronenhülle. Eng nur titleEn korrigieren, etwa Describe the nuclear model of the atom and atomic constituents. Keine Quark-, Elektronenbahn- oder neue Schalenbesetzungspflicht anhängen.',
  'atomic: scattering evidence, concentrated nucleus and atomic constituents/counts belong to one nucleus/electron-shell model; no new subdivision needed.',
  'retain memory_required and all existing references: the actual chem_basics_005 recalls proton/neutron/electron charge and location, not a false modern elementary-particle claim. chem_basics_004 has the bounded atomic-number/main-group convention and helium exception. Recall supports the model but never replaces scattering explanation or isotope/charge transfer.'),
 ('8721d943-8368-5304-bd3c-7d7944099662','accept_scientific_description_P_candidate',
  'Hydrolyse geeigneter Polymere wird korrekt als rohstofflicher Weg untergeordnet. Ganze P/Materialien bleiben exakt: mechanische Kettenerhaltung, PET-Esterhydrolyse, Pyrolyse-Feedstock und energetische Oxidation sind unterschieden.40/80=0,50 und100/75≈1,33kWh/kg äquivalentes PET;35·0,8+50·0,9=73kg Zielprodukte,27kg außerhalb. PE hat kein PET-artiges Estergerüst. Im separaten100kg-PE-Modell4400MJ→880MJ Strom und1760MJ genutzte Wärme; direkteCO2-Masse100·44/14≈314,3kg. Das sind verschiedene Funktionen, keine fertige LCA-Rangliste. Unbekannter PVC/PE-Mischabfall verhindert Übernahme der Rein-PE-Bilanz.',
  'atomic: compare recycling/recovery routes against one stated material/function boundary with source criticism; hydrolysis is a subordinate route, not a separate same-level obligation.',
  'retain no_memory_needed: current material supplies masses, heating value and molar masses. Needed are functional comparison, unit-aware balance and conditional source judgment, not a new list of fictional values.'),
 ('0959eef2-3c7d-5b33-a109-ddf332a5dbd9','accept_core_and_exact_duty_partition',
  'Der unveränderte erste ganze zweisprachige D-Satz und beide ganzen Öl-P-Fälle bleiben. Drei Esterbindungen am Glycerin, wechselnde Acylreste, freie Säuren, Modellmotorfreigabe und nachvollziehbare Herkunft begründen eine zusammenhängende Struktur-/Nutzungseinordnung. Neues anonymes Nachhaltigkeitslabel hebt vorhandenen Herkunftsnachweis auf; beim Vertauschen von Herkunftskarten ändern sich nicht die chemischen Anteile. Komplette Gewinnungs-/Generationen-Erwartung, Variation und Materialfall wandern als identische Objekte zum neuen223e-Ziel. Kein Umesterungsmechanismus wird in den Ölabschluss zurückimportiert.',
  'atomic after partition: triglyceride-mixture structure, properties and bounded use/provenance reasoning share one carrier. Route/production/generation classification is independently assessable and is preserved separately.',
  'retain memory_required and all existing references: the actual chem_org_q1_002 compact functional-group shorthand supports ester versus free acid in this unchanged structure goal. Its limited recall does not certify oil sustainability or process-route reasoning; no new route deck is justified.'),
 ('3eb2a06c-d283-57aa-9eb4-088940c4801a','accept_core_and_exact_duty_partition',
  'Die vollständige zusammenhängende Forschung→Labor→Anlage→Vermarktung bleibt mit vier Erwartungen und beiden ganzen nichtisomorphen Salicylatfällen. Im ersten Fall75%Ausbeute; geometrisch1000fach Wärmefreisetzung gegen100fach Wandfläche ist kein Anlagenlauf.1kg ergibt100 mögliche Packungen;80 angenommene Verkäufe ergeben280Euro Umsatz und120Euro Deckungsbeitrag, keinen Gesamtgewinn. Neuer0,60kg-Befund begrenzt auf60 Packungen/90Euro Beitrag und verlangt Ursachenprüfung. Zweiter Fall trennt99/1 und98/2 von92/8 an den erfundenen97/3-Grenzen;80/120 Designpräferenz ist kein Wirksamkeits- oder Nachfragebeleg. Neuer94/6-Lagerbefund widerlegt dauerhafte Stabilität, nicht den früheren unmittelbaren98/2-Befund. Die vollständige historische/aktuelle Gesellschaftspflicht wird exakt zum neuen4965-Ziel verschoben.',
  'atomic after partition: all four stages refer to the same drug-group development problem and feedback. Historical/current societal allocation has a separate criterion set and material, so the explicit split is justified.',
  'retain no_memory_needed: chemical equations, process data, limits, market assumptions and comparisons are supplied. Judgment and linked feedback are required; model numbers, historical names and dates are not standalone recall obligations.'),
 ('f4d5a02d-711b-5a6b-a41d-971359c1f64d','accept_connected_polarimetry_description_P_candidate',
  'Die erweiterte D benennt den gesamten bereits bestehenden P-Auftrag präzise. Ein gemeinsames Messmodell α=[α]lc verknüpft Polarisator/Probe/Analysator, Leerwert, Charakterisierung, Vorwärts-/Rückrechnung und Winkelunsicherheit. Alle fünf ganzen P-Fälle bleiben exakt. Aus5,27°/(1,00dm·0,100g/mL) folgt52,7; aus6,216−2,000=4,216° und200mm=2dm folgt40,0g/L. Die ausdrücklich nur aus±0,05° folgende Unsicherheit ist±0,47g/L. Fructose:−1,386/(−92,4·0,500)=0,0300g/mL=30,0g/L;50 statt0,5dm verursacht Faktor100. Nullrotation beweist weder Stofffreiheit noch Identität/D-L. Mehrere unbekannte aktive Beiträge oder fehlende passende Wellenlängenreferenz verhindern die einfache Inversion. Weglängenhalbierung und Analysatorentfernung prüfen Grenzen desselben Modells. Keine tatsächliche Messung oder vollständige reale Unsicherheitsbilanz wird behauptet.',
  'atomic: specific rotation and unknown concentration are forward/inverse uses of the same reference-conditioned relation. Angular uncertainty and identifiability limits are necessary parts of that one data-evaluation competence, not unrelated new duties.',
  'retain no_memory_needed: equation, numerical references, conventions and apparatus model are actually supplied; explanatory inversion, units, assumptions and fresh model limits are the required performance. No additional card set follows from expanding D to its existing P.'),
]
existing=[]
for r,(gid,rec,text,atomicity,memory) in zip(a['records'],findings):
    assert r['goalId']==gid and by[gid]==r['beforeGoal'] and profiles[gid]==r['beforeWholeProfile']
    retained={}
    for key in ['expectations','variationAxes','applicationCaseBriefs']:
        before=r['beforeWholeProfile'][key];after=r['afterWholeProfile'][key]
        retained[key]=dict(exactPreserved=[x['id'] for x in before if x in after],removedForExplicitPartition=[x['id'] for x in before if x not in after])
    existing.append(dict(goalId=gid,recommendation=rec,rationaleDe=text,atomicityRecommendation=atomicity,memoryRecommendation=memory,
                         currentBeforeGoalMatchesLive=True,currentBeforeProfileMatchesSelectedP442=True,
                         proposedGoalObjectSHA256=oh(r['afterGoal']),proposedProfileObjectSHA256=oh(r['afterWholeProfile']),
                         wholeProfileUnchanged=r['beforeWholeProfile']==r['afterWholeProfile'],retention=retained,
                         coverageBefore=r['beforeWholeProfile']['coverageExpectations'],coverageAfter=r['afterWholeProfile']['coverageExpectations'],
                         nativeApproval=False))

new=[]
for i,r in enumerate(a['newCandidateGoals']):
    old=next(v for v in a['records'] if v['goalId']==r['splitFromGoalId'])
    p=r['profile'];exact={k:all(v in old['beforeWholeProfile'][k] for v in p[k]) for k in ['expectations','variationAxes','applicationCaseBriefs']}
    assert all(exact.values()) and r['goalId'] not in by
    if i==0:
        rationale='Die gegebene Routenklassifikation ist als ein eigenes enges Ziel gerechtfertigt: Pressen/Filtern trennt vorhandene Triglyceride; Umesterung bildet FAME/Glycerin, Gärung Ethanol/CO2.30+70=100kg schließt die ideale Saatbilanz, ist ohne ursprünglichen Ölanteil keine Extraktionsausbeute. Die angegebene Generationenkonvention bleibt eine Rohstoff-/Prozesskonvention. Im frischen Werbefall ist Holz/Synthesegas kein FAME und gefiltertes Rapsöl keine Umesterung; automatische Klimaneutralität bleibt unbelegt. Ganze alte Erwartung/Variation/Fall bleiben exakt, mit vollständigem operativem HB200-Sachmaterial. Vollständige Fischer-Tropsch-Erklärung bleibt beim eigenen LK-Ziel.'
        atomicity='atomic: feedstock/substance/process/generation classification plus separation/transformation and material-balance limits are linked properties of one supplied-route comparison.'
        memory='no_memory_needed: all routes, substance identities, equations, quantities and generation convention are supplied. Applied explanation and the changed-advertising critique are required; no memorised production catalogue.'
        prereq='Empty requires is acceptable for this deliberately supplied-data route introduction: no detailed ester mechanism, whole oil-structure competence or BTL mechanism is required. It cannot be used to waive those separate goals.'
    else:
        rationale='Ein eigener historischer/aktueller Gesellschaftsvergleich ist getrennt von der chemisch-technischen Prozesskette prüfbar. Die vollständige HB232-Karte trennt Penicillinentdeckung von Entwicklung, Herstellung und Zugang; das historische1945-Faktenstück wurde an NobelPrize.org geprüft. Die heutige WahlA ist nur unter ausdrücklich gleicher Wirksamkeit, definierter Sicherheit und gegebenen Kosten/Zugang/Überwachung begünstigt. Neue Resistenzdaten entziehen dieser Rangfolge die gleiche-Wirkung-Annahme; fehlende Evidenz zuB wird nicht erfunden. Die ganze alte Erwartung/Variation/Fall bleiben exakt. Kein klinischer Erfolg, keine Behandlungsempfehlung oder ausgeführte Vermarktung wird behauptet.'
        atomicity='atomic: one evidence- and criterion-based evaluation of historical/current social consequences, including revision when the efficacy assumption changes; not a second process-engineering task.'
        memory='no_memory_needed: historic names/year and current model values are given. Reasoned benefit/access/cost/safety/resistance judgment is the competence; no separate date/person deck.'
        prereq='Empty requires is acceptable for the supplied historical and funding model: no synthesis, dosing, clinical inference or production-scale mastery is required. It does not certify prerequisites of the separate process-chain goal.'
    new.append(dict(goalId=r['goalId'],recommendation='accept_narrow_scientific_goal_P_candidate',rationaleDe=rationale,
                    atomicityRecommendation=atomicity,memoryRecommendation=memory,prerequisiteJudgment=prereq,
                    goalObjectSHA256=oh(r['afterGoal']),profileObjectSHA256=oh(p),movedObjectsExactFromPredecessor=exact,
                    coverage=p['coverageExpectations'],nativeDApproval=False,nativeAApproval=False,nativeMApproval=False,nativeVApproval=False))

def coord(row): return (row['viewId'],json.dumps(row['scope'],sort_keys=True))
scope_checks=[]
for gid in ['0959eef2-3c7d-5b33-a109-ddf332a5dbd9','3eb2a06c-d283-57aa-9eb4-088940c4801a']:
    proposed=[r for r in s['rows'] if r['predecessorGoalId']==gid]
    actual=[r for r in targets['rows'] if r['goalId']==gid and r['actualRole']=='target']
    assert {coord(r) for r in proposed}=={coord(r) for r in actual}
    rows=[]
    for r in proposed:
        v=json.loads((ROOT/r['currentViewPin']['path']).read_text());actualpin=pin(r['currentViewPin']['path'])
        assert actualpin['sha256']==r['currentViewPin']['sha256'] and actualpin['bytes']==r['currentViewPin']['bytes']
        assert all(ptr(v,q['pointer'])==q['node'] for q in r['currentReferences'])
        assert r['currentRole']==r['proposedCoreRole']==r['proposedSeparateDutyRole']=='target'
        rows.append(dict(viewId=r['viewId'],scope=r['scope'],view=actualpin,referencePointers=[q['pointer'] for q in r['currentReferences']],
                         basis=r['dutyScopeBasis'],retainCoreTarget=True,separateDutyTargetCandidate=True))
    scope_checks.append(dict(coreGoalId=gid,separateDutyGoalId=proposed[0]['separateDutyGoalId'],count=len(proposed),
                             exactCoordinateSetMatchesOwnCurrentStockCollector=True,rows=rows))
assert len(scope_checks[0]['rows'])==32 and len(scope_checks[1]['rows'])==4
assert all(r['scope'].get('jurisdiction')!='DE-BY' for r in scope_checks[0]['rows'])
assert not any(r['scope'].get('jurisdiction')=='DE-HB' and r['scope'].get('courseProfile')=='GK' for r in scope_checks[1]['rows'])
assert len([r for r in targets['rows'] if r['goalId']=='f4d5a02d-711b-5a6b-a41d-971359c1f64d' and r['actualRole']=='target'])==14

mapping_path=ROOT/'curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json'
mapping=json.loads(mapping_path.read_text());ex_path=ROOT/'curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json'
ex=json.loads(ex_path.read_text());source=[]
for r in sp['rows']:
    d=mapping['decisions'][r['ordinal']-1];replacement=r['replaceOnlyCarrier'];before=d['canonicalGoalIds'];assert replacement['fromCanonicalGoalId'] in before
    after=[replacement['toCandidateGoalId'] if x==replacement['fromCanonicalGoalId'] else x for x in before]
    source.append(dict(ordinal=r['ordinal'],sourceGoalId=ex['sourceGoals'][r['ordinal']-1]['id'],recommendation='accept_partial_carrier_replacement_candidate',
                       beforeCarrierIds=before,proposedCarrierIds=after,scope=d['sourceScopeExact'],courseLevel=d['sourceCourseLevel'],relation='partial',
                       rationale='Only the explicit moved whole material duty changes carrier; all other current carriers remain. Source200 is common Q3.3; full BTL/FT remains separate LK. Source232 is actually LK from topic4.3/page37 despite GK_LK in the legacy span/ID. No single-goal mastery closes a complete official source union.',
                       wholeUnionClosure=False))

material_pins=[]
for r in mb['rows']:
    for key in ['completeMaterial','materialFiles']:
        vals=r.get(key,[]);vals=vals if isinstance(vals,list) else [vals]
        for ref in vals:
            actual=pin(ref['path']);assert actual['sha256']==ref['sha256'] and actual['bytes']==ref['bytes']
            material_pins.append(dict(goalId=r['goalId'],file=actual,readScope='whole file' if 'whole40.' not in ref['path'] else 'whole /cases/20 and /cases/21 only; other38 not reviewed'))

title_finding=dict(goalId=findings[0][0],severity='required_narrow_bilingual_correction',pointer='/records/0/afterGoal/titleEn',
                   actual='Describe the nuclear-shell model and atomic constituents',
                   suggested='Describe the nuclear model of the atom and atomic constituents',
                   reason='The established nuclear shell model concerns nuclear structure/nucleons; this goal assesses Rutherford nucleus and electron shell. This is a terminology correction only; retain valid DE title and entire current D/P.',
                   primarySource='https://www.nobelprize.org/prizes/physics/1963/jensen/facts/')

input_pins=[]
for role in ['inputCanonical','inputWholeProfiles','profileCollection','scopeRetentionPlan','operativeMaterials']:
    ref=a[role];p=pin(ref['path']);assert p['sha256']==ref['sha256'] and p['bytes']==ref['bytes'];input_pins.append(dict(role=role,file=p))
review=dict(
 artifactType='independent-informed-five-description-two-duty-split-review',reviewerId='independent-b-description-five-two-duty',
 createdAtUTC=now,reviewMode='informed_targeted_author_correction_review',recordStatus='candidate',reviewAuthority='ai_candidate',
 reviewer=dict(provider='OpenAI',model='GPT-6 (Codex)',modelVersion='runtime identifier not exposed'),
 priorRoleDisclosure='Reviewer B of the completed separately sealed blind final163 D first pass, and author of the separately sealed informed P5 independent review immediately preceding this task. No role in authoring these correction candidates. This is informed, not a fresh blind D run. Existing normal P/M records and the author packet contain older review metadata, read as current binding/context, never as a substitute for own content judgment. No other current independent review of this author group was read.',
 peerCurrentResultsReadBeforeOwnSeal=False,newBlindReviewClaim=False,
 authorInput=pin(AUTHOR/'AUTHOR.five-current-remediations-and-two-narrow-duty-candidates.pending.json'),authorSeal=pin(AUTHOR/'SEAL.json'),
 inputs=input_pins,sourcePartitionInput=pin(AUTHOR/'SOURCE.two-carrier-partitions.pending.json'),
 conclusion='Four existing description corrections, both exact duty partitions/new narrow goals, all seven P/material routes, source partial replacements and proposed scope preservation are scientifically suitable.72236 requires only the narrow English-title correction documented below. No other content revision is required by this informed review; no normal or native activation is supplied.',
 existingGoalFindings=existing,newGoalFindings=new,requiredCorrections=[title_finding],
 manufacturerPartitionChecks=dict(wholeOriginalExpectationsCasesVariationsRetainedAcrossEachPair=True,
                                   coverageThresholdTwoFreshIndependentTransferRetained=True,fixedNewTaskQuota=False,
                                   originalPUnchangedGoalIds=[a['records'][i]['goalId'] for i in [0,1,4]],
                                   corePairs=[dict(coreGoalId=r['splitFromGoalId'],newDutyGoalId=r['goalId'],movedObjectsExact=True) for r in a['newCandidateGoals']]),
 actualOperativeMaterialReads=material_pins,
 scopeFindings=dict(actualCurrentStockRoleCheck=pin(OUT/'CHECK.actual-current-target-roles.json'),pairCoordinateChecks=scope_checks,
                    polarimetryExistingTargetCoordinates=14,polarimetryTargetSetUnchanged=True,
                    noRawBavariaBioTargetImport=True,noHBGKSocietalTarget=True,
                    SHBoundary='Medication theme stays officially optional (SH69/71). Existing SH GK/LK targets reflect owner initial inclusion; the moved societal duty is explicit own acquisition retention, not a newly asserted SH official historic/current social-evaluation requirement.',
                    polarimetryBoundary=s['polarimetryBoundary'],afterCandidateInstallationProjectionCheck=False,
                    placementBoundary='Canonical parent insertion is navigation only; actual future references must preserve exact32/4/14 coordinates and avoid duplicates. No target follows automatically from phase, raw applicability or requires.'),
 sourceUnionFindings=source,sourceActualFiles=[pin(ex_path),pin(mapping_path)],
 sourceBoundaries=dict(HB147='shared apparatus within selected2.1',HB149='inverse concentration LK only, no GK official credit',HB200='common Q3.3; full BTL/FT LK separate',HB232='topic4.3 LK only; historical/current society duty is not imported into HB GK',officialWholeUnionClosure=False),
 officialActualPDFReads=[dict(file=pin(ROOT/'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf'),physicalPages=[26,32,36,37],note='26/37 actually read in immediately preceding P5 work in this same informed task sequence;32/36 read for this group; no complete-document claim'),
                         dict(file=pin(ROOT/'curricula/DE/Gymnasium/input/SH/Fachanforderungen_Chemie_Sekundarstufe_2022_barrierearm.pdf'),physicalPages=[69,70,71]),
                         dict(file=pin(ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf'),physicalPages=[42])],
 memoryContext=dict(normalMemoryFile=pin(a['records'][0]['existingMemoryRecord']['path']),selectedLinesOneBased=[r['existingMemoryRecord']['lineOneBased'] for r in a['records']],
                    oldHistoricalRationalesAreNotNewReviewAuthority=True,
                    actualSelectedCards=[dict(file=pin(ROOT/'app/public/data/de_gymnasium_chemistry_flashcards_basics_seki.de.json'),cardIds=['chem_basics_004','chem_basics_005']),
                                         dict(file=pin(ROOT/'app/public/data/de_gymnasium_chemistry_flashcards_organic_q1.de.json'),cardIds=['chem_org_q1_002'])],
                    retainEveryExistingMemoryReference=True,newCardQuota=False,newNativeMemoryApproval=False),
 externalPrimaryChecks=[dict(url='https://www.nobelprize.org/prizes/medicine/1945/summary/?level=1',use='Historical1945 Fleming/Chain/Florey penicillin award only; search-accessed primary page, initial direct fetch403.'),
                        dict(url='https://www.nobelprize.org/prizes/physics/1963/jensen/facts/',use='Terminology distinction: nuclear shell structure concerns nucleus/nucleons.'),
                        dict(url='https://www.fda.gov/patients/learn-about-drug-and-device-approvals/drug-development-process',use='Evidence categories only; no German legal process or current clinical efficacy claim.'),
                        dict(url='https://home.miracosta.edu/dlr/211exp3.htm',use='Supplied ASA synthesis/isolation reference only; unrelated history/therapy/equilibrium assertions are not adopted.')],
 boundaries=dict(normalWrites=False,nativeWritersExecuted=False,nativeDCompletion=False,nativeVCompletion=False,nativeAorMCompletion=False,
                 visualOrImageContextApproval=False,humanApproval=False,humanTrial=False,actualLearnerPerformance=False,M7Closure=False,
                 candidatesInstalled=False,currentOrdinaryDenominator=442,candidateOnlyAdditionalGoals=2,noNewPhaseAdapter=True),
 counts=dict(existingDescriptionsAccepted=4,existingDescriptionsRequireTitleOnlyRevision=1,newNarrowGoalsAccepted=2,
             PScientificRoutesSuitable=7,atomicityCandidateRecommendations=7,memoryCandidateRecommendations=7,
             sourcePartialReplacementsSuitable=2,coreTargetCoordinatesPreservedInPlan=36,polarimetryCoordinatesUnchanged=14,
             requiredNarrowCorrections=1,nativeActivations=0),
 objectHashRule='SHA256 of UTF-8 JSON with ensure_ascii=False, sorted object keys and comma/colon separators; file pins hash actual bytes')
rp=write('REVIEW.informed-five-description-two-duty.independent-b.json',review)
seal=write('SEAL.informed-five-description-two-duty.independent-b.json',dict(
 artifactType='independent-informed-review-seal',sealedAtUTC=now,reviewerId=review['reviewerId'],reviewMode=review['reviewMode'],
 priorRoleDisclosure=review['priorRoleDisclosure'],peerCurrentResultsReadBeforeOwnSeal=False,review=rp,authorInput=review['authorInput'],
 counts=review['counts'],requiredCorrections=review['requiredCorrections'],reviewAuthority='ai_candidate',
 nativeApproval=False,normalActivation=False,humanApproval=False,humanTrial=False,M7Claim=False))
print(json.dumps(dict(review=rp,seal=seal,counts=review['counts']),ensure_ascii=False,indent=2))
