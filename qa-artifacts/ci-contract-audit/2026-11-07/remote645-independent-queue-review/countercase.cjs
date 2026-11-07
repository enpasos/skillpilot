const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('/home/enpasos/projects/skillpilot/app/node_modules/typescript');
const file = '/dev/shm/skillpilot-remote645-fixes-zudo1f92/app/src/views/LearnerView.tsx';
const source = fs.readFileSync(file, 'utf8');
const prefix = 'const handleSseUpdate = useCallback(';
const start = source.indexOf(prefix) + prefix.length;
assert.ok(start >= prefix.length);
const end = source.indexOf('\n  }, [learnerStateScopeKey, refreshPreferences', start);
assert.ok(end > start);
const callback = source.slice(start, end) + '\n  }';
const names = ['learnerStateScopeKey', 'preferenceSaveRefreshRef', 'refreshPreferences', 'refreshState', 'refreshLearningPlans', 'onRefresh', 'dispatchLearnerUiRefresh', 'skillpilotId', 'setSrsMasteryTick', 'currentGoal', 'setSrsReloadCounter', 'isActiveGoalRevealEventType', 'forceActiveGoalRevealRef', 'fullRefreshInFlightRef', 'lastFullRefreshAtRef', 'pendingFullRefreshRef', 'fullRefreshTimerRef', 'currentLearnerStateScopeKeyRef'];
const text = `export function make(deps: any) { const { ${names.join(', ')} } = deps; return ${callback}; }`;
const compiled = ts.transpileModule(text, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
const moduleExports = {};
new Function('exports', compiled)(moduleExports);
const ref = current => ({current});
const shared = {
 preferenceSaveRefreshRef: ref(null), refreshPreferences: async () => {}, refreshLearningPlans: async () => {},
 onRefresh: undefined, dispatchLearnerUiRefresh: () => {}, setSrsMasteryTick: () => {}, currentGoal: null,
 setSrsReloadCounter: () => {}, isActiveGoalRevealEventType: () => false, forceActiveGoalRevealRef: ref(false),
 fullRefreshInFlightRef: ref(false), lastFullRefreshAtRef: ref(0), pendingFullRefreshRef: ref(null),
 fullRefreshTimerRef: ref(null), currentLearnerStateScopeKeyRef: ref('A'),
};
(async () => {
 let releaseA;
 const awaitingA = new Promise(resolve => { releaseA = resolve; });
 let bRequests = 0;
 const a = moduleExports.make({...shared, learnerStateScopeKey:'A', skillpilotId:'A', refreshState: () => awaitingA});
 const aWork = a({type:'FULL_REFRESH'});
 assert.equal(shared.fullRefreshInFlightRef.current, true);
 shared.currentLearnerStateScopeKeyRef.current = 'B';
 // Exact cleanup effects before a new-scope event: discard old pending work.
 if (shared.fullRefreshTimerRef.current !== null) clearTimeout(shared.fullRefreshTimerRef.current);
 shared.fullRefreshTimerRef.current = null;
 shared.pendingFullRefreshRef.current = null;
 const b = moduleExports.make({...shared, learnerStateScopeKey:'B', skillpilotId:'B', refreshState: async () => { bRequests++; }});
 await b({type:'FULL_REFRESH'});
 assert.ok(shared.pendingFullRefreshRef.current, 'B event really queued during A request');
 releaseA();
 await aWork;
 assert.equal(bRequests, 0, 'Current candidate consumes new-scope event in old-scope finally');
 assert.equal(shared.pendingFullRefreshRef.current, null);
 assert.equal(shared.fullRefreshTimerRef.current, null);
 console.log(JSON.stringify({kind:'native-extracted-production-callback-countercase', candidateSha256:crypto.createHash('sha256').update(source).digest('hex'), callbackSha256:crypto.createHash('sha256').update(callback).digest('hex'), oldScope:'A', currentScope:'B', queuedBEvent:true, actualBRefreshRequests:bRequests, expectedBRefreshRequests:1, result:'candidate-does-not-retain-current-scope-event', limits:'Actual candidate callback executed with deferred native promises and actual documented cleanup; this is not a browser lifecycle acceptance run.'}, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
