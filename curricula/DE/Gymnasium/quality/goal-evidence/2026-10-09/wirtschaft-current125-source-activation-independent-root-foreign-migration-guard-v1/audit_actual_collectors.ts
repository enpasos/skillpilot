import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readAllGoalMappingFiles } from '../../../../../../../app/scripts/generateCurriculumQualityStatus'
import { getAllJsonFiles } from '../../../../../../../app/scripts/applicabilityCompiler'

const out = dirname(fileURLToPath(import.meta.url))
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1'
const plan = JSON.parse(readFileSync(resolve(author, 'actual-current125-registry-mapping-source-root-activation-and-byteexact-old-BE-history.author-plan.json'), 'utf8'))
const repo = resolve('.')
const rel = (p: string) => p.slice(repo.length + 1).replaceAll('\\', '/')
const qualityMappings = readAllGoalMappingFiles().map(x => x.file)
const applicabilityMappings = getAllJsonFiles(resolve('curricula/DE')).filter(x => x.replaceAll('\\', '/').includes('/mapping/')).map(rel)
const inputExtractions = getAllJsonFiles(resolve('curricula/DE/Gymnasium/input')).filter(x => /\.source-extraction\.json$/iu.test(x)).map(rel)
const histories = plan.historicalBytes.map((h: any) => ({originalOperativePath:h.originalOperativePath,archivePath:h.wholeExactHistoricalArtifact.path,sourceInputCollectorIncludesOriginal:inputExtractions.includes(h.originalOperativePath),qualityMappingCollectorIncludesOriginal:qualityMappings.includes(h.originalOperativePath),applicabilityMappingCollectorIncludesOriginal:applicabilityMappings.includes(h.originalOperativePath),sourceInputCollectorIncludesArchive:inputExtractions.includes(h.wholeExactHistoricalArtifact.path),qualityMappingCollectorIncludesArchive:qualityMappings.includes(h.wholeExactHistoricalArtifact.path),applicabilityMappingCollectorIncludesArchive:applicabilityMappings.includes(h.wholeExactHistoricalArtifact.path)}))
const result = {documentType:'independent-root-foreign-native-collector-discovery-before-source-activation',at:new Date().toISOString(),qualityMappingCount:qualityMappings.length,applicabilityMappingCount:applicabilityMappings.length,sourceInputExtractionCount:inputExtractions.length,histories,qualityMappings,applicabilityMappings,inputExtractions,claimLimits:{noActivation:true,noCourseOrScienceReview:true,backendJavaCollectorNotExecuted:true,sourceStatusCollectorUsesSameInputRootAndSuffixInspectedInNativeSource:true}}
writeFileSync(resolve(out,'actual-native-collector-discovery.before-source-activation.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({qualityMappingCount:qualityMappings.length,applicabilityMappingCount:applicabilityMappings.length,sourceInputExtractionCount:inputExtractions.length,histories}))
