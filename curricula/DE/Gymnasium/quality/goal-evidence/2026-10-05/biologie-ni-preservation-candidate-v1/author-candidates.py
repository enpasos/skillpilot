#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare inactive NI source-preservation candidates; never write active inputs."""
import copy
import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
NOW = datetime.now(timezone.utc).isoformat()
NAMESPACE = uuid.UUID('fd8eb76f-7f91-4e69-8fb9-7a1647d4b0bb')
BIO = '08a43a1b-d97e-522c-9dfa-c950a493364e'
SOURCE = 'curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_BIOLOGIE_SEKI_KC2015.source-extraction.json'
MAP = 'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.m7-e3-recombination-20261001-v2.review.json'
LANDSCAPE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
SOURCE_VIEW = 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json'
PDF = 'curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf'
G9 = '9f73b963-5fac-5a90-a993-d7b7c0cc8526'
ORIENTATION = '2d451684-6e53-565e-a987-f362da919d2c'
MEIOSIS = '1d2b1038-dcd5-529a-b085-9e14f1d58c76'
CELL_COMPARISON = 'b1dff57f-329e-5264-b2b9-2db71a0b2172'
VAR_SEED = f'biology:{BIO}:intraspecific-observable-variation-across-generations'
GENE_SEED = f'biology:{BIO}:nonmolecular-chromosomal-gene-product-trait-model'
VAR = str(uuid.uuid5(NAMESPACE, VAR_SEED))
GENE = str(uuid.uuid5(NAMESPACE, GENE_SEED))

def read(path):
    return json.loads((ROOT / path).read_text())

def sha(path):
    return 'sha256:' + hashlib.sha256((ROOT / path).read_bytes()).hexdigest()

