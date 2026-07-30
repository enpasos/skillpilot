#!/usr/bin/env node

import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const [artifactSourceArgument] = process.argv.slice(2)

if (!artifactSourceArgument) {
  console.error(
    'Usage: verify_frontend_shell_assets.mjs <build-directory-or-base-url>',
  )
  process.exit(2)
}

const isRemoteSource = /^https?:\/\//iu.test(artifactSourceArgument)

function parseAttributes(tag) {
  const attributes = new Map()
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu
  let match
  while ((match = pattern.exec(tag)) !== null) {
    attributes.set(
      match[1].toLowerCase(),
      match[2] ?? match[3] ?? match[4] ?? '',
    )
  }
  return attributes
}

function shellAssetReferences(indexHtml) {
  const references = []
  const seen = new Set()
  const tags = indexHtml.match(/<(?:link|script)\b[^>]*>/giu) ?? []

  for (const tag of tags) {
    const attributes = parseAttributes(tag)
    const tagName = /^<\s*([^\s/>]+)/u.exec(tag)?.[1]?.toLowerCase()
    let kind
    let reference

    if (tagName === 'link') {
      const relationships = (attributes.get('rel') ?? '')
        .toLowerCase()
        .split(/\s+/u)
      if (!relationships.includes('stylesheet')) continue
      kind = 'stylesheet'
      reference = attributes.get('href')
    } else if (
      tagName === 'script'
      && (attributes.get('type') ?? '').toLowerCase() === 'module'
    ) {
      kind = 'module'
      reference = attributes.get('src')
    }

    if (!kind || !reference) continue
    const key = `${kind}:${reference}`
    if (!seen.has(key)) {
      seen.add(key)
      references.push({ kind, reference })
    }
  }

  return references
}

function expectedContentType(kind) {
  return kind === 'stylesheet'
    ? /^text\/css(?:\s*;|$)/iu
    : /^(?:text|application)\/(?:javascript|ecmascript)(?:\s*;|$)/iu
}

function assertRequiredAssetKinds(assets) {
  for (const kind of ['stylesheet', 'module']) {
    if (!assets.some((asset) => asset.kind === kind)) {
      throw new Error(`index.html contains no ${kind} asset reference`)
    }
  }
}

function localAssetPath(buildDirectory, reference) {
  const referenceUrl = new URL(reference, 'https://local.invalid/')
  if (referenceUrl.origin !== 'https://local.invalid') {
    throw new Error(`cross-origin shell asset is not allowed: ${reference}`)
  }

  const relativePath = decodeURIComponent(referenceUrl.pathname).replace(/^\/+/u, '')
  const resolvedPath = path.resolve(buildDirectory, relativePath)
  const relativeToBuild = path.relative(buildDirectory, resolvedPath)
  if (
    relativeToBuild === ''
    || relativeToBuild.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativeToBuild)
  ) {
    throw new Error(`shell asset escapes build directory: ${reference}`)
  }
  return resolvedPath
}

async function verifyLocal() {
  const buildDirectory = path.resolve(artifactSourceArgument)
  const buildStats = await stat(buildDirectory)
  if (!buildStats.isDirectory()) {
    throw new Error(`${buildDirectory} is not a directory`)
  }

  const indexHtml = await readFile(path.join(buildDirectory, 'index.html'), 'utf8')
  const assets = shellAssetReferences(indexHtml)
  assertRequiredAssetKinds(assets)

  for (const asset of assets) {
    const assetPath = localAssetPath(buildDirectory, asset.reference)
    const assetStats = await stat(assetPath)
    if (!assetStats.isFile()) {
      throw new Error(`${asset.reference} is not a file`)
    }
    if (assetStats.size === 0) {
      throw new Error(`${asset.reference} is empty`)
    }
  }

  return assets
}

async function fetchWithoutCache(url) {
  const requestUrl = new URL(url)
  requestUrl.searchParams.set('_frontend_shell_check', String(Date.now()))
  return fetch(requestUrl, {
    cache: 'no-store',
    headers: {
      'cache-control': 'no-cache, no-store',
      pragma: 'no-cache',
    },
  })
}

async function verifyRemote() {
  const baseUrl = artifactSourceArgument.endsWith('/')
    ? artifactSourceArgument
    : `${artifactSourceArgument}/`
  const indexUrl = new URL('index.html', baseUrl)
  const indexResponse = await fetchWithoutCache(indexUrl)
  if (!indexResponse.ok) {
    throw new Error(
      `${indexUrl.origin}${indexUrl.pathname} returned HTTP ${indexResponse.status}`,
    )
  }

  const indexHtml = await indexResponse.text()
  if (indexHtml.trim().length === 0) {
    throw new Error('index.html is empty')
  }
  const assets = shellAssetReferences(indexHtml)
  assertRequiredAssetKinds(assets)

  for (const asset of assets) {
    const assetUrl = new URL(asset.reference, indexUrl)
    if (assetUrl.origin !== indexUrl.origin) {
      throw new Error(`cross-origin shell asset is not allowed: ${asset.reference}`)
    }

    const response = await fetchWithoutCache(assetUrl)
    if (!response.ok) {
      throw new Error(
        `${assetUrl.origin}${assetUrl.pathname} returned HTTP ${response.status}`,
      )
    }
    const contentType = response.headers.get('content-type') ?? ''
    if (!expectedContentType(asset.kind).test(contentType)) {
      throw new Error(
        `${assetUrl.origin}${assetUrl.pathname} returned unexpected Content-Type `
          + `${JSON.stringify(contentType)} for ${asset.kind}`,
      )
    }
    const body = await response.arrayBuffer()
    if (body.byteLength === 0) {
      throw new Error(`${assetUrl.origin}${assetUrl.pathname} is empty`)
    }
  }

  return assets
}

try {
  const assets = isRemoteSource ? await verifyRemote() : await verifyLocal()
  const stylesheetCount = assets.filter(
    (asset) => asset.kind === 'stylesheet',
  ).length
  const moduleCount = assets.filter((asset) => asset.kind === 'module').length
  console.log(
    `CHECK frontend_shell_assets PASS `
      + `${isRemoteSource ? 'remote' : 'artifact'} `
      + `stylesheets=${stylesheetCount} modules=${moduleCount}`,
  )
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`CHECK frontend_shell_assets FAIL ${message}`)
  process.exit(1)
}
