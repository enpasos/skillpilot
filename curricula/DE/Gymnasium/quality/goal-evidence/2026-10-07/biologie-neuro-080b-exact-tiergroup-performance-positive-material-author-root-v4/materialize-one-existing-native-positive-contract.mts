// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync, renameSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'

const own = dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(readFileSync(resolve(own, 'positive1.native-author.config.json'), 'utf8'))
const candidateSet = JSON.parse(readFileSync(resolve(own, 'positive1.complete-author-candidate.json'), 'utf8'))
const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
const destination = resolve('/home/enpasos/projects/skillpilot', config.reviewPath)
writeFileSync(destination + '.tmp', records.map(record => JSON.stringify(record)).join('\n') + '\n')
renameSync(destination + '.tmp', destination)
console.log('Materialized one author candidate with the existing native positive contract; no scientific approval.')
