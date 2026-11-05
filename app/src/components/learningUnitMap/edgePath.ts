import type { LayoutPoint } from './layoutTypes'

/** Softens only the corners of ELK's route, never recomputes the route itself. */
export function elkRoutePath(points: readonly LayoutPoint[], radius = 4): string {
  if (points.length < 2) return ''
  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 1; index < points.length - 1; index++) {
    const previous = points[index - 1]
    const point = points[index]
    const next = points[index + 1]
    const incoming = Math.hypot(point.x - previous.x, point.y - previous.y)
    const outgoing = Math.hypot(next.x - point.x, next.y - point.y)
    const bend = Math.min(radius, incoming / 2, outgoing / 2)
    if (bend === 0) { path += ` L ${point.x} ${point.y}`; continue }
    const before = { x: point.x + (previous.x - point.x) * bend / incoming,
      y: point.y + (previous.y - point.y) * bend / incoming }
    const after = { x: point.x + (next.x - point.x) * bend / outgoing,
      y: point.y + (next.y - point.y) * bend / outgoing }
    path += ` L ${before.x} ${before.y} Q ${point.x} ${point.y} ${after.x} ${after.y}`
  }
  const last = points[points.length - 1]
  return `${path} L ${last.x} ${last.y}`
}
