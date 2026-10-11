import datetime
import hashlib
import importlib.util
import json
import pathlib
import subprocess

O = pathlib.Path(__file__).resolve().parent
R = O.parents[6]
A = O.parent / 'wirtschaft-four-SourceMemory-current-origin-AM-card-and-BE-visibility-technical-binding-v1'

def load(p):
    return json.loads(pathlib.Path(p).read_text())

def binding(p):
    p = pathlib.Path(p)
    return {'path': str(p.relative_to(R)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'wholeBytes': p.stat().st_size}

def put(n, d):
    p = O / n
    assert not p.exists(), p
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    return binding(p)

reasons = {
    '0746be0f-e98c-5062-8e22-5571f8439d4b': 'Vier unveränderte DE/EN-Karten binden genau Einkommens- und Kreuzpreiselastizität. Die beiden Bezugsgrößen und Vorzeichenanker passen zu zwei aktuellen Ursprungszielen. Kein Berechnungsablauf wird zum Abrufstoff; GK/LK und fehlende fachliche requires sind passend.',
    '8dcc6254-214c-5d3c-9d74-821b3e8091bd': 'Die einzige unveränderte DE/EN-Karte bezeichnet die Untersuchungsebene Mikro/Makro, passend zum einzigen Ursprung eee603. Sie ersetzt weder dessen Fallzuordnung noch die Begründung eines Ebenenwechsels. GK/LK passt; keine künstliche fachliche Voraussetzung.',
    'be56c504-992d-5d63-b36b-ae94e24ca50e': 'Fünf kurze unveränderte DE/EN-Karten binden fünf aktuelle LK-Ursprünge: Kaufmann, Firma, Register, Vertretung und Insolvenzverfahren. Der Gläubigerzweck gehört ausschließlich zum aktuellen Verfahrensatom2790, nicht zum getrennten Eröffnungsgrund f0. Die entfernte prozedurale Insolvenzgrund-Karte bleibt entfernt. Kein LK-Deck wird durch die schmale GK-Platzierung sichtbar.',
    'adb8664a-8185-5ec6-a99f-db779d31aa37': 'Zwei unveränderte DE/EN-Karten binden den einzigen LK-Ursprung0489: F&E und abgestimmtes überlappendes Arbeiten. Lebenszyklusanalyse und tatsächliche Koordinationsbegründung verbleiben im gewöhnlichen Ziel. Kein künstlicher neuer prerequisite-Pfad.',
    '1d50c57f-14f2-50f3-8fe7-d102ffcb1099': 'Der neue AB1-Memoryknoten bindet exakt die zwei zuvor unabhängig als erforderlich bewerteten DE-Definitionskarten und ihre zwei BB-Ursprünge. Sozialwissenschaftlicher Gegenstand und BWL/VWL-Untersuchungsfokus sind zusammen ein enges Abrufpaket; Mikroökonomie wird nicht fälschlich aus VWL ausgeschlossen. Die Advanced-Marktordnungs-Voraussetzungen des früher vorgeschlagenen Decks entfallen durch den thematisch passenden neuen Knoten. Die ursprünglichen ordinary requires bleiben unverändert; keine neue EN-Kartenfreigabe und kein Verständnisabschluss.'
}
whole = load(O / 'actual-five-whole-node-origin-card-independent-metadata-KEEP-decisions.json')
individual = put('actual-five-specific-independent-node-deck-origin-SRS-kind-dispositions.json', [{'goalId': x['goalId'], 'decision': 'KEEP bounded metadata delta', 'reasonDe': reasons[x['goalId']], 'wholeInput': binding(O / 'actual-five-whole-node-origin-card-independent-metadata-KEEP-decisions.json'), 'semanticKind': 'memorization', 'ordinaryDenominatorMember': False, 'newScientificCardJudgments': 0, 'operativeVisibilityApproved': False} for x in whole])
before = load(O / 'actual-independent-frozen-whole-input-before-guard.json')
for x in before:
    assert binding(R / x['path']) == {k: x[k] for k in ['path', 'sha256', 'wholeBytes']}
files = sorted(f for f in O.rglob('*') if f.is_file())
assert all(not f.is_symlink() and b'\r' not in f.read_bytes() for f in files)
for f in files:
    if f.suffix == '.json': load(f)
paths = sorted({x['path'] for x in before} | {str(f.relative_to(R)) for f in files})
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], cwd=R, text=True, input='\n'.join(paths) + '\n', capture_output=True)
assert ignored.returncode in [0, 1]
assert not ignored.stdout.strip(), ignored.stdout
spec = importlib.util.spec_from_file_location('root_memory_final_schema', R / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
symlinks = module.curriculum_symlink_errors(str(R)); assert not symlinks
manifest = put('actual-independent-whole-output-manifest.json', {'files': [binding(f) for f in files], 'exactOriginalInputBindings': before, 'nativeImplementations': [binding(R / n) for n in ['app/scripts/memoryCardReview.ts', 'app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts']], 'ignoredRequiredInputs': [], 'curriculum_symlink_errors': symlinks})
final = put('actual-final-independent-five-SourceMemory-native-node-deck-origin-and-narrow108-placement-KEEP.receipt.json', {
    'reviewedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewer': '/root', 'technicalAuthor': '/root/economics_independent_continuation_a',
    'scope': 'Independent actual whole five-memory/deck/origin/SRS and narrow108 unpublished review-placement metadata delta; valid historical scientific card and memory decisions retained.',
    'authorHandoff': binding(A / 'actual-final-five-memory-origin-native-card-and-conditional-BE-visibility-author-handoff.receipt.json'),
    'wholeCurrentAuthorReviewIndex': binding(A / 'actual-portable-whole-five-memory-eleven-origin-fourteen-card-and-108-placement-Root-review-index.json'),
    'wholeIndividualMetadataDecisions': binding(O / 'actual-five-whole-node-origin-card-independent-metadata-KEEP-decisions.json'),
    'specificMetadataDispositions': individual,
    'actualNativeCommands': binding(O / 'actual-three-independent-current-native-memory-commands.receipt.json'),
    'actualNativeRoleAndCardOriginCommands': binding(O / 'actual-independent-native-108-command.receipt.json'),
    'actualNativeRoleAndCardOriginResults': binding(O / 'actual-independent-native-108-memory-role-card-origin-results.json'),
    'exactCurrentHistoryChecks': binding(O / 'actual-independent-canonical-AM-and-card-exact-history-checks.json'),
    'wholeOutputManifest': manifest,
    'approvedBoundedMetadata': {'unchangedMemoryNodes': 4, 'unchangedCurrentOrigins': 9, 'unchangedDEENCards': 12, 'additionalScienceMemoryNodes': 1, 'additionalOrdinaryOrigins': 2, 'unchangedDEOnlyCards': 2, 'nativeOriginAMRecords': 336, 'currentCardRecords': 66, 'nativeMissingOrStale': 0, 'reviewCatalogViews': 108, 'actualRequiredOriginChecks': 972, 'actualNativeViewCompilerErrors': 0, 'actualNewMemoryMissing': 0, 'GKNewMemoryCardsPerView': 7, 'LKNewMemoryCardsPerView': 14},
    'scienceReuse': {'oldRootWholeAMRecordsExact': 300, 'previouslyQualifiedWholeAMSuccessorsExact': 11, 'source25MemoryRequired': 11, 'source25NoMemory': 14, 'oldWholeCardRecordsExact': 52, 'newScientificCardReviews': 0, 'newScientificOrdinaryClosures': 0},
    'actualKnownOpenWholeBEDiagnostic': {'actualNativeExitCode': 1, 'missingRequiredOriginViewPairs': 1836, 'defaultDiscovery': False, 'fullBEApproval': False, 'blanketOldDeckPlacementApproved': False},
    'operativeNationalBoundary': 'Original two operative national views have no Source25 targets or new memory nodes. Their conditional100 visible-origin checks pass, but this does not prove new Source25 operative discovery. Source author must supply and independently qualify actual final operative placements and full Memory visibility before integration.',
    'canonicalAssemblyBoundary': 'Use only new1d50 whole node and SourceNav9658 new child with current actual unique descendant weight30. Do not substitute oldV8 author485 for laterV10: twelve orientation and86 applicability deltas have separate author/reviewer lineage.',
    'sourceAndCountryBoundary': 'Six GK tags, Source125 course/mapping and country target-role preservation are not approved by this Memory review. The bounded source kernel independent review separately found a DE-BB GK scope delta requiring revision.',
    'historicalFailureRetained': binding(O / 'original-failed-guard-and-bounded-dictionary-validation-successor.receipt.json'),
    'historicalBytesChanged': 0, 'liveRegistryOrCanonicalWrites': 0, 'protectedMathPhysicsChanges': 0,
    'strictProgress': {'newStrictClosures': 0, 'restoredStrictBindings': 0, 'netStrictGain': 0},
    'humanApproval': False, 'humanReleaseGates': 'pending separately', 'wholeM7Approval': False,
    'technicalChecks': {'wholeJSON': 'PASS', 'actualLF': 'PASS', 'runtime485SchemaErrors': 0, 'closed108ViewSchemaErrors': 0, 'curriculum_symlink_errors': symlinks, 'ignoredRequiredInputs': []}
})
print(json.dumps(final))
