const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('/home/enpasos/projects/skillpilot/app/node_modules/typescript');
const file = process.argv[2] || '/dev/shm/skillpilot-remote645-scope-safe-6ohwblvg/app/src/views/LearnerView.tsx';
const source = fs.readFileSync(file, 'utf8');
const prefix = 'const handleSseUpdate = useCallback(';
const start = source.indexOf(prefix) + prefix.length;
const end = source.indexOf('\n  }, [learnerStateScopeKey, refreshPreferences', start);
assert.ok(start >= prefix.length && end > start);
const callback = source.slice(start, end) + '\n  }';
const cleanupPrefix = 'useEffect(() => () => {\n    if (fullRefreshTimerRef.current !== null)';
const cleanupStart = source.indexOf(cleanupPrefix) + 'useEffect(() => () => {'.length;
const cleanupEnd = source.indexOf('\n  }, [learnerStateScopeKey])', cleanupStart);
assert.ok(cleanupStart > 0 && cleanupEnd > cleanupStart);
const cleanup = source.slice(cleanupStart, cleanupEnd);
const names = ['learnerStateScopeKey', 'preferenceSaveRefreshRef', 'refreshPreferences', 'refreshState', 'refreshLearningPlans', 'onRefresh', 'dispatchLearnerUiRefresh', 'skillpilotId', 'setSrsMasteryTick', 'currentGoal', 'setSrsReloadCounter', 'isActiveGoalRevealEventType', 'forceActiveGoalRevealRef', 'fullRefreshInFlightRef', 'lastFullRefreshAtRef', 'pendingFullRefreshRef', 'fullRefreshTimerRef', 'currentLearnerStateScopeKeyRef', 'setTimeout', 'clearTimeout', 'Date'];
const compiled = ts.transpileModule(`export function make(deps: any) { const { ${names.join(', ')} } = deps; return ${callback}; }\nexport function cleanup(deps: any) { const { ${names.join(', ')} } = deps; ${cleanup}\n}`, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
const api = {};
new Function('exports', compiled)(api);
const ref = current => ({current});
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return {promise, resolve}; };
const settled = () => new Promise(done => setImmediate(done));
const shared = () => ({
 preferenceSaveRefreshRef: ref(null), refreshPreferences: async () => {}, refreshLearningPlans: async () => {},
 onRefresh: undefined, uiRefreshes: [], dispatchLearnerUiRefresh: undefined, setSrsMasteryTick: () => {}, currentGoal: null,
 setSrsReloadCounter: () => {}, isActiveGoalRevealEventType: () => false, forceActiveGoalRevealRef: ref(false),
 fullRefreshInFlightRef: ref(false), lastFullRefreshAtRef: ref(0), pendingFullRefreshRef: ref(null),
 fullRefreshTimerRef: ref(null), currentLearnerStateScopeKeyRef: ref('A'), setTimeout, clearTimeout, Date,
});
(async () => {
 const s = shared(); s.dispatchLearnerUiRefresh = value => s.uiRefreshes.push(value.skillpilotId);
 const heldA = deferred(); let bRequests = 0;
 const a = api.make({...s, learnerStateScopeKey:'A', skillpilotId:'A', refreshState: () => heldA.promise});
 const aWork = a({type:'FULL_REFRESH'});
 assert.equal(s.fullRefreshInFlightRef.current, true);
 s.currentLearnerStateScopeKeyRef.current = 'B'; api.cleanup(s);
 const b = api.make({...s, learnerStateScopeKey:'B', skillpilotId:'B', refreshState: async () => { bRequests++; }});
 await b({type:'FULL_REFRESH'});
 assert.equal(s.pendingFullRefreshRef.current.scopeKey, 'B');
 heldA.resolve(); await aWork; await settled();
 assert.equal(bRequests, 1, 'A finally drains B through the B continuation');
 assert.equal(s.pendingFullRefreshRef.current, null); assert.equal(s.fullRefreshTimerRef.current, null);
 assert.deepEqual(s.uiRefreshes, ['B'], 'old A completion cannot publish a UI refresh after B becomes current');
 // A timer callback can already be runnable when cleanup cancels its handle.
 // Invoke that obsolete native callback while B owns pending work.
 const t = shared(); const timers = []; let clock = 1000; let timerBRequests = 0;
 t.Date = {now: () => clock};
 t.setTimeout = (run, delay) => { const timer = {run, delay}; timers.push(timer); return timer; };
 t.clearTimeout = () => {}; t.dispatchLearnerUiRefresh = value => t.uiRefreshes.push(value.skillpilotId);
 const timerA = api.make({...t, learnerStateScopeKey:'A', skillpilotId:'A', refreshState: async () => {}});
 await timerA({type:'FULL_REFRESH'}); await timerA({type:'FULL_REFRESH'});
 const obsoleteTimer = t.fullRefreshTimerRef.current; assert.ok(obsoleteTimer);
 t.currentLearnerStateScopeKeyRef.current = 'B'; api.cleanup(t); t.uiRefreshes.length = 0;
 const heldB = deferred();
 const timerB = api.make({...t, learnerStateScopeKey:'B', skillpilotId:'B', refreshState: () => { timerBRequests++; return heldB.promise; }});
 const bWork = timerB({type:'FULL_REFRESH'}); await timerB({type:'FULL_REFRESH'});
 const pendingB = t.pendingFullRefreshRef.current; assert.equal(pendingB.scopeKey, 'B');
 obsoleteTimer.run();
 assert.equal(t.pendingFullRefreshRef.current, pendingB, 'obsolete A timer cannot consume pending B work');
 heldB.resolve(); await bWork; await settled();
 const currentTimer = t.fullRefreshTimerRef.current; assert.ok(currentTimer);
 clock += 800; currentTimer.run(); await settled();
 assert.equal(timerBRequests, 2, 'B receives the initial and one coalesced trailing refresh');
 assert.equal(t.pendingFullRefreshRef.current, null); assert.equal(t.fullRefreshTimerRef.current, null);
 assert.equal(t.fullRefreshInFlightRef.current, false); assert.deepEqual(t.uiRefreshes, ['B', 'B']);
 console.log(JSON.stringify({kind:'actual-production-callback-and-cleanup-native-countercases', candidateSha256:crypto.createHash('sha256').update(source).digest('hex'), callbackSha256:crypto.createHash('sha256').update(callback).digest('hex'), AInFlightThenB:{BRequests:bRequests,pending:null,timer:null,uiRefreshes:s.uiRefreshes}, obsoleteATimerThenB:{BRequests:timerBRequests,pending:null,timer:null,uiRefreshes:t.uiRefreshes}, result:'pass', limits:'Actual callbacks and cleanup extracted and transpiled; native promise scheduling, controlled timer scheduling for the obsolete-timer case. Browser lifecycle validation is separate.'}, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
