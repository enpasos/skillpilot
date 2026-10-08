import json, hashlib
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parents[1]
BUNDLE = OUT.parent / 'bundle'
ISO = Path('/tmp/skillpilot-wirtschaft-by-eleven-future311-current164-y_bx_su7')
def digest(p): return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def write(p, x):
    assert not p.exists(), p
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')

# These are the independent reviewer's actual judgments after whole DE/EN inputs,
# contexts and eleven newly rasterized full PDF pages were read/viewed in session.
# This script only materializes the judgments; it does not substitute for inspection.
J = [
[
'Zeit ist begrenzt; Bedarf und Prioritäten können konkurrieren. Ein umsetzbarer Haushaltsplan muss diese Restriktion einhalten und begründete Anpassungen statt einer vermeintlich idealen Tagesroutine erlauben.',
'Time is limited and needs and priorities can compete. A feasible household schedule must respect this constraint and allow justified adjustments rather than impose a supposedly ideal daily routine.',
'Die Person stellt vorgegebene Zeitbedarfe und verfügbare Zeit gegenüber, erkennt Überschneidungen oder Überlastung und entwickelt einen zeitlich realisierbaren Plan mit begründeten Prioritäten und Änderungen.',
'The learner compares supplied time needs and available time, identifies overlap or overload and develops a feasible schedule with justified priorities and adjustments.',
'Bei einer neuen festen Verpflichtung oder einer geänderten Priorität passt die Person den Plan an und erklärt, welche Tätigkeit verschoben oder verkürzt wird und welche Grenze bestehen bleibt.',
'When a new fixed commitment or changed priority is introduced, the learner adjusts the schedule and explains which activity is moved or shortened and which constraint remains.',
'DE/EN operationalisieren dieselbe zusammenhängende Planungsleistung im vorgegebenen Haushaltsfall. Bedarf, Restriktion, Prioritäten und begründete Anpassung bleiben überprüfbar, ohne private Zeitdaten zu verlangen. Die ganze PDF-Seite zeigt eine erwachsene Person mit Zeit- und Tätigkeitssymbolen sowie zwei möglichen Plänen; sie erzwingt keine ideale Tagesroutine. Die externe Grundlage Verbraucherverhalten ist sichtbar.'],
[
'Grafische Konsumaussagen hängen von Skala und Bezugsgröße ab. Absolute Beträge und relative Anteile beantworten unterschiedliche Fragen; eine Darstellung darf Daten nicht durch eine ungeeignete Achse oder unklare Grundgesamtheit verzerren.',
'Graphical consumption claims depend on scale and reference quantity. Absolute amounts and relative shares answer different questions; a display must not distort data through an unsuitable axis or unclear denominator.',
'Die Person wählt und beschriftet eine geeignete Darstellung, verwendet eine nachvollziehbare Skala und Bezugsgröße und leitet Aussagen und Grenzen aus tatsächlich dargestellten Konsumdaten ab.',
'The learner selects and labels an appropriate display, uses a defensible scale and reference quantity and derives claims and limits from the consumption data actually shown.',
'Nach Änderung von Gesamtausgaben oder Datenumfang prüft die Person, ob ein bisheriger Vergleich absoluter Beträge auch für Anteile gilt, und passt Darstellung und Aussage an.',
'After total expenditure or data coverage changes, the learner checks whether a comparison of absolute amounts also applies to shares and adjusts the display and claim.',
'Beide Sprachfassungen verbinden Datendarstellung und deren Interpretation, ohne eine bloße Grafikproduktion als Verständnis zu zählen. Ganze PDF-Seite: 200/300 Euro und 20/15 Prozent stehen auf passenden 0-basierten Skalen; die unterschiedlichen Bezugsgrößen ermöglichen gerade keine Gleichsetzung von Betrag und Anteil. Haushaltsbudget ist externe Grundlage.'],
[
'Historische Geldformen funktionieren unter bestimmten Akzeptanz- und institutionellen Bedingungen. Teilbarkeit, Haltbarkeit und Transportfähigkeit können Nutzung ermöglichen oder begrenzen; ein zeitlicher Wandel ist kein unvermeidlicher Fortschritt in allen Eigenschaften.',
'Historical forms of money operate under particular acceptance and institutional conditions. Divisibility, durability and portability can enable or constrain use; temporal change is not inevitable progress in every property.',
'Die Person erklärt alle vier Eigenschaften an zwei bereitgestellten historischen Geldformen, bezieht ihre zeitliche und institutionelle Einbettung ein und begründet den dargestellten Wandel mit Bedingungen und verbleibenden Grenzen.',
'The learner explains all four properties using two supplied historical forms of money, considers their temporal and institutional setting and explains the depicted change through conditions and remaining limits.',
'Bei einem anderen historischen Formenpaar oder verändertem Akzeptanzrahmen prüft die Person erneut, welche Eigenschaften Nutzung erleichtern und weshalb eine spätere Form frühere Formen nicht automatisch überall ersetzt.',
'For another historical pair or changed acceptance conditions, the learner reassesses which properties facilitate use and why a later form does not automatically replace earlier forms everywhere.',
'Die aktuelle ganze Beschreibung behebt die frühere enge zeitliche Lücke ausdrücklich: zwei historische Formen werden im zeitlichen Zusammenhang verglichen und alle vier Eigenschaften benannt. DE/EN sind deckungsgleich. Tatsächlich gesehene PDF-Seite stellt Münzen, Papiergeld und Eigenschaftssymbole dar; sie behauptet weder universelle Chronologie noch zwangsläufigen Fortschritt. Geldfunktionen und Geldwertstabilität sind externe Grundlage.'],
[
'Kredit begründet Rückzahlungs- und gegebenenfalls Zinsverpflichtungen. Sicherheiten verändern Zugriffsmöglichkeiten und verteilen Risiken zwischen Kreditnehmer, Kreditgeber und Sicherungsgeber; eine Bürgschaft ist keine risikolose Unterstützung.',
'Credit creates repayment and, where applicable, interest obligations. Security changes recovery options and distributes risk between borrower, lender and security provider; a guarantee is not risk-free support.',
'Die Person vergleicht vorgegebene Kredit- und Sicherungsarrangements anhand konkreter Verpflichtungen, benannter Sicherheiten und Risiken für den Haushalt sowie einen möglichen Sicherungsgeber.',
'The learner compares supplied borrowing and security arrangements through specific obligations, identified security mechanisms and risks for the household and a possible security provider.',
'Bei Änderung von Sicherheit, Zahlungsausfall oder Sicherungsgeber erklärt die Person, wie Ansprüche und Verlustrisiken verschoben werden, ohne daraus eine pauschale Kreditempfehlung abzuleiten.',
'When security, default or security provider changes, the learner explains how claims and loss risks shift without inferring a blanket borrowing recommendation.',
'Die ganze DE/EN-Kompetenz verlangt den Vergleich von Verpflichtung, Sicherung und Risiko einschließlich Sicherungsgeber und bleibt ein einheitlicher Kreditfall. Die tatsächliche PDF-Seite unterscheidet Bürgschaft und Sachdeckung mit offenen Risikozeichen; dies behauptet keine automatische Schuldübernahme oder risikolose Finanzierung. Überschuldungsrisiken sind als externe Grundlage sichtbar.'],
[
'Preiselastizität verknüpft relative Mengen- und Preisänderungen unter benannten Modellbedingungen. Richtung und Stärke einer Reaktion folgen der angegebenen Elastizität und dem betrachteten Fall, nicht einem unbedingten Gesetz über beliebige Märkte.',
'Price elasticity relates relative quantity and price changes under stated model conditions. Direction and size follow the supplied elasticity and case rather than an unconditional law about every market.',
'Die Person setzt relative Preis- und Mengenänderungen korrekt zueinander in Beziehung, verwendet die ausdrücklich angegebene Elastizität und erläutert die Reaktion samt geltenden Modellbedingungen.',
'The learner correctly relates relative price and quantity changes, uses the explicitly supplied elasticity and explains the response together with the applicable model conditions.',
'Bei anderer Elastizität oder verändertem Marktumfeld begründet die Person, welche bisherige Reaktion verändert wird und welche Modellannahmen für den Vergleich konstant gehalten werden müssen.',
'With another elasticity or changed market setting, the learner explains which response changes and which model assumptions must remain fixed for the comparison.',
'DE/EN benennen relative Änderungen, gegebene Elastizität und klare Bedingungen; sie schreiben keine bestimmte Mengenrichtung für jeden Markt vor. Auf der ganzen PDF-Seite bleiben Mengenreaktionen mit Fragezeichen offen und Wetter, Personen und Geldbedingungen sichtbar. Marktmodell ist externe Grundlage; Bildpfeile verbinden die Preisfälle mit einer offenen Frage statt einer festen Garantie.'],
[
'Die Wirkung einer zusätzlichen Handlung ist von Gesamt- und Durchschnittsgrößen zu unterscheiden. Eine Entscheidung benötigt ausdrücklich vergleichbare Nutzen- und Kostengrößen; ordinalen Nutzen und Eurokosten darf man nicht ohne Modellannahme direkt verrechnen.',
'The effect of one additional action differs from totals and averages. A decision requires explicitly comparable benefit and cost measures; ordinal utility and euro costs cannot simply be netted without a model assumption.',
'Die Person identifiziert Nutzen und Kosten einer zusätzlichen Handlung, grenzt sie von Gesamt- und Durchschnittswerten ab und begründet eine Anpassung nur anhand im Fall tatsächlich vergleichbarer Größen.',
'The learner identifies benefit and cost of one additional action, distinguishes them from totals and averages and justifies an adjustment only with measures actually comparable in the case.',
'Bei veränderter zusätzlicher Einheit oder anderen Zusatzkosten entscheidet die Person erneut anhand der passenden Zusatzgrößen und erklärt, weshalb ein unveränderter Gesamtwert dafür nicht ausreicht.',
'For a changed additional unit or different marginal cost, the learner reassesses the choice using the relevant marginal measures and explains why an unchanged total is insufficient.',
'Der aktuelle Text bindet Nutzen-Kosten-Vergleich ausdrücklich an vergleichbare Modellgrößen und trennt Zusatz-, Gesamt- und Durchschnittswerte in beiden Sprachen. PDF-Seite zeigt eine weitere Hockerproduktion, Zusatzmaterial und offenen Nutzen; sie enthält keine fingierte Gleichsetzung von subjektivem Nutzen und Geld. Der Verbraucher-Kontext liefert die externe Grundlage.'],
[
'Monopol, Oligopol und Polypol unterscheiden sich nach der Zahl unabhängiger Anbieter im abgegrenzten Markt. Anbieterzahl allein beweist weder rechtswidrige Marktmacht noch intensiven Wettbewerb; dafür sind weitere Informationen erforderlich.',
'Monopoly, oligopoly and many-supplier markets differ by the number of independent suppliers in the defined market. Supplier count alone proves neither unlawful market power nor intense competition; further information is required.',
'Die Person ordnet den vorgegebenen Markt anhand unabhängiger Anbieter ein und benennt zusätzliche Informationen etwa zu Abgrenzung, Eintrittsbarrieren, Verhalten oder Nachfrageralternativen für ein Wettbewerbsurteil.',
'The learner classifies the supplied market by independent suppliers and identifies further information such as market definition, entry barriers, conduct or demand-side alternatives needed for a competition judgment.',
'Wenn mehrere Verkaufsstellen zu einem gemeinsamen Unternehmen gehören oder Marktzutritt verändert wird, überprüft die Person Anbieterzahl und Wettbewerbsurteil statt Verkaufsstellen automatisch als unabhängige Anbieter zu zählen.',
'When several outlets belong to one firm or entry conditions change, the learner reassesses supplier count and competition rather than automatically treating outlets as independent suppliers.',
'Die aktuelle DE/EN-Beschreibung begrenzt die erste Einordnung auf unabhängige Anbieter und trennt sie ausdrücklich vom zusätzlichen Wettbewerbsurteil. Tatsächliche ganze PDF-Seite illustriert Ein/Wenige/Viele mit denselben Waren und derselben fragenden Kundin; drei oder acht gezeichnete Geschäfte sind exemplarisch und werden im Text nicht zu universellen Zahlenschwellen gemacht.'],
[
'Ein Experiment benötigt nachvollziehbare Vergleichsbedingungen. Beobachtete Unterschiede sind mit der variierten Bedingung zu verbinden, aber Stichprobe, Zuteilung und Störfaktoren begrenzen die kausale und allgemeine Interpretation.',
'An experiment requires defensible comparison conditions. Observed differences must be related to the varied condition, while sample, allocation and confounding limit causal and general interpretation.',
'Die Person analysiert den Aufbau und die angegebenen Ergebnisse, prüft die Vergleichbarkeit der Bedingungen und unterscheidet beobachteten Einfluss von weitergehenden, nicht gedeckten Kausalbehauptungen.',
'The learner analyses the design and reported results, checks comparability of conditions and distinguishes observed influence from broader unsupported causal claims.',
'Bei nicht zufälliger Zuteilung, anderer Stichprobe oder einer zusätzlichen Variation erklärt die Person, welche Deutung schwächer wird und welche Kontrolle für einen stärkeren Vergleich nötig wäre.',
'With non-random allocation, another sample or an additional variation, the learner explains which interpretation weakens and what control would support a stronger comparison.',
'Beide Fassungen verlangen Aufbau, Ergebnis und Grenzen der kausalen Deutung in derselben Analyseleistung. Die ganze PDF-Seite zeigt zufällige Zuteilung, gleiche Tassen und unterschiedliche Preisanker; Einfluss und Grenzen bleiben Fragen. Die angedeuteten Balken sind keine behaupteten empirischen Versuchsdaten. Begrenzte Rationalität ist externe Grundlage.'],
[
'Erwartungsnutzen bewertet riskante Ergebnisse nach einem spezifizierten Nutzenmodell mit Wahrscheinlichkeiten. Prospect-Theory erklärt Bewertungen relativ zu einem Referenzpunkt; unterschiedliche Modellannahmen dürfen nicht als universelle sichere Verhaltensprognose ausgegeben werden.',
'Expected utility evaluates risky outcomes using a specified utility model and probabilities. Prospect theory explains evaluation relative to a reference point; differing assumptions must not become a universal certain prediction of behaviour.',
'Die Person wendet das ausdrücklich spezifizierte Erwartungsnutzenmodell auf den gegebenen Risikofall an, vergleicht die Wahl mit der bereitgestellten referenzabhängigen Erklärung und erläutert die jeweiligen Annahmen.',
'The learner applies the explicitly specified expected-utility model to the supplied risky-choice case, compares the choice with the given reference-dependent explanation and explains each set of assumptions.',
'Nach Veränderung von Referenzpunkt oder Nutzenfunktion begründet die Person, weshalb sich eine modellbezogene Wahl ändern kann und welche Schlussfolgerungen ohne diese Angaben nicht bestimmt sind.',
'After the reference point or utility function changes, the learner explains why a model-based choice can change and which conclusions remain undetermined without these inputs.',
'Die aktuelle DE/EN-Kompetenz grenzt beide Modelle auf einen vorgegebenen Risikofall mit ausdrücklich spezifizierten Annahmen ein. Die ganze PDF-Seite trennt 70/30-gewichtete Nutzenmarker vom referenzabhängigen Gewinn-Verlust-Verlauf und lässt Sicher/Chance offen. Sie behauptet keine tatsächlich beobachtete Wahl oder perfekte Verhaltensprognose.'],
[
'Libertärer Paternalismus beeinflusst durch Wahlarchitektur, erhält aber Wahlmöglichkeiten und praktisch zugängliche Abwahl. Verbot und veränderte monetäre Anreize greifen anders in die Entscheidung ein; ein bloßes Etikett Standard beweist noch keinen zulässigen Nudge.',
'Libertarian paternalism influences through choice architecture while preserving alternatives and practically accessible opting out. Prohibition and changed monetary incentives intervene differently; merely labelling something a default does not establish a suitable nudge.',
'Die Person unterscheidet bereitgestellte Maßnahmen anhand tatsächlicher Wahlarchitektur, erhaltener Alternativen und zugänglicher Abwahl von Verboten und monetären Anreizen und begründet jede Einordnung am Fall.',
'The learner distinguishes supplied measures from prohibitions and monetary incentives using the actual choice architecture, retained alternatives and accessible opting out and justifies each classification from the case.',
'Wird eine Abwahl kostenreich oder faktisch unzugänglich, prüft die Person die bisherige Einordnung neu und erklärt, weshalb ein nominell vorhandener anderer Weg nicht automatisch freie Wahl gewährleistet.',
'When opting out becomes costly or practically inaccessible, the learner reassesses the classification and explains why a nominal alternative does not automatically preserve free choice.',
'DE/EN nennen die entscheidenden Kriterien statt lediglich politische Begriffe abfragen zu lassen. Die tatsächlich ganze PDF-Seite unterscheidet Standard mit sichtbarer Abwahl, gesperrten Weg und Anreiz zwischen offenen Möglichkeiten; dieselbe Person verhindert demografische Kopplung. Externe Grundlage ist Begrenzte Rationalität; keine normative Zustimmung zu jedem Nudge wird vorausgesetzt.'],
[
'Geld ist wirtschaftlich austauschbar, wird aber gedanklich oft verschiedenen Zweckkonten zugerechnet. Diese Bewertungswirkung unterscheidet sich von realen Budgetgrenzen und bewusst gesetzten Sparzielen; ein Zweckkonto allein beweist noch keine Fehlentscheidung.',
'Money is economically fungible but is often mentally assigned to purpose-based accounts. This evaluation effect differs from real budget constraints and deliberately chosen saving goals; an earmarked account alone does not prove a mistaken choice.',
'Die Person erklärt am vorgegebenen Konsumfall, wie gleiche austauschbare Geldbeträge je nach mentaler Zuordnung unterschiedlich bewertet werden, und grenzt diesen Mechanismus von echter Mittelknappheit und gewollten Sparzielen ab.',
'The learner explains how equal fungible amounts are evaluated differently according to mental allocation in the supplied consumption case and distinguishes this mechanism from real resource scarcity and deliberate saving goals.',
'Bleiben Vermögen und Budget gleich, ändern sich aber Herkunft oder gedachte Zweckbindung des Geldes, prüft die Person die veränderte Bewertung und unterscheidet psychologische Zuordnung von einer tatsächlichen Budgetänderung.',
'When wealth and budget remain constant but the source or imagined earmarking changes, the learner examines changed evaluation and distinguishes psychological allocation from an actual budget change.',
'Die DE/EN-Texte grenzen mentale Buchführung fachlich von Budgetrestriktion und bewusstem Sparen ab und verlangen eine Erklärung am konkreten Fall. Tatsächliche ganze PDF-Seite zeigt austauschbare Münzen, gedachte Urlaub-/Geschenkkonten und einen getrennten Behälter als Budgetgrenzenvergleich. Das Bild allein behauptet weder irrationales Verhalten noch eine Diagnose der dargestellten Person.']
]

