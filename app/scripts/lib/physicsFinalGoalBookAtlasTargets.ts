// Exact approved final split delta, not inferred curriculum or state coverage.
const FINAL_CHILD_IDS = [
  '2084b7d4-300d-5fa0-8b8d-c480c40f853e',
  '3857891b-d328-585b-9936-85c7aff122ee',
  '3b586f2a-60e2-5019-aa08-6a47616a1f1f',
  '49bb609a-bfb7-5391-9120-f5fc737efb9a',
  '6dca3b0a-c872-543b-808f-97e855f5fafd',
  '6a73cacc-e86d-5248-a180-fd3da8454b0f',
  '3a4b2f86-5c59-5429-8fb4-75d9b2589cb5',
  '946ecf7b-0fcf-5776-9fb6-d397423c2f12',
] as const

export function assertFinalPhysicsAtlasPublishedTargets(ids: ReadonlySet<string>): void {
  for (const id of FINAL_CHILD_IDS) {
    if (!ids.has(id)) throw new Error(`Physics atlas stale published model omits approved final child ${id}; rebuild the model before preparing navigation`)
  }
}

type Node = { kind: string; goalId?: string; projectionRole?: string; children?: Node[] }
export function assertFinalPhysicsAtlasDraftTargets(nodes: readonly Node[]): void {
  const counts = new Map<string, number>()
  const walk = (children: readonly Node[]) => children.forEach((node) => {
    if (node.kind === 'goalEntry' && node.goalId && node.projectionRole !== 'prerequisiteOnly') {
      counts.set(node.goalId, (counts.get(node.goalId) ?? 0) + 1)
    }
    walk(node.children ?? [])
  })
  walk(nodes)
  for (const id of FINAL_CHILD_IDS) {
    if (counts.get(id) !== 1) throw new Error(`Physics atlas must retain exactly one explicit target for approved final child ${id}`)
  }
}
