import datetime
import hashlib
import json
from pathlib import Path

ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).parent
INPUT=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/V10-current-corrected-goal-image-author-input.json'
def pin(p):
    p=Path(p)
    if not p.is_absolute():p=ROOT/p
    b=p.read_bytes();return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def oh(v):return hashlib.sha256(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,v):
    p=OUT/name;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return pin(p)
a=json.loads(INPUT.read_text())
assert pin(INPUT)['sha256']=='fd9f6cf54a8078f0df80d0412eaaff708483f5017caaee27f11993133e8f00b0'
inspection=json.loads((OUT/'INSPECTION.actual-original-and-derivative-pins.json').read_text())
canonical=json.loads((ROOT/a['sourceCandidateCanonical']['path']).read_text());by={g['id']:g for g in canonical['goals']}
cp=pin(a['sourceCandidateCanonical']['path'])
assert cp['sha256']==a['sourceCandidateCanonical']['sha256'] and cp['bytes']==a['sourceCandidateCanonical']['bytes']

judgments=[
 dict(goalId='ad135d28-2682-5b52-a9e2-ddae3e03bb05',decision='KEEP',qaDecision='accepted_pilot',
  science='Fischer-Projektionen chemisch richtig: D-Glycerinaldehyd mitOH rechts, D-Erythrose rechts/rechts, D-Threose links/rechts. Das gemeinsame untere Konfigurationsmuster ist gelb, der obere Unterschied anC2 orange markiert. CHO steht oben, CH2OH unten. Die gestrichelte Vergleichsklammer und der ausdrückliche formale Stammbaum zeigen keine Reaktionspfeile/Biosynthesekette und behaupten kein optisches Drehzeichen.',
  at360='Drei große Projektionen und der orange C2-Wechsel gegenüber dem gelben Rest bleiben erkennbar. OH/H-Seiten sind lesbar; die Stoffnamen sind sekundär. Kein voller Hexosebaum oder kleinteiliges Arbeitsblatt nötig.',
  at680='Stoffnamen, Endgruppen und C2-Markierungen sind klar; ausreichender Weißraum zwischen den drei Karten.',
  direction='Alle Projektionen stehen in gleicher Fischer-Orientierung. Keine Personperspektive und keine Reaktionsrichtung werden fälschlich vorgegeben.',
  representation='Klare, freundliche Vergleichsgrafik als begrenztes Beispiel des neuen formalen Ordnen-Ziels; keine Forderung, dass eine Orientierungsabbildung den ganzen Leistungsnachweis zeigen muss.'),
 dict(goalId='6fa55d29-9d79-5b80-92f2-01f9bb64ef35',decision='KEEP',qaDecision='accepted_pilot',
  science='Zwei Auflagen, mittige Last und gebogene Probe zeigen einen plausiblen kontrollierten Biegevergleich. Der blaue kurze Doppelpfeil reicht tatsächlich von der gestrichelten unbelasteten Bezugslinie zur gebogenen Probenoberfläche; er misst nicht die Gewichtshöhe. ProbenA/B, Messschieber und leere Rohdatentabelle verweisen auf Geometrie/Vergleich/Dokumentation. Keine Messwerte oder Rohstoff-/Abbaubeweise werden vorgetäuscht.',
  at360='Die gebogene Probe zwischen Auflagen, Last und gestrichelte Bezugslinie sind deutlich; der blaue Deflexionspfeil bleibt sichtbar. Rohdatentabelle und Vergleichsproben sind als Hauptobjekte erkennbar, Skalenstriche müssen nicht gelesen werden.',
  at680='Pfeil-Endpunkte, Bezugslinie, ProbenA/B, Messgerät und leere Tabelle sind klar und nicht überfüllt.',
  direction='Last wirkt nach unten; Auflagen tragen die Enden, die Mitte biegt sich darunter. Das Klemmbrett ist eine unbenutzte Dokumentationsvorlage, keine verkehrt gelesene Notiz einer abgebildeten Person.',
  representation='Passende Untersuchungsszene ohne Rechen- oder Ergebnisbehauptung; FarbunterschiedA/B gibt keinen isolierten Kausalbeweis für Materialzusammensetzung.'),
 dict(goalId='4bd54a18-8dd2-59db-bddf-b4c34a10ba79',decision='KEEP',qaDecision='accepted_pilot',
  science='NaOH-Bürette tropft in die HCl-Probe auf einem Magnetrührer; die pH-Elektrode ist eingetaucht und über Messgerät mit dem Laptop verbunden. Die dargestellte pH-gegen-V(NaOH)-Kurve steigt im Äquivalenzbereich stark und danach flacher. Achsen haben richtige Größen, V in mL und pH ohne Einheit. Das ist ein qualitatives schematisches Modell, keine echte Messreihe und keine physikalisch zu fit­tende Rohwerttabelle. Keine schwache-Säure-Halbpunkt-/pKa-Pflicht wird gezeigt.',
  at360='Apparatur und Laptop bilden zwei große, lesbare Hauptmotive; der steile Anstieg ist auch ohne einzelne Kurvenzahlen erkennbar. NaOH/HCl/pH sind zuordenbar; keine feinen Bürettenzahlen werden zum Verstehen benötigt.',
  at680='Elektrode, Bürettenspitze, Rührer und numerische XY-Achsen sind gut trennbar; die Kurve bleibt ein anschauliches Schema.',
  direction='Zugabe erfolgt von der Bürette nach unten in die Probe; kumulatives Volumen läuft nach rechts, pH nach oben. Messanschlüsse und dem Betrachter zugewandter Laptop sind konsistent; keine dargestellte Person muss eine rückwärts gerichtete Skala lesen.',
  representation='Geeignete Geräte-plus-Diagramm-Orientierung. Die Bildpunkte begründen keine tatsächlich ausgeführte digitale Titration.'),
 dict(goalId='223e33a4-5545-5332-ac4e-7d7a6cbc587c',decision='KEEP',qaDecision='accepted_pilot',
  science='Drei getrennte Routen: Ölsaat→Presse→Pflanzenöl, Pflanzenöl→Umesterung→Biodiesel und Zucker-/Strohpfad→Gärung/Trennung→Bioethanol. Stroh führt ausdrücklich zuerst zu einem separaten Verzuckerungsbehälter; erst von dort verläuft der orange Pfeil zur Gärung. Keine direkte Strohvergärung wird behauptet. Die schematische Umesterung ist keine vollständige Stoffbilanz; fehlende Methanol-/Glycerin-Bilddetails ersetzen nicht das volle Sachmaterial. Kein BTL/Fischer-Tropsch-Mechanismus oder CO2-Neutralitätsversprechen wird eingezeichnet.',
  at360='Die drei großen Produktüberschriften und Presse/Reaktor/Gär-und-Trennroute sind gut unterscheidbar. Im dichteren rechten Drittel bleiben Stroh, der zusätzliche Vorbehälter und der orange Vorschaltpfeil sichtbar; kleine Zweitbeschriftungen sind nicht als eigene Aufgabe zu lesen.',
  at680='Auch Verzuckern/Zuckerrübe und die zusätzliche orange Route sind lesbar; die drei Spalten bleiben getrennt. Keine überfüllte molekulare Detailtafel.',
  direction='Hauptrouten zeigen nach rechts beziehungsweise nach unten durch die Prozessschritte. Strohvorbehandlung geht dem Gärbehälter voraus; keine Umpolung von Gewinnung und Herstellung.',
  representation='Begrenzte Prozessübersicht mit korrekter Stroh-Vorstufe. Die Zeichnung ist weder Anlagen-SOP noch vollständiger Gleichungs-/Generationenleistungsnachweis.'),
 dict(goalId='4965395d-e0c5-5e23-a408-a11712aab409',decision='KEEP',qaDecision='accepted_pilot',
  science='Historische Behandlung, heutiger Zugang und Nutzen/Risiken sind als verschiedene Beurteilungsaspekte dargestellt. Resistenz ist als Risikobeispiel benannt; das Evidenzbuch steht außerhalb und unterhalb beider Waagschalen mit Pfeilen als gemeinsame Entscheidungsgrundlage. Evidenz wird nicht als abzuwägender Nutzen in eine Schale gelegt. Es gibt keine Wirkstoff-, Dosis- oder klinische Erfolgszahl und kein persönliches Behandlungsversprechen.',
  at360='Früher/Zugang sowie Herz-Schutzsymbol gegen Risiko-Warnsymbol auf der Waage und das separate Evidenzbuch bleiben klar. Die kleinen Buchlinien/Packungsflächen sind dekorativ, nicht lesepflichtig.',
  at680='Nutzen/Risiken und das ausdrücklich separate Evidenzmotiv sind sofort lesbar; das Resistenzbeispiel ist erkennbar. Drei Motive sind räumlich deutlich getrennt.',
  direction='Pfeile verbinden historische/heutige Bezüge mit der Abwägung; Evidenzpfeile führen von außerhalb zu beiden Seiten. Verpackungen haben keine spiegelverkehrt zu lesenden Wirkaussagen.',
  representation='Passende gesellschaftliche Bewertungsorientierung. Die waagerechte Waage ist ein Abwägungssymbol und kein behauptetes quantitatives Gleichgewicht von Nutzen und Risiko.'),
 dict(goalId='72236f2c-771e-4ab6-933a-e549ee49d15b',decision='CORRECT',qaDecision='rejected_regenerate',
  science='Der gültige Hauptteil bleibt: Goldfolie/α-Streuung und ein schematischer kleiner positiver Kern mit Proton-/Neutronbeispielen und negativer Elektronenhülle. Im unteren rechten Zusatzlabel zeigt jedoch der Leiterpfeil Elektron e− auf die schwarze äußere Hüllengrenze, nicht auf eines der gelben Elektronen. Das verwechselt die Objektzuordnung; der obere Elektronenpfeil ersetzt diese fehlerhafte zweite Zuordnung nicht. Der Befund wurde nativ und per reinem Inspektionscrop bestätigt. Keine Stil-, Provider- oder JPEG-Normalisierung ist gefordert.',
  at360='Streuung und Kern/Hülle sind als Hauptmotiv erkennbar; Textdetails sind kleiner als in den neuen Comicbildern. Der falsche Zusatzleiter ist in der Gesamtansicht klein, wird dadurch aber nicht fachlich richtig.',
  at680='Teilchenbeschriftung und Leiterlinien sind lesbar; gerade hier ist der untere e−-Pfeil auf die Hüllenlinie nachvollziehbar. Kein allgemeines Redesign erforderlich.',
  direction='Belegte Richtungs-/Zielzuordnung: die Spitze des unteren rechten e−-Leiters endet am Außenkreis, neben dem tatsächlichen Elektron. Eng auf ein gelbes Elektron richten oder die redundante falsche Zuordnung entfernen; alle gültigen Motive bewahren.',
  representation='Das erhaltene JPEG und seine annähernde16:9-Komposition sind zulässig. Ablehnung dieses exakten Hashs ausschließlich wegen der konkreten Beschriftungszuordnung.',
  requiredCorrection=dict(area='lower-right duplicate Elektron e− leader',nativeCropRectangle=[2160,940,2710,1280],
                          minimalRemedy='Retarget the leader tip to a yellow electron, or remove/correct the redundant incorrect leader/label. Keep the valid original scene, format and main content.',
                          inspectionCrop='inspection/06-electron-leader-inspection-crop.png')),
 dict(goalId='8721d943-8368-5304-bd3c-7d7944099662',decision='KEEP',qaDecision='accepted_pilot',
  science='Mechanische Aufbereitung/Formung, chemische Kettenspaltung, PET-Hydrolyse mit Wasser und energetische Oxidation mitCO2/Strom/Wärme sind passend unterschieden. Die vier Vignetten sind Prozessbeispiele, keine ausdrücklich disjunkte Taxonomietabelle: Hydrolyse ist im aktuellen ganzen D ein konkreter rohstofflicher Weg. Die farbigen Fragmente sind abstrakte Modelle und werden nicht als atomweise Reaktionsgleichungen beurteilt. Energetische Nutzung bildet keinen dargestellten Kunststoff-Stoffkreislauf.',
  at360='Vier große Prozesssymbole und Titel sowie die ökologische/ökonomische Waage bleiben erkennbar. Keine winzige Zahl oder Moleküllegende ist nötig.',
  at680='Reaktor/Wasserzugabe, mechanischer Weg und Verbrennung mit getrennten Energieprodukten sind klar. Die Bilddichte ist für diese Vergleichsorientierung noch geeignet.',
  direction='Flüsse laufen von Abfall/Kette zu Wiederprodukt/Rohstoff beziehungsweise zu Strom/Wärme; keine Rückführung vonCO2 als fertiger Kunststoff. Die Waage gibt eine Abwägung, keine allgemeine Rangliste vor.',
  representation='Gutes bestehendes Vergleichsbild KEEP. Keine neue hierarchische Umzeichnung allein wegen gleich großer Prozessfelder erforderlich; whole-goal D begrenzt die Hydrolyseeinordnung.'),
 dict(goalId='0959eef2-3c7d-5b33-a109-ddf332a5dbd9',decision='KEEP',qaDecision='accepted_pilot',
  science='Ein schematisches Glycerinrückgrat mit drei Ester-Verknüpfungsmarkern und drei Fettsäureresten passt zum Triglyceridthema; es ist keine ausgeschriebene Strukturformel. Pflanzenbeispiele und drei Prüfbereiche Eigenschaften/Herkunft/Umweltfolgen führen zur begründeten Kraftstoffabwägung. Fragezeichen und Abwägungsaufforderung geben keine Motorfreigabe, universelle Nachhaltigkeit oder automatische CO2-Neutralität. Keine verschobene Umesterungs-/Generationenpflicht erscheint.',
  at360='Großer Öltropfen mit drei Ketten und die drei Beurteilungsfelder bleiben erkennbar; Titel und Abwägung sind lesbar. Landschaftsdetails tragen keine notwendige Leselast.',
  at680='Drei Esterstellen, gerade/geknickte Reste und Eigenschaften/Herkunft/Umweltfolgen lassen sich gut zuordnen; die dekorative Naturkulisse überlagert das Hauptmotiv nicht.',
  direction='Die drei Kriterienpfeile münden in die offene Kraftstoffentscheidung. Kein Richtungspfeil stellt eine chemische Herstellung aus dem Strukturmodell dar.',
  representation='Das vorhandene gute Pflanzenölbild passt weiterhin zum engeren Struktur-/Nutzungskern. Keine geschmacksbedingte Vereinfachung oder neue Stilangleichung nötig.'),
 dict(goalId='3eb2a06c-d283-57aa-9eb4-088940c4801a',decision='KEEP',qaDecision='accepted_pilot',
  science='Vier Stationen zeigen Forschungsproben, kleinen Laborreaktor, größere gekühlte Produktionsanlage mit nachgeschalteter Trennung und Vermarktungsinformation. Der große Rückpfeil führt einen Produktions-/Probenbefund zurück zur Forschung. Die Szene behauptet weder wirkstoffspezifische Syntheseformel noch klinische Wirksamkeit, tatsächliche Charge oder Freigabe. Sie bleibt beim behaltenen Prozesskettenziel und verlangt keine separate historische Gesellschaftsbewertung.',
  at360='Vier farblich getrennte Hauptstationen und die Vorwärts-/Rückpfeile sind erkennbar. Kleine Proben-/Papierdetails müssen nicht gelesen werden.',
  at680='Kleiner versus großer Reaktor, Kühlmantel und Separator sowie Rückkopplung sind klar. Die übersichtliche Viererfolge ist trotz Szenendetails nicht lesetextlastig.',
  direction='Orange Pfeile laufen Forschung→Labor→Produktion→Vermarktung, der türkisfarbene Rückpfeil Produktion→Forschung. Papierflächen tragen nur abstrakte Anzeigen; sie sind keine verkehrt geschriebene Laboranweisung für die dargestellten Personen.',
  representation='Gutes bestehendes zusammenhängendes Entwicklungsbild KEEP; die Bildstationen sind verbundene Phasen derselben Kompetenz und keine zusätzliche Aufgabenquote.'),
 dict(goalId='f4d5a02d-711b-5a6b-a41d-971359c1f64d',decision='KEEP',qaDecision='accepted_pilot',
  science='Lichtquelle, erster Polarisator, Probe und zweiter Analysator stehen in der richtigen optischen Reihenfolge. Blaue Eingangsrichtung und geneigte orange Richtung veranschaulichen eine mögliche Drehung; das separate Richtungsschema benennt sie, ohne einen Messwinkel oder D/L-/Plusminus-Satz festzulegen. Der gelbe Weiterpfeil gibt Lichtausbreitung, keine quantitative Transmissionsgleichheit an. Die Abbildung beweist keine Messung oder Identifikation und muss nicht die ganze Konzentrations-/Unsicherheitsrechnung abbilden.',
  at360='Optische Reihenfolge und der zentrale Probenkörper sowie die Richtungsänderung sind deutlich; nur Probe/Drehung sind nötig und gut lesbar.',
  at680='Polarisationsrichtungen und Drehungsinset sind klar, ohne überfüllte Formeln. Keine kleine Zahlenreferenz wird vorausgesetzt.',
  direction='Licht läuft links→rechts. Die eingezeichnete Drehung ist ein schematischer Vergleich, keine Blickrichtungs- oder D/L-Konvention mit behauptetem Vorzeichen. Nachfolgender Analysator ist korrekt hinter der Probe.',
  representation='Gutes bestehendes Geräteprinzipbild KEEP auch im präzisierten ganzen Polarimetrie-D-Kontext. Keine künstliche Erweiterung zum Rechnungsblatt.'),
]

