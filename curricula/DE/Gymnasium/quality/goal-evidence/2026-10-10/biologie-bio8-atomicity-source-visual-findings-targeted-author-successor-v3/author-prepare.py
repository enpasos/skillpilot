# SPDX-License-Identifier: Apache-2.0
import copy, datetime, hashlib, json, pathlib, shutil, uuid

R = pathlib.Path('/home/enpasos/projects/skillpilot')
B = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
P = B / 'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
N = B / 'biologie-biotechnologie-evolution-eight-current353-source-raster-native-technical-preparation-20261010-v1'
A = B / 'biologie-biotechnologie-evolution-eight-whole-material-and-raster-author-candidate-v1'
V2 = B / 'biologie-biotechnologie-evolution-eight-medicine-transfer-targeted-author-successor-v2'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
S = '523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0'
D = 'd11b3b18-deec-5d1a-bff6-512cddf595a2'
H = '430b2b73-641a-5122-bb6d-162b0d1eaf2d'
Y = '4a8a6cec-a2cc-56fe-b3ab-7ca017f640cf'
PCR = 'a3f483ce-126e-595c-999c-aa4d95106221'
GEL = '8eb86a82-122d-5cae-8f80-bb2850b29c2f'
CLONE = '528a3cd3-4a4d-550d-939a-8dc8656446e4'
DNA = '0daa79f6-8f61-5506-98f9-65db83062ba8'
PROTEIN = '475eebb4-4eb0-524f-b1ec-4a672bf856d2'
MED = '27b22c33-908c-5fa8-9d9f-a08aff8da143'
RSTR = '73a3419c-09a9-5415-a3c6-d56a3cdf5a29'
EXPR = '374e6de5-0747-57cb-99e3-e50ccb371124'
CULT = '80235254-ca58-5ba0-9319-b842350d6eb2'
NEIGHBOR = 'a515e493-6f90-5371-9470-28a0cf50f087'

def read(p): return json.loads((R / p).read_text())
def ref(p):
    data = (R / p).read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def put(p, obj):
    f = R / P / p
    f.parent.mkdir(parents=True, exist_ok=True)
    assert not f.exists(), f
    f.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return ref(P / p)
def cp(src, dst):
    f = R / P / dst
    f.parent.mkdir(parents=True, exist_ok=True)
    assert not f.exists(), f
    shutil.copyfile(R / src, f)
    return ref(P / dst)

land = read(N / 'candidate/whole479-only-eight-author-deltas.inactive.json')
before = copy.deepcopy(land)
goals = {g['id']: g for g in land['goals']}
originals = copy.deepcopy(goals)
plan = {
    'role': 'author_not_independent_reviewer', 'createdAt': NOW,
    'basis': 'Actual whole goal/P products and AGENTS 7.1; separate assessable routines require substantive decomposition',
    'operations': [
        {'goalId': S, 'operation': 'retain stable ID as methods overview cluster, keep original three-method PNG; reuse existing PCR and gel, create restriction atom'},
        {'goalId': D, 'operation': 'retain stable ID as vector/host overview cluster, keep original PNG; reuse existing transfer/cloning528, create expression atom'},
        {'goalId': H, 'operation': 'retain stable ID for fossil hypothesis/chronological reconstruction; new distinct cultural-impact companion preserves second mandatory BY AND product'},
        {'goalId': Y, 'operation': 'targeted new AI raster distinguishes outside wall and inside membrane; whole goal and two biological cases exact'},
    ],
    'newGoalIds': [RSTR, EXPR, CULT], 'predictedWholeGoals': 482, 'predictedCurricularAtomic': 395,
    'sourceBoundaries': ['HE Q1.4 medicine optional LK content, no universal LK obligation', 'RP TF11 argument operator belongs to ethical partner products; theory-only edges removed', 'RP TF12 ancestry evidence is prerequisite support; existing missing SekI behavior product HOLD remains explicit', 'HE old gel→PCR mapping remains partial, proper gel companion retained'],
    'medicineV2': ref(V2 / 'author-medicine-transfer.final.entry.json'),
    'independentReview': 'PENDING', 'humanApproval': False, 'strictActiveGain': 0,
}
put('author-operation-plan.bounded-semantics.json', plan)
cp(N / 'candidate/whole479-only-eight-author-deltas.inactive.json', 'inputs/whole479-before.exact.json')
cp(N / 'neutral-current353-Bio8-native11.entry.json', 'inputs/neutral-current353-before.entry.exact.json')
cp(V2 / 'author-medicine-transfer.final.entry.json', 'inputs/medicine-v2.entry.exact.json')

# Overview clusters express grouping; no inherited generic prerequisite or self-requiring child.
goals[S].update(type='cluster', contains=[RSTR, PCR, GEL], requires=[], weight=3,
    description='Cluster für getrennte Kompetenzen zur sequenzspezifischen DNA-Spaltung, zur PCR und zur Gel-Auswertung.',
    descriptionEn='Cluster for separate competencies in sequence-specific DNA cleavage, PCR, and gel interpretation.')
goals[D].update(type='cluster', contains=[CLONE, EXPR], requires=[], weight=2,
    description='Cluster für getrennte Kompetenzen zum vektorvermittelten DNA-Transfer mit Klonierung und zur rekombinanten Proteinexpression.',
    descriptionEn='Cluster for separate competencies in vector-mediated DNA transfer and cloning, and recombinant protein expression.')
