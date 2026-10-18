import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
N = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17'
AUTHOR = N / 'chemie-current442-five-P-scope-operator-remediation-author-20261018-v1'
OUT = Path(__file__).parent

def pin(path):
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    raw = p.read_bytes()
    return dict(path=str(p), sha256=hashlib.sha256(raw).hexdigest(), bytes=len(raw))

def objhash(value):
    raw = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    return hashlib.sha256(raw).hexdigest()

def pointer(value, ptr):
    for part in ptr.strip('/').split('/') if ptr else []:
        value = value[int(part)] if isinstance(value, list) else value[part.replace('~1', '/').replace('~0', '~')]
    return value

def write(name, value):
    p = OUT / name
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return pin(p)

a = json.loads((AUTHOR / 'AUTHOR.five-current-P-scope-operator-remedies.pending.json').read_text())
m = json.loads((AUTHOR / 'AUTHOR.complete-DE-EN-material-routes.pending.json').read_text())
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
canonical = json.loads((ROOT / a['inputs']['canonical']['path']).read_text())
extraction = json.loads((ROOT / a['inputs']['sourceExtraction']['path']).read_text())
mapping = json.loads((ROOT / a['inputs']['sourceMapping']['path']).read_text())
profiles = {}
target_ids = {x['goalId'] for x in a['existingWholeGoalAndProfileCandidates']}
for line in (ROOT / a['inputs']['currentP442WriterInput']['path']).read_text().splitlines():
    record = json.loads(line)
    if record['goalId'] in target_ids:
        profiles[record['goalId']] = record['profile']

