import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { OPENAI_PLUGIN } from './lib/openai_plugin_config.mjs'
import { bindDialogSubmissionPackage, childEnvironment } from './openai_dialog_eval.mjs'
import { runLiveJourneyTurn } from './openai_live_journey_turn.mjs'

const packaged = bindDialogSubmissionPackage()
const contract = JSON.parse(readFileSync(new URL(`../${packaged.report.sourceBindings.contractPath}`, import.meta.url)))
const config = JSON.parse(readFileSync(new URL('./config/openai-dialog-eval.json', import.meta.url)))
const contextTool = 'get_skillpilot_context'
const masteryTool = 'set_skillpilot_mastery'
const testSession = `sps_${'J'.repeat(43)}`
const testToken = `oauth-test-only-${'L'.repeat(64)}`
const orientationGoalId = 'orientation-opaque-id'
const orientationPathId = 'path-opaque-id'
const driver = fileURLToPath(new URL('./openai_live_journey_turn.mjs', import.meta.url))

async function localFixture(t, { redirect = false } = {}) {
  const requests = []
  let persisted = false
  const server = createServer(async (request, response) => {
    try {
      assert.equal(request.method, 'POST')
      assert.equal(request.url, '/internal/openai/v1/mcp')
      assert.equal(request.headers.authorization, `Bearer ${testToken}`)
      assert.equal(request.headers['mcp-protocol-version'], '2025-11-25')
      assert.equal(request.headers.accept, 'application/json, text/event-stream')
      const chunks = []
      for await (const chunk of request) chunks.push(chunk)
      const { jsonrpc, id, method, params } = JSON.parse(Buffer.concat(chunks))
      assert.equal(jsonrpc, '2.0')
      requests.push(params.name ?? method)
      if (redirect) {
        response.writeHead(307, { location: '/unexpected-redirect' }).end()
        return
      }
      let result
      if (method === 'initialize') result = { serverInfo: { name: OPENAI_PLUGIN.identity }, instructions: contract.serverInstructions.trimEnd() }
      else if (method === 'tools/list') result = { tools: contract.tools.map(({ meta, ...tool }) => ({ ...tool, _meta: meta })) }
      else if (params.name === contextTool) {
        assert.deepEqual(params.arguments, { learningSessionId: testSession })
        result = { isError: false, structuredContent: {
          interactionMode: 'orientation', activeGoal: { goalId: orientationGoalId }, stateVersion: 9,
          orientationOutlook: { paths: [{ pathId: orientationPathId, title: 'Raum und lineare Algebra' }] },
          syntheticEcho: [testSession, testToken],
        }, _meta: { applicationOnly: 'private-widget-sentinel' } }
      } else {
        assert.equal(params.name, masteryTool)
        assert.equal(params.arguments.learningSessionId, testSession)
        assert.equal(params.arguments.goalId, orientationGoalId)
        assert.equal(params.arguments.orientationPathId, orientationPathId)
        assert.equal(params.arguments.expectedStateVersion, 9)
        assert.equal(persisted, false)
        persisted = true
        result = { isError: false, structuredContent: { status: 'updated', savedGoalId: orientationGoalId,
          savedMastery: 1, stateVersion: 10, context: { syntheticEcho: [testSession, testToken], frontier: [{ goalId: 'next' }] } } }
      }
      response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ jsonrpc, id, result }))
    } catch {
      response.writeHead(500).end()
    }
  })
  await new Promise((ready, fail) => server.once('error', fail).listen(0, '127.0.0.1', ready))
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections() }))
  const fixture = { port: server.address().port, learningSessionId: testSession, accessToken: testToken, orientationGoalId, orientationPathId,
    priorConversation: [{ role: 'assistant', content: 'Du interessierst dich für Raum und lineare Algebra. Damit ist deine Orientierung abgeschlossen. Möchtest du sie abschließen?' }],
    learnerMessage: 'Ja, bitte schließe die Orientierung mit Raum und linearer Algebra ab. Danach möchte ich pausieren.' }
  return { fixture, requests, didPersist: () => persisted }
}

test('the exact ZIP CLI rehearses two decisions over four loopback requests and emits only sanitized JSON', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'skillpilot-live-turn-'))
  t.after(() => rmSync(directory, { recursive: true, force: true }))
  const exporter = fileURLToPath(new URL('./openai_plugin_submission.mjs', import.meta.url))
  const build = spawnSync(process.execPath, [exporter, 'package', '--out-dir', directory], { env: childEnvironment(), encoding: 'utf8' })
  assert.equal(build.status, 0, build.stderr)
  const { fixture, requests, didPersist } = await localFixture(t)
  const child = spawn(process.execPath, [driver, '--zip', join(directory, packaged.report.archiveName), '--rehearse'], { env: childEnvironment() })
  child.stdin.end(JSON.stringify(fixture))
  let stdout = '', stderr = ''
  child.stdout.on('data', chunk => { stdout += chunk })
  child.stderr.on('data', chunk => { stderr += chunk })
  const exitCode = await new Promise((finished, fail) => child.once('error', fail).once('close', finished))
  assert.equal(exitCode, 0, stderr)
  assert.equal(stderr, '')
  assert.equal(stdout.trim().split('\n').length, 1)
  assert.ok(!stdout.includes(testSession) && !stdout.includes(testToken))
  const receipt = JSON.parse(stdout)
  assert.deepEqual({ ...receipt, result: undefined }, { status: 'passed', mode: 'rehearsed', modelRequests: 0,
    actorDecisions: 2, toolCalls: 2, contextCalls: 1, masteryCalls: 1, result: undefined })
  assert.deepEqual(receipt.result.structuredContent.context.frontier, [{ goalId: 'next' }])
  assert.deepEqual(requests, ['initialize', 'tools/list', contextTool, masteryTool])
  assert.equal(didPersist(), true)
})

