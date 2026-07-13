import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

function parseArguments(argv) {
  const options = {
    baseUrl: process.env.REGRESSION_BASE_URL || 'http://127.0.0.1:8080/api/action-regression',
    expectedOpenApiBaseUrl: process.env.REGRESSION_EXPECTED_OPENAPI_BASE_URL || '',
    evidenceDir: '',
  }
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--base-url') {
      options.baseUrl = argv[++index]
    } else if (argv[index] === '--expected-openapi-base-url') {
      options.expectedOpenApiBaseUrl = argv[++index]
    } else if (argv[index] === '--evidence-dir') {
      options.evidenceDir = argv[++index]
    } else {
      throw new Error(`Unknown or incomplete argument: ${argv[index]}`)
    }
  }
  options.baseUrl = new URL(options.baseUrl).toString().replace(/\/$/, '')
  if (options.expectedOpenApiBaseUrl) {
    options.expectedOpenApiBaseUrl = new URL(options.expectedOpenApiBaseUrl).toString().replace(/\/$/, '')
  }
  if (options.evidenceDir) {
    options.evidenceDir = path.resolve(process.env.INIT_CWD || process.cwd(), options.evidenceDir)
  }
  return options
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function serializeResponseMetadata(response) {
  const headers = [...response.headers.entries()].map(([name, value]) => `${name}: ${value}`).join('\n')
  return `HTTP status: ${response.status}\n${headers}\n`
}

async function getResponse(url, options, timeoutMs) {
  const startedAt = Date.now()
  const response = await fetch(url, {
    redirect: 'manual',
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  })
  const body = await response.text()
  return {
    response,
    body,
    durationMs: Date.now() - startedAt,
  }
}

function assertJsonContentType(response, label) {
  const contentType = response.headers.get('content-type') || ''
  const mediaType = contentType.split(';', 1)[0].trim().toLowerCase()
  if (mediaType !== 'application/json') {
    throw new Error(`${label} returned unexpected Content-Type: ${contentType || '<missing>'}`)
  }
}

function assertControlResponseHeaders(response, label, seenRequestIds) {
  const cacheControl = response.headers.get('cache-control')
  if (cacheControl !== 'no-store') {
    throw new Error(`${label} returned unexpected Cache-Control: ${cacheControl || '<missing>'}`)
  }

  const requestId = response.headers.get('x-regression-request-id')
  if (!requestId) {
    throw new Error(`${label} is missing X-Regression-Request-Id.`)
  }
  if (seenRequestIds.has(requestId)) {
    throw new Error(`${label} returned duplicate X-Regression-Request-Id: ${requestId}`)
  }
  seenRequestIds.add(requestId)
  return requestId
}

const HTTP_OPERATION_METHODS = new Set([
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
])

const EXPECTED_OPENAPI_OPERATIONS = [
  { path: '/v1/probe', method: 'get', operationId: 'createRegressionProbe' },
  { path: '/v1/verify', method: 'post', operationId: 'verifyRegressionProbe' },
]
const NEGATIVE_VERIFY_CONTROL_CASE = 'single-proof-hex-mutation'
const PROBE_SCHEMA_REF = '#/components/schemas/Probe'
const VERIFICATION_RESULT_SCHEMA_REF = '#/components/schemas/VerificationResult'
const PROBE_ID_PATTERN = '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
const TOKEN_PATTERN = '^SPREG-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{16}$'
const PROOF_PATTERN = '^[0-9a-f]{32}$'

function collectOperationIds(value, operationIds = []) {
  if (value === null || typeof value !== 'object') {
    return operationIds
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectOperationIds(item, operationIds)
    }
    return operationIds
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === 'operationId') {
      operationIds.push(child)
    }
    collectOperationIds(child, operationIds)
  }
  return operationIds
}

function findForbiddenOpenApiKey(value, path = '$') {
  if (value === null || typeof value !== 'object') {
    return null
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findForbiddenOpenApiKey(value[index], `${path}[${index}]`)
      if (found) {
        return found
      }
    }
    return null
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === 'example' || key === 'examples' || key === 'default') {
      return `${path}.${key}`
    }
    const found = findForbiddenOpenApiKey(child, `${path}.${key}`)
    if (found) {
      return found
    }
  }
  return null
}

