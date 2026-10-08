import { buildApplicabilityCompilation } from '/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-layer-a-route-memory-scope-candidate-v1/native-applicability-candidate-probe.ts'
import {writeFileSync} from 'node:fs'
const goals=['53829f76-2d9c-5cdd-8521-c249f57f738d','95f2b860-d21d-5627-8dcd-cd53efd94b7b','aa9db8f6-c81e-5247-8f84-5f2b968ab2c4','1f5c3e82-dc4a-54cc-838e-66e4d434a7b5','2aee114f-d0d2-516f-8f95-1b72f707401d','78eeb8fe-fd5c-5d21-81be-75c3990fc4b5','4cd0c6d8-6485-51d0-883d-5d49ac46be70']
const report=buildApplicabilityCompilation().reports.find(r=>r.landscapeId==='605bdaf6-32d5-56fd-8d92-5a80c2fd2901')!
const records=report.goals.filter(g=>goals.includes(g.goalId)).map(g=>({...g,evidence:g.evidence.filter(e=>e.value=== (['53829f76-2d9c-5cdd-8521-c249f57f738d','95f2b860-d21d-5627-8dcd-cd53efd94b7b','aa9db8f6-c81e-5247-8f84-5f2b968ab2c4'].includes(g.goalId)?'DE-NI':g.goalId==='4cd0c6d8-6485-51d0-883d-5d49ac46be70'?'DE-HE':'DE-HB'))}))
writeFileSync('/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-layer-a-route-memory-scope-candidate-v1/independent-layer-a-review/origin-source-evidence.independent.actual.json',JSON.stringify({records},null,2)+'\n')
console.log(JSON.stringify({records},null,2))
