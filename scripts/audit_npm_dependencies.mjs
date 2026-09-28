#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_ATTEMPTS = 3;
const AUDIT_ENDPOINT = /\/-\/npm\/v1\/security\/(?:advisories\/bulk|audits\/quick)(?:\?|$)/;

// npm 10 can fall back to the legacy quick endpoint when the bulk endpoint fails.
// Retry endpoint failures only; a vulnerability report must fail immediately.
function isAuditEndpointError(output) {
  try {
    const report = JSON.parse(output);
    return report?.auditReportVersion === undefined
      && typeof report?.uri === 'string'
      && AUDIT_ENDPOINT.test(report.uri)
      && report.error !== undefined;
  } catch {
    return false;
  }
}

export async function auditNpmDependencies(directory, {
  env = process.env,
  sleep = (ms) => new Promise((done) => setTimeout(done, ms)),
  writeOut = (value) => process.stdout.write(value),
  writeErr = (value) => process.stderr.write(value),
} = {}) {
  const args = ['--prefix', resolve(directory), 'audit', '--audit-level=moderate', '--json'];
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const result = spawnSync(npm, args, { encoding: 'utf8', env });
    if (result.status === 0) {
      if (result.stdout) writeOut(result.stdout);
      if (result.stderr) writeErr(result.stderr);
      return 0;
    }

    if (!result.error && isAuditEndpointError(result.stdout) && attempt < MAX_ATTEMPTS) {
      writeErr(`npm audit registry endpoint failed (attempt ${attempt}/${MAX_ATTEMPTS}); retrying.\n`);
      await sleep(5000 * attempt);
      continue;
    }

    if (result.stdout) writeOut(result.stdout);
    if (result.stderr) writeErr(result.stderr);
    if (result.error) writeErr(`Could not start npm audit: ${result.error.message}\n`);
    if (!result.error && isAuditEndpointError(result.stdout)) {
      writeErr(`npm audit registry endpoint failed after ${MAX_ATTEMPTS} attempts.\n`);
    }
    return result.status || 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) {
    process.stderr.write('Usage: node scripts/audit_npm_dependencies.mjs <npm-package-directory>\n');
    process.exitCode = 2;
  } else {
    process.exitCode = await auditNpmDependencies(process.argv[2]);
  }
}
