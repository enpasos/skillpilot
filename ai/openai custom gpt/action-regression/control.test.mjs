import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { runControl } from './control.mjs'

const ROUTE_PREFIX = '/api/action-regression'
const APPLICATION_ID = 'skillpilot-test-application'
const HMAC_KEY_ID = '0123456789abcdef'
const NEGATIVE_VERIFY_CONTROL_CASE = 'single-proof-hex-mutation'
const PROBE = {
  probe_id: '8b21986a-6ad7-4c05-9e7f-e969f08b113e',
  token: 'SPREG-4N7K2Q9M8X5C6DGH',
  proof: 'a8fd20c8a7c2bfedfb2486567b1bc106',
}
const REQUEST_IDS = {
  health: '0877ae93-aed5-4b1d-858e-8dc9f3d43ff7',
  openApi: 'a265866c-8252-4d1f-88bb-e4feaacdbe93',
  probe: '49cfcf1f-b770-4c5d-bb56-61059d9193e9',
  verify: 'd3e69dd9-379f-4aa0-8f32-58a4046431cc',
  negativeVerify: '7ce1220a-cc87-482f-bc93-71157b5f673d',
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function proofCharacterDifferences(left, right) {
  if (left.length !== right.length) {
    return Number.POSITIVE_INFINITY
  }
  return [...left].reduce((count, character, index) => (
    character === right[index] ? count : count + 1
  ), 0)
}

function isSingleProofMutation(payload) {
  return payload !== null
    && typeof payload === 'object'
    && !Array.isArray(payload)
    && Object.keys(payload).sort().join(',') === 'probe_id,proof,token'
    && payload.probe_id === PROBE.probe_id
    && payload.token === PROBE.token
    && typeof payload.proof === 'string'
    && /^[0-9a-f]{32}$/.test(payload.proof)
    && proofCharacterDifferences(payload.proof, PROBE.proof) === 1
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  })
  response.end(JSON.stringify(payload))
}

function responseHeaders(options, responseName) {
  const cacheControl = Object.hasOwn(options.cacheControls ?? {}, responseName)
    ? options.cacheControls[responseName]
    : 'no-store'
  const requestId = Object.hasOwn(options.requestIds ?? {}, responseName)
    ? options.requestIds[responseName]
    : REQUEST_IDS[responseName]
  return Object.fromEntries([
    ['Cache-Control', cacheControl],
    ['X-Regression-Request-Id', requestId],
  ].filter(([, value]) => value !== null))
}

