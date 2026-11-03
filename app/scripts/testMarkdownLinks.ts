import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { checkMarkdownLinks } from './checkMarkdownLinks'
import { markdownSourceArchiveInventoryPath } from './markdownSourceArchives'

const fixture = mkdtempSync(join(tmpdir(), 'skillpilot-markdown-source-archives-'))
const archivePath = 'docs/qa-ci/evidence/frozen/review-input.md'
const original = 'Historical source context: [original evidence](../not-copied.json)\n'
const mkdocs = `site_name: Fixture\nexclude_docs: |\n  /${archivePath.slice('docs/'.length)}\n`
const write = (path: string, text: string) => {
  const file = join(fixture, path)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
}

try {
  write(archivePath, original)
  write(markdownSourceArchiveInventoryPath, JSON.stringify({
    schemaVersion: 1,
    archivedMarkdownSources: [{
      path: archivePath,
      sha256: createHash('sha256').update(original).digest('hex'),
      reason: 'Frozen source fixture',
    }],
  }))
  write('mkdocs.yml', mkdocs)
  write('docs/index.md', '[archive](https://github.com/enpasos/skillpilot/blob/main/' + archivePath + ')\n')
  const passed = checkMarkdownLinks(fixture)
  assert.deepEqual(passed.failures, [])
  assert.equal(passed.checkedFiles, 1)
  assert.equal(passed.archivedFiles, 1)

  write(archivePath, original + 'changed bytes\n')
  assert.throws(() => checkMarkdownLinks(fixture, ['docs/index.md']), /archive SHA-256 mismatch/)
  rmSync(join(fixture, archivePath))
  assert.throws(() => checkMarkdownLinks(fixture), /ENOENT/)
  write(archivePath, original)

  write('mkdocs.yml', 'site_name: Fixture\nexclude_docs: |\n  /qa-ci/evidence/\n')
  assert.throws(() => checkMarkdownLinks(fixture), /must match the exact.*inventory/)
  write('mkdocs.yml', mkdocs)

  write('docs/index.md', '[archive](qa-ci/evidence/frozen/review-input.md)\n')
  assert.match(checkMarkdownLinks(fixture).failures[0], /archived source excluded from the published site/)
  write('docs/index.md', 'Regular page.\n')
  write('docs/qa-ci/evidence/current/report.md', '[broken](missing.md)\n')
  assert.deepEqual(checkMarkdownLinks(fixture).failures, [
    'docs/qa-ci/evidence/current/report.md: missing missing.md',
  ], 'Other QA evidence must still receive the normal relative-link check')
  console.log('Markdown link regression passed: exact archives, changed/missing bytes, MkDocs drift and ordinary links.')
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
