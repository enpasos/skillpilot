// Additional real Q2 current-input checks at the ordinary native V boundary.
const econPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const econSource = JSON.parse(readFileSync(resolve(root, econPath), 'utf8')) as SkillLandscape
const econQa = JSON.parse(readFileSync(resolve(root, 'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json'), 'utf8')) as { records: VisualizationGateRecord[] }
const q2Id = 'da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0', deOnlyId = '676684da-5ba2-5c2a-ba7e-a8413915c29c'
const q2Goal = econSource.goals.find(goal => goal.id === q2Id)! as LocalGoal
const q2Row = econQa.records.find(row => row.goalId === q2Id)!
const econNative = (definition: LocalGoal, record = econQa.records.find(row => row.goalId === definition.id)!) =>
  evaluateCurrentVisualizationGate({ repositoryRoot: root, landscapeId: econSource.landscapeId, landscapePath: econPath,
    subject: 'wirtschaftswissenschaften', goalById: new Map([[definition.id, definition]]), currentGoalIds: new Set([definition.id]), records: [record] })
assert.deepEqual(econNative(q2Goal).readyGoalIds, [q2Id])
for (const [name, definition, record] of [
  ['Q2 actual DE', { ...q2Goal, description: q2Goal.description + ' Neue eigene Leistung.' }, { ...q2Row, description: q2Goal.description + ' Neue eigene Leistung.' }],
  ['Q2 supplied EN', { ...q2Goal, descriptionEn: q2Goal.descriptionEn + ' Different competence.' }, q2Row],
  ['Q2 supplied demand', { ...q2Goal, dimensionTags: { ...q2Goal.dimensionTags, demandLevel: 'AB1' } }, q2Row],
  ['Q2 duplicate primary role', { ...q2Goal, resourceLinks: [...(q2Goal.resourceLinks ?? []), q2Goal.resourceLinks!.find(link => link.role === 'primary')!] }, q2Row],
] as const) {
  const checked = econNative(definition, record)
  assert.deepEqual(checked.readyGoalIds, [], name)
  assert.ok(checked.issues.length > 0, name)
}
assert.deepEqual(econNative(q2Goal).readyGoalIds, [q2Id], 'Q2 original context survives independent current reads')
const deOnlyGoal = econSource.goals.find(goal => goal.id === deOnlyId)! as LocalGoal
const deOnlyDrift = econNative({ ...deOnlyGoal, titleEn: 'Outside attested DE scope', descriptionEn: 'No English approval claimed.',
  dimensionTags: { ...deOnlyGoal.dimensionTags, demandLevel: 'AB1' } })
assert.deepEqual(deOnlyDrift.readyGoalIds, [deOnlyId], 'DE-only V pass does not certify EN/demand or curriculum scope')
// Test-only mutable RAM aliases never select production authority or alter host files.
for (const option of ['--cache-index-path=', '--cache-receipt-path=']) {
  const path = process.argv.find(value => value.startsWith(option))?.slice(option.length)
  if (!path) continue
  assert.ok(path.startsWith('/dev/shm/'))
  const raw = readFileSync(path)
  try {
    writeFileSync(path, Buffer.concat([raw, Buffer.from('\n')]))
    denies('Cached authority still rejects changed actual ' + option, native(), /External visualization|Context receipt byte hash differs/u)
  } finally { writeFileSync(path, raw) }
  assert.deepEqual(native().readyGoalIds, [goal.id], 'Restored exact private bytes are read again')
}
console.log('Exact Q2 DE/EN/demand and primary-role negatives passed; corrected676684da retains only its original DE V scope.')