async function startStub(options = {}) {
  let baseUrl = ''
  let positiveVerifyCompleted = false
  const server = createServer(async (request, response) => {
    if (request.url === options.timeoutPath) {
      return
    }

    if (request.method === 'GET' && request.url === `${ROUTE_PREFIX}/healthz`) {
      sendJson(response, options.healthStatus ?? 200, {
        status: options.healthStatus && options.healthStatus !== 200 ? 'unavailable' : 'ok',
        application_id: Object.hasOwn(options, 'healthApplicationId')
          ? options.healthApplicationId
          : APPLICATION_ID,
        hmac_key_id: Object.hasOwn(options, 'healthHmacKeyId')
          ? options.healthHmacKeyId
          : HMAC_KEY_ID,
      }, responseHeaders(options, 'health'))
      return
    }

    if (request.method === 'GET' && request.url === `${ROUTE_PREFIX}/openapi.yaml`) {
      const document = {
        openapi: '3.1.0',
        info: {
          title: 'Control stub',
          version: '1.0.0',
        },
        servers: [{ url: options.openApiServerUrl ?? baseUrl }],
        security: [],
        paths: {
          '/v1/probe': {
            get: {
              operationId: 'createRegressionProbe',
              'x-openai-isConsequential': false,
              security: [],
              responses: {
                200: {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Probe' },
                    },
                  },
                },
              },
            },
          },
          '/v1/verify': {
            post: {
              operationId: 'verifyRegressionProbe',
              'x-openai-isConsequential': false,
              security: [],
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Probe' },
                  },
                },
              },
              responses: {
                200: {
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/VerificationResult' },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Probe: {
              type: 'object',
              additionalProperties: false,
              required: ['probe_id', 'token', 'proof'],
              properties: {
                probe_id: {
                  type: 'string',
                  format: 'uuid',
                  pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
                },
                token: {
                  type: 'string',
                  pattern: '^SPREG-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{16}$',
                },
                proof: {
                  type: 'string',
                  pattern: '^[0-9a-f]{32}$',
                },
              },
            },
            VerificationResult: {
              type: 'object',
              additionalProperties: false,
              required: ['ok', 'probe_id', 'proof_valid'],
              properties: {
                ok: { type: 'boolean' },
                probe_id: { type: 'string', format: 'uuid' },
                proof_valid: { type: 'boolean' },
              },
            },
          },
        },
      }
      options.mutateOpenApi?.(document)
      const body = JSON.stringify(document)
      response.writeHead(200, {
        'Content-Type': 'application/yaml; charset=utf-8',
        ...responseHeaders(options, 'openApi'),
      })
      response.end(body)
      return
    }

    if (request.method === 'GET' && request.url === `${ROUTE_PREFIX}/v1/probe`) {
      sendJson(response, 200, PROBE, responseHeaders(options, 'probe'))
      return
    }

    if (request.method === 'POST' && request.url === `${ROUTE_PREFIX}/v1/verify`) {
      let requestBody = ''
      for await (const chunk of request) {
        requestBody += chunk
      }
      if (request.headers['content-type'] !== 'application/json') {
        sendJson(response, 400, { error: 'invalid_control_request' })
        return
      }

      if (requestBody === JSON.stringify(PROBE)) {
        positiveVerifyCompleted = true
        sendJson(response, 200, {
          ok: true,
          probe_id: PROBE.probe_id,
          proof_valid: true,
        }, responseHeaders(options, 'verify'))
        return
      }

      let requestPayload
      try {
        requestPayload = JSON.parse(requestBody)
      } catch {
        sendJson(response, 400, { error: 'invalid_control_request' })
        return
      }
      if (!positiveVerifyCompleted
          || request.headers['x-regression-control-case'] !== NEGATIVE_VERIFY_CONTROL_CASE
          || !isSingleProofMutation(requestPayload)) {
        sendJson(response, 400, { error: 'invalid_negative_control_request' })
        return
      }

      const negativeVerifyPayload = options.negativeVerifyPayload ?? {
        ok: false,
        probe_id: PROBE.probe_id,
        proof_valid: false,
      }
      sendJson(
        response,
        options.negativeVerifyStatus ?? 200,
        negativeVerifyPayload,
        responseHeaders(options, 'negativeVerify'),
      )
      return
    }

    sendJson(response, 404, { error: 'not_found' })
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  baseUrl = `http://127.0.0.1:${address.port}${ROUTE_PREFIX}`

  return {
    baseUrl,
    async close() {
      const closed = new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
      })
      server.closeAllConnections()
      await closed
    },
  }
}

