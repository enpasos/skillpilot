import { existsSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

/** The current jurisdiction-union CQR-003 model cannot represent exact selected
 * supplement configurations. Fail visibly until that reporting contract is
 * independently extended; never produce a green report by ignoring authored targets. */
export const assertCompositionSupplementAccountingSupported = (repoRoot: string): void => {
  const directory = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-supplements/mathematik')
  const collect = (path: string): string[] => readdirSync(path, { withFileTypes: true }).flatMap((entry) => (
    entry.isDirectory() ? collect(resolve(path, entry.name))
      : entry.name.endsWith('.supplement.json') ? [resolve(path, entry.name)] : []
  ))
  if (existsSync(directory) && collect(directory).length > 0) {
    throw new Error('COMPOSITION_SUPPLEMENT_EXACT_CONFIGURATION_ACCOUNTING_UNSUPPORTED: '
      + 'CQR-003/source coverage cannot yet certify authored Mathematics supplements. '
      + 'Keep official Mathematics source coverage, independent target authorization, all target goals '
      + 'and the full canonical ordinary denominator visible; no aggregate report may omit them.')
  }
}
