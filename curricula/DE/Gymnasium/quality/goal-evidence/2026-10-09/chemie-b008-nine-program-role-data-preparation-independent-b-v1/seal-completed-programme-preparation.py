import json, pathlib, hashlib, datetime

OWN=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-nine-program-role-data-preparation-independent-b-v1')
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(pathlib.Path(p).read_text())
def bind(p):
    p=pathlib.Path(p);b=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(name,v):
    p=OWN/name
    with p.open('x') as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
    return bind(p)

first=read(OWN/'nine-program-roles.actual-contract-input.first.freeze.json')
assert all(bind(x['path'])==x for x in first['inputs'])
api=read(OWN/'actual-existing-nine-program-source-placement-view-API.receipt.json')
cli=read(OWN/'actual-whole395-normal-atlas-CLI.failed-check.receipt.json')
schema=read(OWN/'actual-six-unregistered-catalogue-view.normal-schema.receipt.json')
assert len(api['actual27SourceOccurrences'])==27 and len(api['whole9CatalogueUnion'])==9
assert len(api['compositionCompilation'])==6 and api['secondaryPlacementCount']==17
assert cli['exitCode']==1 and '497 !== 496' in cli['stderr']
assert cli['config']['expectedCurricularAtomicGoalCount']==395 and cli['config']['expectedUnresolvedScopeDecisionCount']==496
assert schema['allValid'] and len(schema['views'])==6