test('passes against the Spring-shaped base path and writes hash-verified evidence', async () => {
  const stub = await startStub()
  const evidenceDir = await mkdtemp(path.join(tmpdir(), 'skillpilot-action-control-'))
  try {
    const result = await runControl({
      baseUrl: stub.baseUrl,
      evidenceDir,
    })

    assert.equal(result.result, 'CONTROL_PASS')
    assert.equal(result.base_url, stub.baseUrl)
    assert.equal(result.health_status, 200)
    assert.equal(result.configured_openapi_status, 200)
    assert.equal(result.probe_status, 200)
    assert.equal(result.verify_status, 200)
    assert.equal(result.negative_verify_status, 200)
    assert.equal(result.application_id, APPLICATION_ID)
    assert.equal(result.hmac_key_id, HMAC_KEY_ID)
    assert.equal(result.probe_id, PROBE.probe_id)
    assert.equal(result.token, PROBE.token)
    assert.equal(result.health_request_id, REQUEST_IDS.health)
    assert.equal(result.configured_openapi_request_id, REQUEST_IDS.openApi)
    assert.equal(result.probe_request_id, REQUEST_IDS.probe)
    assert.equal(result.verify_request_id, REQUEST_IDS.verify)
    assert.equal(result.negative_verify_request_id, REQUEST_IDS.negativeVerify)
    assert.equal(result.negative_verify_control_case, NEGATIVE_VERIFY_CONTROL_CASE)
    assert.ok(result.negative_verify_duration_ms >= 0)

    const probeBody = await readFile(path.join(evidenceDir, 'control-probe.json'), 'utf8')
    const verifyRequestBody = await readFile(path.join(evidenceDir, 'control-verify-request.json'), 'utf8')
    const negativeVerifyRequestBody = await readFile(
      path.join(evidenceDir, 'control-negative-verify-request.json'),
      'utf8',
    )
    const negativeVerifyHeaders = await readFile(
      path.join(evidenceDir, 'control-negative-verify.headers.txt'),
      'utf8',
    )
    const negativeVerifyResponseBody = await readFile(
      path.join(evidenceDir, 'control-negative-verify.json'),
      'utf8',
    )
    const openApiBody = await readFile(path.join(evidenceDir, 'configured-openapi.yaml'), 'utf8')
    assert.equal(probeBody, JSON.stringify(PROBE))
    assert.equal(verifyRequestBody, JSON.stringify(PROBE))
    const negativeVerifyRequest = JSON.parse(negativeVerifyRequestBody)
    assert.equal(negativeVerifyRequest.probe_id, PROBE.probe_id)
    assert.equal(negativeVerifyRequest.token, PROBE.token)
    assert.match(negativeVerifyRequest.proof, /^[0-9a-f]{32}$/)
    assert.equal(proofCharacterDifferences(negativeVerifyRequest.proof, PROBE.proof), 1)
    assert.deepEqual(JSON.parse(negativeVerifyResponseBody), {
      ok: false,
      probe_id: PROBE.probe_id,
      proof_valid: false,
    })
    assert.match(negativeVerifyHeaders, /^HTTP status: 200$/m)
    assert.match(negativeVerifyHeaders, /^cache-control: no-store$/m)
    assert.match(
      negativeVerifyHeaders,
      new RegExp(`^x-regression-request-id: ${REQUEST_IDS.negativeVerify}$`, 'm'),
    )
    assert.equal(result.probe_response_sha256, sha256(probeBody))
    assert.equal(result.verify_request_sha256, sha256(verifyRequestBody))
    assert.equal(result.negative_verify_request_bytes, Buffer.byteLength(negativeVerifyRequestBody))
    assert.equal(result.negative_verify_request_sha256, sha256(negativeVerifyRequestBody))
    assert.equal(result.negative_verify_response_bytes, Buffer.byteLength(negativeVerifyResponseBody))
    assert.equal(result.negative_verify_response_sha256, sha256(negativeVerifyResponseBody))
    assert.equal(result.configured_openapi_sha256, sha256(openApiBody))

    const manifest = JSON.parse(await readFile(path.join(evidenceDir, 'evidence-manifest.json'), 'utf8'))
    for (const entry of manifest.files) {
      const content = await readFile(path.join(evidenceDir, entry.file), 'utf8')
      assert.equal(entry.bytes, Buffer.byteLength(content))
      assert.equal(entry.sha256, sha256(content))
    }
  } finally {
    await stub.close()
    await rm(evidenceDir, { recursive: true, force: true })
  }
})

test('rejects any non-200 response', async () => {
  const stub = await startStub({ healthStatus: 503 })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl }),
      /Health check failed with HTTP 503/,
    )
  } finally {
    await stub.close()
  }
})

test('requires a non-empty application_id in the health response', async () => {
  const stub = await startStub({ healthApplicationId: '   ' })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl }),
      /did not return a non-empty application_id/,
    )
  } finally {
    await stub.close()
  }
})

for (const invalidHmacKeyId of ['0123456789abcde', '0123456789abcdeg']) {
  test(`rejects invalid health hmac_key_id ${invalidHmacKeyId}`, async () => {
    const stub = await startStub({ healthHmacKeyId: invalidHmacKeyId })
    try {
      await assert.rejects(
        runControl({ baseUrl: stub.baseUrl }),
        /did not return a 16-character hexadecimal hmac_key_id/,
      )
    } finally {
      await stub.close()
    }
  })
}

test('keeps the 40-second production timeout configurable for a fast timeout test', async () => {
  const stub = await startStub({ timeoutPath: `${ROUTE_PREFIX}/healthz` })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl, requestTimeoutMs: 25 }),
      (error) => error?.name === 'TimeoutError' || /timeout|aborted/i.test(error?.message),
    )
  } finally {
    await stub.close()
  }
})

test('rejects an OpenAPI document for a different public base URL', async () => {
  const stub = await startStub({ openApiServerUrl: 'https://wrong.example.test/api/action-regression' })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl }),
      /OpenAPI server URL does not match the tested public URL/,
    )
  } finally {
    await stub.close()
  }
})

