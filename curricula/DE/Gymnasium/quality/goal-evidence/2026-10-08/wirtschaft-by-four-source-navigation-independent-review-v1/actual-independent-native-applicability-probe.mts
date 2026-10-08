import { writeFile } from 'node:fs/promises';
import { buildApplicabilityCompilation } from '/tmp/skillpilot-wirtschaft-by-four-source-boundaries-current371-future311-oeytyg_d/app/scripts/applicabilityCompiler.ts';
const result=buildApplicabilityCompilation();
await writeFile('/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-by-four-source-navigation-independent-review-v1/actual-independent-native-applicability.full.json', JSON.stringify(result,null,2)+'\n',{flag:'wx'});
const e=result.reports.find(x=>x.landscapeId==='605bdaf6-32d5-56fd-8d92-5a80c2fd2901');
console.log(JSON.stringify({summary:e?.summary,errorsAndWarnings:e?.findings.filter(x=>['error','warning'].includes(x.severity))}));
