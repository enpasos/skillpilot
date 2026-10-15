# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

R = Path(__file__).resolve().parents[8]
O = Path(__file__).resolve().parents[1]
A = O.parent / 'chemie-source-six-original-residual-duty-author-20261014-v1'


def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(R)), 'bytes': len(b), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest()}


def write(p, x):
    assert not p.exists()
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')


source = json.loads((A / 'CAS.six-whole-source-cells-five-carriers-and-one-parent-literal-restoration.author-only.json').read_text())
canonical = json.loads((A / 'candidate/canonical536.prospective409-six-residual-duties.author-only.json').read_text())
goals = {x['id']: x for x in canonical['goals']}
profiles = [json.loads(x) for x in (A / 'P/two-whole-goal-author-E0-G0.profiles.jsonl').read_text().splitlines()]
cases = json.loads((A / 'cases/two-pending-whole-goals-four-complete-DEEN-cases.author.json').read_text())['goals']
ended = datetime.now(timezone.utc).isoformat()

source_reasons = [
    ('BB', 'ACCEPT_BOUNDED_PARTIAL_COMPONENT_AND_WHOLE_ORIGINAL_CELL_DUTY_DESIGN',
     'Physical30 right column explicitly requires alcohol-monomer synthesis from haloalkanes through the SN mechanism in LK additional to GK. Physical26 defines the column and compulsory contents; physical30 introduction explicitly chooses simple examples for didactic reduction. Physical32/33 corroborate elementary mechanistic representation; the latter is an example competence contribution rather than a new universal duty.',
     'The unchanged3899 donor/acceptor and d492 whole reaction-equation partners each supply real components but do not alone represent elementary arrow steps. New whole c307 supplies both attack/leaving-group electron movements, alcohol formation and the bifunctional polyester-monomer role. This is a coherent complete design for the original narrow SN clause, not the adjacent polymerisation/polycondensation/practical synthesis duties.',
     ['LK only; no GK or other-state source grant.', 'Exactly52 ordinary acquisition targets missing in BB LK remain HOLD; no requires removal or blind52 additions.', 'No laboratory execution or SN1/SN2-comparison authority inferred.']),
    ('BE', 'ACCEPT_BOUNDED_PARTIAL_COMPONENT_AND_WHOLE_ORIGINAL_CELL_DUTY_DESIGN',
     'BE and BB use byte-identical official RLP2022 primary PDFs. The same physical26/30 LK additional-column condition and physical30 simple-example mechanism demand apply separately to the BE source ID.',
     'The separate BE c307 component is justified by the same whole c307 mechanism plus unchanged3899/d492 component union. Preserving the BE original ID and old partners is necessary. This is a second jurisdictional source component, not a second independent chemical mechanism or practical-synthesis approval.',
     ['LK only; no GK/default entitlement.', 'The exact52 BE LK acquisition targets remain HOLD separately from BB.', 'Other whole-source cells, all-course coverage and M311 are not cleared.']),
    ('MV', 'ACCEPT_BOUNDED_PARTIAL_COMPONENT_AND_WHOLE_ORIGINAL_CELL_DUTY_DESIGN',
     'Physical29/printed25 left column contains acidic/alkaline/neutral solutions, SE testing varied solutions with indicators, pH as their measure and pH scale. Physical5 makes left-column contents compulsory and right-column notes instructional guidance. Physical28 acid-only testing and neutralisation/electrical conductivity nearby remain separate duties.',
     'The whole unchanged d2 expressly requires suitable school experiments with the scale of the indicator actually used and broad pH classification. It can teach the selected indicator distinction operator coherently; no equation, neutralisation experiment, physiological pH-effects evaluation or quantitative pH calculation is smuggled into this source grant.',
     ['Partial edge only; no whole-course or every-d2-aspect grant from the one row.', 'Preparation/safety acquisition and source authority for whole135 preparation remain separate; testing a supplied solution is not proof of its preparation.', 'Historical d2 P/A/D and actual learner experiment remain unchanged.']),
    ('SN8', 'ACCEPT_LITERAL_PARENT_RESTORATION_AND_TWO_BOUNDED_PARTIAL_COMPONENTS_WITH_P_HOLD_SEPARATE',
     'Physical24/printed12 has a mandatory left-column parent for introductory significance/use/handling of acids and acidic everyday solutions, plus the indented experimental indicator investigation. Physical4 explicitly makes left goals/contents compulsory and right Bemerkungen recommended. Classification, oxygen-containing acids, behaviour rules and acid-rain contexts in the right column remain recommendations, not deleted and not universal new exam duties.',
     'The old consumed sourceText contained only the nested indicator experiment. Restoring the exact mandatory parent alongside it is scientifically truthful while preserving raw fields and before-cell history. Whole e5d addresses material-based introductory significance/use/handling; whole d2 supplies the acid-indicator practical component. Neither e5d paper tasks nor an orientation label may replace the compulsory indicator experiment. e5d case-2 material completeness is a separate P design hold, not a reason to erase the source parent.',
     ['SN class8 LB5 compulsory, not selected Wahlbereich.', 'SN8 alone supports acid-indicator testing, not the entire three-category/pH d2 goal. SN9 and other current components must remain separately bound.', 'No advanced acid mechanism, blanket use/safety or recalled-name duty from recommended remarks.', 'Original e5d P design HOLD: case2 D handling card is asserted but actual rules are absent.']),
    ('SN9', 'ACCEPT_BOUNDED_PARTIAL_COMPONENT_AND_WHOLE_ORIGINAL_CELL_DUTY_DESIGN',
     'Physical27/printed15 compulsory LB1 explicitly says know acidic/basic/neutral solution properties and experimentally investigate solutions with indicators, with SE indicated; the following pH scale is also left-column content. The nearby NaOH, further hydroxide, conductivity and neutralisation experiments in physical27/28 remain their own duties.',
     'The whole unchanged d2 experimental scale-based distinction and broad pH ranges are a faithful bounded operationalisation of this selected comparison/indicator demand. No NaOH-preparation, hydration, neutralisation or pH-measurement precision is claimed from it.',
     ['SekI class9; GK/LK tags are later technical projections, not native SekI course choices.', 'The selected cell is not all LB1 or whole SN-course coverage.', 'Historical d2 gate votes remain historical; no practical learner evidence granted.']),
    ('TH', 'ACCEPT_NAMING_COMPONENT_ONLY_WHOLE_D2_SOURCE_HOLD',
     'Physical23/printed18 under 2.1.1.6 says name characteristic indicator colouring of alkaline solutions with pH>7. This is a naming/property clause. The same page separately requires pupil manufacture of calcium-hydroxide solution from calcium and indicator examination; the acid section and physical24 neutralisation likewise contain their own specific practical operators.',
     'd2 contains the relevant alkaline-colour/pH component, so the proposed PARTIAL edge is scientifically legitimate only for that component. Naming is not source proof for whole d2 school-experimental performance, the acidic/neutral distinction, solution preparation or the calcium-specific experiment. A claim that this one naming row authorises the whole practical target is rejected.',
     ['Keep original nennen operator and all neighbouring specific pupil experiments.', 'Full practical d2 acquisition/source proof remains HOLD if based only on this row.', 'The exact minimal next source step is an independently reviewed component from the actual pupil-experiment clauses, preserving their calcium/sulfur/neutralisation-specific duty; do not substitute a broad general experiment union.']),
]
source_science = []
for s, (label, verdict, authority, fit, holds) in zip(source['sourceCells'], source_reasons):
    source_science.append({
        'schemaVersion': 1, 'sourceGoalId': s['sourceGoalId'], 'jurisdiction': s['jurisdiction'],
        'decision': verdict, 'actualPrimaryAndCourseReason': authority, 'wholeDemandAndPartnerReason': fit,
        'wholeOriginalSourceCell': s['wholeOriginalSourceCell'], 'wholeProposedPartnerGoals': s['wholeProposedPartnerGoals'],
        'newComponentIds': [x['canonicalGoalId'] for x in s['wholeProposedPARTIALUnion'] if x not in s['wholeOldMappings']],
        'proposedEdges': s['wholeProposedPARTIALUnion'], 'matchTypeRemains': 'partial', 'residualHoldsAndBoundaries': holds,
        'wholeTargetAuthorizationFromThisCell': False, 'wholeCourseSourceApproval': False,
        'newP_D_A_M_VOrHumanApprovalFromSource': False, 'scientificDecidedAtUTC': ended,
    })

