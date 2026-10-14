from pathlib import Path
import hashlib
import json
from datetime import datetime, timezone

ROOT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current406-native8-fresh-independent-a-20261013-v1')
INPUT = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current406-final-resource-P7-native8-technical-author-20261013-v1')
ROUND = INPUT / 'native-eight/round-a'
BUNDLE = INPUT / 'native-eight/bundle'
RUN_ID = 'chemie-current406-native8-fresh-independent-a-20261013-v1'
START = '2026-10-13T21:10:05Z'

def digest(path):
    return 'sha256:' + hashlib.sha256(Path(path).read_bytes()).hexdigest()

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def write_jsonl(path, values):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(''.join(json.dumps(v, ensure_ascii=False, separators=(',', ':')) + '\n' for v in values))

campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
bundle = json.loads((BUNDLE / 'manifest.json').read_text())
selector_path = INPUT / 'NEUTRAL.current406-P7-native8.exact-input-selector.json'
selector = json.loads(selector_path.read_text())
batch = campaign['batches'][0]
batch_path = ROUND / 'batches' / (batch['batchId'] + '.input.jsonl')
rows = [json.loads(line) for line in batch_path.read_text().splitlines() if line.strip()]
goals = [row['goal'] for row in rows]
assert [g['goalId'] for g in goals] == batch['goalIds'] == selector['native8Ids']
assert digest(selector_path) == 'sha256:cd0e2636a374d7e0d530fe5979b464fef11cbf15d6af3162b287dae2907c9b5f'
technical_seal = INPUT / 'SEAL.finite-current406-P7-native8-technical-author.actual.json'
assert digest(technical_seal) == 'sha256:fa1c8bf070d86ff6a64ef9d51b351e9dfd9d6f51385c727340e833b3ee5e57b5'

