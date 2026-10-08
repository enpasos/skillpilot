from pathlib import Path
from datetime import datetime, timezone
import hashlib, json

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
def read(p): return json.loads(Path(p).read_text())
def write(n, v):
    with (OWN/n).open('x') as f: f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def bind(p):
    p = Path(p)
    return {'path':str(p.relative_to(OWN)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
first_path = OWN/'independent-a.decision-locators-v3.first-judgment.freeze.json'
first = read(first_path)
for b in first['files']:
    assert bind(OWN/b['path']) == b
j = read(OWN/'eighteen-decision-locators-independent-a.first-judgment.json')
assert not j['peerBFollowupRead'] and len(j['acceptedGoalIds'])==18 and not j['whole144ReleaseProjectionPassed']
assert not j['whole144Verdict']['passed']
snapshot = read(OWN/'current-live-input-snapshots/snapshot-bindings.actual.json')
actual_live_bindings = []
for s in snapshot['files']:
    # Snapshot records use actual repository paths, not candidate aliases.
    repo_path = s.get('originalRepositoryPath',s.get('repositoryPath',s['path']))
    if repo_path.startswith('current-live-input-snapshots/'):
        repo_path = repo_path[len('current-live-input-snapshots/'):]
    p = ROOT/repo_path
    live = hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None
    actual_live_bindings.append({'repositoryPath':repo_path,'snapshotSha256':s['sha256'],'actualLiveSha256AtFinalRead':live,'unchangedAtFinalRead':live==s['sha256']})
write('current392-exact-snapshot-vs-live-final-read.actual.json',{'recordedAt':datetime.now(timezone.utc).isoformat(),'bindings':actual_live_bindings,'snapshotsRemainExactSealedInputs':True,'activeWrites':False})
key_paths = [
 'input-snapshots/eighteen-decision-locators-v3.author-first-input.freeze.json',
 'input-snapshots/author-v3/hessen_biology_upper_secondary.evolution18-decision-locators.author-20261008-v3.review.json',
 'input-snapshots/author-v2/DE_HE_BIOLOGIE_SEKII_KC2024.evolution18-operative-portable-final-20261008-v2.source-extraction.json',
 'input-snapshots/author-v3/current476-plus-only-two-reviewed-wording-fixes.inactive.candidate.json',
 'prior-own-v2/independent-a.operative-source-v2.final.freeze.json',
 'prior-own-v2/own-prior-science18-cases36-and-two-repairs.KEEP.actual.json',
 'independent-a.decision-locators-v3.first-judgment.freeze.json',
 'eighteen-decision-locators-independent-a.first-judgment.json',
 'independent-actual27-decision-fields-vs-own-sealed-values.actual.json',
 'v3-independent-literal126-retention.actual.json',
 'independent-v3-current476-native18-closed-and-full144-hold.actual.json',
 'current392-native-sourceindex-and-visible-scope-check.actual.json',
 'current392.sourceindex.after.actual.json',
 'current392.after.native-receipt.actual.json',
 'native-current476-source18.terminal.actual.json',
 'native-current392-sourceindex.attempt2.terminal.actual.json',
 'native-current392-sourceindex.terminal.actual.json',
 'actual-current-native-code-and-schema-bindings.json',
 'current-live-input-snapshots/snapshot-bindings.actual.json'
]
receipt = {
 'schemaVersion':1,'recordedAt':datetime.now(timezone.utc).isoformat(),
 'role':'Independent A final genuine targeted source-v3 decision-locator followup; own first judgment sealed before any peer followup read',
 'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1',
 'source18OperativeVerdict':'accept_corrected_bounded_source_candidates',
 'scientificDecisionByGoal':[{'goalId':r['goalId'],'sourceGoalId':r['sourceGoalId'],'sourceKind':r['unchangedWholeSourceRow']['sourceKind'],
    'scientificDecision':r['operativeDecisionVerdict'],'whole18Science36Cases':'KEEP own original genuine full review',
    'sourceTopicCode':r['exactCurrentDecisionFieldBindings']['topicCode'],'sourceSpan':r['exactCurrentDecisionFieldBindings']['sourceSpan'],
    'wholeOriginalSourceCoverage':False,'wholeCanonicalGoalApproval':False,'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','humanApproval':False} for r in j['judgments']],
 'all27LocatorChangesIndependentlyVerified':True,'correctedTopicCodes':9,'correctedSourceSpans':18,
 'boundedPrimaryComponents':15,'nonMandatoryAuthoredModelSpecialisations':3,'optionalQ22GoalId':j['optionalQ22GoalId'],
 'noNewScienceOrCaseReviewRequired':'Exact original source rows, science18/cases36 and two targeted wording repairs retain my independently sealed judgments; no restart of valid A/M evidence',
 '126UnaffectedDecisionsLiteralByteExact':True,'all144SourceRowsAndIdsAndExtractionIdentityExactV2':True,'all158CompatibilityEdgesExact':True,
 'authorFirstInputSealSha256':j['authorFirstSealSha256'],'exactAuthorMappingSha256':j['exactNewMappingSha256'],
 'ownFirstJudgmentSealSha256':bind(first_path)['sha256'],'ownFirstSealedFileCount':len(first['files']),'allFirstSealedFilesUnchanged':True,
 'ownPriorSourceV2FirstSealSha256':j['ownPriorV2FirstSealSha256'],'ownPriorSourceV2FinalSealSha256':j['ownPriorV2FinalSealSha256'],
 'ownPriorSourceV2HoldRemainsImmutableHistory':True,'peerBFollowupRead':False,
 'actualNativeSource18ClosedSchemaExitCode':0,'existingClosedSchemasPassed':3,
 'current392NativeAtlasAndSourceIndexExitCode':0,'sourceViews':22,'currentAtomicGoalCount':392,'currentWholeGoalCount':476,
 'exactCurrentVisibleSetsAndCounts':True,'exact18ChangedSourceContextsAgainstCurrentBefore':True,'otherChangedSourceContexts':0,
 'all18WholeCurrentSourceContextsExactToOwnActuallyReadV2Contexts':True,
 'current476SourceOnlyCandidateDifferences':j['current476SourceOnlyCandidateDifferences'],'stale391WholeApplyProposed':False,
 'fullBookModelBuilt':False,'whole144ReleaseProjectionPassed':False,
 'whole144Verdict':'HOLD: actual unchanged unsupported NeuroGK2 decision ca155d02-5fae-5222-85a4-881c0a69b0de, needs_canonical_goal',
 'actualUnsupportedWhole144Decision':j['whole144Verdict']['actualUnchangedUnsupportedDecision'],
 'schemaPassAloneIsScientificApproval':False,'sourceKindAndOriginalTextAuthorshipRemainDistinct':True,
 'sourceIndexScopeMatchExactMeaning':'jurisdiction/stage/course facets only, not literal whole-source or whole-goal coverage',
 'bindings':[bind(OWN/n) for n in key_paths],
 'preservedOwnSetupAttempt':'native-current392-sourceindex.terminal.actual.json: book-local generated path declaration assertion; corrected attempt2 uses original local book paths and returns files in memory, without writing active atlas files',
 'D_P_V_Approvals':0,'strictNewClosureCount':0,'humanApproval':False,'learnerEvidence':False,'performedExperiments':0,'activeWrites':False,
 'nextRequiredReview':'Any later actual D/P/V images and final intersecting independent reviews remain separate; no image approval in this source followup'
}
write('independent-a.decision-locators-v3.final-receipt.json',receipt)
write('neutral-eighteen-source-v3-independent-a.final.entry.json',{
 'schemaVersion':1,'role':receipt['role'],'scopeGoalIds':j['acceptedGoalIds'],
 'firstJudgmentSeal':bind(first_path),'finalReceipt':bind(OWN/'independent-a.decision-locators-v3.final-receipt.json'),
 'authorFirstSeal':receipt['bindings'][0],'exactAuthorMapping':receipt['bindings'][1],'exactSource144Extraction':receipt['bindings'][2],
 'whole18Science36CasesAndTwoRepairs':'KEEP own sealed genuine original review',
 'operativeSource18Decision':'accepted bounded candidates with corrected actual27 fields',
 'whole144Decision':receipt['whole144Verdict'],'currentAtomicGoalCount':392,'currentWholeGoalCount':476,
 'finalSealPath':'independent-a.decision-locators-v3.final.freeze.json','peerBFollowupRead':False,
 'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','D_P_V_Approvals':0,'strictNewClosureCount':0,'humanApproval':False,'activeWrites':False
})
with (OWN/'README.md').open('x') as f:
    f.write('''# Independent A — gezielte operative Quellenprüfung Evolution18 v3

Alle **18 operativen Quellenbindungen** sind als begrenzte AI-Kandidaten akzeptiert. Die tatsächlichen **9 topicCode- und 18 sourceSpan-Korrekturen** entsprechen meinem vorher unabhängig versiegelten Urteil und den bereits vollständig gelesenen Originalspans. Die endgültige Mapping-Datei ist exakt mit SHA256 `1cae2d343203031136edb48a47da950f15ff20d1cd55ce3cccb71e73e12403bd` gebunden.

Die 15 begrenzten Primärkomponenten und 3 nicht verpflichtenden eigenen Modellvertiefungen bleiben ausdrücklich getrennt. NS liegt in optionalem Q2.2 LK. Kein gesamtes amtliches Originalbullet und kein gesamtes kanonisches Ziel wird durch die partiellen Mapping-Kanten als abgedeckt behauptet. Die 18 ganzen wissenschaftlichen Ziele, 36 ganzen DE/EN-Fälle und zwei gezielten Wortreparaturen behalten meine ursprünglichen echten Reviews; gültige A/M-Nachweise werden nicht neu gestartet.

## Tatsächliche eigene Prüfungen

- Eigener nativer Quellencompiler: 18 Zeilen, 18 partielle Kanten, 3 bestehende geschlossene Schemata; Exit 0.
- Eigener nativer aktueller Atlas/SourceIndex: 392 curricularAtomic und 476 Gesamtziele; 22 Quellenansichten, unveränderte sichtbare Zielmengen und Zahlen, exakt 18 geänderte Quellenkontexte und 0 weitere. Alle 18 ganzen Kontexte entsprechen den von mir tatsächlich gelesenen v2-Kontexten.
- 126 andere Entscheidungsobjekte wörtlich bytegleich; 144 Quellenzeilen, stabile IDs und extractionId sowie 158 Kanten bleiben unverändert. Die reviewId-Versionsänderung ist ausdrücklich gebunden.
- Der inaktive 476er Quellen-Teststand unterscheidet sich vom gebundenen aktuellen Stand ausschließlich in den 3 schon fachlich geprüften Textfeldern der 2 Ziele. Ein alter 391er Vollstand wird nicht zur Integration vorgeschlagen.

**Voll144 bleibt HOLD:** Der tatsächliche vollständige Compilerlauf scheitert weiterhin an `ca155d02-5fae-5222-85a4-881c0a69b0de` (Neuro GK2, `needs_canonical_goal`). Diese unveränderte offene Quellenpflicht bleibt mit dem gesamten ursprünglichen Entscheidungsobjekt sichtbar gebunden. Der 392er Atlas-/SourceIndex-Check ist kein vollständiger Buchmodell- oder Voll144-Release-Pass.

Mein v3-Ersturteil wurde vor jedem Peer-Followup-Read versiegelt. Kein Peer-Followup wurde gelesen. Der eigene erste Setup-Fehlversuch ist erhalten; die korrigierte native Probe setzt echte buchlokale Pfaddeklarationen ein und gibt Dateien nur im Speicher zurück.

Neutrales finales Receipt: `neutral-eighteen-source-v3-independent-a.final.entry.json`. Finale Bindungen und tatsächliche vollständige Befunde: `independent-a.decision-locators-v3.final-receipt.json` und `eighteen-decision-locators-independent-a.first-judgment.json`.

Alle Entscheidungen bleiben `ai_candidate`, `needs_human_review`, E1/G1. Keine D/P/V-Bildfreigaben, keine neuen strikten Abschlüsse, keine menschliche Freigabe, keine Lernerbeweise, keine durchgeführten Experimente und keine aktiven Curriculum-/Registry-/Runtime-Schreibzugriffe. Historische Reviews und Fehlversuche bleiben unverändert.
''')
for b in first['files']: assert bind(OWN/b['path']) == b
files = [bind(p) for p in sorted(OWN.rglob('*')) if p.is_file()]
write('independent-a.decision-locators-v3.final.freeze.json',{
 'schemaVersion':1,'role':'Independent A final portable exact v3 source decision-locator followup bindings',
 'sealedAtUTC':datetime.now(timezone.utc).isoformat(),'ownFirstJudgmentSealSha256':bind(first_path)['sha256'],
 'allOwnFirstSealedFilesUnchanged':len(first['files']),'peerBFollowupRead':False,'files':files,
 'source18Verdict':'accept_corrected_bounded_source_candidates','full144Verdict':receipt['whole144Verdict'],
 'humanApproval':False,'activeWrites':False
})
final = OWN/'independent-a.decision-locators-v3.final.freeze.json'
print(json.dumps({'finalSealSha256':bind(final)['sha256'],'finalSealedFiles':len(files),'firstFilesUnchanged':len(first['files']),'actualLiveBindingsUnchanged':sum(b['unchangedAtFinalRead'] for b in actual_live_bindings),'actualLiveBindingsTotal':len(actual_live_bindings),'source18Accepted':18,'full144':'HOLD NeuroGK2','peerBRead':False}))