records=[]
for i,(r,j,ins) in enumerate(zip(a['records'],judgments,inspection['rows'])):
    assert r['goalId']==j['goalId']==ins['goalId']
    actual=pin(r['actualImage']['path']);assert actual['sha256']==r['actualImage']['sha256'] and actual['bytes']==r['actualImage']['bytes']
    g=r['candidateWholeGoal'];original=by[r['goalId']]
    diff=sorted(k for k in set(g)|set(original) if g.get(k)!=original.get(k))
    assert diff==(['resourceLinks'] if r['newImage'] else [])
    assert r['actualPrimaryResourceLinkProposal'] in g['resourceLinks'] and r['actualPrimaryResourceLinkProposal']['skillpilotId']==g['id']
    accepted=j['decision']=='KEEP'
    records.append(dict(
      goalId=r['goalId'],inputRecordPointer=f'/records/{i}',candidateWholeGoalObjectSHA256=oh(g),
      candidateWholeGoal=g,actualImage=actual,newImage=r['newImage'],primaryResourceLink=r['actualPrimaryResourceLinkProposal'],
      sourceCandidateCanonicalDifferenceFields=diff,wholeGoalSemanticContextUnchangedFromSourceCandidate=True,
      reviewerId='independent-b-v10',reviewAuthority='ai_candidate',decision=j['decision'],qaDecision=j['qaDecision'],
      suitableForCurrentGoalContext=accepted,aiApprovedAssetSha256=actual['sha256'] if accepted else None,
      actualInspection=dict(tool='view_image',nativeDetail='original',nativeActuallyViewed=True,
                            phoneActuallyViewed=True,desktopActuallyViewed=True,
                            phone=ins['derivatives'][0],desktop=ins['derivatives'][1],originalSize=ins['originalSize'],
                            desktopContainHeightCapPx=448,desktopHeightCapChangesRequestedWidth=False),
      scientificFindingsDe=j['science'],phone360FindingsDe=j['at360'],desktop680FindingsDe=j['at680'],
      directionAndPerspectiveFindingsDe=j['direction'],representationFindingsDe=j['representation'],
      formatDecision=dict(originalFormat=ins['originalFormat'],originalSize=ins['originalSize'],
                          decision='retain_original_format_and_composition',
                          rationale='All assets are approximately16:9 landscape;680px views remain below448px height cap. Existing JPEG is not a conversion reason. No crop or aspect-ratio exception is needed.'),
      requiredCorrection=j.get('requiredCorrection'),
      orientationOnly=True,actualLearnerPerformance=False,humanApproval=False,nativeNormalRegistration=False))

