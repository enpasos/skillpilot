import type { UiGoal } from '../goalTypes'
import { CANONICAL_GYMNASIUM_ROOT_ID } from './curriculumDisplay'
import {
  goalMatchesGlobalStageScope,
  type PersonalCurriculumStageConfig,
  type PersonalCurriculumStageScope,
} from './personalCurriculumStageScope'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const configForStage = (
  stage: PersonalCurriculumStageScope,
): PersonalCurriculumStageConfig => ({
  [CANONICAL_GYMNASIUM_ROOT_ID]: {
    selected: true,
    stage,
  },
})

const stageGoal = (
  phase: string,
  tags: string[] = [],
): Pick<UiGoal, 'title' | 'tags' | 'phase'> => ({
  title: 'Neutraler fachlicher Knoten',
  phase: phase as UiGoal['phase'],
  tags,
})

const sek1Config = configForStage('SekI')
const sek2Config = configForStage('SekII')

assert(
  goalMatchesGlobalStageScope(stageGoal('SekI'), sek1Config),
  'a direct SekI phase remains visible in a Sek I scope',
)
assert(
  !goalMatchesGlobalStageScope(stageGoal('SekI'), sek2Config),
  'a direct SekI phase is hidden in a Sek II scope',
)
assert(
  goalMatchesGlobalStageScope(stageGoal('SekII'), sek2Config),
  'a direct SekII phase remains visible in a Sek II scope',
)
assert(
  !goalMatchesGlobalStageScope(stageGoal('SekII'), sek1Config),
  'a direct SekII phase is hidden in a Sek I scope',
)

assert(
  !goalMatchesGlobalStageScope(
    stageGoal('GLOBAL', ['PhAsE:sEkI']),
    sek2Config,
  ),
  'a case-insensitive phase:SekI tag is hidden in a Sek II scope',
)
assert(
  !goalMatchesGlobalStageScope(
    stageGoal('GLOBAL', ['pHaSe:SeKiI']),
    sek1Config,
  ),
  'a case-insensitive phase:SekII tag is hidden in a Sek I scope',
)
assert(
  goalMatchesGlobalStageScope(
    stageGoal('GLOBAL', ['phase:SekI', 'phase:SekII']),
    sek1Config,
  ) && goalMatchesGlobalStageScope(
    stageGoal('GLOBAL', ['phase:SekI', 'phase:SekII']),
    sek2Config,
  ),
  'conflicting stage tags remain fail-open instead of being assigned arbitrarily',
)

console.log('personal curriculum stage scope tests passed')