test('allows an explicit rendered OpenAPI base when testing a local backend', async () => {
  const renderedBaseUrl = 'https://skillpilot.com/api/action-regression'
  const stub = await startStub({ openApiServerUrl: renderedBaseUrl })
  try {
    const result = await runControl({
      baseUrl: stub.baseUrl,
      expectedOpenApiBaseUrl: renderedBaseUrl,
    })
    assert.equal(result.result, 'CONTROL_PASS')
  } finally {
    await stub.close()
  }
})

for (const responseName of Object.keys(REQUEST_IDS)) {
  test(`requires exact Cache-Control: no-store on the ${responseName} response`, async () => {
    const stub = await startStub({
      cacheControls: { [responseName]: 'no-store, no-cache' },
    })
    try {
      await assert.rejects(
        runControl({ baseUrl: stub.baseUrl }),
        /returned unexpected Cache-Control: no-store, no-cache/,
      )
    } finally {
      await stub.close()
    }
  })
}

for (const responseName of Object.keys(REQUEST_IDS)) {
  test(`requires X-Regression-Request-Id on the ${responseName} response`, async () => {
    const stub = await startStub({
      requestIds: { [responseName]: null },
    })
    try {
      await assert.rejects(
        runControl({ baseUrl: stub.baseUrl }),
        /is missing X-Regression-Request-Id/,
      )
    } finally {
      await stub.close()
    }
  })
}

test('requires all five X-Regression-Request-Id values to be unique', async () => {
  const stub = await startStub({
    requestIds: { negativeVerify: REQUEST_IDS.verify },
  })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl }),
      /returned duplicate X-Regression-Request-Id/,
    )
  } finally {
    await stub.close()
  }
})

test('rejects an accept-all verifier during the negative control', async () => {
  const stub = await startStub({
    negativeVerifyPayload: {
      ok: true,
      probe_id: PROBE.probe_id,
      proof_valid: true,
    },
  })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl }),
      /Negative verify control returned unexpected verification flags/,
    )
  } finally {
    await stub.close()
  }
})

test('rejects a stale verifier response during the negative control', async () => {
  const stub = await startStub({
    negativeVerifyPayload: {
      ok: false,
      probe_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      proof_valid: false,
    },
  })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl }),
      /Negative verify control returned a different probe_id/,
    )
  } finally {
    await stub.close()
  }
})

test('requires HTTP 200 from the negative verify control', async () => {
  const stub = await startStub({ negativeVerifyStatus: 201 })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl }),
      /Negative verify control failed with HTTP 201/,
    )
  } finally {
    await stub.close()
  }
})

