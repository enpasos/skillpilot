// SPDX-License-Identifier: Apache-2.0
import {buildApplicabilityCompilation} from '/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts'
const r=buildApplicabilityCompilation().reports.find(r=>r.landscapeId==='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')!
for(const f of r.findings.filter(f=>f.code==='APV-203'))console.log(JSON.stringify({finding:f,goal:r.goals.find(g=>g.goalId===f.goalId)},null,2))
