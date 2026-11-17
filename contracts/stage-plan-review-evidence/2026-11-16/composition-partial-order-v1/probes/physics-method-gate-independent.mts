import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import type { CompositionView, CompositionViewNode, CompositionStructureNode } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring';
const referencePath = (nodes: CompositionViewNode[], goalId: string, ancestors: CompositionStructureNode[] = []): CompositionStructureNode[] | undefined => {
  for (const node of nodes) {
    if (node.kind === 'structure') {
      const found = referencePath(node.children, goalId, [...ancestors, node])
      if (found) return found
    } else if ('goalId' in node && node.goalId === goalId) return ancestors
  }
}
// Atomic prerequisites order goals inside one unit. Across different authored
// units the declared partial order must preserve the acquisition path. Array
// adjacency and a particular old preparation wrapper are not that contract.
const assertAcquiredBefore = (view: CompositionView, prerequisite: string, consumer: string, path: string) => {
  const before = referencePath(view.rootNodes, prerequisite)
  const after = referencePath(view.rootNodes, consumer)
  assert(before && after, `${path}: both acquisition and consumer references must exist`)
  let i = 0
  while (i < Math.min(before.length, after.length) && before[i] === after[i]) i++
  if (i === Math.min(before.length, after.length)) return
  assert(i > 0, `${path}: acquisition and consumer must share their subject tree`)
  const parent = before[i - 1]
  assert(parent.childOrder, `${path}: explicit partial order required at ${parent.id}`)
  const pending = [after[i].id], reached = new Set<string>()
  while (pending.length) {
    const next = pending.pop()!
    if (reached.has(next)) continue
    reached.add(next)
    pending.push(...parent.childOrder.after.filter(pair => pair.unit === next).map(pair => pair.after))
  }
  assert(reached.has(before[i].id), `${path}: missing declared acquisition order ${before[i].id} -> ${after[i].id}`)
}


const unit = (id:string, goalId:string):CompositionStructureNode => ({kind:'structure',id,label:id,children:[{kind:'goalEntry',goalId}]});
const root:CompositionStructureNode={kind:'structure',id:'root',label:'subject',children:[unit('early','method'),unit('middle','bridge'),unit('late','astronomy')],childOrder:{after:[{unit:'middle',after:'early'},{unit:'late',after:'middle'}]}};
const view={rootNodes:[root]} as CompositionView;
assertAcquiredBefore(view,'method','astronomy','positive-transitive');
root.children.reverse();assertAcquiredBefore(view,'method','astronomy','array-order-independent');
const old=root.childOrder!;root.childOrder={after:[{unit:'late',after:'middle'}]};
assert.throws(()=>assertAcquiredBefore(view,'method','astronomy','missing-edge'),/missing declared acquisition order/);
root.childOrder={after:[{unit:'early',after:'late'}]};assert.throws(()=>assertAcquiredBefore(view,'method','astronomy','reversed-edge'),/missing declared acquisition order/);
root.childOrder=old;
root.children.push({kind:'goalEntry',goalId:'ownAtom'});assertAcquiredBefore(view,'ownAtom','astronomy','own-atom-exception');
const file='scripts/check_physics_source_method_routes.test.ts';const report={status:'PASS-independent-read-only-gate-review',file,sha256:createHash('sha256').update(readFileSync(file)).digest('hex'),cases:['transitive-after accepted','reversed array position accepted','removed edge rejected','reversed after rejected','own atom exception retained'],retention:'Exact four method requires arrays, method/astronomy target floors, once-only explicit method refs and lower/upper placement remain asserted by the full source test. HE retains its narrower source-bound wrapper contract.',limit:'This independently exercises the extracted order assertion. Parent owns the complete live route regression.'};
writeFileSync('tmp/pipeline/laender-stufen/gesamt/review/physics-method-gate-independent.actual.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
