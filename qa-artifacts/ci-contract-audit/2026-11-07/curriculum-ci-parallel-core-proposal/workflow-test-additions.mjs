// Proposal: append to scripts/plugin_ci_workflows.test.mjs, reusing its
// assert/test/spawnSync/ci imports. Do not replace the existing Source-A tests.
function curriculumDagJob(workflow, id) {
  const block = workflow.split(`\n  ${id}:\n`)[1]?.split(/\n  [\w-]+:/u)[0]
  assert.ok(block, `Missing curriculum DAG job ${id}`)
  return block
}
function curriculumDagStep(job, name) {
  const marker = `      - name: ${name}\n`
  assert.equal(job.split(marker).length, 2, `Expected one step ${name}`)
  return marker + job.split(marker)[1].split(/\n      - (?:name:|\*)/u)[0] + '\n'
}
function assertCurriculumFinalGate(workflow) {
  const core = curriculumDagJob(workflow, 'graph-validation')
  const final = curriculumDagJob(workflow, 'curriculum-ci')
  const book = curriculumDagJob(workflow, 'goal-book-publication')
  assert.doesNotMatch(book, /continue-on-error:|^        if:/mu)
  const bookBuild = curriculumDagStep(book, 'Build and validate all registered goal-book publications from source')
  const bookCheck = curriculumDagStep(book, 'Verify generated publication bindings')
  const bookUpload = curriculumDagStep(book, 'Share verified goal-book publications with the application checks')
  assert.match(bookBuild, /run: npm run build:goal-books -- --force/u)
  assert.match(bookCheck, /run: npm run check:goal-book-publication/u)
  assert.match(bookUpload, /uses: actions\/upload-artifact@v6/u)
  assert.match(bookUpload, /name: goal-book-publication-\$\{\{ github.sha \}\}/u)
  assert.match(bookUpload, /path: app\/public\/lernzielbuch\//u)
  assert.match(bookUpload, /include-hidden-files: true/u)
  assert.match(bookUpload, /if-no-files-found: error/u)
  assert.ok(book.indexOf(bookBuild.trimEnd()) < book.indexOf(bookCheck.trimEnd()))
  assert.ok(book.indexOf(bookCheck.trimEnd()) < book.indexOf(bookUpload.trimEnd()))
  assert.equal((workflow.match(/^    name: Curriculum CI$/gmu) ?? []).length, 1)
  assert.match(core, /^    name: Curriculum source contracts$/mu)
  assert.doesNotMatch(core.split('    steps:')[0], /^\s+(?:needs|if|continue-on-error):/mu)
  assert.match(final, /^    name: Curriculum CI$/mu)
  assert.match(final, /^    needs: \[graph-validation, goal-book-publication\]$/mu)
  assert.match(final, /^    if: \$\{\{ always\(\) \}\}$/mu)
  assert.doesNotMatch(core + final, /continue-on-error:/u)
  const guard = curriculumDagStep(final, 'Require successful curriculum core and verified book build')
  assert.ok(final.split('    steps:\n')[1].startsWith(guard.trimEnd()))
  assert.match(guard, /^        if: \$\{\{ always\(\) \}\}$/mu)
  assert.match(guard, /^        working-directory: \$\{\{ runner.temp \}\}$/mu)
  assert.match(guard, /^        shell: bash$/mu)
  assert.match(guard, /^          CURRICULUM_CORE_RESULT: \$\{\{ needs.graph-validation.result \}\}$/mu)
  assert.match(guard, /^          CURRICULUM_BOOK_RESULT: \$\{\{ needs.goal-book-publication.result \}\}$/mu)
  assert.doesNotMatch(core, /^        if:/mu)
  assert.doesNotMatch(final.replace(guard.trimEnd(), ''), /^        if:/mu)
  const restore = curriculumDagStep(final, 'Restore same-run verified goal-book publications')
  assert.match(restore, /uses: actions\/download-artifact@v7/u)
  assert.match(restore, /name: goal-book-publication-\$\{\{ github.sha \}\}/u)
  assert.match(restore, /path: app\/public\/lernzielbuch\//u)
  assert.doesNotMatch(restore, /run-id:|repository:|github-token:|pattern:|merge-multiple:/u)
  assert.doesNotMatch(core, /actions\/download-artifact|path: app\/public\/lernzielbuch\//u)
  const prepare = curriculumDagStep(final, 'Prepare generated curriculum runtime assets')
  const application = curriculumDagStep(final, 'Build integrated application artifact')
  const consumer = curriculumDagStep(final, 'Build package-only consumer frontend')
  const builtRationale = curriculumDagStep(final, 'Check Goal Source Rationale Build Artifact')
  const contracts = curriculumDagStep(final, 'Validate Curriculum Package Contracts')
  assert.match(prepare, /run: npm run prepare:runtime-assets/u)
  assert.match(application, /run: npm run build:application/u)
  assert.match(consumer, /run: npm run build:package-consumer -- --out-dir \.\.\/tmp\/package-consumer-ci\/frontend/u)
  assert.match(builtRationale, /run: npm run check:goal-source-rationales:build-artifact/u)
  assert.match(contracts, /SKILLPILOT_SOURCE_PDF_MODE: committed-bindings/u)
  assert.match(contracts, /SKILLPILOT_FULL_PACKAGE_CONFORMANCE=false/u)
  assert.match(contracts, /bash scripts\/run_curriculum_release_model_conformance.sh/u)
  let previous = -1
  for (const step of [prepare, restore, application, consumer, builtRationale, contracts]) {
    const position = final.indexOf(step.trimEnd())
    assert.ok(position > previous)
    previous = position
  }
  assert.match(core, /npm run quality:curriculum-status\n\s+npm run check:curriculum-maturity-floors/u)
  assert.match(core, /git diff --exit-code -- \.\.\/docs\/qa-ci\/status/u)
  assert.match(core, /python scripts\/validate_schemas.py/u)
  assert.match(core, /python scripts\/validate_goal_ids_uuid.py/u)
  return guard.split('        run: |\n')[1].split('\n').filter(Boolean)
    .map(line => { assert.ok(line.startsWith('          ')); return line.slice(10) }).join('\n') + '\n'
}

test('Curriculum final required context joins the early core and the checked same-run publication', () => {
  assertCurriculumFinalGate(ci)
})

test('Curriculum final guard rejects each failed, cancelled, skipped, empty, missing or unknown upstream status', () => {
  const body = assertCurriculumFinalGate(ci)
  for (const core of ['success', 'failure', 'cancelled', 'skipped', '', undefined, 'neutral']) {
    for (const book of ['success', 'failure', 'cancelled', 'skipped', '', undefined, 'neutral']) {
      const env = { PATH: process.env.PATH }
      if (core !== undefined) env.CURRICULUM_CORE_RESULT = core
      if (book !== undefined) env.CURRICULUM_BOOK_RESULT = book
      const result = spawnSync('bash', ['--noprofile', '--norc', '-c', body], {
        env, encoding: 'utf8', timeout: 2_000,
      })
      assert.equal(result.error, undefined)
      assert.equal(result.status === 0, core === 'success' && book === 'success',
        `core=${String(core)}, book=${String(book)}: ${result.stdout}\n${result.stderr}`)
    }
  }
})

test('Curriculum final gate wiring rejects skip paths, lost dependencies and detached integration', () => {
  const final = curriculumDagJob(ci, 'curriculum-ci')
  const guard = curriculumDagStep(final, 'Require successful curriculum core and verified book build')
  const app = curriculumDagStep(final, 'Build integrated application artifact')
  const restore = curriculumDagStep(final, 'Restore same-run verified goal-book publications')
  const mutateFinal = (from, to) => ci.replace(final, final.replace(from, to))
  const book = curriculumDagJob(ci, 'goal-book-publication')
  const bookCheck = curriculumDagStep(book, 'Verify generated publication bindings')
  const bookUpload = curriculumDagStep(book, 'Share verified goal-book publications with the application checks')
  const mutateBook = (from, to) => ci.replace(book, book.replace(from, to))
  const mutations = [
    ['missing publication verification', mutateBook(bookCheck.trimEnd(), '')],
    ['soft publication verification', mutateBook(bookCheck, bookCheck.replace('        run:', '        continue-on-error: true\n        run:'))],
    ['early publication upload', ci.replace(book, book.replace(bookUpload.trimEnd(), '').replace(bookCheck.trimEnd(), bookUpload + bookCheck))],
    ['hidden build cache omitted', mutateBook('include-hidden-files: true', 'include-hidden-files: false')],
    ['missing final always', ci.replace(final, final.replace('    if: ${{ always() }}\n', ''))],
    ['skip on failure', ci.replace(final, final.replace('    if: ${{ always() }}', '    if: ${{ success() }}'))],
    ['skip on cancellation', ci.replace(final, final.replace('    if: ${{ always() }}', '    if: ${{ !cancelled() }}'))],
    ['core detached', ci.replace('needs: [graph-validation, goal-book-publication]', 'needs: [goal-book-publication]')],
    ['book detached', ci.replace('needs: [graph-validation, goal-book-publication]', 'needs: [graph-validation]')],
    ['missing guard', mutateFinal(guard.trimEnd(), '')],
    ['late guard', ci.replace(final, final.replace(guard.trimEnd(), '').replace(app.trimEnd(), app.trimEnd() + '\n' + guard))],
    ['wrong required context', ci.replace('    name: Curriculum CI\n', '    name: Curriculum integration\n')],
    ['missing integration', mutateFinal(app.trimEnd(), '')],
    ['conditional integration', mutateFinal(app, app.replace('        run:', '        if: false\n        run:'))],
    ['soft integration', mutateFinal(app, app.replace('        run:', '        continue-on-error: true\n        run:'))],
    ['missing artifact', mutateFinal(restore.trimEnd(), '')],
    ['cross-run artifact', mutateFinal(restore, restore.replace('        with:', '        with:\n          run-id: 123'))],
    ['wrong artifact name', mutateFinal(restore, restore.replace('goal-book-publication-', 'goal-book-catalog-'))],
    ['wrong core result binding', ci.replace('needs.graph-validation.result', 'needs.goal-book-publication.result')],
  ]
  for (const [name, mutant] of mutations) {
    assert.notEqual(mutant, ci, name)
    assert.throws(() => assertCurriculumFinalGate(mutant), undefined, name)
  }
})