function assertExactObjectKeys(value, expectedKeys, label) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} is not an object.`)
  }
  const actualKeys = Object.keys(value).sort()
  const sortedExpectedKeys = [...expectedKeys].sort()
  if (actualKeys.length !== sortedExpectedKeys.length
      || actualKeys.some((key, index) => key !== sortedExpectedKeys[index])) {
    throw new Error(`${label} does not contain exactly ${sortedExpectedKeys.join(', ')}.`)
  }
}

function assertExactStringArray(value, expectedValues, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} is not an array.`)
  }
  const actualValues = [...value].sort()
  const sortedExpectedValues = [...expectedValues].sort()
  if (actualValues.length !== sortedExpectedValues.length
      || actualValues.some((entry, index) => entry !== sortedExpectedValues[index])) {
    throw new Error(`${label} does not contain exactly ${sortedExpectedValues.join(', ')}.`)
  }
}

function assertEmptySecurity(value, label) {
  if (!Array.isArray(value) || value.length !== 0) {
    throw new Error(`${label} security must be exactly an empty array.`)
  }
}

function assertExactPropertySchema(schema, expected, label) {
  assertExactObjectKeys(schema, Object.keys(expected), label)
  for (const [key, value] of Object.entries(expected)) {
    if (schema[key] !== value) {
      throw new Error(`${label} has unexpected ${key}.`)
    }
  }
}

function assertExactObjectSchema(schema, expectedProperties, label) {
  assertExactObjectKeys(schema, ['type', 'additionalProperties', 'required', 'properties'], label)
  if (schema.type !== 'object' || schema.additionalProperties !== false) {
    throw new Error(`${label} must be an object with additionalProperties=false.`)
  }
  const propertyNames = Object.keys(expectedProperties)
  assertExactStringArray(schema.required, propertyNames, `${label} required`)
  assertExactObjectKeys(schema.properties, propertyNames, `${label} properties`)
  for (const [propertyName, propertyContract] of Object.entries(expectedProperties)) {
    assertExactPropertySchema(
      schema.properties[propertyName],
      propertyContract,
      `${label} property ${propertyName}`,
    )
  }
}