# These scientific decisions were formulated in the blind current-session review.
# This script copies original bindings and serializes those decisions; it does
# not infer a scientific verdict from fingerprints, earlier votes or statuses.
scientific = {
    'e56040b5': {
        'decision': 'split_review',
        'evidenceProfileRecommendation': 'revise',
        'essentialUnderstandingDe': 'Silanolkondensation bildet ein Siloxanrückgrat; Seitengruppen und Vernetzung erklären Unterschiede zu ausgewählten kohlenstoffbasierten Polymeren. Zusätzlich verlangt das aktuelle Ziel ein eigenständiges Verständnis nanoskaliger Schichten und Oberflächenstruktur: gleiche Silikonchemie kann bei geänderter Struktur andere Benetzung zeigen, und Schichtdicke ist keine Partikelgröße.',
        'essentialUnderstandingEn': 'Silanol condensation forms a siloxane backbone; side groups and crosslinking explain differences from selected carbon-based polymers. The current goal additionally requires distinct understanding of nanoscale films and surface structure: constant silicone chemistry can show different wetting after structural change, and film thickness is not particle size.',
        'observablePerformanceDe': 'Die lernende Person bilanziert ein endgruppenrichtiges Siloxanfragment, erklärt lineares Öl und vernetztes Elastomer und vergleicht die Rückgrate und passenden Eigenschaften mit PE. Getrennt erklärt sie anhand gleicher Chemie und veränderter Oberflächenstruktur die Benetzungsdaten und begrenzt die Behauptung einer selbstreinigenden Nanobeschichtung.',
        'observablePerformanceEn': 'The learner balances a correctly terminated siloxane fragment, explains linear oil and a crosslinked elastomer, and compares backbones and relevant properties with PE. Separately, the learner explains wetting data at constant chemistry but changed surface structure and limits a claim of a self-cleaning nanocoating.',
        'transferExpectationDe': 'Ein neuer Fall verändert Vernetzung oder Seitengruppen für den Polymervergleich; ein unabhängiger Beschichtungsfall verändert nanoskalige Struktur bei gleicher Chemie. Beide Leistungen sind nachzuweisen: richtige Siloxanbildung allein erlaubt keine Schlussfolgerung über Partikelgröße oder Selbstreinigung.',
        'transferExpectationEn': 'A new case changes crosslinking or side groups for polymer comparison; an independent coating case changes nanoscale structure at constant chemistry. Both performances need evidence: correct siloxane formation alone establishes neither particle size nor self-cleaning.',
        'rationale': 'Native PDF physical page 3, the complete bilingual body, current e1/e2/e3 profile and both whole e560 cases were inspected. BY carrier 7b64628a, C13-GA.4.21 and C13-EA.4.23, literally supports formation, structure, comparison and nanotechnology, so none may be dropped. Source fidelity and semantic atomicity are different judgments. Formation/chain-network architecture and carbon-polymer property comparison form a coherent chemistry body. The additional nano duty is separately assessable: case 2 holds chemistry constant, changes surface texture (105/35 degrees versus 155/5 degrees), and separately tests film thickness versus particle size and missing dirt-removal evidence. A learner may pass the former body and fail the latter. Thus the full goal contains two content competencies; a wording-only KEEP or narrowing would conceal that issue. Split at silicone formation/structure/property comparison versus nanoscale silicone-surface application, retaining every source duty and the useful image as appropriate. The image itself has a balanced dimer condensation and clear chain/network models; no new image error was found. This is an AI candidate finding, not a source or human approval.'
    },
    'b208b1a5': {
        'decision': 'keep', 'evidenceProfileRecommendation': 'none',
        'essentialUnderstandingDe': 'Die Eignung eines Textilfarbstoffs beruht auf passenden Farbstoff-Faser-Wechselwirkungen und Bedingungen: ionische Anziehung, mögliche Wasserstoffbrücken, kovalente Reaktion und intermolekulare Einlagerung sind zu unterscheiden.',
        'essentialUnderstandingEn': 'Textile-dye suitability depends on compatible dye-fiber interactions and conditions: ionic attraction, possible hydrogen bonding, covalent reaction and intermolecular uptake must be distinguished.',
        'observablePerformanceDe': 'Die lernende Person erklärt im sauren Bad die zusätzliche Anziehung von anionischem Farbstoff an protonierte Wolle gegenüber ungeladener Cellulose, ordnet Reaktiv- und Dispersionsfarbstoff den gegebenen Fasern zu und begründet die Eignung ohne eine universelle Waschbeständigkeitsrangfolge.',
        'observablePerformanceEn': 'The learner explains the additional attraction of an anionic dye to protonated wool compared with uncharged cellulose in an acidic bath, assigns reactive and disperse dyes to the supplied fibers, and justifies suitability without a universal wash-resistance ranking.',
        'transferExpectationDe': 'Bei neuer Faser, Reaktivgruppe oder verändertem pH begründet die lernende Person, welche Fixierroute möglich bleibt und weshalb kovalente Fixierung weder Lichtbeständigkeit noch unveränderliche Farbe garantiert.',
        'transferExpectationEn': 'With a new fiber, reactive group or changed pH, the learner explains which fixation route remains possible and why covalent fixation guarantees neither light resistance nor unchanging color.',
        'rationale': 'Native PDF physical page 4 shows readable critical labels, the selected-example qualifier and the combined dye/fiber/conditions qualifier. The complete DE/EN description is chemically accurate and corresponds to BY carrier 4707b786, C13-EA.2.8. Both whole cases, data, answers and demand-linked rubrics distinguish acidic wool attraction, cellulose reactive bonding and polyester uptake. Explaining interactions and judging suitability are one causally connected material-selection competence. The current profile covers this body with changed fiber/fixation conditions and stated limits. Other regional carriers are partial scope evidence; this review does not infer whole-source or national projection approval from them.'
    },
    '17ab1148': {
        'decision': 'keep', 'evidenceProfileRecommendation': 'none',
        'essentialUnderstandingDe': 'Elektrophile aromatische Substitution verknüpft Elektrophilangriff, vorübergehend nichtaromatischen Sigma-Komplex und Deprotonierung zur Wiederherstellung der Aromatizität; netto wird ein Ring-H ersetzt.',
        'essentialUnderstandingEn': 'Electrophilic aromatic substitution links electrophile attack, a temporarily nonaromatic sigma complex and deprotonation restoring aromaticity; a ring H is replaced overall.',
        'observablePerformanceDe': 'Die lernende Person zeichnet plausible Elektronenpaarpfeile und Zwischenstufen in einem gegebenen Benzolschema und erklärt den Unterschied zwischen dem Sigma-Zwischenstadium und einer bleibenden Addition.',
        'observablePerformanceEn': 'The learner draws plausible electron-pair arrows and intermediates in a supplied benzene scheme and explains the difference between a sigma intermediate and permanent addition.',
        'transferExpectationDe': 'In einem neuen Fall mit NO2+ statt dem vereinfachten Br+ korrigiert die lernende Person ein irrtümliches Additionsende und stellt durch begründete Deprotonierung das aromatische Substitutionsprodukt her.',
        'transferExpectationEn': 'In a new case using NO2+ rather than simplified Br+, the learner corrects an erroneous addition endpoint and restores the aromatic substitution product through justified deprotonation.',
        'rationale': 'Native PDF physical page 5 and whole406 page 134 were inspected against the actual current candidate relations. The native reverseRequires list contains exactly the actual azo child 981242bb and triphenylmethane child 53db04a0, whose requires both name this goal; the aggregate e594 is not used as a stale substitute. The prerequisite is aromatic-bond modeling f0f67a7a. The current short bilingual description names one established mechanism, and the P profile makes attack, sigma intermediate and rearomatization independently observable through bromination and an erroneous nitration endpoint. The existing picture labels its model and transient loss of aromaticity. No wording, current child-link or new native presentation blocker was found; unrelated existing successor goals were not reopened.'
    },
    '981242bb': {
        'decision': 'keep', 'evidenceProfileRecommendation': 'none',
        'essentialUnderstandingDe': 'Eine Azofarbstoffroute bildet zunächst aus einem primären aromatischen Amin das Diazoniumion und anschließend durch elektrophile Azokupplung die N=N-Verknüpfung; Protonenübertragungen, Wasserabspaltung, Rearomatisierung und Ladungen gehören zu derselben Syntheseroute.',
        'essentialUnderstandingEn': 'An azo-dye route first converts a primary aromatic amine to a diazonium ion and then forms the N=N linkage through electrophilic azo coupling; proton transfers, water loss, rearomatization and charges belong to the same synthesis route.',
        'observablePerformanceDe': 'Die lernende Person erklärt den N-N-Bindungsaufbau mit NO+ und die gegebenen Nitroso-/Diazohydroxid-Zwischenstufen, bilanziert ArNH2 + HNO2 + H+ zu ArN2+ + 2 H2O und stellt Ringangriff, Sigma-Komplex und Protonenabgabe bei der Kupplung mit Elektronenpaarpfeilen dar.',
        'observablePerformanceEn': 'The learner explains N-N bond formation with NO+ and the supplied nitroso/diazohydroxide intermediates, balances ArNH2 + HNO2 + H+ to ArN2+ + 2 H2O, and represents ring attack, the sigma complex and proton loss in coupling with electron-pair arrows.',
        'transferExpectationDe': 'Beim Wechsel von Phenol/Phenolat zu einem Aminodonor erklärt die lernende Person denselben vollständigen Weg und begründet, warum vollständige Protonierung des Donors die Ringaktivierung und Kupplung erschwert.',
        'transferExpectationEn': 'When changing from phenol/phenolate to an amino donor, the learner explains the same complete route and justifies why full donor protonation reduces ring activation and hinders coupling.',
        'rationale': 'Native PDF physical page 6, the complete DE/EN body and both whole azo cases were inspected. The BY source carrier 4fb9f93d C13-EA.2.6 explicitly requires particle-level mechanistic synthesis of both dye families; this child retains exactly the azo contribution rather than claiming the whole joint source. Both cases now demand the preceding diazotization, N-N sequence, acid/water roles and atom/charge balance as well as actual coupling. The given intermediate structures constrain a school-level model without replacing the independently demanded explanations. Route completeness does not mean every proton transfer is separately drawn or a hazardous experiment is performed. Diazotization and coupling are linked stages of one product-specific route; mastery of coupling alone cannot satisfy this goal. The native image correctly calls itself a simplified route and supplies neither complete mechanism nor learner evidence.'
    },
    '53db04a0': {
        'decision': 'keep', 'evidenceProfileRecommendation': 'none',
        'essentialUnderstandingDe': 'Die Triphenylmethanroute verbindet zwei Angriffe aktivierter Aromaten an das säureaktivierte Aldehydzentrum mit Wasserabspaltung zur neutralen Leukoverbindung; erst anschließende Oxidation erzeugt das delokalisierte Farbstoffkation.',
        'essentialUnderstandingEn': 'The triphenylmethane route joins two activated-arene attacks at an acid-activated aldehyde center with water loss to the neutral leuco compound; subsequent oxidation creates the delocalized dye cation.',
        'observablePerformanceDe': 'Die lernende Person stellt Carbonylprotonierung, beide Ringangriffe und Rearomatisierungen, OH-Protonierung und Wasserabspaltung dar, schreibt die Kondensationsgleichung und erklärt die Oxidationshalbreaktion RCH(Ar)2 zu RC(Ar)2+ + H+ + 2 e− einschließlich Ladungsbilanz und geändertem zentralem C.',
        'observablePerformanceEn': 'The learner represents carbonyl protonation, both ring attacks and rearomatizations, OH protonation and water loss, writes the condensation equation, and explains the oxidation half-equation RCH(Ar)2 to RC(Ar)2+ + H+ + 2 e− including charge balance and the changed central C.',
        'transferExpectationDe': 'Für einen anders substituierten aromatischen Aldehyd konstruiert die lernende Person die vollständige Route und unterscheidet die neutrale sp3-Leukostruktur von der sp2-Kationenstruktur, ohne einen nicht angegebenen Oxidanten oder eine Laborleistung zu erfinden.',
        'transferExpectationEn': 'For a differently substituted aromatic aldehyde, the learner constructs the complete route and distinguishes the neutral sp3 leuco structure from the sp2 cation structure without inventing an unspecified oxidant or laboratory performance.',
        'rationale': 'Native PDF physical page 7, complete DE/EN descriptions and both whole triphenylmethane cases were read. BY joint source 4fb9f93d C13-EA.2.6 supports this particle-level synthesis contribution. The current cases include both arene additions, acid activation, water loss, rearomatization, condensation stoichiometry and charge-balanced oxidation. At the declared school-model level, the redox half-equation is the supplied representation; no specific oxidant mechanism or real synthesis is claimed. Condensation alone does not reach the stated dye product; oxidation and the leuco/cation distinction are parts of that same endpoint competence rather than independently mastered alternative routes. The native diagram shows the leuco carbon with four bonds and H and the cation with three aryl bonds and no H, and labels its simplification. The current profile is sufficient for the stated goal.'
    },
    'f9e6d689': {
        'decision': 'keep', 'evidenceProfileRecommendation': 'none',
        'essentialUnderstandingDe': 'Bewertung von Altbatterien und Altakkumulatoren verbindet ihre unterschiedlichen Inhaltsstoffe, mögliche Freisetzung, kontrollierte Erfassung und tatsächliche Rückgewinnung mit verbleibenden Energie- und Reststofffolgen; hohe Metallrückgewinnung bedeutet keine Umweltneutralität.',
        'essentialUnderstandingEn': 'Assessment of discarded batteries and accumulators connects their different contents, possible release, controlled collection and actual recovery with remaining energy and residue impacts; high metal recovery does not mean environmental neutrality.',
        'observablePerformanceDe': 'Die lernende Person diskutiert die vorgegebenen Folgen für beide Gerätearten, trennt Sammlung von Rückgewinnung und begründet ein bedingtes Urteil aus Freisetzung, Rohstoffnutzen, Energieaufwand und Reststoffbehandlung statt aus einer Recycling-Parole.',
        'observablePerformanceEn': 'The learner discusses supplied impacts for both device types, distinguishes collection from recovery, and justifies a conditional judgment through releases, raw-material benefit, energy use and residue treatment rather than a recycling slogan.',
        'transferExpectationDe': 'Bei neuem Akkumulatortyp oder einer neu entdeckten Freisetzung revidiert oder bestätigt die lernende Person ihr Urteil nachvollziehbar und erklärt, weshalb der neue Befund nicht automatisch alle Batterien, Akkus oder realen Anlagen betrifft.',
        'transferExpectationEn': 'With a new accumulator type or newly discovered release, the learner justifiably revises or confirms the judgment and explains why the new finding does not automatically apply to all batteries, accumulators or real plants.',
        'rationale': 'Native PDF physical page 8, HH primary physical page 31, MV primary physical page 32/printed 28, current profile and both full P/Q and P/R cases were inspected. HH primary names disposal/recycling and supplies assessment context through BNE and competency references; its extracted carrier wording with bewerten is not treated as a literal isolated primary quote. MV explicitly requires discussing disposal impacts, rare-metal extraction and recycling: this goal covers disposal/recycling while the rare-metal duty remains separately present. Cases demand both battery and accumulator contents, collection versus recovery, residual impacts, criteria and meaningful changed-release transfer; no electrode-reaction or hazardous-handling demand is introduced. The native image shows closed devices, controlled collection, recovery and an explicit trade-off. The full bilingual goal is a bounded environmental-judgment competence, not approval of the entire joint MV source.'
    },
    'f54b2c33': {
        'decision': 'keep', 'evidenceProfileRecommendation': 'none',
        'essentialUnderstandingDe': 'Gewinnung seltener Metalle für elektrochemische Spannungsquellen verknüpft Rohstoffbedarf mit Erzgehalt, Materialbewegung und stofflichen Wasser-/Reststofffolgen. Seltene Metalle sind nicht automatisch Seltenerdmetalle, und unterschiedliche Vergleichsgrenzen erlauben keine Gesamtumweltrangfolge.',
        'essentialUnderstandingEn': 'Extraction of rare metals for electrochemical sources connects raw-material demand with ore grade, material movement and material-related water/residue impacts. Rare metals are not automatically rare-earth metals, and different comparison boundaries do not establish an overall environmental ranking.',
        'observablePerformanceDe': 'Die lernende Person diskutiert die gegebenen Gewinnungsoptionen bei gleicher nutzbarer Produktmenge, erklärt die Folgen niedrigeren Erzgehalts und neuer Freisetzung und entwickelt mit Argumenten, Gegenargumenten und Datenlücken ein begrenztes Fazit.',
        'observablePerformanceEn': 'The learner discusses supplied extraction options at equal usable product output, explains effects of lower ore grade and a new release, and develops a limited conclusion using arguments, counterarguments and missing data.',
        'transferExpectationDe': 'Bei geändertem Wasserbehandlungs- oder Nebenproduktkontext prüft die lernende Person die Schlussfolgerung neu und erkennt, weshalb ein niedriger Teilprozess-Energieindex bei anderer Bilanzgrenze keinen allgemeinen Gewinnungsvorteil beweist.',
        'transferExpectationEn': 'With changed water treatment or by-product context, the learner reviews the conclusion and recognizes why a low sub-process energy index under another boundary proves no general extraction advantage.',
        'rationale': 'Native PDF physical page 9 and MV primary physical page 32/printed 28 were inspected with the full current body, profile and both M/N whole cases. The MV primary explicitly names Rohstoffgewinnung seltener Metalle and discussion. The broad extracted joint carrier is only a carrier; the exact primary rare-metal clause grounds this bounded goal, while battery disposal/recycling remains on f9e6d689 and other partners. Cases preserve the electrochemical-source constituent, distinguish rare from rare-earth status, compare ore-grade/material and water conditions and change the by-product/boundary situation. No mining process or reaction-mechanism competence is invented. The picture gives an explicitly selected platinum catalyst example in a PEM source, with area/water/energy discussion factors, rather than implying platinum is consumed as the electrical fuel. No current description or native-context blocker was found.'
    },
    'b7ae47da': {
        'decision': 'keep', 'evidenceProfileRecommendation': 'none',
        'essentialUnderstandingDe': 'Metallrückgewinnung kann neue Rohstoffe ersetzen und auf gleicher nutzbarer Mengenbasis Energie sparen; sie benötigt selbst Energie und kann Verluste lassen. Daraus folgt eine begründete Bewertung sowohl unnötiger Neubeschaffung als auch der späteren Metallrückgabe.',
        'essentialUnderstandingEn': 'Metal recovery can replace new raw materials and save energy on the same usable-quantity basis; recovery itself uses energy and may leave losses. This supports a reasoned assessment of both unnecessary new purchases and later metal return.',
        'observablePerformanceDe': 'Die lernende Person beschreibt Ressourcen- und Energiebezug der gegebenen Primär-/Recyclingwege und begründet in einer frei gewählten hypothetischen Situation den Konsum- und den Entsorgungsteil gemeinsam, ohne privaten Haushalt zu offenbaren oder Verfahren zu erklären.',
        'observablePerformanceEn': 'The learner describes resource and energy links of supplied primary/recycling routes and jointly justifies consumption and disposal in a freely chosen hypothetical situation without disclosing private household data or describing machinery.',
        'transferExpectationDe': 'Bei verändertem Transport-/Aufbereitungsaufwand erkennt die lernende Person den erhaltenen Rohstoffnutzen trotz weggefallener Energieeinsparung, wägt den Konflikt ab und begrenzt sowohl Immer-als-auch-Nullverbrauchsbehauptungen.',
        'transferExpectationEn': 'When transport/treatment effort changes, the learner recognizes retained raw-material benefit despite loss of energy saving, weighs the trade-off, and limits both always-saving and zero-consumption claims.',
        'rationale': 'Native PDF physical page 10, NW primary physical/printed page 24, current profile and both complete X/Y cases were inspected. The primary explicitly requires describing resource conservation and energy saving and assessing ones own consumption and disposal on that basis; the carrier S.23 location is imprecise, so this review records the actual page 24. The full bilingual goal retains both decision components and the supplied cases allow a self-chosen hypothetical personal decision without private data. Changed R2 effort meaningfully tests the distinction between resource benefit and energy benefit. Quantitative life-cycle accounting, recycling-machine explanation or a new reaction model is not imported. The aluminum picture is labeled as a selected example, shows residual recycling energy, longer use and separate return. No scientific or wording blocker was found.'
    }
}

