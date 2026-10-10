import hashlib
import importlib.util
import json
import pathlib
import shutil
from datetime import datetime, timezone

import jsonschema

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
OUT = pathlib.Path(__file__).resolve().parent
BASE = 'curricula/DE/Gymnasium/quality/goal-evidence'
V4 = ROOT / BASE / '2026-10-10/biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'

def read(p):
    return json.loads(pathlib.Path(p).read_text())

def write(p, d):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

def binding(p):
    p = pathlib.Path(p)
    if not p.is_absolute(): p = ROOT / p
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

manifest = read(OUT / 'checks/input-exact-copy-manifest.actual.json')
joins = read(OUT / 'positive/whole-current-goals-profiles-material-briefs-and-D-source-joins.json')
by_id = {r['goalId']: r for r in joins['joins']}
materials = []
for path in [
    BASE + '/2026-10-08/biologie-he7-foundations-cells-photosynthesis-ten-whole-science-author-20261008-v1/ten-whole-goals-twenty-complete-DEEN-cases.author.json',
    BASE + '/2026-10-08/biologie-he-q4-evolution-eighteen-whole-science-author-20261008-v1/eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.json',
]:
    ref = binding(path)
    target = OUT / 'materials' / (ref['sha256'][7:19] + '-' + pathlib.Path(path).name)
    shutil.copyfile(ROOT / path, target)
    manifest['copiedInputs'].append({'original': ref, 'regularExactCopy': binding(target)})

for item in manifest['copiedInputs']:
    if '/materials/' not in item['regularExactCopy']['path']: continue
    d = read(ROOT / item['regularExactCopy']['path'])
    if 'wholeCases' in d:
        rows = d['wholeCases']
        for gid in by_id:
            matched = [r for r in rows if r.get('goalId') == gid]
            if matched: materials.append({'goalId': gid, 'wholeMaterialFile': item, 'wholeCases': matched})
    else:
        records = d.get('records', d.get('goals', []))
        for r in records:
            gid = r.get('goalId')
            if gid in by_id and r.get('cases'):
                materials.append({'goalId': gid, 'wholeMaterialFile': item, 'wholeCases': r['cases']})

write(OUT / 'materials/targeted-whole-materials-and-complete-cases.exact-joins.json', {'schemaVersion': 1, 'records': materials, 'claim': 'Exact full supplied materials, tasks, model answers, transfer and rubrics retained where present; no new P approval or execution is asserted.'})
for g in joins['joins']:
    g['wholeMaterialRecords'] = [{'wholeMaterialFile': r['wholeMaterialFile'], 'caseIds': [c['id'] for c in r['wholeCases']]} for r in materials if r['goalId'] == g['goalId']]
    for dr in g['currentRegistryD']:
        row = dr['wholeResolutionRow']
        p = ROOT / dr['registryIndex']['path']
        if row.get('resolutionPath'):
            target = p.parent / row['resolutionPath']
            dr['wholeResolutionBinding'] = binding(target)
            dr['wholeRetainedResolution'] = read(target)
write(OUT / 'positive/whole-current-goals-profiles-material-briefs-and-D-source-joins.json', joins)
write(OUT / 'checks/input-exact-copy-manifest.actual.json', manifest)

atlas = read(V4 / 'sources/normal-atlas.receipt.compact.json')
aliases = read(V4 / 'sources/normal-output.portable-aliases.json')
aliases_by_path = {r['normalBookLocalPathDiagnosticOnly']: r['actualCommittableCopy'] for r in aliases['records']}
scope_rows = []
for s in atlas['scopes']:
    if s['jurisdiction'] not in ['DE-RP', 'DE-MV', 'DE-SN', 'DE-ST', 'DE-TH']: continue
    actual = aliases_by_path[s['path']]
    scope_rows.append({'key': s['key'], 'jurisdiction': s['jurisdiction'], 'stage': s['stage'], 'courseProfile': s['courseProfile'], 'wholeCompiledScopeGoalIds': s['goalIds'], 'actualRegularScope': binding(actual), 'targetedMembership': {gid: gid in s['goalIds'] for gid in by_id}})
