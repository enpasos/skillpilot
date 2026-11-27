// The role is supported by the format. Curriculum activation waits for the VR4 quality rules.
type ViewNode = {
  kind: string
  projectionRole?: string
  goalId?: string
  sourceGoalId?: string
  children?: ViewNode[]
}

export function assertNoCurriculumOffers(location: string, roots: ViewNode[]) {
  const offers: string[] = []
  const visit = (node: ViewNode) => {
    if (node.projectionRole === 'voluntary') offers.push(node.goalId ?? node.sourceGoalId ?? node.kind)
    node.children?.forEach(visit)
  }
  roots.forEach(visit)
  if (offers.length > 0) {
    throw new Error(`${location}: expected 0 voluntary entries, found ${offers.length} (${offers.join(', ')}).`)
  }
}

export function checkCurriculumViewSource(location: string, bytes: Buffer) {
  // Archived views account for most of the inputs. JSON can also spell a role with Unicode escapes.
  if (!bytes.includes('voluntary') && !bytes.includes('\\u')) return
  const view = JSON.parse(bytes.toString('utf8')) as { rootNodes: ViewNode[] }
  assertNoCurriculumOffers(location, view.rootNodes)
}