goals[H].update(title='Biologische Evolution des Menschen aus Fossilien rekonstruieren',
    titleEn='Reconstruct Biological Human Evolution from Fossils',
    description='Die lernende Person kann aus Merkmalen fossiler Funde begründete Hypothesen zur biologischen Evolution des modernen Menschen ableiten, um eine zeitliche Reihenfolge zu rekonstruieren und deren Aussagegrenzen zu erläutern.',
    descriptionEn='The learner can derive reasoned hypotheses about biological human evolution from fossil traits to reconstruct a chronology and explain its evidential limits.')
# Keep the previously correct aggregate illustration bytes; rebind goal text, no new V judgment.
goals[H]['resourceLinks'][0]['title'] = 'Visualisierung: ' + goals[H]['title']
goals[H]['resourceLinks'][0]['description'] = 'Beibehaltenes Überblicksbild mit Fossilmerkmalen, Zeitachse und kultureller Wissensweitergabe; Fossilrekonstruktion und kulturelle Umweltwirkung sind getrennte Lernziele.'
goals[Y]['resourceLinks'][0].update(
    description='Hefezellmodell mit getrennt markierter äußerer Zellwand und innerer Zellmembran; Knospung und Zuckerumsetzung zu CO₂ und Ethanol erklären die Nutzbarkeit.',
    altText='Drei Comicfelder zeigen eine Hefezelle mit außen liegender Zellwand, davon getrennt innen liegender Zellmembran und Zellkern, anschließend Knospung sowie Zuckerumsetzung zu CO₂ und Ethanol mit Teiglockerung.',
    provider='OpenAI / Codex built-in image_gen; targeted wall/membrane correction', reviewStatus='pilot')

def atom(template, id, key, title, title_en, de, en, requires, jurisdictions):
    g = copy.deepcopy(template)
    g.update(id=id, shortKey=key, title=title, titleEn=title_en, description=de, descriptionEn=en,
             contains=[], requires=requires, weight=1, type='atomic')
    g['applicability'] = {'jurisdiction': jurisdictions}
    g['extendedData'] = {'authorSuccessor': {'role': 'author_not_independent_reviewer', 'sourceOwnerGoalIds': [template['id']], 'createdAt': NOW, 'atomicityReview': 'PENDING', 'memoryReview': 'PENDING', 'humanApproval': False}}
    g['resourceLinks'] = [{
        'type': 'goal-visualization', 'resourceType': 'image', 'role': 'primary', 'skillpilotId': id,
        'title': 'Visualisierung: ' + title, 'url': f'/assets/goal-visualizations/biologie/{id}/{id}.png',
        'provider': 'OpenAI / Codex built-in image_gen', 'description': 'Comicartige didaktische Visualisierung: ' + title,
        'altText': de, 'lang': 'de', 'license': 'CC-BY-4.0', 'reviewStatus': 'pilot'}]
    return g

new = [
    atom(originals[S], RSTR, 'canonical_biology_sequence_specific_restriction',
        'Sequenzspezifische DNA-Spaltung erklären', 'Explain Sequence-Specific DNA Cleavage',
        'Die lernende Person kann erklären, wie ein Restriktionsenzym DNA an seiner Erkennungssequenz spaltet, und daraus die entstehenden Fragmente in einem gegebenen DNA-Modell begründet ableiten.',
        'The learner can explain how a restriction enzyme cleaves DNA at its recognition sequence and use this to infer the resulting fragments in a supplied DNA model.', [DNA], ['DE-BY', 'DE-HE']),
    atom(originals[D], EXPR, 'canonical_biology_recombinant_expression_compatibility',
        'Passende Bedingungen für rekombinante Proteinexpression erklären', 'Explain Compatible Conditions for Recombinant Protein Expression',
        'Die lernende Person kann an einem gegebenen Vektor-Wirt-Modell erklären, welche passenden Expressionssignale und Wirtsfunktionen zur Bildung des codierten Proteins nötig sind und weshalb die Anwesenheit der DNA allein diese Bildung nicht belegt.',
        'The learner can explain in a supplied vector-host model which compatible expression signals and host functions are needed to produce the encoded protein and why DNA presence alone does not establish that production.', [PROTEIN], ['DE-HE']),
    atom(originals[H], CULT, 'canonical_biology_cultural_evolution_current_environment',
        'Heutige Wirkungen kultureller Evolution analysieren', 'Analyze Present Effects of Cultural Evolution',
        'Die lernende Person kann an einem gegebenen Beispiel analysieren, wie sozial weitergegebenes Wissen und erlernte Verfahren das Leben heutiger Menschen und ihre Umwelt verändern, und kulturelle Weitergabe von genetischer Vererbung unterscheiden.',
        'The learner can analyze in a supplied example how socially transmitted knowledge and learned practices change the lives of humans today and their environment, distinguishing cultural transmission from genetic inheritance.', [], ['DE-BY', 'DE-RP', 'DE-SN', 'DE-TH']),
]
for g in new:
    land['goals'].append(g)
    goals[g['id']] = g
    put('candidate/individual/' + g['id'] + '.whole-goal.json', g)

parent = goals['96bdf495-2801-57e4-a0da-ce3bf91e402c']
parent['contains'] = [i for i in parent['contains'] if i not in [PCR, GEL, CLONE]]
goals['dc39fe71-10c0-591d-9491-44b53e38f5e1']['contains'].append(CULT)
# Each former overview dependency is replaced by the actual needed atomic content.
for g in land['goals']:
    old = list(g.get('requires', []))
    if S in old or D in old:
        after = []
        for i in old:
            if i == S:
                replacement = [RSTR, PCR, GEL] if g['id'] == '1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a' else [PCR] if g['id'] == NEIGHBOR else [PROTEIN] if g['id'] == '8f6933b1-6e02-5512-acf2-a90a7fb9cb75' else [DNA]
            elif i == D:
                replacement = [CLONE, EXPR] if g['id'] == '1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a' else [DNA] if g['id'] == CLONE else [PROTEIN] if g['id'] == 'ceb54223-197c-5289-a9c6-19358912e144' else [CLONE]
            else: replacement = [i]
            for x in replacement:
                if x not in after: after.append(x)
        g['requires'] = after