copy=OUT/'INPUT.exact-V10-current-corrected-goal-image-author-input.json';copy.write_bytes(INPUT.read_bytes())
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
review=dict(
 artifactType='independent-V10-current-whole-goal-exact-image-visual-review',createdAtUTC=now,
 reviewerId='independent-b-v10',reviewMode='independent_informed_actual_image_current_goal_review',
 reviewer=dict(provider='OpenAI',model='GPT-6 (Codex)',modelVersion='runtime identifier not exposed'),
 priorRoleDisclosure='Completed independent B blind final163 D first pass and later two separately sealed informed author-correction reviews. These prior roles are disclosed; this is a new targeted actual-image V review, not another D/A/P/M run. No peer V results were read before this own seal.',
 peerVResultsReadBeforeOwnSeal=False,reviewAuthority='ai_candidate',recordStatus='candidate',
 originalInput=pin(INPUT),exactOwnInputCopy=pin(copy),sourceCandidateCanonical=cp,
 instructionsActuallyApplied=[dict(file=pin(ROOT/'AGENTS.md'),section='7.3 Atomic goal visualizations; user-provided repository guidance'),
                              dict(file=pin(ROOT/'docs/concept/skill-graph/atomic-goal-visualizations.md'),sections=['Purpose','Format and responsive legibility','Provider priority and exception policy','Quality Checklist','Hard Review Gate'])],
 inspectionManifest=pin(OUT/'INSPECTION.actual-original-and-derivative-pins.json'),
 inspectionMethod='Actually viewed all10 original images with view_image detail original, plus each separate proportional360px and680px PNG derivative:30 actual views. PIL used only for20 inspection resizes and2 additional inspection crops. No product/source image edited, no normalization, no synthetic generation.',
 additionalActualInspectionCrops=[pin(OUT/'inspection/06-nucleus-inspection-crop.png'),pin(OUT/'inspection/06-electron-leader-inspection-crop.png')],
 records=records,
 conclusion='KEEP9 exact image/current whole-goal pairs: all5 new PNGs and4 retained originals. One retained original72236 requires a narrow correction of its lower-right duplicate electron leader, which points to the shell outline. Preserve valid original content; no general redesign or format/provider conversion is justified.',
 counts=dict(reviewed=10,newPNGReviewed=5,retainedOriginalsReviewed=5,KEEP=9,CORRECT=1,newPNGKeep=5,retainedOriginalKeep=4,
             nativeViews=10,phone360Views=10,desktop680Views=10,additionalInspectionCrops=2,productImageEdits=0,
             normalVRegistrations=0,humanApprovals=0),
 boundaries=dict(normalWrites=False,DCompletion=False,PCompletion=False,ACompletion=False,MCompletion=False,humanApproval=False,humanTrial=False,
                 M7Closure=False,actualLearnerPerformance=False,generationIsApproval=False,registrationExecuted=False,
                 sourceOrPeerApprovalInferred=False),
 objectHashRule='SHA256 of UTF-8 JSON with ensure_ascii=False, sorted object keys and comma/colon separators; image/file pins always hash actual file bytes')
rp=write('REVIEW.V10-current-goal-exact-image.independent-b.json',review)
seal=write('SEAL.V10-current-goal-exact-image.independent-b.json',dict(
 artifactType='independent-machine-visual-review-seal',sealedAtUTC=now,reviewerId=review['reviewerId'],reviewMode=review['reviewMode'],
 peerVResultsReadBeforeOwnSeal=False,priorRoleDisclosure=review['priorRoleDisclosure'],review=rp,
 input=review['originalInput'],inspectionManifest=review['inspectionManifest'],counts=review['counts'],
 decisions=[dict(goalId=r['goalId'],candidateWholeGoalObjectSHA256=r['candidateWholeGoalObjectSHA256'],image=r['actualImage'],decision=r['decision'],qaDecision=r['qaDecision']) for r in records],
 reviewAuthority='ai_candidate',normalRegistration=False,humanApproval=False,humanTrial=False,M7Claim=False))
print(json.dumps(dict(review=rp,seal=seal,counts=review['counts']),ensure_ascii=False,indent=2))
