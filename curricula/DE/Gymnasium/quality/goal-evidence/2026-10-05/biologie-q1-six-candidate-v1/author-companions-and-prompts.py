#!/usr/bin/env python3
"""Full inner profiles for proposed split companions; no IDs are minted."""
import importlib.util
import json
import pathlib

OUT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('candidate_author', OUT / 'author-candidates.py')
author = importlib.util.module_from_spec(spec)
spec.loader.exec_module(author)
expectation, axis, case, profile = author.expectation, author.axis, author.case, author.profile

methylation = profile('data', [
    expectation('chemical-mark-not-sequence-change',
        'DNA-Methylierung verändert die chemische Markierung bestimmter DNA-Stellen, nicht die Reihenfolge der Basen. Ihre Wirkung auf Transkription hängt von Ort und Kontext ab.',
        'DNA methylation changes the chemical marking of particular DNA sites, not base order. Its effect on transcription depends on location and context.',
        'Die lernende Person unterscheidet in einem gegebenen eukaryotischen Genmodell Basenfolge und Methylierungsmarken und erklärt einen materialgestützten Zusammenhang mit Transkription.',
        'In a supplied eukaryotic gene model, the learner distinguishes base sequence from methylation marks and explains a material-supported relationship with transcription.'),
    expectation('contextual-evidence-limit',
        'Promotormethylierung kann in dem belegten Modell mit verringerter Transkription verbunden sein. Ein Methylierungsbild allein beweist keine universelle Abschaltung; ein Vergleichsbefund und ein kontrollierter Eingriff haben unterschiedliche Aussagekraft.',
        'Promoter methylation can be associated with reduced transcription in the supported model. A methylation image alone does not prove universal silencing; a comparison and a controlled intervention have different evidential strength.',
        'Die lernende Person erklärt eine mögliche Regulationswirkung mit passenden mRNA-Daten und trennt belegte Modellwirkung von einer nicht belegten allgemeinen Kausalaussage.',
        'The learner explains a possible regulatory effect using matched mRNA data and distinguishes a supported model effect from an unsupported universal causal claim.'),
], [
    axis('mark-location', 'Promotor und anders gelegene markierte Region in gesonderten materialgestützten Modellen vergleichen.', 'Compare a promoter and a differently located marked region in separate material-supported models.'),
    axis('comparison-versus-intervention', 'Einen Zellvergleich und einen kontrollierten Eingriff im gegebenen Modellsystem unterscheiden.', 'Distinguish a cell comparison from a controlled intervention in a supplied model system.'),
], [
    case('same-sequence-cell-comparison',
        'Zwei eukaryotische Zelltypen haben laut Material dieselbe DNA-Basenfolge. Für ein bestimmtes Gen zeigt Zelltyp A geringe Promotormethylierung und 90 relative mRNA-Einheiten, Zelltyp B starke Promotormethylierung und 8 Einheiten. Die Faktorbelegung ist nicht untersucht. Erkläre den Unterschied zwischen Sequenz und Markierung und begründe eine mögliche epigenetische Erklärung des Befunds.',
        'Two eukaryotic cell types have the same DNA base sequence according to the material. A particular gene shows low promoter methylation and 90 relative mRNA units in cell type A, versus high promoter methylation and 8 units in B. Factor occupancy was not examined. Explain the sequence/mark distinction and justify a possible epigenetic explanation of the results.',
        'Die lernende Person hält gleiche Sequenz und verschiedene chemische Markierung auseinander und verbindet die Markierung mit einer möglichen verminderten Transkription im gegebenen Gen. Sie begrenzt die Kausalität, weil Zelltypen und unbekannte Faktorbelegung weitere Unterschiede tragen können.',
        'The learner distinguishes the same sequence from different chemical marks and connects marking with possible reduced transcription of this gene. The causal claim is limited because cell types and unknown factor occupancy may differ in other respects.',
        'Positive Erklärung einer möglichen Markierungswirkung statt Sequenzmutation.', 'Positive explanation of a possible marking effect rather than a sequence mutation.'),
    case('controlled-promoter-model-and-other-region',
        'Ein neues, ausdrücklich kontrolliertes Genmodell hält Basenfolge und Faktorenangebot gleich. In diesem Modell verringert ein gezielter Eingriff, der nur die Promotormethylierung erhöht, die mRNA von 70 auf 10 relative Einheiten; nach Rücknahme beträgt sie 68. Ein anderes Gen trägt Methylierungsmarken in einer anderen DNA-Region und wird trotzdem transkribiert. Erkläre beide Befunde im jeweiligen Kontext.',
        'A fresh explicitly controlled gene model holds base sequence and factor availability constant. In this model, an intervention specified to increase only promoter methylation lowers mRNA from 70 to 10 relative units; reversal yields 68. A different gene carries methylation marks in another DNA region but is still transcribed. Explain both results in their respective contexts.',
        'Die lernende Person erklärt die im ersten Modell gestützte, reversible Regulationswirkung der Promotormarkierung und begründet mit dem zweiten Befund die Abhängigkeit von Region und Kontext. Sie verallgemeinert weder auf jedes Gen noch auf Proteinfunktion oder generationsübergreifende Vererbung.',
        'The learner explains the reversible regulatory effect supported in the first promoter model and uses the second result to justify location/context dependence, without generalising to every gene, protein function or transgenerational inheritance.',
        'Frischer Transfer von beobachtetem Vergleich zu begrenzt kausalem Modell.', 'Fresh transfer from observed comparison to a bounded causal model.'),
])