inp=json.loads((OUT/'description-review-input.json').read_text())
campaign=json.loads((OUT/'description-review-campaign.json').read_text())
manifest=json.loads((BUNDLE/'manifest.json').read_text())
render=json.loads((BUNDLE/'book.pdf.render-manifest.json').read_text())
assert len(inp['goals'])==len(J)==11
batch=campaign['batches'][0]
assert batch['goalIds']==[g['goalId'] for g in inp['goals']]
runid=campaign['roundId']+'.actual-codex-session'
now=datetime.now(timezone.utc).isoformat()
artifacts=[]
for a in manifest['artifacts']:
    assert digest(BUNDLE/a['path'])==a['digest']
    artifacts.append({'role':a['role'],'digest':a['digest']})
batchpath=OUT/'batches'/f"{batch['batchId']}.input.jsonl"
artifacts.append({'role':'description_review_batch_input_jsonl','digest':digest(batchpath)})
assert artifacts[-1]['digest']==batch['batchInputFingerprint']
records=[]; inspections=[]
keys=['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn']
for i,(g,j) in enumerate(zip(inp['goals'],J)):
    p=g['reviewContext']['page']
    assert p['evidenceReview'] is None and g['reviewContext']['evidenceProfile'] is None
    imagepath=ISO/'app/public'/p['visualization']['url'].lstrip('/')
    assert digest(imagepath)==p['visualization']['originalDigest']
    pdfpage=OUT/'inspection'/f'native-page-{i+3:02}.png'
    assert pdfpage.exists()
    rationale=j[6]+' Aktueller Buch-P und evidenceReview sind null; deshalb create für den getrennten V2-Vertrag, keine Prüfung nicht eingebetteter Fälle behauptet. BY-Profilbereich mit Auswahl bleibt Quellenkontext; die laufende Runde ist inert und verändert den aktuellen 303-Nenner nicht.'
    rec={ '$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion':1,
    'recordId':campaign['roundId']+'.'+g['goalId'][:8], 'runId':runid,
    'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],
    **{k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']},
    'decision':'keep','understandingEvidence':dict(zip(keys,j[:6])),'rationale':rationale,
    'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'create','recordStatus':'candidate','reviewAuthority':'ai_candidate'}
    records.append(rec)
    asset=next(a for a in render['assets'] if a['publicPath']==p['visualization']['url'])
    assert 'sha256:'+asset['sourceSha256']==p['visualization']['originalDigest'] or asset['sourceSha256']==p['visualization']['originalDigest']
    inspections.append({'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'physicalPdfPage':i+3,'actualWholeNativePdfPageViewed':True,'pdfPagePath':str(pdfpage.relative_to(ROOT)),'pdfPageSha256':digest(pdfpage),'actualBoundSourcePngPath':str(imagepath),'actualBoundSourcePngSha256':digest(imagepath),'actualRenderDerivativeMetadata':asset,'actualFinding':rationale})
rp=OUT/'results'/f"{batch['batchId']}.records.jsonl"
rp.parent.mkdir(exist_ok=True)
assert not rp.exists()
rp.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
start=json.loads((OUT/'inspection/actual-run-start.metadata.json').read_text())
params={'modelIdentifier':'not_exposed','generationParameters':'not_exposed','interactiveSession':True}
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,
**{k:campaign[k] for k in ['campaignId','roundId','bundleFingerprint','bookDigest','promptFingerprint','criteriaFingerprint','independenceGroupId']},
'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'provider':'OpenAI','model':start['model'],'role':'subject_reviewer','promptFamilyId':'independent-current-description-review-positive-understanding-v2','generationParametersFingerprint':'sha256:'+hashlib.sha256(json.dumps(params,sort_keys=True).encode()).hexdigest(),'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':artifacts,'startedAt':start['actualStartedAt'],'completedAt':now,'status':'completed','outputDigest':digest(rp),'toolchainVersion':'codex-interactive-independent-description-review-v1'}
runpath=rp.with_name(f"{batch['batchId']}.run.json")
write(runpath,run)
receipt={'schemaVersion':1,'role':'independent_description_reviewer','provider':'OpenAI','model':start['model'],'completedAt':now,'humanApprovalClaimed':False,'blindToRoundBAndRootPositiveVerdicts':True,'previousOwnRole':start['previousOwnRole'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'actualWholeCurrentDeEnCanonicalAndPageContextsRead':11,'actualWholeCurrentGermanPdfPhysicalPagesViewed':list(range(3,14)),'actualWholeHtmlTextRead':True,'englishTextActuallyReadFromStructuredInput':True,'englishPdfNotClaimed':True,'actualOwnPromptCriteriaCampaignRecordRunContractRead':True,'currentDescriptionDecisions':{'KEEP':11,'REVISE':0},'bookEvidenceProfilesActual':None,'bookEvidenceReviewsActual':None,'evidenceProfileRecommendations':{'create':11},'separatePositiveCaseInspectionNotClaimed':True,'currentAuthoritativeCurricularAtomicDenominator':303,'proposed311UniverseIsInert':True,'standaloneNative360680VisualizationApprovalNotClaimedByThisDRun':True,'criteriaScopeLimitation':'Frozen supplementary criteria focus on the new historical-money atom. Other ten whole goals were reviewed using the full common native prompt and their actual DE/EN/context; no broader supplementary criteria binding is invented.','actualNativeArtifactChecks':artifacts,'goals':inspections,'actualRecordsPath':str(rp.relative_to(ROOT)),'actualRecordsSha256':digest(rp),'actualRunManifestPath':str(runpath.relative_to(ROOT)),'actualRunManifestSha256':digest(runpath),'limitations':['No actual learner evidence or human release approval.','Separate P-v2 is not pretended embedded in the legacy book.','This blind D-A candidate is not a final strict closure and does not authorize the future 311 denominator.','No new whole-source coverage, source authority or private learner projection is established by the supplied raw BY/GK/LK tags.']}
write(OUT/'independent-round-a-inspection.receipt.json',receipt)
print(json.dumps({'records':str(rp.relative_to(ROOT)),'recordsSha256':digest(rp),'run':str(runpath.relative_to(ROOT)),'inspectionSha256':digest(OUT/'independent-round-a-inspection.receipt.json')},ensure_ascii=False))