function assertExactOpenApiOperations(document) {
  if (document?.openapi !== '3.1.0') {
    throw new Error('OpenAPI response must declare openapi=3.1.0.')
  }
  if (!Array.isArray(document.servers) || document.servers.length !== 1) {
    throw new Error('OpenAPI response must contain exactly one server.')
  }
  assertEmptySecurity(document.security, 'OpenAPI top-level')

  const paths = document?.paths
  if (paths === null || typeof paths !== 'object' || Array.isArray(paths)) {
    throw new Error('OpenAPI response does not contain a paths object.')
  }

  const expectedPaths = EXPECTED_OPENAPI_OPERATIONS.map((operation) => operation.path).sort()
  const actualPaths = Object.keys(paths).sort()
  if (actualPaths.length !== expectedPaths.length
      || actualPaths.some((pathName, index) => pathName !== expectedPaths[index])) {
    throw new Error('OpenAPI response does not contain exactly the two expected Action paths.')
  }

  for (const expected of EXPECTED_OPENAPI_OPERATIONS) {
    const pathItem = paths[expected.path]
    if (pathItem === null || typeof pathItem !== 'object' || Array.isArray(pathItem)) {
      throw new Error(`OpenAPI path ${expected.path} is not a Path Item object.`)
    }
    const methods = Object.keys(pathItem).filter((key) => HTTP_OPERATION_METHODS.has(key))
    if (methods.length !== 1 || methods[0] !== expected.method) {
      throw new Error(`OpenAPI path ${expected.path} does not contain exactly the expected ${expected.method.toUpperCase()} operation.`)
    }
    if (pathItem[expected.method]?.operationId !== expected.operationId) {
      throw new Error(`OpenAPI path ${expected.path} does not expose operationId ${expected.operationId}.`)
    }
    assertEmptySecurity(pathItem[expected.method].security, `OpenAPI operation ${expected.operationId}`)
    if (pathItem[expected.method]['x-openai-isConsequential'] !== false) {
      throw new Error(`OpenAPI operation ${expected.operationId} must set x-openai-isConsequential=false.`)
    }
    if (pathItem[expected.method].callbacks
        && Object.keys(pathItem[expected.method].callbacks).length > 0) {
      throw new Error(`OpenAPI operation ${expected.operationId} contains additional callback HTTP operations.`)
    }
  }

  if (document.webhooks && Object.keys(document.webhooks).length > 0) {
    throw new Error('OpenAPI response contains additional webhook HTTP operations.')
  }
  if (document.components?.pathItems && Object.keys(document.components.pathItems).length > 0) {
    throw new Error('OpenAPI response contains additional component Path Item operations.')
  }
  if (document.components?.callbacks && Object.keys(document.components.callbacks).length > 0) {
    throw new Error('OpenAPI response contains additional component callback HTTP operations.')
  }

  const expectedOperationIds = EXPECTED_OPENAPI_OPERATIONS.map((operation) => operation.operationId).sort()
  const actualOperationIds = collectOperationIds(document).sort()
  if (actualOperationIds.length !== expectedOperationIds.length
      || actualOperationIds.some((operationId, index) => operationId !== expectedOperationIds[index])) {
    throw new Error('OpenAPI response does not contain exactly the two expected operationIds.')
  }

  const probeOperation = paths['/v1/probe'].get
  const verifyOperation = paths['/v1/verify'].post
  if (probeOperation.responses?.['200']?.content?.['application/json']?.schema?.$ref !== PROBE_SCHEMA_REF) {
    throw new Error('OpenAPI probe HTTP 200 response must reference the Probe schema.')
  }
  if (verifyOperation.requestBody?.required !== true
      || verifyOperation.requestBody?.content?.['application/json']?.schema?.$ref !== PROBE_SCHEMA_REF) {
    throw new Error('OpenAPI verify requestBody must be required and reference the Probe schema.')
  }
  if (verifyOperation.responses?.['200']?.content?.['application/json']?.schema?.$ref
      !== VERIFICATION_RESULT_SCHEMA_REF) {
    throw new Error('OpenAPI verify HTTP 200 response must reference the VerificationResult schema.')
  }

  assertExactObjectSchema(document.components?.schemas?.Probe, {
    probe_id: { type: 'string', format: 'uuid', pattern: PROBE_ID_PATTERN },
    token: { type: 'string', pattern: TOKEN_PATTERN },
    proof: { type: 'string', pattern: PROOF_PATTERN },
  }, 'OpenAPI Probe schema')
  assertExactObjectSchema(document.components?.schemas?.VerificationResult, {
    ok: { type: 'boolean' },
    probe_id: { type: 'string', format: 'uuid' },
    proof_valid: { type: 'boolean' },
  }, 'OpenAPI VerificationResult schema')

  const forbiddenKey = findForbiddenOpenApiKey(document)
  if (forbiddenKey) {
    throw new Error(`OpenAPI response contains forbidden example/examples/default key at ${forbiddenKey}.`)
  }
}

function assertProbeShape(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Probe response is not a JSON object.')
  }
  if (Object.keys(payload).sort().join(',') !== 'probe_id,proof,token') {
    throw new Error('Probe response does not contain exactly probe_id, token, and proof.')
  }
  if (typeof payload.probe_id !== 'string'
      || typeof payload.token !== 'string'
      || typeof payload.proof !== 'string') {
    throw new Error('Probe response fields are not strings.')
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.probe_id)
      || !/^SPREG-[A-HJ-NP-Z2-9]{16}$/.test(payload.token)
      || !/^[0-9a-f]{32}$/.test(payload.proof)) {
    throw new Error('Probe response fields do not match the documented formats.')
  }
}

function mutateOneProofHexCharacter(proof) {
  const replacement = proof[0] === '0' ? '1' : '0'
  return `${replacement}${proof.slice(1)}`
}

function assertExactVerificationPayload(payload, expected, label) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)
      || Object.keys(payload).sort().join(',') !== 'ok,probe_id,proof_valid') {
    throw new Error(`${label} response does not contain exactly ok, probe_id, and proof_valid.`)
  }
  if (payload.ok !== expected.ok || payload.proof_valid !== expected.proofValid) {
    throw new Error(`${label} returned unexpected verification flags.`)
  }
  if (payload.probe_id !== expected.probeId) {
    throw new Error(`${label} returned a different probe_id.`)
  }
}