findings = [
    ('684ffe86-3a9f-5514-866a-47d16372f2d4',
     'Die neue dritte Erwartung bleibt bei Bausteinen/Verknüpfungen und daraus begründeter industrieller Eignung. A erhält Glucose, B quellfähige Stärke, C faserbildende Cellulose. Die fehlende Cellulaseangabe verhindert eine unbelegte Cellulose-Fermentierbarkeit. Beim frischen Wechsel von Faser zu Leimung muss die Materialwahl neu begründet werden. Stammbaum und C2-Epimerie sind keine Abschlussbedingungen dieses Klassen-/Eigenschaftsziels. Beide ursprünglichen ganzen Fälle, beide Kern-Erwartungen und die Transfers bleiben exakt erhalten.'),
    ('0278a515-8990-5a1c-8a1b-a03382a144a3',
     'Nur die fremde praktische PLA-Pflicht wird entfernt. Die drei ursprünglichen Erwartungen sowie beide vollständigen Synthese-/Eigenschafts-/Anwendungsfälle bleiben exakt. Der lineare Milchsäuretrimer setzt zwei H2O frei; direkter Kondensationsweg und Lactid-Ringöffnung werden auseinandergehalten. Höhere Temperatur, Morphologie und Dicke begrenzen Anwendungen. Biobasierte Herkunft beweist keine schnelle Gewässer- oder Heimkompostabbaubarkeit. Die echte Untersuchung geht im ausdrücklich praktischen neuen Ziel weiter und wird nicht zu Modellrechnen herabgestuft.'),
    ('d72cbb62-0b65-5b9a-aece-70c23d4e618a',
     'Die bestehende Mehrkriterien-Einteilung einschließlich Azo-, Triarylmethan- und Anthocyaninfällen bleibt. Die neue Herkunfts-/Polyenroute trennt Strukturklasse, Gewinnungsweg und Verwendung; identisches synthetisches statt extrahiertes beta-Carotin ändert den Herkunftsweg, nicht die intrinsische Strukturklasse. Mehrere isolierte C=C erlauben den weiten Polyenbegriff, liefern keine bestimmte Farbe. Die frühere Energie-/Absorptionswechsel-Erklärung wird aus diesem Klassifikationsabschluss entfernt und beim passenden 87d8-Ziel erhalten. Die unveränderte allgemeine Variationsachse führt sie nicht wieder ein.'),
    ('02634fdd-c8ba-591a-b240-77129b1bebb8',
     'Alle vier eigenen Erwartungen und vier ganzen analytischen/praktischen Fälle bleiben exakt. Echte Indikatortitration ist weiterhin positiv erforderlich. Kontrollrechnung: 18,20mL 0,1000M in25,00mL HCl ergeben0,07280M; der zweiprotonige Fall ergibt0,05000M. Beim neuen verdünnten H2SO4-Fall ergeben12,50mL 0,04000M NaOH0,2500mmol Säure im25mL-Aliquot,0,01000M verdünnt und0,1000M original. Ein50mL-Aliquot verdoppelt Verbrauch, nicht Konzentration. Nur eigene pH-Serie/digitale XY-Pflicht wird zum ausdrücklichen neuen Ziel verschoben. Papierdaten bleiben kein Praxisbeleg.'),
    ('87d8cc68-fe82-5273-9e43-c18b566ecb6c',
     'Unveränderte vollständige drei Fälle, Erwartungen und Transfers bleiben. Der zusätzlich tatsächlich gelesene D–π–A-Sachfall hat350/500nm entsprechend3,54/2,48eV; Protonierung vermindert die gegebene Amindonation und verschiebt hier auf410nm. Der historische Auxochromgebrauch wird nicht als disjunkte moderne Stoffklassifikation behauptet. Die ergänzte Polyenroute450/300nm ergibt2,76/4,13eV, aufwärts gerichtete Absorption und die modellbezogene Konjugations-/Lückenerklärung. Genaue Wahrnehmungsfarbe folgt nicht aus einer Einzelbande. Die neue Klassifikationsgrenze bei isolierten Doppelbindungen ist echter Modelltransfer und erzwingt keine d72c-Mehrklassenprüfung.'),
    ('cc803809-fa7f-517c-b356-9f2f7caf21a5',
     'Die neue ausdrücklich erforderliche e4 schließt die vorherige positive Durchführungslücke: eigene freigegebene Kernhandlungen, echte Vor-/Anstiegs-/Nachphasen-Rohreihe, Mengen/Einheiten und tatsächliche Ceff-Herkunft plus eigene begrenzte Auswertung. Beide alten ganzen Zn/Cu- und Zn/Fe3+-Modellfälle und ihre galvanische-Arbeit-/Qv-Transfers bleiben exakt. Rechenkontrolle98,6J/K·9,0K=887,4J und etwa−222kJ/mol;229J/K·4,00K=916J bzw.·3,10K=709,9J. Umsetzung wird nicht aus Temperatur erfunden; fehlende Umsatzkontrolle begrenzt die molare Aussage. Im frischen Export sind30000ms30s und293,15K20,00°C; ΔT bleibt gleich. Fremdwerte und Freigabevermerk ohne Handlungen/Rohdaten erfüllen e4 nicht. Kein zweiter realer Versuch wird allein für den Datenfehlertransfer verlangt.'),
]
existing = []
for x, (gid, text) in zip(a['existingWholeGoalAndProfileCandidates'], findings):
    assert x['goalId'] == gid
    assert pointer(canonical, x['canonicalPointer']) == x['wholeCurrentGoal']
    assert profiles[gid] == x['wholeCurrentProfile']
    before, after = x['wholeCurrentProfile'], x['wholeProposedProfile']
    retained = {}
    for key in ('expectations', 'variationAxes', 'applicationCaseBriefs'):
        retained[key] = dict(
            exactPreservedIds=[v['id'] for v in before[key] if v in after[key]],
            removedOrReplacedIds=[v['id'] for v in before[key] if v not in after[key]],
            addedIds=[v['id'] for v in after[key] if v not in before[key]])
    existing.append(dict(goalId=gid, recommendation='accept_scientific_P_candidate', rationaleDe=text,
                         currentWholeGoalEqualsCanonical=True, currentWholeProfileEqualsP442SelectedInput=True,
                         wholeGoalUnchanged=x['goalBodyChanges'] == [],
                         proposedProfileObjectSHA256=objhash(after), retention=retained,
                         coverageBefore=before['coverageExpectations'], coverageAfter=after['coverageExpectations'],
                         nativeApproval=False))