records = []
for ordinal, goal in enumerate(goals, 1):
    specification = scientific[goal['goalId'].split('-')[0]]
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': f'{RUN_ID}.record-{ordinal:03d}',
        'runId': RUN_ID,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'],
        'bookDigest': campaign['bookDigest'],
        **{key: goal[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': specification['decision'],
        'understandingEvidence': {key: specification[key] for key in ['essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn']},
        'rationale': specification['rationale'],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': specification['evidenceProfileRecommendation'],
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate'
    }
    records.append(record)

records_path = ROOT / 'results' / (batch['batchId'] + '.records.jsonl')
write_jsonl(records_path, records)
parameters_path = ROOT / 'generation-parameters.actual-known.json'
write_json(parameters_path, {
    'provider': 'OpenAI',
    'modelFamily': 'GPT-6',
    'exactModelIdentifier': None,
    'modelRevision': None,
    'samplingParameters': None,
    'reason': 'The active Codex session identifies GPT-6 family only. No hidden deployment revision, model override, temperature, seed or sampler setting is asserted.',
    'execution': 'Fresh blind child-agent current-session review A; no separate API call or fabricated call telemetry.'
})
completed = datetime.now(timezone.utc).isoformat()
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': RUN_ID,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': campaign['bundleFingerprint'],
    'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI',
    'model': 'Codex GPT-6 family; exact model identifier not exposed',
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(parameters_path),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [
        {'role': artifact['role'], 'digest': artifact['digest']}
        for artifact in bundle['artifacts']
    ] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': START,
    'completedAt': completed,
    'status': 'completed',
    'outputDigest': digest(records_path),
    'toolchainVersion': 'goal-description-review-v1'
}
write_json(ROOT / 'results' / (batch['batchId'] + '.run.json'), run)