write(OUT / 'sources/current-compiled-applicability-and-scope-joins.actual.json', {'schemaVersion': 1, 'wholeAtlas': binding(V4 / 'sources/normal-atlas.receipt.compact.json'), 'portableAliases': binding(V4 / 'sources/normal-output.portable-aliases.json'), 'coverageDirectIsNotOperatorApproval': True, 'rows': scope_rows})

MIC = '91df35c7-e384-50d6-bb3a-37e74a6086f1'
PLAN = 'd97f6957-fbc9-569c-8648-f7df5eb9dfd8'
DO = '26aa47b7-e5cc-5131-8980-0ec3271758b6'
DOC = '0f1549f6-8341-53b0-8161-5eaeb2b37809'
TISSUE = '1c3470ae-83f8-52e9-98ae-b0a712755b66'
DIGITAL = '328fd9d3-d3c3-5731-a8da-a909143d3962'
EVO = '9f73b963-5fac-5a90-a993-d7b7c0cc8526'
HUM = '3718c6fe-0b58-5ff7-996c-25ca45b609d2'
F53 = 'f53d0a0b-d9b8-5012-92b5-3a021ab6c30b'
FERM = '8e2244e1-8616-5f24-859f-8e10df1c887b'
ARG = ['0f9318ec-90eb-5381-b670-8fb2f2789c3d', '5ee0f660-66f1-5aa6-a01d-e3b010db01ff', '9540a95d-5ca5-527c-918f-d702e99be07a']
DECIDE = 'f0969375-476b-5de3-91c0-3031de7c50d1'
FUTURE = '241825f3-c26c-5ddd-9c3b-1f0460384390'

rows = []
def row(fid, jur, physical, printed, clause, status, partners, facts, needed, authority='explicit performance clause'):
    rows.append({'findingId': fid, 'jurisdiction': jur, 'physicalPages': physical, 'printedPages': printed, 'literalClause': clause, 'sourceNormativeStatus': authority, 'disposition': status, 'partnerGoalIds': partners, 'currentEvidence': [{'goalId': gid, 'activeStrictDPAMV': by_id[gid]['activeStrictDPAMV'], 'wholeGoalUnchangedFromActive': by_id[gid]['wholeGoalUnchangedFromActive'], 'registryPCount': len(by_id[gid]['currentRegistryP']), 'registryDIndexHits': len(by_id[gid]['currentRegistryD'])} for gid in partners], 'factualResolution': facts, 'exactRemainingTask': needed, 'newAtomicGoalRequired': False, 'humanExecutionRequiredForMachineM7': False})

row('RP-ARGUMENT-EXISTING3', 'DE-RP', [46], [44], 'argumentieren zu Chancen und Risiken biotechnologischer Anwendungen', 'b_existing_current_atomic_completion_open', ARG,
    'All three are actual partners in the whole TF11 argument decision and visible in the compiled RP SekI target. They have no registry-bound P config and no D resolution index hit; they are three existing incomplete atoms, outside v4 P10. f53 provides theoretical method knowledge only.',
    'Complete these three existing goals through bounded whole bilingual argument materials, independent D/P/source/native checks, A/M and current V. Preserve IDs/text unless a concrete independent finding requires a change. The parent is preparing their missing images; this audit writes no P candidate.')
row('RP-F53-NARROW-THEORY', 'DE-RP', [46], [44], 'argumentieren zu Chancen und Risiken biotechnologischer Anwendungen', 'a_KEEP_valid_narrow_partial', [F53],
    'f53 is unchanged and already strict. Current source mapping retains it as a theory contribution; the compiled RP target includes it. The mapping does not formalize prerequisiteOnly and does not show argument performance. No rewrite or re-review of valid CRISPR D/P/A/M/V follows from the unresolved argument partners.',
    'Retain exact current f53 reviews and the explicit narrow-role qualification; do not count it as completion of RP argument performance.')
row('MV-DISPERSAL', 'DE-MV', [32], [28], 'verschiedene Theorien zur Verbreitung des Menschen diskutieren', 'a_KEEP_valid_current_performance_contract', [HUM],
    'Current strict3718 is an actual whole evolution-row partner and visible in MV SekI. Its complete bilingual case2 compares exclusive regional continuity with African Homo-sapiens origins, later dispersals and limited admixture, using distinct genetic and cultural evidence and uncertainty. This matches the identified discussion product; the bounded cultural802 case need not duplicate it.',
    'None for this clause. Preserve current3718 D/P/A/M/V and complete cases.', 'Example for linking mandatory content with process competencies; do not turn all such examples into separate universal target atoms.')
