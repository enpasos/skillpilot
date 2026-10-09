# SPDX-License-Identifier: Apache-2.0
"""Seal this reviewer's actual original/360/680 observations before metadata."""
import datetime
import hashlib
import json
from pathlib import Path

BASE = Path(__file__).parent
REPO = Path.cwd()


def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {"path": str(path), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def write(name, value):
    path = BASE / name
    if path.exists():
        raise RuntimeError(f"FIRST cannot be overwritten: {path}")
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    json.loads(path.read_text())
    return binding(path)


NOTES = {
    3: {
        "scientific": "Initial light and dark beetles precede the bird's predation; the later population has a higher dark fraction over generations. The crossed-out need-directed mutation idea is separated from the positive selection sequence. No individual is drawn becoming dark in the accepted sequence. DNA is a schematic inheritance cue, not a nucleotide-level model.",
        "visual": "Both beetle phenotypes, the light beetle exposed on dark bark, predator, population arrow and red rejection cross remain distinguishable at 360. Top short labels are readable; the smaller mutation question is secondary and its crossed-out visual carries the rejection. At 680 all labels are clear. Friendly comic outlines and restrained panels suit Sek II.",
        "scope": "Orientation to evaluating explanations against genetics, not proof of genotype, measured selection, source coverage or learner understanding.",
    },
    4: {
        "scientific": "Variation, selection/chance and gene flow are presented as different factors. Upper island populations exchange genes; lower populations have a crossed-out connection and the explicitly qualified outcome 'Artbildung möglich'. Isolation is not labelled automatic or immediate speciation. Remaining shared brown animals do not purport to be a species diagnostic.",
        "visual": "The large islands, lizard variants, bilateral gene-flow arrow and lower red interruption remain clear at 360. Small top labels are supporting cues, while isolation/speciation wording is readable. At 680 the three factor panels and branch arrows are distinct. No crowds or photorealism.",
        "scope": "A schematic factor combination and possible divergence, not a measured allopatric-speciation case or a proof that skin colour defines species.",
    },
    5: {
        "scientific": "A shared primate population branches into two river-separated populations with different phenotype mixtures. Variation, selection and chance accompany isolation; possible speciation is conditional. The diagram does not show modern monkeys turning into humans or a ladder of progress.",
        "visual": "Both separated banks, monkeys and divergence arrows remain recognisable on the phone. Short population/factor labels are small but the population split and isolation are the primary visual. At 680 the four initial variants and separate later mixtures are clear. Abstract monkeys and landscape suit an upper-secondary orientation.",
        "scope": "Illustrated hypothetical primate populations, not an identified primate species history or evidence of jurisdiction/course applicability.",
    },
    6: {
        "scientific": "An older person conveys shelter construction through speech/pictographic bubbles to younger people. The shelter then offers possible rain protection. Learned transmission and travel to contrasting environments are separate from genetic inheritance; the advantage is qualified as possible.",
        "visual": "People, shared shelter diagrams, rain and protection are large enough at 360. Globe and contrasting landscape icons remain clear without reading tiny notes. At 680 all three short labels are clear. Modern comic clothing presents a concept, not a dated archaeological reconstruction.",
        "scope": "Orientation to cultural transmission and environmental opportunities, not a causal proof of global migration or a guaranteed fitness gain.",
    },
    7: {
        "scientific": "The person actively channels water toward crops; the contrasting panel explicitly compares populations in successive generations under selection. The lower diversity comparison and 'können' warning present a possible consequence rather than an inevitable result of every intervention. It does not show one plant purposefully remaking itself.",
        "visual": "Irrigation, shovel action, generation arrow, plant mixtures, warning triangle and diversity change remain distinguishable at 360. The small final sentence is supplementary to the plant comparison and warning. At 680 generation and diversity labels are legible. The person's grip and working posture are plausible; no actor-facing written entry is present.",
        "scope": "Schematic phenotype/population and intervention comparison, not empirical selection counts, a plant taxonomy or a statement that all farming reduces diversity.",
    },
    8: {
        "scientific": "Own offspring and helping relatives are explicitly separated; benefits and costs are framed for overall fitness. The crossed muscle icon rejects equating evolutionary fitness with strength. Coins/leaves and the balance are metaphors, not a numeric inclusive-fitness calculation or an equation assigning equal costs and benefits.",
        "visual": "Feeding adults, two broods, cost/benefit balance, relative connection and crossed strength cue remain clear at 360. Main labels are readable and colours separate the direct and indirect contribution. At 680 the smaller 'Verwandte' cue is clear. Friendly generic songbirds are suitable for the goal.",
        "scope": "Generic schematic bird helping example; it does not establish typical cooperative breeding in an identified species, measured relatedness or Hamilton-rule values.",
    },
    9: {
        "scientific": "Cooperation, aggressive display and parental feeding lead into observation, pictorial recording and comparison. The notebook's green/yellow/blue ordering agrees with the comparison chart. The final adult/young/DNA cue concerns genetic transmission, without claiming that observations alone prove causality or mastery.",
        "visual": "Three top actions and the lower method arrows are distinct at 360. The chart is readable as coloured comparisons rather than tiny numerical data. The notebook is an unheld diagram with no person drawing or reading it, so its viewer-facing orientation does not reverse an actor's entry. At 680 both notebook and magnifier are clear.",
        "scope": "Hypothetical qualitative ethological illustration; resource sharing in the drawing is not an independently verified cooperation measurement and the chart is not real field data.",
    },
    10: {
        "scientific": "The top alarm-call scene separates sender, signal and receiver response in a predator context. Cooperation, aggressive display and parental feeding are then shown as different behaviours; observation/time recording and comparison are presented as methods. There is no automatic assignment of genetic success from one action.",
        "visual": "The signal waves, receiver motion, predator and three behaviour panels remain recognisable at 360. Main action labels and the method heading are readable. At 680 the clock and blank pictorial checklist are clear. No person uses the notebook, and no reversed written entry is implied.",
        "scope": "An orienting behavioural-research picture, not a performed experiment, an observed bird alarm-code dataset or a complete protocol.",
    },
    11: {
        "scientific": "Internal factors and environment/experience both point toward primate social grooming. The question mark and 'kritisch vergleichen' mediate comparison with humans discussing culture/rules, avoiding a direct deterministic primate-to-human behaviour arrow. DNA/brain/molecule/health icons are non-specific factor cues, not anatomical or hormone structures to identify.",
        "visual": "Grooming, two factor families, question mark and diverse human discussion remain identifiable at 360. Smaller icons and the critical-comparison text support, rather than replace, the main relationship. At 680 all headings are readable. Friendly age-appropriate pupils and abstract primates fit the goal.",
        "scope": "Orientation to multi-factor and critical comparison, not proof that any particular human conduct is genetically fixed or that one hormone dictates behaviour.",
    },
    13: {
        "scientific": "Gorilla branches outside the shared chimpanzee/human branch, correctly expressing the closer Pan/Homo relationship in this deliberately partial tree. Common ancestors are internal branch points; living apes are not placed as human ancestors. Anatomy plus DNA are evidence cues for human classification. The hand is a simplified five-digit schematic, not a full carpal-bone exercise.",
        "visual": "All three living groups, their labels and the branching topology remain clear at 360. The smaller anatomy/DNA phrase is supported by recognisable hand and helix icons. At 680 the relationship and hand details are clear. No ladder, technical IDs or excessive detail.",
        "scope": "Partial tree with gorilla/chimpanzee/human, not a complete primate classification or a claim that other primates lack DNA or homologous hands.",
    },
    14: {
        "scientific": "Fossil skull and pelvis/long-bone fragments accompany an older-to-younger time direction. A branching, question-marked hypothesis picture avoids a fixed ancestral ladder; cultural learning/transmission is depicted separately. No fossil names, absolute dates or unproved ancestor identifications are asserted.",
        "visual": "The three large panel headings, fossil objects, uncertain branching and two people discussing a held stone remain clear at 360. Smaller hypothesis and transmission paragraphs are secondary and the uncertainty is conveyed by question marks. At 680 all captions are readable. The open book is pictographic and viewer-facing; neither actor is depicted writing in or looking at the book. It must not be treated as evidence of an actor-facing handwritten entry or as a dated prehistoric bound book.",
        "scope": "KEEP only as an overview of the current combined fossil/culture scope. This picture does not resolve the separate semantic-atomarity dispute, does not authorize either proposed split child image, and does not by itself illustrate all of present-day culture analysis.",
    },
    17: {
        "scientific": "Hox genes lead through spatial/temporal gene regulation to developmental patterns; a conditional 'Variation möglich' connects two schematic patterns to contrasting body forms. It does not label every expression change adaptive or evolutionary fixation, nor present actual named vertebrate embryos turning into arthropods.",
        "visual": "DNA, place/time controls, highlighted body regions and alternative silhouettes remain clear at 360. Labels are short; arrows distinguish the causal orientation and conditional variation. At 680 the segment highlights and time slider are clear. Abstract organisms deliberately support Evo-Devo orientation without photorealistic species claims.",
        "scope": "Schematic regulatory-development example, not a real embryo comparison, a complete Hox-cluster map, an exact evolutionary transformation or source/course approval.",
    },
}

input_path = BASE / 'twelve-whole-goals-and-original-display-bindings.pixel-only.input.json'
inputs = json.loads(input_path.read_text())
canonical_path = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
canonical = json.loads(canonical_path.read_text())
current_by_id = {g['id']: g for g in canonical['goals']}
verified = []
judgments = []
for row in inputs['images']:
    assert row['wholeGoal'] == current_by_id[row['goalId']], row['goalId']
    for recorded in [row['asset']] + [s['binding'] for s in row['actualDisplayBindings']]:
        actual = binding(recorded['path'])
        assert actual['sha256'] == recorded['sha256'].removeprefix('sha256:'), recorded
        assert actual['bytes'] == recorded['bytes'], recorded
        assert not Path(recorded['path']).is_symlink()
        verified.append(actual)
    judgments.append({
        'ordinal': row['ordinal'], 'goalId': row['goalId'], 'wholeGoal': row['wholeGoal'],
        'actualAsset': row['asset'], 'actualDisplayBindings': row['actualDisplayBindings'],
        'actuallyInspectedSeparatelyWithViewImage': ['original', '360', '680'],
        'pixelDecision': 'KEEP', 'findingIds': [], **NOTES[row['ordinal']],
    })
verdict = write('twelve-actual-rasters.independent-b.pixel-FIRST.verdict.json', {
    'schemaVersion': 'independent-goal-visualization-pixel-review-v1',
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewer': '/root/evo12_visual_independent_b',
    'license': 'CC-BY-4.0',
    'scope': 'Machine visual and biological orientation review only; inactive candidates.',
    'independence': {
        'authorOfTheseTwelvePNGs': False,
        'authorQCRead': False, 'peerVerdictsRead': False,
        'metadataPromptsAltReconstructionLicenseReadBeforeFIRST': False,
        'mechanicalDisplayFieldsSeenDuringExtraction': inputs['mechanicalDisplayFieldsIncidentallySeen'],
        'authorScientificJudgmentSeen': False,
    },
    'pixelOnlyInput': binding(input_path), 'currentWholeGoals': binding(canonical_path),
    'judgments': judgments,
    'summary': {'actualOriginalCount': 12, 'actual360Count': 12, 'actual680Count': 12, 'pixelKeep': 12, 'pixelHold': 0},
    'otherGates': {'sourceCoverageApproval': False, 'currentNativePageApproval': False, 'PApproval': False,
                   'semanticSplitApproval': False, 'humanApproval': False, 'humanTrial': False, 'strictGain': 0},
})
seal = write('twelve-actual-rasters.independent-b.pixel-FIRST.freeze.json', {
    'schemaVersion': 'independent-visual-FIRST-freeze-v1',
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewer': '/root/evo12_visual_independent_b',
    'actualFIRSTVerdict': verdict, 'actualPixelOnlyInput': binding(input_path),
    'canonicalCurrentAtFIRST': binding(canonical_path), 'actual36InspectedRasterBindings': verified,
    'beforeMetadataReview': True, 'beforeAnyPeerVerdict': True, 'historicalInputsUnchanged': True,
})
print(json.dumps({'verdict': verdict, 'FIRSTfreeze': seal, 'summary': {'KEEP': 12, 'HOLD': 0, 'actualSeparateViews': 36}}, ensure_ascii=False))
