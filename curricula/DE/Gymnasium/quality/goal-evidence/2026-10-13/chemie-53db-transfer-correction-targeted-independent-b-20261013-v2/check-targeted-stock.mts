import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js';
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js';

const repo = process.cwd();
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-53db-meaningful-transfer-case-targeted-author-20261013-v2';
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-53db-transfer-correction-targeted-independent-b-20261013-v2';
const read = (path: string) => JSON.parse(readFileSync(resolve(repo, path), 'utf8'));
const sha = (path: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(repo, path))).digest('hex');
const stock = await import(resolve(repo, 'app/scripts/positiveGoalEvidenceProfileModel.ts'));
const schema = read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json');
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateProfile = ajv.compile({ $schema: schema.$schema, $defs: schema.$defs, ...schema.properties.profile });
const after = read(author + '/candidate/PROFILE.complete53db-targeted-after.DEEN.author.json').profile;
if (!validateProfile(after)) throw Error(ajv.errorsText(validateProfile.errors));
const before = read(author + '/inputs/exact-current406-original53db-P4-record.json');
const goal = read(author + '/inputs/exact-current406-whole53db-goal.json');
const asset = read(author + '/INPUTS.exact-existing-finding-case-profile-goal-image.bindings.json').original53dbImageBinding;
const digestByUrl = { [asset.url]: sha(asset.source.path) };
if (sha(asset.source.path) !== asset.source.sha256 || sha(asset.copy.path) !== asset.source.sha256) throw Error('Source/image copy drift');
const beforeFingerprint = stock.fingerprintPositiveGoalEvidenceProfile(before.profile);
const afterFingerprint = stock.fingerprintPositiveGoalEvidenceProfile(after);
const goalFingerprint = stock.fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic');
const inputFingerprint = stock.fingerprintPositiveGoalEvidenceReviewInput(goal, before.reviewCriteriaFingerprint, digestByUrl, 'curricularAtomic');
if (beforeFingerprint !== before.profileFingerprint) throw Error('Original profile fingerprint mismatch');
if (goalFingerprint !== before.goalFingerprint || inputFingerprint !== before.reviewInputFingerprint) throw Error('Goal/resource input drift');
const guard = { ...before, profile: after, profileFingerprint: afterFingerprint };
const errors = stock.validatePositiveGoalEvidenceRecordSemantics(guard, goal, digestByUrl, 'curricularAtomic');
if (errors.length) throw Error(errors.join('; '));
const c = read(author + '/candidate/CASE2.complete-targeted-after.DEEN.author.json');
const brief = after.applicationCaseBriefs.find((b: any) => b.id === c.caseId);
if (!brief) throw Error('Corrected case brief missing');
for (const lang of ['De', 'En']) {
  if (brief['taskDemand' + lang] !== c['data' + lang] + '\n' + c['task' + lang]) throw Error('Data/task join drift: ' + lang);
  if (brief['expectedPerformance' + lang] !== c['modelAnswer' + lang]) throw Error('Expected answer drift: ' + lang);
  for (const rubric of c.rubric) {
    const span = rubric['taskSpan' + lang];
    if (c['task' + lang].slice(span.start, span.end) !== rubric['taskClause' + lang]) throw Error('Rubric span drift: ' + lang);
  }
}
if (c.rubric.reduce((sum: number, row: any) => sum + row.maximumPoints, 0) !== c.maximumPoints) throw Error('Rubric points drift');
const result = {
  schemaVersion: 1,
  execution: 'Independent B calls to unmodified stock profile module/schema; this is a structural guard, separate from the scientific judgment.',
  profileSchemaValid: true,
  stockSemanticErrors: errors,
  originalProfileFingerprint: beforeFingerprint,
  proposedProfileFingerprint: afterFingerprint,
  originalGoalFingerprintUnchanged: goalFingerprint,
  originalGoalAndImageInputFingerprintUnchanged: inputFingerprint,
  exactBilingualBriefDataTaskAndAnswerJoins: true,
  exactBothRubricTaskSpans: true,
  maximumPoints: c.maximumPoints,
  modelModule: { path: 'app/scripts/positiveGoalEvidenceProfileModel.ts', sha256: sha('app/scripts/positiveGoalEvidenceProfileModel.ts') },
  profileSchema: { path: 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json', sha256: sha('contracts/goal-evidence/v2/goal-evidence-profile.schema.json') },
  materializedPRecordCreated: false,
  humanApproval: false,
};
writeFileSync(resolve(repo, own, 'STOCK.independent-b-profile-and-case.actual.json'), JSON.stringify(result, null, 2) + '\n');
console.log('PASS independent B stock P profile schema/semantics; exact bilingual case joins/spans; unchanged goal/image input. No materialized P record or native D binding created.');
