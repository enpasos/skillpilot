import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { preservesMemoryVisibilityScopes, preservesMemoryVisibilityCoverageRequirement } from '/home/enpasos/projects/skillpilot/app/scripts/memoryCardReviewConfigDiscovery.ts'
const old = JSON.parse(readFileSync(resolve(process.cwd(), "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final702-native-SEM-346-exact-and48-pointer-followers-AUTHOR-INERT-c-v1/memory346.only-final702-sem-pointer.activation-ready.config.json"), 'utf8'))
const candidate = JSON.parse(readFileSync(resolve(process.cwd(), "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-CI-current-head-source-view-and-test-contract-root-v1/memory346.only-thirteen-qualified-SekI-visibility-scopes48.ROOT-CANDIDATE.config.json"), 'utf8'))
const defaultConfig = JSON.parse(readFileSync(resolve(process.cwd(), "curricula/DE/Gymnasium/quality/memory-card-review/canonical-economics-full.config.json"), 'utf8'))
const stableFields = ['reviewId','landscapeId','landscapePath','ruleVersion','scope']
const check = {
  nativeNode: process.version,
  actualOriginalFunctions: ['preservesMemoryVisibilityScopes','preservesMemoryVisibilityCoverageRequirement'],
  checkedSource: 'app/scripts/memoryCardReviewConfigDiscovery.ts',
  old35PrefixPreserved: preservesMemoryVisibilityScopes(old.visibilityScopes, candidate.visibilityScopes),
  default34PrefixPreserved: preservesMemoryVisibilityScopes(defaultConfig.visibilityScopes, candidate.visibilityScopes),
  oldCoverageRequirementPreserved: preservesMemoryVisibilityCoverageRequirement(old.visibilityScopeCoverageRequired, candidate.visibilityScopeCoverageRequired),
  defaultCoverageRequirementPreserved: preservesMemoryVisibilityCoverageRequirement(defaultConfig.visibilityScopeCoverageRequired, candidate.visibilityScopeCoverageRequired),
  stableFieldsUnchangedToOld: stableFields.every(field => JSON.stringify(old[field]) === JSON.stringify(candidate[field])),
  stableFieldsUnchangedToDefault: stableFields.every(field => JSON.stringify(defaultConfig[field]) === JSON.stringify(candidate[field])),
  oldScopeCount: old.visibilityScopes.length,
  candidateScopeCount: candidate.visibilityScopes.length,
  activeRegistryMutation: false,
  nativeFullMemoryRunClaimed: false,
}
for (const [key,value] of Object.entries(check)) if ((key.includes('Preserved') || key.includes('Unchanged')) && value !== true) throw new Error(key)
writeFileSync(resolve(process.cwd(), "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-SekI13Views26-and-memory48-only-field-independent-a-READONLY-v1/actual-original-native-memory35-to48-routing.READONLY.json"), JSON.stringify(check, null, 2) + '\n')
console.log(JSON.stringify(check))