verdict=put('nine-program-roles.current-API-data-blocker-and-preparation.first.verdict.json',{
    'schemaVersion':1,'role':'Own first completed technical data preparation under unchanged actual APIs; original whole9 scientific FIRST reused',
    'createdAt':NOW,'reviewer':'/root/bio_science14_independent_b','authority':'ai_candidate','status':'needs_human_review',
    'whole9SemanticFirstReused':first['inputs'][2],'freshScientificSelfReviewOfPreparedDataClaimed':False,
    'inputFIRST':bind(OWN/'nine-program-roles.actual-contract-input.first.freeze.json'),
    'actualExistingAPIReceipt':bind(OWN/'actual-existing-nine-program-source-placement-view-API.receipt.json'),
    'actualNormalSchemaReceipt':bind(OWN/'actual-six-unregistered-catalogue-view.normal-schema.receipt.json'),
    'actualOrdinaryComplete395CLIReceipt':bind(OWN/'actual-whole395-normal-atlas-CLI.failed-check.receipt.json'),
    'technicalVerdict':'DATA_ONLY_ATLAS_ROUTE_BLOCKED_BY_ACTUAL_COURSE_AND_SCOPE_CONTRACT',
    'blockers':[
        {'id':'PROGRAM9B-API-001','path':'app/scripts/goalBookSourceAtlasInputs.ts','lines':[50,61,279,304],
         'fact':'sourceAtlasFacet admits only GK/LK as course values. SekII scoping requires a nonempty course. All27 exact whole original occurrences remain SekII/unspecified; BcP subject identity and C11 NTG track/year are not alternative source facets. ProgramUnits and GoalPlacements are never read by this generator.',
         'consequence':'Adding truthful subject/track/programme data cannot manufacture a resolved GK/LK source witness. Setting false GK_LK source metadata or misclassifying stage would violate the immutable scientific boundaries.'},
        {'id':'PROGRAM9B-API-002','path':'app/scripts/goalBookModel.ts','lines':[1165,1175,1196,2308],
         'fact':'The ordinary V2 Atlas source-manifest applicability parser independently rejects a non-GK/LK course token and requires a course on every SekII source/page. Thus hand-authoring a profile-free optional-subject source view does not bypass the generator truthfully.',
         'consequence':'Neither a custom BcP/C11 course string nor omission of course is an accepted ordinary Atlas applicability role. Current dictionary is not a programme-selection model.'},
        {'id':'PROGRAM9B-API-003','path':'contracts/curriculum-package/v1/composition-view.schema.json','lines':[103,105],
         'fact':'Closed CompositionView.scope supports schoolForm/jurisdiction/stage/courseProfile/durationModel only. No chosen additional subject, programme, schoolyear, NTG track, selected learning areas or balance predicate is represented. Normal scope scoring accepts the unprofiled BY/SekII catalogues for both ordinary GK and LK requests, proved by the actual helper.',
         'consequence':'The six normal-schema catalogues are authoring/content preparations and must remain unregistered. Registration would erase the conditional programme/year/track distinctions.'},
        {'id':'PROGRAM9B-API-004','path':'app/src/landscapeTypes.ts','lines':[22,40],
         'fact':'Existing ProgramUnit/GoalPlacement permit structural program/year/track/module associations. The actual placement projector processes primary rows for tree changes and lacks the selected optional programme/year rule. Prepared secondary rows leave the entire canonical goal tree value-exact.',
         'consequence':'Secondary is a valid nonprojecting preparatory association. Primary or assessed must not be invented as evidence of an actual selected course or learner experiment.'},
        {'id':'PROGRAM9B-API-005','path':'app/scripts/goalBookModel.ts','lines':[1171,1172,1530],
         'fact':'Atlas durationModel accepts only school duration G8/G9. A Praktikum choice of one full year or two full years is a programme duration, not G8/G9.',
         'consequence':'The exact programme duration is retained in companion preparation and year units; encoding ONE_YEAR/TWO_YEARS in durationModel is not a normal Atlas solution.'},
        {'id':'PROGRAM9B-GUARD-001','path':'app/scripts/goalBookSourceAtlasInputs.ts','lines':[304],
         'fact':'Real unchanged ordinary full395 check exited1 with497!==496 before output generation. The separately introduced unspecified C11 occurrence and the historical guard mismatch remain real input uncertainty.',
         'consequence':'No output/Atlas/Source-QA success exists. Expected395/496 and all source decisions remain unchanged; no count adjustment is presented as programme resolution.'}
    ],
    'concretePreparedData':{
        'programUnits':21,'secondaryPlacements':17,'uniqueWholeOriginalGoals':9,'actualWholeSourceOccurrences':27,
        'unitPlacementFile':bind(OWN/'nine-role-program-units-and-secondary-placements.inactive.json'),
        'wholeRoleConditionalityFile':bind(OWN/'nine-whole-original-role-bindings-and-conditionality.preparation.json'),
        'catalogueIndex':bind(OWN/'unregistered-six-catalogue-views.exact-index.json'),
        'programmeDurationAndAreaBalanceCompanion':bind(OWN/'optional-programme-duration-selection-and-balance.preparation.json'),
        'normalUnchanged395496CheckConfig':bind(OWN/'whole395-unchanged-programme-uncertainty.ordinary-inputs.candidate-only.json'),
        'originalMappingsAndSourceMetadataRewritten':False,
        'sourceDutyOrWholeGoalReduced':False},
    'independentlyPossibleNextPreparation':[
        'Review the exact27 original source operators/17 secondary associations and all9 retained whole goals as conditional programme content, using the bound independent source FIRST; preserve the12/13 duplicate occurrences rather than silently reducing duties.',
        'Select actual optional subject/year terms and practical projects before authoring any learner target view. Per selected schoolyear the actual projects must cover≥3 of6 LB2–7 with biological/chemical balance; generalLB1 is considered at suitable points. Forty-two area subsets satisfy only the area count, not balance or wholeprogramme approval.',
        'Judge biological/chemical emphasis from actual projects and workload, not a rigid LB2–4 versus5–7 split. LB2 can isolate nucleic acids and LB5 can inspect materials. Preserve full manufacture, preparation, conduct, control, documentation and reflection operators of the selected goals.',
        'Keep the six actual normal-schema/normal-compiler catalogues as reviewable unregistered content. They are not ready learner-scope selectors or complete source-Atlas witnesses.',
        'A normal complete395 Atlascheck cannot become successful from these nine truthful data changes under the inspected existing interface. Completion requires a separately authorized resolved representation of the actual programme/year/track selection; this packet makes no new runtime proposal or implementation and claims no bypass.'
    ],
    'searchHistoryLimits':'Initial guessed source/contract file paths were absent; a broad metadata rg produced truncated output. Those are discovery errors, not validator failures or scientific evidence. Final blocker proof uses the exact narrow files/input bindings and actual named helper/CLI probes; fresh peer judgments were not read.',
    'noAliasMockOrSpecialValidator':True,'fullSourceAtlas395Approved':False,'normalSourceQAApproved':False,
    'currentLearnerScopeApproved':False,'nativeD_P_A_M_VApproved':False,'expected395Lowered':False,'expected496Changed':False,
    'activeWrites':0,'newScientificClosures':0,'restoredBindings':0,'strictGain':0,'humanApproval':False,'humanTrial':False})