test('direct CLI model mode requires a local run and explicitly supplied evaluation key', () => {
  const args = [driver, '--zip', 'unused.zip', '--model']
  const env = childEnvironment()
  const cliUnderCi = spawnSync(process.execPath, args, { env: { ...env, CI: 'true', OPENAI_EVAL_API_KEY: testToken }, encoding: 'utf8' })
  assert.equal(cliUnderCi.status, 1)
  assert.equal(cliUnderCi.stdout, '')
  assert.equal(cliUnderCi.stderr.trim(), 'The opt-in model turn runs locally')
  const cliWithoutKey = spawnSync(process.execPath, args, { env, encoding: 'utf8' })
  assert.equal(cliWithoutKey.status, 1)
  assert.equal(cliWithoutKey.stdout, '')
  assert.equal(cliWithoutKey.stderr.trim(), 'Missing dedicated OPENAI_EVAL_API_KEY for the opt-in model turn')
})

test('no write is dispatched when the actor chooses the wrong orientation path', async t => {
  const { fixture, requests, didPersist } = await localFixture(t)
  const client = { async respond(payload, phase) {
    const serialized = JSON.stringify(payload)
    assert.ok(!serialized.includes(testToken) && !serialized.includes(testSession) && !serialized.includes('private-widget-sentinel'))
    assert.equal(payload.tool_choice, 'auto')
    assert.equal(payload.tools.some(tool => tool.name === 'review_skillpilot_memory_practice_card'), false)
    const alias = payload.input[0].content.split('learningSessionId: ')[1]
    let args = { learningSessionId: alias }
    if (phase === 'context') assert.ok(!serialized.includes(orientationGoalId) && !serialized.includes(orientationPathId))
    else {
      const context = JSON.parse(payload.input.at(-1).output).structuredContent
      assert.deepEqual(context.syntheticEcho, [alias, '[REDACTED]'])
      args = { ...args, goalId: context.activeGoal.goalId, orientationPathId: 'chosen-wrong-path',
        expectedStateVersion: context.stateVersion, clientRequestId: randomUUID() }
    }
    return { output: [{ type: 'function_call', name: phase === 'context' ? contextTool : masteryTool,
      arguments: JSON.stringify(args), call_id: phase }] }
  } }
  await assert.rejects(runLiveJourneyTurn(fixture, { packaged, contract, config, mode: 'model', client }), /did not copy the confirmed orientation/u)
  assert.deepEqual(requests, ['initialize', 'tools/list', contextTool])
  assert.equal(didPersist(), false)
})

test('assistant text can accompany the expected tool but additional calls and refusals fail before a write', async t => {
  for (const kind of ['text', 'additional call', 'refusal']) {
    await t.test(kind, async t => {
      const { fixture, requests, didPersist } = await localFixture(t)
      const client = { async respond(payload, phase) {
        const alias = payload.input[0].content.split('learningSessionId: ')[1]
        let args = { learningSessionId: alias }
        const name = phase === 'context' ? contextTool : masteryTool
        if (phase === 'mastery') {
          const latest = JSON.parse(payload.input.at(-1).output).structuredContent
          Object.assign(args, { goalId: latest.activeGoal.goalId, orientationPathId: latest.orientationOutlook.paths[0].pathId,
            expectedStateVersion: latest.stateVersion, clientRequestId: randomUUID() })
        }
        const call = { type: 'function_call', name, arguments: JSON.stringify(args), call_id: phase }
        const message = { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'Ich prüfe das.' }] }
        if (phase === 'mastery' && kind === 'additional call') return { output: [message, call, { ...call, call_id: 'extra' }] }
        if (phase === 'mastery' && kind === 'refusal') {
          return { output: [call, { ...message, content: [{ type: 'refusal', refusal: 'Ich kann das nicht tun.' }] }] }
        }
        return { output: [message, call] }
      } }
      const turn = runLiveJourneyTurn(fixture, { packaged, contract, config, mode: 'model', client })
      if (kind === 'text') {
        const receipt = await turn
        assert.equal(receipt.modelRequests, 2)
        assert.equal(receipt.result.structuredContent.status, 'updated')
        assert.ok(!JSON.stringify(receipt).includes('Ich prüfe das.'))
        assert.deepEqual(requests, ['initialize', 'tools/list', contextTool, masteryTool])
      } else {
        await assert.rejects(turn, /Expected a single model-selected set_skillpilot_mastery call/u)
        assert.deepEqual(requests, ['initialize', 'tools/list', contextTool])
      }
      assert.equal(didPersist(), kind === 'text')
    })
  }
})

test('a loopback redirect is rejected before credentials can be sent to its destination', async t => {
  const { fixture, requests, didPersist } = await localFixture(t, { redirect: true })
  await assert.rejects(runLiveJourneyTurn(fixture, { packaged, contract, config, mode: 'rehearsed' }))
  assert.deepEqual(requests, ['initialize'])
  assert.equal(didPersist(), false)
})