row('MV-FUTURE-CULTURE', 'DE-MV', [32], [28], 'Grenzen und Chancen kultureller Evolution für die Zukunft beurteilen', 'b_contextual_P_source_binding_open', [DECIDE, FUTURE],
    'Cultural evolution itself is in Verbindliche Inhalte; the quoted future judgement is in the examples section. Actual mapped PB partners f096/241 are unchanged, strict and target-visible. Their complete current cases assess decisions and future/local/global consequences in meadow, greenhouse, lighting and food contexts. They do not currently bind a future cultural-evolution scenario. Existing3718 discusses hominin evidence, and802 analyses present effects; neither alone claims the future judgement.',
    'If this particular example is claimed as completed, add one bounded bilingual cultural-transmission/technology scenario with explicit future opportunities, limits, criteria, uncertainty and a changed premise to existing judgement partners. Review the changed P/source context only; retain all valid old cases and source example status.', 'Example for linking mandatory content with process competencies, not an additional universal compulsory culture goal.')
row('SN-AIR-YOGHURT', 'DE-SN', [30], [18], 'Experimentieren; SE; Luftfangplatten, Joghurtkulturen', 'b_contextual_P_source_binding_open', [PLAN, DO, DOC],
    'The exact primary names experimenting with these contexts. The current broad K7 source row preserves microbial theory partners; the PB row carries PLAN/DO/DOC, all strict and target-visible. Their current full profiles explicitly demand planning, carrying out and recording investigations, with cress/plant/leaf/snail cases. Those valid generic action contracts are retained. No supplied current case addresses air-exposure plates or yoghurt culture actions/results; narrow microbial usefulness is a different product.',
    'Add a source-bound safe fictional/virtual culture investigation with actual modeled setup/control/action steps, learner-produced records, evaluation and a fresh variation. Bind it to the existing PB methods and K7 context. Air/yoghurt are named contextual examples: preserve that status and avoid inventing a requirement that every learner culture both.', 'Experimentieren is the content operator; air-exposure/yoghurt appear as named SE method contexts.')
row('SN-PLANT-CROSS-SECTIONS', 'DE-SN', [43], [31], 'mikroskopischer Vergleich der Querschnitte von Moosstämmchen und Sprossachsen von Farn- und Samenpflanzen', 'b_contextual_P_source_binding_open', [MIC, TISSUE, DO, DOC],
    'The actual page is43, not44. The whole evolution source row currently includes MIC and DOC, while TISSUE is already supported/visible through plant rows. Current MIC cases use onion mounts and fault diagnosis; current full TISSUE material uses onion bulb epidermis and green leaf fields. These support preparation/tissue description, but do not supply the stated moss/fern/seed-plant cross-section comparison or assessed comparative product.',
    'Add exactly this three-plant comparison with distinct declared specimen fields, observable criteria, preparation/inspection steps, comparative drawing/table and structure-function/progression limits. Bind existing MIC/TISSUE/DOC and source row partners; preserve old material and reviews.', 'SE method context for differentiating plant tissues; no blanket physical-laboratory prerequisite for machineM7.')
row('ST-FERMENTATION-TEMPERATURE', 'DE-ST', [30,31], [30,31], 'SE zur alkoholischen Gärung unter Berücksichtigung unterschiedlicher Bedingungen planen, durchführen und protokollieren; Einfluss von Temperatur auf die alkoholische Gärung', 'b_contextual_P_source_applicability_binding_open', [PLAN, DO, DOC, FERM],
    'PLAN/DO/DOC are actual current PB partners and ST target-visible. FERM is strict and unchanged but has only BY/HE applicability, no current ST whole-row mapping and no ST compiled target membership. Its complete existing materials compare glucose supply or starters at fixed30°C; they do not demand execution of a temperature-series experiment. The old specific fermentation science remains valid and is not reopened.',
    'Add a lower-stage temperature-comparison action/protocol material to the already visible PLAN/DO/DOC partners, with controlled yeast/substrate/time/volume, temperature variation, actual virtual/model actions and records. Bind the whole current ST source row explicitly. Do not simply expose the advanced alcohol-plus-lactate FERM goal in ST based on this partial clause.', 'Temperature influence is explicitly under Verbindliche Schülerexperimente; plans/data alone cannot claim performance of the action operator.')