goal_notes = {
    'c3077d95-f3fe-5579-8493-cb92992809c4': {
        'PDesignDecision': 'ACCEPT_COMPLETE_BOUNDED_DESIGN',
        'PReasons': [
            'Both complete bilingual cases supply actual condensed structures for primary dihaloalkanes and OH-minus. Lone-pair attack on electrophilic primary C and C-Br pair departure to Br conserve valence; the O-H bond is retained and no extra proton relay is needed in the supplied OH-minus model.',
            '1,6-dibromohexane plus2OH-minus gives1,6-hexanediol plus2Br-minus; 1,3-dibromopropane likewise gives1,3-propanediol. Both overall charges are minus2 and all atoms are retained. Explicit concerted primary-C substitution is a stipulated simplified model, not a sole-pathway/yield claim.',
            'Bromoethane transfer changes functionality to a monofunctional alcohol. In the stopped-X case its exact identity is supplied, and one-equivalent mean dosage is correctly insufficient to infer every molecule is singly converted. These are genuine separately graded functionality/mechanism inferences; chain-length relabelling alone is not counted as transfer.',
            'Both12point rubrics demand all four expectations. A bare overall equation cannot substitute for both local electron-pair sequences. The tasks do not claim actual synthesis or compare SN1/SN2 kinetics.'
        ],
        'Adecision': 'atomic', 'Areason': 'The elementary substitution mechanism, its twice-repeated conversion to a diol and its monomer functionality are one bounded mechanism-to-monomer explanatory competence. No independent polyester synthesis, laboratory execution, kinetics or SN1/SN2-comparison duty is bundled.',
        'Mdecision': 'no_memory_needed', 'Mreason': 'Structures, polarity, lone-pair convention and route information are supplied; assessment requires derivation, electron/charge accounting and changed-functionality transfer. A separate recall deck is not justified.',
        'kindScience': 'curricularAtomic', 'kindReason': 'An assessable chemical mechanism competence, neither motivating orientation, memory node nor assessment terminal. This is genuine classification science, not fabricated authoritative registry transport.',
        'prerequisiteScience': 'The immediate whole d492 reaction-equation skill and preceding3899 donor/acceptor component are relevant foundations. The downstream route still inherits its actual unchanged global closure including52 missing ordinary BB/BE targets. Local design adequacy does not establish whole-scope acquisition; no edges are edited.',
        'blockingFindings': [],
    },
    'e5d6de7e-28c5-5dd8-a700-ecc1a3a7b8cd': {
        'PDesignDecision': 'HOLD_ORIGINAL_CASE2_MISSING_ACTUAL_D_HANDLING_RULES',
        'PReasons': [
            'Case1 supplies two actual acid/aqueous-sample examples, useful but bounded cleaning applications, concrete no-tasting/no-skin/no-unknown-mixing rules and the information-missing replacement transfer. It is a usable whole-goal paper case with interpretation limits, not an executed indicator experiment.',
            'Case2 says D is a citric-acid solution with supplied handling rules for the particular school sample, then asks the learner to assign rules from that card and grades e3 against concrete data. No actual D rule list or hazard-to-rule mapping is present in materialDe or materialEn. The model answer only says the rules apply to D, so it does not fill this gap. This is an unattached promised card, not fully inline material.',
            'The F transfer premise does provide enough information for the narrow negative inference that equal broad pH cannot establish identical use/handling. Exact F composition is not necessary for that negative answer. It would be necessary for a specific positive F rule assignment, which this task does not require. Do not inflate the narrow missing-D finding into an unsupported broad F defect.',
            'The source parent and whole goal are scientifically legitimate; the defect concerns the purported full second case and corresponding e3 observable. Case1 remains usable and its rich within-case evidence is not rejected for an extra-task quota. Do not approve the original two-case material as fully complete until the concrete D card is supplied or the case/profile demand is truthfully narrowed.'
        ],
        'Adecision': 'atomic', 'Areason': 'Describe the significance/use of supplied acidic everyday samples and match handling to their information is a coherent bounded material-based introductory competence. It does not bundle a separate actual laboratory procedure or an advanced acid mechanism.',
        'Mdecision': 'no_memory_needed', 'Mreason': 'Example identities, use/hazard statements and classification context are supplied. No mandatory memorised acid-name/class deck is established. Missing case2 data should be repaired in material, not hidden in a new recall prerequisite.',
        'kindScience': 'curricularAtomic', 'kindReason': 'Although the primary uses Einblick gewinnen, this authored whole goal asks objectively checkable describing and matching; it is content assessment, not the project motivational orientation node. Source demand remains introductory; no deep mechanism obligation is created.',
        'prerequisiteScience': 'No global chemical prerequisite is necessary for paper-based describing/matching when the actual relevant information is fully supplied. This does not make practical d2, handling execution, or laboratory safety optional; those are separate goals. The material gap is not solved by adding an overbroad prerequisite.',
        'blockingFindings': [{'code': 'E5D_ORIGINAL_CASE2_D_RULE_CARD_NOT_ACTUALLY_SUPPLIED', 'caseId': 'case-2', 'expectationId': 'e3', 'affectedLanguages': ['de', 'en'], 'minimalCorrection': 'Add actual concrete sample-D handling rules and the substance/hazard data needed to match them, within the existing paper-task scope. Preserve source parent, all existing cases and all goal/requires/history unless an exact separately reviewed successor says otherwise.'}],
    },
}
goal_science = []
for c, p in zip(cases, profiles):
    gid = c['goalId']
    assert c['wholeGoal'] == goals[gid]
    assert gid == p['goalId']
    goal_science.append({'schemaVersion': 1, 'goalId': gid, 'wholeGoal': goals[gid], **goal_notes[gid],
                         'wholeOriginalProfile': p, 'wholeOriginalCases': c['cases'],
                         'scientificDecidedAtUTC': ended, 'newAuthoritativeKindRegistryTransport': False,
                         'newHumanTrialOrNativeD_VApproval': False})

