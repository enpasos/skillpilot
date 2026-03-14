import { buildApplicabilityCompilation, getApplicabilityReportDir, writeApplicabilityReports } from './applicabilityCompiler'

const result = buildApplicabilityCompilation()
writeApplicabilityReports(result)

console.log(`Applicability reports written to ${getApplicabilityReportDir()}`)
console.log(
  `Processed ${result.summary.landscapes} landscape(s), ${result.summary.goals} goal(s), ${result.summary.errors} error(s), ${result.summary.warnings} warning(s).`,
)
