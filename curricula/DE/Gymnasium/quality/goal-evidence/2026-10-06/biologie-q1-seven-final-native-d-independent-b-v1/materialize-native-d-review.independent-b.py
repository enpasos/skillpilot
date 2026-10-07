#!/usr/bin/env python3
"""Materialize the independently read B judgments in the existing native record format."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-q1-seven-final-native-review-inputs-author-v1'
read = lambda p: json.loads(p.read_text())
write = lambda p, x: p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
sha = lambda b: 'sha256:' + hashlib.sha256(b).hexdigest()
campaign = read(AUTHOR / 'round-b/description-review-campaign.json')
inputs = read(AUTHOR / 'round-b/description-review-input.json')
bundle = read(AUTHOR / 'bundle/manifest.json')
batch = campaign['batches'][0]
run_id = 'biologie-q1-seven-final-native-d-independent-b-v1.batch-001'

# Each row is an actual individual reviewer judgment, authored after reading
# the full bilingual input and the original seven final PDF pages.
judgments = [
    {
        'essentialUnderstandingDe': 'DNA ist das Material der Erbinformation; ein Gen ist ein bestimmter Abschnitt dieses Materials, und ein Chromosom organisiert und trägt DNA. Mehrere Gene können auf demselben Chromosom liegen. Die drei Bezeichnungen betreffen miteinander verbundene Strukturebenen.',
        'essentialUnderstandingEn': 'DNA is the material of genetic information; a gene is a particular section of that material, and a chromosome organises and carries DNA. Several genes can lie on the same chromosome. The three terms refer to related structural levels.',
        'observablePerformanceDe': 'Die lernende Person ordnet im vorgegebenen Modell DNA-Faden, markierten Genabschnitt und Chromosom zu und erklärt ihre Teil-Ganzes-Beziehung. Sie begründet anhand der Darstellung, weshalb vier Chromosomen keine Aussage über vier Gene erlauben und welche Abschnittsinformation für eine Genzahl fehlt.',
        'observablePerformanceEn': 'The learner identifies the DNA strand, marked gene segment and chromosome in the supplied model and explains their part-to-whole relationship. They use the representation to justify why four chromosomes do not imply four genes and identify the segment information needed to determine gene number.',
        'transferExpectationDe': 'In einer anders beschrifteten Darstellung mit verändertem Genabschnitt erhält die lernende Person die Beziehung Gen–DNA–Chromosom, erkennt eine Änderung am selben Genort ohne zusätzliches Chromosom und begrenzt Merkmalsvorhersagen auf die tatsächlich vorliegenden Daten.',
        'transferExpectationEn': 'In a differently labelled representation with a changed gene segment, the learner preserves the gene–DNA–chromosome relationship, recognises a change at the same gene locus without an additional chromosome, and limits trait predictions to the available evidence.',
        'rationale': 'KEEP. DE/EN benennen dieselbe zusammenhängende Strukturrelation und verlangen ihre Erklärung am einfachen Modell. Die tatsächliche PDF-Seite 3 zeigt den Genabschnitt innerhalb der DNA des Chromosoms; der Bildausschnitt ist vollständig und widerspricht dem Text nicht. Kein direktes requires ist nötig, da das Modell die Ebenen selbst einführt. Direkte Zielgeltung ist ausschließlich BE/BB Sek I; weitere Länder am Rohziel dienen der ausdrücklich geprüften prerequisiteOnly-Verfügbarkeit. Beide Materialfälle und die UUID sind unverändert gebunden. Eine positive Evidenzkette lässt sich für Zuordnung, Begründung und verändertes Modell formulieren; Benennung oder Wiederholung des Bildtextes allein zeigt dieses Verständnis nicht. Ein eigener P-v2-Profilentwurf fehlt noch.'
    },
    {
        'essentialUnderstandingDe': 'Eine Genmutation verändert genetische Information innerhalb eines Gens, eine Chromosomenmutation betrifft die Struktur eines Chromosomenabschnitts und eine Genommutation die Chromosomenzahl. Das veränderte Strukturniveau bestimmt die Zuordnung; Ursache und unmittelbare Informationsfolge werden anhand eigener Materialbelege erklärt.',
        'essentialUnderstandingEn': 'A gene mutation changes genetic information within a gene, a chromosome mutation concerns chromosome-segment structure, and a genome mutation concerns chromosome number. The structural level that changes determines the classification; causes and immediate consequences for information are explained using their own evidence in the material.',
        'observablePerformanceDe': 'Die lernende Person vergleicht die vorgegebenen Modelle, lokalisiert jeweils Sequenzänderung, Abschnittsverlust oder Zahländerung und begründet die drei Zuordnungen. Sie verbindet belegte Ursachen mit der jeweiligen Änderung und erläutert, welche genetische Information verändert, entfernt oder in veränderter Kopienzahl vorhanden ist.',
        'observablePerformanceEn': 'The learner compares the supplied models, locates the sequence change, segment loss or number change, and justifies the three classifications. They connect evidenced causes to each change and explain which genetic information is altered, removed or present in a changed number of copies.',
        'transferExpectationDe': 'Bei veränderten Buchstabenfolgen und Chromosomenbildern ordnet die lernende Person erneut nach dem tatsächlich veränderten Niveau zu, erklärt die Informationsfolge und unterscheidet eine belegte Ursache von einer Ursache, über die das Material keine Entscheidung erlaubt.',
        'transferExpectationEn': 'With changed letter sequences and chromosome diagrams, the learner again classifies the actual level of change, explains its consequence for information and distinguishes an evidenced cause from a cause the material cannot establish.',
        'rationale': 'KEEP. Der vollständige längere DE/EN-Text enthält eine einheitliche begründete Modellklassifikation: Ursache und unmittelbare Informationsfolge erklären dieselben Veränderungen. Die PDF-Seite 4 stellt die drei Ebenen getrennt und lesbar dar; die symbolischen DNA-Farben beanspruchen keine konkreten Basen. SN Klasse 10, Lernbereich 1, und TH Abschnitt 2.2.1.3 bleiben die tatsächlichen begrenzten Quellen. Die zwei vollständigen Materialfälle enthalten Ursachenbelege, sodass der Schluss nicht allein aus einem Endzustandsbild gezogen werden muss. Der einzige Vorgänger führt DNA, Gen und Chromosom ein; ein vollständiger Replikations-, Meiose- oder Krankheitskurs wäre keine minimale Voraussetzung. Der Inhalt ist nicht bloß eine Vokabelliste. P-v2 muss die drei begründeten Zuordnungen und ihre Informationsfolgen positiv abdecken.'
    },
    {
        'essentialUnderstandingDe': 'Eine Veränderung an einer einzelnen Basenpaarposition ist im vorgegebenen Modell eine Punktmutation; eine Veränderung der Chromosomenzahl ist eine Genommutation. Eine andere Basenpaarung und ein zusätzliches Chromosom verändern unterschiedliche Beschreibungsebenen.',
        'essentialUnderstandingEn': 'A change at a single base-pair position is a point mutation in the supplied model; a change in chromosome number is a genome mutation. A different base pair and an additional chromosome change different descriptive levels.',
        'observablePerformanceDe': 'Die lernende Person vergleicht Ausgangs- und Endmodell, benennt die geänderte Basenpaarposition beziehungsweise die geänderte Chromosomenzahl und begründet daraus Punkt- oder Genommutation. Sie zählt in den Chromosomenmodellen die erhaltenen und zusätzlichen Träger korrekt.',
        'observablePerformanceEn': 'The learner compares the initial and final models, identifies the changed base-pair position or chromosome number, and uses that difference to justify point or genome mutation. They correctly count the retained and additional carriers in the chromosome models.',
        'transferExpectationDe': 'Bei einer anderen zulässigen Basenpaaränderung oder einer Verringerung statt Erhöhung der Chromosomenzahl bleibt die Einordnung am betroffenen Niveau orientiert. Die lernende Person begründet die Änderung aus den neuen Modellbefunden.',
        'transferExpectationEn': 'With another valid base-pair change, or a decrease rather than increase in chromosome number, classification remains based on the affected level. The learner justifies the change using the new model evidence.',
        'rationale': 'KEEP. Beide Sprachen fordern exakt die Unterscheidung einer einzelnen Basenpaarposition von einer Chromosomenzahländerung. Die PDF-Seite 5 zeigt G-C zu A-T an einer Position und vier zu fünf Chromosomen bei Erhalt des zweiten Typs; Größen und X-Form sind vereinfachte Trägerdarstellungen. Keine Ursachen- oder klinische Prognosepflicht wird erfunden. Beide gebundenen Materialfälle bleiben in der richtigen UUID. ST Abschnitt 3.5, Schuljahrgang 10 Einführungsphase, ist die gemeinsame Quelle; Sek II GK/LK in der Geltungsanzeige sind technische Projektionen auf beide späteren Kurswege, keine behaupteten amtlichen Kursnamen dieser Seite. Das Ziel bleibt aus einem reinen Sek-I-GUI-Zielset ausgeschlossen. Der DNA/Gen/Chromosom-Vorgänger reicht aus. Das noch zu erstellende P-v2-Profil muss die Modellbegründung an verändertem Beispiel verlangen.'
    },
    {
        'essentialUnderstandingDe': 'Mutagene Einflüsse können genetische Information schädigen und bleibende Änderungen begünstigen. Das Risiko hängt im gegebenen Kontext von Exposition und vorliegenden Materialbefunden ab; begründeter Schutz verringert die Exposition und garantiert keine vollständige Sicherheit.',
        'essentialUnderstandingEn': 'Mutagenic influences can damage genetic information and favour lasting changes. In the supplied context, risk depends on exposure and the available material evidence; justified protection reduces exposure without guaranteeing complete safety.',
        'observablePerformanceDe': 'Die lernende Person verbindet Materialbefunde zum mutagenen Einfluss mit möglichen bleibenden Veränderungen, vergleicht die angebotenen Handlungsoptionen anhand ausdrücklich benannter Kriterien wie Exposition, Dauer und Schutzwirkung und begründet eine umsetzbare Schutzentscheidung einschließlich der verbleibenden Unsicherheit.',
        'observablePerformanceEn': 'The learner connects evidence about a mutagenic influence to possible lasting changes, compares the offered actions using explicit criteria such as exposure, duration and protective effect, and justifies a feasible protective choice together with its remaining uncertainty.',
        'transferExpectationDe': 'Beim Wechsel vom UV-Alltagsfall zu einer materialgestützten Umweltbelastung wendet die lernende Person dieselbe Kette aus Einfluss, genetischem Risiko, Kriterienvergleich und begründeter Expositionsreduktion an. Sie erklärt, welche Daten die Entscheidung tragen und welche individuelle Prognose offenbleibt.',
        'transferExpectationEn': 'When moving from the everyday UV case to a material-supported environmental exposure, the learner applies the same chain of influence, genetic risk, comparison by criteria and justified exposure reduction. They explain which evidence supports the choice and which individual prediction remains unresolved.',
        'rationale': 'KEEP. Der vollständige DE/EN-Text operationalisiert eine zusammenhängende begründete Risiko- und Schutzentscheidung. Die echte PDF-Seite 6 unterstützt den UV-Fall mit Kleidung, Hut und Schatten; sie verspricht kein Nullrisiko und zeigt die symbolische Nachbarbasenverbindung bei erhaltenem DNA-Rückgrat. Das Bild deckt nicht allein den Umweltfall ab; die vier exakt gebundenen Materialfälle enthalten den benötigten zusätzlichen Kontext, Bewertungskriterien und Entscheidungsdaten. Die bereits tatsächlich gelesenen BfS-, UBA- und IARC-Prämissen bleiben erhalten; Zahlen im Schulmodell sind fiktiv. MV 3.2 gehört zur Sek I mit korrigierter Elternüberschrift physisch 17/gedruckt 13. ST 3.5 bleibt gemeinsame Einführungsphase mit technischen GK/LK-Projektionen. Der DNA-Träger-Vorgänger ist minimal. P-v2 darf den echten Bewertungsoperator nicht auf Mutagenbenennung reduzieren.'
    },
    {
        'essentialUnderstandingDe': 'Eine Mutation kann innerhalb der aus der betroffenen Zelle entstehenden Zelllinie weitergegeben werden. Zeitpunkt und Position im Zellstammbaum bestimmen die erreichbaren Nachkommenzellen. Die Weitergabe an einen neuen Organismus erfordert eine beteiligte Keimzelle und ist bei einer somatischen Linie nicht aus bloßer Zellteilung ableitbar.',
        'essentialUnderstandingEn': 'A mutation can be passed on within the lineage descending from the affected cell. Its timing and position in the cell tree determine which descendant cells can receive it. Transmission to a new organism requires a participating germ cell and cannot be inferred from division in a somatic lineage alone.',
        'observablePerformanceDe': 'Die lernende Person verfolgt im gegebenen Zelllinienmodell die Nachkommen einer früh oder spät mutierten Zelle, begründet die betroffenen und nicht betroffenen Zweige und erläutert für somatische und Keimbahnlinien die unterschiedliche Möglichkeit einer Weitergabe an Nachkommen.',
        'observablePerformanceEn': 'The learner traces descendants of an early or late mutated cell in the supplied lineage model, justifies which branches are affected or unaffected, and explains the different possibilities of transmission to offspring through somatic and germline branches.',
        'transferExpectationDe': 'Wird die markierte Mutation an eine frühere Verzweigung oder in eine andere Linie verlegt, bestimmt die lernende Person die neue Ausbreitung aus dem Stammbaum und begründet die mögliche Keimzellweitergabe mit der Beteiligung an der Befruchtung.',
        'transferExpectationEn': 'When the marked mutation is moved to an earlier branch or another lineage, the learner determines the new distribution from the tree and justifies possible germ-cell transmission by participation in fertilisation.',
        'rationale': 'KEEP. Beide Sprachen verbinden Zeitpunkt, betroffene Zelllinie und mögliche Weitergabe in einer einzigen Zellstammbaumroutine. Die PDF-Seite 7 zeigt nur die nach einer späten somatischen Änderung entstehende Teilzelllinie als verändert. Auf der Keimbahnseite markiert der gestrichelte Pfeil ausdrücklich die mögliche Weitergabe; eine veränderte Keimzelle führt nicht zwingend zu allen Nachkommen. Sterne sind Mutationensymbole. Der Stammbaum ist ein bereitgestelltes Modell und verlangt keinen zusätzlichen vollständigen Embryologie- oder Meiose-DAG. Die zwei vorher vollständig gelesenen Materialfälle enthalten auch den veränderten Zeitpunkt für Transfer. Direkte Quelle ist ausschließlich MV klassische Genetik, Klasse 10, Abschnitt 3.2; der korrigierte Überschriftenort bleibt gebunden. P-v2 muss die tatsächlich begründete Zweigausbreitung statt einer reproduzierten Erblichkeitsformel abdecken.'
    },
    {
        'essentialUnderstandingDe': 'Ein Merkmalsunterschied kann mit veränderter genetischer Information oder mit einer Umweltwirkung bei unveränderter genetischer Information zusammenhängen. Kontrollierte Vergleichsdaten erlauben die Unterscheidung von Mutation und Modifikation; ein bloßer Merkmalsunterschied legt die Ursache noch nicht fest.',
        'essentialUnderstandingEn': 'A trait difference can be associated with changed genetic information or with an environmental influence while genetic information remains unchanged. Controlled comparison data support the distinction between mutation and modification; a trait difference alone does not establish its cause.',
        'observablePerformanceDe': 'Die lernende Person vergleicht die vorgegebenen genetischen und Umweltkontrollen, begründet anhand der jeweils gleichen beziehungsweise veränderten Größen Mutation oder Modifikation und benennt, welche zusätzliche Vergleichsinformation bei einem reinen Merkmalsbefund zur Entscheidung fehlt.',
        'observablePerformanceEn': 'The learner compares the supplied genetic and environmental controls, justifies mutation or modification using what is held constant or changed, and identifies the additional comparison evidence missing when only a trait difference is observed.',
        'transferExpectationDe': 'Bei umgestalteten Vergleichstabellen oder anderen Lichtbedingungen hält die lernende Person die Kontrolllogik aufrecht und beurteilt die Aussagekraft des neuen Befunds. Fehlen genetische oder Umweltkontrollen, beschreibt sie gezielt die offene Ursache und die benötigten Daten.',
        'transferExpectationEn': 'With rearranged comparison tables or different light conditions, the learner preserves the control logic and evaluates what the new observations establish. If genetic or environmental controls are missing, they specify the unresolved cause and the needed evidence.',
        'rationale': 'KEEP. Die DE/EN-Texte verlangen die gleiche kriteriengeleitete Auswertung bereitgestellter Vergleichsdaten einschließlich ihrer Grenzen. Die PDF-Seite 8 zeigt gleiche DNA bei unterschiedlichem Licht und unterschiedliche DNA bei gleichem Licht; das Fragezeichen und Merkmal-allein-Hinweis verhindern eine Diagnose allein aus Pflanzengröße. Das Bild gibt Kontrolldaten vor und behauptet nicht, jeder Größenunterschied beweist eine Mutation. Beide vollständigen Materialfälle und ihre UUID-Bindung sind erhalten. Quellen bleiben die einzelnen MV-, SN-, TH- und ST-Aspekte, mit ST als gemeinsamer Einführungsphase und ohne Freigabe ganzer Variabilitätsbullets. Der einzige Vorgänger führt genetisches Material und die betrachtete Änderung ein. Im P-v2-Profil müssen positive Kontrollbegründung und Transfer mit fehlenden Daten konkret sichtbar werden.'
    },
    {
        'essentialUnderstandingDe': 'Eine Fehlpaarung im Kopiermodell kann durch Fehlerkontrolle und Reparatur korrigiert werden, sodass genetische Information erhalten bleibt. Bleibt die Fehlpaarung bestehen, kann eine weitere Kopie eine stabile Änderung hervorbringen. Fehlpaarung und bleibende Mutation sind unterschiedliche Zustände; Reparatur vermindert Fehler, ist aber nicht vollkommen.',
        'essentialUnderstandingEn': 'A mismatch in the copying model can be corrected through error control and repair, preserving genetic information. If the mismatch persists, a subsequent copy can produce a stable change. A mismatch and a lasting mutation are different states; repair reduces errors but is not perfect.',
        'observablePerformanceDe': 'Die lernende Person verfolgt im einfachen Modell beide Wege einer Fehlpaarung, erklärt die Wiederherstellung der ursprünglichen Paarung nach Reparatur und die mögliche stabile Veränderung nach weiterer Kopie. Sie begründet daraus, weshalb nicht jede Fehlpaarung zu einer bleibenden Mutation wird und Reparatur das Risiko nicht auf null setzt.',
        'observablePerformanceEn': 'The learner traces both pathways of a mismatch in the simple model, explains restoration of the original pairing after repair and a possible stable change following another copy. They use those pathways to justify why not every mismatch becomes a lasting mutation and why repair does not reduce risk to zero.',
        'transferExpectationDe': 'Bei einer anders angeordneten Kopierdarstellung oder geänderten Fehlpaarposition erklärt die lernende Person wieder beide möglichen Informationsfolgen und entscheidet aus den bereitgestellten Reparatur- und Kopierbefunden, welche Änderung bestehen bleiben kann.',
        'transferExpectationEn': 'In a rearranged copying diagram or with a changed mismatch position, the learner again explains both possible consequences for information and uses the supplied repair and copying evidence to determine which change may persist.',
        'rationale': 'KEEP. Das DE/EN-Ziel behandelt eine zusammenhängende Erklärung der Informationserhaltung und ihrer Grenzen im bereitgestellten Kopiermodell. Die PDF-Seite 9 stellt links die ursprüngliche A-T-Paarung wieder her und zeigt aus der mittleren A-C-Fehlpaarung rechts nach weiterer Kopie ein mögliches G-C-Paar; die Beschriftung kann bleiben behauptet keine zwangsläufige Mutation. Enzymidentitäten, Strangalter und vollständige Replikationschemie werden durch diesen einfachen Modellauftrag nicht als zusätzliche Lernziele eingeführt. Beide bereits gelesenen vollständigen Materialfälle bleiben exakt gebunden. Direkte Quelle ist TH 2.2.1.3, physisch 28/gedruckt 22, Sek I; die dargestellte Reparaturkompetenz gibt keine globale Mutations- oder Risikofreigabe. Der DNA-Träger-Vorgänger genügt für den vorgegebenen Modellzugang. P-v2 muss beide Informationswege mit Transfer positiv formulieren.'
    }
]

records = []
for index, (goal, judgment) in enumerate(zip(inputs['goals'], judgments), 1):
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': f'biologie-q1-seven-final-native-d-independent-b-v1.goal-{index:02d}',
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': bundle['bundleFingerprint'],
        'bookDigest': bundle['bookModelDigest'],
        **{key: goal[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep',
        'understandingEvidence': {key: value for key, value in judgment.items() if key != 'rationale'},
        'rationale': judgment['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'create',
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate'
    }
    records.append(record)
assert len(records) == 7
result = OWN / 'results'
result.mkdir(exist_ok=True)
record_bytes = ''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records).encode()
(result / f"{batch['batchId']}.records.jsonl").write_bytes(record_bytes)
parameters = {'provider': 'OpenAI', 'model': 'GPT-6', 'interface': 'Codex delegated independent reviewer', 'temperature': 'not exposed', 'seed': 'not exposed', 'samplingSettings': 'not exposed', 'independence': 'no peer A content or verdict read', 'method': 'full bilingual native input, original final PDF raster inspection, exact source/material/payload checks; personally authored seven native judgments'}
parameter_bytes = (json.dumps(parameters, ensure_ascii=False, indent=2) + '\n').encode()
(OWN / 'generation-parameters.actual.json').write_bytes(parameter_bytes)
completed = datetime.now(timezone.utc).isoformat()
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': bundle['bundleFingerprint'],
    'bookDigest': bundle['bookModelDigest'],
    'provider': 'OpenAI',
    'model': 'GPT-6',
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-review-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': sha(parameter_bytes),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts']] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': datetime.fromtimestamp(min(p.stat().st_mtime for p in (OWN / 'pdf-pages').glob('final-native-*.png')), timezone.utc).isoformat(),
    'completedAt': completed,
    'status': 'completed',
    'outputDigest': sha(record_bytes),
    'toolchainVersion': 'skillpilot-goal-description-review-v2'
}
write(result / f"{batch['batchId']}.run.json", run)
inspection = [
    'Chromosom organisiert die dargestellte DNA; der Genabschnitt liegt innerhalb derselben DNA. Kein willkürliches Gen-pro-Chromosom-Verhältnis.',
    'Drei getrennte Modellvergleiche für Gen, Chromosomenabschnitt und Chromosomenzahl; symbolische Farben bleiben konsistent.',
    'Eine einzelne Basenpaarposition G-C wird A-T; bei vier zu fünf Chromosomen ist genau ein Typ zusätzlich und der andere erhalten.',
    'UV-Situation mit Schatten, Hut und Kleidung; symbolische Nachbarbasenverbindung am selben Strang, DNA-Rückgrat erhalten, Schutz ohne Nullrisikoversprechen.',
    'Somatische Markierung bleibt in der späteren Teilzelllinie; Keimzellweitergabe ist mit gestricheltem Pfeil und möglich markiert.',
    'Genotyp-/Umweltkontrollen sind klar getrennt; Fragezeichen und Merkmal-allein-Hinweis erhalten die Grenze der Phänotypaussage.',
    'A-C-Fehlpaarung kann links zu A-T repariert oder rechts nach weiterer Kopie G-C werden; kann bleiben ist probabilistisch, keine zwangsläufige Mutation.'
]
write(OWN / 'seven-actual-final-pdf-page-inspections.independent-b.json', {'schemaVersion': 1, 'actualOriginalPDFRead': True, 'pdfSHA256': bundle['artifacts'][1]['digest'], 'physicalPagesRead': [3,4,5,6,7,8,9], 'rasterCommand': ['pdftoppm','-png','-scale-to','1500','-f','3','-l','9','bundle/book.pdf','pdf-pages/final-native'], 'allSevenRasterPagesPersonallyViewed': True, 'imagesRegenerated': False, 'rows': [{'goalId': goal['goalId'], 'physicalPDFPage': index+3, 'fullTextAndImageTogetherRead': True, 'titleUUIDDescriptionApplicabilityAndRequiresVisible': True, 'clippingOrTextImageContradiction': False, 'imageCompatibilityReason': inspection[index], 'verdict': 'KEEP'} for index, goal in enumerate(inputs['goals'])], 'independentVReviewReplaced': False, 'htmlContentReadAndURLsBound': True, 'htmlBrowserDisplayAcceptanceClaimed': False, 'humanApproval': False, 'humanTrial': False})
print('Materialized seven native D-B KEEP records; positive P-v2 profiles recommended for creation, independent P remains pending.')