def cycle_check(key):
    done, visiting = set(), set()
    def visit(i):
        assert i not in visiting, (key, i, 'cycle')
        if i in done: return
        visiting.add(i)
        for d in goals[i].get(key, []):
            assert d in goals, (key, i, d)
            visit(d)
        visiting.remove(i); done.add(i)
    for i in goals: visit(i)
cycle_check('contains'); cycle_check('requires')
for g in land['goals']:
    if not g.get('contains'): continue
    def descendants(i):
        result = set()
        for c in goals[i].get('contains', []): result |= {c} | descendants(c)
        return result
    assert not set(g.get('requires', [])) & descendants(g['id']), (g['id'], 'self-requiring cluster')
changes = [{'goalId': i, 'before': originals[i], 'after': g, 'changedFields': [k for k in set(originals[i]) | set(g) if originals[i].get(k) != g.get(k)]} for i, g in goals.items() if i in originals and g != originals[i]]
put('candidate/whole482-substantive-three-successors.inactive.json', land)
put('checks/whole-goal-and-route-deltas.author.json', {'wholeBefore': 479, 'wholeAfter': len(land['goals']), 'atomicBefore': 394, 'atomicAfter': 395, 'newGoalIds': [RSTR, EXPR, CULT], 'deltas': changes, 'unchangedOldWholeGoalObjects': 479 - len(changes), 'containsCycles': [], 'requiresCycles': [], 'selfRequiringOverviewClusters': [], 'medicineGoalObjectExact': goals[MED] == originals[MED], 'noIndependentReview': True})

# Full author cases, responses, rubrics and fresh variations for each new product.
def case(id, mde, men, tde, ten, rde, ren, fde, fen, wde, wen):
    return dict(caseId=id, materialDe=mde, materialEn=men, taskDe=tde, taskEn=ten,
                workedResponseDe=rde, workedResponseEn=ren, freshTransferTaskDe=fde, freshTransferTaskEn=fen,
                workedFreshTransferDe=wde, workedFreshTransferEn=wen, materialStatus='constructed_synthetic_didactic_material', actualExperimentPerformed=False, actualLearnerPerformance=False)