new_findings = [
    ('ad135d28-2682-5b52-a9e2-ddae3e03bb05',
     'Ein zusammenhängendes formales Konfigurationsmodell: beim Hinzufügen des oberen Stereozentrums bleibt das untere Muster erhalten. GlucoseRLRR/MannoseLLRR teilenLRR, unterscheiden sich anC2; GalactoseRLLR folgtLLR, XyloseRLR folgtLR. D/L folgt dem letzten relevanten Stereozentrum, weder allenOH noch Drehvorzeichen. Der selbst gezeichnete beschriftete Stammbaum und frische Musterzuordnung sind prüfbar. Keine Biosynthese, industrielle Nutzung oder Glucose/Fructose-Ringpflicht wird angehängt.',
     'atomic: tree construction, retained configuration pattern and epimer/D-L reasoning are mutually connected parts of one supplied-pattern classification.',
     'no_memory_needed: all actual aldose patterns are supplied; reconstructing relations and rejecting false inferences are the evidence. No unprovided catalogue or stereochemical name list is required.',
     'HB selected-topic2.1 only; page26 explicitly lists Zuckerstammbaum, but does not literally command a complete tree/C2-epimer product. This narrow own operationalisation has no universal official whole-source credit.'),
    ('6fa55d29-9d79-5b80-92f2-01f9bb64ef35',
     'Die ausdrücklich praktische Leistung erhält die volle reale PLA-Eigenschaftsuntersuchung. Identifizierte biobasierte Proben, kontrollierter Streifenvergleich, eigene Rohwerte/Einheiten/Unsicherheit und begrenzte Schlussfolgerung gehören zusammen. Gleiche Breite/Spannweite/Last, tatsächliche Dicke und Konditionierung werden kontrolliert. Dickere Probe kann geometrisch steifer sein; daraus folgt weder andere Chemie noch Abbaubarkeit. Neue unbekannte Weichmacher-/Konditionierungsänderung verhindert einfache Dicken-Kausalität. Fehlende Freigabe/Probe/Rohdaten lässt Durchführung offen.',
     'atomic: planning, personal execution, controlled comparison, uncertainty and confounder transfer are stages of one property investigation.',
     'no_memory_needed: actual sample provenance and measurements plus control reasoning are needed. A recall deck cannot substitute for real execution or a new confounder analysis.',
     'HB introductory E GK/LK experimental renewable-plastic investigation is explicit on page19. PLA/bending is a selected concrete route, not a mandate to test every plastic or to synthesise PLA.'),
    ('4bd54a18-8dd2-59db-bddf-b4c34a10ba79',
     'Die starke einprotonige Säure bildet einen ganzen eigenen quantitativen pH-Titrationsablauf: begründeter Plan, echte eigene Volumen/pH-Paare, numerische digitale XY-Achsen und stöchiometrische Konzentration mit begrenztem Äquivalenzbereich. Das konkrete HCl/NaOH-Protokoll enthält Geräte/Kalibrierung, reale adaptierte Schritte und getrennte Indikatorbeobachtung. Eine simulierte Kurve oder manuell übernommene Fremdwerte reichen nicht. Frischer0,20→0,02mL-Fehler und kategoriale x-Achse erfordern Prüfung an eigener unveränderter Rohquelle; betroffene Konzentration/Unsicherheit werden neu beurteilt. Keine Automation/Exportpflicht.',
     'atomic: personally acquiring and digitally evaluating one quantitative strong-acid titration is one method workflow; weak-acid chemistry and half-equivalence are excluded.',
     'no_memory_needed: method understanding, personally acquired data, unit/stoichiometric reasoning and independent source correction dominate. Existing prerequisite knowledge need not be duplicated as new cards.',
     'HB common Q1.2 GK/LK scope on pages23/37. e094 remains its unchanged LK strong+weak+experimental-halfpoint competence. Its whole duty is not used as a GK prerequisite or GK replacement for the new narrow route.'),
]
new = []
current_ids = {g['id'] for g in canonical['goals']}
for x, (gid, text, atomicity, memory, scope) in zip(a['newWholeGoalAndProfileCandidates'], new_findings):
    assert x['goalId'] == gid
    g = x['wholeGoalCandidate']
    assert gid not in current_ids and all(v in current_ids for v in g['requires']) and g['contains'] == []
    new.append(dict(goalId=gid, recommendation='accept_narrow_scientific_goal_P_candidate', rationaleDe=text,
                    atomicityCandidateRecommendation=atomicity, memoryCandidateRecommendation=memory,
                    scopeBoundary=scope, goalObjectSHA256=objhash(g), profileObjectSHA256=objhash(x['wholeProfileCandidate']),
                    newIdAbsentFromCurrentCanonical=True, prerequisitesExist=True,
                    semanticKindCandidate='curricularAtomic', nativeAApproval=False, nativeMApproval=False,
                    nativeDApproval=False, nativeVApproval=False))

