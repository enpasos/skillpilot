// SPDX-License-Identifier: Apache-2.0
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, chmod } from 'node:fs/promises';
import { join } from 'node:path';

const HOUR = 60 * 60 * 1000;
const hash = value => createHash('sha256').update(value).digest('hex');
const capability = () => randomBytes(32).toString('base64url');

export class PocError extends Error {
  constructor(code) { super(code); this.code = code; }
}

// Disposable connectivity markers only. This store never loads learner data,
// curricula, chat answers, or the production CoachToolFacade.
export class ProbeStore {
  constructor({ dataDir, now = Date.now }) {
    this.dataDir = dataDir;
    this.now = now;
    this.state = { version: 1, sessions: {} };
    this.ready = this.initialize();
    this.queue = Promise.resolve();
  }

  async initialize() {
    await mkdir(this.dataDir, { recursive: true, mode: 0o700 });
    const path = join(this.dataDir, 'probe-state.json');
    try {
      const state = JSON.parse(await readFile(path, 'utf8'));
      if (state.version !== 1 || !state.sessions || typeof state.sessions !== 'object') {
        throw new Error('Unsupported probe state');
      }
      this.state = state;
      await chmod(path, 0o600);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }

  async run(operation) {
    const result = this.queue.then(() => this.ready).then(operation);
    this.queue = result.then(() => undefined, () => undefined);
    // Failed operations release the lock; failed initialization stays closed.
    return result;
  }

  async save(next) {
    const target = join(this.dataDir, 'probe-state.json');
    const temporary = `${target}.${randomBytes(6).toString('hex')}.tmp`;
    await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o600, flag: 'wx' });
    await rename(temporary, target);
    this.state = next;
  }

  async createSession() {
    return this.run(async () => {
      const probeSessionId = `gp_${capability()}`;
      const expiresAt = this.now() + 24 * HOUR;
      const next = structuredClone(this.state);
      next.sessions[hash(probeSessionId)] = {
        expiresAt, stateVersion: 0, completed: false,
        completionCapability: capability(), receipt: null
      };
      // Bounded disposable storage. Live sessions are never evicted.
      for (const [key, entry] of Object.entries(next.sessions)) {
        if (entry.expiresAt <= this.now()) delete next.sessions[key];
      }
      if (Object.keys(next.sessions).length > 100) throw new PocError('SESSION_LIMIT');
      await this.save(next);
      return {
        probeSessionId, expiresAt: new Date(expiresAt).toISOString(),
        startPrompt: `Use the connected SkillPilot Gemini PoC custom app. This is a synthetic connectivity test, not a learning session. Call get_skillpilot_poc_context with the unchanged private probeSessionId below. Ask me before recording the synthetic completion marker; wait for my answer and Gemini's write confirmation. After a successful save, report only the server-confirmed synthetic result. Keep the capability values private.\n\nPrivate technical test reference: probeSessionId=${probeSessionId}`
      };
    });
  }

  session(id) {
    if (typeof id !== 'string' || !/^gp_[A-Za-z0-9_-]{43}$/.test(id)) throw new PocError('SESSION_REQUIRED');
    const session = this.state.sessions[hash(id)];
    if (!session || session.expiresAt <= this.now()) throw new PocError('SESSION_REQUIRED');
    if (session.expiresAt - this.now() < HOUR) throw new PocError('SESSION_RENEWAL_REQUIRED');
    return session;
  }

  async getContext(id) {
    return this.run(() => {
      const session = this.session(id);
      return {
        syntheticOnly: true, stateVersion: session.stateVersion, completed: session.completed,
        ...(session.completed ? {} : { completionCapability: session.completionCapability }),
        instruction: session.completed
          ? 'The synthetic completion marker is saved. This does not represent SkillPilot learning progress.'
          : 'Ask whether the operator wants to save the synthetic test marker and wait. After agreement, use the unchanged completionCapability. Gemini must also request its write approval.'
      };
    });
  }

  async complete(id, submitted) {
    return this.run(async () => {
      const session = this.session(id);
      if (typeof submitted !== 'string' || Buffer.byteLength(submitted) !== Buffer.byteLength(session.completionCapability) ||
          !timingSafeEqual(Buffer.from(submitted), Buffer.from(session.completionCapability))) {
        throw new PocError('INVALID_CAPABILITY');
      }
      if (session.completed) return structuredClone(session.receipt);
      const next = structuredClone(this.state);
      const updated = next.sessions[hash(id)];
      updated.completed = true;
      updated.stateVersion += 1;
      updated.receipt = {
        syntheticOnly: true, saved: true, completed: true,
        stateVersion: updated.stateVersion, savedAt: new Date(this.now()).toISOString()
      };
      await this.save(next);
      return structuredClone(updated.receipt);
    });
  }
}
