import {buildApplicabilityCompilation} from '../../../../../../../../app/scripts/applicabilityCompiler.ts';
import {createHash} from 'node:crypto';import {writeFileSync,readFileSync} from 'node:fs';
const c=buildApplicabilityCompilation();const r=c.reports.find(r=>r.landscapeId==='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0');
if(!r)throw new Error('No Chem report');const digest=(x:any)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const ids=new Set(JSON.parse(readFileSync(process.argv[2],'utf8')));writeFileSync(process.argv[3],JSON.stringify({schemaVersion:1,wholeChemReportGoalsDigest:digest(r.goals),wholeChemReportFindingsDigest:digest(r.findings),stockSummary:c.summary,selectedWholeCompiledGoals:r.goals.filter(g=>ids.has(g.goalId))},null,2)+'\n');
