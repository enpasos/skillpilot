// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const own = dirname(fileURLToPath(import.meta.url));
const root = resolve(own, '../../../../../../..');
const author = join(dirname(own), 'chemie-b008-source-view-placements-author-resumed-v1');
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const bind = (path: string) => ({ path: relative(root, path), sha256: createHash('sha256').update(readFileSync(path)).digest('hex'), bytes: readFileSync(path).length });
const frozen = join(own, 'own-bw-source-placement.first-independent-verdict.json');
assert.equal(bind(frozen).sha256, '9ffcaa2e0c159113c6dbb0d2eda65ffebe28f28ff9b6114e5372e4230cd47a1e');
const { normalizeCanonicalLandscape, validateCanonicalLandscape } = await import(pathToFileURL(join(root, 'app/src/utils/authoring/canonicalAuthoring.ts')).href);
const { compileCompositionView, collectCompositionProjectionRoleGoalIds } = await import(pathToFileURL(join(root, 'app/src/utils/authoring/compositionViewAuthoring.ts')).href);
const { buildGoalBookSourceAtlasInputs } = await import(pathToFileURL(join(root, 'app/scripts/goalBookSourceAtlasInputs.ts')).href);
const candidatePath = join(author, 'candidate/canonical.current504-bw-source-view.author-candidate.json');
const candidate = read(candidatePath);
const kindsPath = join(author, 'native/current504.semantic-kind.technical-input.json');
const kinds = read(kindsPath);
const kindById = new Map(kinds.decisions.map((decision: any) => [decision.goalId, decision.semanticKind]));
const typed = normalizeCanonicalLandscape({ ...candidate, goals: candidate.goals.map((goal: any) => ({ ...goal, semanticKind: kindById.get(goal.id) })) });
const graphErrors = validateCanonicalLandscape(normalizeCanonicalLandscape(candidate)).filter((f: any) => f.severity === 'error');
assert.deepEqual(graphErrors, []);
const viewPath = join(author, 'source-view-candidates/de-gym-chemie-bundesweit-source-de-bw-seki.bounded-author-candidate.json');
const view = read(viewPath);
const compiled = compileCompositionView(view, typed);
assert.deepEqual(compiled.findings.filter((f: any) => f.severity === 'error'), []);
const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(typed.goals.map((goal: any) => [goal.id, goal])));
const first = read(frozen);
for (const proposed of first.projectionRoleDecisions) {
  assert.equal(roles.targetGoalIds.has(proposed.goalId), proposed.role === 'target');
  assert.equal(roles.prerequisiteOnlyGoalIds.has(proposed.goalId), proposed.role === 'prerequisiteOnly');
}
assert.equal(roles.targetGoalIds.size, 97);
assert.equal(roles.prerequisiteOnlyGoalIds.size, 1);
const originalViewPath = join(dirname(own), '../2026-10-07/chemie-b008-current169-routing-placement-author-v12/source-views/de-gym-chemie-bundesweit-source-de-bw-seki.current-input.json');
const originalView = read(originalViewPath);
const collect = (nodes: any[]): any[] => nodes.flatMap(node => [...(node.kind === 'goalEntry' ? [node] : []), ...collect(node.children ?? [])]);
const originalEntries = collect(originalView.rootNodes);
const candidateEntries = collect(view.rootNodes);
const removedFamilies = new Set(['542822de-cb96-56cf-a487-0fc3b5820f57', '91238ba1-5c63-50c7-a4fd-9bbe492c6b61']);
const unaffected = originalEntries.filter((node: any) => !removedFamilies.has(node.goalId));
assert.equal(unaffected.length, 93);
assert.ok(unaffected.every((node: any) => candidateEntries.some((now: any) => JSON.stringify(now) === JSON.stringify(node))));
assert.deepEqual(originalView.scope, view.scope);

// The unchanged ordinary nationwide atlas contract is retried only to find
// the next real hold after substituting B's inactive, actually reviewed BW
// mapping proposal. No guard is weakened and returned outputs are not written.
const configPath = join(author, 'checks/bw-pending-before-sl.normal-source-atlas.config.json');
const config = read(configPath);
const authorMappingRelative = relative(root, join(author, 'candidate-source-mappings/BW-SekI.source-mapping.author-candidate.json'));
const proposalPath = join(own, 'candidate-source-mappings/BW-SekI.source-mapping.independent-b.bounded-proposal.json');
assert.ok(config.mappingPaths.includes(authorMappingRelative));
config.mappingPaths = config.mappingPaths.map((p: string) => p === authorMappingRelative ? relative(root, proposalPath) : p);
const ownConfigPath = join(own, 'checks/normal-atlas-with-only-b-bounded-bw-proposal.config.json');
writeFileSync(ownConfigPath, JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
let atlasOutcome: any;
try {
  const atlas = buildGoalBookSourceAtlasInputs(config, root);
  atlasOutcome = { status: 'technical_build_only', generatedOutputsWritten: false, counts: atlas.receipt.counts,
    wholeSourceApproval: false, sourceGreen: false, independentlyReviewedOnlyBWBoundedComponents: true };
} catch (error) {
  atlasOutcome = { status: 'HOLD', exactOrdinaryError: error instanceof Error ? error.message : String(error),
    generatedOutputsWritten: false, noFabricatedReviewMetadata: true, sourceGreen: false };
}
const report = {
  schemaVersion: 1, role: 'Actual B narrow composition compile and ordinary atlas retry, no global acceptance',
  createdAtUTC: new Date().toISOString(), firstIndependentVerdict: bind(frozen),
  helperBindings: ['app/src/utils/authoring/canonicalAuthoring.ts', 'app/src/utils/authoring/compositionViewAuthoring.ts', 'app/scripts/goalBookSourceAtlasInputs.ts'].map(p => bind(join(root, p))),
  candidateLandscape: bind(candidatePath), candidateView: bind(viewPath), semanticKindTechnicalInput: bind(kindsPath),
  ordinaryCanonicalGraphErrors: graphErrors, ordinaryAffectedViewFindings: compiled.findings,
  actualExplicitTargetCount: 4, actualExplicitPrerequisiteOnlyCount: 1,
  targetIDsInWholeBWView: [...roles.targetGoalIds], prerequisiteOnlyIDsInWholeBWView: [...roles.prerequisiteOnlyGoalIds],
  unaffected93OriginalViewEntriesExactRetained: true, durationAndCourseNotInvented: true,
  normalAtlasConfig: bind(ownConfigPath), normalAtlasOutcome: atlasOutcome,
  ownNewScientificApprovalsInThisTechnicalCheck: 0, strictGain: 0, activeWrites: 0, humanApproval: false, humanTrial: false,
};
const reportPath = join(own, 'checks/ordinary-affected-composition-and-normal-atlas.actual.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ report: bind(reportPath), targets: roles.targetGoalIds.size, prerequisiteOnly: roles.prerequisiteOnlyGoalIds.size, atlasOutcome }));
