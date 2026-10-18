import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import vm from 'node:vm';
import ts from '../app/node_modules/typescript/lib/typescript.js';
import {normalizeJurisdictionCode} from '../app/src/utils/jurisdictionMetadata.ts';
import {fingerprintSemanticKindSourceGoal} from '../app/scripts/goalBookModel.ts';
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-confirmed-own-scope-binding-successor-technical-20261018-v1';
const pre='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current447-two-author-packages-complete-candidate-technical-20261018-v1';
const cp=out+'/C659.447ordinary-68memory.confirmed-own-scope-successor.INACTIVE.json';
const rp=out+'/canonical-goal-applicability-override-registry.chemie45-confirmed-scope.INACTIVE.json';
const baselineRegistry='curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json';
const compiler='app/scripts/applicabilityCompiler.ts';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=(b:string|Buffer)=>crypto.createHash('sha256').update(b).digest('hex');
const pin=(p:string)=>{const b=fs.readFileSync(p);return {path:p,sha256:hash(b),bytes:b.length}};
const stable=(v:any):string=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(stable).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
const assert=(ok:boolean,s:string)=>{if(!ok)throw new Error(s)};
const write=(name:string,v:any)=>{fs.writeFileSync(out+'/'+name,JSON.stringify(v,null,2)+'\n');return pin(out+'/'+name)};
const code=fs.readFileSync(compiler,'utf8'),ast=ts.createSourceFile(compiler,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
const names=['repoRelative','isSupportedJurisdiction','loadCanonicalGoalApplicabilityOverrideRegistry','collectApplicabilityOverrideValues','getApplicabilityOverrideValues'];
const declarations=names.map(name=>{const nodes=ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert(nodes.length===1,'declaration not unique '+name);const n=nodes[0];return{name,text:n.getText(ast)}});
const overviewPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json';
const supported=new Set<string>(read(overviewPath).filters.map((x:any)=>normalizeJurisdictionCode(x.id)).filter(Boolean));
let registryReads=0;const registryReadPaths:string[]=[];
const context:any={readFileSync:(p:string,encoding:string)=>{assert([rp,baselineRegistry].some(x=>path.resolve(x)===path.resolve(p)),'bounded loader attempted unrelated file '+p);registryReads++;registryReadPaths.push(path.relative(process.cwd(),p));return fs.readFileSync(p,encoding as any)},
 repoRoot:process.cwd(),relative:path.relative,canonicalGoalApplicabilityOverrideRegistryFile:path.resolve(rp),normalizeJurisdictionCode,SUPPORTED_JURISDICTION_SET:supported,SUPPORTED_DIMENSION:'jurisdiction'};
vm.createContext(context);
const extracted=declarations.map(x=>x.text).join('\n')+'\nglobalThis.__stock={loadCanonicalGoalApplicabilityOverrideRegistry,collectApplicabilityOverrideValues,getApplicabilityOverrideValues};';
const js=ts.transpileModule(extracted,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
vm.runInContext(js,context,{filename:'exact-stock-bounded-override-functions.js'});
const loaded=context.__stock.loadCanonicalGoalApplicabilityOverrideRegistry();
context.canonicalGoalApplicabilityOverrideRegistryFile=path.resolve(baselineRegistry);
const baselineLoaded=context.__stock.loadCanonicalGoalApplicabilityOverrideRegistry();
context.canonicalGoalApplicabilityOverrideRegistryFile=path.resolve(rp);
assert(registryReads===2,'expected exactly two read-only bounded registry loads');
const c=read(cp),by=new Map<string,any>(c.goals.map((g:any)=>[g.id,g]));
const oldc=read(pre+'/C659.447ordinary-68memory.two-author-candidates.INACTIVE.json');const oldby=new Map<string,any>(oldc.goals.map((g:any)=>[g.id,g]));
const reg=read(rp),chem=reg.landscapes.find((x:any)=>x.landscapeId===c.landscapeId);
const oldRegistry=read(baselineRegistry),oldChem=oldRegistry.landscapes.find((x:any)=>x.landscapeId===c.landscapeId);
const findings:any[]=[],checks:any[]=[];
for(const [gid,row] of Object.entries(chem.goalApplicabilityOverrides) as [string,any][]){
 const actual=context.__stock.getApplicabilityOverrideValues(by.get(gid),c.landscapeId,findings,loaded);
 const values=[...new Set<string>(actual.map((x:any)=>x.value))].sort();
 const registryOnly=context.__stock.collectApplicabilityOverrideValues(row,c.landscapeId,by.get(gid),findings,'bounded registry-only syntax check');
 assert(stable([...new Set(registryOnly.map((x:any)=>x.value))].sort())===stable(row.jurisdiction),'registry syntax was not read exactly for '+gid);
 let oldActualValues:string[]|null=null;
 if(oldChem.goalApplicabilityOverrides[gid]){
  const oldActual=context.__stock.getApplicabilityOverrideValues(oldby.get(gid),c.landscapeId,findings,baselineLoaded);
  oldActualValues=[...new Set<string>(oldActual.map((x:any)=>x.value))].sort();
  assert(stable(values)===stable(oldActualValues),'old registry-plus-inline override union changed '+gid);
 }else assert(stable(values)===stable(row.jurisdiction),'new registry values not exact '+gid);
 checks.push({goalId:gid,registryValues:row.jurisdiction,actualRegistryPlusExistingInlineValues:values,oldActualValues,oldOverrideUnionPreserved:oldActualValues!==null,actualEvidenceSources:actual.map((x:any)=>x.source)});
}
assert(findings.length===0,'stock override parser found errors');
assert(checks.length===45,'expected all45 Chemistry overrides');
const newids=['223e33a4-5545-5332-ac4e-7d7a6cbc587c','4965395d-e0c5-5e23-a408-a11712aab409','3eb2a06c-d283-57aa-9eb4-088940c4801a'];
assert(checks.filter(x=>newids.includes(x.goalId)).reduce((n,x)=>n+x.registryValues.length,0)===13,'new goal/jurisdiction total not13');
const sem=read(pre+'/SEM659.current654-classes-plus-five-author-assumptions.INACTIVE-TRANSPORT.json');
const next=structuredClone(sem);next.ledgerId='chemie-current659-confirmed-own-scope-metadata-transport-20261018-v1';next.sourceLandscapePath=cp;
const fps:any[]=[];
for(let i=0;i<next.decisions.length;i++){
 const old=sem.decisions[i],row=next.decisions[i];
 assert(old.sourceFingerprint===fingerprintSemanticKindSourceGoal(oldby.get(row.goalId)),'stale input SEM row '+row.goalId);
 row.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(row.goalId));
 if(old.sourceFingerprint!==row.sourceFingerprint)fps.push({goalId:row.goalId,before:old.sourceFingerprint,after:row.sourceFingerprint});
 const remove=(r:any)=>Object.fromEntries(Object.entries(r).filter(([k])=>k!=='sourceFingerprint'));
 assert(stable(remove(row))===stable(remove(old)),'classification changed '+row.goalId);
}
assert(fps.length===3&&fps.every(x=>newids.includes(x.goalId)),'expected three metadata sourceFP changes');
assert(next.decisions.filter((x:any)=>x.decisionStatus==='author_candidate').length===5,'new five author candidates changed');
const sempin=write('SEM659.confirmed-own-scope-source-bindings.INACTIVE-TRANSPORT.json',next);
const report=write('CHECK.exact-stock-registry-loader-and-sourceFP-bindings.actual.json',{
 artifactRole:'Finite execution of exact unchanged compiler override helpers and SEM stock fingerprint function; not AP',atUTC:new Date().toISOString(),canonical:pin(cp),registry:pin(rp),semanticTransport:sempin,
 stockCompiler:pin(compiler),exactStockDeclarations:declarations.map(x=>({name:x.name,sha256:hash(x.text)})),supportedJurisdictions:pin(overviewPath),
 actualReadBoundaries:{readOnlyRegistryLoads:registryReads,registryReadPaths,normalAP:false,wholeCompilerExecuted:false,noCompilerCodeEdited:true,unrelatedLandscapesCompiled:false},
 counts:{chemistryGoalOverrides:checks.length,chemistryRegistryJurisdictionPairs:checks.reduce((n,x)=>n+x.registryValues.length,0),actualRegistryPlusPreservedInlinePairs:checks.reduce((n,x)=>n+x.actualRegistryPlusExistingInlineValues.length,0),oldRegistryAndInlineOverrideUnionsPreserved:42,newGoalJurisdictionPairs:13,stockParserFindings:findings.length,sourceFPRebindings:fps.length,wholeSemanticRowsExact:659-fps.length,classificationFieldsRetained:659,newAuthorCandidateStatusesRetained:5},
 actualOverrideChecks:checks,findings,sourceFPRebindings:fps,
 schemaBoundary:'SEM remains an inactive transport with the same five author_candidate classifications. No reviewed/native label is supplied or promoted.',
 semanticStockSource:pin('app/scripts/goalBookModel.ts'),
 compilerMeaning:'The unchanged loader reads both exact registries read-only. Registry-only values are checked separately; getApplicabilityOverrideValues also reads pre-existing extendedData.applicabilityOverrides, whose old unions are preserved exactly for all42 existing Chemistry entries. The three new entries return exactly13 new values. skillPilotAcquisitionExtensions documents acquisition duty and scope but is not read by this compiler. Course/stage/view restrictions remain in explicit compositions. Later ordinary AP still needs the accepted source mappings and installed registry; it was not run here.',
 boundaries:{normalWrites:0,AP:false,build:false,newScience:0,HumanApproval:false,HumanTrial:false,M7:false}
});
fs.copyFileSync('tmp/chemie447_scope_stock_override_sem_check.mts',out+'/check.exact-stock-override-and-SEM.mts');
console.log(JSON.stringify({SEM:sempin,stockCheck:report,counts:{newPairs:13,allChemPairs:125,sourceFPRebindings:3}},null,2));