cases = {}
cases[RSTR] = [
    case('restriction-single-site-linear', 'Ein lineares DNA-Modell ist 1000 bp lang. Enzym R erkennt genau eine Stelle bei Position 400 und schneidet dort vollständig beide Stränge. Die Längen dienen nur dem Modell.', 'A linear DNA model is 1000 bp long. Enzyme R recognizes one site at position 400 and completely cuts both strands there. Lengths are teaching-model data.', 'Erkläre die Sequenzabhängigkeit des Schnitts und leite die Fragmente begründet ab. Wird dabei DNA vervielfältigt?', 'Explain sequence-dependent cutting and infer the fragments with reasons. Is DNA amplified?', 'R bindet an eine passende Erkennungssequenz und trennt dort die DNA. Die Stücke sind 400 und 600 bp lang und ergeben zusammen die 1000 bp des Ausgangsstücks. Spaltung erzeugt Fragmente aus vorhandener DNA; sie erzeugt keine zusätzlichen Kopien.', 'R binds a compatible recognition sequence and separates the DNA there. Fragments are 400 and 600 bp and sum to the original 1000 bp. Cleavage splits existing DNA without producing additional copies.', 'Ein gleich langes Stück hat eine veränderte Erkennungssequenz, die R nicht erkennt. Was folgt?', 'An equally long fragment has an altered recognition sequence not recognized by R. What follows?', 'R schneidet dieses Stück an der genannten Stelle nicht; Länge allein bestimmt keine Erkennung. Unter den Modellangaben bleibt es 1000 bp lang.', 'R does not cut this site; length alone does not determine recognition. Given the model, the fragment remains 1000 bp.'),
    case('restriction-two-sites-linear', 'Lineare 1200-bp-DNA hat zwei passende R-Stellen bei Position 300 und 900. Der Schnitt ist vollständig; weitere R-Stellen gibt es nicht.', 'Linear 1200-bp DNA has compatible R sites at positions 300 and 900. Digestion is complete with no other R sites.', 'Leite Anzahl und Länge der Fragmente ab und erkläre, warum die Zahl der Schnittstellen zählt.', 'Infer number and length of fragments and explain why the number of cutting sites matters.', 'Zwei Schnitte an einer linearen DNA erzeugen drei Stücke: 300 bp bis zur ersten Stelle, 600 bp zwischen beiden Stellen und 300 bp bis zum Ende. Die gleiche Enzymart kann mehrere passende Sequenzen erkennen; sie wählt nicht zufällig eine Stelle.', 'Two cuts in linear DNA produce three fragments: 300 bp to the first site, 600 bp between sites, and 300 bp to the end. The same enzyme can recognize several compatible sequences instead of selecting a random position.', 'Jetzt ist nur die Stelle bei 900 so verändert, dass R sie nicht erkennt. Rekonstruiere das neue Ergebnis.', 'Only the site at 900 is now altered so that R does not recognize it. Reconstruct the new result.', 'Nur bei 300 wird geschnitten. Es entstehen 300 und 900 bp. Ein entfallener Erkennungsschnitt verbindet die zuvor getrennten letzten beiden Abschnitte im verbleibenden Stück.', 'Only position 300 is cut, yielding 300 and 900 bp. Losing one recognition site leaves the previously separate final segments joined in the remaining fragment.'),
]
cases[EXPR] = [
    case('expression-compatible-promoter-host', 'Zwei Wirte enthalten denselben intakten intronfreien Protein-Code in einem Plasmid. H1 erkennt dessen Promotor und besitzt passende Transkriptions- und Translationsfunktionen. H2 erkennt den Promotor nicht. Nur H1 zeigt im Modell mRNA und das codierte Protein. DNA-Erhaltung ist für beide belegt.', 'Two hosts contain the same intact intron-free protein code in a plasmid. H1 recognizes its promoter and has compatible transcription and translation functions. H2 does not recognize the promoter. Only H1 shows mRNA and encoded protein; both retain the DNA.', 'Erkläre den Unterschied der Proteinbildung mit dem Vektor-Wirt-Zusammenspiel. Was belegt vorhandene DNA allein?', 'Explain different protein production using vector-host compatibility. What does DNA presence alone establish?', 'Das funktionierende Signal erlaubt in H1 Transkription; passende Translation setzt die mRNA in das codierte Protein um. In H2 fehlt die Signal-Erkennung. DNA-Erhaltung zeigt nur die Anwesenheit des Konstrukts; sie beweist weder mRNA noch Proteinbildung.', 'A functional signal permits H1 transcription and compatible translation converts mRNA into the encoded protein. H2 lacks signal recognition. DNA retention shows construct presence without proving mRNA or protein production.', 'Ein neuer Promotor wird auch in H2 erkannt und mRNA ist nachgewiesen. Eine blockierte Translation ist aber belegt. Folgt Proteinbildung?', 'A replacement promoter is recognized in H2 and mRNA is demonstrated, but translation is blocked. Does protein production follow?', 'Nein. Die erste Lücke ist geschlossen, doch fehlende Translation verhindert die gegebene Proteinbildung. Passende Transkription allein reicht nicht.', 'No. The first gap is resolved, but absent translation prevents this protein production. Compatible transcription alone is insufficient.'),
    case('expression-intact-code-processing-limit', 'Wirt E erkennt den Promotor und transkribiert den intakten Code. Ein Proteinprodukt ist nachgewiesen; ob es für die vorgesehene Nutzung richtig gefaltet und verarbeitet ist, ist nicht untersucht. Wirt K trägt denselben Code ohne wirksames Expressionssignal und zeigt nur DNA.', 'Host E recognizes the promoter and transcribes the intact code. A protein product is demonstrated, but folding and processing required for intended use are untested. Host K contains the same code without an effective expression signal and shows DNA only.', 'Erkläre das belegte Expressionssystem und begrenze die Aussage, das fertige funktionsfähige Endprodukt sei schon gesichert.', 'Explain the demonstrated expression system and bound the claim that a functional final product is established.', 'E bietet passende Signale und Wirtsfunktionen bis zur beobachteten Proteinbildung. K bietet dies im Modell nicht. Die Proteinbildung ist in E belegt, die Funktionsfähigkeit des Nutzprodukts mangels Verarbeitungs-/Faltungsbeleg offen. Kopien der DNA beweisen sie nicht.', 'E supplies compatible signals and host functions through observed protein production, while K does not in the model. E protein production is demonstrated, but intended final functionality remains open without folding or processing evidence. DNA copies do not prove it.', 'Ein mutierter Code bleibt im Plasmid erhalten; laut Zusatzkarte endet seine Translation vorzeitig. Was ändert sich trotz passendem Promotor?', 'A mutated code is retained in the plasmid; an added card establishes premature translation termination. What changes despite a compatible promoter?', 'Transkription kann möglich bleiben, aber der intakte Protein-Code fehlt. Das vorgesehene vollständige Protein folgt nicht aus einem passenden Promotor und vorhandener DNA.', 'Transcription may remain possible, but intact protein coding information is lost. A compatible promoter and DNA presence do not establish the intended complete protein.'),
]
cases[CULT] = [
    case('culture-knowledge-agriculture-environment', 'Eine konstruierte heutige Gemeinde vermittelt bewährte Bewässerungsverfahren durch Unterricht und gemeinsame Praxis. Danach steigt im Modell die nutzbare Nahrungsmenge, zugleich ersetzt ein vergrößertes Feld einen Teil des Wildartenlebensraums. Keine Änderung eines vererbten DNA-Merkmals ist belegt.', 'A constructed contemporary community transmits irrigation practices through teaching and joint practice. Usable food increases in the model, while an expanded field replaces some wild-species habitat. No inherited DNA change is demonstrated.', 'Analysiere die Rolle kultureller Weitergabe für Menschen und Umwelt. Erkläre Nutzen, Umweltfolge und die Grenze zur genetischen Vererbung.', 'Analyze cultural transmission for humans and environment. Explain benefit, environmental consequence, and the distinction from genetic inheritance.', 'Lernen und soziale Weitergabe erhalten und verbreiten das Verfahren über einzelne Personen hinaus. Das Verfahren erhöht hier die Nahrungsversorgung, verändert aber die Landnutzung und verkleinert den genannten Lebensraum. Das sind kulturell vermittelte Handlungsfolgen, keine durch Lernen erzeugte vererbbare DNA-Änderung. Das Modell behauptet nicht, jede Landwirtschaft habe dieselbe Wirkung.', 'Learning and social transmission preserve and spread the practice beyond individuals. It improves food supply here but changes land use and reduces the specified habitat. These are culturally mediated consequences, not a heritable DNA change caused by learning. The model does not claim all agriculture has the same effect.', 'Eine neue erlernte Methode liefert die gleiche Nahrung auf kleinerer Fläche; die frei werdende Fläche wird nachweislich als Wildartenlebensraum wiederhergestellt. Wie ändert sich die Analyse?', 'A newly learned method provides the same food on less land, and released land is demonstrably restored as habitat. How does the analysis change?', 'Der kulturelle Mechanismus bleibt derselbe, die Umweltwirkung ändert sich: gleiches Versorgungsniveau bei geringerem Flächenbedarf und belegter Wiederherstellung. Folgen hängen von Verfahren und Anwendung ab, nicht allein vom Wort Kultur.', 'The cultural mechanism remains, but consequences change: equal food supply with reduced land demand and demonstrated habitat restoration. Effects depend on the practice and use, not the label culture.'),
    case('culture-shared-sanitation-today', 'Eine heutige Gemeinde gibt ein erlerntes Verfahren zur Abwasserreinigung in Schule und Ausbildung weiter. Das Modell belegt weniger Krankheitserreger im Trinkwasser und sauberere Gewässer, aber Energiebedarf der Anlage. Ein Vergleichsort ohne die Weitergabe setzt das Verfahren zunächst nicht ein.', 'A contemporary community transmits a learned wastewater treatment practice through schooling and training. The model establishes fewer drinking-water pathogens and cleaner waterways, but plant energy demand. A comparison community without transmission initially does not use it.', 'Analysiere die Bedeutung dieser kulturellen Evolution für heutige Menschen in ihrer Umwelt und unterscheide Weitergabe von genetischer Vererbung.', 'Analyze this cultural evolution for humans today in their environment and distinguish transmission from genetic inheritance.', 'Das Verfahren wird sozial gelernt und kann dadurch kumulativ erhalten und verändert werden. Es unterstützt die Gesundheit und Gewässerqualität und beansprucht Energie. Diese Kombination beschreibt Mensch-Umwelt-Wirkungen im Fall. Das Verfahren wird durch Lernen weitergegeben; fehlende Anwendung im Vergleichsort beweist keine genetische Unfähigkeit.', 'The practice is socially learned and can be cumulatively retained and changed. It supports health and water quality while consuming energy, jointly describing human-environment effects here. Transmission is learning-based; absent use in the comparison community does not show genetic inability.', 'Menschen aus dem Vergleichsort erlernen und verwenden das gleiche Verfahren nach einer Schulung erfolgreich. Welche Erklärung wird dadurch gestützt?', 'People from the comparison community successfully learn and use the same practice after training. What explanation is supported?', 'Zugang zu Wissen und Lerngelegenheiten erklären die zuvor unterschiedliche Nutzung im Fall. Der schnelle erlernte Wechsel braucht keine behauptete genetische Veränderung und widerlegt hier die pauschale genetische Unfähigkeit.', 'Knowledge access and learning opportunities explain earlier differences in use. Rapid learned adoption needs no alleged genetic change and contradicts generalized genetic inability in this case.'),
]