source_path = O / 'science/FIRST.six-original-source-cells-seven-new-partial-components.independent-a.actual.jsonl'
goal_path = O / 'science/FIRST.two-whole-goals-four-whole-cases-P-A-M-kind.independent-a.actual.jsonl'
for p, xs in [(source_path, source_science), (goal_path, goal_science)]:
    assert not p.exists()
    p.write_text(''.join(json.dumps(x, ensure_ascii=False) + '\n' for x in xs))
primary_specs = [
    ('BB', 'curricula/DE/Gymnasium/input/BB/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf'),
    ('BE', 'curricula/DE/Gymnasium/input/BE/upper-secondary/Teil_C_RLP_GOST_2022_Chemie.pdf'),
    ('MV', 'curricula/DE/Gymnasium/input/MV/Chemie_Sekundarstufe_I_2021.pdf'),
    ('SN', 'curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf'),
    ('TH', 'curricula/DE/Gymnasium/input/TH/LP_GY_Chemie_2024.pdf'),
]
assert bind(R / primary_specs[0][1])['sha256'] == bind(R / primary_specs[1][1])['sha256']
write(O / 'PROVENANCE.actual-residual6-original-first-science-independent-a.json', {
    'schemaVersion': 1, 'startedAtUTC': '2026-10-14T03:13:30.198551+00:00', 'scienceEndedAtUTC': ended,
    'provider': 'OpenAI', 'model': 'GPT-6 Codex', 'modelRevision': None, 'samplingParameters': None,
    'reviewerRole': 'Genuine independent source/P/A/M/kind-science A for exact original residual6 author packet',
    'priorExposure': 'Own earlier chemistry source/P/A/M work and unchanged d2 historical experience known. Parent announced that a separate current root residual6 science seal exists but supplied no outcomes. No current root residual6 or peer verdict, and no targeted material successor, read before this first seal.',
    'actualReads': ['All6 full original source cells and whole proposed partner bodies', 'Own pdftotext captures of full actual selected original pages and course/column conditions in BB/BE, MV, SN and TH', 'Actual original source page images BB30, MV29, SN24, SN27, TH23', 'Both full new DEEN goals, four complete DEEN materials/tasks/modelanswers/rubrics and both full original P profiles', 'Exact52 BB/BE acquisition HOLD preserved; not a re-review or whole-source approval of the52 bodies'],
    'noActiveHHostEngineRegistryGitMutation': True,
})
first = O / 'FIRST-SCIENCE-SEAL.original-residual6-source-two-whole-goal-P-A-M-kind-independent-a.actual.json'
write(first, {
    'schemaVersion': 1, 'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'scienceDecidedAtUTC': ended,
    'originalNeutral': bind(A / 'NEUTRAL.exact-six-original-duty-source-goal-view-author-inputs.json'),
    'sourceScience': bind(source_path), 'twoWholeGoalScience': bind(goal_path),
    'provenance': bind(O / 'PROVENANCE.actual-residual6-original-first-science-independent-a.json'),
    'actualOriginalPrimaryPDFs': [{'jurisdictionKey': k, **bind(R / p)} for k, p in primary_specs],
    'actualOwnWholePageTextAndImages': [bind(p) for p in sorted((O / 'inputs/primary').iterdir())],
    'currentRootOrPeerResidual6OutcomesReadBeforeSeal': False,
    'laterSuccessorMaterialReadBeforeOriginalVerdict': False,
    'newWholeCourseM6M7OrHumanApproval': False,
})
print(json.dumps(bind(first), indent=2))
