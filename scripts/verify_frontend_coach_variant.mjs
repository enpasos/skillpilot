#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import path from 'node:path'

const [artifactSourceArgument, expectedVariantArgument] = process.argv.slice(2)
const expectedVariant = (expectedVariantArgument || '').trim().toLowerCase()
const allowedVariants = new Set(['legacy', 'visible-session', 'openai-mcp'])

if (!artifactSourceArgument || !allowedVariants.has(expectedVariant)) {
  console.error(
    'Usage: verify_frontend_coach_variant.mjs <build-directory-or-base-url> '
      + '<legacy|visible-session|openai-mcp>',
  )
  process.exit(2)
}

const isRemoteSource = /^https?:\/\//iu.test(artifactSourceArgument)

const readArtifact = async (fileName) => {
  if (!isRemoteSource) {
    return readFile(path.join(path.resolve(artifactSourceArgument), fileName), 'utf8')
  }

  const baseUrl = artifactSourceArgument.endsWith('/')
    ? artifactSourceArgument
    : `${artifactSourceArgument}/`
  const url = new URL(fileName, baseUrl)
  url.searchParams.set('_coach_variant_check', String(Date.now()))
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    },
  })
  if (!response.ok) {
    throw new Error(`${url.origin}${url.pathname} returned HTTP ${response.status}`)
  }
  return response.text()
}

try {
  const [versionText, indexHtml] = await Promise.all([
    readArtifact('version.json'),
    readArtifact('index.html'),
  ])
  const version = JSON.parse(versionText)
  if (version.coachVariant !== expectedVariant) {
    throw new Error(
      `version.json reports ${JSON.stringify(version.coachVariant)}; expected ${expectedVariant}`,
    )
  }

  const expectedMeta = `<meta name="skillpilot-coach-variant" content="${expectedVariant}">`
  if (!indexHtml.includes(expectedMeta)) {
    throw new Error(`index.html does not contain ${expectedMeta}`)
  }

  console.log(
    `CHECK frontend_coach_variant PASS ${expectedVariant} `
      + (isRemoteSource ? 'remote' : 'artifact'),
  )
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`CHECK frontend_coach_variant FAIL ${message}`)
  process.exit(1)
}