# Separate fossil product retains each existing fossil premise and fresh variation.
old_h = read(A / ('materials/' + H + '.whole-two-cases.json'))
cases[H] = copy.deepcopy(old_h)
cases[H][0].update(materialDe=old_h[0]['materialDe'].split(' Moderne Zusatzkarte:')[0], materialEn=old_h[0]['materialEn'].split(' Modern additional card:')[0],
    taskDe='Rekonstruiere zeitliche Folge und eine begründete Hypothese zur biologischen Evolution. Prüfe, ob ein direkter F1→F2→F3-Stammbaum aus den Angaben folgt.',
    taskEn='Reconstruct chronology and a reasoned hypothesis of biological evolution. Assess whether a direct F1→F2→F3 ancestry follows from the supplied evidence.',
    workedResponseDe='Die Intervalle ordnen F1 vor F2 vor F3. Im Modell könnten Zweibeinigkeit und Hirnschädelvergrößerung zeitlich versetzt verändert worden sein; Merkmale bilden ein Mosaik. Alter und Ähnlichkeit beweisen keine direkte Ahnenreihe; verzweigte Linien bleiben möglich. Werkzeuge belegen technische Aktivität, aber nicht sicher ihren Hersteller oder Sprache.',
    workedResponseEn='Intervals place F1 before F2 before F3. Bipedal traits and cranial enlargement may have changed at different times; features form a mosaic. Age and similarity do not prove a direct ancestry, and branching remains possible. Tools establish technical activity without identifying their maker or language.')
cases[H][1].update(materialDe=old_h[1]['materialDe'].split(' Moderne Karte:')[0] + ' Keine echte Datensammlung.', materialEn='Constructed fossil series: at 2.0 million years bipedal indicators occur in open and forest-rich habitats. At 1.5 million years more open sites occur, but preservation and searching there are more intensive. H1: bipedalism arose exclusively from savanna life. H2: different habitats and functions may have contributed. No actual collected dataset.',
    taskDe='Ordne Zeiten und Merkmale, beurteile beide Evolutionshypothesen und erläutere die Grenze zwischen Fundchronologie und gesicherter direkter Abstammung.',
    taskEn='Order dates and traits, evaluate both evolutionary hypotheses and explain the difference between fossil chronology and established direct ancestry.',
    workedResponseDe='Die frühe Reihe enthält beide Habitattypen; H1 ist als ausschließliche Erklärung nicht gestützt. Mehr spätere offene Fundstellen können Such- oder Erhaltungsbias sein. H2 bleibt eine prüfbare Alternative, keine bewiesene Gesamtursache. Zweibeinindikatoren begründen Funktionshypothesen; Chronologie und Ähnlichkeit belegen keine direkte Ahnenlinie.',
    workedResponseEn='The early series includes both habitat types, so H1 as an exclusive explanation is unsupported. More later open sites can reflect searching or preservation bias. H2 remains testable instead of a proven complete cause. Bipedal indicators support functional hypotheses; chronology and similarity do not prove direct ancestry.')