function parseJson(response, body, label, expectedStatus = 200) {
  if (response.status !== expectedStatus) {
    throw new Error(`${label} failed with HTTP ${response.status}: ${body.trim()}`)
  }
  try {
    return JSON.parse(body)
  } catch {
    throw new Error(`${label} returned invalid JSON.`)
  }
}

async function writeEvidence(directory, records) {
  await mkdir(directory, { recursive: true })
  const files = []
  for (const [name, content] of Object.entries(records)) {
    const filePath = path.join(directory, name)
    await writeFile(filePath, content, 'utf8')
    files.push({ file: name, bytes: Buffer.byteLength(content), sha256: sha256(content) })
  }
  const manifest = `${JSON.stringify({ generated_at: new Date().toISOString(), files }, null, 2)}\n`
  await writeFile(path.join(directory, 'evidence-manifest.json'), manifest, 'utf8')
}

export async function runControl(options) {
  const requestTimeoutMs = options.requestTimeoutMs ?? 40_000
  const seenRequestIds = new Set()
  const health = await getResponse(`${options.baseUrl}/healthz`, undefined, requestTimeoutMs)
  const healthRequestId = assertControlResponseHeaders(health.response, 'Health check', seenRequestIds)
  const healthPayload = parseJson(health.response, health.body, 'Health check')
  assertJsonContentType(health.response, 'Health check')
  if (healthPayload.status !== 'ok') {
    throw new Error('Health check did not return status=ok.')
  }
  if (typeof healthPayload.application_id !== 'string' || healthPayload.application_id.trim() === '') {
    throw new Error('Health check did not return a non-empty application_id.')
  }
  if (typeof healthPayload.hmac_key_id !== 'string'
      || !/^[0-9a-f]{16}$/i.test(healthPayload.hmac_key_id)) {
    throw new Error('Health check did not return a 16-character hexadecimal hmac_key_id.')
  }

  const openApi = await getResponse(`${options.baseUrl}/openapi.yaml`, undefined, requestTimeoutMs)
  const openApiRequestId = assertControlResponseHeaders(openApi.response, 'OpenAPI request', seenRequestIds)
  const openApiDocument = parseJson(openApi.response, openApi.body, 'OpenAPI request')
  const openApiContentType = openApi.response.headers.get('content-type') || ''
  const openApiMediaType = openApiContentType.split(';', 1)[0].trim().toLowerCase()
  if (openApiMediaType !== 'application/yaml') {
    throw new Error(`OpenAPI request returned unexpected Content-Type: ${openApiContentType || '<missing>'}`)
  }
  const expectedOpenApiBaseUrl = new URL(options.expectedOpenApiBaseUrl || options.baseUrl).toString().replace(/\/$/, '')
  if (openApiDocument.servers?.[0]?.url !== expectedOpenApiBaseUrl) {
    throw new Error(`OpenAPI server URL does not match the tested public URL: ${openApiDocument.servers?.[0]?.url || '<missing>'}`)
  }
  assertExactOpenApiOperations(openApiDocument)

  const probe = await getResponse(`${options.baseUrl}/v1/probe`, {
    headers: { Accept: 'application/json' },
  }, requestTimeoutMs)
  const probeRequestId = assertControlResponseHeaders(probe.response, 'Probe request', seenRequestIds)
  const probePayload = parseJson(probe.response, probe.body, 'Probe request')
  assertJsonContentType(probe.response, 'Probe request')
  assertProbeShape(probePayload)

  const verifyRequestBody = JSON.stringify(probePayload)
  const verify = await getResponse(`${options.baseUrl}/v1/verify`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: verifyRequestBody,
  }, requestTimeoutMs)
  const verifyRequestId = assertControlResponseHeaders(verify.response, 'Verify request', seenRequestIds)
  const verifyPayload = parseJson(verify.response, verify.body, 'Verify request')
  assertJsonContentType(verify.response, 'Verify request')
  assertExactVerificationPayload(verifyPayload, {
    ok: true,
    proofValid: true,
    probeId: probePayload.probe_id,
  }, 'Verifier')

  const negativeVerifyPayload = {
    ...probePayload,
    proof: mutateOneProofHexCharacter(probePayload.proof),
  }
  const negativeVerifyRequestBody = JSON.stringify(negativeVerifyPayload)
  const negativeVerify = await getResponse(`${options.baseUrl}/v1/verify`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Regression-Control-Case': NEGATIVE_VERIFY_CONTROL_CASE,
    },
    body: negativeVerifyRequestBody,
  }, requestTimeoutMs)
  const negativeVerifyRequestId = assertControlResponseHeaders(
    negativeVerify.response,
    'Negative verify control',
    seenRequestIds,
  )
  const negativeVerifyResponsePayload = parseJson(
    negativeVerify.response,
    negativeVerify.body,
    'Negative verify control',
  )
  assertJsonContentType(negativeVerify.response, 'Negative verify control')
  assertExactVerificationPayload(negativeVerifyResponsePayload, {
    ok: false,
    proofValid: false,
    probeId: probePayload.probe_id,
  }, 'Negative verify control')

  const result = {
    result: 'CONTROL_PASS',
    base_url: options.baseUrl,
    completed_at: new Date().toISOString(),
    health_status: health.response.status,
    configured_openapi_status: openApi.response.status,
    probe_status: probe.response.status,
    verify_status: verify.response.status,
    negative_verify_status: negativeVerify.response.status,
    application_id: healthPayload.application_id,
    hmac_key_id: healthPayload.hmac_key_id,
    probe_id: probePayload.probe_id,
    token: probePayload.token,
    health_request_id: healthRequestId,
    configured_openapi_request_id: openApiRequestId,
    probe_request_id: probeRequestId,
    verify_request_id: verifyRequestId,
    negative_verify_request_id: negativeVerifyRequestId,
    negative_verify_control_case: NEGATIVE_VERIFY_CONTROL_CASE,
    probe_duration_ms: probe.durationMs,
    verify_duration_ms: verify.durationMs,
    negative_verify_duration_ms: negativeVerify.durationMs,
    probe_response_bytes: Buffer.byteLength(probe.body),
    probe_response_sha256: sha256(probe.body),
    verify_request_bytes: Buffer.byteLength(verifyRequestBody),
    verify_request_sha256: sha256(verifyRequestBody),
    verify_response_bytes: Buffer.byteLength(verify.body),
    verify_response_sha256: sha256(verify.body),
    negative_verify_request_bytes: Buffer.byteLength(negativeVerifyRequestBody),
    negative_verify_request_sha256: sha256(negativeVerifyRequestBody),
    negative_verify_response_bytes: Buffer.byteLength(negativeVerify.body),
    negative_verify_response_sha256: sha256(negativeVerify.body),
    configured_openapi_bytes: Buffer.byteLength(openApi.body),
    configured_openapi_sha256: sha256(openApi.body),
  }

  if (options.evidenceDir) {
    await writeEvidence(options.evidenceDir, {
      'control-health.headers.txt': serializeResponseMetadata(health.response),
      'control-health.json': health.body,
      'configured-openapi.headers.txt': serializeResponseMetadata(openApi.response),
      'configured-openapi.yaml': openApi.body,
      'control-probe.headers.txt': serializeResponseMetadata(probe.response),
      'control-probe.json': probe.body,
      'control-verify-request.json': verifyRequestBody,
      'control-verify.headers.txt': serializeResponseMetadata(verify.response),
      'control-verify.json': verify.body,
      'control-negative-verify-request.json': negativeVerifyRequestBody,
      'control-negative-verify.headers.txt': serializeResponseMetadata(negativeVerify.response),
      'control-negative-verify.json': negativeVerify.body,
      'control-result.json': `${JSON.stringify(result, null, 2)}\n`,
    })
  }

  return result
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const result = await runControl(options)
  process.stdout.write(`CONTROL_PASS probe_id=${result.probe_id} token=${result.token}\n`)
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : ''
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`CONTROL_FAIL ${error.message}\n`)
    process.exitCode = 1
  })
}
