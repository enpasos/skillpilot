"""Freeze own body-author evidence. This never changes active curriculum files."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, subprocess, time

R = Path('/home/enpasos/projects/skillpilot')
O = Path(__file__).resolve().parent
CACHE = Path('/tmp/skillpilot-finance12-B-primary-20261010')
CAP = Path('/tmp/skillpilot-econ-social13-current555-author-B-0l28pg3r/capsule')
NODE = Path('/tmp/skillpilot-checkpoint-native-node-8zpgjgml/npm-cache/_npx/185e25162edaacfb/node_modules/node/bin/node')
BODY = O/'whole-twelve-local-finance-integration-market.DEEN-readable-two-real-cases.DRAFT-author-v2.json'
BEFORE = O/'whole-current597-immutable-economics-before-finance12.exact.json'
ACTIVE = R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p): return json.loads(Path(p).read_text())
def binding(p):
    p = Path(p).resolve()
    return {'path': str(p.relative_to(R)) if p.is_relative_to(R) else str(p), 'sha256': sha(p), 'bytes':p.stat().st_size}
def put(name, value):
    p = O/name
    assert not p.exists(), 'No frozen input overwrite: '+str(p)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n')
    return binding(p)

assert sha(BODY)=='21c6b5fc6be9831ffa5cb3fa73f486ae35bb14693a567aaba384f5b6c726b842'
assert sha(BEFORE)==sha(ACTIVE)=='6118557f37604ddd3fa5c5b8a418ee9d0061c570dfeea14a12d29ee7cb4addf3'
materials=read(BODY)
assert len(materials)==12 and len({g['id'] for g in materials})==12
assert all(g['examData']['reviewStatus']=='draft' and g['requires']==g['examData']['coveredGoalIds'] and len(g['requires'])==1 for g in materials)
guards=read(O/'actual-current-whole-twelve-contracts-original-P24-and43-P336685-endguards.AUTHOR.json')
assert guards['currentGoalCount']==597 and guards['wholeOriginalPositiveRecordCount']==336 and guards['wholeOriginalApplicationCaseCount']==685 and guards['actualTwelveOriginalCaseCount']==24
math=read(O/'actual-own-fraction-and-six-whole-game-matrix-contract-checks.AUTHOR.json')
works=read(O/'actual-own-thirty-six-whole-works-and216-manual-rubric-decisions.AUTHOR.json')
assert math['actualCandidateSHA256']==works['wholeCandidateSHA256']==sha(BODY)
assert math['totalActualChecks']==67 and math['actualFailures']==0
assert works['actualWholeWorkCount']==36 and works['actualManualRubricMarkCount']==216

# Own short paraphrases, not copies of the third-party text. Cache stays local.
AIDS={
 'ECB-FSR2026': ('Der tatsächlich gelesene Bericht vom Mai 2026 behandelt Rücknahmen bei privaten Kreditfonds, Grenzen der Veräußerbarkeit und Verbindungen zu Banken. Er beweist weder die erfundenen Bankverluste noch eine allgemeine Insolvenz europäischer Banken.', 'The May 2026 report discusses private-credit fund redemptions, limited liquidity and links to banks. It does not establish the invented bank losses or general European-bank insolvency.'),
 'BIS-framework': ('Der aktuelle Rahmen unterscheidet Kapital, Verschuldungsquote, Liquidität, Aufsicht und Offenlegung. Auf der Seite angezeigte künftige Änderungen sind keine schon geltenden Modellzahlen. Die Aufgabenregel mit sechs Einheiten ist ausdrücklich fiktiv.', 'The current framework distinguishes capital, leverage, liquidity, supervision and disclosure. Future changes listed on the page do not establish current model parameters. The six-unit rule in the task is fictional.'),
 'BIS-scope': ('Basel richtet sich grundsätzlich an international tätige Banken und umfasst konsolidierte Betrachtung. Kapital darf innerhalb einer Gruppe nicht doppelt als Verlustpuffer zählen. Versicherungen und andere Institute sind nicht ohne weitere Prüfung identisch erfasst.', 'Basel concerns internationally active banks and consolidated assessment. Intragroup capital cannot count twice as loss-absorbing capacity. Insurers and other institutions are not automatically subject to identical requirements.'),
 'EU-prudential': ('Die tatsächlich gelesene EU-Übersicht erklärt die Umsetzung des internationalen Rahmens durch EU-Recht und aktuelle Änderungen. Sie ersetzt keine Prüfung des jeweils anwendbaren Instituts, Instruments oder Übergangsrechts. Die Fallzahlen sind keine realen gesetzlichen Quoten.', 'The EU overview describes implementation of the international framework through EU law and current changes. Institution, instrument and transitional provisions still matter. The case values are not actual statutory ratios.'),
 'BIS-CCyB': ('Die gelesene amtliche HTML-Erläuterung zur Leitlinie von 2010 verbindet den Puffer mit gesamtwirtschaftlichem Kreditwachstum und Systemrisiko. Gelesen wurde die HTML-Seite, nicht ein behaupteter neuer PDF-Volltext. 2,5 Prozent und die Fallfreigabe sind ausdrücklich Modellregeln.', 'The official HTML explanation of the 2010 guidance links the buffer to aggregate credit growth and systemic risk. This reading does not claim a new PDF or a current national buffer rate. The case parameters are fictional.'),
 'EU-cohesion': ('Die amtliche Übersicht ordnet Kohäsionspolitik und Fonds der Periode 2021–2027 ein. Die erfundenen Förderanteile sind keine realen Förderzusagen. Ein einfacher Vorher-Nachher-Vergleich beweist keine kausale Programmwirkung.', 'The official overview places cohesion policy and funds in the 2021–2027 period. Invented funding shares are not actual grants. A simple before-and-after comparison does not prove causal programme effects.'),
 'EU-rule-of-law': ('Die Kommissionsübersicht verlangt für diesen Budgetmechanismus einen hinreichend direkten Bezug zum Haushalt, einen verhältnismäßigen Vorschlag und eine Ratsentscheidung. Endbegünstigte bleiben geschützt. Schulden oder eine bloße Rechtsstaatsbehauptung lösen nicht automatisch dieselbe Maßnahme aus.', 'The Commission overview requires a sufficiently direct budget link, a proportionate proposal and a Council decision. End beneficiaries remain protected. Debt or an unsupported rule-of-law allegation does not automatically trigger the same measure.'),
 'EU-fiscal': ('Der echte Web-Tool-Volltext erläutert den seit 2024 reformierten Rahmen mit mittelfristigen Plänen, Ausgabenpfaden, Kommissionsprüfung und Ratsbefassung. Das private Requests-Ergebnis war 403 und ist kein gelesener Gesetzestext. Das erfundene Integrationsmodell behauptet keine neue geltende EU-Kompetenz.', 'The actual web-tool page explains the reformed framework, medium-term plans, expenditure paths, Commission assessment and Council involvement. The separate Requests response was 403. The invented integration model does not claim new existing EU powers.'),
 'GWB1': ('Der tatsächliche Gesetzestext betrifft wettbewerbsbeschränkende Vereinbarungen und abgestimmtes Verhalten. Gleichlaufende Preise allein beweisen keine Absprache. Die vorgelegten Nachrichten und Daten sind erfunden.', 'The actual provision concerns restrictive agreements and concerted conduct. Parallel prices alone do not establish collusion. The supplied messages and data are fictional.'),
 'GWB36': ('Die Zusammenschlussprüfung bezieht erhebliche Wettbewerbsbehinderungen und belegte überwiegende Verbesserungen ein. Allgemeine Werbeversprechen ersetzen keine konkrete Prüfung. Das Szenario setzt die deutsche Zuständigkeit ausdrücklich voraus.', 'Merger assessment considers significant impediments to competition and demonstrated outweighing improvements. Advertising promises are insufficient. German jurisdiction is expressly stipulated in the scenario.'),
 'GWB39': ('Die tatsächlich gelesene Norm regelt die vorherige Anmeldung. Das Aufgabenmaterial setzt die Anmeldepflicht voraus, ohne eine reale Umsatzschwelle zu erfinden.', 'The provision concerns prior notification. The case stipulates notification duty without inventing an actual turnover threshold.'),
 'GWB40': ('Die gelesene Norm unterscheidet Verfahren, Freigabe und geeignete Bedingungen oder Auflagen; dauernde Verhaltenskontrolle ist nicht als einfache Ersatzlösung zu unterstellen. Das Material verlangt keine Berechnung eines realen Bußgelds.', 'The provision distinguishes procedure, clearance and appropriate conditions; ongoing behavioural monitoring cannot simply be assumed as a substitute. The material does not request an actual legal fine.'),
}
fetch=read(CACHE/'actual-fetch-index.json')
source_rows=[]
for row in fetch:
    assert sha(row['privateRawCachePath'])==row['rawSHA256']
    assert sha(row['privateParsedCachePath'])==row['parsedSHA256']
    out=dict(row)
    if row['key'] in AIDS:
        de,en=AIDS[row['key']]
        assert len((de+' '+en).split())<200
        out.update({'qualification':'actual-primary-reading-qualified-for-the-bounded-statements-only','ownReadingAidDE':de,'ownReadingAidEN':en,'verbatimWordsCopiedIntoRepository':0,'noCurriculumSourceCoverageClaim':True})
        if row['key']=='EU-fiscal':
            out.update({'requestsResponseIsQualifiedSourceText':False,'actualQualifiedMechanism':'successful actual web-tool open, separately archived','privateActualWebToolReturn':binding(CACHE/'EU-fiscal.actual-web-open-return.json')})
        else: assert row['httpStatus']==200
    else:
        out.update({'qualification':'REJECTED-as-current-primary-evidence','reason': 'Page explicitly presents a DRAFT under consultation, not the current final standard.' if row['key']=='BIS-CAD20-DRAFT-blocked' else 'Actual redirect led to the TodayOJ index, not the requested regulation text.','usedToSupportCandidate':False})
    source_rows.append(out)
source_binding=put('actual-twelve-primary-source-bounded-DEEN-reading-aids-and-two-rejected-returns.AUTHOR.json',{
 'role':'AUTHOR actual primary reading and own bounded paraphrases; no source-union or scientific approval',
 'actualFetchRows':len(fetch),'boundedQualifiedPrimaryPages':len(AIDS),'rejectedReturnCount':2,
 'thirdPartyFulltextsRemainPrivate':True,'originalPrimaryURLsAndLocalHashesReproducible':True,
 'allNumericalDossiersUnlessExplicitlySourcedAreFictional':True,'sources':source_rows,
 'notRealFinancialAdviceOrAnAssertionOfCurrentLegalAcceptance':True,
})

# Run the narrow native whole-closure function with explicit immutable597 input.
# The private capsule's old physical CAN is deliberately not its input.
prod=R/'app/scripts/generateCurriculumQualityStatus.ts'
copy=CAP/'app/scripts/generateCurriculumQualityStatus.ts'
compiler=R/'app/scripts/applicabilityCompiler.ts'
assert sha(prod)=='656084b7cd9d6cb5324361b927b9f761596c572d7e4f616c7b13da061f4b1336'
assert copy.read_bytes().startswith(prod.read_bytes())
assert sha(compiler)==sha(CAP/'app/scripts/applicabilityCompiler.ts')=='50f4a09007cece8119c53f665b6442e028e4ffb3910fda7b377e60f8cb6c81dd'
helper=CAP/'app/scripts/nativeBFinance12UnplacedCurrent597Readonly.mts'
assert helper.read_bytes()==(O/'native_twelve_unplaced_current597_whole_closures_readonly.mts').read_bytes()
output=O/'actual-twelve-unplaced-full-current597-inherited-atomic-prerequisite-closures.native-AUTHOR.json'
before_output=sha(output)
argv=[str(NODE),'app/node_modules/tsx/dist/cli.mjs','app/scripts/nativeBFinance12UnplacedCurrent597Readonly.mts',str(O)]
started=datetime.now(timezone.utc).isoformat(); t=time.monotonic()
run=subprocess.run(argv,cwd=CAP,capture_output=True,text=True)
elapsed=time.monotonic()-t
assert run.returncode==0 and run.stderr==''
assert sha(output)==before_output
assert sha(ACTIVE)==sha(BEFORE)
command_binding=put('actual-current597-unplaced-twelve-native-complete-closure-command-exit.AUTHOR.json',{
 'role':'AUTHOR narrow native full-closure check only, not a whole compiler/source/route run',
 'actualUTCStart':started,'actualElapsedSeconds':elapsed,'actualArgv':argv,'actualCwd':str(CAP),
 'actualExit':run.returncode,'actualStdout':run.stdout,'actualStderr':run.stderr,
 'node':binding(NODE),'helper':binding(O/'native_twelve_unplaced_current597_whole_closures_readonly.mts'),
 'productionChecker':binding(prod),'privateExportedChecker':binding(copy),'productionPrefixWholeBytesExact':True,
 'compiler':binding(compiler),'actualImmutable597Input':binding(BEFORE),'actualWholeTwelveBodyInput':binding(BODY),
 'actualOutput':binding(output),'previousSameInputOutputWholeBytesExact':True,
 'privatePhysicalHistoricalCANNotUsed':True,'onlyExplicitWholeGraphFunctionInputUsed':True,
 'actualActiveCANBeforeAfterExact':True,'noCompilerSourceRouteScopePASSClaim':True,
})

history_binding=put('actual-author-setup-history-and-truthful-count-boundaries.json',{
 'role':'Actual author setup history and measurement boundaries, no failed probe approval',
 'observedSetupFailures':['Initial private fetch script lacked bs4; replaced with the standard-library parser.',
 'Three patch contexts did not match and changed no file.',
 'Initial assembler omitted one English derivative solution list and raised TypeError; full English list supplied before final body assembly.',
 'Registry reader first assumed landscapes instead of subjects and raised KeyError.',
 'Positive review reader first assumed JSON rather than JSONL and raised JSONDecodeError; corrected to actual43 JSONL sources.',
 'A provisional uniform manual-grade allocation was replaced before external freeze by individual rubric-specific grades; no uniform allocation is final evidence.'],
 'noFailedSetupRunCountedAsPASS':True,'actualFinalManualMarks':216,
 'actualCoreBypassRawPASSConvertedToFAIL':5,'actualOtherCoreBypassAlreadyRawFAIL':7,
 'actualFairPartialPASS':12,'actualOmittedSecondApplicationFAIL':12,
 'historical555ScopeIntakeIsNotCurrent597RouteEvidence':True,
 'noCurrent577Or597ScopeCompilerOrSourcePASSInferredFromHistorical555Intake':True,
 'newStrictCompletions':0,'restoredGateBindings':0,'strictNetGain':0,
 'scopeNavStatusSEMSourceAndIndependentSciencePending':True,
})

# No pointer to a mutable future active CAN is used as the frozen body input.
files=[]
for p in sorted(O.iterdir()):
    if p.is_file() and not p.name.startswith('actual-final-twelve-finance'):
        files.append(binding(p))
manifest_binding=put('actual-final-twelve-finance-current597-portable-author-freeze.manifest.json',{
 'role':'AUTHOR immutable portable file inventory; hashes bind actual described work, they do not replace it',
 'currentWhole597Before':binding(BEFORE),'wholeTwelveFinalDRAFT':binding(BODY),
 'files':files,'allRepositoryReviewInputsRemainRepositoryRelative':True,
 'primaryCachesAndExecutionCapsuleRemainPrivateWorkingArtifacts':True,
})
handoff=put('actual-final-twelve-finance-integration-market-current597-whole-DEEN-DRAFT.author-handoff.json',{
 'role':'AUTHOR final whole-body candidate handoff; independent scientific review required',
 'subject':'Wirtschaftswissenschaften','actualCurrentGoalCount':597,'hypotheticalUnplacedCandidateGoalCount':609,
 'wholeTwelveFinalDRAFT':binding(BODY),'currentWhole597Before':binding(BEFORE),
 'twelveCompleteCurrentGoalAndOriginalP24Bindings':binding(O/'actual-current-whole-twelve-contracts-original-P24-and43-P336685-endguards.AUTHOR.json'),
 'existingSixWholeIndependentScienceKEEPAndNoBroadReviewRestart':binding(O/'actual-six-existing-whole-Science-KEEP-reuse-and-individual64-closure-boundaries.AUTHOR.json'),
 'individualWholeContractsCasesAndCoreDecisions':binding(O/'twelve-individual-whole-contract-core-and-case-author-decisions.json'),
 'wholeTwelveAllDRAFT':True,'wholeCaseVariantCount':24,'actualOriginalProfileCount':336,'actualOriginalApplicationCount':685,
 'originalCurrentOrdinaryGoalAndPContentUnchanged':True,
 'ownCalculations':binding(O/'actual-own-fraction-and-six-whole-game-matrix-contract-checks.AUTHOR.json'),
 'actualFractionCheckCount':61,'actualCompleteGameMatrixCheckCount':6,'actualCalculationFailures':0,
 'ownCompleteWorks':binding(O/'actual-own-thirty-six-whole-works-and216-manual-rubric-decisions.AUTHOR.json'),
 'actualWholeWorkCount':36,'actualManualRubricMarkCount':216,'actualFairPartialPASS':12,
 'actualCoreAbsenceBypassFAIL':12,'actualRawPASSCoreBypassConvertedTo14FAIL':5,'actualOtherCoreBypassAlreadyRawFAIL':7,
 'actualOmittedSecondApplicationFAIL':12,'noExtraTaskQuotaOrPerfectionRequirement':True,
 'actualConditionalClosedGoalSchema':binding(O/'actual-twelve-readable-text-successor-and-closed-conditional-goal-schema.AUTHOR.json'),
 'conditionalSchemaGoalCount':12,'conditionalSchemaErrors':0,'practiceSemanticKindNotYetIndependentlyApproved':True,
 'ownBoundedPrimaryReading':source_binding,'narrowNativeUnplacedWholeClosureCommand':command_binding,
 'nativeUnresolvedReferences':0,'noWholeCompilerSourceOrRouteRunClaim':True,
 'authorSetupAndCountBoundaries':history_binding,'portableManifest':manifest_binding,
 'unchangedFullScienceReusedForExistingBodiesOnly':True,
 'noActiveCurriculumRuntimeRegistrySEMPositiveEvidenceSourceOrViewWrite':True,'noImagesOrOtherSubjectsChanged':True,
 'newStrictCompletions':0,'restoredBindings':0,'strictNetGain':0,
 'independentWholeScienceVerdict':'PENDING foreign reviewer',
 'phaseLocalNavigationStatusApplicabilityScopeAndAccessVerdicts':'PENDING separate author and foreign scope review',
 'noM4M6M7HumanOrReleaseAcceptanceClaim':True,
})
print(json.dumps({'finalHandoff':handoff,'manifest':manifest_binding,'wholeBody':binding(BODY)},ensure_ascii=False))