row('ST-MICROSCOPE-PREPARE-DRAW', 'DE-ST', [28,29], [28,29], 'einfache Frischpräparate einschließlich Kernfärbung anfertigen, mikroskopieren und zeichnerisch darstellen', 'b_contextual_P_source_binding_open', [MIC, TISSUE, DO, DOC],
    'Current MIC preparation/operation contract is retained. Current TISSUE full materials supply schematic stained plant-cell fields and allow draw OR describe in case1, and plan a drawing in case2. These are valid bounded tasks; neither an actual completed drawing nor a mandatory microscopy drawing/staining operation is automatically established. The source also differentiates fresh/permanent specimens and specifies cells/one-celled organisms.',
    'Add a bounded fresh/permanent-preparation scenario with explicit nuclear-staining handling as a school-authorized model, required microscopy drawing from a declared field, scale/labels, specimen record and artifact/focus transfer. Evaluate the specified actions and drawing rather than expected answers alone. Retain old MIC/TISSUE cases.', 'Explicit MIK performance; includes nuclear staining. This audit does not close other unscoped ST whole duties such as hay-infusion movement.')
row('ST-SELECTION-MODEL', 'DE-ST', [44,45], [44,45], 'SE Modellexperiment zur Selektion durchführen und auswerten', 'b_contextual_executable_P_material_binding_open', [DO, DOC, EVO],
    'EVO is a current mapped evolution partner, and the PB methods carry actual execution/recording contracts. Existing713e models describe interactions/limits but do not execute a selection experiment. Current modeled inquiry82ac genuinely has executable seed/light media, but compiled ST SekI excludes82ac; it must not be blindly reinstated. No retained selected material executes the stated selection model.',
    'Provide a finite selection experiment that is actually executable: defined starting variants, selection rule, reproduction/update, repeated rounds, user-generated counts, evaluation and changed-condition transfer. Bind to the current ST-visible execution/documentation/evolution partners and whole source; preserve model-interpretation reviews.', 'Modellexperiment zur Selektion is explicitly repeated under Verbindliche Schülerexperimente.')
row('ST-SELECTION-SOFTWARE', 'DE-ST', [44], [44], 'Prinzip des Variations-Selektionsmechanismus mithilfe von Simulationssoftware als Grundlage der Auslesezüchtung anwenden', 'b_contextual_executable_P_material_binding_open', [DIGITAL, DO, EVO],
    'Current DIGITAL is strict, mapped through PB and ST-visible. Complete retained cases perform raw-card entry, import/type/missing-value checks, spreadsheet calculations and charting; this is a valid digital-data contract, but it is not yet the named selection simulation. Current EVO explains hereditary variation and differential reproduction. The combination has no bounded material demonstrating user-selected breeding/selection parameters, execution and analysis of changed runs.',
    'Supply a simple declared fictional selection/breeding simulation with real controls, explicit model assumptions, repeated runs and captured outputs; require parameter/action record, effect interpretation and transfer. Bind existing DIGITAL/DO/EVO, not a new runtime endpoint or schema exception.', 'Explicit CS application clause; school software execution is represented by an assessed machine material contract, not actual Human Trial.')
row('TH-MICROSCOPE-FRESH-DRAW', 'DE-TH', [21], [15], 'Herstellen von Frischpräparaten, Mikroskopieren von Frisch- und Dauerpräparaten; Auswerten von mikroskopischen Bildern; Anfertigen mikroskopischer Zeichnungen', 'b_partial_KEEP_plus_drawing_material_binding_open', [MIC, TISSUE, DO, DOC],
    'Actual K78 source row contains MIC/TISSUE and PB carries DO/DOC; all are already strict and TH target-visible. MIC already designs fresh onion preparation and safe operation/fault correction, so that component is retained. TISSUE contains image analysis and a drawing option, not an obligatory drawn learner product across fresh/permanent specimens. No current bound material closes the complete named drawing operator.',
    'Reuse the ST/TH drawing/preparation supplement with a distinct TH source locator: require a labeled/scale-bound drawing from a declared specimen field, record fresh versus permanent preparation and microscope operations, then analyze a fresh artifact/focus condition. Review only added material/source binding.')