division = profile('modeling', [
    expectation('copy-partition-fission',
        'Bei modellhafter bakterieller Zweiteilung wird die chromosomale DNA vor der Trennung kopiert und auf die entstehenden Zellen verteilt. Das ist keine Mitose mit einem Zellkern.',
        'In modelled bacterial binary fission, chromosomal DNA is copied and partitioned between developing cells before separation. This is not mitosis involving a nucleus.',
        'Die lernende Person ordnet einen neuen Ablauf und erklärt, wie DNA-Kopie, Verteilung und Zelltrennung zwei Zellen mit chromosomaler Erbinformation ermöglichen.',
        'The learner orders a fresh process and explains how DNA copying, partitioning and separation allow two cells to receive chromosomal genetic information.'),
    expectation('limited-population-model',
        'Wiederholte Zweiteilung kann unter ausdrücklich konstanten Modellbedingungen Zellzahlen verdoppeln. Ressourcenmangel, ausbleibende Teilung oder Zelltod begrenzen diese Vorhersage; Plasmide sind dafür nicht vorauszusetzen.',
        'Repeated binary fission can double cell counts under explicitly constant model conditions. Resource limitation, failed division or cell death limit that prediction; plasmids are not a prerequisite.',
        'Die lernende Person verbindet ein frisches Teilungsmodell mit einer gegebenen Zeitreihe und begründet eine passende Zellzahlfolge samt ihren Modellbedingungen.',
        'The learner connects a fresh fission model to a supplied time series and justifies a corresponding cell-count progression with its assumptions.'),
], [
    axis('process-display', 'Gezeichnete Stadien und tabellarischen Befund verwenden, ohne eine Mitose zu unterstellen.', 'Use drawn stages and tabulated results without assuming mitosis.'),
    axis('division-conditions', 'Ungehinderte Teilungsrunden und materialgestützt unterbrochene DNA-Kopie vergleichen.', 'Compare unobstructed division rounds and material-supported interrupted DNA copying.'),
], [
    case('label-and-order-binary-fission',
        'Vier neue Schemabilder eines plasmidfreien Bakteriums zeigen eine chromosomale DNA, kopierte und getrennte DNA-Bereiche, eine Einschnürung und zwei getrennte Zellen. Ordne den Ablauf und erkläre die Verteilung der Erbinformation. Im reinen Modell teilt sich jede Zelle in zwei aufeinanderfolgenden Runden, ohne Zelltod: Leite die Zellzahlen aus einer Ausgangszelle ab.',
        'Four fresh schematic images of a plasmid-free bacterium show one chromosomal DNA, copied and separated DNA regions, a constriction and two separate cells. Order the process and explain genetic-information distribution. In the pure model, each cell divides in two successive rounds with no cell death; derive counts from one starting cell.',
        'Die lernende Person erklärt DNA-Kopie vor Verteilung und Trennung, ohne Kernmitose zu erfinden. Aus 1 werden 2 und 4 Zellen unter den ausdrücklich genannten Bedingungen; die Zahlen ersetzen die Prozesserklärung nicht.',
        'The learner explains copying before partitioning and separation without inventing nuclear mitosis. Counts are 1, 2 and 4 under the stated conditions; numbers do not replace the process explanation.',
        'Eigenständig erklärter Prozess und daran gebundene Modellfolge.', 'Independently explained process with a connected model progression.'),
    case('copying-interruption-time-series',
        'In einem anderen bereitgestellten Bakterienmodell wird laut Material nur die chromosomale DNA-Kopie vorübergehend unterbrochen. Die Zelle wächst zunächst weiter, aber die vorher beobachtete Folge zwei vollständig getrennter Zellen bleibt aus. Nach Wiederaufnahme der DNA-Kopie werden zwei Zellen mit je einer chromosomalen DNA gezeigt. Erkläre die Befunde und begründe, warum bloßes Zellwachstum keinen sicheren Teilungsnachweis liefert.',
        'In a different supplied bacterial model, only chromosomal DNA copying is temporarily interrupted according to the material. The cell initially continues growing, but the previously observed outcome of two fully separated cells does not occur. After copying resumes, two cells each containing chromosomal DNA are shown. Explain the results and justify why cell growth alone does not establish division.',
        'Die lernende Person überträgt die Kopie–Verteilung–Trennung-Kette auf die Modellstörung und deren Rücknahme. Sie unterscheidet Vergrößerung einer Zelle von Entstehung zweier Zellen und behauptet aus dem Modell keine unbegrenzte Populationszunahme oder Plasmidaufnahme.',
        'The learner applies the copying–partitioning–separation chain to the model intervention and reversal. Enlargement is distinguished from producing two cells, without claiming unlimited population growth or plasmid uptake.',
        'Frischer Prozess-Transfer durch begründet eingeordneten Eingriff.', 'Fresh process transfer through a justified interpretation of an intervention.'),
])

