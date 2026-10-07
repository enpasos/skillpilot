import {readFileSync,writeFileSync} from 'node:fs';
import {buildApplicabilityCompilation} from '../../app/scripts/applicabilityCompiler';
import {createReviewedRequiresClosureCoverageChecker,sourceCoverageSurrogateKey} from '../../app/scripts/sourceCoverageEvidence';
const report=buildApplicabilityCompilation().reports.find(r=>r.file.endsWith('DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'))!;
const landscape=JSON.parse(readFileSync(report.file,'utf8'));
const goals=new Map(landscape.goals.map((g:any)=>[g.id,g]));
const eligible=(g:any)=>Boolean(g&&!g.examData&&g.nodeKind!=='memory'&&!(g.tags??[]).some((tag:string)=>['memorization','Practice','Assessment','Motivation','Orientation'].includes(tag)||tag.startsWith('srs-deck:')));
const registry=JSON.parse(readFileSync('curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json','utf8'));
const entries=new Map<string,any[]>();
for(const e of registry.entries??[])if(e.status==='accepted'&&e.evidenceType==='requires-closure'&&e.rationale?.trim()){const k=sourceCoverageSurrogateKey(e.landscapeId,e.goalId,e.jurisdiction);entries.set(k,[...(entries.get(k)??[]),e]);}
const result:any[]=[];
for(const jurisdiction of ['DE-BB','DE-BE','DE-HH','DE-RP','DE-TH']){
 const checker=createReviewedRequiresClosureCoverageChecker({landscapeId:report.landscapeId,jurisdiction,goals:report.goals,canonicalGoalById:goals,surrogateEntriesByKey:entries,isEligibleCanonicalGoal:eligible});
 const unsupported=report.goals.filter(g=>g.goalType==='atomic'&&eligible(goals.get(g.goalId))&&g.compiledApplicability.jurisdiction?.includes(jurisdiction)&&!checker.hasCoverageBackedJurisdictionEvidence(g));
 result.push({jurisdiction,unsupported:unsupported.map(g=>({...g,canonical:goals.get(g.goalId),surrogate:entries.get(sourceCoverageSurrogateKey(report.landscapeId,g.goalId,jurisdiction))??[]}))});
}
writeFileSync('tmp/bio-cqr003-five-scope/current-compiled.actual.json',JSON.stringify({landscapeId:report.landscapeId,summary:report.summary,result,report},null,2)+'\n');
console.log(JSON.stringify(result,null,2));
