const ownTaskActivation = readJson<{ tasks: Array<{
  id: string; releasedPath: string; releasedSha256: string; contentReview: string
  sourceArtifactPath: string; sourceArtifactSha256: string; offeredJurisdictions: string[]
}> }>('curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/nine-offers-activation.actual.json')
const coveredStrandsFollowup = readJson<{
  schema: string; status: string; independentPriorApproval: { reviewer: string }
  changes: Array<{ goalId: string; beforeGoalPath: string; beforeGoalSha256: string
    currentGoalPath: string; currentGoalSha256: string
    allowedDelta: { path: string; before: string[]; after: string[] } }>
}>('curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/metadata-followup/covered-strands-20261117-v1.actual.json')
assert.equal(coveredStrandsFollowup.schema, 'metadata-only-assessment-covered-strands-followup-v1')
assert.equal(coveredStrandsFollowup.status, 'APPLIED_APPROVED_METADATA_ONLY')
assert.equal(coveredStrandsFollowup.independentPriorApproval.reviewer, '/root')
assert.deepEqual(coveredStrandsFollowup.changes.map(change => change.goalId).sort(compareCodePoints), [
  'a8dc0290-9f80-5763-8943-e16b8d2aa860', '7cfaf48e-e420-5c09-8ec2-932f0dba4d08',
  'f41e4e30-794e-5ce4-ba5e-cc72712cd691',
].sort(compareCodePoints))
for (const change of coveredStrandsFollowup.changes) {
  assert.deepEqual(change.allowedDelta, { path: 'examData.coveredStrands', before: [], after: ['LI_BEWEGUNG'] })
  assert.equal(sha256(readFileSync(resolve(repoRoot, change.beforeGoalPath), 'utf8')), change.beforeGoalSha256)
  assert.equal(sha256(readFileSync(resolve(repoRoot, change.currentGoalPath), 'utf8')), change.currentGoalSha256)
  const expected = readJson<{ examData: { coveredStrands: string[] } }>(change.beforeGoalPath)
  assert.deepEqual(expected.examData.coveredStrands, [])
  expected.examData.coveredStrands = ['LI_BEWEGUNG']
  assert.deepEqual(readJson(change.currentGoalPath), expected, `${change.goalId}: no other field may change in the followup`)
  assert.deepEqual(rawGoalById.get(change.goalId), expected, `${change.goalId}: exact separately approved current payload`)
}
assert.deepEqual(ownTaskActivation.tasks.map(task => task.id).sort(compareCodePoints), [
  '3b7b2b62-e39c-5936-b0d8-5406206e57b6', '57a03b38-5ec5-5e4f-b71a-4024bab1584c',
  '797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00', '7cfaf48e-e420-5c09-8ec2-932f0dba4d08',
  '884bd99b-2373-5174-af7c-c6813b91bd93', 'bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04',
  'e6a89922-75ce-53dd-9e7b-3a683398431c', 'f41e4e30-794e-5ce4-ba5e-cc72712cd691',
  'f602680f-ea75-5bed-ae87-72f6be34a99b',
].sort(compareCodePoints), 'exact nine independently reviewed own task offerings')
for (const row of ownTaskActivation.tasks) {
  const task = rawGoalById.get(row.id)
  assert(task, `${row.id}: released own assessment exists`)
  const acceptedRelease = readJson<{ examData: { coveredStrands: string[] } }>(row.releasedPath)
  const followup = coveredStrandsFollowup.changes.find(change => change.goalId === row.id)
  if (followup) {
    assert.deepEqual(acceptedRelease, readJson(followup.beforeGoalPath), `${row.id}: followup starts at the exact original release`)
    acceptedRelease.examData.coveredStrands = ['LI_BEWEGUNG']
  }
  assert.deepEqual(task, acceptedRelease, `${row.id}: exact accepted release plus only its separately approved strand correction`)
  assert.equal(sha256(readFileSync(resolve(repoRoot, row.releasedPath), 'utf8')), row.releasedSha256)
  assert.equal(sha256(readFileSync(resolve(repoRoot, row.sourceArtifactPath), 'utf8')), row.sourceArtifactSha256)
  assert.equal(String(readJson<{ status: string }>(row.contentReview).status).toUpperCase(), 'PASS')
  const exam = task.examData as { reviewStatus: string; coveredGoalIds: string[] }
  assert.equal(exam.reviewStatus, 'released')
  assert.deepEqual(task.requires, exam.coveredGoalIds)
  assert.equal(exam.coveredGoalIds.length, 1)
  const extended = task.extendedData as { applicabilityFromRequires?: boolean; applicabilityMappingInheritance: string; applicabilityOverrides: { jurisdiction: string[] } }
  assert.equal(extended.applicabilityFromRequires, undefined)
  assert.equal(extended.applicabilityMappingInheritance, 'boundary')
  assert.deepEqual(extended.applicabilityOverrides.jurisdiction, row.offeredJurisdictions)
  assert.deepEqual(task.applicability, { jurisdiction: row.offeredJurisdictions })
}
