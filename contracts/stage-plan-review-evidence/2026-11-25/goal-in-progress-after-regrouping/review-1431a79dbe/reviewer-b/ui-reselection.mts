import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
const checkout = process.argv[2]
const { getNextSingleLearnerFocus } = await import(pathToFileURL(resolve(checkout, 'app/src/utils/learnerFocus.ts')).href)
const section = 'composition:de-he-gym-sekii-physics-gk:structure:physics-e1-motion'
const goal = '4a2bf015-052b-4af0-aed7-324259fa1a8a'
const result = [[section], [section, goal]].map(ids => {
    const current = new Set(ids)
    const next = getNextSingleLearnerFocus(current, section)
    const idempotent = next.size === current.size && Array.from(next).every(goalId => current.has(goalId))
    return { input: ids, click: section, next: Array.from(next), idempotent }
})
console.log(JSON.stringify(result, null, 2))
