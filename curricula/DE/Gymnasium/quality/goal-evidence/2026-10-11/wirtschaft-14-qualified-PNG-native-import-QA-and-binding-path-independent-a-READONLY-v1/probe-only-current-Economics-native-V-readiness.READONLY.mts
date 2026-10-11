import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Optional Root-only follow-up: invokes only the ORIGINAL Economics scope and V
// predicates, including the native Economics-only QA freshness check. No D/P/A/M
// review loops, report generation, canonical writes or foreign checks are run.
const root = process.cwd();
const output = process.argv[2];
if (!output || !resolve(output).startsWith('/tmp/economics-') || existsSync(output)) {
  throw new Error('Provide a NEW /tmp/economics-... output path');
}
const original = join(root, 'app/scripts/reportDeepUnderstandingRollout.ts');
const reg = join(root, 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');
const req = createRequire(join(root, 'app/package.json'));
const Module = req('node:module');
const sha = (b: Buffer) => 'sha256:' + createHash('sha256').update(b).digest('hex');
const guards = new Map<string, string>();
const read = (p: string) => { const b = readFileSync(p); guards.set(p, sha(b)); return b; };
const registry = JSON.parse(read(reg).toString());
const economics = registry.subjects.filter((s: any) => s.subject === 'wirtschaftswissenschaften');
if (economics.length !== 1) throw new Error('Require exactly one Economics subject');
const config = economics[0];
for (const p of [config.landscapePath, config.semanticKindLedgerPath, config.visualizationQaPath,
  'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json',
  'app/scripts/generateGoalVisualizationQaLedgers.ts']) read(resolve(root, p));
let source = read(original).toString();
source += '\nexport { loadAuthoritativeScope, loadVisualizationReadyGoals };\n';
const code = req('esbuild').transformSync(source, {
  format: 'cjs', platform: 'node', target: 'node20', loader: 'ts',
  define: { 'import.meta.url': JSON.stringify(pathToFileURL(original).href) },
}).code;
const mod = new Module(original);
mod.filename = original; mod.paths = Module._nodeModulePaths(dirname(original));
mod._compile(code, original);
const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const scope = mod.exports.loadAuthoritativeScope(config);
const issues: string[] = []; const deferred = new Set<string>();
const ready = mod.exports.loadVisualizationReadyGoals(config, scope, issues, deferred);
const inputEndGuards = [...guards].map(([path, before]) => ({ path, before, after: sha(readFileSync(path)) }));
if (inputEndGuards.some((x) => x.before !== x.after)) throw new Error('Input changed');
if (execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() !== head) throw new Error('HEAD changed');
writeFileSync(output, JSON.stringify({ status: 'READONLY-original-native-Economics-V-predicate-only',
  actualUTC: new Date().toISOString(), head, subject: config.subject, denominator: scope.denominator,
  readyGoalIds: [...ready], deferredGoalIds: [...deferred], missingGoalIds: [...scope.atomicGoalIds].filter((id) => !ready.has(id)),
  authoritativeScopeIssues: scope.issues, visualizationIssues: issues, inputEndGuards,
  activeWrites: 0, newVisualReviews: 0, humanApproval: false, M7Claim: false }, null, 2) + '\n');
console.log(JSON.stringify({ denominator: scope.denominator, nativeVReady: ready.size, issues: [...scope.issues, ...issues], output }));
