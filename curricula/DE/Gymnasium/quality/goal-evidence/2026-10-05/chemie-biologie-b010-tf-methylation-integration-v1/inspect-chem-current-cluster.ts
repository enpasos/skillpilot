// SPDX-License-Identifier: Apache-2.0
import {buildApplicabilityCompilation} from '../../../../../../../app/scripts/applicabilityCompiler'
const result=buildApplicabilityCompilation()
const report=result.reports.find((r) => r.landscapeId === 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
if (!report) throw new Error('Chemie report missing')
console.log(JSON.stringify({goals:report.goals.filter((g) => ['bf001d50-ad32-5de8-885d-bd09174a0f5e','16a80de2-b5e0-5467-a9b3-5860730d7d8b','58486300-3f84-5aa1-9ed4-66186af62669','e0e201bd-a1fd-5985-ab08-fd24c8655f3d'].includes(g.goalId)),findings:report.findings.filter((f) => f.code==='APV-203')},null,2))
