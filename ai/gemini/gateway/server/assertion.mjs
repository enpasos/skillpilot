// SPDX-License-Identifier: Apache-2.0
import { createHash, createHmac, randomBytes } from 'node:crypto';

export function createGatewayAssertion({ secret, audience, connectionId, scopes, body, now = Date.now }) {
  if (typeof secret !== 'string' || Buffer.byteLength(secret) < 32) throw new Error('Independent gateway secret required');
  if (!/^[a-f0-9]{64}$/.test(connectionId)) throw new Error('Invalid connection binding');
  const issued = Math.floor(now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: 'skillpilot-gemini-gateway-v1', aud: audience, sub: `spga_${connectionId}`,
    iat: issued, exp: issued + 30, jti: randomBytes(32).toString('base64url'),
    method: 'POST', path: '/gemini/v1/mcp',
    body: createHash('sha256').update(body).digest('hex'), scopes,
  })).toString('base64url');
  const signature = createHmac('sha256', secret).update(`sgw1.${payload}`).digest('hex');
  return `sgw1.${payload}.${signature}`;
}
