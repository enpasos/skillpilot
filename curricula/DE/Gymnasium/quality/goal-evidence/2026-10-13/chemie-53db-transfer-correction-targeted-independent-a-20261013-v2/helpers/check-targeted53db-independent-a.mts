import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = process.cwd();
const input = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-53db-meaningful-transfer-case-targeted-author-20261013-v2';
const output = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-53db-transfer-correction-targeted-independent-a-20261013-v2';
const read = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'));
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(repo, p))).digest('hex');
const write = (p: string, x: unknown) => {
  mkdirSync(dirname(resolve(repo, p)), { recursive: true });
  writeFileSync(resolve(repo, p), JSON.stringify(x, null, 2) + '\n');
};
const stock = await import(pathToFileURL(resolve(repo, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href);
const Ajv2020 = (await import(pathToFileURL(resolve(repo, 'app/node_modules/ajv/dist/2020.js')).href)).default;
const addFormats = (await import(pathToFileURL(resolve(repo, 'app/node_modules/ajv-formats/dist/index.js')).href)).default;
const schema = read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json');
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const profileValidator = ajv.compile({ $schema: schema.$schema, $defs: schema.$defs, ...schema.properties.profile });
const originalRecord = read(input + '/inputs/exact-current406-original53db-P4-record.json');
const goal = read(input + '/inputs/exact-current406-whole53db-goal.json');
const profile = read(input + '/candidate/PROFILE.complete53db-targeted-after.DEEN.author.json').profile;
const cas = read(input + '/CAS.one-whole-case-profile-and-candidate-spec.author.json');
const beforeCase = cas.operations.find((op: any) => op.operationId === 'whole-case2').beforeWholeCell;
const afterCase = read(input + '/candidate/CASE2.complete-targeted-after.DEEN.author.json');
const oldCases = read(cas.operations.find((op: any) => op.operationId === 'whole-case2').baseBinding.path).cases;
const newCases = read(input + '/candidate/eight-full-P4-cases.only53dbCase2-after.author.json').cases;
const case1Before = oldCases.find((c: any) => c.caseId === '53db04a0-case-1');
const case1After = newCases.find((c: any) => c.caseId === '53db04a0-case-1');
if (JSON.stringify(case1Before) !== JSON.stringify(case1After)) throw Error('Original case 1 changed');
if (JSON.stringify(beforeCase) !== JSON.stringify(oldCases.find((c: any) => c.caseId === beforeCase.caseId))) throw Error('Whole before case CAS does not match original');
if (JSON.stringify(afterCase) !== JSON.stringify(cas.operations.find((op: any) => op.operationId === 'whole-case2').afterWholeCell)) throw Error('Whole after case CAS mismatch');
if (JSON.stringify(profile) !== JSON.stringify(cas.operations.find((op: any) => op.operationId === 'whole-53db-profile').afterWholeCell.profile)) throw Error('Whole after profile CAS mismatch');
if (!profileValidator(profile)) throw Error(ajv.errorsText(profileValidator.errors));
const refs = read(input + '/INPUTS.exact-existing-finding-case-profile-goal-image.bindings.json');
const asset = refs.original53dbImageBinding;
const imageDigests = { [asset.url]: sha(asset.source.path) };
const beforeFP = stock.fingerprintPositiveGoalEvidenceProfile(originalRecord.profile);
const afterFP = stock.fingerprintPositiveGoalEvidenceProfile(profile);
if (beforeFP !== originalRecord.profileFingerprint) throw Error('Original P profile hash mismatch');
const selector = read(input + '/NEUTRAL.targeted53db-case2.exact-input-selector.json');
if (afterFP !== selector.proposedProfileFingerprint) throw Error('Corrected P profile hash mismatch');
const goalFP = stock.fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic');
const inputFP = stock.fingerprintPositiveGoalEvidenceReviewInput(goal, originalRecord.reviewCriteriaFingerprint, imageDigests, 'curricularAtomic');
if (goalFP !== originalRecord.goalFingerprint || inputFP !== originalRecord.reviewInputFingerprint) throw Error('Current whole goal or image input drift');
const guard = { ...originalRecord, profile, profileFingerprint: afterFP, reason: 'Targeted independent schema/semantic guard only; no authoritative P or D record is materialized.' };
const semanticErrors = stock.validatePositiveGoalEvidenceRecordSemantics(guard, goal, imageDigests, 'curricularAtomic');
if (semanticErrors.length) throw Error(semanticErrors.join('; '));
const brief = profile.applicationCaseBriefs.find((b: any) => b.id === afterCase.caseId);
for (const lang of ['De', 'En']) {
  if (brief['taskDemand' + lang] !== afterCase['data' + lang] + '\n' + afterCase['task' + lang]) throw Error('Whole brief task/data mismatch ' + lang);
  if (brief['expectedPerformance' + lang] !== afterCase['modelAnswer' + lang]) throw Error('Whole brief model answer mismatch ' + lang);
  for (const row of afterCase.rubric) {
    const span = row['taskSpan' + lang];
    if (afterCase['task' + lang].slice(span.start, span.end) !== row['taskClause' + lang]) throw Error('Rubric task-span mismatch ' + lang);
  }
}
if (JSON.stringify(beforeCase.rubric[0]) !== JSON.stringify(afterCase.rubric[0])) throw Error('Original complete-route rubric changed');
if (afterCase.maximumPoints !== afterCase.rubric.reduce((sum: number, row: any) => sum + row.maximumPoints, 0)) throw Error('Case rubric points do not sum');
write(output + '/checks/stock-P-schema-semantic-fingerprints-exact-whole-CAS-and-rubric-joins.actual.json', {
  checkedAt: new Date().toISOString(),
  exactWholeBeforeAfterCaseCAS: true,
  exactWholeAfterProfileCAS: true,
  originalCase1Unchanged: true,
  originalFullRouteRubricUnchanged: true,
  profileSchemaValid: true,
  stockProfileSemanticErrors: semanticErrors,
  originalProfileFingerprint: beforeFP,
  correctedProfileFingerprint: afterFP,
  goalFingerprint: goalFP,
  reviewInputFingerprint: inputFP,
  goalAndImageInputUnchanged: true,
  bilingualWholeCaseBriefJoinsExact: true,
  bothRubricTaskSpansExact: true,
  separateInferenceCriterionId: afterCase.rubric[1].criterionId,
  separateInferenceMaximumPoints: afterCase.rubric[1].maximumPoints,
  caseMaximumPoints: afterCase.maximumPoints,
  noAuthoritativePRecordWritten: true,
  noNativeDMutation: true,
  noHumanApproval: true,
  stockModuleBinding: { path: 'app/scripts/positiveGoalEvidenceProfileModel.ts', sha256: sha('app/scripts/positiveGoalEvidenceProfileModel.ts') },
  stockSchemaBinding: { path: 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', sha256: sha('contracts/goal-evidence/v2/goal-evidence-profile.schema.json') }
});
console.log('Independent A targeted stock checks PASS: exact full case/profile CAS, P schema/semantics/fingerprints, bilingual joins, and separately graded inference.');
