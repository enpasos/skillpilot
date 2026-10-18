// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {relative,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {buildApplicabilityCompilation} from '../../../../../../../../app/scripts/applicabilityCompiler';
import * as stock from './stock-source-evaluators.actual-original-body';

const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-current737-original-source-audit-technical-20261018-v1/';
assert(!existsSync(out+'FREEZE.technical.sha256.json'),'Frozen technical record is immutable');
const CHEM='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0';
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const pin=(path:string)=>{path=relative(process.cwd(),resolve(path));const bytes=readFileSync(path);return{path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}};
const dump=(name:string,value:any)=>writeFileSync(out+name,JSON.stringify(value,null,2)+'\n');
const sourceFiles=stock.readAllGoalMappingFiles().filter((m:any)=>m.targetLandscapeId===CHEM);
const viewFiles=readdirSync('curricula/DE/Gymnasium/composition-views/chemie').filter(n=>n.endsWith('.view.json')).sort().map(n=>'curricula/DE/Gymnasium/composition-views/chemie/'+n);
const knownInputs=[canonical,'app/scripts/generateCurriculumQualityStatus.ts','app/scripts/applicabilityCompiler.ts','app/scripts/sourceCoverageEvidence.ts','docs/qa-ci/applicability-accepted-warnings.json',...['source-landscape-registry','canonical-goal-provenance-registry','canonical-goal-applicability-override-registry','source-goal-membership-registry','source-goal-closure-registry','canonical-goal-surrogate-evidence-registry'].map(n=>'curricula/DE/Gymnasium/provenance/'+n+'.json'),...viewFiles,...sourceFiles.flatMap((m:any)=>[m.file,m.sourceExtractionPath].filter(Boolean))];
const beforePins=[...new Set(knownInputs)].map(pin);
const startedUTC=new Date().toISOString(),started=Date.now();
const compilation=buildApplicabilityCompilation();
const report=compilation.reports.find(r=>r.landscapeId===CHEM);assert(report);
const oneReport={...compilation,reports:[report]};
const landscape=read(canonical);assert.equal(landscape.goals.length,737);
const coverage=stock.readJurisdictionCoverageByLandscapeId(oneReport).get(CHEM)!;assert(coverage);
const course=stock.evaluateCourseLevelMappingConsistency(landscape,sourceFiles);
const pipeline=stock.readMappingPipelineByLandscapeId().get(CHEM);
const warnings=stock.readApplicabilityWarningMetricsByLandscapeId(oneReport).get(CHEM);
const rules=[stock.evaluateSourceSnapshotIngestion(coverage,pipeline),stock.evaluateJurisdictionCoverage(coverage),course,stock.evaluateSourceGoalCountPlausibility(pipeline),stock.evaluateApplicabilityWarnings(warnings)];

// Retain exact concrete unsupported target rows, using the stock coverage checker.
const views=stock.readCompositionViewAtomicGoalIds(report),goals=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]));
const rawAtomic=report.goals.filter(g=>g.goalType==='atomic');
const canonicalAtomic=views.canonicalViewAtomicGoalIds.size>0?views.canonicalViewAtomicGoalIds:new Set(rawAtomic.map(g=>g.goalId));
const sourceAtomic=new Set([...canonicalAtomic].filter(id=>stock.isCurriculumSourceCoverageGoal(goals.get(id))));
const surrogate=stock.readAcceptedSurrogateEvidenceByKey(),unsupported:any[]=[];
for(const projection of report.projections){
 const targets=views.viewAtomicGoalIdsByJurisdiction.get(projection.value);
 const checker=stock.createCoverageEvidenceChecker(report,projection.value,surrogate,goals);
 const visible=report.goals.filter(g=>(g.compiledApplicability.jurisdiction??[]).includes(projection.value));
 const selected=(targets&&targets.size>0?rawAtomic.filter(g=>targets.has(g.goalId)):visible.filter(g=>g.goalType==='atomic'&&canonicalAtomic.has(g.goalId))).filter(g=>sourceAtomic.has(g.goalId));
 for(const goal of selected)if(!checker.hasCoverageBackedJurisdictionEvidence(goal))unsupported.push({goalId:goal.goalId,title:goals.get(goal.goalId).title,jurisdiction:projection.value,canonicalJSONPointer:'/goals/'+landscape.goals.findIndex((g:any)=>g.id===goal.goalId),evidence:goal.evidence.filter(e=>e.value===projection.value)});
}
assert.equal(unsupported.length,coverage.unsupportedAssignedAtomicGoals);
for(const p of beforePins)assert.deepEqual(pin(p.path),p,'Live source/evaluator input drift during bounded read: '+p.path);
const outputPins=['docs/qa-ci/status/curriculum-source-coverage-audit.json','docs/qa-ci/status/curriculum-source-coverage-audit.md'].map(pin);
dump('REPORT.actual-current-Chemistry-production-applicability.json',report);
dump('DIAGNOSIS.actual-stock-Chemistry-source-course-rules.json',{role:'BOUNDED_UNCHANGED_STOCK_SOURCE_AND_COURSE_EVALUATORS_NOT_CENTRAL_OR_M7_REPORT',startedUTC,finishedUTC:new Date().toISOString(),elapsedMS:Date.now()-started,privateExposure:'Stock module copied only into this evidence tools directory; relative imports and import.meta.url anchored to original location; export declarations appended; all evaluator bodies unchanged. Original module and normal files untouched. main() not called.',inputPins:beforePins,chemistryOnly:true,canonicalGoals:landscape.goals.length,rules,coverage,unsupported,unsupportedUniqueGoals:new Set(unsupported.map(r=>r.goalId)).size,mappingPipeline:pipeline,applicabilityWarningMetrics:warnings,productionCompilerSummary:report.summary,ownNormalWrites:0,otherM7ReviewsEvaluated:false,centralReportOrFullModelRun:false,newScientificOrHumanApproval:false,existingDependentAuditOutputPins:outputPins});
console.log(JSON.stringify({status:'READ_ONLY_CHEMISTRY_SOURCE_COURSE_EVALUATION_COMPLETE',rules,unsupportedOccurrences:unsupported.length,unsupportedUniqueGoals:new Set(unsupported.map(r=>r.goalId)).size,compilerSummary:report.summary,inputPinsChecked:beforePins.length,normalWrites:0},null,2));
