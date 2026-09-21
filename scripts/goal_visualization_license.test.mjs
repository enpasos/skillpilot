import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import {
  DEFAULT_LICENSE,
  DEFAULT_REVIEW_STATUS,
  ROOT_DIR,
  createGoalVisualizationLink,
  getStringArg,
  parseCliArgs,
} from './goal_visualization_common.mjs'

const goal = { id: 'synthetic-license-test-goal', title: 'Synthetic illustration' }
const options = {
  publicUrl: '/assets/synthetic.png',
  provider: 'Synthetic generator provenance',
  description: 'Synthetic content',
  altText: 'Synthetic accessible description',
  lang: 'de',
  reviewStatus: DEFAULT_REVIEW_STATUS,
}

test('own new educational image workflow uses the explicit CC-BY-4.0 content grant', () => {
  assert.equal(DEFAULT_LICENSE, 'CC-BY-4.0')
  const license = getStringArg(parseCliArgs([]), 'license', DEFAULT_LICENSE)
  const link = createGoalVisualizationLink(goal, { ...options, license })
  assert.equal(link.license, 'CC-BY-4.0')
  assert.equal(link.provider, options.provider)
  assert.equal(link.reviewStatus, 'pilot')
  assert.deepEqual(Object.keys(link).sort(), [
    'altText', 'description', 'lang', 'license', 'provider', 'resourceType',
    'reviewStatus', 'role', 'skillpilotId', 'title', 'type', 'url',
  ].sort(), 'A license must not add ownership, redistribution or quality approvals')
})

test('explicit third-party license overrides are preserved independently of provider labels', () => {
  for (const provider of ['External artist', 'AI-generated, SkillPilot-curated']) {
    const license = getStringArg(parseCliArgs(['--license', 'CC-BY-SA-4.0']), 'license', DEFAULT_LICENSE)
    const link = createGoalVisualizationLink(goal, { ...options, provider, license })
    assert.equal(link.license, 'CC-BY-SA-4.0')
    assert.equal(link.provider, provider)
    assert.equal(link.reviewStatus, 'pilot')
  }
})

test('import help makes the own-work boundary and explicit third-party override visible', () => {
  const output = execFileSync(process.execPath, ['scripts/import_goal_visualization.mjs', '--help'], {
    cwd: ROOT_DIR, encoding: 'utf8',
  })
  assert.match(output, /Own-work license\. Default: CC-BY-4\.0 \(LICENSING\.md\)/u)
  assert.match(output, /third-party material, explicitly pass its applicable license\/terms/u)
  assert.match(output, /does not clear third-party rights or approve an image/u)
})
