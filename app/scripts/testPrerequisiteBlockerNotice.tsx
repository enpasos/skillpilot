import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PrerequisiteBlockerNotice } from '../src/components/PrerequisiteBlockerNotice'
import type { PrerequisiteBlocker } from '../src/learnerTypes'

const external: PrerequisiteBlocker = {
  goalId: 'physics-target',
  goalTitle: 'Diagramme verstehen',
  goalTitleEn: 'Understand diagrams',
  prerequisiteId: 'math-support',
  prerequisiteTitle: 'Werte ablesen',
  prerequisiteTitleEn: 'Read values',
  reason: 'EXTERNAL_PREREQUISITE_UNMASTERED',
  remediation: 'OPEN_PERSONAL_CURRICULUM',
}

let setupOpened = 0
let writes = 0
const originalFetch = globalThis.fetch
globalThis.fetch = async (_input, init) => {
  if (init?.method && init.method !== 'GET') writes++
  throw new Error('The prerequisite notice must not make network requests')
}
try {
  for (const language of ['de', 'en'] as const) {
    const markup = renderToStaticMarkup(
      <PrerequisiteBlockerNotice blockers={[external]} language={language} onOpenPersonalCurriculum={() => { setupOpened++ }} />,
    )
    assert.ok(markup.includes(language === 'de' ? 'Diagramme verstehen' : 'Understand diagrams'))
    assert.ok(markup.includes(language === 'de' ? 'Werte ablesen' : 'Read values'))
    assert.ok(markup.includes(language === 'de' ? 'deine Bestätigung' : 'when you confirm'))
    assert.ok(markup.includes(language === 'de' ? 'Persönlichen Lehrplan prüfen' : 'Review personal curriculum'))
    assert.ok(!markup.includes('math-support'), 'support competence is prose, never a goal selection control')
    assert.ok(!markup.includes('checkbox') && !markup.includes('data-goal-id'))
    assert.equal(setupOpened, 0, 'rendering never opens setup or modifies scope')
  }

  const rendered = PrerequisiteBlockerNotice({ blockers: [external], language: 'de', onOpenPersonalCurriculum: () => { setupOpened++ } })
  const findButton = (node: React.ReactNode): React.ReactElement<{ onClick: () => void }> | undefined => {
    if (!React.isValidElement<{ children?: React.ReactNode; onClick?: () => void }>(node)) return undefined
    if (node.type === 'button') return node as React.ReactElement<{ onClick: () => void }>
    for (const child of React.Children.toArray(node.props.children)) {
      const button = findButton(child)
      if (button) return button
    }
    return undefined
  }
  const button = findButton(rendered)
  assert.ok(button, 'the learner receives an explicit first-party setup action')
  button.props.onClick()
  assert.equal(setupOpened, 1, 'click delegates only to opening the existing setup')
  assert.equal(writes, 0, 'the notice neither selects nor saves curriculum, focus or mastery')

  let viewedPrerequisite: string | null = null
  const outsideFocus: PrerequisiteBlocker = { ...external, reason: 'PREREQUISITE_OUTSIDE_FOCUS', remediation: 'REVIEW_FOCUS' }
  const outsideFocusMarkup = renderToStaticMarkup(
    <PrerequisiteBlockerNotice blockers={[outsideFocus]} language="en" onOpenPersonalCurriculum={() => { setupOpened++ }} onReviewPrerequisite={(id) => { viewedPrerequisite = id }} />,
  )
  assert.ok(outsideFocusMarkup.includes('outside your current focus'))
  assert.ok(!outsideFocusMarkup.includes('Review personal curriculum'), 'a selected target requires focus review, not a Level-2 change')
  const focusButton = findButton(PrerequisiteBlockerNotice({
    blockers: [outsideFocus], language: 'en', onOpenPersonalCurriculum: () => { setupOpened++ },
    onReviewPrerequisite: (id) => { viewedPrerequisite = id },
  }))
  assert.equal(viewedPrerequisite, null, 'rendering never switches the selected goal')
  assert.ok(focusButton)
  focusButton.props.onClick()
  assert.equal(viewedPrerequisite, 'math-support', 'the explicit first action only requests displaying the permitted prerequisite')
  assert.equal(setupOpened, 1)
  assert.equal(writes, 0, 'viewing a prerequisite never automatically broadens focus or commits mastery')

  for (const reason of ['UNKNOWN_PREREQUISITE', 'PREREQUISITE_NOT_PROJECTED'] as const) {
    const markup = renderToStaticMarkup(
      <PrerequisiteBlockerNotice blockers={[{ ...external, reason, remediation: undefined }]} language="en" onOpenPersonalCurriculum={() => { setupOpened++ }} />,
    )
    assert.ok(markup.includes('currently unavailable'))
    assert.ok(!markup.includes('<button'), 'unavailable authored prerequisites never imply the learner can repair the graph')
  }
  assert.equal(PrerequisiteBlockerNotice({ blockers: [], language: 'de', onOpenPersonalCurriculum: () => { setupOpened++ } }), null)
} finally {
  globalThis.fetch = originalFetch
}
console.log('Prerequisite blocker notice: localized facts, explicit setup action and no learner-state writes verified.')
