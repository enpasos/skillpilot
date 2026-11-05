import type { ELK } from 'elkjs/lib/elk-api'
import elkWorkerUrl from 'elkjs/lib/elk-worker.min.js?url'
import type { LearningMapFixture } from './types'
import type { LayoutDirection, LearningLayoutOptions, LearningScopeLayout } from './layoutTypes'
import { NODE_HEIGHT, NODE_WIDTH } from './layoutTypes'
import { computeLearningScopeLayout } from './learningScopeLayoutCore'

export { NODE_HEIGHT, NODE_WIDTH } from './layoutTypes'
export type { LayoutDirection, LayoutPoint, LayoutPort, LearningLayoutOptions, LearningScopeLayout } from './layoutTypes'

let worker: Promise<ELK> | undefined
let cache = new WeakMap<LearningMapFixture, Map<string, Promise<LearningScopeLayout>>>()
const MAX_LAYOUTS_PER_FIXTURE = 128

function getWorker(): Promise<ELK> {
  worker ??= import('elkjs/lib/elk-api.js').then(({ default: Elk }) => new Elk({ workerUrl: elkWorkerUrl }))
    .catch(error => { worker = undefined; throw error })
  return worker
}

/** A retry after a dead/timed-out worker must not reuse its pending promise. */
export function restartLearningScopeLayoutWorker(): void {
  const previous = worker
  worker = undefined
  cache = new WeakMap()
  void previous?.then(elk => elk.terminateWorker()).catch(() => undefined)
}

/** Coalesces async requests; selection/hover changes reuse the exact routed graph. */
export function layoutLearningScope(
  fixture: LearningMapFixture,
  scopeId: string,
  direction: LayoutDirection,
  options: LearningLayoutOptions = {},
): Promise<LearningScopeLayout> {
  let layouts = cache.get(fixture)
  if (!layouts) { layouts = new Map(); cache.set(fixture, layouts) }
  const key = JSON.stringify([scopeId, direction, options.nodeWidth ?? NODE_WIDTH, options.nodeHeight ?? NODE_HEIGHT])
  const cached = layouts.get(key)
  if (cached) return cached
  const pending = getWorker().then(elk => computeLearningScopeLayout(elk, fixture, scopeId, direction, options))
    .catch(error => { layouts.delete(key); throw error })
  if (layouts.size >= MAX_LAYOUTS_PER_FIXTURE) layouts.delete(layouts.keys().next().value!)
  layouts.set(key, pending)
  return pending
}
