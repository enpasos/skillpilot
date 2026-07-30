#!/usr/bin/env node

import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const [artifactSourceArgument] = process.argv.slice(2)

if (!artifactSourceArgument) {
  console.error(
    'Usage: verify_ai_transparency_artifact.mjs <build-directory-or-base-url>',
  )
  process.exit(2)
}

const requiredCopy = [
  'Diese Audioeinführung enthält KI-erzeugte Stimmen.',
  'This audio introduction contains AI-generated voices.',
  'Der Lerncoach ist ein KI-Assistent und kann Fehler machen.',
  'The learning coach is an AI assistant and can make mistakes.',
  'KI-Transparenz',
  'AI Transparency',
]
const isRemoteSource = /^https?:\/\//iu.test(artifactSourceArgument)

async function collectLocalJavaScript(directory) {
  const files = []
  const pending = [directory]

  while (pending.length > 0) {
    const current = pending.pop()
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        pending.push(entryPath)
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(entryPath)
      }
    }
  }

  return Promise.all(files.sort().map((file) => readFile(file, 'utf8')))
}

function assetReferences(indexHtml) {
  const references = new Set()
  const pattern = /(?:src|href)=["']([^"']+\.js(?:\?[^"']*)?)["']/giu
  let match
  while ((match = pattern.exec(indexHtml)) !== null) {
    references.add(match[1])
  }
  return [...references]
}

function nestedJavaScriptReferences(javascript) {
  const references = new Set()
  const patterns = [
    // Vite's dependency preload map.
    /["'`](assets\/[^"'`\s]+\.js(?:\?[^"'`\s]*)?)["'`]/giu,
    // Dynamic and side-effect ESM imports.
    /\bimport\s*(?:\(\s*)?["'`]([^"'`\s]+\.js(?:\?[^"'`\s]*)?)["'`]/giu,
    // Static ESM imports and re-exports.
    /\bfrom\s*["'`]([^"'`\s]+\.js(?:\?[^"'`\s]*)?)["'`]/giu,
  ]
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(javascript)) !== null) {
      references.add(match[1])
    }
  }
  return [...references]
}

function resolveNestedJavaScriptReference(reference, scriptUrl, indexUrl) {
  // Relative ESM imports such as "./chunk.js" are resolved from the importing
  // script. Vite's preload map, however, stores paths such as
  // "assets/chunk.js" relative to the document base. Resolving both forms from
  // the script URL would turn the latter into "/assets/assets/chunk.js".
  const resolutionBase = /^\.{1,2}\//u.test(reference)
    ? scriptUrl
    : indexUrl
  return new URL(reference, resolutionBase)
}

async function fetchText(url) {
  const requestUrl = new URL(url)
  requestUrl.searchParams.set('_ai_transparency_check', String(Date.now()))
  const response = await fetch(requestUrl, {
    cache: 'no-store',
    headers: {
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    },
  })
  if (!response.ok) {
    throw new Error(
      `${requestUrl.origin}${requestUrl.pathname} returned HTTP ${response.status}`,
    )
  }
  return response.text()
}

async function readArtifactText() {
  if (!isRemoteSource) {
    const buildDirectory = path.resolve(artifactSourceArgument)
    const buildStats = await stat(buildDirectory)
    if (!buildStats.isDirectory()) {
      throw new Error(`${buildDirectory} is not a directory`)
    }
    const [indexHtml, ...javascript] = await Promise.all([
      readFile(path.join(buildDirectory, 'index.html'), 'utf8'),
      ...await collectLocalJavaScript(buildDirectory),
    ])
    return [indexHtml, ...javascript].join('\n')
  }

  const baseUrl = artifactSourceArgument.endsWith('/')
    ? artifactSourceArgument
    : `${artifactSourceArgument}/`
  const indexUrl = new URL('index.html', baseUrl)
  const indexHtml = await fetchText(indexUrl)
  const references = assetReferences(indexHtml)
  if (references.length === 0) {
    throw new Error('index.html contains no JavaScript asset references')
  }

  const javascript = []
  const pending = references.map((reference) => new URL(reference, indexUrl))
  const seen = new Set()
  while (pending.length > 0) {
    const scriptUrl = pending.shift()
    const key = `${scriptUrl.origin}${scriptUrl.pathname}`
    if (seen.has(key)) continue
    seen.add(key)

    const script = await fetchText(scriptUrl)
    javascript.push(script)
    for (const reference of nestedJavaScriptReferences(script)) {
      const nestedUrl = resolveNestedJavaScriptReference(
        reference,
        scriptUrl,
        indexUrl,
      )
      if (
        nestedUrl.origin === indexUrl.origin
        && nestedUrl.pathname.includes('/assets/')
        && !seen.has(`${nestedUrl.origin}${nestedUrl.pathname}`)
      ) {
        pending.push(nestedUrl)
      }
    }
  }
  return [indexHtml, ...javascript].join('\n')
}

try {
  const artifactText = await readArtifactText()
  const missing = requiredCopy.filter((copy) => !artifactText.includes(copy))
  if (missing.length > 0) {
    throw new Error(`missing required copy: ${missing.join(' | ')}`)
  }

  console.log(
    `CHECK ai_transparency_artifact PASS `
      + (isRemoteSource ? 'remote' : 'artifact'),
  )
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`CHECK ai_transparency_artifact FAIL ${message}`)
  process.exit(1)
}