landscape = json.loads(Path(selector['candidateLandscape']['path']).read_text())
three_ids = [batch['goalIds'][index] for index in [0, 3, 4]]
atomic_reasons = {
    three_ids[0]: scientific['e56040b5']['rationale'],
    three_ids[1]: 'One product-specific azo synthesis route is assessed from the aromatic primary amine to azo product. Diazonium formation supplies the necessary electrophile for coupling; atom/charge conservation validates that same route. Existing EAS and acid-base prerequisites supply generic subskills. Splitting by reaction stage would create partial-route goals, whereas the existing child split correctly separates azo from triphenylmethane product routes. This decision uses the complete current body, source clause, native page and both whole cases, not type=atomic or the number of rubric labels. No practical execution is claimed.',
    three_ids[2]: 'One product-specific triphenylmethane synthesis route is assessed from the aromatic aldehyde and activated arene to the dye cation. Two arene additions, acid activation, water loss and oxidation are linked stages toward that endpoint; condensation alone leaves the leuco compound and does not complete the declared product synthesis. The existing EAS, acid-base and redox prerequisites supply generic subskills. The whole current cases assess the complete route and conservation. This is one coherent synthesis competence, separate from the azo sibling; stage count or separate scoring rows do not themselves make independent content goals.'
}
memory_reasons = {
    three_ids[0]: 'The whole current silicone body requires explaining and comparing formation, chain/network structure and nanoscale application from supplied structural/data models. No compact closed list, isolated formula recall or exact nanomaterial label is the learning target. Repeated recall cards cannot replace drawing/balancing, causal polymer comparison or bounded wetting-data interpretation. The independent non-atomic finding remains open and is not made green by this memory decision. Neither the whole body nor the proposed content split requires a new memory deck.',
    three_ids[1]: 'The full azo route is assessed by constructing/explaining particle steps, electron-pair flow and conservation from supplied structures. Nitrosation/diazonium and EAS terms are support for understanding, not an independently required compact rote list. Both cases provide intermediate structure guides and demand causal performance. A route-recall deck would duplicate the content competence without establishing transfer; no memory goal or deck is required.',
    three_ids[2]: 'The full triphenylmethane route is assessed by constructing the two arene additions, water loss and charge-balanced oxidation and distinguishing leuco/dye structures. Supplied Ph/Ar/R definitions and prerequisites avoid a hidden notation-recall demand. The target is causal mechanistic explanation and conservation, not a compact fact inventory; no necessary independent rote card or memory deck is justified.'
}
for lane, version in [('atomicity', 'semantic-atomicity-v1'), ('memory', 'memory-card-review-v1')]:
    review_id = RUN_ID + '-' + lane + '-three'
    config = {
        'schemaVersion': 1, 'reviewId': review_id, 'ruleVersion': version,
        'landscapeId': landscape['landscapeId'],
        'landscapePath': selector['candidateLandscape']['path'],
        'reviewPath': (ROOT / lane / 'three-current-final.review.jsonl').as_posix(),
        'scope': {'label': 'Exactly the three full changed semantic bodies; final resource candidate', 'leafGoalIds': three_ids}
    }
    if lane == 'memory':
        config['visibilityScopeCoverageRequired'] = False
        config['visibilityScopes'] = []
    write_json(ROOT / lane / 'three-current-final.config.json', config)
    values = []
    for gid in three_ids:
        row = {
            'schemaVersion': 1, 'reviewId': review_id, 'ruleVersion': version,
            'landscapeId': landscape['landscapeId'], 'goalId': gid,
            'fingerprint': 'sha256:' + '0' * 64,
            'reviewedAt': completed,
            'reviewer': 'Fresh blind independent Codex review A; AI scientific review only',
            'reason': atomic_reasons[gid] if lane == 'atomicity' else memory_reasons[gid]
        }
        if lane == 'atomicity':
            row.update(status='non_atomic' if gid == three_ids[0] else 'atomic', semanticAtomic=gid != three_ids[0])
            if gid == three_ids[0]:
                row['suggestedAction'] = 'Preserve every source duty and split polymer formation/structure/property comparison from nanoscale silicone-surface application; independently review the resulting bodies.'
                row['suggestedSplit'] = ['Silikonbildung, Molekülbau und strukturbezogener Polymervergleich', 'Nanoskalige Silikonoberflächen und Benetzungswirkung begründet einordnen']
        else:
            row.update(status='no_memory_needed', memoryUseful=False)
        values.append(row)
    write_jsonl(ROOT / lane / 'three-current-final.review.jsonl', values)

