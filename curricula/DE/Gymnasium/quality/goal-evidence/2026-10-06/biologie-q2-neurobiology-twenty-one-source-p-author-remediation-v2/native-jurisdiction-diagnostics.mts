// SPDX-License-Identifier: Apache-2.0
import { buildApplicabilityCompilation } from '../../../../../../../tmp/biologie-q2-neurobiology-twenty-one-source-p-author-remediation-20261006-v2-native-scope/app/scripts/applicabilityCompiler'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSync } from 'node:fs'
const here=dirname(fileURLToPath(import.meta.url));const phase=process.argv[2];if(!['baseline','candidate'].includes(phase))throw Error('phase')
const result=buildApplicabilityCompilation();const report=result.reports.find(r=>r.landscapeId==='08a43a1b-d97e-522c-9dfa-c950a493364e');if(!report)throw Error('Bio report missing')
writeFileSync(resolve(here,'native-'+phase,'applicability.actual.bio-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({phase,summary:report.summary,scope:'Bio native jurisdiction diagnostics only; partial sources do not prove whole/course/cohort coverage',wholeSourceApproval:false}));
