import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  injectGoalBookPdfOutline,
  inspectGoalBookPdfOutline,
  renderGoalBookHtml,
  writeGoalBookPdf,
} from '../../../../../../../app/scripts/goalBookRenderer.ts'
import { parseAndValidateGoalBookModel } from '../../../../../../../app/scripts/goalBookModel.ts'
import { validateGoalBookReviewBundleManifestBindings } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { verifyGoalBookReviewBundleArtifactBytes } from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
import { validatePreparedGoalDescriptionRolloutBatch } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'

// This recipe recovers only six unchanged render artifacts from this delivery.
// It never rewrites a bundle manifest, review input, resolution or acceptance gate.
const here = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(here, '../../../../../../..')
const recipe = JSON.parse(readFileSync(join(here, 'review-render-recovery-v2.recipe.json'), 'utf8'))
const sha256 = (bytes: Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const fail = (message: string): never => { throw new Error(message) }
const inside = (root: string, path: string) => {
  const target = resolve(root, path)
  const rel = relative(root, target)
  if (!rel || rel === '..' || rel.startsWith(`..${sep}`)) fail(`Invalid recovery path: ${path}`)
  return target
}
let materialize = false
let checkNative = false
let targetRoot = repositoryRoot
let originalsDirectory: string | undefined
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index]
  if (arg === '--materialize') materialize = true
  else if (arg === '--check-native') checkNative = true
  else if (arg === '--target-root') targetRoot = resolve(process.argv[++index] ?? fail('Missing target root'))
  else if (arg === '--originals-directory') originalsDirectory = resolve(process.argv[++index] ?? fail('Missing originals directory'))
  else fail(`Unknown argument: ${arg}`)
}
if (checkNative && !materialize) fail('--check-native requires --materialize')
if (recipe.contract !== 'e2-exact-native-render-recovery-v2' || recipe.batches.length !== 3) fail('Unexpected recovery recipe')
const scratch = await mkdtemp(join(tmpdir(), 'e2-native-render-recovery-'))
const plans: Array<{ path: string; bytes: Buffer; role: string; batch: string }> = []
const bundles: Array<{ manifest: any; directory: string; configPath: string }> = []
try {
  for (const batch of recipe.batches) {
    const bundleDirectory = inside(repositoryRoot, batch.bundleDirectory)
    const manifestBytes = readFileSync(join(bundleDirectory, 'manifest.json'))
    if (sha256(manifestBytes) !== batch.bundleManifestRawSha256) fail(`${batch.id}: manifest bytes changed`)
    const manifest = JSON.parse(manifestBytes.toString('utf8'))
    const errors = validateGoalBookReviewBundleManifestBindings(manifest)
    if (errors.length) fail(errors.join(' | '))
    const artifact = (role: string) => manifest.artifacts.find((item: any) => item.role === role) ?? fail(`Missing ${role}`)
    const readBound = (role: string) => {
      const item = artifact(role)
      const bytes = readFileSync(inside(bundleDirectory, item.path))
      if (bytes.length !== item.bytes || sha256(bytes) !== item.digest) fail(`${batch.id}: changed ${role}`)
      return bytes
    }
    const model = parseAndValidateGoalBookModel(JSON.parse(readBound('book_model').toString('utf8')))
    const htmlManifest = JSON.parse(readBound('book_html_render_manifest').toString('utf8'))
    const pdfManifest = JSON.parse(readBound('book_pdf_render_manifest').toString('utf8'))
    for (const rendered of [htmlManifest, pdfManifest]) {
      if (rendered.modelDigest !== model.digest) fail(`${batch.id}: render manifest model mismatch`)
    }
    const renderOptions = {
      feedbackBaseUrl: batch.feedbackBaseUrl,
      printDerivativeProfile: batch.printDerivativeProfile,
      publicRoot: join(repositoryRoot, 'app/public'),
    }
    let html: Buffer
    let pdf: Buffer
    if (originalsDirectory) {
      html = readFileSync(join(originalsDirectory, `${batch.id}.book.html`))
      pdf = readFileSync(join(originalsDirectory, `${batch.id}.book.pdf`))
    } else {
      // Sealed older books keep their exact historical image, independently of today's primary.
      // Every original asset must match the digest already frozen in that book model.
      const privatePublicRoot = join(scratch, batch.id, 'public')
      const overrides = new Map((batch.assetOverrides ?? []).map((item: any) => [item.publicPath, item]))
      if (overrides.size !== (batch.assetOverrides ?? []).length) fail(`${batch.id}: duplicate historical asset override`)
      for (const page of model.pages) {
        const visualization = page.visualization
        if (!visualization || visualization.resourceType !== 'image') continue
        const url = visualization.url
        if (!url.startsWith('/assets/goal-visualizations/')) fail(`${batch.id}: unexpected bound asset path`)
        const override: any = overrides.get(url)
        const source = override ? inside(repositoryRoot, override.sourcePath) : inside(repositoryRoot, `app/public/${url.slice(1)}`)
        const original = readFileSync(source)
        if (sha256(original) !== visualization.originalDigest
            || (override && (original.length !== override.bytes || sha256(original) !== override.sha256))) {
          fail(`${batch.id}: current or historical image does not match the unchanged model digest`)
        }
        const target = inside(privatePublicRoot, url.slice(1))
        await mkdir(dirname(target), { recursive: true })
        await writeFile(target, original)
      }
      for (const url of overrides.keys()) {
        if (!model.pages.some((page: any) => page.visualization?.url === url)) fail(`${batch.id}: unused historical asset override`)
      }
      const privateOptions = { ...renderOptions, publicRoot: privatePublicRoot }
      html = Buffer.from(renderGoalBookHtml(model, {
        ...privateOptions,
        renderedVisualizationByUrl: Object.fromEntries(htmlManifest.assets.map((asset: any) => [
          asset.publicPath,
          { digest: asset.renderedSha256, profile: htmlManifest.printDerivativePolicy.version },
        ])),
      }), 'utf8')
      const generatedPath = join(scratch, `${batch.id}.pdf`)
      await writeGoalBookPdf(model, generatedPath, privateOptions)
      const generated = readFileSync(generatedPath)
      // Verify the native writer's original-source checksum and complete outline first.
      inspectGoalBookPdfOutline(generated, model)
      const markers = [...generated.toString('latin1').matchAll(
        /\n%SKILLPILOT-GOAL-BOOK-OUTLINE-V1 source-bytes=(\d+) source-sha256=([0-9a-f]{64})\n/gu,
      )]
      if (markers.length !== 1 || markers[0].index !== batch.pdf.sourceBytes
          || Number(markers[0][1]) !== batch.pdf.sourceBytes) fail(`${batch.id}: unexpected native PDF prefix`)
      let source = generated.subarray(0, batch.pdf.sourceBytes).toString('latin1')
      for (const field of ['CreationDate', 'ModDate']) {
        const pattern = new RegExp(`/${field}\\s*\\(([^)]*)\\)`, 'gu')
        const fields = [...source.matchAll(pattern)]
        const original = batch.pdf.originalMetadata[field]
        if (fields.length !== 1 || fields[0][1].length !== original.length) fail(`${batch.id}: unexpected ${field}`)
        source = source.replace(pattern, `/${field} (${original})`)
      }
      const restoredSource = Buffer.from(source, 'latin1')
      if (sha256(restoredSource) !== batch.pdf.originalSourceSha256) fail(`${batch.id}: Skia source is not reproducible`)
      // Reuse the unchanged native checksum/outline writer; do not patch its digest blindly.
      pdf = injectGoalBookPdfOutline(restoredSource, model)
    }
    inspectGoalBookPdfOutline(pdf, model)
    for (const [role, bytes, rendered] of [
      ['book_html', html, htmlManifest], ['book_pdf', pdf, pdfManifest],
    ] as const) {
      const item = artifact(role)
      if (bytes.length !== item.bytes || sha256(bytes) !== item.digest || rendered.artifactSha256 !== item.digest) {
        fail(`${batch.id}: ${role} does not recover the unchanged reviewed length and SHA-256`)
      }
      const path = inside(targetRoot, `${batch.bundleDirectory}/${item.path}`)
      if (existsSync(path)) {
        const current = readFileSync(path)
        if (!current.equals(bytes)) fail(`${batch.id}: refusing to replace different existing ${role}`)
      }
      plans.push({ path, bytes, role, batch: batch.id })
    }
    bundles.push({ manifest, directory: inside(targetRoot, batch.bundleDirectory), configPath: batch.configPath })
  }
  // All six complete immutable hashes must pass before any repository output is written.
  if (materialize) {
    for (const plan of plans) {
      if (!existsSync(plan.path)) {
        await mkdir(dirname(plan.path), { recursive: true })
        await writeFile(plan.path, plan.bytes, { flag: 'wx' })
      }
    }
  }
  if (checkNative) {
    for (const bundle of bundles) {
      await verifyGoalBookReviewBundleArtifactBytes(bundle.manifest, bundle.directory)
      if (targetRoot === repositoryRoot) await validatePreparedGoalDescriptionRolloutBatch(bundle.configPath)
    }
  }
  console.log(JSON.stringify({
    contract: recipe.contract, materialized: materialize, nativeByteChecks: checkNative,
    exactArtifacts: plans.map(({ role, batch, bytes }) => ({ role, batch, bytes: bytes.length, sha256: sha256(bytes) })),
  }, null, 2))
} finally {
  await rm(scratch, { recursive: true, force: true })
}
