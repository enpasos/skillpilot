import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { assertCompositionSupplementAccountingSupported } from './compositionSupplementSourceCoverage'
const dir = mkdtempSync(resolve(tmpdir(), 'skillpilot-TEST_ONLY-supplement-accounting-'))
try {
  assertCompositionSupplementAccountingSupported(dir)
  const authored = resolve(dir, 'curricula/DE/Gymnasium/composition-supplements/mathematik')
  mkdirSync(authored, { recursive: true }); writeFileSync(resolve(authored, 'TEST_ONLY.supplement.json'), '{}')
  assert.throws(() => assertCompositionSupplementAccountingSupported(dir), /EXACT_CONFIGURATION_ACCOUNTING_UNSUPPORTED/)
} finally { rmSync(dir, { recursive: true, force: true }) }
console.log('Composition supplement source accounting and unsupported aggregate guard: passed')
