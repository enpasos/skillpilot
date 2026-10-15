import hashlib
import json
import pathlib
from datetime import datetime, timezone
import jsonschema

BASE = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15')
ROOT = BASE / 'chemie-equilibrium-four-source-scope-candidate-author-20261015-v1'
OLD = BASE / 'chemie-equilibrium-four-source-scope-author-20261015-v1'
CURRENT = BASE / 'chemie-one-analgesic-rezeptfrei-terminology-author-20261015-v1'
CANON = ROOT / 'candidate/canonical560.current422.two-model-bound-descriptions.author.json'
SEM = ROOT / 'candidate/semantic560.two-description-source-identities.author.json'
SCHEMA = pathlib.Path('docs/landscape-runtime.schema.json')
NOW = datetime.now(timezone.utc).isoformat()

def ref(path):
    p = pathlib.Path(path)
    b = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes':len(b)}

def read(path):
    return json.loads(pathlib.Path(path).read_text())

def write(name, body):
    p = ROOT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f:
        f.write(json.dumps(body, ensure_ascii=False, indent=2) + '\n')
    return ref(p)

# Exactly one local normal runtime-schema check, confined to the changed whole canonical.
canonical = read(CANON)
jsonschema.validate(canonical, read(SCHEMA))
write('checks/SCHEMA.only-changed-whole-canonical.actual.json', {
    'role': 'Single local stock runtime-schema validation, not D/P/A/M/V review',
    'canonical': ref(CANON), 'schema':ref(SCHEMA),
    'whole560GoalsValidated':True, 'exitCode':0, 'newScientificVotes':0,
})