material_findings = [
    'A/B/C and changed paper-glue use exercise class/structure/property reasoning only; cellulose fermentation is unsupported without cellulase data. Supplied tree patterns are shared context, not this route closure.',
    'Complete supplied Fischer patterns support a formal labelled tree, C2 epimer comparison and independent galactose/xylose parent inference; D/L, rotation and biosynthesis are separated.',
    'Full retained real room-temperature PLA comparison, own raw records and confounder transfer; source provenance is required rather than inferred from bending. No supplied measurements or extra physical-trial quota.',
    'Complete origin/structure/use partition and changed identical synthetic beta-carotene/isolated-double-bond transfer. No energy-gap or absorption-shift completion duty.',
    'Complete450/300nm model, upward absorption,2.76/4.13eV and delocalisation boundary; isolated C=C does not specify a joint visible transition or exact colour. No origin classification closure.',
    'Full concrete supervised strong-acid route, calibrated meter, controlled adaptive volume increments, actual pH/volume raw source, numeric XY and concentration/uncertainty.0.20 versus0.02mL requires source correction, not desired-curve fitting; no weak acid or experimental halfpoint.',
    'Full locally released Zn/Cu2+ thermometry route with actual quantities, own pre/rise/post trace, actual Ceff and conversion/loss limitations. Original model887.4J is explicitly not a measurement/calibration. Fresh ms/K conversion and under-resolved-peak audit is independent reasoning, not learner data.'
]
materials = [dict(materialId=v['materialId'], goalIds=v['goalIds'], pointer='/materials/'+str(i),
                  recommendation='accept_scientific_material_route_candidate', rationale=t,
                  completeDeEnTaskSolutionTransferRubricRead=True, actualLearnerEvidence=False)
             for i, (v,t) in enumerate(zip(m['materials'], material_findings))]