expectations = {
    RSTR: [('recognition-fragments', 'Eine passende Erkennungssequenz bestimmt den Schnitt; Fragmente bleiben Teile der Ausgangs-DNA.', 'A compatible recognition sequence determines cleavage; fragments remain parts of the original DNA.', 'Erklärt die Erkennung, rekonstruiert Fragmente und begründet geänderte Ergebnisse bei einer verlorenen Erkennungsstelle.', 'Explains recognition, reconstructs fragments, and reasons about changed results after losing a recognition site.')],
    EXPR: [('compatible-expression', 'Proteinexpression benötigt passende Regulationssignale und Wirtsfunktionen; DNA-Anwesenheit belegt sie nicht.', 'Protein expression requires compatible regulatory signals and host functions, and DNA presence does not establish it.', 'Erklärt einen gegebenen Expressionsunterschied und grenzt Proteinbildung bzw. Funktionsfähigkeit bei geänderten Signalen, Translation oder Code ein.', 'Explains a supplied expression difference and bounds protein production or functionality under changed signals, translation, or code.')],
    CULT: [('cultural-environment-analysis', 'Sozial erlerntes Wissen verändert heutige Handlungen und Mensch-Umwelt-Beziehungen, ohne dadurch genetisch vererbt zu werden.', 'Socially learned knowledge changes contemporary actions and human-environment relations without becoming genetically inherited through learning.', 'Analysiert den Mechanismus der Weitergabe, die belegten menschlichen und ökologischen Folgen sowie deren Veränderung bei einer frischen kulturellen Variation.', 'Analyzes transmission, demonstrated human and ecological consequences, and their changes in a fresh cultural variation.')],
    H: [('fossil-hypothesis-chronology', 'Fossilmerkmale und Datierungen tragen begrenzte Evolutionshypothesen; Chronologie ist keine bewiesene direkte Ahnenreihe.', 'Fossil traits and dates support bounded evolutionary hypotheses; chronology is not a proven direct ancestry.', 'Rekonstruiert eine zeitliche Folge, begründet eine Evolutionshypothese und überprüft sie bei neuen Merkmalen oder Fundbedingungen.', 'Reconstructs chronology, reasons about an evolutionary hypothesis, and checks it using new traits or fossil conditions.')],
}
for i, exs in expectations.items():
    es = [dict(id=e[0], essentialUnderstandingDe=e[1], essentialUnderstandingEn=e[2], observablePerformanceDe=e[3], observablePerformanceEn=e[4]) for e in exs]
    for c in cases[i]:
        c['rubric'] = [dict(expectationId=e['id'], criterionDe=e['observablePerformanceDe'], criterionEn=e['observablePerformanceEn'], rubricScope='count_only_aspects_actually_demonstrated_in_this_case', actualEvidenceLocations=['workedResponseDe', 'workedResponseEn', 'workedFreshTransferDe', 'workedFreshTransferEn'], rubricNoteDe='Eine hinreichende eigenständige Leistung kann genügen; keine zusätzliche Fallquote. Musterlösungen sind keine Lernendenleistung.', rubricNoteEn='Sufficient independent performance can suffice without another-case quota. Worked responses are not learner performance.') for e in es]
    profile = dict(archetype='procedure' if i == RSTR else 'explanation', expectations=es,
        coverageExpectations=dict(requiredExpectationIds=[e['id'] for e in es], alternativeExpectationGroups=[], minimumIndependentDemonstrations=1, freshVariationRequired=True, independentTransferRequired=True),
        variationAxes=[dict(id='changed-premise', textDe='Verschiedene belegte Ausgangsbedingungen und eine neue kausal relevante Voraussetzung je Fall.', textEn='Different demonstrated initial conditions and one fresh causally relevant premise in each case.')],
        applicationCaseBriefs=[dict(id=c['caseId'], taskDemandDe=c['materialDe']+'\n\n'+c['taskDe']+'\n\nFrische Variation: '+c['freshTransferTaskDe'], taskDemandEn=c['materialEn']+'\n\n'+c['taskEn']+'\n\nFresh variation: '+c['freshTransferTaskEn'], expectedPerformanceDe=c['workedResponseDe']+'\n\nTransfer: '+c['workedFreshTransferDe'], expectedPerformanceEn=c['workedResponseEn']+'\n\nTransfer: '+c['workedFreshTransferEn'], understandingFocusDe=' '.join(e['essentialUnderstandingDe'] for e in es), understandingFocusEn=' '.join(e['essentialUnderstandingEn'] for e in es)) for c in cases[i]])
    put('materials/' + i + '.whole-two-cases.json', cases[i])
    put('profiles/' + i + '.whole-profile.json', profile)
    put('candidate/individual/' + i + '.A-M.author-rationale.json', {'goalId': i, 'role': 'author_not_independent_reviewer', 'atomicityRationaleDe': es[0]['essentialUnderstandingDe']+' Das eine zu beurteilende Produkt lautet: '+es[0]['observablePerformanceDe'], 'excludedIndependentProducts': ['other methods and gel interpretation'] if i==RSTR else ['DNA-transfer/cloning strategy'] if i==EXPR else ['fossil chronology and ancestry reconstruction'] if i==CULT else ['present cultural-environment impact analysis'], 'memoryRationaleDe': 'Erklären, Ableiten und Prüfen einer neuen kausalen Bedingung trägt diese Kompetenz; reine Erinnerung eines Begriffs oder Zahlenwertes genügt nicht.', 'A': 'PENDING_TWO_GENUINE_INDEPENDENT', 'M': 'PENDING_TWO_GENUINE_INDEPENDENT', 'semanticAtomicApproval': False, 'humanApproval': False})

