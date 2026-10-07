import {readFileSync,writeFileSync} from 'node:fs';
import {buildApplicabilityCompilation} from './applicabilityCompiler';
import {readJurisdictionCoverageByLandscapeId,evaluateJurisdictionCoverage} from './generateCurriculumQualityStatus';
const r=buildApplicabilityCompilation();const report=r.reports.find(x=>x.landscapeId==='08a43a1b-d97e-522c-9dfa-c950a493364e')!;
const all=readJurisdictionCoverageByLandscapeId({...r,reports:[report]});const coverage=all.get(report.landscapeId)!;const cqr=evaluateJurisdictionCoverage(coverage);
const out={generatedAt:new Date().toISOString(),candidateOnly:true,humanApproval:false,nativeApplicabilitySummary:report.summary,nativeCqr003:cqr,coverage,report};
writeFileSync('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cqr003-five-bounded-prerequisite-source-candidate-author-20261007-v1/checks/candidate-final-native-cqr003.actual.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({summary:report.summary,cqr:cqr.status,unsupported:coverage.unsupportedAssignedAtomicGoals,jurisdictions:coverage.jurisdictions.map(j=>({jurisdiction:j.jurisdiction,targets:j.visibleAtomicGoals,backed:j.sourceBackedAtomicGoals,unsupported:j.unsupportedAssignedAtomicGoals}))},null,2));
