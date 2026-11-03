import assert from 'node:assert/strict'

import { getTrainerClassFileCopy } from './trainerClassFileCopy'

const de = getTrainerClassFileCopy('de')
const en = getTrainerClassFileCopy('en')

for (const copy of [de, en]) {
  assert(copy.exportTooltip.length > 0)
  assert(copy.importedLegacy.length > 0)
  assert(copy.dialog.importDescription.includes('{{fileName}}'))
  assert(copy.dialog.passwordNotRecoverable.length > 0)
  assert(copy.dialog.decryptFailed.length > 0)
}

assert.match(de.dialog.exportDescription, /verschlüsselt/u)
assert.match(en.dialog.exportDescription, /encrypted/u)
assert.match(de.importedLegacy, /ungeschützte/u)
assert.match(en.importedLegacy, /unprotected/u)

console.log('trainer class file copy tests passed')