asset_rows = json.loads(Path(selector['assetSourceBindings']['path']).read_text())['assets']
by_url = {row['url']: row for row in asset_rows}
native_model = json.loads(Path(selector['nativeEightModel']['path']).read_text())
whole_model = json.loads(Path(selector['fullCurrent406Model']['path']).read_text())
whole_page_by_id = {page['goalId']: page for page in whole_model['pages']}
goal_by_id = {goal['id']: goal for goal in landscape['goals']}
assert len(whole_model['pages']) == 406
tuples = []
for ordinal, goal in enumerate(goals, 1):
    page = goal['reviewContext']['page']
    profile = goal['reviewContext']['evidenceProfile']
    asset = by_url[page['visualization']['url']]
    for binding in [asset['source'], asset['copy']]:
        assert digest(binding['path']) == binding['sha256']
    assert asset['copy']['sha256'] == page['visualization']['originalDigest']
    current = goal_by_id[goal['goalId']]
    actual_reverse = [g['id'] for g in landscape['goals'] if goal['goalId'] in g.get('requires', [])]
    native_related = [row['goalId'] for row in page['reverseRequires'] + page['externalReverseRequires']]
    assert set(actual_reverse) == set(native_related)
    assert current['requires'] == goal['canonicalContext']['requires']
    assert current['description'] == goal['currentDescriptionDe']
    assert current['descriptionEn'] == goal['currentDescriptionEn']
    assert whole_page_by_id[goal['goalId']]['goalFingerprint'] == goal['goalFingerprint']
    tuples.append({
        'goalId': goal['goalId'], 'goalFingerprint': goal['goalFingerprint'],
        'nativePageNumber': ordinal, 'physicalPdfPageNumber': ordinal + 2,
        'whole406PageNumber': whole_page_by_id[goal['goalId']]['pageNumber'],
        'pageFingerprint': goal['pageFingerprint'],
        'profileFingerprint': profile['profileFingerprint'],
        'profileStatus': profile['status'], 'profileAuthority': profile['reviewAuthority'],
        'image': asset, 'requires': current['requires'],
        'actualReverseRequires': actual_reverse,
        'nativeRelatedGoalIds': native_related,
        'descriptionDecision': records[ordinal - 1]['decision'],
        'actualNativeVisualInspection': True
    })

