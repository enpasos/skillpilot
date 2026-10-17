import {loadDeepUnderstandingRolloutConfig} from '/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule/app/scripts/reportDeepUnderstandingRollout.ts'
const path='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-AV-native-registry-root-v1/central.current439.A76.V-current.D107.conditional-chain-validation-only.private.config.json'
const c=loadDeepUnderstandingRolloutConfig(path);console.log(c.reportId,c.subjects[0].resolutionIndexPaths.length)
