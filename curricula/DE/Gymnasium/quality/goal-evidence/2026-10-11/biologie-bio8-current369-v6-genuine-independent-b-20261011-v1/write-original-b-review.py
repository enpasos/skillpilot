"""Materialize this agent's original judgments after actual independent inspection.

This does not synthesize or borrow any author/A/peer verdict and writes only B.
"""
import json, hashlib
from pathlib import Path
from datetime import datetime, timezone

O = Path(__file__).parent
V = O.parent / 'biologie-bio8-current369-combined-Bio3-targeted-author-successor-20261011-v6'
R = V / 'native/current397-native19/round-b'
def load(p): return json.loads(Path(p).read_text())
def digest(p): return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
def dump(p, d): Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
input_ = load(R/'description-review-input.json')
campaign = load(R/'description-review-campaign.json')
bundle = load(R/'review-bundle-manifest.json')
batch = campaign['batches'][0]
runid = 'biologie-Bio8-v6-genuine-independent-b-20261011-v1.original-D19'

# Each row is an original, individual DE/EN understanding, observable performance,
# transfer judgment and rationale. KEEP is decided from the actual bounded goal.
judgments = [
('Nukleotide verbinden Zucker, Phosphat und Base; die Basenfolge trägt Information, die komplementäre Paarung macht sie kopierbar.',
 'Nucleotides join sugar, phosphate and base; base order carries information and complementary pairing enables copying.',
 'Stellt für eine neue Basenfolge beide komplementären Stränge im Modell dar und verbindet die richtige Paarung mit der Informationsspeicherung.',
 'Models both complementary strands for a new base order and connects correct pairing with information storage.',
 'Erklärt nach Austausch einer Base, welche Partnerbase sich ändern muss und warum gleiche Bausteinmengen verschiedene Informationen codieren können.',
 'After a base substitution, explains which partner must change and why identical amounts of building blocks can encode different information.',
 'KEEP: Die aktuelle Beschreibung verbindet Bausteine, Paarung und Information in einer prüfbaren Modellkompetenz. DE/EN sind gleichwertig. Die ganze Seite und Rückwärtsbindungen passen zu den nun getrennten Methoden; eine Strukturzeichnung ist keine Laborleistung.'),
('Transkription und Translation verbinden eine DNA-Vorlage über die mRNA mit einer Aminosäurefolge, ohne DNA in Protein umzuwandeln.',
 'Transcription and translation connect a DNA template through mRNA with an amino-acid sequence without converting DNA into protein.',
 'Verfolgt eine vorgegebene DNA-Sequenz über komplementäre RNA und den angegebenen Code bis zum Polypeptid und benennt die Rollen beider Prozesse.',
 'Traces a supplied DNA sequence through complementary RNA and the supplied code to a polypeptide, identifying both processes.',
 'Begründet an einer neuen Sequenzänderung, wann eine andere Aminosäure oder ein Stopp entsteht; trennt den Modellbefund von unbekannter Proteinwirkung.',
 'For a fresh sequence change, explains a changed amino acid or stop and separates the model result from unknown protein function.',
 'KEEP: Ein zusammenhängender Informationsfluss ist atomar. Die neuen direkten Nutzer Expression, Histonmodifikation und RNAi benötigen gerade diese Basis. Das eukaryotische Bild illustriert einen Fall, behauptet keine universelle Kernlokalisation aller Organismen.'),
('Ein Restriktionsenzym schneidet DNA abhängig von seiner Erkennungssequenz; Zahl und Lage der Schnitte bestimmen die Fragmente.',
 'A restriction enzyme cuts DNA according to its recognition sequence; cut number and position determine fragments.',
 'Leitet für lineare 1000 bp und den Schnitt bei 400 bp die Fragmente 400 und 600 bp ab und erklärt die Sequenzspezifität.',
 'Derives 400 and 600 bp fragments for linear 1000 bp DNA cut at 400 bp and explains sequence specificity.',
 'Erklärt bei Verlust einer Erkennungsstelle das neue Fragmentmuster und hält die Gesamtlänge konstant; schließt daraus keine Vervielfältigung.',
 'When a recognition site is lost, explains the changed fragments while conserving total length and infers no amplification.',
 'KEEP: Eigenständige Kompetenz aus dem Methodencluster; die Ableitung gehört zur Erklärung der Spaltung. Die tatsächlichen beiden Fälle und das Bild prüfen Sequenzänderung statt bloßer Begriffsnennung. BY-Prinzip und HE-LK-Methodenkontext sind keine allgemeine HE-GK-Pflichtbehauptung.'),
('PCR vervielfältigt einen durch zwei passende Primer begrenzten DNA-Abschnitt über Trennen, Anlagern und Verlängern.',
 'PCR amplifies a DNA segment bounded by two matching primers through separation, annealing and extension.',
 'Erklärt im vorgegebenen Modell die drei Schritte und nach innen gerichtete Verlängerung; bewertet Probe, Positivkontrolle und Wasserkontrolle.',
 'Explains the three steps and inward extension in the supplied model and evaluates sample, positive control and water control.',
 'Revidiert den Nachweis bei neuer positiver Wasserkontrolle wegen möglicher Kontamination; DNA-Nachweis beweist weder lebende Erreger noch Krankheit.',
 'Revises the result for a newly positive water control because of possible contamination; detected DNA proves neither live pathogens nor illness.',
 'KEEP: Der operative Satz verlangt Prinzip und Anwendungen beschreiben, nicht reale PCR durchführen. Der knappe Titel wird durch Satz und echte Modelle eindeutig begrenzt. Primerorientierung, Kontrolle und frische Gegenevidenz liefern anspruchsvolle Anwendung ohne vorgetäuschte Praxis.'),
('Geltrennung nutzt die Wanderung von DNA im elektrischen Feld; bei linearen Fragmenten wandern kleinere unter gleichen Bedingungen weiter.',
 'Gel separation uses DNA migration in an electric field; smaller linear fragments travel farther under matching conditions.',
 'Ordnet vorgegebene Banden anhand eines Größenmarkers begründet Fragmentlängen zu und benennt die richtige Wanderungsrichtung.',
 'Uses a size marker to justify fragment lengths for supplied bands and identifies the correct migration direction.',
 'Begrenzt nach fehlendem Marker oder veränderten Laufbedingungen die Größenangabe statt gleiche Höhe über unterschiedliche Gele als Beweis zu behandeln.',
 'Limits size inference when the marker is missing or running conditions change instead of treating equal height across gels as proof.',
 'KEEP: Erklärung und Musterinterpretation bilden eine gemeinsame Auswertungskompetenz. Das tatsächliche Bild zeigt Minus an den Taschen, Plus in Wanderrichtung und größere Fragmente näher am Start. PCR und Gel sind getrennte Teilbindungen, keine doppelte Freigabe des ganzen Quellenoperators.'),
('Natürliche Replikation und PCR nutzen Vorlage, Primer und Polymerase; Strangtrennung und Bedingungen werden technisch unterschiedlich realisiert.',
 'Natural replication and PCR use template, primers and polymerase, while strand separation and conditions are implemented differently.',
 'Vergleicht Helicase im Zellprozess mit Temperaturzyklen der PCR und begründet thermostabile Polymerase sowie die gezielte Primerwahl.',
 'Compares cellular helicase with PCR temperature cycles and explains thermostable polymerase and targeted primer selection.',
 'Leitet bei einer hitzeempfindlichen Polymerase die neue technische Störung ab und erklärt eine passende Lösung statt PCR mit vollständiger Zellreplikation gleichzusetzen.',
 'Infers the technical defect from a heat-sensitive polymerase and explains a fitting remedy without equating PCR with complete cellular replication.',
 'KEEP: Probleme und Lösungen ergeben sich aus dem einen Prozessvergleich. BY12-GA nennt genau den Vergleich; zusätzliche BY-EA-Reparaturenzyme bleiben beim entsprechenden Partner. Die neuen atomaren Vorbedingungen DNA und PCR sind fachlich passend und ersetzen den Methodencluster sinnvoll.'),
('Vektoren vermitteln Fremd-DNA in Wirtszellen; DNA-Aufnahme, Replikation, Zellklonierung und Proteinexpression sind verschiedene Aussagen.',
 'Vectors deliver foreign DNA into host cells; uptake, replication, cell cloning and protein expression are distinct claims.',
 'Erklärt im plasmidalen Modell den Einbau und die Weitergabe bei Zellteilung und trennt eine vorübergehende virale Aufnahme von stabiler Klonierung.',
 'Explains insertion and propagation in a plasmid model and distinguishes temporary viral delivery from stable cloning.',
 'Ändert die Folgerung bei fehlendem Replikationsursprung oder neu belegter Integration; leitet aus DNA-Präsenz keine Proteinbildung ab.',
 'Changes the inference for a missing replication origin or newly demonstrated integration and infers no protein production from DNA presence.',
 'KEEP: DNA-Transfer mit seiner Klonierungsfolge ist ein zusammenhängender modellierter Workflow. Expression ist als eigene neue Kompetenz herausgelöst. HE phys39 trägt Plasmide/Viren/Klonierung auf LK, BY9 trägt die prinzipielle Veränderung teilweise; diese Bindungen beanspruchen keine tatsächliche Transformation.'),
('Codierte Information wird nur mit passenden Expressionssignalen und funktionsfähigen Wirtsprozessen als Protein realisiert; DNA allein reicht nicht.',
 'Encoded information becomes protein only with compatible expression signals and functioning host processes; DNA alone is insufficient.',
 'Verknüpft im gegebenen Vektor-Wirt-Modell Promotorerkennung, mRNA und Translation und erklärt Unterschiede trotz gleicher DNA-Anwesenheit.',
 'Connects promoter recognition, mRNA and translation in the given vector-host model and explains differences despite identical DNA presence.',
 'Revidiert bei neu blockierter Translation oder vorzeitigem Stopp die Produktfolgerung und hält mögliche Faltung/Prozessierung weiterhin offen.',
 'Revises product inference for newly blocked translation or a premature stop while keeping folding and processing uncertainties open.',
 'KEEP: Ein eigenständiger atomarer Kausalzusammenhang, getrennt von Aufnahme und Klonierung. Die Vorbedingung Proteinbiosynthese statt alter Vektorcluster ist treffend. HE-LK-Produktkontext erlaubt die Teilbindung; die alte reine Klonierungszeile wird dadurch nicht automatisch voll zur Expressionsquelle.'),
('Eine begründete Chancen-Risiken-Abwägung trennt biologische Befunde, Unsicherheit und Wertentscheidungen für eine konkrete Anwendung.',
 'Reasoned benefit-risk discussion separates biological findings, uncertainty and value judgments for a specific application.',
 'Wägt bei der vorgegebenen gentechnischen Anwendung belegten Nutzen gegen konkrete Risiken ab und nennt Unsicherheit sowie Entscheidungskriterien.',
 'Weighs documented benefit against concrete risks for the supplied genetic application and identifies uncertainty and decision criteria.',
 'Passt die Bewertung an neue ökologische Befunde an, ohne allein das Etikett gentechnisch als Nutzen- oder Schadensbeweis zu verwenden.',
 'Adjusts evaluation to fresh ecological evidence without using the label genetically engineered alone as proof of benefit or harm.',
 'KEEP: Der bestehende aktuelle Bio3-Profilkörper bleibt exakt erhalten, die geänderte native Umgebung wird hier tatsächlich neu geprüft. HE-Einleitung und RP phys46/gedruckt44 tragen gesellschaftliche Argumentation, keine technische Methodenbeherrschung oder allgemeine Humanfreigabe.'),
('Histonmodifikationen beeinflussen Chromatinzugänglichkeit kontextabhängig; Histonmethylierung bedeutet nicht grundsätzlich Genabschaltung.',
 'Histone modifications affect chromatin accessibility in a context-dependent way; histone methylation does not universally silence genes.',
 'Analysiert vorgegebene Acetylierungs- und Methylierungsbefunde und erläutert ihre im Material begründeten möglichen Folgen für Genaktivität.',
 'Analyzes supplied acetylation and methylation findings and explains their material-supported possible effects on gene activity.',
 'Begrenzt bei einer neuen anderen Methylierungsstelle die Schlussfolgerung statt die Wirkung des ersten Befunds unbesehen zu übertragen.',
 'Limits inference for a fresh different methylation site instead of transferring the first finding without qualification.',
 'KEEP: Die aktuelle kontextabhängige Analyse vermeidet die typische Methylierung-immer-aus-Verkürzung. Bild und volle Seite zeigen Zugänglichkeitsmodelle ohne falschen absoluten Farbschlüssel. Proteinbiosynthese als atomare Basis ersetzt den fachlich zu breiten Methodencluster.'),
('Passende kleine RNA kann über RNA-Interferenz Ziel-mRNA beeinflussen und dadurch die Bildung des zugehörigen Proteins vermindern.',
 'Matching small RNA can affect target mRNA through RNA interference and thus reduce production of the corresponding protein.',
 'Verfolgt für eine vorgegebene Ziel-mRNA die komplementäre Erkennung und erklärt die verminderte Proteinbildung im angegebenen Mechanismus.',
 'Traces complementary recognition for a supplied target mRNA and explains reduced protein production in the stated mechanism.',
 'Begrenzt nach neuer fehlender Sequenzpassung oder unverändert nachgewiesener Ziel-mRNA die Wirkungsaussage statt beliebige kleine RNA als wirksam zu behandeln.',
 'Limits the claim after a fresh sequence mismatch or unchanged target mRNA instead of treating any small RNA as effective.',
 'KEEP: Eine klar begrenzte Wirkungsanalyse; keine vollständige Sammlung aller RNAi-Wege verlangt. Das Bild greift Ziel-mRNA statt Protein an. Die neue Vorbedingung Proteinbiosynthese passt direkt zur Ursache-Wirkungs-Erklärung und löst den alten Vektorcluster ab.'),
('Biotechnologische Medikamentenproduktion verbindet geeigneten Wirt und Expression mit Gewinnung, Verarbeitung und Prüfung des Produktes.',
 'Biotechnological drug production connects a suitable host and expression with recovery, processing and verification of the product.',
 'Erläutert im Insulinvorstufenmodell den Weg von geeigneter genetischer Information über Zellkultur zu gereinigtem und geprüftem Wirkstoff.',
 'Explains the insulin-precursor model from suitable genetic information through cell culture to purified and verified active substance.',
 'Bewertet einen neuen Wirt mit bekannter Modifikation, aber unbekannter Expression vorsichtig; Zellwachstum oder Proteinmenge allein beweist kein brauchbares Medikament.',
 'Cautiously evaluates a new host with known modification but unknown expression; cell growth or protein quantity alone proves no useful drug.',
 'KEEP: Die gegebene Beispielkompetenz bleibt atomar und wird durch die verschiedenen Wirtsbedingungen substanziell geprüft. HE Q1.4-LK ist ein fakultatives Themenfeld gemäß phys38, kein für jeden Kurs behauptetes Pflichtpaket. Verarbeitung/Glykosylierung werden im passenden Modell genannt, nicht pauschal jedem Protein zugeschrieben.'),
('Räumliche und zeitliche Entwicklungsgenregulation kann Baupläne verändern; Entwicklungsvariation ist noch kein Nachweis von Anpassung oder Artbildung.',
 'Spatial and temporal developmental gene regulation can alter body patterns; developmental variation is not proof of adaptation or speciation.',
 'Ordnet Hox-Expressionsmuster oder Enhanceränderungen den gegebenen Entwicklungsfolgen zu und unterscheidet diese von geänderter Proteinsequenz.',
 'Relates Hox expression patterns or enhancer changes to supplied developmental consequences and distinguishes them from altered protein sequence.',
 'Unterscheidet bei neuer temperaturbedingter Plastizität von vererbbarer Variante; aus gleicher Form folgt weder gleicher Mechanismus noch nähere Verwandtschaft.',
 'Distinguishes fresh temperature-induced plasticity from inherited variation; equal form implies neither identical mechanism nor closer relationship.',
 'KEEP: Einordnen der Entwicklungsgenetik ist eine eigene Kompetenz mit kausaler Begrenzung. HE-Quelle ist Q1.5-LK phys40; der kanonische Q2-Breadcrumb ist didaktische Platzierung, keine Behauptung einer anderen Normzeile. Das Bild sagt Variation möglich statt zielgerichtete Entwicklung.'),
('Mikroorganismen sind biotechnologisch nutzbar durch ihren Zellbau, ihre Vermehrung und den nutzbaren Stoffwechsel; alle drei Aspekte müssen zusammenpassen.',
 'Microorganisms are usable in biotechnology through cellular organization, reproduction and usable metabolism; all three aspects must fit together.',
 'Verknüpft bei Hefe oder Milchsäurebakterien Grundbauplan, Fortpflanzung und Produktbildung mit der vorgegebenen Anwendung.',
 'Connects basic cell structure, reproduction and product formation for yeast or lactic-acid bacteria with the supplied application.',
 'Passt die Nutzbarkeitsaussage an neues Substrat oder anderen Stoffwechsel an; nicht jede Zelle bildet CO2 und ein Zellkern ist keine Voraussetzung jeder Biotechnologie.',
 'Adjusts usability for a new substrate or metabolism; not every cell produces CO2 and a nucleus is not required for every biotechnology.',
 'KEEP: Die drei dienenden Aspekte erklären eine Nutzbarkeitskompetenz und entsprechen BY9.2 ausdrücklich; die englische Fassung enthält ebenfalls alle drei. Das Hefe-Comic ist ein korrektes Beispiel, nicht Universalmodell aller Mikroben. ST-/TH-/MV-Praxisoperatoren bleiben separate Teilanforderungen, durch die Fälle nicht erledigt.'),
('Die Erdgeschichte des Lebens ist wesentlich älter als der moderne Mensch; schematische zeitliche Einordnung ist keine direkte Ahnenreihe.',
 'The history of life is vastly older than modern humans; schematic temporal placement is not a direct ancestral chain.',
 'Skizziert für eine gegebene Zeitübersicht frühere Lebewesengruppen und das geologisch junge Auftreten moderner Menschen.',
 'Sketches earlier life groups and the geologically recent emergence of modern humans in a supplied time overview.',
 'Erklärt nach veränderter Zeitachsen-Skalierung den gleichbleibenden relativen Altersbefund und vermeidet eine Abstammung Mensch vom gezeigten Dinosaurier.',
 'Explains the unchanged relative age inference after a fresh time-axis rescaling and avoids claiming descent from the pictured dinosaur.',
 'KEEP: Eine zeitliche Überblickskompetenz; die Erweiterung um den Verhaltensnutzer ändert ihren Inhalt nicht. Das Bild ist ausdrücklich schematisch und zeigt den kurzen menschlichen Zeitraum ohne maßstäbliche Datierung. Systematik und fossile Hypothesen bleiben separate Folgeziele.'),
('Anatomische und molekulare Übereinstimmungen begründen die Stellung des Menschen im natürlichen System und gemeinsame Abstammung.',
 'Anatomical and molecular similarities support human classification in the natural system and common descent.',
 'Vergleicht vorgegebene anatomische und DNA-Merkmale und ordnet Homo sapiens als Säugetier und Primat in einen passenden Verwandtschaftsbaum.',
 'Compares supplied anatomical and DNA traits and places Homo sapiens as mammal and primate in a fitting relationship tree.',
 'Unterscheidet nach einer neuen Merkmalsähnlichkeit Konvergenz von gemeinsamen abgeleiteten Merkmalen; heutige Schimpansen sind keine unmittelbaren menschlichen Vorfahren.',
 'Distinguishes convergence from shared derived traits for a fresh similarity; extant chimpanzees are not direct human ancestors.',
 'KEEP: Anatomie und molekulare Befunde sind zwei Belegarten für dieselbe Einordnung. Der neue fossilbiologische Nutzer und die ganze native Seite passen. Das tatsächlich betrachtete Bild zeigt gemeinsame Vorfahren und eine nähere Mensch-Schimpansen-Beziehung ohne falsche Ahnenfolge.'),
('Fossilmerkmale und Datierung erlauben begrenzte Verwandtschaftshypothesen; zeitliche Reihenfolge beweist keine direkte Abstammung.',
 'Fossil traits and dating support bounded relationship hypotheses; chronological order does not prove direct ancestry.',
 'Rekonstruiert aus vorgegebenen Funden eine zeitliche Folge, begründet mögliche biologische Beziehungen und nennt Merkmalsmosaik sowie Evidenzlücken.',
 'Reconstructs a chronological sequence from supplied fossils, justifies possible biological relationships and identifies mosaic traits and evidence gaps.',
 'Berücksichtigt einen neuen überlappenden Fund oder veränderte Fundortlage und prüft Alternativen statt aus fehlenden Funden sichere Abwesenheit abzuleiten.',
 'Considers a fresh overlapping fossil or changed site setting and tests alternatives instead of inferring certain absence from missing fossils.',
 'KEEP: Die zuvor gekoppelte Kulturkompetenz ist sauber herausgelöst; Ableitung, Chronologie und Aussagegrenze gehören zur einen Fossilrekonstruktion. BY10 verlangt biologischen und kulturellen Teil gemeinsam, daher wird der biologische Teil nicht als Vollabschluss dieser AND-Zeile ausgegeben. P-Fälle vermeiden Savannen-Monokausalität.'),
('Kulturelle Weitergabe erlernten Wissens verändert heutige Handlungen und Umweltfolgen, ohne das Gelernte als DNA zu vererben.',
 'Cultural transmission of learned knowledge changes current actions and environmental consequences without inheriting that learning as DNA.',
 'Analysiert für ein gegebenes heutiges Verfahren sozialen Übertragungsweg, Folgen für Menschen und konkrete Veränderungen der Biosphäre.',
 'Analyzes social transmission, consequences for humans and concrete biosphere changes for a supplied contemporary practice.',
 'Ändert die Wirkungsanalyse bei gleicher Nahrung auf weniger Fläche oder neuer Nutzung desselben Wissens; unterschiedliche Folgen widerlegen keine kulturelle Weitergabe.',
 'Changes the impact analysis for equal food on less land or fresh use of the same knowledge; differing effects do not refute cultural transmission.',
 'KEEP: Die Gegenwartsanalyse ist von fossilbiologischer Rekonstruktion und historischem Werkzeug-/Sprachziel abgegrenzt. BY10 und RP tragen die Teilkompetenz. MV-Zukunftsbewertung steht unter Beispielen zur Prozessverknüpfung, nicht als zusätzliche universelle Pflicht dieses Atoms; andere breite Quellenanteile bleiben getrennt.'),
('Evolutionäre Funktion und unmittelbarer Auslöser erklären verschiedene Ebenen menschlichen Verhaltens; plausible Funktion beweist keine konkrete Anpassungsgeschichte.',
 'Evolutionary function and immediate trigger explain different levels of human behaviour; plausible function does not prove a particular adaptation history.',
 'Verknüpft im gegebenen Stressmodell menschliche Abstammung, unmittelbaren Auslöser und eine vorsichtige mögliche Funktionshypothese.',
 'Connects human ancestry, immediate trigger and a cautious possible functional hypothesis in the supplied stress model.',
 'Passt die Erklärung bei neu verändertem Bewertungs- oder Umweltkontext an, ohne Lernänderung als DNA-Veränderung oder heutigen Teststress als nachgewiesene Anpassung zu behandeln.',
 'Adjusts the explanation to a fresh appraisal or environment without treating learning as DNA change or present exam stress as proven adaptation.',
 'KEEP: Eine eigenständige bounded Erklärungskompetenz entspricht RP phys48/gedruckt46. Der Ursprung des Menschen dient als Vorbedingung, ohne kulturelle Analyse zur Voraussetzung zu erfinden. Das Bild kennzeichnet mögliche Funktion und Belegbedarf; der kleine Säuger ist kein benannter direkter Ahne.'),
]
assert len(judgments) == len(input_['goals']) == 19
(O/'results').mkdir(exist_ok=True)
records=[]
for i,(g,j) in enumerate(zip(input_['goals'],judgments),1):
    rec={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json','schemaVersion':1,'recordId':f'{runid}.{i:02d}','runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest']}
    rec.update({k:g[k] for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']})
    rec.update({'decision':'keep','understandingEvidence':dict(zip(['essentialUnderstandingDe','essentialUnderstandingEn','observablePerformanceDe','observablePerformanceEn','transferExpectationDe','transferExpectationEn'],j[:6])),'rationale':j[6], 'evidenceProfileContract':'positive-understanding-evidence-v2','evidenceProfileRecommendation':'none','recordStatus':'candidate','reviewAuthority':'ai_candidate'})
    records.append(rec)
rp=O/'results'/f"{batch['batchId']}.records.jsonl"
rp.write_text(''.join(json.dumps(r,ensure_ascii=False,separators=(',',':'))+'\n' for r in records))
now=datetime.now(timezone.utc).isoformat()
run={'$schema':'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','schemaVersion':1,'runId':runid,'campaignId':campaign['campaignId'],'roundId':campaign['roundId'],'batchId':batch['batchId'],'batchInputFingerprint':batch['batchInputFingerprint'],'bundleFingerprint':campaign['bundleFingerprint'],'bookDigest':campaign['bookDigest'],'provider':'OpenAI','model':'Codex GPT-6 independent B agent','role':'disconfirming_reviewer','promptFamilyId':'biology-goal-description-understanding-evidence-review-v2','promptFingerprint':campaign['promptFingerprint'],'criteriaFingerprint':campaign['criteriaFingerprint'],'generationParametersFingerprint':'sha256:'+hashlib.sha256(b'Independent B original task; actual material and images inspected; no author/A/peer verdicts read; model parameters not externally pinned').hexdigest(),'independenceGroupId':campaign['independenceGroupId'],'blindToOtherRuns':True,'goalIds':batch['goalIds'],'inputArtifacts':[{'role':a['role'],'digest':a['digest']} for a in bundle['artifacts']]+[{'role':'description_review_batch_input_jsonl','digest':batch['batchInputFingerprint']}],'startedAt':datetime.fromtimestamp((O/'actual-input-CAS-verification.before.json').stat().st_mtime, timezone.utc).isoformat(),'completedAt':now,'status':'completed','outputDigest':digest(rp),'toolchainVersion':'codex-independent-b-original-review-v1'}
dump(O/'results'/f"{batch['batchId']}.run.json",run)

# Scientific assessment of the full P10 bodies and both bilingual cases each.
# Three Bio3 profiles are exact retained products, not counted as new science.
pjudgments={
 '73a3419c': ['Lineare 1000-bp-DNA: 400+600 erhält die Länge; die neue weggefallene Stelle liefert ungeschnittene DNA.', 'Zwei Stellen bei 300/900 auf 1200 bp liefern 300/600/300; Verlust der zweiten Stelle liefert 300/900. Keine Amplifikation aus Spaltung.', 'Die Falltypen unterscheiden Sequenzspezifität und Fragmentableitung mit echten geänderten Prämissen. Keine Bedingung verlangt reale Restriktionsverdau-Durchführung.'],
 '374e6de5': ['Gleiche intronfreie DNA mit erkanntem oder nicht erkanntem Promotor unterscheidet mRNA und Protein; neu blockierte Translation ändert die Produktfolgerung trotz Promotor.', 'Proteinbildung bei unverändert unbekannter Faltung/Prozessierung wird korrekt begrenzt; ein neuer vorzeitiger Stopp verhindert das vollständige Produkt.', 'Klonierung ist kein Expressionsnachweis. Die beiden ganzen DE/EN-Fälle enthalten eigenständige Beobachtungen, Ursachen und frische Störungen.'],
 '80235254': ['Bewässerungswissen wird sozial vermittelt: Versorgung steigt, Lebensraum wird kleiner; neue flächensparende Methode mit belegter Wiederherstellung ändert die Umweltfolgerung.', 'Abwasserverfahren verbindet gelerntes Wissen, Wasser-/Gesundheitsfolgen und Energiebedarf; neue Schulung verändert Anwendung ohne genetische Änderung.', 'Menschen- und Biosphärenfolgen werden zusammen analysiert. Der Gegenwartsoperator wird nicht zu historischer Sprachrekonstruktion oder universeller Zukunftsprognose umetikettiert.'],
 '430b2b73': ['Datierte Merkmalsmosaike erlauben Chronologie und alternative Verwandtschaft, nicht eine sichere lineare Ahnenkette; F4 mit zeitlicher Überlappung ändert Hypothesen.', 'Fundort und Habitatevidenz begrenzen Savannen-Monokausalität; wenige Fossilien und fehlende Funde liefern keinen sicheren Abwesenheitsbeweis.', 'Biologische Rekonstruktion ist jetzt ein eigenständiger Operator. Kulturelle Analyse ist im getrennten Atom statt als unerfüllter Anhang enthalten.'],
 '7d2da9ab': ['Knall, akute Körperreaktion und mögliche Fluchtfunktion sind getrennt; Abstammung kann Plausibilität liefern, keine gemessene Selektionsgeschichte.', 'Heutiger Prüfungsstress kann eine alte Reaktionsfunktion in verändertem Kontext zeigen; neu geänderte Bewertung erklärt eine andere Reaktion ohne DNA-Veränderung.', 'Die Materialien verlangen proximalen Auslöser UND eine begrenzte evolutionäre Funktionshypothese. Sie behaupten weder Anpassungsbeweis noch tatsächliche Versuchsdaten.'],
 '4a8a6cec': ['Hefe: eukaryotischer Grundbauplan, Knospung und Zuckerfermentation liefern zusammen die Nutzung; Substratmangel begrenzt Fortsetzung.', 'Milchsäurebakterien: prokaryotischer Bau, Teilung und Lactatbildung begründen andere Nutzung ohne CO2- oder Zellkernpflicht; neuer Stoffwechsel ändert Produktfolgerung.', 'Alle drei Unterstützungsaspekte stehen in beiden Fällen und DE/EN. Reale Mikroskopie und ST-Gärversuch werden weder vorgetäuscht noch durch Konzeptanalyse erledigt.'],
 'a3f483ce': ['Nach innen gerichtete Primer plus Trennen/Anlagern/Verlängern erklären das 150-bp-Modell; nach außen gerichtete Primer liefern nicht dasselbe Zielprodukt.', 'Positive Probe bei positiver Kontrolle und negativer Wasserkontrolle unterstützt Ziel-DNA, nicht Lebensfähigkeit; neue positive Wasserkontrolle begrenzt den Befund.', 'Die beiden Materialien prüfen Funktionsmechanismus und Kontrolllogik mit einer relevanten neuen Prämisse. Es ist keine real durchgeführte PCR.'],
 '528a3cd3': ['Plasmidaufnahme mit funktionsfähigem Ursprung erklärt Kopien und Zellklone; nach Verlust des Ursprungs bleibt Aufnahme ohne bewiesene stabile Vermehrung.', 'Nichtreplizierende episomale virale DNA ist kein stabiler Zellklon; neu belegte chromosomale Integration und Vererbung ändert genau diese begrenzte Folgerung.', 'Transfer und Klonierung hängen fachlich zusammen; Expression und autonomer Viruszyklus bleiben separate, nicht aus DNA-Präsenz erschlossene Aussagen.'],
 '27b22c33': ['Insulinvorstufe: intronfreie Information und kompatibles Signal ermöglichen Produktion; Gewinnung, Prozessierung, Reinigung und Identität bleiben nötig. Neues Signalausbleiben verhindert Expression trotz Wachstum.', 'Für das vorgegebene Glykoprotein unterscheiden geeignete und ungeeignete Wirte die nötige Modifikation. Neuer Wirt X mit bekannter Prozessierung, aber unbekannter Expression bleibt ungesichert.', 'Die neue X-Prämisse ersetzt keine unveränderten B/E-Daten. Ein modellierter Herstellungsweg ist kein klinisch geprüftes Medikament und kein reales Experiment.'],
 '9b40dae5': ['Räumlich veränderte Hox-Expression erklärt Entwicklungsfolgen bei gleicher Proteinsequenz; sterile Veränderung beweist keine vererbte Evolutionsvariante.', 'Heritable Enhanceränderung kann Entwicklungsmuster verändern, aber beweist weder höhere Fitness noch Speziation; neue temperaturbedingte Plastizität ist keine neue vererbte Variante.', 'Die ganzen Fälle sind mechanistisch und nicht teleologisch. Gleiche Form wird nicht als gleiche Ursache oder sichere nähere Verwandtschaft gelesen.'],
}
pref=load(V/'inputs/thirteen-whole-current-profiles-and-twentysix-cases.neutral.json')['records']
pr=[]
for ref in pref[:10]:
    g=ref['goalId'];a,b,c=pjudgments[g[:8]]
    pr.append({'goalId':g, 'wholeProfile':ref['wholeCurrentProfile'],'wholeTwoCases':ref['wholeCurrentTwoBilingualCases'],'inputBindings':ref['currentAuthorPendingRecord'],'decision':'keep','case1ScientificJudgmentDe':a,'case2ScientificJudgmentDe':b,'profileAndOperatorJudgmentDe':c,'status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','actualLearnerPerformance':False,'actualExperimentPerformed':False,'blockingFindings':[]})
products=load(V/'inputs/whole-current397-machine-profile-products.neutral.json')['records'];pm={p['goalId']:p for p in products}
ret=[]
for ref in pref[10:]:
    ret.append({'goalId':ref['goalId'],'wholeProfile':ref['wholeCurrentProfile'],'wholeCases':ref['wholeCurrentTwoBilingualCases'],'sameWholeCurrentProfileBody':load(ref['wholeCurrentProfile']['path'])==pm[ref['goalId']]['wholeCurrentProfile'],'decision':'retain-current-product-no-new-science-count','actualLearnerPerformance':False,'actualExperimentPerformed':False})
assert all(x['sameWholeCurrentProfileBody'] for x in ret)
dump(O/'P10.original-scientific-verdicts-and-P3-exact-retention.json',{'role':'Original independent B actual whole-profile and whole-case assessment','readAuthorAPeerVerdicts':False,'newScientificProfiles':10,'newScientificCases':20,'records':pr,'retainedCurrentBio3Products':ret,'humanApproval':False,'sourceUnionApproval':False})

vnotes=[
 'Komplementäre A-T/G-C-Paare, Nukleotidbausteine und antiparallele Modellpfeile stimmen; keine falsche Basenpaarung.',
 'DNA zu mRNA zu Ribosom/Polypeptid ist korrekt; Kernraum ist ein eukaryotisches Beispiel, kein Universalmodell.',
 'Passende Erkennungsstelle führt zu Fragmenten, fehlende Stelle bleibt ganz; keine beliebige Schere an jedem Abschnitt.',
 'Trennen, Primer und entgegengesetzte Verlängerung sind schlüssig; zwei Zielkopien und zyklische Fortsetzung sind erkennbar.',
 'Starttaschen am Minuspol, positive Wanderrichtung; kleinere lineare Fragmente wandern weiter und Marker bleibt eigenes Muster.',
 'Helicase/Replikationsgabel und technische Temperaturzyklen sind unterscheidbar; Replikationspfeile bleiben mit der Gabelrichtung schlüssig.',
 'Fremdgen ist ein längerer Abschnitt, Plasmid bleibt vom Bakterienchromosom getrennt und wird an Zellklone weitergegeben.',
 'DNA allein genügt nicht: kompatibles Signal zeigt mRNA und Translation; die andere Zelle keine daraus behauptete Proteinbildung.',
 'Nutzen, Risiken und Evidenzfrage laden zur Abwägung ein; weder ausschließlich schädlich noch pauschal sicher.',
 'Nukleosomen, Histonmarkierungen und dichte/lockere Chromatinzustände passen; keine Methylierung-immer-aus-Behauptung.',
 'Kleine RNA wird dem Komplex zugeführt, Ziel-mRNA wird angegriffen und Proteinbildung vermindert; kein Angriff auf fertiges Protein.',
 'Gen zu Zellen/Bioreaktor zu gewonnenem Protein zeigt Herstellungsweg statt bloß mehr Biomasse; keine klinische Freigabe.',
 'Ort/Zeit der Genregulation zu Entwicklungsmustern und möglicher Variation ist begrenzt; kein zielgerichteter Artbildungsbeweis.',
 'Hefe zeigt Zellwand, Membran, Kern, Knospung und Zucker zu CO2/Ethanol; ein korrektes Mikrobenbeispiel ohne Zellkernpflicht für Bakterien.',
 'Schematische Zeitspur kontrastiert alte Lebensgruppen mit jungem Menschen; nicht maßstäblich und keine lineare Dinosaurier-Ahnenkette.',
 'Verzweigung zeigt gemeinsame Vorfahren und näheren Mensch-Schimpansen-Zweig; extante Arten sind keine direkten Vorfahren.',
 'Fossile Belege zu mehreren begrenzten Hypothesen und neuen Befunden; keine sichere lineare Rekonstruktion.',
 'Sozial gelerntes Wissen, landwirtschaftliches Verfahren sowie menschliche und ökologische Folgen sind lesbar; das Umweltmotiv behauptet keine gleiche Wirkung jeder Landwirtschaft.',
 'Auslöser, Reaktion und mögliche Funktion mit Fragezeichen und Belegbedarf sind getrennt; gemeinsame Abstammung ist keine benannte direkte Ahnenfolge.',
]
images=load(V/'inputs/nineteen-current397-original-image-bindings.neutral.json')['records']
vs=[]
for im,g,n in zip(images,input_['goals'],vnotes):
    gid=g['goalId'];assert im['goalId']==gid
    vs.append({'goalId':gid,'goalFingerprint':g['goalFingerprint'],'pageFingerprint':g['pageFingerprint'],'actualOriginalRaster':im['actualOriginalRaster'],'currentImageBinding':im['goalLinkAndCurrentInputDigest'],'decision':'keep','scienceAndVisualJudgmentDe':n,'actualOriginalInspected':True,'actual360pxInspected':True,'actual680pxInspected':True,'actualWholeNativeHTMLPageInspected':True,'actualWholeNativePDFPageInspected':True,'htmlCapture':str(V/f'native/captures/html/{gid}.whole-page.png'),'pdfCapture':str(V/f'native/captures/pdf/{gid}.whole-page.png'),'scaleInspectionOnly':str(O/f'inspection-only/{gid}.360-and-680-inspection-only.png'),'readabilityDe':'Hauptmotiv, Pfeilbeziehungen und tragende Beschriftungen bleiben bei 360 und 680 Bildpixeln erkennbar. Nicht tragende feinere Modellteile ersetzen keine lesepflichtige Lernzielbeschreibung. Ganze Seiten haben vollständige Motive, Beschreibungen und sichtbare Kontextbeziehungen.','blockingFindings':[],'reviewAuthority':'ai_candidate','humanApproval':False})
dump(O/'V19.original-actual-raster-and-native-page-verdicts.json',{'role':'Original B scientific and visual examination after actual viewing','records':vs,'imageGenerationPerformed':False,'productionImageChanges':False,'captureAloneCountsAsInspection':False,'humanApproval':False})

am=[]
for prefix,reason in [
 ('73a3419c','Eine Spaltungsregel samt Fragmentableitung ist eine prüfbare kausale Kompetenz; PCR und Gel tragen andere Leistungen und bleiben getrennt.'),
 ('374e6de5','Notwendige Expressionsbedingungen und DNA-Präsenz als unzureichender Nachweis bilden eine kausale Kompetenz. DNA-Transfer/Klonierung ist separat.'),
 ('80235254','Gegenwärtige Wirkungsanalyse sozial übertragenen Wissens bildet eine Kompetenz. Mensch und Umwelt sind miteinander verknüpfte Folgen, keine Liste unabhängiger Erinnerungsaufgaben.'),
 ('7d2da9ab','Proximale Ursache und vorsichtige evolutionäre Funktion sind komplementäre Ebenen derselben Verhaltenserklärung. Eine plausible Hypothese wird nicht als Anpassungsbeweis gelernt.')]:
    g=next(g for g in input_['goals'] if g['goalId'].startswith(prefix))
    am.append({'goalId':g['goalId'],'goalFingerprint':g['goalFingerprint'],'semanticAtomicityDecision':'keep_curricular_atomic','rationaleDe':reason,'memoryDecision':'no_memory_needed','memoryRationaleDe':'Gefordert ist begründetes Arbeiten mit neu vorgegebenen Sequenzen, Modellen oder kausalen Befunden. Reines Abrufen einer festen Liste ist kein eigenständiger Leistungskern. Keine neue SRS-Karte oder SRS-Sichtbarkeit wird dadurch verlangt oder als geprüft behauptet.','cardVisibilityCheckRequiredForThisDecision':False})
dump(O/'A4-M4.original-semantic-and-memory-decisions.json',{'role':'Own bounded semantic and Memory assessment','records':am,'oldStableClusterIdsRetained':['523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0','d11b3b18-deec-5d1a-bff6-512cddf595a2'],'newSRSCardApproval':False,'humanApproval':False})

boundaries=[
 {'source':'HE current physical 38-40','judgmentDe':'Q1.1 bis Q1.3 sind verbindlich; Q1.4/Q1.5 sind fakultative Themenfelder. PCR/Gel stehen auf GK/LK, Histonmodifikation, Vektoren/Klonierung/RNAi auf LK. Medikamentenbeispiel ist Q1.4-LK, Homöobox/Gensteuerung Q1.5-LK. Die didaktische Q2-Platzierung von Evo-Devo ist keine HE-Normzeile Q2. Teilmethoden tragen nicht allein die ganze PCR-und-Gel- oder Produktbindung.'},
 {'source':'RP physical46/printed44','judgmentDe':'TF11 argumentieren zu Chancen/Risiken trägt die drei Bio3-Argumentationspartner. Recherche/Vorstellung und Fachwissen zum Technologienerklären sind eigene Operatorteile; die Zeile ist kein Freibrief für PCR, Vektor- oder Expressions-Vollfreigabe.'},
 {'source':'RP physical48/printed46','judgmentDe':'Abstammungswissen zur Erklärung ausgewählter Verhaltensweisen (Stress) trägt das neue Verhaltensatom. Kulturelle Einflüsse auf Menschheit und Biosphäre tragen die neue Gegenwartsanalyse teilweise. Zukunftsreflexion im Themenfeldintro ist dadurch nicht automatisch vollständig abgeschlossen.'},
 {'source':'BY10 actual whole current HTML','judgmentDe':'Die Kompetenz verknüpft fossilbiologische Hypothesen/Chronologie UND Bedeutung kultureller Evolution für heutige Menschen. 430 und 802 sind unterschiedliche Teilkompetenzen; die biologische Einzelentscheidung ist keine Vollfreigabe dieser AND-Quellenzeile. Inhalte nennen Gegenwart und Zukunft zusätzlich; das Gegenwartsatom beansprucht keine vollständige Zukunftsbewertung.'},
 {'source':'BY9 actual whole current HTML and BY12 GA/EA','judgmentDe':'BY9.2 nennt Grundbauplan/Fortpflanzung/Stoffwechsel ausdrücklich als dienende Aspekte der biotechnologischen Nutzbarkeit. BY12-GA nennt PCR-Replikationsvergleich und prinzipielle künstliche Veränderung plus Anwendungen/Bewertung; konkrete Technik zusätzlich im EA. Restriktionsspaltung als Teilprinzip liefert keine automatische Vollerfüllung der Anwendungen/Bewertungszeile.'},
 {'source':'MV physical17/printed13 and physical32/printed28; actual page32 raster inspected','judgmentDe':'Hefepilz-Mikroskopie ist verbindlicher Inhalt; die hier analytischen Nutzbarkeitsfälle erbringen keine Bedienung. Kulturelle Evolution ist verbindlicher Inhalt. Grenzen/Chancen für die Zukunft stehen ausdrücklich unter Beispielen zur Prozessverknüpfung; sie werden nicht zu einer universellen extra Pflicht des Gegenwartsatoms gemacht, und dennoch nicht als durch die Fälle erledigt behauptet.'},
 {'source':'SN physical30/printed18 and physical44/printed32; actual page44 raster inspected','judgmentDe':'Linke Kompetenzoperatoren und rechte konkretisierende Beispiele werden getrennt gelesen. Luftfangplatten/Joghurtkulturen und kulturelle Feuer-/Nahrungsbeispiele sind keine überall zusätzlich zwingend vorgeschriebenen Einzelversuche. Reale Digital-/Praxisleistung folgt nicht aus Modellantworten; historisches Werkzeug-/Sprachwissen und heutige Kulturfolgen bleiben verschiedene Teilbindungen.'},
 {'source':'ST physical30-31 and44','judgmentDe':'Planen, durchführen, protokollieren sind explizite Schülerexperimentoperatoren; Temperaturwirkung auf alkoholische Gärung ist verbindliches Experiment. Auf phys44 verlangt der CS-Operator Simulationssoftware. Die Bio8-P10-Konzepte und hypothetischen Daten erledigen diese Praktikums-/Softwareleistungen nicht. Fachliche Modellbeurteilung und zukünftige tatsächliche Durchführung sind getrennt.'},
 {'source':'TH physical20-21/printed14-15; actual page21 raster inspected','judgmentDe':'Frischpräparate herstellen, sachgerechtes Mikroskopieren und mikroskopische Zeichnungen sind reale Methodenoperatoren, keine bloße Textauswertung. Zellmodell und Modellgrenzen sind wieder eigene Tätigkeiten. Die Nutzbarkeitskompetenz bleibt partiell und beansprucht keine Ausführung all dieser Operatoren.'},
]
dump(O/'S.original-primary-operator-and-source-union-boundaries.json',{'role':'Independent B actual primary/operator examination','boundaries':boundaries,'wholeBroadSourceUnionApproval':False,'actualExperimentApproval':False,'actualLearnerPerformance':False,'humanApproval':False,'blockingFindingsWithinBoundedD19P10V19':[],'integrationConditionDe':'Die bereits vorhandenen 369 Abschlüsse bleiben gültig nur über exakte aktuelle Produkte beziehungsweise belegte betroffene Neubindungen. Dieses Urteil ist kein Freischalten außerhalb der tatsächlichen 19 Ziele und 10 neuen Profile und kein Abschluss der verbliebenen 18 Atome.'})
dump(O/'original-review-summary.json',{'reviewerTask':'/root/bio8_v6_genuine_independent_b','role':'genuine blind independent B first pass','authorPackageDigest':digest(V/'FINAL.author-package.freeze.json'),'neutralEntryDigest':digest(V/'FINAL.neutral-whole397-current369-Bio3-combined-Bio8-author.join.json'),'rawFirstDigest':digest(V/'RAW-FIRST.neutral-input-manifest.json'),'readAuthorAPeerVerdicts':False,'D19OriginalRecords':19,'P10WholeProfilesAnd20WholeBilingualCasesActuallyRead':True,'P3WholeBodiesExactRetained':3,'VOriginalPNGsActuallyViewed':19,'V360And680ActuallyViewedEach':19,'WholeNativeHTMLPagesActuallyViewed':19,'WholeNativePDFPagesActuallyViewed':19,'decisions':{'D':'19 keep','P':'10 keep as E1/G1 candidate; 3 exact current retained','V':'19 keep after actual viewing','A-M':'4 new curricularAtomic and no_memory_needed individually justified'},'blockingFindings':[],'evidenceLevel':'E1','maximumClaimScope':'G1','reviewAuthority':'ai_candidate','status':'needs_human_review','humanApproval':False,'sourceUnionApproval':False,'actualExperimentPerformed':False,'actualLearnerPerformance':False,'newActualStrictGainClaimed':0,'activeWrites':False,'GitWrites':False,'completedAtUTC':now,'limitationsDe':'Das versiegelte fachliche Ersturteil ist eine unabhängige maschinelle Kandidatenprüfung. Integration, Dual-Round-Konfliktauflösung, aktuelle strenge zentrale D/P/A/M/V-Auswertung, Layer-A und GitHub-CI bleiben erforderlich. Unveränderte gültige Ziele wurden nicht als neue fachliche Reviews gezählt.'})
print('Wrote original D19, P10/20, V19, A4/M4 and actual source/operator judgments only into B package')
