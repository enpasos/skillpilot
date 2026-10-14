import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import ts from '../../../../../../../../app/node_modules/typescript/lib/typescript.js';
import {
  createReviewedRequiresClosureCoverageChecker,
  sourceCoverageSurrogateKey,
  hasDirectSourceCoverageEvidence,
} from '../../../../../../../../app/scripts/sourceCoverageEvidence.ts';

const root = resolve('.');
const reviewRoot = process.argv[2];
const load = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
const sha = (p: string) => createHash('sha256').update(readFileSync(resolve(root, p))).digest('hex');
const input = load(`${reviewRoot}/inputs/WHOLE24.tuples-and-complete-downstream-partners.actual.json`);
const compiled = load(`${reviewRoot}/inputs/STOCK.selected-compiler-full-evidence.actual.json`);
const landscape = load(input.sourceSnapshot);
const baseline = load('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current402-source-discovery-and-original-obligations-technical-20261013-v1/checks/baseline.stock-source-course-and-visible-coverage.actual.json');
if (`sha256:${compiled.wholeChemReportGoalsDigest}` !== baseline.actualCompilerAllGoalEvidenceDigest) throw Error('Goal evidence drift');
if (`sha256:${compiled.wholeChemReportFindingsDigest}` !== baseline.actualCompilerAllFindingsDigest) throw Error('Finding drift');

// Evaluate the three private stock predicates literally, removing TypeScript types only.
// No engine source or registry is edited. Scientific acceptance is never inferred here.
const auditPath = 'app/scripts/generateCurriculumSourceCoverageAudit.ts';
const source = readFileSync(resolve(root, auditPath), 'utf8');
const names = ['isMemoryGoal', 'isPracticeOrAssessmentGoal', 'isCurriculumSourceCoverageGoal'];
const literals = names.map(name => {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw Error(`Missing stock predicate ${name}`);
  const end = source.indexOf('\n}', start) + 2;
  return source.slice(start, end);
}).join('\n\n');
const js = ts.transpileModule(literals, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const eligible = new Function(`${js}\nreturn isCurriculumSourceCoverageGoal;`)();
const canonical = new Map(landscape.goals.map((g: any) => [g.id, g]));
const goals = compiled.selectedWholeCompiledGoals;
const byId = new Map(goals.map((g: any) => [g.goalId, g]));
const registryPath = 'curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json';
const realChemEntries = (load(registryPath).entries ?? []).filter((e: any) => e.landscapeId === landscape.landscapeId);
if (realChemEntries.length !== 0) throw Error('Unexpected preexisting Chemistry surrogate entries');
const rows = input.tuples.map((tuple: any) => {
  const jurisdiction = tuple.jurisdiction;
  const proofMap = new Map<string, any[]>();
  // Counterfactual shape test: insert every actual edge in memory, including rejected/HOLD ones.
  // A true result shows policy reachability only and is explicitly NOT a proposed accepted registry.
  input.tuples.filter((t: any) => t.jurisdiction === jurisdiction).forEach((t: any) => {
    const key = sourceCoverageSurrogateKey(landscape.landscapeId, t.wholePrerequisiteGoal.id, jurisdiction);
    proofMap.set(key, t.wholeDownstreamPartners.map((p: any) => ({ requiredByGoalId: p.id })));
  });
  const original = createReviewedRequiresClosureCoverageChecker({ landscapeId: landscape.landscapeId, jurisdiction, goals, canonicalGoalById: canonical, surrogateEntriesByKey: new Map(), isEligibleCanonicalGoal: eligible });
  const hypothetical = createReviewedRequiresClosureCoverageChecker({ landscapeId: landscape.landscapeId, jurisdiction, goals, canonicalGoalById: canonical, surrogateEntriesByKey: proofMap, isEligibleCanonicalGoal: eligible });
  const goal: any = byId.get(tuple.wholePrerequisiteGoal.id);
  return {
    goalId: goal.goalId, jurisdiction,
    actualAcceptedRegistryCoverage: original.hasCoverageBackedJurisdictionEvidence(goal),
    counterfactualAllEdgesStructuralCoverage: hypothetical.hasCoverageBackedJurisdictionEvidence(goal),
    scienceNotInferredFromStructuralCoverage: true,
    wholePartnerClassification: tuple.wholeDownstreamPartners.map((p: any) => {
      const c: any = byId.get(p.id);
      return { goalId: p.id, title: p.title, stockGoalType: c.goalType, stockCoverageEligiblePredicate: eligible(p), ordinaryAtomicAnchor: c.goalType === 'atomic' && eligible(p), ownScopeDirectEvidence: hasDirectSourceCoverageEvidence(c, jurisdiction) };
    }),
  };
});
writeFileSync(resolve(root, `${reviewRoot}/CHECK.stock-unmodified-closure-shape-and-exact-baseline.actual.json`), JSON.stringify({ schemaVersion: 1, actualStockFunctionsUsed: ['createReviewedRequiresClosureCoverageChecker', 'hasDirectSourceCoverageEvidence', ...names], stockPredicateLiteralTypeErasureOnly: true, stockPredicateLiteralRawSHA256: createHash('sha256').update(literals).digest('hex'), stockAuditRawSHA256: sha(auditPath), stockCheckerRawSHA256: sha('app/scripts/sourceCoverageEvidence.ts'), stockCompilerGoalAndFindingDigestsExactlyMatchFrozenBaseline: true, realChemRegistryEntryCount: realChemEntries.length, registryWritten: false, actualUnsupportedAll24: rows.every((r: any) => !r.actualAcceptedRegistryCoverage), counterfactualStructuralCoverageCount: rows.filter((r: any) => r.counterfactualAllEdgesStructuralCoverage).length, counterfactualNotScientificApproval: true, rows }, null, 2) + '\n');
console.log(JSON.stringify({ rows: rows.length, actualUnsupportedAll24: rows.every((r: any) => !r.actualAcceptedRegistryCoverage), counterfactualStructuralCoverageCount: rows.filter((r: any) => r.counterfactualAllEdgesStructuralCoverage).length }));