source_reasons = {
 17:'The unchanged four-carrier union retains quantitative chemical applications. Removing digital pH from02634 does not remove its stoichiometric mathematics; no single titration closes the general standard.',
 95:'Unchanged radical/polycondensation/PLA synthesis union. Removing a practical PLA requirement leaves its explicit synthesis contribution intact.',
 96:'Unchanged sustainability/PLA union. Feedstock origin versus biodegradation remains explicitly assessed; practical bending supplies no false origin claim.',
 97:'Move actual investigation from descriptive0278 to explicit practical6fa55. Page19 permits selected property investigations, so no synthesis obligation is invented.',
127:'Add narrow real pH concentration4bd54 to indicator02634 and actual LK e094 contributions. A carrier union is scope qualified; e094 is not made a GK duty.',
134:'Replace singleton digital coverage by02634 partial indicator/quantification plus4bd54 actual strong-acid pH/digital workflow. Digital does not require automation. No weak-acid/halfpoint import.',
145:'Photosynthetic formation1051 and industrial class/property684 contributions remain, with the existing use carrier. The formal tree obtains zero biological-formation credit.',
146:'Unchanged class/structure/linkage union. New tree work is not required to close684; retained LK linkage carrier must retain its actual scope.',
148:'Retain stereocentre/stereoisomer/ring contributions and add the narrow supplied-tree route/term to ad135. Page26 selected stereochemistry and explicit term support an own operationalisation, not a literal complete-C2-tree command.',
214:'Unchanged social/economic/sustainability union; preserving PLA feedstock/degradation reasoning prevents loss of its partial contribution. Real bending alone does not satisfy sustainability evaluation.',
215:'Unchanged light/energy/reflection union. Absorption shift now remains on87d8 and is not silently required by d72 classification.',
216:'Unchanged classification/energy carriers with original course limits. d72 retains all original families and multiple criteria;87d8 is no substitute for those. No LK carrier becomes a GK obligation.',
217:'Unchanged occurrence/isolation/manufacture/use union. Given isolation-versus-synthesis routes stay with d72; mechanism duties stay with their actual separate LK goals. This informed delta does not declare the complete GK/LK source union closed.'
}
sources=[]
for x in a['sourceUnionCandidates']:
    assert pointer(extraction,x['sourceGoalPointer']) == x['wholeCurrentSourceGoal']
    assert pointer(mapping,x['mappingDecisionPointer']) == x['currentWholeDecision']
    sources.append(dict(ordinal=x['ordinal'], sourceGoalId=x['wholeCurrentSourceGoal']['id'],
                        recommendation='accept_scope_qualified_partial_union_candidate',
                        beforeCarrierIds=x['wholeCurrentCarrierIds'], afterCarrierIds=x['wholeProposedPartialCarrierUnion'],
                        rationale=source_reasons[x['ordinal']], retainedScope=x['sourceScopeAndCourseUnchanged'],
                        originalSourceAndDecisionMatchLive=True, officialWholeSourceClosure=False,
                        singletonMasteryClosesUnion=False, targetProjectionVerifiedAfterInstallation=False))

input_pins=[]
for role, declared in a['inputs'].items():
    actual=pin(declared['path'])
    input_pins.append(dict(role=role, declaredAuthorPin=declared, actualObservedPin=actual,
                           exactDeclaredPinMatches=actual['sha256']==declared['sha256'] and actual['bytes']==declared['bytes'],
                           readScope='selected whole goals/profiles/source objects' if role in ['canonical','sourceExtraction','sourceMapping','currentP442WriterInput'] else 'file hash only'))
original_pins=[]
for r in m['originalWholeSourceMaterials']:
    p=pin(r['source']['path'])
    assert p['sha256']==r['source']['sha256'] and p['bytes']==r['source']['bytes']
    original_pins.append(dict(file=p,selectedPointer=r['pointer'],readScope='whole selected actual author material; no review judgment'))
colour_path=N/'chemie-current439-HB-materials-resources-material-author-20261017-v1/materials/hb-colour-three-terms.DE-EN.json'
pdf_pin=pin(a['officialActualReading']['pdf']['path'])
assert pdf_pin['sha256']==a['officialActualReading']['pdf']['sha256']

