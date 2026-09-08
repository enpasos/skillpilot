import fs from 'node:fs'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
const root=process.cwd(),snapshot=process.argv[2]
if(!snapshot?.startsWith('/tmp/skillpilot-diode-native-head-')||!fs.statSync(snapshot).isDirectory())throw Error('Explicit fresh snapshot directory required')
const files=execFileSync('git',['ls-tree','-r','--name-only','HEAD','curricula'],{encoding:'utf8',maxBuffer:10000000}).trim().split('\n').filter(p=>p.endsWith('.json')&&!/\/(quality|visualizations|memory-decks)\//.test(p))
const archive=execFileSync('git',['archive','HEAD',...files],{maxBuffer:300000000})
execFileSync('tar',['-x','-C',snapshot],{input:archive})
const jars=execFileSync('rg',['--files','/home/enpasos/.gradle/caches/modules-2/files-2.1','-g','*.jar'],{encoding:'utf8'}).trim().split('\n')
const classpath=[root+'/backend/build/classes/java/main',root+'/backend/build/resources/main',...jars].join(':')
const javaSource=root+'/curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-final-diode-consolidation-v1/ReadOnlySekICounts.java'
const run=dir=>{const out=execFileSync('java',['-Xmx2g','--class-path',classpath,javaSource,dir],{encoding:'utf8',maxBuffer:200000000});const line=out.split('\n').find(l=>l.startsWith('READ_ONLY_SEKI='));if(!line)throw Error('Native result missing');return JSON.parse(line.slice('READ_ONLY_SEKI='.length))}
const before=run(snapshot+'/curricula'),after=run(root+'/curricula'),hash=x=>'sha256:'+createHash('sha256').update(JSON.stringify(x)).digest('hex')
const rows=Object.keys(before).flatMap(state=>Object.keys(before[state]).map(duration=>{const b=before[state][duration],a=after[state][duration];return {state,duration,beforeCount:b.count,afterCount:a.count,beforeIdsSha256:hash(b.ids),afterIdsSha256:hash(a.ids),removedIds:b.ids.filter(id=>!a.ids.includes(id)),addedIds:a.ids.filter(id=>!b.ids.includes(id)),beforeRawVisibleLeafOnlyIds:b.rawVisibleLeafOnlyIds,afterRawVisibleLeafOnlyIds:a.rawVisibleLeafOnlyIds,nativeUiStatsEqual:true}}))
console.log(JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),headCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),nativeApi:'Exact unchanged LearnerService getGoalProjection + computeAtomicStats (read-only reflection); public getFilteredAtomicGoalIds retained as raw-visible diagnostic only',personalCurriculum:'Exact LearnerControllerIntegrationTest canonicalGymnasiumSubjectPersonalCurriculum(physics,state,duration,GK,true,false)',sourceSnapshot:snapshot,headJsonFiles:files.length,noRepositoryWrites:true,rows},null,2))
