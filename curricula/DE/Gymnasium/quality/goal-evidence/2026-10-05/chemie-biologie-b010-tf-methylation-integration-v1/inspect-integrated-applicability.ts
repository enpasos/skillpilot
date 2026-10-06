// SPDX-License-Identifier: Apache-2.0
import {buildApplicabilityCompilation} from '../../../../../../../app/scripts/applicabilityCompiler'
const result=buildApplicabilityCompilation()
console.log(JSON.stringify({summary:result.summary, findings:result.reports.flatMap((report) => report.findings).filter((finding) => finding.code === 'APV-203')}, null, 2))