retained = [Y, PCR, CLONE, MED, '9b40dae5-6d89-5714-ac96-373e72a7045e']
for i in retained:
    src = V2 if i == MED else A
    cp(src / ('materials/' + i + '.whole-two-cases.json'), 'materials/' + i + '.whole-two-cases.json')
    cp(src / ('profiles/' + i + '.whole-profile.json'), 'profiles/' + i + '.whole-profile.json')
put('checks/P-whole-case-product-retention.author.json', {'affectedNewOrSplitPGoalIds': [RSTR, EXPR, CULT, H], 'exactRetainedWholePScienceGoalIds': retained, 'medicineV2NotChanged': True, 'wholeProfiles': 9, 'wholeCases': 18, 'independentApproval': False})

# Source changes are bounded to actual affected rows. Other partners and all source texts remain.
atlas = read(N / 'sources/current-ROOT-neuro-plus-Bio8-atlas.normal.config.json')
mapping_changes, new_paths = [], []
rp11 = 'rp-bio-seki-rp-bio-seki-2014-tf11-biowissenschaften-und-gesellschaft-003-8927c877'
rp12b = 'rp-bio-seki-rp-bio-seki-2014-tf12-biologische-anthropologie-002-b40bf47b'
rp12c = 'rp-bio-seki-rp-bio-seki-2014-tf12-biologische-anthropologie-003-82b6a308'
byhuman = '791145f3-650f-5e1a-84f7-2619aceb6a6a'
for idx, path in enumerate(atlas['mappingPaths']):
    mp = read(pathlib.Path(path)); prev = copy.deepcopy(mp)
    ex = read(pathlib.Path(mp['sourceExtractionPath'])); prevex = copy.deepcopy(ex)
    touched = set()
    def add(sid, cid):
        if any(x['legacyGoalId']==sid and x['canonicalGoalId']==cid for x in mp['mappings']): return
        old = next(x for x in mp['mappings'] if x['legacyGoalId']==sid)
        row=copy.deepcopy(old);row.update(canonicalGoalId=cid, matchType='partial');mp['mappings'].append(row);touched.add(sid)
    for row in list(mp['mappings']):
        sid, cid = row['legacyGoalId'], row['canonicalGoalId']
        if sid == rp11 and cid in [S,D]: mp['mappings'].remove(row); touched.add(sid)
        elif sid == rp12c and cid == H: row['canonicalGoalId']=CULT;row['matchType']='partial';touched.add(sid)
        elif sid == byhuman and cid == H: row['matchType']='partial';add(sid,CULT);touched.add(sid)
        elif cid == H and ('sn-biology-seki-lehrplan-2025-k10-evolution' in sid or 'th-biology-seki-lehrplan-2024-k910-evolution' in sid): add(sid,CULT)
        elif cid == D and sid in ['1ad96d9d-03d9-565f-94b2-94f6ed17c523','46f4ea54-367f-4f40-b3f2-0d7fd4dff90e']:
            row['canonicalGoalId']=CLONE;row['matchType']='partial';touched.add(sid)
    if any(x['legacyGoalId']=='377e1671-40e7-492a-97a6-3d73da326527' for x in mp['mappings']):
        add('377e1671-40e7-492a-97a6-3d73da326527', EXPR)
        sg=next(x for x in ex['sourceGoals'] if x['id']=='377e1671-40e7-492a-97a6-3d73da326527')
        sg['bio8AuthoredOperationalization']['optionalCourseBoundary']=True
        sg['bio8AuthoredOperationalization']['optionalBoundaryRationaleDe']='Q1 sind laut aktuellem KC nur Themenfelder1 bis3 verbindlich; Q1.4 ist optional. Bei gewähltem Q1.4 ist dieser Inhalt erhöhtes Niveau(LK), keine allgemeine Pflicht jedes LK.'
        touched.add(sg['id'])
    if any(x['legacyGoalId']==rp12b for x in mp['mappings']): touched.add(rp12b)
    for dec in mp.get('decisions',[]):
        sid=dec['sourceGoalId']
        if sid not in touched: continue
        dec['canonicalGoalIds']=[x['canonicalGoalId'] for x in mp['mappings'] if x['legacyGoalId']==sid]
        dec['matchType']='partial';dec['reviewedAt']=NOW;dec['reviewer']='Bio8 substantive-successor AUTHOR, independent SOURCE pending'
        q=dec.setdefault('authorQualification',{});q.update(sourceApproval=False, wholeCourseApproval=False, independentSourceReview='PENDING', priorWholeDecision=copy.deepcopy(next(d for d in prev['decisions'] if d['sourceGoalId']==sid)))
        if sid==rp11:
            dec['rationale']='Der aktuelle Quellenoperator fordert Argumentation zu Chancen und Risiken. Die vier ethischen Partner bleiben vollständig erhalten. Methoden-/Vektortheorie allein führt diesen Operator nicht aus; ihre alten direkten Teilkanten wurden entfernt und sind nur historische bzw. didaktische Voraussetzung. Keine deklarierte Vollabdeckung.'
            q['theoryOnlySourceEdgesRemoved']=[S,D];q['wholeDutyComplete']=False
        elif sid==rp12b:
            dec['rationale']='Fossilrekonstruktion430 liefert Abstammungswissen als ausdrücklich begrenzte Voraussetzung. Ihr Produkt erklärt kein menschliches Verhalten. Der bestehende Sek-I-Verhaltenscompanion7d2da9ab bleibt ausstehend; das stärkere Sek-II/LK-Primatenziel89b wird nicht als Ersatz projiziert. Die ganze Operatorpflicht bleibt offen.'
            q.update(sourceRole='prerequisite-support-only', wholeDutyComplete=False, missingAssessablePartnerCandidate='7d2da9ab-aed0-562b-a99a-840825fca009', sourceCoverageClaim=False)
            for m in mp['mappings']:
                if m['legacyGoalId']==sid:m['authorSourceRole']='prerequisite-support-only'
        elif sid==byhuman:
            dec['rationale']='Die wörtliche vollständige BY-AND-Anforderung bleibt erhalten: Fossilmerkmale→Evolutionshypothese/Chronologie430 UND heutige Kultur-/Umweltanalyse'+CULT+'. Jede einzelne Kante ist partial; nur die gemeinsam geprüften zwei Produkte können die ganze Anforderung erfüllen. Unabhängige SOURCE- und A/P-Prüfung ausstehend.'
            q.update(requiredAllCanonicalGoalIds=[H,CULT], wholeDutyComplete=False)
        elif sid=='377e1671-40e7-492a-97a6-3d73da326527':
            q.update(optionalCourseBoundary=True, optionalTopic='Q1.4', universalLKObligation=False)
            dec['rationale']='Optionales HE-ThemenfeldQ1.4: hier LK-Inhalt biotechnologische Medikamentenherstellung. Medicine-V2 bleibt unverändert; generische Expression ist ein begrenzter notwendiger Teil dieses Beispiels und ein getrenntes Produkt. Kein voller Quellenoperator aus isolierter Expression, keine allgemeine LK-Pflicht, SOURCE/Kurssicht HOLD.'
        elif sid==rp12c: dec['rationale']='Die explizite RP-Kultur-/Biosphärenpflicht liegt jetzt am eigenen kulturellen Analyseprodukt. Fossilchronologie430 wird dafür nicht als direkte Leistungskante verwendet. Teilmapping ohne ganze Curriculumsfreigabe.'
        elif CULT in dec['canonicalGoalIds']:dec['rationale']='Beide vorhandenen biologischen und kulturellen Pflichten bleiben mit getrennten Produkten erhalten. Neue Kulturteilkante ist partial und unabhängig zu prüfen; alle anderen Partner bleiben unverändert.'
        else:dec['rationale']='Die literal gebundene Trägerübertragung/Klonierung liegt an bereits vorhandenem528-Produkt. Die neue Expression wird nicht aus der alleinigen Transfer-/Klonierungsquelle als zusätzliche Pflicht abgeleitet. Alle anderen Quellenpartner bleiben erhalten; partielle Author-Zuordnung, keine SOURCE-Freigabe.'
    if mp!=prev or ex!=prevex:
        if ex!=prevex:
            xp=P/'sources'/f'{idx:02d}-whole-source-extraction.targeted-successor.json';put(xp.relative_to(P),ex);mp['sourceExtractionPath']=str(xp)
        np=P/'sources'/f'{idx:02d}-whole-mapping.targeted-successor.json';put(np.relative_to(P),mp);new_paths.append(str(np))
        mapping_changes.append({'originalMapping':ref(pathlib.Path(path)), 'successorMapping':ref(np),'sourceGoalIdsTouched':sorted(touched),'unchangedOtherMappingRowsRetained':True,'literalSourceGoalTextsRetained':all(g.get('sourceText')==next(o for o in prevex['sourceGoals'] if o['id']==g['id']).get('sourceText') for g in ex['sourceGoals']), 'originalWholeDecisionsRetainedInsideAuthorQualification':True})
    else:new_paths.append(path)
atlas.update(landscapePath=str(P/'candidate/whole482-substantive-three-successors.inactive.json'),semanticKindLedgerPath=str(P/'candidate/kinds395.author-classification-only.json'),mappingPaths=new_paths,expectedCurricularAtomicGoalCount=395,outputDirectory=str(P/'sources/compiled-views'),manifestPath=str(P/'sources/atlas.sources.json'),navigationViewPath=str(P/'sources/navigation.view.json'))
put('sources/current-targeted-atlas.normal.config.json',atlas)
put('checks/source-whole-pair-deltas.author.json',{'changedPairs':mapping_changes,'totalNormalPairs':len(new_paths),'unchangedPairPathsExact':len(new_paths)-len(mapping_changes),'twentyUnaffectedLegacyPairsNotRestarted':True,'wholeCourseApproval':False,'sourceApproval':False,'sourceCourseState':'HOLD','literalPCRGelPartialRoleRetained':True,'ROOTNeuroSourceChangesRetained':True})
print(json.dumps({'namespace':str(P),'wholeGoals':len(land['goals']),'atomic':395,'existingObjectsChanged':len(changes),'changedSourcePairs':len(mapping_changes),'PProfiles':9,'cases':18,'activeWrites':0,'independentApproval':0}))