companions = [
    {
        'candidateKey': 'dna-methylation-eukaryotes', 'splitFromGoalId': author.IDS[3],
        'proposedTitleDe': 'DNA-Methylierung bei Eukaryoten erklären',
        'proposedTitleEn': 'Explain DNA methylation in eukaryotes',
        'proposedDescriptionDe': 'Die lernende Person kann an gegebenen eukaryotischen Genmodellen erklären, wie DNA-Methylierung die Transkription im jeweiligen Kontext beeinflussen kann, und passende Methylierungs- und mRNA-Befunde begründet deuten.',
        'proposedDescriptionEn': 'The learner can use supplied eukaryotic gene models to explain how DNA methylation may influence transcription in the given context and interpret matched methylation and mRNA data with reasons.',
        'sourceScope': 'HE Q1.2, printed p.39, GK/LK; distinct from LK histone modification and unreviewed broad LK epigenetics overlaps.',
        'requiresCandidate': [author.IDS[1], author.ORIENTATION], 'profile': methylation,
    },
    {
        'candidateKey': 'bacterial-binary-fission', 'splitFromGoalId': author.IDS[4],
        'proposedTitleDe': 'Bakterielle Zweiteilung modellhaft erklären',
        'proposedTitleEn': 'Model and explain bacterial binary fission',
        'proposedDescriptionDe': 'Die lernende Person kann die Vermehrung von Bakterien durch Zweiteilung anhand eines gegebenen Modells erklären und die Verteilung der kopierten chromosomalen DNA auf die entstehenden Zellen nachvollziehen.',
        'proposedDescriptionEn': 'The learner can use a supplied model to explain bacterial reproduction by binary fission and trace the distribution of copied chromosomal DNA to the developing cells.',
        'sourceScope': 'HE Q1.2, printed p.39, LK; schema-level Bau und Vermehrung. No automatic Sek-I/BY source allocation.',
        'requiresCandidate': [author.IDS[4], 'e70d8a85-2dea-5165-919b-200fee9f4db4', author.ORIENTATION], 'profile': division,
    },
]
author.save('split-companions.candidates.json', {
    'schemaVersion': 1, 'candidateStatus': 'ai_candidate', 'createdAt': author.NOW,
    'authoringContract': 'unminted-split-companion-content-candidates-v1',
    'modelFamily': 'GPT-6', 'exactModelIdentifier': None,
    'goals': companions,
    'claimLimit': 'Local candidate keys are not stable goal IDs. Both complete bilingual inner P-v2 profiles need independent source/atomicity/content review and later current-text/resource bindings. Do not narrow the originals until lost source clauses are preserved.'
})

