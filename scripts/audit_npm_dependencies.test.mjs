import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { auditNpmDependencies } from './audit_npm_dependencies.mjs';

const fakeNpm = `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
const calls = process.env.AUDIT_FAKE_CALLS;
const count = fs.existsSync(calls) ? fs.readFileSync(calls, 'utf8').trim().split('\\n').length : 0;
fs.appendFileSync(calls, JSON.stringify(args) + '\\n');
if (process.env.AUDIT_FAKE_CASE === 'endpoint-once' && count === 1) {
  console.log(JSON.stringify({ auditReportVersion: 2, vulnerabilities: {}, metadata: { vulnerabilities: { moderate: 0 } } }));
  process.exit(0);
}
if (process.env.AUDIT_FAKE_CASE === 'vulnerabilities') {
  console.log(JSON.stringify({ auditReportVersion: 2, vulnerabilities: { example: { severity: 'moderate' } }, metadata: { vulnerabilities: { moderate: 1 } } }));
  process.exit(1);
}
console.log(JSON.stringify({
  message: '400 Bad Request - POST https://registry.npmjs.org/-/npm/v1/security/audits/quick',
  method: 'POST',
  uri: 'https://registry.npmjs.org/-/npm/v1/security/audits/quick',
  statusCode: 400,
  error: { summary: '', detail: '' },
}));
process.exit(1);
`;

async function withFakeNpm(scenario, verify) {
  const directory = await mkdtemp(join(tmpdir(), 'skillpilot-audit-test-'));
  try {
    const bin = join(directory, 'bin');
    const app = join(directory, 'app');
    const calls = join(directory, 'calls.jsonl');
    await mkdir(bin);
    await mkdir(app);
    await writeFile(join(bin, 'npm'), fakeNpm);
    await chmod(join(bin, 'npm'), 0o755);

    const output = [];
    const errors = [];
    const delays = [];
    const exitCode = await auditNpmDependencies(app, {
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        AUDIT_FAKE_CASE: scenario,
        AUDIT_FAKE_CALLS: calls,
      },
      sleep: async (ms) => { delays.push(ms); },
      writeOut: (value) => { output.push(value); },
      writeErr: (value) => { errors.push(value); },
    });
    const invokedWith = (await readFile(calls, 'utf8')).trim().split('\n').map(JSON.parse);
    for (const args of invokedWith) {
      assert.deepEqual(args, ['--prefix', app, 'audit', '--audit-level=moderate', '--json']);
    }
    verify({ exitCode, invokedWith, delays, output: output.join(''), errors: errors.join('') });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('retries a registry audit endpoint error and succeeds when the endpoint recovers', async () => {
  await withFakeNpm('endpoint-once', ({ exitCode, invokedWith, delays, output, errors }) => {
    assert.equal(exitCode, 0);
    assert.equal(invokedWith.length, 2);
    assert.deepEqual(delays, [5000]);
    assert.match(output, /"auditReportVersion":2/);
    assert.match(errors, /attempt 1\/3/);
  });
});

test('does not retry a real vulnerability report', async () => {
  await withFakeNpm('vulnerabilities', ({ exitCode, invokedWith, delays, output }) => {
    assert.equal(exitCode, 1);
    assert.equal(invokedWith.length, 1);
    assert.deepEqual(delays, []);
    assert.match(output, /"severity":"moderate"/);
  });
});

test('fails closed after three registry audit endpoint errors', async () => {
  await withFakeNpm('endpoint-always', ({ exitCode, invokedWith, delays, errors }) => {
    assert.equal(exitCode, 1);
    assert.equal(invokedWith.length, 3);
    assert.deepEqual(delays, [5000, 10000]);
    assert.match(errors, /failed after 3 attempts/);
  });
});