input_paths = [selector_path, technical_seal, ROUND/'description-review-campaign.json', ROUND/'description-review-input.json', batch_path, ROUND/'prompt.md', ROUND/'criteria.md', ROUND/'contracts/goal-description-review-record.schema.json']
input_paths += [BUNDLE / artifact['path'] for artifact in bundle['artifacts']]
input_paths += [Path(selector[key]['path']) for key in ['candidateLandscape', 'candidateSemanticLedger', 'candidateQA', 'fullCurrent406Model', 'P3', 'P4ExactRetained', 'P3FullSixCases', 'P4FullEightCases', 'unchangedSourceCompilerInputsReference', 'unchangedPortableSourceAPIReference', 'assetSourceBindings']]
input_paths += [Path(asset['source']['path']) for asset in asset_rows]
write_json(ROOT/'inspection'/'actual-native-eight-tuples-and-inputs.json', {
    'schemaVersion': 1, 'reviewId': RUN_ID, 'startedAt': START, 'verdictCompletedAt': completed,
    'blindToPeerBAndEarlierDescriptionVerdicts': True,
    'reviewedGoalCount': 8, 'fullContextGoalCount': 406, 'physicalPdfPageCount': 10,
    'tuples': tuples,
    'inputBindings': [{'path': path.as_posix(), 'bytes': path.stat().st_size, 'sha256': digest(path)} for path in dict.fromkeys(input_paths)],
    'descriptionCounts': {'keep': 7, 'split_review': 1},
    'atomicityCounts': {'atomic': 2, 'non_atomic': 1},
    'memoryCounts': {'no_memory_needed': 3},
    'approvalClaims': {'humanApproval': False, 'activeIntegration': False, 'runtimeAcceptance': False, 'newStrictCompletions': 0}
})
write_json(ROOT/'inspection'/'scientific-native-page-notes.json', {
    'schemaVersion': 1, 'reviewId': RUN_ID,
    'nativePageObservations': [
        {'goalId': tuples[0]['goalId'], 'physicalPdfPage': 3, 'observed': 'Balanced two-silanol dimer plus water; end groups and Si/O valences correct. Free chains versus connected covalent-network icon are visibly distinct. Wetting panel names chemistry and structure; no nanoparticle identity is inferred from methyl groups.'},
        {'goalId': tuples[1]['goalId'], 'physicalPdfPage': 4, 'observed': 'Critical NH3+/SO3− wool interaction, cellulose O–C reaction and polyester intermolecular uptake are visibly distinct. Selected examples and fiber/dye/conditions qualifiers remain readable on the native page.'},
        {'goalId': tuples[2]['goalId'], 'physicalPdfPage': 5, 'observed': 'Electrophile attack, sigma intermediate and rearomatization model are visible. Current two child destination labels resolve to native pages 4 and 5; no old aggregate is substituted for those children.'},
        {'goalId': tuples[3]['goalId'], 'physicalPdfPage': 6, 'observed': 'ArNH2, diazonium and azo product, reagent annotations, coupling partner and H+ release are legible. Explicit simplified-route label prevents claiming that this overview is the complete mechanism or stoichiometric equation.'},
        {'goalId': tuples[4]['goalId'], 'physicalPdfPage': 7, 'observed': 'Leuco central C has Ph/two Ar/H and four bonds; dye central C+ has three aryl bonds and no H. Donor-substituted aryl notation and simplified-route label are readable; no full oxidant balance is implied by the picture.'},
        {'goalId': tuples[5]['goalId'], 'physicalPdfPage': 8, 'observed': 'Closed battery and accumulator, separate collection, treatment and material recovery are distinct. Balance explicitly includes energy and residues; image does not present recycling as impact-free or invite opening devices.'},
        {'goalId': tuples[6]['goalId'], 'physicalPdfPage': 9, 'observed': 'Selected platinum example links ore, processing and material supply to catalyst locations in PEM source. Hydrogen/oxygen inlets and electricity cue do not portray platinum as fuel. Area/water/energy provide discussion aspects.'},
        {'goalId': tuples[7]['goalId'], 'physicalPdfPage': 10, 'observed': 'Selected aluminum primary/recovery routes show unequal but positive energy use and matched ingot outputs. Longer use and separate return are separate visible choice cues, consistent with the combined consumption/disposal demand.'}
    ],
    'sourceLocationNotes': [
        {'source': 'HH chemie-gyo-2022-data.pdf', 'actualPhysicalPage': 31, 'interpretation': 'Primary disposal/recycling content plus BNE assessment context; carrier bewerten is an operationalized descriptor, not a verbatim isolated primary phrase.'},
        {'source': 'MV Chemie_Gymnasium_11_12_Erprobungsfassung.pdf', 'actualPhysicalPage': 32, 'printedPage': 28, 'interpretation': 'Exact right-column sentence independently names disposal impacts, rare-metal extraction and recycling and requires discussion. The three demands are not all certified by either one new recycling goal.'},
        {'source': 'NW g9_ch_klp_3415_2019_06_23.pdf', 'actualPhysicalPage': 24, 'printedPage': 24, 'carrierReportedPage': 23, 'interpretation': 'Actual primary page 24 contains the exact resource/energy-based consumption/disposal competence. The carrier location is imprecise; the primary duty itself is present and retained.'},
        {'source': 'BY gymnasium/Chemie.json', 'clauses': ['C13-GA.4.21', 'C13-EA.4.23', 'C13-EA.2.6', 'C13-EA.2.8'], 'interpretation': 'Supplied official-content capture and transported raw source carriers support the bounded goals. A source bullet is not a semantic-atomicity approval and a joint dye-synthesis bullet is not whole-source completion by either child.'}
    ],
    'scopeLimits': 'Exactly eight current native D bodies and exactly three current A/M bodies. Source snapshots support bounded statements; other 398 goals, nationwide full-source union, active gates, human approval, publication and runtime acceptance were not reviewed or asserted.'
})
print(json.dumps({'reviewId': RUN_ID, 'recordCount': len(records), 'outputDigest': run['outputDigest'], 'completedAt': completed, 'root': ROOT.as_posix()}, ensure_ascii=False))