row('MV-YEAST-MICROSCOPY', 'DE-MV', [17], [13], 'Mikroskopie von Hefepilzen', 'b_contextual_P_source_binding_open', [MIC, DO, DOC],
    'The primary places yeast microscopy under Verbindliche Inhalte, and the whole J7 row maps MIC. MIC and PB methods are already strict and MV-visible. Their complete material uses plant/onion preparations and generic leaf/plant protocols, with no yeast-specific field, preparation action or assessed observation record. Existing microbial usefulness theory is only a different source contribution.',
    'Add one bounded yeast-preparation/microscope/record case to the microscopy supplement. Supply a declared synthetic field with identifiable cells and budding versus artifacts, actual modeled preparation/focus steps, a learner-produced record/drawing and altered field. Retain generic MIC science and no claim of actual specimen/learner execution.', 'Explicit mandatory yeast microscopy content; no requirement to collect real learner or laboratory evidence for machineM7.')

facts = {
    'schemaVersion': 1,
    'role': 'source-partner AUTHOR triage and resolution input, not fresh independent D/P/V review',
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'scope': 'Only the twelve named RP/MV/SN/ST/TH source-performance findings for inactive Bio8v4',
    'activeBaseline': {'bioDenominator':394, 'bioStrict':353, 'mathStrict':807, 'physicsStrict':478, 'strictGain':0, 'humanApproval':0, 'humanTrial':0},
    'decisions': rows,
    'realNewAtomicCompetenceProposals': [],
    'boundedAuthorPacks': [
        {'pack':'RP-existing-three-argument-goals', 'goalIds':ARG, 'findingIds':['RP-ARGUMENT-EXISTING3'], 'output':'Whole D/P/source/native and A/M/V completion of actual existing three atoms; parent provides image candidates.'},
        {'pack':'retained-microscopy-context-supplements', 'goalIds':[MIC,TISSUE,DO,DOC], 'findingIds':['SN-PLANT-CROSS-SECTIONS','ST-MICROSCOPE-PREPARE-DRAW','TH-MICROSCOPE-FRESH-DRAW','MV-YEAST-MICROSCOPY'], 'output':'Four precisely attributed source context variants with required preparation/observation/drawing/action products; no replacement of accepted rasters.'},
        {'pack':'retained-microbial-experiment-context-supplements', 'goalIds':[PLAN,DO,DOC], 'findingIds':['SN-AIR-YOGHURT','ST-FERMENTATION-TEMPERATURE'], 'output':'Bounded culture and controlled fermentation-temperature action/protocol cases; keep advanced fermentation goal and regional applicability.'},
        {'pack':'retained-selection-executable-context-supplement', 'goalIds':[DO,DOC,DIGITAL,EVO], 'findingIds':['ST-SELECTION-MODEL','ST-SELECTION-SOFTWARE'], 'output':'Finite executable selection model/software task with independently checked actual controls, counts, output capture, interpretation and transfer.'},
        {'pack':'optional-MV-future-culture-context-supplement', 'goalIds':[DECIDE,FUTURE], 'findingIds':['MV-FUTURE-CULTURE'], 'output':'Only when claiming this source competency example: cultural-evolution future judgement with criteria, limits, uncertainty and changed premise.'},
    ],
    'workableBio8v4IntegrationConditions': [
        'Keep accepted targeted v4 D/P/V and the three independently reviewed real requires changes under the exact input/fingerprint bindings. This audit does not alter those scientific decisions.',
        'Retain whole current source rows and all other partner duties with their explicit limited/partial/example/optional statuses. coverage=direct, raw applicability or a broad source row do not provide full operator approval.',
        'This audit adds no new mandatory atomic goals and does not justify restarting the unchanged curriculum or its353 strict reviews. Source-context supplements are targeted, additional author work; historical current reviews stay operative until an actual changed binding requires its own review.',
        'Do not claim whole RP argument or complete specific practical operator clearance before the listed bounded work is authored and independently resolved. A narrow Bio8 contribution can be integrated with explicit retained unresolved partner duties; partial acceptance is not whole-course completion.',
        'MV dispersal3718 and narrow f53 science need no new author/reviewer task. Generic methods/microscopy/digital/fermentation strict goals remain retained. Human execution/approval/trial is separate and remains0.',
    ],
    'claimLimits': {'reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','humanApproval':0,'humanTrial':0,'actualLearners':0,'actualExperiments':0,'newIndependentDScienceReviews':0,'newPCandidates':0,'strictActiveGain':0,'activeWrites':[],'GitOrGitHubWrites':[],'historicalWrites':[],'runtimeOrValidatorOrSchemaChanges':[]},
}
write(OUT / 'source-operator-partner-resolution.author.json', facts)