md=OWN/'nine-program-roles.actual-data-blocker-and-prepared-route.md'
with md.open('x') as f:
    f.write('# Nine programme roles: concrete data preparation and actual API blocker\n\n')
    f.write('## Prepared under existing contracts\n\n')
    f.write('- 21 ProgramUnits: optional BcP, both actual years12/13 and all seven learning areas; separate Chemie11/NTG/LB1 structure.\n- 17 secondary placements for the exact nine whole goals, preserving both BcP year occurrences. Existing projection leaves the whole goal tree unchanged.\n- Six actual closed-schema/normal-compiler content catalogues, target union9. They remain unregistered because ordinary BY/SekII scope matching accepts them for GK and LK without optional programme/year/NTG discrimination.\n- Exact one/two-full-year programme duration, ≥3of6 content areas each year, biological/chemical balance, LB1 consideration and real practical operators are preserved in the companion preparation. Area count alone does not certify balance.\n\n')
    f.write('## Why the normal Atlas cannot consume it yet\n\n')
    f.write('The existing generator accepts SekII course metadata only as GK/LK. All27 original occurrences are genuinely course-unspecified. ProgramUnits and placements are not source facets. The independent GoalBook V2 source parser also requires GK/LK on SekII and rejects other course tokens. Closed View.scope has no optional-subject/year/track/content-selection keys; durationModel is school G8/G9, not one/two programme years.\n\n')
    f.write('No honest data-only normal Atlas route exists for these nine under the inspected unchanged interfaces. Source profiles may not be relabelled. A profile-free or invented-profile source view is not a bypass. Independently reviewable next data are the exact conditional roles, secondary associations, actual project/year selections and unregistered catalogues. A separately resolved selection representation is needed before any ordinary complete395 Atlas success can be claimed.\n\n')
    f.write('## Actual check\n\n')
    f.write('The unchanged ordinary full395/496 CLI --check exits1 at `497 !== 496`, before outputs. This is preserved as a genuine failed receipt. No active code, source originals, views, registries, plugin, runtime, canonical goals or guards were changed. No source/native/human approval or strict gain.\n')

entry=put('completed-nine-program-roles.actual-data-preparation-and-API-blocker.entry.json',{
    'schemaVersion':1,'role':'Neutral completed own nine-program-role data/API preparation handoff','createdAt':NOW,
    'reviewer':'/root/bio_science14_independent_b','inputFIRST':bind(OWN/'nine-program-roles.actual-contract-input.first.freeze.json'),
    'technicalVerdict':verdict,'summary':bind(md),
    'actualAPIReceipt':bind(OWN/'actual-existing-nine-program-source-placement-view-API.receipt.json'),
    'actualOrdinaryCLIReceipt':bind(OWN/'actual-whole395-normal-atlas-CLI.failed-check.receipt.json'),
    'preparedProgrammeData':bind(OWN/'nine-role-program-units-and-secondary-placements.inactive.json'),
    'unregisteredNormalViews':bind(OWN/'unregistered-six-catalogue-views.exact-index.json'),
    'normalSourceAtlasApproval':False,'activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})

outputs=[bind(p) for p in OWN.rglob('*') if p.is_file() and p.name!='nine-program-roles.actual-data-preparation-and-API-blocker.first.freeze.json']
seal=put('nine-program-roles.actual-data-preparation-and-API-blocker.first.freeze.json',{
    'schemaVersion':1,'role':'Immutable own completed technical FIRST, preserving all prior scientific FIRSTs',
    'createdAt':NOW,'reviewer':'/root/bio_science14_independent_b','inputs':first['inputs'],'outputs':outputs,
    'actualWhole9ScienceReusedWithoutNewSelfReview':True,'freshPeerScienceResultsRead':False,
    'ordinaryFailedReceiptPreserved':True,'activeWrites':0,'strictGain':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'completedEntry':entry,'firstFreeze':seal,'outputs':len(outputs)},indent=2))
