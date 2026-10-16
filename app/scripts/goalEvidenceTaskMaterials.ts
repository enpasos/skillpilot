// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { lstatSync, readFileSync, realpathSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import type { LearningGoal, ResourceLink } from '../src/landscapeTypes'

// This declaration is deliberately narrow: own, required SVG assessment stimuli in the two reviewed subject lanes.
// Unrelated resources and external URLs are not assessment inputs by implication.
const taskURL = /^\/assets\/task-material\/(mathematik|physik)\/([a-z0-9][a-z0-9-]*-([a-f0-9]{64})\.svg)$/u
const linksFor = (goal: LearningGoal) => (goal.resourceLinks ?? []).filter((link) => link.type === 'task-material')

function declaration(goal: LearningGoal, link: ResourceLink) {
  const match = taskURL.exec(link.url)
  if (
    !match || link.resourceType !== 'image' || link.role !== 'assessment-stimulus'
    || link.skillpilotId !== goal.id || !link.title?.trim()
    || link.license !== 'CC-BY-4.0' || link.lang !== 'de'
  ) throw new Error(`${goal.id}: unsupported required task-material declaration ${link.url}`)
  return { subject: match[1], filename: match[2], digest: `sha256:${match[3]}` }
}

export function requiredTaskMaterialPayload(
  goal: LearningGoal,
  resourceDigests: Readonly<Record<string, string>>,
) {
  const seen = new Set<string>()
  return linksFor(goal).map((link) => {
    const expected = declaration(goal, link)
    if (seen.has(link.url)) throw new Error(`${goal.id}: duplicate required task-material ${link.url}`)
    seen.add(link.url)
    if (resourceDigests[link.url] !== expected.digest) {
      throw new Error(`${goal.id}: required task-material digest is missing or differs from its content-addressed URL ${link.url}`)
    }
    return { type: link.type, resourceType: link.resourceType, role: link.role,
      skillpilotId: link.skillpilotId, title: link.title, url: link.url,
      description: link.description ?? '', lang: link.lang, license: link.license,
      digest: expected.digest }
  }).sort((a, b) => a.url.localeCompare(b.url))
}

function readConfinedFile(root: string, configured: string): Buffer {
  const absolute = resolve(root, configured)
  const real = realpathSync(absolute)
  const rel = relative(resolve(root), real)
  if (rel === '..' || rel.startsWith(`..${sep}`) || resolve(root, rel) !== real || lstatSync(absolute).isSymbolicLink()) {
    throw new Error(`task-material path escapes its declared repository root: ${configured}`)
  }
  return readFileSync(real)
}

export function collectRequiredTaskMaterialDigests(goal: LearningGoal, repositoryRoot: string) {
  const digests: Record<string, string> = {}
  const errors: string[] = []
  for (const link of linksFor(goal)) {
    try {
      const declared = declaration(goal, link)
      if (Object.hasOwn(digests, link.url)) throw new Error(`duplicate task-material ${link.url}`)
      const publicBytes = readConfinedFile(repositoryRoot, `app/public${link.url}`)
      const sourceBytes = readConfinedFile(repositoryRoot, `curricula/DE/Gymnasium/task-material/${declared.subject}/${declared.filename}`)
      const publicDigest = `sha256:${createHash('sha256').update(publicBytes).digest('hex')}`
      const sourceDigest = `sha256:${createHash('sha256').update(sourceBytes).digest('hex')}`
      if (publicDigest !== declared.digest || sourceDigest !== declared.digest || !publicBytes.equals(sourceBytes)) {
        throw new Error(`required task-material source/public bytes differ from content-addressed URL ${link.url}`)
      }
      // The artifact is an SVG image, not an HTML document supplied under another extension.
      const text = publicBytes.toString('utf8').trimStart()
      if (!text.startsWith('<svg ') || !text.includes('xmlns="http://www.w3.org/2000/svg"')) {
        throw new Error(`required task-material is not the declared SVG image ${link.url}`)
      }
      digests[link.url] = publicDigest
    } catch (error) {
      errors.push(`${goal.id}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return { digests, errors }
}