common = 'Erstelle ein ruhiges, kompaktes didaktisches Rasterbild im Querformat 16:9. Klare große Formen, heller Hintergrund, kontrastreiche Konturen, wenige große deutsche Beschriftungen. Auf 360 Pixel Breite müssen die Hauptbeziehungen erkennbar sein. Keine Aufgaben, Musterlösungen, Erfolgsaussagen, Prüfungsbewertung, technischen IDs, Logos oder Wasserzeichen. Kein dekorativer Inhalt ohne Bezug zur Kernidee.'
prompts = [
    {'goalId': author.IDS[0], 'scopeStatus': 'structure-only proposal; replication must be preserved through the existing separate goal',
     'motif': 'Two complementary DNA backbones and one enlarged nucleotide; base order as information.',
     'promptDe': common + ' Zeige ein vereinfachtes DNA-Doppelstrangmodell mit Zucker-Phosphat-Rückgraten außen und großen komplementären Basenpaaren innen. A–T und G–C müssen korrekt sein, die Stränge entgegengesetzt orientiert. Ein kleines, klar verbundenes Detail zeigt ein Nukleotid aus Zucker, Phosphat und Base; nur diese drei Wörter und „Basenfolge“ als kurze Beschriftungen. Die Reihenfolge der Basen ist sichtbar veränderlich. Keine Replikationsgabel, Tochter-DNA, RNA, Proteine oder Enzyme.',
     'sourceBasis': 'Official HE Q1.1 p.38 Watson-Crick/Nukleotide; live BY B9 3.1 DNA structure/information store.',
     'altTextCandidateDe': 'Vereinfachtes DNA-Modell mit zwei entgegengesetzt orientierten Zucker-Phosphat-Rückgraten und komplementären Basenpaaren; ein vergrößertes Nukleotid zeigt Zucker, Phosphat und Base.'},
    {'goalId': author.IDS[1], 'scopeStatus': 'integrated current-text proposal; prior split dissent remains unresolved',
     'motif': 'Connected transcription and translation with separate molecular roles.',
     'promptDe': common + ' Zeige den verbundenen Informationsfluss einer vereinfachten eukaryotischen Zelle: im klar umrissenen Zellkern ein DNA-Doppelstrang und daraus entstehende einzelne mRNA; die mRNA verlässt den Kern und liegt anschließend an einem Ribosom im Cytoplasma. Eine als tRNA erkennbare kleine Transportform bringt genau eine Aminosäure zur wachsenden Polypeptidkette am Ribosom. Zwei klar getrennte Pfeile mit „Transkription“ und „Translation“. Kurze Labels „DNA“, „mRNA“, „tRNA“, „Ribosom“. Keine vollständige DNA-/RNA-Sequenz oder gelöste Codon-Aufgabe, keine Erfolgsquote, keine Behauptung zur Proteinmenge. DNA verbleibt im Kern; Translation liegt außerhalb. Das Bild zeigt nur ein vereinfachtes Genmodell, keine RNA-Prozessierung.',
     'sourceBasis': 'Official HE Q1.1 p.38 protein biosynthesis/mRNA/ribosome/tRNA; no claim to complete BY trait-role coverage.',
     'altTextCandidateDe': 'Vereinfachtes eukaryotisches Modell: Transkription der DNA im Zellkern erzeugt mRNA; nach Verlassen des Kerns dient sie am Ribosom mit tRNA zur Bildung einer Polypeptidkette.'},
    {'goalId': author.IDS[3], 'scopeStatus': 'retained transcription-factor atom only; methylation companion required',
     'motif': 'Factor binding at a regulatory region with one activation and one repression context.',
     'promptDe': common + ' Zeige zwei große, klar getrennte eukaryotische Genmodelle. Links bindet ein aktivierender Transkriptionsfaktor an einen regulatorischen DNA-Bereich, ein Pfeil deutet geförderte Transkription an. Rechts bindet ein hemmender Transkriptionsfaktor in einem anderen ausdrücklich als Beispiel bezeichneten Kontext; die Transkription ist gedämpft dargestellt. Keine DNA-Methylierungsmarken und keine Histone. Die DNA bleibt doppelsträngig, die entstehende RNA einzelsträngig. Große kurze Labels „aktivierend“, „hemmend“, „Transkription“. Keine universelle Aussage, dass jede Faktorbindung aktiviert oder jede Hemmung vollständiges Abschalten bedeutet.',
     'sourceBasis': 'Official HE Q1.2 p.39 transcription factors; each supplied factor context governs its effect.',
     'altTextCandidateDe': 'Zwei vereinfachte Genmodelle zeigen die Bindung eines aktivierenden beziehungsweise hemmenden Transkriptionsfaktors an regulatorische DNA und eine im jeweiligen Beispiel erhöhte beziehungsweise gedämpfte Transkription.'},
    {'goalId': author.IDS[4], 'scopeStatus': 'retained bacterial-structure atom only; binary-fission companion required',
     'motif': 'Bacterial cell interior with chromosome and optional plasmid, no nucleus.',
     'promptDe': common + ' Zeige ein großes, vereinfachtes Bakterium im Schnitt: Zellmembran innen, im dargestellten Beispiel Zellwand außen, Ribosomen als kleine einheitliche Partikel und chromosomale DNA als ungeordnete Schleife im Zellraum. Keine Membran um die DNA, kein Zellkern, keine Mitochondrien. Ein klar separierter kleiner DNA-Ring ist mit „Plasmid (wenn vorhanden)“ beschriftet. Weitere kurze Labels „Zellmembran“, „DNA“, „Ribosomen“. Nutze kurze eindeutige Zuordnungslinien ohne Kreuzungen. Keine Teilung, Wachstumskurve, Virusform, Transformationspfeile oder behauptete Proteinproduktion.',
     'sourceBasis': 'Official HE Q1.2 p.39 bacterial structure schema, LK; optional plasmid context is bounded, not a universal feature.',
     'altTextCandidateDe': 'Schema eines Bakteriums ohne Zellkern mit Zellmembran, im gezeigten Beispiel einer Zellwand, Ribosomen und chromosomaler DNA im Zellraum; zusätzlich ist ein nur gegebenenfalls vorhandenes Plasmid dargestellt.'},
    {'goalId': author.IDS[5], 'scopeStatus': 'explanation and supplied-gel analysis, no practical-performance claim',
     'motif': 'Negative wells above, positive side below, smaller linear fragments farther.',
     'promptDe': common + ' Zeige ein schematisches DNA-Gel mit drei Spuren, klaren Taschen oben an der mit Minus bezeichneten Seite und Plus unten. Ein großer Pfeil „Wanderung“ weist nach unten. Die Markerspur zeigt mehrere schmale horizontale Banden; größere lineare Fragmente liegen näher an den Taschen, kleinere weiter unten. Zwei Probenspuren zeigen deutlich vergleichbare Bandenhöhen. Kurze große Labels „Größenmarker“, „Probe“, „größer“ nahe oben und „kleiner“ nahe unten. Keine Genotyp-, Identitäts-, Krankheits- oder Sequenzgleichheitsbehauptung. Keine Labor-Durchführungsschritte, keine gelöste numerische Markeraufgabe, keine kreisförmigen Plasmidproben.',
     'sourceBasis': 'Official HE Q1.2 p.39 gel electrophoresis; linear-fragment model only.',
     'altTextCandidateDe': 'Schematisches Gel mit Größenmarker und zwei Proben: DNA wandert von den Taschen an der negativen Seite zur positiven Seite; kleinere lineare Fragmente liegen weiter von den Taschen entfernt.'},
]
companion_prompts = [
    {'candidateKey': 'dna-methylation-eukaryotes', 'motif': 'Same base order, promoter marks differ with bounded expression context.',
     'promptDe': common + ' Zwei Modelle desselben eukaryotischen Gens mit identischer Basenfolge: eine Promotorregion mit wenigen Methylierungsmarken und eine mit mehr Marken. In diesem ausdrücklich als Beispiel markierten Kontext zeigen wenige Marken stärkere und mehr Marken schwächere Transkription. Große Labels „gleiche Basenfolge“, „Methylierung“, „Transkription“. Keine universelle An/Aus-Regel, keine Änderung der DNA-Sequenz, keine Histon-Acetylierung, keine generationsübergreifende Vererbung.'},
    {'candidateKey': 'bacterial-binary-fission', 'motif': 'Chromosomal copy, partition, constriction and two daughter cells.',
     'promptDe': common + ' Zeige vier gut getrennte, links nach rechts verbundene Stadien eines plasmidfreien Bakteriums: eine chromosomale DNA-Schleife; zwei kopierte Schleifen; räumliche Verteilung mit Einschnürung; zwei getrennte Bakterien mit je einer Schleife. Keine Zellkernmembran, keine mitotischen Spindeln oder eukaryotischen Chromosomen. Große kurze Labels „DNA-Kopie“, „Verteilung“, „Zweiteilung“. Keine unbeschränkte Wachstumskurve oder universelle Zeitangabe.'},
]
author.save('image-prompts.candidates.json', {
    'schemaVersion': 1, 'candidateStatus': 'prompt_only_no_generation',
    'modelFamily': 'GPT-6', 'exactModelIdentifier': None,
    'prompts': prompts, 'companionPrompts': companion_prompts,
    'retainedExistingCandidate': {
        'goalId': author.IDS[2], 'action': 'keep_existing_v2_candidate',
        'nativePath': 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-01/biologie-q1-ffef-candidate-v2/visualization/genmutationen-candidate.png',
        'reason': 'Actual native/360/680 inspection found no blocking content or readability defect. No new generation is justified.',
    },
    'generationPrerequisite': 'Stabilise each proposed goal scope and its preservation/source decisions first; prompts alone are not assets or V QA.'
})
print(json.dumps({'companions': len(companions), 'companionFreshCases': 4, 'originalGoalPrompts': len(prompts), 'noImageGeneration': True}))
