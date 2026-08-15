#!/usr/bin/env node

import { lstat, readFile } from 'node:fs/promises'
import path from 'node:path'

import {
  OPENAI_REVIEW_VIDEO,
  validateOpenAiReviewVideoBytes,
} from './openai_review_video_contract.mjs'

const [artifactSourceArgument] = process.argv.slice(2)

if (!artifactSourceArgument) {
  console.error(
    'Usage: verify_openai_review_video.mjs <build-directory-or-base-url>',
  )
  process.exit(2)
}

const isRemoteSource = /^https?:\/\//iu.test(artifactSourceArgument)

async function verifyLocal() {
  const buildDirectory = path.resolve(artifactSourceArgument)
  const videoPath = path.resolve(buildDirectory, OPENAI_REVIEW_VIDEO.relativePath)
  const relativeToBuild = path.relative(buildDirectory, videoPath)
  if (
    relativeToBuild.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativeToBuild)
  ) {
    throw new Error('review video path escapes the build directory')
  }

  const stats = await lstat(videoPath)
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new Error(`${OPENAI_REVIEW_VIDEO.relativePath} is not a regular file`)
  }

  return validateOpenAiReviewVideoBytes(await readFile(videoPath))
}

function requireHeader(response, name, expected) {
  const actual = response.headers.get(name) ?? ''
  if (typeof expected === 'string' ? actual !== expected : !expected.test(actual)) {
    throw new Error(
      `${name} is ${JSON.stringify(actual)}; expected ${String(expected)}`,
    )
  }
}

async function fetchReviewVideo(url, headers = {}) {
  return fetch(url, {
    cache: 'no-store',
    headers: {
      'cache-control': 'no-cache, no-store',
      pragma: 'no-cache',
      ...headers,
    },
    redirect: 'manual',
    signal: AbortSignal.timeout(60_000),
  })
}

async function verifyRemote() {
  const baseUrl = artifactSourceArgument.endsWith('/')
    ? artifactSourceArgument
    : `${artifactSourceArgument}/`
  const publicPath = new URL(OPENAI_REVIEW_VIDEO.publicUrl).pathname.replace(/^\/+/, '')
  const expectedPublicUrl = new URL(publicPath, baseUrl)

  const response = await fetchReviewVideo(expectedPublicUrl)
  if (response.status !== 200) {
    throw new Error(`review video returned HTTP ${response.status} instead of 200`)
  }
  requireHeader(response, 'content-type', /^video\/mp4(?:\s*;|$)/iu)
  requireHeader(response, 'content-length', String(OPENAI_REVIEW_VIDEO.bytes))
  requireHeader(response, 'accept-ranges', /(?:^|,\s*)bytes(?:\s*,|$)/iu)

  const fullBytes = Buffer.from(await response.arrayBuffer())
  const verified = validateOpenAiReviewVideoBytes(fullBytes)

  const rangeEnd = 1023
  const rangeResponse = await fetchReviewVideo(expectedPublicUrl, {
    range: `bytes=0-${rangeEnd}`,
  })
  if (rangeResponse.status !== 206) {
    throw new Error(
      `review video range request returned HTTP ${rangeResponse.status} instead of 206`,
    )
  }
  requireHeader(
    rangeResponse,
    'content-range',
    `bytes 0-${rangeEnd}/${OPENAI_REVIEW_VIDEO.bytes}`,
  )
  requireHeader(rangeResponse, 'content-length', String(rangeEnd + 1))
  const rangeBytes = Buffer.from(await rangeResponse.arrayBuffer())
  if (!rangeBytes.equals(fullBytes.subarray(0, rangeEnd + 1))) {
    throw new Error('review video range bytes differ from the complete artifact')
  }

  return verified
}

try {
  const verified = isRemoteSource ? await verifyRemote() : await verifyLocal()
  console.log(
    `CHECK openai_review_video PASS ${isRemoteSource ? 'remote' : 'artifact'} `
      + `bytes=${verified.bytes} sha256=${verified.sha256}`,
  )
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`CHECK openai_review_video FAIL ${message}`)
  process.exit(1)
}