before = read(OUT / 'checks/root-guard.before.json')
after = [binding(r['path']) for r in before['bindings']]
changes = [{'before': b, 'after': a} for b,a in zip(before['bindings'],after) if b != a]
write(OUT / 'checks/root-guard.after.actual.json', {'schemaVersion':1,'before':binding(OUT / 'checks/root-guard.before.json'),'activeInputsByteExact':not changes,'changes':changes,'ownWritesLimitedToOutputNamespace':True,'ownActiveWrites':[],'note':'Concurrent sibling output namespaces are outside this audit; this guard binds active registry/canonical/kinds/QA/A/M-config inputs only.'})

profile_schema = read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
config_schema = read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')
landscape_schema = read(ROOT / 'docs/landscape-runtime.schema.json')
checked = []
for g in joins['joins']:
    for p in g['currentRegistryP']:
        jsonschema.Draft202012Validator(profile_schema).validate(p['wholeCurrentRecord'])
        jsonschema.Draft202012Validator(config_schema).validate(p['wholeConfig'])
        checked.append(g['goalId'])
jsonschema.Draft202012Validator(landscape_schema).validate(read(V4 / 'candidate/whole483-final-text-source-image.inactive.json'))
spec = importlib.util.spec_from_file_location('ordinary_validate_schemas', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(str(ROOT))
assert not symlink_errors, symlink_errors
parsed = []
for path in OUT.rglob('*'):
    if not path.is_file(): continue
    assert not path.is_symlink(), path
    if path.suffix == '.json': read(path); parsed.append(str(path.relative_to(OUT)))
    elif path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip(): json.loads(line)
        parsed.append(str(path.relative_to(OUT)))
for c in manifest['copiedInputs']:
    o = binding(c['original']['path'])
    cp = binding(c['regularExactCopy']['path'])
    assert o == c['original'] and cp == c['regularExactCopy']
    assert o['sha256'] == cp['sha256'] and o['bytes'] == cp['bytes']
assert not changes, changes
write(OUT / 'checks/scoped-normal-schema-format-portability.actual.json', {'schemaVersion':1,'normalExistingSchemasUsed':['contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','docs/landscape-runtime.schema.json'],'retainedProfileConfigPairsValidated':len(checked),'whole483LandscapeSchemaPassed':True,'allWrittenJSONJSONLParsed':len(parsed),'regularExactCopies':len(manifest['copiedInputs']),'curriculumSymlinkErrors':symlink_errors,'rootGuardByteExact':True,'newReviewJudgmentsOrPApprovals':0})

lines = ['# Bio8 source-operator partner triage, 11 October 2026', '', 'Author resolution input. Active strict gain0; Human Approval/Trial0. No active, historical, Git or GitHub writes. This is an additional targeted source audit; it does not replace current independent reviews.', '', 'The exact current353 central IDs, whole v4 candidate/source rows, all53 registry P-config scopes, complete relevant profiles/materials and current D resolutions are joined in the accompanying JSON. Thirteen actual primary page locators were read; eight whole page rasters were inspected. Raw canonical applicability was checked against the current24-scope compiled atlas.', '', '| Finding | Resolution | Actual remaining work |', '| --- | --- | --- |']
for r in rows:
    lines.append('| ' + r['findingId'] + ' | ' + r['disposition'] + ' | ' + r['exactRemainingTask'].replace('|','/') + ' |')
lines += ['', 'There is no demonstrated need for a new atomic goal ID in these twelve findings. Three existing RP argument goals still require their own normal completion. Four compact retained-context packs cover the other concrete source products; the MV future-judgement pack retains the primary page\'s example status.', '', 'MV3718 already has the full dispersal-theory discussion contract: KEEP. f53 remains a valid narrow CRISPR theory contribution: KEEP. Retain every unchanged current strict goal and its reviewed cases/images. Source context additions receive independent targeted review; no full unchanged-course restart is warranted.', '', 'A narrow v4 Bio8 contribution may be integrated with explicit unresolved partner duties. Do not report whole source/operator clearance from direct-coverage metadata or interpret expected answers as unaddressed action execution. A fictional or virtual executable product can be assessed for machine QS, while actual learner performance and release acceptance remain separate.', '', 'Applicable rights follow LICENSING.md. Exact official primary copies retain their original publisher/license; own didactic material remains under its existing content license. Audit tooling and developer prose are Apache-2.0.']
(OUT / 'README.md').write_text('\n'.join(lines) + '\n')

entry = {'schemaVersion':1,'entryKind':'inactive Bio8 current source-operator partner triage AUTHOR portable FINAL','createdAt':datetime.now(timezone.utc).isoformat(),'role':'author_resolution_input_not_independent_reviewer','outputNamespace':str(OUT.relative_to(ROOT)),'sourceResolution':binding(OUT / 'source-operator-partner-resolution.author.json'),'wholeGoalProfileMaterialDJoins':binding(OUT / 'positive/whole-current-goals-profiles-material-briefs-and-D-source-joins.json'),'wholeMaterialJoins':binding(OUT / 'materials/targeted-whole-materials-and-complete-cases.exact-joins.json'),'wholeCurrentSourceRows':binding(OUT / 'sources/targeted-whole-source-rows-and-current-partners.exact.json'),'compiledApplicability':binding(OUT / 'sources/current-compiled-applicability-and-scope-joins.actual.json'),'primaryPageBindings':binding(OUT / 'primary/actual-whole-primary-page-bindings.json'),'inputManifest':binding(OUT / 'checks/input-exact-copy-manifest.actual.json'),'registryOnlyPScan':binding(OUT / 'positive/registry-only-scope-scan.actual.json'),'normalCheck':binding(OUT / 'checks/scoped-normal-schema-format-portability.actual.json'),'rootGuard':binding(OUT / 'checks/root-guard.after.actual.json'),'README':binding(OUT / 'README.md'),'result':{'findings':len(rows),'validSpecificKEEPRows':2,'otherPartiallyRetainedSourceBindings':9,'existingAtomicCompletionPacks':1,'newAtomicGoalProposals':0,'strictGain':0,'humanApproval':0,'humanTrial':0,'activeWrites':[],'historicalWrites':[],'GitOrGitHubWrites':[],'PCandidatesWritten':0}}
write(OUT / 'neutral-Bio8-source-operator-partner-triage-author.portable-final.entry.json', entry)
freeze = {'schemaVersion':1,'freezeKind':'portable_final_author_triage_no_independent_approval','createdAt':datetime.now(timezone.utc).isoformat(),'entry':binding(OUT / 'neutral-Bio8-source-operator-partner-triage-author.portable-final.entry.json'),'artifacts':[binding(p) for p in sorted(OUT.rglob('*')) if p.is_file() and p.name != 'neutral-Bio8-source-operator-partner-triage-author.portable-final.freeze.json'],'claimLimits':facts['claimLimits']}
write(OUT / 'neutral-Bio8-source-operator-partner-triage-author.portable-final.freeze.json', freeze)
print(json.dumps({'entry':entry['entryKind'],'findings':len(rows),'newAtoms':0,'strictGain':0,'normalChecks':'PASS','rootGuard':'BYTE_EXACT','finalEntry':str((OUT / 'neutral-Bio8-source-operator-partner-triage-author.portable-final.entry.json').relative_to(ROOT))}))
