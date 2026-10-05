#!/usr/bin/env python3
"""Explicit bilingual authoring data; no active graph, ledger, or asset writes."""
import copy
import json
import pathlib
from datetime import datetime, timezone

OUT = pathlib.Path(__file__).resolve().parent
ROOT = pathlib.Path(__file__).resolve().parents[7]
SNAPSHOT = json.loads((OUT / 'current-six.snapshot.json').read_text())
IDS = SNAPSHOT['goalIds']
CURRENT = {g['id']: g for g in SNAPSHOT['goals']}
ORIENTATION = '2d451684-6e53-565e-a987-f362da919d2c'
NOW = datetime.now(timezone.utc).isoformat()
REVIEW_ID = 'biologie-q1-six-candidate-20261005-v1'

def save(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def expectation(id, de, en, obs_de, obs_en):
    return dict(id=id, essentialUnderstandingDe=de, essentialUnderstandingEn=en,
                observablePerformanceDe=obs_de, observablePerformanceEn=obs_en)

def axis(id, de, en):
    return dict(id=id, textDe=de, textEn=en)

def case(id, task_de, task_en, expected_de, expected_en, focus_de, focus_en):
    return dict(id=id, taskDemandDe=task_de, taskDemandEn=task_en,
                expectedPerformanceDe=expected_de, expectedPerformanceEn=expected_en,
                understandingFocusDe=focus_de, understandingFocusEn=focus_en)

def profile(archetype, expectations, axes, cases):
    return dict(archetype=archetype, expectations=expectations, coverageExpectations={
        'requiredExpectationIds': [e['id'] for e in expectations],
        'alternativeExpectationGroups': [], 'minimumIndependentDemonstrations': 2,
        'freshVariationRequired': True, 'independentTransferRequired': True,
    }, variationAxes=axes, applicationCaseBriefs=cases)

proposals = [
    {
        'goalId': IDS[0], 'decision': 'revise_with_existing_replication_goal',
        'proposedDescriptionDe': 'Die lernende Person kann den Aufbau der DNA aus Nukleotiden modellhaft darstellen und den Zusammenhang zwischen Basenfolge, komplementärer Basenpaarung und Speicherung genetischer Information erklären.',
        'proposedDescriptionEn': 'The learner can model DNA structure from nucleotides and explain the relationship between base sequence, complementary base pairing and the storage of genetic information.',
        'rationaleDe': 'Beide bisherigen D-Runden verlangen eine Trennung von Molekülstruktur und Replikation. Das eigene Replikationsziel e70d8a85 besteht bereits und verlangt 0daa als Vorziel. Der Vorschlag bewahrt 0daa als Strukturatom, statt eine weitere Kopierkompetenz zu duplizieren. Der BY-B9.3.2-Originalpunkt verlangt Struktur und Informationsspeicher, nicht Replikation.',
        'atomicity': 'Structure and information storage are one structure-function competence; replication stays a distinct process.',
        'coveragePreservation': {'reuseGoalId': 'e70d8a85-2dea-5165-919b-200fee9f4db4', 'requiredCheck': 'Map the HE Q1.1 semiconservative-replication clause explicitly to the existing replication goal after independent verification of its model-level scope; make it visible in HE GK/LK. Do not drop the clause or infer its coverage from 0daa.'},
        'integrationBlockers': ['Explicit replication source/view preservation remains required.', 'Fresh current-text independent D and A/M decisions are required.'],
    },
    {
        'goalId': IDS[1], 'decision': 'keep_current_candidate_with_unresolved_atomicity_dissent',
        'proposedDescriptionDe': CURRENT[IDS[1]]['description'],
        'proposedDescriptionEn': CURRENT[IDS[1]]['descriptionEn'],
        'rationaleDe': 'Die beiden Stufen lassen sich als zusammenhängender Informationsfluss DNA → RNA → Polypeptid modellieren. Es ist kein fachlicher Fehler im bestehenden DE/EN-Satz erwiesen. Die bisherige A-Runde hält ihn, die B-Runde verlangt Teilung; dieser Dissens bleibt offen. Das neue P-Profil verlangt die vollständige Kette in beiden Fällen und schließt den Erfolg einer einzelnen Stufe als Gesamtnachweis aus.',
        'atomicity': 'Integrated protein-synthesis model is defensible, but the prior independent split dissent is not resolved by this authoring package.',
        'integrationBlockers': ['Resolve prior keep/split dissent through independent current-scope review; if split is confirmed, create separate transcription and translation goals and use no whole-goal P pass from this draft.', 'BY B9.3.3 also requires protein roles in traits; model-only coverage is partial, not exact whole-clause coverage.'],
    },
    {
        'goalId': IDS[2], 'decision': 'revise_contextual_consequence',
        'proposedDescriptionDe': 'Die lernende Person kann Substitution, Deletion, Insertion und Duplikation an gegebenen DNA-Fällen unterscheiden und mögliche Folgen für das codierte Protein aus dem Genkontext begründen.',
        'proposedDescriptionEn': 'The learner can distinguish substitution, deletion, insertion and duplication in given DNA cases and use the gene context to justify possible consequences for the encoded protein.',
        'rationaleDe': '„Folgen abschätzen“ nennt weder Folgeebene noch notwendige Fallinformationen. Der Vorschlag bindet eine mögliche molekulare Folge an codierende Region, Leseraster und Code-Daten. Er ist nach eigener Quellen-, Sequenz- und Bildprüfung inhaltlich mit dem bereits unabhängig geprüften ffef-v2-Autorenkandidaten vereinbar. Die Kopie eines Abschnitts ist von einem bloß gleichen eingefügten Abschnitt zu unterscheiden; eine Proteinfunktions- oder Merkmalsaussage benötigt weitere Daten.',
        'atomicity': 'Classifying a sequence event and justifying its bounded molecular consequence are one analysis of the same supplied case.',
        'integrationBlockers': ['BY source additionally requires mutagens, measured/justified protein function and protection; existing exact mapping is not a full-clause proof.', 'All seven Sek-I placements need source-specific decisions; NI explicitly postpones molecular-genetic analysis to Sek II.', 'Inactive v2 illustration is not an active V record.'],
    },
    {
        'goalId': IDS[3], 'decision': 'split_preserving_two_mechanisms',
        'proposedTitleDe': 'Transkriptionsfaktoren bei Eukaryoten erklären',
        'proposedTitleEn': 'Explain transcription factors in eukaryotes',
        'proposedDescriptionDe': 'Die lernende Person kann an einem gegebenen eukaryotischen Genmodell erklären, wie Transkriptionsfaktoren über regulatorische DNA-Bereiche die Transkription beeinflussen.',
        'proposedDescriptionEn': 'The learner can use a supplied eukaryotic gene model to explain how transcription factors influence transcription through regulatory DNA regions.',
        'rationaleDe': 'Beide bisherigen unabhängigen Runden unterscheiden den bindenden Regulationsfaktor von der chemischen DNA-Markierung. 946 bleibt als einzelnes Faktor-Atom; DNA-Methylierung muss in einem gesonderten GK/LK-Atom erhalten bleiben. Das bestehende LK-Ziel 99544494 nennt Methylierung/Acetylierung, hat eine strittige HE-Q1.5-Bindung und ersetzt den GK/LK-Kern nicht ungeprüft.',
        'atomicity': 'One transcription-factor mechanism per retained atom; DNA methylation is a companion candidate.',
        'proposedRequires': [IDS[1], ORIENTATION],
        'prerequisiteRationale': 'Protein-synthesis/transcription understanding supports this mechanism. The current 7975 prerequisite already includes epigenetics and operon examples; it is neither universally required nor source-secure for this HE atom.',
        'coveragePreservation': {'companionCandidateKey': 'dna-methylation-eukaryotes', 'requiredCheck': 'Create/reuse one reviewed GK/LK DNA-methylation atom after checking existing epigenetics overlaps. Bind both atoms to the actual HE Q1.2 regulation bullet; route successors requiring either/both by actual assessed content.'},
        'integrationBlockers': ['The companion atom and exact source/view routing are required before narrowing this original.', 'Current BY applicability is not backed by a direct BY source mapping for this ID; new BY binding needs its own review.', 'Exam 3ac1cbb1 refers to 946 for promoter methylation and must be routed to the methylation companion if a split is adopted.'],
    },
    {
        'goalId': IDS[4], 'decision': 'split_preserving_structure_and_reproduction',
        'proposedDescriptionDe': 'Die lernende Person kann den prokaryotischen Grundbauplan eines Bakteriums an einem gegebenen Schema darstellen und die Lage seiner Erbinformation einschließlich gegebenenfalls vorhandener Plasmide erläutern.',
        'proposedDescriptionEn': 'The learner can use a supplied diagram to model the prokaryotic structure of a bacterium and explain the location of its genetic information, including plasmids when present.',
        'rationaleDe': 'Bakterienbau und Zweiteilung sind unabhängig beobachtbare Leistungen; beide D-Runden verlangen Teilung. Die Strukturformulierung passt zum vorhandenen Titel. Vermehrung bleibt ein eigener LK-Kandidat und darf nicht beim Kürzen verschwinden. Ein Plasmid ist keine universelle Bakterieneigenschaft.',
        'atomicity': 'Cell-structure model only; binary fission remains a separate process candidate.',
        'proposedRequires': ['fc8c4b02-02f2-5ad6-b481-224d36121da1', ORIENTATION],
        'prerequisiteRationale': 'Cell models support structural comparison. Detailed transcription/translation is not universally needed to identify bacterial genetic-material location.',
        'coveragePreservation': {'companionCandidateKey': 'bacterial-binary-fission', 'requiredCheck': 'Review a distinct schema-level binary-fission goal; bind both to the HE LK Bau und Vermehrung clause. Other states and Sek-I placements must retain their own reviewed stage scope rather than inherit HE LK.'},
        'integrationBlockers': ['Create/reuse the reproduction companion and preserve the complete HE LK source clause before narrowing.', 'BY applicability alone is not a mapped BY source proof for this ID.', 'Six non-HE Sek-I placements for this ID need structural-source checks and stage-specific prerequisite routing.'],
    },
    {
        'goalId': IDS[5], 'decision': 'revise_to_explanation_and_supplied_gel_analysis',
        'proposedDescriptionDe': 'Die lernende Person kann die Trennung von DNA-Fragmenten durch Gelelektrophorese erklären und vorgegebene Bandenmuster mithilfe eines Größenmarkers begründet auswerten.',
        'proposedDescriptionEn': 'The learner can explain how gel electrophoresis separates DNA fragments and use a size marker to interpret supplied band patterns with reasons.',
        'rationaleDe': 'Der aktuelle Satz beansprucht eigenes praktisches Trennen, während Titel und prüfbare P-Fälle Auswertung meinen. Das HE-Original nennt PCR und Gelelektrophorese ohne verpflichtende praktische Durchführung. Der Vorschlag verbindet Verfahrensverständnis mit begründeter Dateninterpretation, belegt aber kein Probenauftragen oder Durchführen eines echten Gels.',
        'atomicity': 'Principle-backed interpretation of one method; no laboratory-performance claim.',
        'proposedRequires': [IDS[0], ORIENTATION],
        'prerequisiteRationale': 'DNA structure supports the separation principle. PCR is one possible source of fragments, not a universal prerequisite: restriction fragments can also be analysed.',
        'integrationBlockers': ['Independent review must confirm that retained HE competency scope does not require practical performance.', 'No direct BY mapping currently supports this ID; a new BY binding can use B12 2.6 after a separate source decision.', 'Current PCR prerequisite removal requires route/assessment review.'],
    },
]

for row in proposals:
    old = CURRENT[row['goalId']]
    row['currentTitleDe'] = old['title']
    row['currentTitleEn'] = old['titleEn']
    row['currentDescriptionDe'] = old['description']
    row['currentDescriptionEn'] = old['descriptionEn']
    row.setdefault('proposedTitleDe', old['title'])
    row.setdefault('proposedTitleEn', old['titleEn'])
    row['currentRequires'] = old.get('requires', [])
    row.setdefault('proposedRequires', old.get('requires', []))
    row['sourceClaim'] = 'Didactic authoring candidate; HE official bullet plus scoped source context, never a verbatim official competency.'
    row['titleChanged'] = row['currentTitleDe'] != row['proposedTitleDe'] or row['currentTitleEn'] != row['proposedTitleEn']
    row['descriptionChanged'] = row['currentDescriptionDe'] != row['proposedDescriptionDe'] or row['currentDescriptionEn'] != row['proposedDescriptionEn']

save('description-decisions.candidates.json', {
    'schemaVersion': 1, 'authoringContract': 'goal-description-decisions-candidates-v1',
    'candidateStatus': 'ai_candidate', 'createdAt': NOW, 'reviewer': 'codex-biology-six-author',
    'modelFamily': 'GPT-6', 'exactModelIdentifier': None,
    'notBlind': True, 'bindingStatus': 'unadopted_proposals', 'goals': proposals,
    'claimLimit': 'No active D/P/A/M/V, source approval or human acceptance; all preservation and independent review requirements remain open.'
})

profiles = {}
profiles[IDS[0]] = profile('representation', [
    expectation('nucleotide-double-strand',
        'DNA besteht aus Nukleotiden mit Zucker, Phosphat und einer Base. Zwei komplementäre Stränge bilden das Doppelstrangmodell; die Basenfolge trägt die Information.',
        'DNA consists of nucleotides containing sugar, phosphate and a base. Two complementary strands form the double-stranded model; the base sequence carries information.',
        'Die lernende Person erzeugt ein eigenes beschriftetes Modell, trennt Rückgrat und Basen und ergänzt eine neue komplementäre Folge anhand einer gegebenen Paarungsregel.',
        'The learner produces a labelled model, distinguishes backbone from bases and constructs the complement of a fresh sequence using a supplied pairing rule.'),
    expectation('structure-information-relation',
        'Die Paarungsregel A–T und G–C begrenzt die Zuordnung zwischen den beiden Strängen, während verschiedene Basenfolgen verschiedene Information speichern können. Das Strukturmodell allein erklärt keine Replikation.',
        'The A–T and G–C pairing rule constrains the relationship between the two strands, while different base sequences can store different information. A structural model alone does not explain replication.',
        'Die lernende Person begründet in einer neuen Darstellung, welche Paarung passt und warum die Information in der Reihenfolge der Basen statt in der Zahl der Helixwindungen liegt.',
        'In a fresh representation, the learner justifies which pairing fits and why information lies in the order of bases rather than in the number of helix turns.'),
], [
    axis('representation-change', 'Bausteinmodell und anders angeordnete Doppelstrangskizze verwenden.', 'Use a component model and a differently arranged double-strand drawing.'),
    axis('sequence-complement', 'Neue Folgen und Strangrichtungen mit bereitgestellter Legende variieren.', 'Vary fresh sequences and strand directions with a supplied legend.'),
], [
    case('build-new-dna-model',
        'Du erhältst Zucker-, Phosphat- und Basensymbole, die Paarungsregel A–T/G–C und eine Richtungslegende. Baue und beschrifte einen kurzen Doppelstrang zu 5′-ATGCCA-3′. Erläutere an deinem Modell, welche Teile die Basenfolge tragen und was diese mit genetischer Information zu tun hat.',
        'You receive sugar, phosphate and base symbols, the A–T/G–C pairing rule and a direction legend. Construct and label a short double strand for 5′-ATGCCA-3′. Use your model to explain which parts carry the base sequence and how that relates to genetic information.',
        'Das Modell hat Zucker-Phosphat-Rückgrate und die passende Gegenfolge 3′-TACGGT-5′. Nukleotid und Base sind unterschieden; die Begründung verortet die Information in der Basenreihenfolge. Ein Kopiervorgang wird nicht als Strukturleistung mitgezählt.',
        'The model has sugar-phosphate backbones and the matching complementary sequence 3′-TACGGT-5′. It distinguishes a nucleotide from a base and locates information in base order. Copying is not counted as structural performance.',
        'Eigenständig erzeugte Struktur statt Bildwiederholung.', 'Independently produced structure rather than reproduction of an image.'),
    case('select-and-justify-complement',
        'Eine neue Skizze zeigt 5′-CGTTA-3′ und zwei Kandidaten für den Gegenstrang: 3′-GCAAT-5′ und 3′-GGAAT-5′. Paarungsregel und Richtungslegende sind gegeben. Wähle begründet, korrigiere die nicht passende Stelle und erkläre, warum zwei gleich lange DNA-Modelle verschiedene Information tragen können.',
        'A fresh drawing shows 5′-CGTTA-3′ and two candidate complementary strands: 3′-GCAAT-5′ and 3′-GGAAT-5′. The pairing rule and direction legend are supplied. Justify your choice, correct the mismatching site and explain why equally long DNA models can carry different information.',
        'Die erste Folge passt. Im zweiten Gegenstrang steht gegenüber G ein G statt C. Die lernende Person begründet die Paarung und die Bedeutung der Basenfolge unabhängig von gleicher Länge oder Helixform.',
        'The first sequence matches. In the second complement, G faces G where C is required. The learner justifies complementarity and the significance of sequence independently of equal length or helix shape.',
        'Transfer von Bausteinen zu Fehleranalyse mit einer frischen Sequenz.', 'Transfer from components to error analysis with a fresh sequence.'),
])

profiles[IDS[1]] = profile('modeling', [
    expectation('two-stage-information-flow',
        'Transkription erzeugt RNA anhand einer DNA-Vorlage; Translation setzt die mRNA-Codonfolge am Ribosom mithilfe von tRNA in eine Polypeptidfolge um. Die beiden Stufen sind zu verbinden und nicht zu verwechseln.',
        'Transcription produces RNA from a DNA template; translation uses the mRNA codon sequence, tRNA and a ribosome to assemble a polypeptide. The two stages must be connected and distinguished.',
        'Die lernende Person erzeugt ein zusammenhängendes DNA–mRNA–Polypeptid-Modell und begründet die Rolle von mRNA, tRNA und Ribosom; Erfolg in nur einer Stufe reicht nicht für das Gesamtziel.',
        'The learner constructs a connected DNA–mRNA–polypeptide model and explains the roles of mRNA, tRNA and ribosome; success in only one stage does not establish the whole goal.'),
    expectation('code-and-cell-context',
        'Die Richtung und Art des vorgegebenen DNA-Strangs bestimmen die RNA-Ableitung; der bereitgestellte Code bestimmt die Aminosäurefolge. Bei Eukaryoten sind Kerntranskription und Translation außerhalb des Kerns räumlich getrennt.',
        'The direction and type of the supplied DNA strand determine RNA derivation; the supplied code determines amino-acid order. In eukaryotes, nuclear transcription is spatially separate from translation outside the nucleus.',
        'Mit ausdrücklich vereinfachten intronfreien Modellabschnitten leitet die lernende Person frische RNA- und Aminosäurefolgen ab und lokalisiert eine gegebene Störung an der passenden Stufe.',
        'Using explicitly simplified intron-free model fragments, the learner derives fresh RNA and amino-acid sequences and locates a supplied disturbance at the appropriate stage.'),
], [
    axis('template-and-coding-strands', 'Vorlagenstrang und codierenden Strang ausdrücklich kennzeichnen und in frischen Fällen wechseln.', 'Explicitly identify and vary template and coding strands in fresh cases.'),
    axis('cell-and-intervention', 'Eukaryotisches Kompartimentmodell und prokaryotischen Befund mit gestörter Translation vergleichen.', 'Compare a eukaryotic compartment model with a prokaryotic result showing disrupted translation.'),
], [
    case('eukaryotic-connected-model',
        'Ein vereinfachtes intronfreies eukaryotisches Modell zeigt den DNA-Vorlagenstrang 3′-TAC CTT AAA-5′, eine Paarungsregel und eine Code-Tabelle. Stelle die mRNA und die ab AUG betrachtete Aminosäurefolge dar; ordne DNA, mRNA, tRNA und Ribosom in Kern und Cytoplasma ein und erkläre den verbundenen Informationsfluss. Gezeigt wird nur ein Ausschnitt, kein vollständiges Protein.',
        'A simplified intron-free eukaryotic model supplies the DNA template strand 3′-TAC CTT AAA-5′, a pairing rule and a codon table. Represent the mRNA and the amino-acid sequence considered from AUG; place DNA, mRNA, tRNA and ribosome in nucleus and cytoplasm and explain the connected information flow. Only a fragment, not a complete protein, is shown.',
        'mRNA 5′-AUG GAA UUU-3′ und der Ausschnitt Met–Glu–Phe passen. Transkription im Kern ist von der mRNA-Translation am cytoplasmatischen Ribosom unterschieden; tRNA vermittelt Codon und Aminosäure. Eine bloße Codonlösung ohne Modellkette genügt nicht.',
        'mRNA 5′-AUG GAA UUU-3′ and the fragment Met–Glu–Phe match. Nuclear transcription is distinguished from mRNA translation at a cytoplasmic ribosome; tRNA links codons to amino acids. A codon answer without the connected model is insufficient.',
        'Vollständige Kette mit klaren Molekülrollen.', 'Complete connected chain with clear molecular roles.'),
    case('prokaryotic-translation-disturbance',
        'Ein neues vereinfachtes Bakterienmodell gibt den codierenden DNA-Strang 5′-ATG TCT GGT-3′, Stranglegende und Code-Tabelle an. Ohne Störung wird die passende mRNA gebildet und der modellierte Polypeptidabschnitt nachgewiesen. Mit einem laut Material gezielt an der Translation wirkenden Hemmstoff ist mRNA weiter nachweisbar, der Abschnitt aber nicht. Erzeuge die erwartete RNA-/Aminosäurekette und erkläre den Unterschied der Befunde.',
        'A fresh simplified bacterial model provides the coding DNA strand 5′-ATG TCT GGT-3′, a strand legend and a codon table. Without intervention, matching mRNA and the modelled polypeptide fragment are detected. With an inhibitor specified in the material to act on translation, mRNA remains detectable but the fragment does not. Construct the expected RNA/amino-acid chain and explain the difference between the results.',
        'Die neue Kette lautet 5′-AUG UCU GGU-3′ und Met–Ser–Gly. Die lernende Person verbindet Transkription und Translation, begründet die vorhandene RNA mit erhaltenem ersten Schritt und den fehlenden Abschnitt mit der angegebenen Translationsstörung; sie schließt nicht auf fehlende DNA oder eine gemessene Proteinmenge.',
        'The fresh chain is 5′-AUG UCU GGU-3′ and Met–Ser–Gly. The learner connects both stages, explains detected RNA by the preserved first stage and the absent fragment by the specified translation disturbance, without inferring missing DNA or a measured protein quantity.',
        'Transfer auf andere Strangart, Zellart und eine interpretierbare Störung.', 'Transfer to a different strand type, cell type and interpretable intervention.'),
])

ffef_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-01/biologie-q1-ffef-candidate-v2/positive-evidence-v2.candidates.json'
profiles[IDS[2]] = copy.deepcopy(json.loads(ffef_path.read_text())['goals'][0]['profile'])
# The reviewed v2 asks only for frame consequences. Specify the copied base as well.
ffef_case = profiles[IDS[2]]['applicationCaseBriefs'][1]
ffef_case['taskDemandDe'] = ffef_case['taskDemandDe'].replace('Verdopplung einer Base innerhalb von AAG', 'Verdopplung der ersten A-Base innerhalb von AAG')
ffef_case['taskDemandEn'] = ffef_case['taskDemandEn'].replace('one base within AAG duplicated', 'the first A base within AAG duplicated')

profiles[IDS[3]] = profile('concept', [
    expectation('regulatory-binding',
        'Ein Transkriptionsfaktor beeinflusst die Transkription über Bindung an regulatorische DNA und Wechselwirkung mit dem Transkriptionssystem. Aktivierende und hemmende Wirkung sind kontextabhängig.',
        'A transcription factor influences transcription through regulatory DNA binding and interactions with the transcription system. Activating and repressing effects depend on context.',
        'Die lernende Person erklärt in einem gegebenen Genmodell den Weg von Faktorbindung zur veränderten Transkription und verwendet den im Material belegten aktivierenden oder hemmenden Effekt.',
        'The learner explains the path from factor binding to changed transcription in a supplied gene model and uses the activating or repressing effect supported by that material.'),
    expectation('interpret-model-result',
        'Eine veränderte Bindungsstelle oder ein verändertes Faktorangebot kann die Transkription beeinflussen. Eine schematische Bindung allein beweist weder tatsächliche Proteinmenge noch ein Merkmal.',
        'Changing a binding site or factor availability may influence transcription. A binding diagram alone establishes neither an actual protein quantity nor a trait.',
        'Die lernende Person nutzt passende Bindungs- und mRNA-Daten für eine begründete Modellvorhersage und begrenzt ihre Aussage auf den angegebenen Kontext.',
        'The learner uses matched binding and mRNA data for a justified model prediction and limits the conclusion to the supplied context.'),
], [
    axis('activator-repressor', 'Aktivierendes und hemmendes Faktormodell mit jeweils eigenen Daten vergleichen.', 'Compare activating and repressing factor models, each with its own data.'),
    axis('binding-site-factor-availability', 'Bindungsstelle und Faktorangebot als verschiedene Eingriffe variieren.', 'Vary binding-site change and factor availability as distinct interventions.'),
], [
    case('activator-binding-site',
        'Ein eukaryotisches Genmodell liefert zwei sonst gleiche Konstrukte: Faktor A bindet an die intakte regulatorische Stelle, bei gezielt veränderter Stelle nicht. Im angegebenen Modell unterstützt A den Transkriptionsbeginn. Für beide Konstrukte werden passende mRNA-Daten gezeigt: 80 bzw. 5 relative Einheiten. Erkläre den Zusammenhang und sage begründet voraus, was bei fehlendem A im intakten Konstrukt zu erwarten ist.',
        'A eukaryotic gene model supplies two otherwise identical constructs: factor A binds the intact regulatory site but not a specifically altered site. In the supplied model, A supports transcription initiation. Matched mRNA data are 80 and 5 relative units. Explain the relationship and justify a prediction for the intact construct when A is absent.',
        'Die lernende Person verbindet die gegebene A-Bindung mit unterstützt beginnender Transkription und höherem mRNA-Befund. Ohne A erwartet sie eine im Modell verminderte Transkription, ohne eine exakte neue Zahl oder Proteinfunktion zu erfinden.',
        'The learner connects supplied A binding with supported transcription initiation and the higher mRNA result. Without A, the model predicts reduced transcription without inventing an exact new number or protein function.',
        'Faktorwirkung durch begründete Modellvorhersage.', 'Factor action through a justified model prediction.'),
    case('repressor-availability',
        'In einem neuen eukaryotischen Modellsystem bleibt die DNA-Stelle unverändert. Das Material bezeichnet R als hemmenden Transkriptionsfaktor: mit gebundenem R werden 12, nach Entfernen von R 96 relative mRNA-Einheiten gemessen. Ordne die Wirkung ein und erkläre, warum „Faktorbindung aktiviert immer“ diesen Fall nicht erklärt.',
        'In a fresh eukaryotic model system, the DNA site stays unchanged. The material specifies R as a repressing transcription factor: 12 relative mRNA units are measured with R bound and 96 after R is removed. Identify and explain the effect, and explain why “factor binding always activates” does not account for this case.',
        'Die lernende Person erklärt die Hemmung der Transkription durch R im gegebenen Kontext und die höhere mRNA nach Wegnahme. Sie begründet den Gegensatz zum ersten Fall mit anderer Faktorwirkung und erfindet weder Methylierungsänderung noch ein Merkmal.',
        'The learner explains R-mediated transcriptional repression in the supplied context and increased mRNA after removal. The difference from the first case is justified by the factor’s distinct effect, without inventing a methylation change or a trait.',
        'Frischer positiver Mechanismustransfer von Aktivierung zu Hemmung.', 'Fresh positive mechanism transfer from activation to repression.'),
])

profiles[IDS[4]] = profile('representation', [
    expectation('bacterial-structural-model',
        'Der prokaryotische Grundbauplan hat keinen membranumhüllten Zellkern; DNA liegt im Zellraum. Membran, gegebenenfalls Zellwand und Ribosomen haben andere Funktionen als die DNA.',
        'The prokaryotic plan lacks a membrane-bound nucleus; DNA lies in the cell interior. Membrane, cell wall when present and ribosomes serve functions distinct from DNA.',
        'Die lernende Person ordnet Strukturen eines frischen Bakterienschemas anhand gegebener Hinweise zu und erklärt die Lage des genetischen Materials statt nur Beschriftungen zu wiederholen.',
        'The learner identifies structures in a fresh bacterial diagram using supplied information and explains genetic-material location rather than merely repeating labels.'),
    expectation('optional-plasmid-distinction',
        'Ein gegebenes Plasmid ist zusätzliche DNA und kein Zellkern. Nicht jedes Bakterium besitzt Plasmide; ein dargestelltes Plasmid allein belegt keine gentechnische Änderung oder Proteinproduktion.',
        'A supplied plasmid is additional DNA, not a nucleus. Not every bacterium has plasmids; a drawn plasmid alone establishes neither genetic engineering nor protein production.',
        'Die lernende Person unterscheidet Chromosom und gegebenenfalls Plasmid in zwei neuen Schemata und erklärt, weshalb auch ein plasmidfreies Modell ein Bakterium darstellen kann.',
        'The learner distinguishes chromosome and optional plasmid in two fresh models and explains why a plasmid-free model can still represent a bacterium.'),
], [
    axis('model-presentation', 'Anders angeordnete Bakterienskizze und eukaryotisches Vergleichsmodell mit bereitgestellten Strukturhinweisen verwenden.', 'Use a differently arranged bacterial drawing and a eukaryotic comparison model with supplied structural clues.'),
    axis('plasmid-presence', 'Plasmidfreien und plasmidhaltigen bakteriellen Grundbauplan unterscheiden.', 'Distinguish plasmid-free and plasmid-bearing bacterial plans.'),
], [
    case('bacterium-and-yeast-diagrams',
        'Zwei neue Schemata mit erklärter Legende zeigen ein Bakterium mit DNA im Zellraum und eine Hefezelle mit DNA im membranumhüllten Kern. Im Bakterienschema sind Zellmembran, Zellwand, Ribosomen, Chromosom und ein kleiner DNA-Ring eingezeichnet. Ordne die Teile zu und begründe den prokaryotischen Grundbauplan und die Lage der Erbinformation.',
        'Two fresh diagrams with an explained legend show a bacterium with DNA in the cell interior and a yeast cell with DNA in a membrane-bound nucleus. The bacterial diagram shows membrane, wall, ribosomes, chromosome and a small DNA ring. Identify these parts and justify the prokaryotic plan and genetic-material location.',
        'Die lernende Person trennt Zellbegrenzung und Ribosomen vom genetischen Material, lokalisiert das Chromosom ohne Zellkern und ordnet den angegebenen kleinen DNA-Ring als Plasmid ein. Sie erklärt den Strukturunterschied zur vorgegebenen Hefezelle.',
        'The learner distinguishes cell boundary and ribosomes from genetic material, locates the chromosome without a nucleus and identifies the supplied small DNA ring as a plasmid. The structural difference from the supplied yeast model is explained.',
        'Eigenständige Strukturzuordnung mit erklärtem Vergleich.', 'Independent structural identification with an explained comparison.'),
    case('plasmid-free-versus-bearing',
        'Ein zweiter Modellfall zeigt zwei bakterielle Zellen: beide mit Chromosom und ohne Zellkern, nur eine mit einem zusätzlich gekennzeichneten Plasmid. In einem Lehrschema soll zusätzliche DNA über dieses Plasmid dargestellt werden. Erkläre, welche DNA-Struktur gemeint ist, warum die andere Zelle trotzdem ein Bakterium ist und welche Aussage über Proteinbildung das reine Schema noch nicht trägt.',
        'A second model case shows two bacterial cells: both have a chromosome and no nucleus, but only one has a labelled additional plasmid. A teaching diagram is intended to depict additional DNA on that plasmid. Explain which DNA structure is meant, why the other cell is still a bacterium and which protein-production claim is not established by the diagram alone.',
        'Die lernende Person erklärt das Plasmid als zusätzliche DNA gegenüber dem Chromosom und hält Plasmide nicht für ein universelles Bakterienmerkmal. Sie begründet die bakterielle Einordnung mit dem Grundbauplan; der reine DNA-Ort beweist keine erfolgreiche Genexpression.',
        'The learner explains the plasmid as additional DNA distinct from the chromosome and does not treat plasmids as universal bacterial features. Classification is justified by the cell plan; DNA location alone does not prove successful gene expression.',
        'Frischer Transfer auf optionales genetisches Material.', 'Fresh transfer to optional genetic material.'),
])

profiles[IDS[5]] = profile('data', [
    expectation('separation-principle',
        'Im gegebenen Gel wandert negativ geladene DNA im elektrischen Feld zur positiven Seite. Unter vergleichbaren Bedingungen wandern kürzere lineare Fragmente weiter als längere.',
        'In the supplied gel, negatively charged DNA migrates toward the positive side in the electric field. Under comparable conditions, shorter linear fragments migrate farther than longer ones.',
        'Die lernende Person erklärt Polung und größenabhängige Wanderung anhand eines neuen Gelmodells und verknüpft sie mit dem tatsächlich vorgelegten Bandenmuster.',
        'The learner explains polarity and size-dependent migration using a fresh gel model and connects these to the supplied band pattern.'),
    expectation('marker-grounded-inference',
        'Ein Größenmarker begründet eine ungefähre Fragmentlänge. Gleiche Wanderung beweist unter diesen Bedingungen vergleichbare Länge, nicht gleiche Basensequenz, Identität eines Menschen oder Erkrankung.',
        'A size marker supports an approximate fragment length. Equal migration under these conditions indicates comparable length, not identical base sequence, a person’s identity or disease.',
        'Die lernende Person ordnet neue Probenbanden zum passenden Marker zu und formuliert eine positive Größen-/Musterfolgerung mit der Grenze ihrer Aussage.',
        'The learner matches fresh sample bands to a suitable marker and produces a positive length/pattern conclusion with an explicit limit.'),
], [
    axis('marker-and-lanes', 'Neue Markergrößen, andere Spurreihenfolge und mehrere Banden aus linearen Fragmenten verwenden.', 'Use fresh marker sizes, reordered lanes and multiple bands from linear fragments.'),
    axis('origin-and-claim-limit', 'PCR-Produkt und Restriktionsfragmente als verschiedene Probenherkünfte vergleichen; Sequenzgleichheit nicht aus Größenübereinstimmung folgern.', 'Compare PCR product and restriction fragments as different sample origins; do not infer sequence identity from equal size.'),
], [
    case('linear-restriction-fragments',
        'Ein gegebenes Gelmodell trennt lineare DNA-Fragmente unter gleichen Bedingungen. Der Marker zeigt 2000 bp bei 15 mm, 1000 bp bei 28 mm und 500 bp bei 44 mm Abstand von den Taschen. Eine unbekannte Restriktionsprobe zeigt Banden bei 28 und 44 mm. Die Taschen liegen an der negativen Seite. Erläutere das Trennprinzip und leite die gestützten ungefähren Größen der Probe ab.',
        'A supplied gel model separates linear DNA fragments under matched conditions. Marker bands are 2000 bp at 15 mm, 1000 bp at 28 mm and 500 bp at 44 mm from the wells. An unknown restriction-digest sample has bands at 28 and 44 mm. The wells are on the negative side. Explain separation and derive the supported approximate fragment sizes.',
        'Die lernende Person begründet die Wanderung zur positiven Seite und die größere Strecke kürzerer linearer Fragmente. Sie ordnet die Probe ungefähr 1000 und 500 bp zu, ohne aus dem Muster Sequenz oder Organismusidentität abzuleiten.',
        'The learner explains migration toward the positive side and the farther travel of shorter linear fragments. The sample is assigned approximately 1000 and 500 bp, without inferring sequence or organism identity from the pattern.',
        'Begründete Markerinterpretation ohne praktische Durchführungsbehauptung.', 'Reasoned marker interpretation without a laboratory-performance claim.'),
    case('new-ladder-same-size-different-sequence',
        'Ein anderes gegebenes Gel mit linearen Fragmenten zeigt 1200 bp bei 16 mm, 600 bp bei 30 mm und 300 bp bei 48 mm. Zwei getrennte PCR-Produkte laufen beide bei 30 mm, eine Restriktionsprobe bei 16 und 30 mm. Die Sequenzen sind unbekannt. Werte jede Spur aus und erkläre, welche positive Aussage der Vergleich der beiden PCR-Spuren trägt und warum ihre Basenfolgen trotzdem verschieden sein können.',
        'A different supplied gel with linear fragments shows 1200 bp at 16 mm, 600 bp at 30 mm and 300 bp at 48 mm. Two separate PCR products both migrate at 30 mm; a restriction sample has bands at 16 and 30 mm. Sequences are unknown. Interpret every lane and explain the positive conclusion supported by comparing the PCR lanes and why their base sequences can still differ.',
        'Die PCR-Produkte haben ungefähr 600 bp; die Restriktionsprobe enthält ungefähr 1200 und 600 bp. Die lernende Person begründet gleiche ungefähre Größe der beiden PCR-Produkte anhand des Markers, unterscheidet sie aber von unbewiesener Sequenzgleichheit. Sie verwendet den zweiten Marker, nicht die Zahlen des ersten Falls.',
        'The PCR products are approximately 600 bp; the restriction sample contains approximately 1200 and 600 bp. The learner uses the new marker to justify comparable PCR-product size while distinguishing it from unproved sequence identity, rather than reusing the first case’s numbers.',
        'Frischer Transfer mit neuer Leiter und positiver Musterfolgerung.', 'Fresh transfer with a new ladder and a positive pattern inference.'),
])

save('positive-evidence.candidates.json', {
    'schemaVersion': 1, 'authoringContract': 'positive-understanding-evidence-candidates-v1',
    'reviewId': REVIEW_ID, 'reviewedAt': NOW, 'reviewer': 'codex-biology-six-author',
    'goals': [{'goalId': i, 'reason': next(p['rationaleDe'] for p in proposals if p['goalId'] == i) + ' Unadopted proposed-scope authoring draft; source-preservation blockers and independent review remain open.',
               'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
               'dissent': next(p['integrationBlockers'] for p in proposals if p['goalId'] == i),
               'profile': profiles[i]} for i in IDS],
})

# This is an isolated proposed-scope snapshot for shape/semantic checks only.
# It must never be registered as a canonical landscape or a central evidence config.
proposed_goals = []
for i in IDS:
    g = copy.deepcopy(CURRENT[i])
    p = next(p for p in proposals if p['goalId'] == i)
    g.update(title=p['proposedTitleDe'], titleEn=p['proposedTitleEn'],
             description=p['proposedDescriptionDe'], descriptionEn=p['proposedDescriptionEn'], requires=p['proposedRequires'])
    proposed_goals.append(g)
save('proposed-six.validation-snapshot.json', {'landscapeId': '08a43a1b-d97e-522c-9dfa-c950a493364e', 'goals': proposed_goals})
save('positive-evidence.validation-only.config.json', {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',
    'schemaVersion': 2, 'reviewId': REVIEW_ID,
    'goalFingerprintRuleVersion': 'goal-evidence-v1', 'profileRuleVersion': 'positive-understanding-evidence-v2',
    'landscapeId': '08a43a1b-d97e-522c-9dfa-c950a493364e',
    'landscapePath': str((OUT / 'proposed-six.validation-snapshot.json').relative_to(ROOT)),
    'semanticKindLedgerPath': 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
    'reviewCriteriaPath': 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md',
    'reviewPath': str((OUT / 'validation-only.not-registered.review.jsonl').relative_to(ROOT)),
    'reviewRunManifestPaths': [], 'reviewedResourceTypes': [], 'requireApproved': False,
    'scope': {'label': 'Unadopted proposed-scope six-goal profile validation only; not active M7', 'goalIds': IDS},
})
print(json.dumps({'descriptionCandidates': len(proposals), 'pProfiles': len(profiles), 'freshCases': sum(len(p['applicationCaseBriefs']) for p in profiles.values()), 'noActiveMutations': True}))