const OPENAPI_CONTRACT_MUTATIONS = [
  {
    name: 'OpenAPI version',
    mutate: (document) => { document.openapi = '3.0.3' },
    error: /must declare openapi=3\.1\.0/,
  },
  {
    name: 'second server',
    mutate: (document) => { document.servers.push({ url: 'https://unexpected.example.test' }) },
    error: /must contain exactly one server/,
  },
  {
    name: 'top-level security',
    mutate: (document) => { document.security = [{ apiKey: [] }] },
    error: /top-level security must be exactly an empty array/,
  },
  {
    name: 'operation security',
    mutate: (document) => { document.paths['/v1/probe'].get.security = [{ apiKey: [] }] },
    error: /operation createRegressionProbe security must be exactly an empty array/,
  },
  {
    name: 'consequential operation',
    mutate: (document) => { document.paths['/v1/verify'].post['x-openai-isConsequential'] = true },
    error: /operation verifyRegressionProbe must set x-openai-isConsequential=false/,
  },
  {
    name: 'probe response reference',
    mutate: (document) => {
      document.paths['/v1/probe'].get.responses[200].content['application/json'].schema.$ref = '#/components/schemas/Other'
    },
    error: /probe HTTP 200 response must reference the Probe schema/,
  },
  {
    name: 'verify request reference',
    mutate: (document) => {
      document.paths['/v1/verify'].post.requestBody.content['application/json'].schema.$ref = '#/components/schemas/Other'
    },
    error: /verify requestBody must be required and reference the Probe schema/,
  },
  {
    name: 'optional verify request body',
    mutate: (document) => { document.paths['/v1/verify'].post.requestBody.required = false },
    error: /verify requestBody must be required and reference the Probe schema/,
  },
  {
    name: 'verify response reference',
    mutate: (document) => {
      document.paths['/v1/verify'].post.responses[200].content['application/json'].schema.$ref = '#/components/schemas/Other'
    },
    error: /verify HTTP 200 response must reference the VerificationResult schema/,
  },
  {
    name: 'Probe additional properties',
    mutate: (document) => { document.components.schemas.Probe.additionalProperties = true },
    error: /Probe schema must be an object with additionalProperties=false/,
  },
  {
    name: 'Probe required fields',
    mutate: (document) => { document.components.schemas.Probe.required.pop() },
    error: /Probe schema required does not contain exactly/,
  },
  {
    name: 'Probe extra property',
    mutate: (document) => { document.components.schemas.Probe.properties.extra = { type: 'string' } },
    error: /Probe schema properties does not contain exactly/,
  },
  {
    name: 'probe_id type',
    mutate: (document) => { document.components.schemas.Probe.properties.probe_id.type = 'number' },
    error: /Probe schema property probe_id has unexpected type/,
  },
  {
    name: 'probe_id format',
    mutate: (document) => { document.components.schemas.Probe.properties.probe_id.format = 'uri' },
    error: /Probe schema property probe_id has unexpected format/,
  },
  {
    name: 'probe_id pattern',
    mutate: (document) => { document.components.schemas.Probe.properties.probe_id.pattern = '^.*$' },
    error: /Probe schema property probe_id has unexpected pattern/,
  },
  {
    name: 'token pattern',
    mutate: (document) => { document.components.schemas.Probe.properties.token.pattern = '^SPREG-.*$' },
    error: /Probe schema property token has unexpected pattern/,
  },
  {
    name: 'proof pattern',
    mutate: (document) => { document.components.schemas.Probe.properties.proof.pattern = '^[0-9a-f]+$' },
    error: /Probe schema property proof has unexpected pattern/,
  },
  {
    name: 'VerificationResult additional properties',
    mutate: (document) => { document.components.schemas.VerificationResult.additionalProperties = true },
    error: /VerificationResult schema must be an object with additionalProperties=false/,
  },
  {
    name: 'VerificationResult required fields',
    mutate: (document) => { document.components.schemas.VerificationResult.required.shift() },
    error: /VerificationResult schema required does not contain exactly/,
  },
  {
    name: 'VerificationResult ok type',
    mutate: (document) => { document.components.schemas.VerificationResult.properties.ok.type = 'string' },
    error: /VerificationResult schema property ok has unexpected type/,
  },
  {
    name: 'VerificationResult probe_id format',
    mutate: (document) => { document.components.schemas.VerificationResult.properties.probe_id.format = 'uri' },
    error: /VerificationResult schema property probe_id has unexpected format/,
  },
  {
    name: 'VerificationResult proof_valid type',
    mutate: (document) => { document.components.schemas.VerificationResult.properties.proof_valid.type = 'string' },
    error: /VerificationResult schema property proof_valid has unexpected type/,
  },
  ...['example', 'examples', 'default'].map((key) => ({
    name: `forbidden ${key} key`,
    mutate: (document) => { document.info[key] = 'static-value' },
    error: new RegExp(`contains forbidden example/examples/default key at \\$.info.${key}`),
  })),
]

for (const contractMutation of OPENAPI_CONTRACT_MUTATIONS) {
  test(`rejects OpenAPI contract mutation: ${contractMutation.name}`, async () => {
    const stub = await startStub({ mutateOpenApi: contractMutation.mutate })
    try {
      await assert.rejects(
        runControl({ baseUrl: stub.baseUrl }),
        contractMutation.error,
      )
    } finally {
      await stub.close()
    }
  })
}

test('rejects an OpenAPI document with an additional path and operation', async () => {
  const stub = await startStub({
    mutateOpenApi(document) {
      document.paths['/v1/unexpected'] = { get: { operationId: 'unexpectedOperation' } }
    },
  })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl }),
      /does not contain exactly the two expected Action paths/,
    )
  } finally {
    await stub.close()
  }
})

test('rejects an additional HTTP operation on an expected OpenAPI path', async () => {
  const stub = await startStub({
    mutateOpenApi(document) {
      document.paths['/v1/probe'].post = {}
    },
  })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl }),
      /does not contain exactly the expected GET operation/,
    )
  } finally {
    await stub.close()
  }
})

test('rejects any additional operationId outside the two expected operations', async () => {
  const stub = await startStub({
    mutateOpenApi(document) {
      document.info = { operationId: 'unexpectedOperationId' }
    },
  })
  try {
    await assert.rejects(
      runControl({ baseUrl: stub.baseUrl }),
      /does not contain exactly the two expected operationIds/,
    )
  } finally {
    await stub.close()
  }
})