def write(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

def expectation(key, de, en, performance_de, performance_en):
    return dict(id=key, essentialUnderstandingDe=de, essentialUnderstandingEn=en,
                observablePerformanceDe=performance_de, observablePerformanceEn=performance_en)

def case(key, de, en, expected_de, expected_en, focus_de, focus_en):
    return dict(id=key, taskDemandDe=de, taskDemandEn=en, expectedPerformanceDe=expected_de,
                expectedPerformanceEn=expected_en, understandingFocusDe=focus_de, understandingFocusEn=focus_en)

def axis(key, de, en):
    return dict(id=key, textDe=de, textEn=en)

def profile(archetype, expectations, axes, cases):
    return dict(archetype=archetype, expectations=expectations,
                coverageExpectations=dict(requiredExpectationIds=[e['id'] for e in expectations],
                    alternativeExpectationGroups=[], minimumIndependentDemonstrations=2,
                    freshVariationRequired=True, independentTransferRequired=True),
                variationAxes=axes, applicationCaseBriefs=cases)

landscape = read(LANDSCAPE)
goals = {g['id']: g for g in landscape['goals']}
extraction = read(SOURCE)
source_goals = {g['id']: g for g in extraction['sourceGoals']}
mapping = read(MAP)
source_view = read(SOURCE_VIEW)
source_ids = {
    'individual': 'ni-biology-seki-kc2015-fw7-001-32911481',
    'offspring': 'ni-biology-seki-kc2015-fw7-002-48e75da8',
    'origin': 'ni-biology-seki-kc2015-fw7-003-b3921cb7',
    'evolution': 'ni-biology-seki-kc2015-fw7-012-8ed51e46',
    'gene': 'ni-biology-seki-kc2015-fw6-010-8fb1979a',
    'product': 'ni-biology-seki-kc2015-fw6-011-27110a19',
    'invented-replication': 'ni-biology-seki-kc2015-fw6-003-fd1495c5',
    'mitosis': 'ni-biology-seki-kc2015-fw6-004-f11cdf34',
}
before = dict(schemaVersion=1, capturedAt=NOW,
    inputFiles=[dict(path=p, sha256=sha(p)) for p in [LANDSCAPE, SOURCE, MAP, SOURCE_VIEW, PDF]],
    sourceGoals=[source_goals[i] for i in source_ids.values()],
    mappingRows=[r for r in mapping['mappings'] if r['legacyGoalId'] in source_ids.values()],
    mappingDecisions=[r for r in mapping['decisions'] if r['sourceGoalId'] in source_ids.values()],
    currentCanonicalGoals=[goals[g] for g in [G9, MEIOSIS, ORIENTATION,
        'b530a382-2786-5794-8821-3e01a62d88fd', 'b4176012-f93a-5dd2-84b3-edd6a9932367']],
    inputClaim='Exact current selected rows only; unchanged targets and historical decisions are not re-reviewed.')
write('current-bindings.snapshot.json', before)

var_goal = dict(id=VAR, shortKey='canonical_biology_observable_intraspecific_variation',
    title='Unterschiede innerhalb einer Art und zwischen Generationen beschreiben',
    titleEn='Describe differences within a species and across generations',
    description='Die lernende Person kann an Beispielen beschreiben, wie sich Individuen derselben Art unterscheiden und wie solche Unterschiede in neuen Generationen ohne vorgegebenes Entwicklungsziel auftreten.',
    descriptionEn='The learner can use examples to describe how individuals of the same species differ and how such differences occur in new generations without a predetermined developmental aim.',
    weight=1, tags=['GK', 'LK', 'canonical', 'SekI'], contains=[], requires=[ORIENTATION],
    applicability=dict(jurisdiction=['DE-NI']), type='atomic',
    dimensionTags=dict(framework='canonical-gymnasium-biology', demandLevel='AB2',
        processCompetencies=[], guidingIdeas=['BIO_ENTWICKLUNG'], phase='GLOBAL', area='Variation',
        topicCode='CANONICAL.BIOLOGY.OBSERVABLE_INTRASPECIFIC_VARIATION'),
    extendedData=dict(applicabilityMappingInheritance='boundary', provenance=dict(
        sourceLandscapeId=extraction['sourceLandscapeId'], sourceLandscapeTitle=extraction['title'],
        sourceGoalId=source_ids['individual'], supportingSourceGoalIds=[source_ids['offspring']])))
gene_goal = dict(id=GENE, shortKey='canonical_biology_nonmolecular_gene_product_trait_relation',
    title='Gen, Genprodukt und Merkmal im einfachen Modell verknüpfen',
    titleEn='Connect gene, gene product and trait in a simple model',
    description='Die lernende Person kann in einem einfachen Modell erklären, wie Gene als Chromosomenabschnitte Bauanleitungen für Genprodukte enthalten und wie diese zur Ausprägung von Merkmalen beitragen.',
    descriptionEn='The learner can use a simple model to explain how genes as chromosome sections contain instructions for gene products and how these products contribute to the expression of traits.',
    weight=1, tags=['GK', 'LK', 'canonical', 'SekI'], contains=[], requires=[CELL_COMPARISON],
    applicability=dict(jurisdiction=['DE-NI']), type='atomic',
    dimensionTags=dict(framework='canonical-gymnasium-biology', demandLevel='AB2',
        processCompetencies=[], guidingIdeas=['BIO_INFORMATION_KOMMUNIKATION', 'BIO_STRUKTUR_FUNKTION'],
        phase='GLOBAL', area='Genetik', topicCode='CANONICAL.BIOLOGY.NONMOLECULAR_GENE_PRODUCT_TRAIT_RELATION'),
    extendedData=dict(applicabilityMappingInheritance='boundary', provenance=dict(
        sourceLandscapeId=extraction['sourceLandscapeId'], sourceLandscapeTitle=extraction['title'],
        sourceGoalId=source_ids['gene'], supportingSourceGoalIds=[source_ids['product']])) )
revised_9f = copy.deepcopy(goals[G9])
revised_9f['description'] = 'Die lernende Person kann erklären, wie Mutation und Rekombination genetische Variation hervorbringen und wie Selektion auf diese Variation wirkt.'
revised_9f['descriptionEn'] = 'The learner can explain how mutation and recombination generate genetic variation and how selection acts on that variation.'
revised_9f['requires'] = [MEIOSIS, ORIENTATION]
write('canonical.delta.candidates.json', dict(schemaVersion=1, candidateStatus='inactive_author_draft',
    authoredAt=NOW, ownGoalContentLicense='CC-BY-4.0', goalIdNamespace=str(NAMESPACE),
    stableIdProposals=[dict(goalId=VAR, seed=VAR_SEED), dict(goalId=GENE, seed=GENE_SEED)],
    newGoals=[var_goal, gene_goal],
    currentGoalDeltas=[dict(goalId=G9, before={k:goals[G9][k] for k in ['description','descriptionEn','requires']},
        after={k:revised_9f[k] for k in ['description','descriptionEn','requires']},
        reason='Correct variant origin versus selection and remove an unnecessary molecular-mutation prerequisite; neither class6 coverage nor current final D/A/P approval is asserted.')],
    parentContainsDeltas=[dict(goalId=parent, before=goals[parent]['contains'],
        after=goals[parent]['contains']+[child]) for parent,child in [
            ('b530a382-2786-5794-8821-3e01a62d88fd',VAR), ('b4176012-f93a-5dd2-84b3-edd6a9932367',GENE)]],
    independentAtomicityReviewRequired=True,
    applicabilityBoundaryReason='The existing compiler and source-index traversal respect this boundary on goal entries. Direct NI mappings remain usable; old broad ancestor mappings must not assert new all-state source authority. No broad parent boundary is added.',
    currentStrictClosuresClaimed=0))

var_profile = profile('concept', [
    expectation('individual-differences',
        'Individuen derselben Art können sich in ihren Merkmalen unterscheiden. Unterschiede innerhalb einer Art sind von Unterschieden zwischen Arten zu trennen.',
        'Individuals of the same species can differ in their traits. Differences within a species must be distinguished from differences between species.',
        'Die lernende Person beschreibt konkrete Unterschiede in einem neuen, als dieselbe Art ausgewiesenen Material und erklärt, warum diese Befunde zur innerartlichen Variation gehören.',
        'The learner describes concrete differences in fresh material explicitly identified as one species and explains why they are examples of intraspecific variation.'),
    expectation('undirected-generational-variation',
        'Auch Nachkommen derselben Art sind nicht alle gleich. Beobachtete Unterschiede in neuen Generationen sind kein Beleg für ein vorausgeplantes Ziel, und ein Einzelbeispiel erklärt weder seinen Erbmechanismus noch eine Änderung der Art.',
        'Offspring of the same species are not all identical. Differences observed in new generations do not establish a predetermined aim; a single example explains neither its inheritance mechanism nor a change of species.',
        'Die lernende Person vergleicht eine neue Eltern- und Nachkommengeneration anhand bereitgestellter Merkmale und formuliert eine eigene nichtzielgerichtete Erklärung des beobachteten Variationsphänomens.',
        'The learner compares a fresh parent and offspring generation using supplied traits and produces an independent explanation of the observed variation without a purposeful-development claim.')
], [axis('organism', 'Beispiele aus derselben Pflanzen- und derselben Tierart variieren.', 'Vary examples from one plant species and one animal species.'),
    axis('generation-and-traits', 'Einzeltiere, Merkmalsdaten und getrennte Eltern-/Nachkommengruppen verwenden.', 'Use individuals, trait data and separate parent/offspring groups.')], [
    case('fresh-bean-offspring',
        'Ein Material zeigt Pflanzen einer einzigen Bohnenart: Die beiden Elternpflanzen haben mittellange Hülsen. Ihre gleichzeitig unter denselben Bedingungen herangewachsenen Nachkommen haben verschieden lange Hülsen und unterschiedlich viele Samen. Beschreibe zwei Unterschiede innerhalb dieser Art. Formuliere eine kurze Erklärung, warum auch die neue Generation individuelle Unterschiede zeigt. Eine Person behauptet, die Nachkommen seien alle mit längeren Hülsen entstanden, weil die Art dieses Ziel erreichen wollte. Prüfe die Behauptung anhand der gegebenen Befunde. Gene, Vererbungsregeln und DNA werden nicht vorgegeben und nicht verlangt.',
        'Material shows plants of a single bean species. Both parent plants have medium-length pods. Their offspring, grown at the same time under the same conditions, have different pod lengths and different seed counts. Describe two differences within this species. Produce a short explanation of the individual differences in the new generation. Someone claims that all offspring developed longer pods because the species intended to reach this goal. Evaluate that claim using the supplied observations. Genes, inheritance rules and DNA are neither supplied nor required.',
        'Die lernende Person benennt die konkreten Hülsen- und Samenunterschiede, beschreibt die Nachkommen als unterschiedliche Individuen derselben Art und verweist auf die verschiedenen, nicht einheitlich verlängerten Hülsen. Die Variation tritt zwischen Individuen und Generationen auf; die Daten zeigen kein gewünschtes einheitliches Entwicklungsziel. Sie erfindet keine molekulare Mutationsursache und behauptet nicht, gleiche äußere Bedingungen bewiesen ausschließlich genetische Ursachen.',
        'The learner identifies the concrete pod-length and seed-count differences, describes the offspring as different individuals of one species and points to their varying, not uniformly increased pod lengths. Variation occurs between individuals and generations; the observations do not show a desired uniform developmental aim. No molecular mutation cause is invented, and identical external conditions are not presented as proof of exclusively genetic causes.',
        'Eigene Beschreibung und begründete Einordnung neuer Individuen- und Generationenbefunde.',
        'Independent description and reasoned interpretation of fresh individual and generational observations.'),
    case('fresh-snail-families',
        'Ein zweites Material zeigt ausdrücklich eine einzige Schneckenart. In drei Elterngruppen und ihren Nachkommengruppen kommen helle und dunkle sowie ungebänderte und gebänderte Gehäuse vor; jede Nachkommengruppe enthält mehrere unterschiedliche Formen. Eine neue Zeitreihe zeigt, dass die Formen schon vor einem Wechsel des Untergrunds vorhanden waren. Beschreibe das Variationsphänomen innerhalb einer Nachkommengruppe und zwischen den Generationen. Erkläre mit den Daten, warum die Gehäuseformen nicht erst planmäßig entstanden sein müssen, um zum neuen Untergrund zu passen. Eine genetische Erklärung, Verteilungsgesetze und Selektion sind nicht Teil des Auftrags.',
        'Fresh material explicitly shows one snail species. Three parent groups and their offspring groups contain light and dark as well as banded and unbanded shells; each offspring group contains several forms. A fresh timeline shows that these forms were present before the ground colour changed. Describe variation within an offspring group and across generations. Use the data to explain why the shell forms need not have arisen deliberately to match the new ground. A genetic mechanism, distribution laws and selection are outside this task.',
        'Die lernende Person nennt mehrere unterschiedliche Individuen derselben Art und erläutert, dass verschiedene Formen auch in den Nachkommengenerationen vorkommen. Da die Varianten schon vorher beobachtet wurden, ist ein auf den späteren Untergrund geplantes Entstehungsziel nicht belegt. Sie erklärt weder eine neue Art noch einen bestimmten Erbgang oder Mutationstyp aus dem Material.',
        'The learner identifies several differing individuals of the same species and explains that different forms also occur in the offspring generations. Because the variants were observed earlier, a developmental aim planned for the later ground colour is unsupported. The material is not used to infer a new species, a particular inheritance pattern or a mutation type.',
        'Frischer Transfer von Pflanzenmerkmalen auf beobachtbare Nachkommenvariation ohne molekulare Voraussetzungen.',
        'Fresh transfer from plant traits to observable offspring variation without molecular prerequisites.')
])
gene_profile = profile('representation', [
    expectation('chromosomal-instruction',
        'Gene sind Abschnitte von Chromosomen, die Informationen zum Aufbau von Genprodukten enthalten. Das Gen ist nicht selbst das Genprodukt und kein fertig vorliegendes sichtbares Merkmal.',
        'Genes are chromosome sections containing information for gene products. A gene is neither the gene product itself nor an already formed visible trait.',
        'Die lernende Person verbindet in einem neuen einfachen Modell einen markierten Chromosomenabschnitt mit einer Bauanleitung und dem zugehörigen Genprodukt; sie unterscheidet diese Rollen in einer eigenen beschrifteten Darstellung.',
        'The learner connects a marked chromosome section to instructions and the corresponding gene product in a fresh simple model, distinguishing these roles in an independently labelled representation.'),
    expectation('product-contributes-to-trait',
        'Genprodukte, häufig Enzyme, tragen durch ihre Funktion zur Merkmalsausprägung bei. Eine Modellkette Gen→Produkt→Merkmal ist keine Behauptung, dass jedes Merkmal genau ein Gen hat oder ausschließlich von Genen abhängt.',
        'Gene products, often enzymes, contribute to trait expression through their functions. A model chain gene→product→trait does not imply that each trait has exactly one gene or is determined solely by genes.',
        'Die lernende Person erzeugt aus gegebenen Funktionsinformationen eine positive kausale Erklärung eines Merkmals und prüft eine frische Störung im Modell, ohne DNA-Sequenzen, Transkription, Translation oder Proteinstrukturebenen zu ergänzen.',
        'The learner produces a positive causal explanation of a trait from supplied function information and interprets a fresh model disturbance without adding DNA sequences, transcription, translation or levels of protein structure.')
], [axis('product-function', 'Enzymwirkung in einem Pigmentmodell und Produktwirkung in einem zweiten Pflanzenmodell vergleichen.', 'Compare an enzyme in a pigment model with a product function in a second plant model.'),
    axis('model-and-intervention', 'Eine eigene Zusammenhangsskizze und eine neue begrenzte Modellstörung begründet auswerten.', 'Produce a relationship diagram and interpret a fresh bounded model intervention.')], [
    case('pigment-model',
        'Ein einfaches Pflanzenmodell liefert drei Angaben: Der auf einem Chromosom markierte Abschnitt G enthält die Bauanleitung für Enzym E. E ermöglicht die Bildung eines violetten Farbstoffs. Unter den ausdrücklich gleichen übrigen Bedingungen sind Blüten mit funktionierendem E violett; ohne funktionierendes E bleiben sie farblos. Zeichne und beschrifte den Zusammenhang vom Chromosomenabschnitt zur Blütenfarbe. Erkläre die beiden gegebenen Blütenbefunde. Beurteile anschließend, ob das Modell beweist, dass jede Blütenfarbe in der Wirklichkeit nur ein Gen benötigt. Die Symbole G und E sind Modelllegenden; DNA, RNA, Proteinsynthese und Enzymbindungsmechanismen werden nicht verlangt.',
        'A simple plant model supplies three facts: a marked chromosome section G contains instructions for enzyme E; E enables a violet pigment to form; with other conditions explicitly held equal, flowers with functioning E are violet and those without functioning E remain colourless. Draw and label the relationship from the chromosome section to flower colour. Explain both supplied observations. Then consider whether this model establishes that every real flower colour requires only one gene. G and E are supplied model labels; DNA, RNA, protein synthesis and enzyme-binding mechanisms are not required.',
        'Die eigene Skizze trennt Chromosomenabschnitt/Gen als Bauanleitung, Enzym als Genprodukt und Blütenfarbe als resultierenden Merkmalbefund. Die Erklärung verknüpft E mit der gegebenen Farbstoffbildung; fehlende E-Funktion unterbricht diese Modellwirkung. Die lernende Person begrenzt die Aussage auf das bereitgestellte vereinfachte Modell und folgert daraus kein allgemeines Ein-Gen-ein-Merkmal-Gesetz.',
        'The diagram distinguishes the chromosome section/gene as instructions, the enzyme as a gene product and flower colour as the observed trait. The explanation links E to the supplied pigment formation; absent E function interrupts this model relationship. The learner limits the conclusion to this simplified model and does not infer a universal one-gene-one-trait rule.',
        'Positive Erzeugung eines einfachen Genwirkungsschemas mit tatsächlicher Funktionsbegründung.',
        'Positive construction of a simple gene-action model with an actual functional explanation.'),
    case('fresh-pigment-and-resource-model',
        'Ein neues Modell einer zweiten Pflanzenart benennt einen Chromosomenabschnitt R und ein Produkt P, das die Einlagerung eines roten Farbstoffs in Früchte ermöglicht. Drei gleich alte Modellpflanzen haben laut Material dieselbe R-Bauanleitung. Pflanze A hat funktionierendes P und genügend Farbstoffvorstufe: rote Früchte. B hat laut gegebener Funktionsprüfung kein wirksames P, trotz vorhandener Vorstufe: farblose Früchte. C hat funktionierendes P, aber laut Versuchsangabe keine verfügbare Vorstufe: ebenfalls farblose Früchte. Entwickle eine eigene Zusammenhangserklärung für alle drei Befunde. Erkläre, warum gleiche Bauanleitungen allein hier keine gleiche sichtbare Merkmalsausprägung garantieren. Bestimmte Mutationen oder Genregulation sollen nicht aus den Daten erschlossen werden.',
        'A fresh model of a second plant species names chromosome section R and product P, which enables a red pigment to accumulate in fruits. Three model plants of equal age have the same R instructions according to the material. Plant A has functioning P and enough pigment precursor: red fruits. B has no active P according to a supplied function test, despite available precursor: colourless fruits. C has functioning P but no available precursor according to the experiment: also colourless fruits. Construct a relationship explanation for all three observations. Explain why identical instructions alone do not guarantee identical visible traits here. No particular mutations or gene-regulation mechanism should be inferred.',
        'Die lernende Person erklärt A über die gegebene Verbindung R→P-Funktion→Farbstoffeinlagerung→rote Frucht; in B fehlt die Produktfunktion, in C eine gegebene weitere notwendige Bedingung. Sie trennt Genprodukt, Funktion und Merkmal und begründet, warum die Bauanleitung nicht allein den sichtbaren Befund bestimmt. Aus den bereitgestellten Funktionstests wird keine ungenannte DNA-Veränderung erfunden.',
        'The learner explains A through the supplied chain R→P function→pigment accumulation→red fruit; B lacks product function and C lacks a further necessary supplied condition. Instructions, product, function and trait are distinguished, explaining why instructions alone do not determine the visible outcome. No unreported DNA change is invented from the function tests.',
        'Unabhängiger Transfer auf eine neue Modellstörung und eine zweite notwendige Bedingung.',
        'Independent transfer to a fresh model disturbance and a second necessary condition.')
])
evolution_profile = profile('concept', [
    expectation('origin-versus-combination',
        'Eine Mutation kann eine neue erbliche Variante erzeugen; Rekombination erzeugt neue Zusammenstellungen vorhandener Erbanlagen. Beides ist von der Wirkung der Selektion auf bereits vorhandene Variation zu trennen.',
        'Mutation can produce a new heritable variant; recombination produces new combinations of existing inherited factors. Both must be distinguished from selection acting on existing variation.',
        'Die lernende Person erklärt aus ausdrücklich gegebenen nichtmolekularen Modellereignissen, was neu entstanden und was nur neu kombiniert wurde.',
        'The learner explains from explicitly supplied nonmolecular model events what arose as a new variant and what was only recombined.'),
    expectation('selection-and-generations',
        'Erbliche Unterschiede können sich über verschiedene Überlebens- und Fortpflanzungserfolge in einer Population unterschiedlich verbreiten. Selektion erzeugt nicht die für einen Bedarf passenden Varianten und wirkt abhängig von den Umweltbedingungen.',
        'Heritable differences can spread differently through different survival and reproductive success in a population. Selection does not create variants to fulfil a need, and its effect depends on environmental conditions.',
        'Die lernende Person erzeugt aus gegebenen Nachkommen- und Umweltinformationen eine eigene Erklärung eines Populationswandels und überträgt sie auf eine andere Umwelt, ohne unbelegte molekulare Mechanismen zu behaupten.',
        'The learner produces an independent explanation of population change from supplied offspring and environment data and transfers it to another environment without asserting unsupported molecular mechanisms.')
], [axis('variant-origin', 'Explizit angegebenes neues erbliches Ereignis und Neukombination vorhandener Erbanlagen unterscheiden.', 'Distinguish an explicitly supplied new heritable event from recombination of existing inherited factors.'),
    axis('environment-and-reproduction', 'Fortpflanzungserfolg in zwei neuen Umweltkontexten vergleichen.', 'Compare reproductive success in two fresh environmental contexts.')], [
    case('fresh-beetle-model',
        'Ein neues, ausdrücklich vereinfachtes Käfermodell nennt vererbbare helle/dunkle Färbung und glatte/gebänderte Flügeldecken. Alle vier Kombinationen sind schon vor einem Wechsel zu dunklem Boden belegt; Eltern mit unterschiedlichen Kombinationen erzeugen Nachkommen mit neuen Kombinationen derselben Merkmalsvarianten. Zusätzlich ist im Material ein tatsächlich neu entstandenes erbliches Variantenereignis dokumentiert: In einer Keimzelle entsteht die zuvor im Modell nicht vorhandene orange Färbungsvariante, die später vererbt wird. Auf dunklem Boden hinterlassen im gegebenen Vergleich die dunklen Käfer im Mittel vier und die hellen einen Nachkommen; keine weitere Ursache unterscheidet die Gruppen im Modell. Erkläre positiv, welche Rolle neue erbliche Variante, Neukombination und unterschiedlicher Fortpflanzungserfolg für die Veränderung der Population haben. Die orange Variante wird ausdrücklich nicht als automatisch vorteilhaft beschrieben. Molekulare Mutationstypen und DNA-Sequenzen werden nicht verlangt.',
        'A fresh explicitly simplified beetle model has inherited light/dark colour and smooth/banded wing covers. All four combinations existed before a change to dark ground; parents with different combinations produce offspring with new combinations of the same trait variants. The material also documents a genuinely new heritable-variant event: a gamete acquires an orange colour variant not previously present in the model, later inherited by offspring. On dark ground, dark beetles leave an average of four offspring and light beetles one in the supplied comparison; the model specifies no other difference between the groups. Explain positively the roles of the new heritable variant, recombination and different reproductive success in population change. Orange is explicitly not described as automatically advantageous. Molecular mutation types and DNA sequences are not required.',
        'Die lernende Person ordnet das ausdrücklich dokumentierte neue erbliche Variantenereignis einer Mutation und die neuen Färbungs-/Flügelkombinationen vorhandener Varianten der Rekombination zu. Den möglichen höheren Anteil dunkler Käfer in Folgegenerationen erklärt sie durch deren gegebenen höheren Fortpflanzungserfolg und Vererbung. Sie erzeugt keine Mutation aus bloß neuer Merkmalsbeobachtung, setzt Rekombination nicht mit neuen Erbanlagen gleich und behauptet keine bedarfsgerichtete oder automatisch vorteilhafte orange Mutation.',
        'The learner attributes the explicitly documented new heritable event to mutation and the new combinations of existing colour and wing-cover variants to recombination. A potential rise in dark beetles in later generations is explained through the supplied reproductive advantage and inheritance. A mutation is not inferred merely from a new observed trait, recombination is not confused with new inherited factors, and orange is not portrayed as purposeful or automatically advantageous.',
        'Positive Erklärung des Zusammenwirkens verschiedener Ursachen auf phänomenologischer Ebene.',
        'Positive explanation of the interplay of distinct causes at a descriptive level.'),
    case('fresh-plant-environment-change',
        'Ein neues Pflanzenmodell unterscheidet erbliche Merkmale kurze/lange Wurzeln und frühe/späte Blüte. Eine Kreuzung erzeugt neue Kombinationen ausschließlich der bereits vorhandenen Varianten; es ist ausdrücklich keine neue Variante entstanden. Im gegebenen trockenen Lebensraum tragen langwurzelige Pflanzen durchschnittlich sechs und kurzwurzelige zwei lebensfähige Samen zur Folgegeneration bei; im zweiten, nassen Lebensraum sind es zwei beziehungsweise sechs. Begründe den Unterschied zwischen Entstehung der Kombinationen und ihrer möglichen Verbreitung in beiden Umwelten. Ein zusätzliches Material dokumentiert ein neues erbliches Variantenereignis bei der Blütenform, dessen Fortpflanzungserfolg noch nicht gemessen wurde. Erkläre, welche Aussage über seinen Vorteil offenbleibt. Die verschiedenen Samenbeiträge und ihre Vererbbarkeit sind gegebene Modellinformationen; molekulare Abläufe werden nicht verlangt.',
        'A fresh plant model distinguishes inherited short/long roots and early/late flowering. A cross produces new combinations solely of existing variants; no new variant arose, as explicitly stated. In the supplied dry habitat, long-rooted plants contribute an average of six and short-rooted plants two viable seeds to the next generation; in a second wet habitat they contribute two and six respectively. Explain the distinction between the origin of combinations and their possible spread in both environments. Additional material documents a new heritable flower-form variant whose reproductive success has not yet been measured. Explain what conclusion about its advantage remains open. Seed contributions and inheritance are supplied model facts; molecular processes are not required.',
        'Die lernende Person erklärt die Kreuzungsbefunde als Rekombination vorhandener Varianten und trennt dies vom neuen erblichen Variantenereignis. Aus den verschiedenen Samenbeiträgen begründet sie eine mögliche Zunahme langwurzeliger Pflanzen im trockenen und kurz-wurzeliger Pflanzen im nassen Modelllebensraum. Die Unterschiede der Umwelt verändern die Selektionswirkung; sie erzeugen im Material nicht erst passende Varianten. Für die neue Blütenform bleibt ein Fortpflanzungsvorteil mangels Daten unbewiesen.',
        'The learner explains the cross as recombination of existing variants, distinguishing it from the new heritable event. Different seed contributions justify a possible increase in long-rooted plants in the dry model habitat and short-rooted plants in the wet habitat. Environment changes the effect of selection; in this material it does not create the required variants. A reproductive advantage for the new flower form remains unproven because data are missing.',
        'Frischer unabhängiger Transfer auf umgekehrte Umweltwirkung und eine bewusst offene Vorteilsaussage.',
        'Fresh independent transfer to reversed environmental effects and a deliberately unresolved advantage claim.')
])
profiles = [
    (VAR,var_profile,'Necessary class6 observable variation competence; no molecular or meiosis prerequisite.'),
    (GENE,gene_profile,'Necessary bounded class10 gene-product-trait model; source postpones molecular realization to SekII.'),
    (G9,evolution_profile,'Corrected class10 variant-origin/selection concept; existing ID retained, source-specific scope and independent review still required.'),
]
write('positive-evidence.candidates.json',dict(schemaVersion=1,
    authoringContract='positive-understanding-evidence-candidates-v1',
    reviewId='biologie-ni-preservation-candidate-20261005-v1', reviewedAt=NOW,
    reviewer='codex-ni-source-preservation-author', goals=[dict(goalId=i,reason=r,
        evidenceLevel='E1',maximumClaimScope='G1',dissent=['Inactive author candidate; independent current-source D/P/A/M/V review remains required.'],profile=p) for i,p,r in profiles]))

desired = {
    'individual': ([VAR],6,89,'beschreiben Individualität und das Phänomen der Variation innerhalb einer Art.'),
    'offspring': ([VAR],6,89,'erläutern, dass Individuen einer Art jeweils von Generation zu Generation ungerichtet variieren.'),
    'origin': ([G9],10,89,'erklären Variabilität durch Mutation – ohne molekulargenetische Betrachtung – und durch Rekombination.'),
    'evolution': ([G9],10,90,'erklären Evolutionsprozesse durch das Zusammenspiel von Mutation, Rekombination und Selektion.'),
    'gene': ([GENE],10,88,'beschreiben Gene als Chromosomenabschnitte, die Bauanleitungen für Genprodukte, häufig Enzyme, enthalten.'),
    'product': ([GENE],10,88,'beschreiben – ohne molekulargenetische Aspekte – den Zusammenhang von Genen, Genprodukten und der Ausprägung von Merkmalen.'),
}
source_deltas=[]
map_deltas=[]
for key,(targets,grade,page,source_text) in desired.items():
    sid=source_ids[key]
    old=source_goals[sid]
    new=copy.deepcopy(old)
    descriptions = {
        'individual': 'Die lernende Person kann Individualität und das Phänomen der Variation innerhalb einer Art beschreiben.',
        'offspring': 'Die lernende Person kann erläutern, dass Individuen einer Art von Generation zu Generation ungerichtet variieren.',
        'origin': 'Die lernende Person kann Variabilität durch Mutation ohne molekulargenetische Betrachtung und durch Rekombination erklären.',
        'evolution': 'Die lernende Person kann Evolutionsprozesse durch das Zusammenspiel von Mutation, Rekombination und Selektion erklären.',
        'gene': 'Die lernende Person kann Gene als Chromosomenabschnitte beschreiben, die Bauanleitungen für Genprodukte, häufig Enzyme, enthalten.',
        'product': 'Die lernende Person kann ohne molekulargenetische Aspekte den Zusammenhang von Genen, Genprodukten und Merkmalsausprägung beschreiben.',
    }
    new.update(title=source_text,sourceText=source_text,
        description=descriptions[key],
        sourceRef=f"Niedersachsen Kerncurriculum Naturwissenschaften Gymnasium Sekundarbereich I 2015, Biologie, {old['topicTitle']}, am Ende von Jahrgangsstufe {grade}, S. {page}.",
        sourceSpanText=f"{old['headingTitle']}, Tabellenspalte Ende Jg. {grade}, S. {page}, Source-Ziel {sid}")
    new['tags']=[t for t in old['tags'] if not t.startswith('grades:')]+[f'grades:{5 if grade==6 else 9}/{grade}']
    new['sourceSpan']['label']=f"{old['headingTitle']}: {source_text}"
    new['metadata'].update(grades='5/6' if grade==6 else '9/10',sourcePage=page,
        canonicalTargets=targets,matchType='partial',sourceTableColumn=f'Ende Jg. {grade}',
        sourceScopeRestriction='phenomenological/descriptive; no molecular genetics' if grade==10 else 'observable intra-species and generational variation; no causal genetics required')
    source_deltas.append(dict(sourceGoalId=sid,before=old,after=new,
        reason='Actual selected table cell and grade column checked; no full-document extraction approval.'))
    old_rows=[r for r in mapping['mappings'] if r['legacyGoalId']==sid]
    old_decision=next(r for r in mapping['decisions'] if r['sourceGoalId']==sid)
    new_decision=copy.deepcopy(old_decision)
    new_decision.update(canonicalGoalIds=targets,sourceSpan=new['sourceSpanText'],reviewedAt=NOW,
        reviewer='codex-ni-preservation-author-candidate',
        rationale='INACTIVE CANDIDATE: selected official table cell and grade scope bound to a bounded target. Partial means a source component; union of specified sibling source clauses supports the full proposed target. Independent adoption review required.',
        notes='No human approval; original mapping and extraction files stay unchanged. No assertion that removed broad or molecular target descriptions are required by this source cell.')
    map_deltas.append(dict(sourceGoalId=sid,beforeRows=old_rows,
        afterRows=[dict(legacyGoalId=sid,canonicalGoalId=t,matchType='partial',reviewDecisionId=sid) for t in targets],
        beforeDecision=old_decision,afterDecisionCandidate=new_decision))
write('source-extraction.delta.candidates.json',dict(schemaVersion=1,candidateStatus='inactive_author_draft',
    beforePath=SOURCE,beforeSha256=sha(SOURCE),
    proposedSuccessorPath=SOURCE.replace('.json','.m7-ni-preservation-20261005-v1.json'),
    sourceGoalDeltas=source_deltas,
    gradePolicy='Six inspected source cells only; do not replace every shared 5/6–9/10 tag across NI with one grade or normalize unrelated official material.',
    method='Own retained-PDF table text and actual p88/p89 image inspection, plus live official PDF content verification; no mechanical rebinding approval.',
    unchangedRecordsAreNotReapproved=True))
write('mapping.delta.candidates.json',dict(schemaVersion=1,candidateStatus='inactive_author_draft',
    beforePath=MAP,beforeSha256=sha(MAP),
    proposedSuccessorPath=MAP.replace('.m7-e3-recombination-20261001-v2.review.json','.m7-ni-preservation-20261005-v1.review.json'),
    proposedSourceExtractionSuccessorPath=SOURCE.replace('.json','.m7-ni-preservation-20261005-v1.json'),
    sourceGoalDeltas=map_deltas,
    adoptionStatus='No mapping successor is active or certified complete. Recompute counts only after separately deciding the coupled invented FW6-003 source atom.',
    coverageUnions=[dict(goalId=VAR,sourceGoalIds=[source_ids['individual'],source_ids['offspring']],
        scope='Ende Jg.6; observable individuality and nonpurposeful generational variation',
        excluded='Molecular mutation classification, meiosis, selection and class10 genetics'),
        dict(goalId=GENE,sourceGoalIds=[source_ids['gene'],source_ids['product']],
        scope='Ende Jg.10; chromosomal gene instructions and nonmolecular product/trait relation',
        excluded='DNA double-strand structure, replication, transcription/translation, protein structure and enzyme-binding mechanisms'),
        dict(goalId=G9,sourceGoalIds=[source_ids['origin'],source_ids['evolution']],
        scope='Ende Jg.10; nonmolecular mutation/recombination and selection interplay',
        excluded='Class6 variation, molecular point mutations, full theory comparison, speciation routines and three-selection-mode classification')],
    sameTargetSourceRowsOutsideThisPackage=[dict(goalId=t,mappingSourceGoalIds=[r['legacyGoalId'] for r in mapping['mappings'] if r['canonicalGoalId']==t and r['legacyGoalId'] not in {source_ids[k] for k in desired}]) for t in [G9,MEIOSIS]],
    currentStrictClosuresClaimed=0))

coupled_ids=[source_ids['invented-replication'],source_ids['mitosis']]
write('coupled-replication-source-finding.json',dict(schemaVersion=1,status='inactive_targeted_source_finding',
    inventedSourceAtom=dict(sourceGoalId=coupled_ids[0],before=source_goals[coupled_ids[0]],
        beforeMappings=[r for r in mapping['mappings'] if r['legacyGoalId']==coupled_ids[0]],
        evidence='p87 introductory discussion mentions continuity/DNA replication, then explicitly postpones DNA structure and identical replication to SekII. No table bullet prescribes molecular DNA replication in SekI.',
        proposedAction='Retire this synthetic source atom in a versioned extraction successor; preserve historical bytes/ID in an explicit retirement manifest. Remove its source-only mapping decision/rows from the matching mapping successor.',
        requiredIntentPreservedBy='Keep the actual p87 class10 mitosis/Erbgleichheit table bullet FW6-004; the retiring synthetic introductory atom is not a separate table requirement.'),
    mitosis=dict(sourceGoalId=coupled_ids[1],before=source_goals[coupled_ids[1]],
        beforeMappings=[r for r in mapping['mappings'] if r['legacyGoalId']==coupled_ids[1]],
        removeUnsupportedMolecularMappingTarget='e70d8a85-2dea-5165-919b-200fee9f4db4',
        proposedTargetComponent=MEIOSIS,
        requiredResidual='Actual requirement is to justify genetic identity of somatic cells through mitosis. Existing1d describes mitosis/meiosis/gamete formation and is only a partial component, not an independently reviewed proof of the complete justification demand. Likewise cell-cycle053 requires molecular e70 and is not a clean replacement. Do not certify full source closure merely from retained labels.'),
    requiresOwnTargetedAdoptionDecision=True,
    sixGoalQ1ClosuresClaimed=0,canonicalReplicatonGoalRemoved=False,
    sourceGoalCountImpactIfSyntheticAtomRetired=dict(before=len(extraction['sourceGoals']),after=len(extraction['sourceGoals'])-1),
    otherStatesAndTheirValidReplicationRequirementsUnaffected=True))

original_entries=source_view['rootNodes'][0]['children']
changed_source_ids={d['sourceGoalId'] for d in map_deltas}
after_rows=[r for r in mapping['mappings'] if r['legacyGoalId'] not in changed_source_ids]+[r for d in map_deltas for r in d['afterRows']]
original_view_ids={e['goalId'] for e in original_entries}
after_target_ids={r['canonicalGoalId'] for r in after_rows}
unsupported=sorted(original_view_ids-after_target_ids)
stage_deltas=[]
for path in ['curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-seki-biology.view.json',
             'curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-biology-gk.view.json']:
    view=read(path)
    stage_deltas.append(dict(path=path,beforeSha256=sha(path),explicitNewEntriesRequired=False,
        reason='Existing reviewed canonicalSubtree references to b530 foundations and b417 genetics will expose the new child only in scopes with genuine NI direct mappings; their new atomic boundaries prevent broad inherited source authority.',
        prerequisiteOnlyCaveat='A source atlas list of curriculum targets is not a runtime composition-view/frontier proof. Verify actual jurisdiction/stage/year-resolved projections before adoption.'))
def closure(gid, overlay):
    parents={i:[] for i in overlay}
    for g in overlay.values():
        for child in g.get('contains',[]): parents.setdefault(child,[]).append(g['id'])
    done=set()
    req=set()
    pending=[gid]
    while pending:
        current=pending.pop()
        if current in done: continue
        done.add(current)
        g=overlay[current]
        pending.extend(parents[current])
        for r in g.get('requires',[]):
            req.add(r)
            pending.append(r)
    req.discard(gid)
    return sorted(req)
overlay=copy.deepcopy(goals)
overlay[G9]=revised_9f
overlay[VAR]=var_goal
overlay[GENE]=gene_goal
overlay['b530a382-2786-5794-8821-3e01a62d88fd']['contains'].append(VAR)
overlay['b4176012-f93a-5dd2-84b3-edd6a9932367']['contains'].append(GENE)
write('view-frontier.delta.candidates.json',dict(schemaVersion=1,candidateStatus='inactive_author_draft',
    sourceViewPath=SOURCE_VIEW,beforeSha256=sha(SOURCE_VIEW),
    exactRemovedEntries=[dict(jsonPointer=f'/rootNodes/0/children/{i}',before=g,after=None) for i,g in enumerate(original_entries) if g.get('goalId') in unsupported],
    exactAdditions=[dict(kind='goalEntry',goalId=i,projectionRole='target') for i in [VAR,GENE]],
    sourceViewGoalSetImpact=dict(before=len(original_view_ids),candidateAfter=len(after_target_ids),
        removedIds=unsupported,addedIds=sorted(after_target_ids-original_view_ids),
        scope='Main six source-cell changes only, before the separately open synthetic-replication-source decision. All affected NI mapping targets are atoms, so this set comparison needs no cluster descendant expansion.'),
    regeneration='Regenerate the source view from the reviewed successor mapping; do not hand-remove selected rows while leaving unsupported source mappings active.',
    gradePlacements=[dict(goalId=VAR,target='DE-NI / SekI / end-class6',sourceGoalIds=[source_ids['individual'],source_ids['offspring']],
        requires=[ORIENTATION],notAClass10GeneticsPrerequisiteClaim=True),
        dict(goalId=GENE,target='DE-NI / SekI / end-class10',sourceGoalIds=[source_ids['gene'],source_ids['product']],requires=[CELL_COMPARISON]),
        dict(goalId=G9,target='DE-NI / SekI / end-class10',sourceGoalIds=[source_ids['origin'],source_ids['evolution']],requires=revised_9f['requires'])],
    nationalCompositionViewImpacts=stage_deltas,
    candidateInheritedAndTransitiveRequires={i:[dict(goalId=r,title=overlay[r]['title']) for r in closure(i,overlay)] for i in [VAR,GENE,G9]},
    directDependentContextImpacts=[dict(goalId=g['id'],title=g['title'],requires=g['requires']) for g in goals.values() if G9 in g.get('requires',[])],
    residualGaps=['NI source-view has no actual year-resolved runtime composition metadata; class6/class10 source cell tags alone do not prove year-frontier behavior.',
        'Inherited prerequisite reachability must be checked in the actual resolved runtime projection; current source view does not explicitly publish orientation.',
        'The coupled invented replication source atom and DNA e70 prerequisites on other existing NI targets remain separately open until their exact source/coverage preservation is reviewed.'],
    noRuntimeChanges=True,currentStrictClosuresClaimed=0))

write('semantic-memory.candidates.json',dict(schemaVersion=1,candidateStatus='inactive_author_draft',goals=[
    dict(goalId=VAR,semanticAtomicCandidate=True,atomicityReason='One observable variation concept, with individual and generational observations as two representations of that concept; no independent mechanism/selection routine.',memoryDecisionCandidate='no_memory_needed',memoryReason='The task uses provided observation data and an independent explanation. A factual terminology quota or compact recall item is not required.'),
    dict(goalId=GENE,semanticAtomicCandidate=True,atomicityReason='One causal relation from chromosomal instructions via a gene product to a trait; identifying model roles and interpreting a model disturbance assesses the same relation.',memoryDecisionCandidate='no_memory_needed',memoryReason='Provided model labels and functions support causal explanation; no genetic code, chemical formula or memorized sequence is required.'),
    dict(goalId=G9,semanticAtomicCandidate=True,atomicityReason='One model of variation origins versus its selective spread, assessed in coupled fresh population contexts. An independent review must resolve whether the integrated concept remains one assessable goal.',memoryDecisionCandidate='no_memory_needed',memoryReason='Supplied qualitative inheritance and reproductive data support causal reasoning; no standalone recall quota is required. Old generic no_memory_needed does not authorize the changed goal fingerprint.')],
    currentAorMApprovalClaimed=False,memoryCardsChanged=False,humanApprovalClaimed=False))

write('image-prompts.candidates.json',dict(schemaVersion=1,candidateStatus='prompts_only_no_generation',
    default=dict(fileFormat='PNG',aspectRatio='about 16:9',nativeSize='about1600x900 or close native generator size',
        style='Friendly, clear, abstract comic illustration matching current SkillPilot biology assets.',
        displayChecks=['Actual native PNG','360px image width','680px image width'],
        avoid=['photorealism','sterile technical restyling','programmatic SVG replacement','read-required small type','crowded tiny panels'],
        providerPreference='ChatGPT/Codex imagegen; Nano Banana Pro remains allowed without prior failed attempts'),
    goals=[dict(goalId=VAR,motif='Two clearly separated parent/offspring groups of one familiar snail species, offspring with different shell colours/banding; differences within a species, no progressive perfect endpoint.',
        prompt='Create one friendly abstract biology comic PNG in landscape about16:9. Show a small family group of garden snails and a clearly separated next-generation group. Every snail is recognizably the same species, but individuals vary in shell light/dark colouring and simple bands. Use only two short large labels Eltern and Nachkommen. No DNA, chromosomes, selection predators, hierarchy of better/worse forms or target perfection. Keep each group and shell variation recognizable at360px. A generation arrow indicates descent only, not a cause or directed improvement. No scientific classification labels are needed.'),
        dict(goalId=GENE,motif='A chromosome with one marked instruction region, a distinct friendly enzyme-product icon, and pigment-bearing plant trait; three roles plus a small model badge.',
        prompt='Create one friendly abstract clear comic biology PNG in landscape about16:9. Show one simple chromosome ribbon with a highlighted region, then a distinct rounded enzyme-product symbol, then a violet flower. A few large labelled arrows show Gen – Genprodukt – Merkmal as a simplified relationship. The chromosome region is an information/instruction region, not a physical fragment that leaves the chromosome and becomes a protein; do not show a chromosome turning into the enzyme. No DNA double helix, DNA sequences, mRNA, ribosomes or transcription/translation machinery. No one-gene-one-trait universal claim. Add a short large vereinfachtes Modell label. Three large elements with generous space, recognizable at360px, natural friendly colours and bold comic outlines.'),
        dict(goalId=G9,motif='Variation present before environmental filtering, a qualitative generation change from different offspring contributions, no direct need-to-mutation arrow.',
        prompt='Create one friendly abstract clear comic biology PNG in landscape about16:9. Show an initial mixed group of light and dark beetles of one species on a neutral background, followed by a dark-background group in a later generation with more dark beetles and some light beetles still present. Use at most two short large labels Variation and Folgegeneration. All initial variants visibly pre-exist the dark background. The generation arrow must not show light beetles turning dark; it represents descendants with different frequencies. No purposeful mutation, no DNA, no winner trophy, no extinction certainty, no unlabelled detailed graphs. Keep the core motif clear at360px. This image can illustrate variation and selection; separate fresh tasks must establish mutation/recombination understanding without treating the picture as their proof.')],
    imageDisposition='All three goals currently lack primary resourceLinks in the inspected snapshot. Prompt preparation is neither an image nor a V decision. Inspect actual generated PNG, exact provenance, source bindings and mobile/desktop views independently before import.'))

write('source-audit.receipt.json',dict(schemaVersion=1,authoredAt=NOW,author='codex-ni-source-preservation-author',
    modelFamily='GPT-6',exactModelIdentifier=None,status='inactive_candidate_preparation',
    officialSource=dict(url='https://cuvo.nibis.de/index.php?p=download&upload=18',retainedPdfPath=PDF,
        retainedSha256=sha(PDF),actualRetainedPdfPagesOneBased=[87,88,89,90],
        actualVisualTablePages=[88,89],actualIndependentLocalTextPath='/tmp/bio-ni-preservation-pages87-90.txt',
        liveOfficialContentRetrieved=True,liveOfficialDownloadBytesCompared=False,
        wholeOfficialPdfTextCommitted=False),
    independentEarlierFindingFiles=[
        'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-candidate-review-a/description-phase-a.receipt.json',
        'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-candidate-review-b/description-semantic-source.freeze.json'],
    existingTargetSearch=dict(scope='All363 current biology curricularAtomic goal titles/descriptions in the inspected landscape plus exact current dependency paths.',
        observableVariation='Existing species-diversity/extinction5f39, life-criteria55bd and diversity/succession02ca do not assess individual/offspring differences within the same species.',
        geneProductTrait='No current ordinary goal explicitly assesses the nonmolecular chromosome-gene→gene-product→trait relation. DNA0daa, protein28850, enzyme-catalysis0dbe and simple-dominant-recessive inheritanceb8fc do not substitute for that source competence.',
        class10Evolution='Existing9f is reused after causal/prerequisite correction rather than duplicating its mutation/recombination/selection concept.'),
    newGoalsCount=2,currentGoalCorrectionsCount=1,fullProfileCount=3,freshCasesCount=6,
    semanticKindAndAorMDecisionsNotActivated=True,
    currentCentralCompletionCountsChanged=False,humanApprovalClaimed=False,
    scopeLimits=['Actual source/context content was inspected, not only file hashes.',
        'This is author preparation informed by earlier independent findings, not a third independent final D review.',
        'Neither source-view membership nor candidate schema pass proves a usable current runtime frontier.',
        'Only NI direct source cells support the two new atoms. No other jurisdiction is implicitly licensed or source-approved.'],
    licensing=dict(ownGoalTextsProfilesAndDidacticPromptContent='CC-BY-4.0',authoringScriptAndDeveloperDocumentation='Apache-2.0',thirdPartyOfficialSources='Original rights retained; no relicensing or human/legal clearance claimed.')))

print(json.dumps(dict(outputDirectory=str(OUT.relative_to(ROOT)),newGoalIds=[VAR,GENE],
    existingRevisedGoalId=G9,currentStrictClosuresClaimed=0),ensure_ascii=False))