# Preserve the already sealed scientific plan, whole source bodies and original unions.
old_seal = read(OLD / 'FILES.finite-own-source-scope-author.seal.json')
old_refs = []
def collect(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            p = pathlib.Path(value['path'])
            if p.is_file():
                actual = ref(p)
                assert actual['sha256'].removeprefix('sha256:') == value['sha256'].removeprefix('sha256:'), p
                if 'bytes' in value: assert actual['bytes'] == value['bytes'], p
                old_refs.append(actual)
        for child in value.values(): collect(child)
    elif isinstance(value,list):
        for child in value: collect(child)
collect(old_seal)
source_context = read(OLD / 'context/whole-original-and-additional-source-cells-union-edges.author-reading.json')
collect(source_context)
source_input = read(ROOT / 'INPUTS.current-fccb-3e8f-and-source-plan.neutral-author.selector.json')
collect(source_input)
old_goals = read(OLD / 'context/whole-current-partners-prereqs-and-parents8152.exact.json')['goals']
before_goals = read(CURRENT / 'candidate/canonical560.current422.one-rezeptfrei-term.author.json')['goals']
before_by_id = {g['id']:g for g in before_goals}
assert all(g == before_by_id[g['id']] for g in old_goals)
routes = []
for route in source_context['routes']:
    extraction = read(route['originalExtraction']['path'])
    routes.append({
        'jurisdiction':route['jurisdiction'],
        'wholeOriginalExtraction':ref(route['originalExtraction']['path']),
        'wholeOriginalMapping':ref(route['originalMapping']['path']),
        'wholeOriginalSelectedCells':len(route['wholeOriginalNeutralSourceGoals']),
        'wholeAdditionalSelectedCells':len(route['additionalWholeSourceGoalsOmittedFromNeutral']),
        'wholeSelectedCellIds':[g['id'] for g in route['wholeOriginalNeutralSourceGoals'] + route['additionalWholeSourceGoalsOmittedFromNeutral']],
        'unchangedUnionEdges':route['originalNeutralUnionEdges'] + route['additionalActualWholeUnionEdges'],
        'officialNormativeAntecedentDocuments':extraction.get('sourceDocuments', [extraction.get('sourceDocument')]),
        'additionalAuthoredComponentIsNotTheseOfficialCells':True,
    })
write('context/official-antecedents-and-exact-unions.references.json', {
    'schemaVersion':1,
    'role':'Unchanged official antecedents and union context; own components are separate non-official author declarations',
    'wholeSourceBodySelection':ref(OLD / 'context/whole-original-and-additional-source-cells-union-edges.author-reading.json'),
    'wholeBY13Supplement':ref(OLD / 'context/supplement-BY13-whole-acid-base-source-cells-union-partners.exact.json'),
    'routes':routes,
    'completeOriginalRawUnion':source_context['allRawCompanionRoutesPreservedAt'],
    'wholeOriginal70PartnerBodies':ref(OLD / 'context/whole-current-partners-prereqs-and-parents8152.exact.json'),
    'all70PartnerContextBodiesEqualCurrentFccbBasis':True,
    'targetDescriptionsAfterAuthorEditAt':ref(CANON),
    'primaryReadingScope':ref(OLD / 'reading/PRIMARY.actual-read-and-fetch-scope.json'),
    'HE2027CompleteChemieReadingAndNegativeBoundary':ref(OLD / 'FIRST.supplement-whole-BY13-and-HE2027-author-addendum.json'),
    'RPSeparateOpenEdgeObstacle':ref(OLD / 'proposal/RP-Kp-whole-source-context-and-existing-edge-obstacle.author.json'),
    'newSourceApprovals':0,
})
write('checks/CAS.original-source-plan-FIRSTs-and-unions-unchanged.actual.json', {
    'role':'Technical retention of historical scientific bodies, not a source review',
    'oldFiniteSeal':ref(OLD / 'FILES.finite-own-source-scope-author.seal.json'),
    'checkedHistoricalFileReferences':list({r['path']:r for r in old_refs}.values()),
    'allSelectedHistoricalDigestsAndBytesExact':True,
    'wholeOriginal70ContextBodiesEqualFccbBasis':True,
    'officialExtractionOrMappingWrites':0, 'newScientificVotes':0,
})

model_paths = [
    pathlib.Path('curricula/DE/Gymnasium/mapping/DE-HE/source-components/he-lk_biology_neurobiology_bounded_components.reviewed-20261007-v1.review.json'),
    pathlib.Path('curricula/DE/Gymnasium/mapping/DE-HE/source-components/biologie-bio8-current397-dual-reviewed-20261011-v6.review.json'),
]
models = []
for path in model_paths:
    data = read(path)
    examples=[]
    for kind in ['authoredModelSpecialisation','authoredExtensionNotNamedMandatory']:
        rows = [d for d in data.get('decisions',[]) if d.get('sourceKind') == kind]
        if rows:
            d=rows[0]
            examples.append({k:d[k] for k in ['sourceGoalId','canonicalGoalIds','sourceKind','wholeOriginalSourceCoverage','wholeCanonicalGoalApproval'] if k in d})
    models.append({'mappingStructureExample':ref(path), 'extractionStructureExample':ref(data['sourceExtractionPath']), 'fieldExamplesOnly':examples})
write('context/EXISTING.repository-sourceKind-conventions.actual.json', {
    'role':'Read-only reference to existing record structures, no import of their judgments or approvals',
    'examples':models,
    'reusedStructure':['sourceLandscapeId','targetLandscapeId','sourceExtractionPath','sourceGoals','sourceDocumentKey','sourceKind','mappings.legacyGoalId','mappings.canonicalGoalId','mappings.matchType','wholeOriginalSourceCoverage:false','wholeCanonicalGoalApproval:false'],
    'ownCandidateDifferencesRequiredByTruth':[
        'Own authored document has official:false, no invented official URL.',
        'decisions:[] and zero reviewed/mapped summary counts; compatibility mappings/authorProposals are unreviewed partial suggestions.',
        'CourseLevel LK denotes proposed own course application. Official antecedent course/headings remain in exact referenced original bodies.',
        'sourceKind is existing provenance modelling, not an implemented optional runtime choice or automatic source-scope approval.'
    ],
    'validationScope':'No general source schema, source review checker or source atlas build invoked. JSON authoring structures follow the cited existing repository collection shapes and retain the genuine pending-review boundary.',
    'newReviewVotes':0,
})

input_config = pathlib.Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
manifest = pathlib.Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.sources.json')
book_config = pathlib.Path('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json')
mappings = [str(ROOT / f'candidate/mappings/{j}.scope4.unreviewed-author.mapping-candidate.json') for j in ['DE-BY','DE-HE']]
delta = write('candidate/isolated-source-atlas-registration.required-delta.author.json', {
    'schemaVersion':1,
    'role':'Isolated unselected registration and reader-change proposal; not runnable as a release candidate with the current reader',
    'status':'needs-independent-source-course-adoption-and-separate-reader-design',
    'active':False,
    'existingBookConfig':ref(book_config), 'existingInputCompanion':ref(input_config), 'existingManifest':ref(manifest),
    'candidateInputs':{'canonical':ref(CANON),'semantic':ref(SEM),'unreviewedMappingCandidates':mappings},
    'hypotheticalCompanionDeltaAfterAdoption':[
        {'op':'replace','path':'/landscapePath','value':str(CANON)},
        {'op':'replace','path':'/semanticKindLedgerPath','value':str(SEM)},
        *[{'op':'add','path':'/mappingPaths/-','value':p} for p in mappings],
    ],
    'deltaMustNotBeAppliedNow':True,
    'actualReaderBoundaries':[
        {'path':'app/scripts/goalBookSourceAtlasInputs.ts','lines':[232,244,250,251,256,289,302],
         'actualBehavior':'Reads only config.mappingPaths and mapping.decisions. Requires reviewer/reviewedAt/rationale before the mapped filter, requires complete decision coverage, then document.official===true. It neither reads sourceKind nor authorProposals. A mapped witness is labelled profileBasis:source-metadata. Our empty decision lists fail complete review coverage; fabricating mapped/reviewed/official data to pass is forbidden.'},
        {'path':'app/scripts/goalBookOriginalSources.ts','lines':[58,79,128,162,164,171],
         'actualBehavior':'Current original-source selection comes from the checked input companion mappingPaths. Only decision:mapped rows contribute and only official URLs are emitted. sourceKind is not emitted as an authorship distinction. A non-official author declaration must not masquerade as an official original source.'},
        {'path':'app/scripts/goalBookSourceAtlasInputs.ts','lines':[227,289,296,354],
         'actualBehavior':'Existing profileBasis variants are source-metadata and authored-view. The authored-view fallback is explicitly limited to BB/BE, not an authorization for BY/HE authored extensions. Generated sourcePaths and navigation derive from the actual scoped union; this task does not regenerate them.'},
    ],
    'minimumSeparateReaderDesignToReview':[
        'Keep official normative antecedents and authored component/course declarations as different provenance routes. Preserve the original source duty, source course, source exclusions and whole partner unions.',
        'Decide source/course applicability independently on all eight actual author components and the complete four-goal material context. Preserve the HE2027 and Nernst exclusions; a model contribution is not full official coverage.',
        'If a future source-atlas reader is asked to display adopted authored components, add an explicit authorship-preserving route and visible role; do not relabel them source-metadata or make their documents official.',
        'Review the corresponding original-source output route so it cannot turn authored material into an official quotation/link. Retain ordinary official-source evidence as context.',
        'Only after that separate implementation/adoption bind an isolated matching book input companion and generated manifest. No count change, target removal, prerequisiteOnly conversion or core:false trick in this candidate.'
    ],
    'existingSourceAtlasCountObservedOnly':read(input_config)['expectedCurricularAtomicGoalCount'],
    'currentSemanticCurricularAtomicClassesRetained':422,
    'countsNotRewrittenOrEquated':True,
    'sourceAtlasInclusionClaimed':False,
    'runtimePublicationOrReviewApproval':False,
})

for script in ['prepare_equilibrium_scope4_candidate_author.py','finalize_equilibrium_scope4_candidate_author.py']:
    src = pathlib.Path('tmp/chemie-m7-resumed-20261015') / script
    dest = ROOT / 'scripts' / script
    dest.parent.mkdir(exist_ok=True)
    with dest.open('xb') as f: f.write(src.read_bytes())

readme = '''# Vier Gleichgewichtsziele: inaktiver Quellen-/Kurskandidat

Eigener **Autorenkandidat**, keine neue unabhängige Reviewrolle. Eigene Inhalte: CC-BY-4.0; technische Skripte: Apache-2.0. Amtliche Quellen behalten ihre Rechte.

## Tatsächlicher Nachfolger

Ausgangspunkt ist der aktuelle Canon `fccb633f…` mit dem unveränderten „rezeptfrei“-Ziel und Semantic `3e8f562f…`.
Genau die DE/EN-Beschreibungen von Kp/Kc (`a8ddb351`) und Pourbaix (`f0f2c5f8`) wurden aus dem versiegelten Quellenplan in eine **ganze Canonical560-Kopie** übernommen. Die Beschreibung nennt jetzt die vorgegebenen idealen Gas-/thermodynamischen Modelle, Standardzustände, Herleitung/Konstruktion und die echten Grenzen. Die vorhandenen ganzen Fälle tragen diese Leistungen bereits.
van’t Hoff (`e0d4f08a`) und gekoppelte Gleichgewichte (`1a51362e`) behalten ihre aktuellen ganzen Texte. Alle anderen 558 ganzen Ziele, alle 560 IDs und sämtliche Graph-, Kurs-, Anwendungs-, Gewichtungs-, Provenienz- und Assetfelder sind exakt. Nur zwei Stock-Quellenidentitäten wurden nachgebunden; alle 560 wurden technisch verglichen. Die vorhandenen 422 semantischen Klassen bleiben unverändert; dies ist keine neue Atomizitätsfreigabe.

## Acht ehrlich deklarierte Komponenten

| Ganze Kompetenz | BY-Autorenrolle | HE-Autorenrolle |
| --- | --- | --- |
| Kp/Kc | authoredExtensionNotNamedMandatory | authoredExtensionNotNamedMandatory |
| van’t Hoff | authoredModelSpecialisation | authoredExtensionNotNamedMandatory |
| gekoppelte Gleichgewichte | authoredModelSpecialisation | authoredExtensionNotNamedMandatory |
| Pourbaix | authoredExtensionNotNamedMandatory | authoredExtensionNotNamedMandatory |

Die zwei BY-Modellkomponenten operationalisieren begrenzte mathematische Modellleistungen; sie ersetzen keine ganze amtliche Optimierungs-, Daten-, Modell- oder EDTA-Kompetenz. Keine der vier speziellen ganzen Methoden wird als amtlich benannte BY-/HE-Pflicht ausgegeben.

Die acht bisherigen Autoren-UUIDs und ganzen konstruktiven Rollenbegründungen sind in zwei normalen Extraktions-/Mapping-Kandidatenkollektionen enthalten. Die eigenen Komponentendokumente sind ausdrücklich `official:false`. Amtliche normative Antezedenten, ganze Quellenzellen, Kurs-/Wahlpflichtgrenzen und Partner/Unionkanten bleiben getrennt und unverändert referenziert. `decisions:[]`, null reviewed/mapped und acht unreviewte partielle Vorschläge gewähren keine M3-Freigabe. Die vorhandenen Repositorybeispiele belegen die `sourceKind`-Konvention, ihre alten Urteile werden nicht übertragen.

## Explizite Anwendungs-/Kursdeklaration zur Prüfung

Alle vier Kompetenzen bleiben im vorhandenen SkillPilot-LK-Zieluniversum. Sie sind als verfasste Erweiterungen sichtbar zu machen; für zwei BY-Anteile wird zusätzlich eine begrenzte Modelloperationalisierung vorgeschlagen. Diese Deklaration ist unreviewt. Sie schafft keine optionale Runtimewahl, ändert keinen Nenner und ist keine Runtime-/Releasefreigabe.

Der reine vorhandene Kompositionscompiler belegt alle vier als Targets der nationalen SkillPilot-LK-Ansicht und der HE-LK-Ansicht. Unveränderte Tags nennen LK; unveränderte Anwendbarkeit nennt BY und HE. Es wurde keine eigene BY-LK-Ansicht erfunden. Die tatsächlich vorhandenen generierten BY-/HE-SourceAtlas-LK-Ansichten enthalten keine der vier IDs. Diese beiden Tatsachen werden nicht gleichgesetzt.

## Gegenbelege und verbleibende Grenze

Die historischen FIRST und das separat versiegelte HE2027-Addendum bleiben exakt. HE Q3.3 schließt pH-/Temperaturabhängigkeit der Nernst-Rechnung aus. Der tatsächlich vollständig gelesene Chemieteil des Abiturerlasses 2027 begrenzt die weitere Komplexbetrachtung bei Fehling. Das bleibt ein datierter Prüfungsschwerpunkt und keine Behauptung für alle Jahrgänge. Allgemeine mathematische Operatoren setzen diese Grenzen nicht außer Kraft.

RP nennt Kp im Vertiefungs-/Verzahnungsabschnitt; die bestehende als exact geführte Kante zum Sek-I-Gasnachweisziel `580b3616` bleibt als konkretes Hindernis dokumentiert und unverändert. RP wird nicht in den heutigen BY-/HE-Geltungsbereich umgeschaltet.

Eine bloße Registrierung der Kandidaten im aktuellen SourceAtlas wäre falsch: `goalBookSourceAtlasInputs.ts` verarbeitet reviewed/mapped-Zeilen und verlangt amtliche Dokumente; `sourceKind` wird dort nicht unterschieden. `goalBookOriginalSources.ts` wertet ebenfalls nur mapped/amtlich aus. Das isolierte Delta unter `candidate/isolated-source-atlas-registration.required-delta.author.json` beschreibt die tatsächlichen Codepfade und den separaten Bedarf, Originalquellen und verfasste Kursanteile sichtbar getrennt zu behandeln. Es wurde weder angewendet noch implementiert. Kein zusätzliches Buchmanifest wurde aktiv geändert, kein Atlas gerendert oder freigegeben.

## Ganze Materialien und Nachweise

Die vollständigen 32 Fälle `c9d14994…` und 16 Profilkörper `03bb29af…` bleiben exakt referenziert. Die acht einschlägigen ganzen Fälle und vier ganzen Profilkörper liegen zusätzlich als exakte kleine Leseauswahl vor; 09-b enthält die ausdrückliche verdünnt-ideale Näherung in DE/EN. Keine beobachteten Schüler-/Labordaten und keine Humanfreigabe werden behauptet.

Ausgeführt wurden genau ein lokaler Runtime-Schemacheck der geänderten ganzen Canonical560-Kopie und der reine Stock-Quellenidentitätsvergleich mit vier lesenden Kompositionscompiler-Aufrufen. Objekt-/Bytevergleiche belegen den engen Umfang. Kein D/P/A/M/V-Votum, kein Quellenreviewlauf, Native-Render, zentraler Lauf, Gesamtbuild, Git- oder aktiver Registry-/Runtimewrite.

Einstieg: `NEUTRAL.finite-four-source-scope-candidate-author.selector.json`. Endlicher Abschluss: `FILES.finite-own-candidate-author.seal.json`. Ein späteres unabhängiges Vierer-Prüfpaket muss diese tatsächlich geänderten Ziele, acht Rollen, ganze Materialien und unveränderten Gegenbelege prüfen. **STOP.**
'''
p = ROOT / 'README.md'
with p.open('x') as f: f.write(readme)

selector = write('NEUTRAL.finite-four-source-scope-candidate-author.selector.json', {
    'schemaVersion':1, 'role':'Finite inactive informed author candidate; no scientific review grant',
    'createdAtUTC':NOW,
    'canonical':ref(CANON), 'semanticSourceIdentityOnly':ref(SEM),
    'neutralInputs':ref(ROOT / 'INPUTS.current-fccb-3e8f-and-source-plan.neutral-author.selector.json'),
    'firstBeforeCandidate':ref(ROOT / 'FIRST.actual-source-role-and-two-description-continuation.author.json'),
    'firstSeal':ref(ROOT / 'FIRST.author-before-candidate.seal.json'),
    'historicalFirstsAndHE2027CounterevidencePreservedAt':ref(OLD / 'NEUTRAL.finite-four-source-scope-author-plan.json'),
    'sourceComponentExtractions':[ref(ROOT / f'candidate/source-components/{j}.scope4.author.source-extraction.json') for j in ['DE-BY','DE-HE']],
    'unreviewedM3Candidates':[ref(p) for p in mappings],
    'courseDeclaration':ref(ROOT / 'candidate/four-whole-goal-course-role.declaration.author.json'),
    'isolatedReaderAndRegistrationProposal':delta,
    'wholeCurrentGoalContext':ref(ROOT / 'context/current-whole-four-goals-direct-prereqs-and-parents.exact.json'),
    'wholeEightCasesAndFourProfilesExact':ref(ROOT / 'context/eight-whole-cases-four-profiles.exact-author-selection.json'),
    'whole32CaseCorpusExact':source_input['exactCurrent32Cases'],
    'whole16ProfileCorpusExact':source_input['exact16ScientificProfiles'],
    'wholeOfficialAntecedentsAndPartnerUnions':ref(ROOT / 'context/official-antecedents-and-exact-unions.references.json'),
    'repositoryConventionEvidence':ref(ROOT / 'context/EXISTING.repository-sourceKind-conventions.actual.json'),
    'actualReadOnlyLKCompilerEvidence':ref(ROOT / 'checks/READONLY.existing-LK-compiler-and-provenance.actual.json'),
    'boundedTechnicalChecks':[ref(p) for p in sorted((ROOT/'checks').iterdir()) if p.suffix=='.json'],
    'summary':ref(ROOT/'README.md'),
    'changedWholeGoalIds':['a8ddb351-3501-5b6d-a908-c82a5d2f14d4','f0f2c5f8-06f1-5774-a176-d96505727acf'],
    'sourceCourseDeclarationGoalIds':['a8ddb351-3501-5b6d-a908-c82a5d2f14d4','e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd','1a51362e-fd84-5964-89b5-b435772c2149','f0f2c5f8-06f1-5774-a176-d96505727acf'],
    'authorComponents':8, 'proposedPartialM3Edges':8, 'reviewedOrMappedNewDecisions':0,
    'newScientificVotes':0, 'sourceOrCourseApproval':False, 'semanticAtomicityApproval':False,
    'sourceAtlasIntegrationOrReleaseApproval':False, 'activeWrites':False,
    'newPhysicalImagesOrPDFs':0, 'strictCountComputed':False,
    'finiteSeal':'FILES.finite-own-candidate-author.seal.json',
})
all_files = sorted(p for p in ROOT.rglob('*') if p.is_file())
assert not any(p.is_symlink() for p in ROOT.rglob('*'))
for p in all_files:
    if p.suffix=='.json': json.loads(p.read_text())
seal = write('FILES.finite-own-candidate-author.seal.json', {
    'schemaVersion':1, 'role':'Finite own author files content seal, not a quality vote',
    'sealedAtUTC':datetime.now(timezone.utc).isoformat(),
    'selector':selector, 'files':[ref(p) for p in all_files],
    'fileCountExcludingThisSeal':len(all_files), 'bytesExcludingThisSeal':sum(p.stat().st_size for p in all_files),
    'symlinks':0, 'newReviewVotes':0,
})
total=sum(p.stat().st_size for p in ROOT.rglob('*') if p.is_file())
assert total < 5_000_000
print(json.dumps({'selector':selector, 'seal':seal, 'files':len(all_files)+1, 'physicalBytes':total, 'newReviewVotes':0},ensure_ascii=False))
