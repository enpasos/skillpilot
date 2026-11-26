import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const [repoArg, inventoryArg] = process.argv.slice(2);
const repo = resolve(repoArg), inventory = resolve(inventoryArg);
const json = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const hash = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const { stableGoalBookJson, parseAndValidateGoalBookModel } = await import(pathToFileURL(join(repo, 'app/scripts/goalBookModel.ts')).href);
const { fingerprintPositiveGoalEvidenceProfile } = await import(pathToFileURL(join(repo, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href);
const { fingerprintGoalEvidenceProfile } = await import(pathToFileURL(join(repo, 'app/scripts/goalEvidenceProfileModel.ts')).href);
const { fingerprintGoalDescriptionDualRoundResolution } = await import(pathToFileURL(join(repo, 'app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href);
const { fingerprintGoalDescriptionRolloutSynthesisDecisionManifest } = await import(pathToFileURL(join(repo, 'app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest.ts')).href);
const assert = (ok: unknown, why: string) => { if (!ok) throw Error(why); };
let parsed = 0, profiles = 0, books = 0;
for (const line of readFileSync(join(inventory, 'path-bindings.actual.jsonl'), 'utf8').split(/\r?\n/).filter(Boolean)) {
  const b = JSON.parse(line);
  if (!['native_parsed_json', 'historical_native_parsed_json', 'native_fingerprinted_json', 'native_book_model'].includes(b.origin.kind)) continue;
  if (b.origin.kind !== 'historical_native_parsed_json') assert(b.origin.root === 'repo', 'Unexpected external native JSON root');
  const raw = b.origin.kind === 'historical_native_parsed_json'
    ? execFileSync('git', ['show', `${b.origin.commit}:${b.origin.path}`], { cwd: repo, maxBuffer: 32 * 1024 * 1024 })
    : readFileSync(join(repo, b.origin.path));
  assert(hash(raw) === b.origin.sha256, 'Native JSON source raw bytes drift');
  const text = raw.toString();
  const value = b.origin.path.endsWith('.jsonl') ? text.split(/\r?\n/).filter(Boolean).map(s => JSON.parse(s)) : JSON.parse(text);
  if (b.origin.kind === 'native_book_model') {
    parseAndValidateGoalBookModel(value);
    assert(value.digest.replace(/^sha256:/, '') === b.sha256, 'Native model digest differs');
  } else if (b.origin.kind === 'native_fingerprinted_json') {
    const field = b.origin.fingerprintField;
    const payload = Object.fromEntries(Object.entries(value).filter(([key]) => key !== field));
    const expected = field === 'resolutionFingerprint'
      ? fingerprintGoalDescriptionDualRoundResolution(payload)
      : fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload);
    assert(expected.replace(/^sha256:/, '') === b.sha256, 'Native description artifact fingerprint differs');
  } else {
    assert(hash(stableGoalBookJson(value)) === b.sha256, 'Native JSON value digest drift');
  }
  parsed++;
}
const manifest = json(join(inventory, 'record-lifecycle.actual.json'));
function walk(value: any, path: string): void {
  if (Array.isArray(value)) { for (const item of value) walk(item, path); return; }
  if (!value || typeof value !== 'object') return;
  if (value.profile && typeof value.profileFingerprint === 'string') {
    const expected = value.profileRuleVersion === 'positive-understanding-evidence-v2'
      ? fingerprintPositiveGoalEvidenceProfile(value.profile)
      : fingerprintGoalEvidenceProfile(value.profile, value.ruleVersion ?? 'goal-evidence-v1');
    assert(expected === value.profileFingerprint, 'Embedded profile body differs from native fingerprint: ' + path);
    profiles++;
  }
  for (const item of Object.values(value)) walk(item, path);
}
for (const r of manifest.records) {
  if (!r.present || !/\.jsonl?$/.test(r.path)) continue;
  const raw = readFileSync(join(repo, r.path), 'utf8');
  const value = r.path.endsWith('.jsonl') ? raw.split(/\r?\n/).filter(Boolean).map(s => JSON.parse(s)) : JSON.parse(raw);
  walk(value, r.path);
  if (r.path.endsWith('/book-model.json')) { parseAndValidateGoalBookModel(value); books++; }
}
console.log(JSON.stringify({ contract: 'physics-e2-energy-native-value-integrity-v1', nativeParsedJsonBindings: parsed, embeddedProfileBodies: profiles, sealedBookModels: books }));