review=dict(
 artifactType='independent-informed-targeted-author-correction-review', createdAtUTC=now,
 reviewerId='independent-b-p5-informed', reviewMode='informed_targeted_author_correction_review',
 reviewer=dict(provider='OpenAI',model='GPT-6 (Codex)',modelVersion='runtime identifier not exposed'),
 priorRoleDisclosure='Reviewer B of the completed, separately sealed blind final163 D first pass. This P5 review is informed and targeted; it is not another blind D163 run. Earlier D findings embedded in the author packet were visible as problem context and were not reused as authority. No other current independent P5 review was read.',
 peerCurrentReviewResultsReadBeforeOwnSeal=False, newBlindReviewClaim=False,
 recordStatus='candidate',reviewAuthority='ai_candidate',
 conclusion='All6 existing P successors,3 narrow goal/P candidates,7 complete material routes and13 scope-qualified partial source-union candidates are scientifically suitable as the targeted author correction. One declared normalRegistry pin is historical after unrelated live registry change; no activation/current-native-binding acceptance is claimed.',
 authorInput=pin(AUTHOR/'AUTHOR.five-current-P-scope-operator-remedies.pending.json'),
 materialInput=pin(AUTHOR/'AUTHOR.complete-DE-EN-material-routes.pending.json'),
 actualInputs=input_pins, actualOriginalMaterialReads=original_pins,
 additionalActualMaterialRead=pin(colour_path),
 officialPDFActualRead=dict(file=pdf_pin,physicalPages=[8,19,23,26,34,35,37],method='pdftotext -layout targeted physical pages; actual complete page text read'),
 externalPrimaryCheck=dict(url='https://goldbook.iupac.org/terms/view/A00536',purpose='Confirm the historical/obsolete auxochrome qualification in the retained D-pi-A material; no copied definition.'),
 existingPFindings=existing,newGoalAndProfileFindings=new,materialRouteFindings=materials,sourceUnionFindings=sources,
 mandatoryTermFinding=dict(term='Zuckerstammbaum',actualExtractionPointer='/mandatoryTermSets/11/terms/6',actualTermVerified=True,
                           moveFrom='684ffe86-3a9f-5514-866a-47d16372f2d4',moveTo='ad135d28-2682-5b52-a9e2-ddae3e03bb05',
                           completeTreeOrC2IsLiteralOfficialCommand=False,source145FormationCredit=False),
 protectedAlternativeGoals=[dict(goalId=x['goalId'],wholeCurrentGoalSHA256=objhash(x['wholeCurrentGoal']),
                                 preservedReason=x['notStretchedBecause']) for x in a['existingAlternativesActuallyReadAndPreserved']],
 technicalFinding=dict(code='historical-normal-registry-pin',severity='binding_boundary_not_scientific_rejection',
                       declaredAuthorPin=a['inputs']['normalRegistry'],actualObservedPin=pin(a['inputs']['normalRegistry']['path']),
                       assessment='Selected6 current goals and profiles, source extraction/mapping and P442 selected input all equal the author payload. The registry was only hashed, not interpreted as a new scientific input. Bind a future native activation to its actual registry; do not rewrite the historical author input or this seal.'),
 boundaries=dict(normalWrites=False,nativeWriterExecuted=False,nativeDCompletion=False,nativeVCompletion=False,nativeAorMCompletion=False,
                 humanApproval=False,humanTrial=False,M7Closure=False,actualLearnerPerformanceRecorded=False,
                 currentDenominatorClaim=442,newCandidatesInstalled=False,afterCompilerTargetCheck=False,
                 officialWholeSourceCoverageClaim=False,visualReuseAssetsReviewed=False),
 nextStepBoundary='A later installed/native result must retain exact reviewed profiles/material partitions, admit new candidates only in their actual target/course/stage scope, preserve e094 LK and existing non-HB targets, and bind actual current inputs. This informed scientific candidate review provides no D/V/Human/M7 completion.',
 counts=dict(existingPScientificCandidatesAccepted=6,newNarrowScientificGoalPCandidatesAccepted=3,atomicityCandidateRecommendations=3,
             noMemoryCandidateRecommendations=3,materialRoutesAccepted=7,partialSourceUnionCandidatesAccepted=13,
             scientificRevisionsRequired=0,technicalBindingBoundaries=1,nativeActivations=0),
 objectHashRule='SHA256 of UTF-8 JSON with ensure_ascii=False, sorted object keys and separators comma/colon; file pins always hash actual file bytes')
review_pin=write('REVIEW.informed-P5.independent-b.json',review)
seal=write('SEAL.informed-P5.independent-b.json',dict(
 artifactType='independent-informed-review-seal',sealedAtUTC=now,reviewerId=review['reviewerId'],reviewMode=review['reviewMode'],
 priorRoleDisclosure=review['priorRoleDisclosure'],peerCurrentReviewResultsReadBeforeOwnSeal=False,
 review=review_pin,authorInput=review['authorInput'],materialInput=review['materialInput'],counts=review['counts'],
 reviewAuthority='ai_candidate',nativeApproval=False,normalActivation=False,humanApproval=False,humanTrial=False,M7Claim=False))
print(json.dumps(dict(review=review_pin,seal=seal,counts=review['counts']),ensure_ascii=False,indent=2))
