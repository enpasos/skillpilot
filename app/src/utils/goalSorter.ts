import type { UiGoal } from '../goalTypes'

export function sortGoalsTopologically(goals: UiGoal[]): UiGoal[] {
    // 1. Initialize working set and result
    const remaining = new Set(goals)
    const result: UiGoal[] = []

    // Safety break counter
    let safety = goals.length + 1

    while (remaining.size > 0 && safety > 0) {
        safety--
        const available: UiGoal[] = []

        // 2. Find nodes with no remaining dependencies within the set
        for (const g of remaining) {
            // Check if any of g's requirements are still in the remaining set
            const hasUnmetDependency = g.requires.some(reqId => {
                // We only care if the requirement is one of the *current siblings* we are sorting.
                // If the requirement is outside this list (e.g. parent, or filtered out), we ignore it for sorting.
                // BUT: iterating the whole 'remaining' set for every check is O(N^2).
                // Since N is small (siblings list), this is acceptable.
                // Optimisation: We check if 'reqId' is in 'remaining'.
                // However, 'remaining' contains objects. We need to check IDs.
                // Let's create a Set of IDs for the current 'remaining' to make this fast? 
                // Or just iterate. Given N < 50 usually, iteration is fine.
                for (const other of remaining) {
                    if (other.id === reqId) return true
                }
                return false
            })

            if (!hasUnmetDependency) {
                available.push(g)
            }
        }

        // 3. If no nodes are available, we have a cycle. Break it by picking the alphabetically first ones.
        if (available.length === 0) {
            available.push(...Array.from(remaining))
            // Logic below will sort them and clear remaining, effectively handling the cycle/rest by name
        }

        // 4. Sort the available batch alphabetically
        available.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }))

        // 5. Add to result and remove from remaining
        for (const g of available) {
            result.push(g)
            remaining.delete(g)
        }

        // If we dumped everything due to cycle, remaining is empty, loop terminates.
    }

    return result
}
