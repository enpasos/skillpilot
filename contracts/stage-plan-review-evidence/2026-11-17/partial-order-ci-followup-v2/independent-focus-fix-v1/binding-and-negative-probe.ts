import assert from'node:assert/strict'
import{readFileSync,writeFileSync}from'node:fs'
import{createHash}from'node:crypto'
import ts from'/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js'
import{buildCanonicalFocusScope,buildGoalContainsClosure}from'/home/enpasos/projects/skillpilot/app/src/utils/plannedScope'
const root='/home/enpasos/projects/skillpilot',out=root+'/tmp/pipeline/mathe-physik-verzahnung/pr160-ci-followup-v2/independent-focus-fix-v1'
const goal=(id:string,contains:string[]=[])=>({id,title:id,titleEn:id,description:'',descriptionEn:'',weight:1,type:contains.length?'cluster':'atomic',contains,requires:[],tags:[]})as any
const canon=[goal('C',['a','b']),goal('a'),goal('b'),goal('d')],present=[goal('C',['a']),goal('a'),goal('b'),goal('d'),goal('composition:S',['C','d'])],map=new Map(present.map(g=>[g.id,g])),source=[{goals:canon}]
const synthetic=buildCanonicalFocusScope(['composition:S'],map,source),canonical=buildCanonicalFocusScope(['C'],map,source),mixed=buildCanonicalFocusScope(['C','composition:S'],map,source)
assert.deepEqual([...synthetic].sort(),['C','a','composition:S','d']);assert(!synthetic.has('b'))
assert.deepEqual([...canonical].sort(),['C','a','b']);assert.deepEqual([...mixed].sort(),['C','a','b','composition:S','d'])
const incorrectGlobalMerge=new Map([...map,...canon.map(g=>[g.id,g]as const)]);assert(buildGoalContainsClosure(['composition:S'],incorrectGlobalMerge).has('b'),'negative mutant must expand wrong synthetic descendant');assert(!synthetic.has('b'))
const appPath='app/src/App.tsx',corePath='app/src/hooks/useAppCore.ts',learnerPath='app/src/views/LearnerView.tsx';const app=readFileSync(root+'/'+appPath,'utf8'),core=readFileSync(root+'/'+corePath,'utf8'),learner=readFileSync(root+'/'+learnerPath,'utf8')
function binding(appText:string,coreText:string,learnerText:string){
 const parse=(path:string,text:string)=>ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
 const af=parse(appPath,appText),cf=parse(corePath,coreText),lf=parse(learnerPath,learnerText);let appProp=false,coreSource=false,memoBound=false,depBound=false
 const visit=(n:ts.Node,fn:(n:ts.Node)=>void)=>{fn(n);n.forEachChild(c=>visit(c,fn))}
 visit(af,n=>{if(ts.isJsxSelfClosingElement(n)&&n.tagName.getText(af)==='LearnerView'){appProp=n.attributes.properties.some(p=>ts.isJsxAttribute(p)&&p.name.getText(af)==='canonicalGoalSources'&&p.initializer&&ts.isJsxExpression(p.initializer)&&p.initializer.expression?.getText(af)==='core.prerequisiteGoalSources')}})
 visit(cf,n=>{if(ts.isPropertyAssignment(n)&&n.name.getText(cf)==='prerequisiteGoalSources'&&n.initializer.getText(cf)==='graphSourceLandscapeEntries')coreSource=true})
 visit(lf,n=>{if(!ts.isVariableDeclaration(n)||n.name.getText(lf)!=='plannedScopeGoalIds'||!n.initializer||!ts.isCallExpression(n.initializer))return;const call=n.initializer;if(call.expression.getText(lf)!=='useMemo')return;visit(call.arguments[0],x=>{if(ts.isCallExpression(x)&&x.expression.getText(lf)==='buildCanonicalFocusScope'&&x.arguments.map(a=>a.getText(lf)).join('|')==='plannedGoals|goalIndexAll|canonicalGoalSources')memoBound=true});depBound=!!call.arguments[1]&&ts.isArrayLiteralExpression(call.arguments[1])&&call.arguments[1].elements.some(e=>e.getText(lf)==='canonicalGoalSources')})
 return{appProp,coreSource,memoBound,depBound,all:appProp&&coreSource&&memoBound&&depBound}
}
const current=binding(app,core,learner);assert(current.all,'real App→core→LearnerView memo binding')
const mutant1=binding(app.replace('canonicalGoalSources={core.prerequisiteGoalSources}',''),core,learner),mutant2=binding(app,core,learner.replace('buildCanonicalFocusScope(plannedGoals, goalIndexAll, canonicalGoalSources)','buildCanonicalFocusScope(plannedGoals, goalIndexAll)'));assert(!mutant1.all);assert(!mutant2.all)
const pins=[appPath,corePath,learnerPath,'app/src/utils/plannedScope.ts'].map(path=>({path,sha256:createHash('sha256').update(readFileSync(root+'/'+path)).digest('hex')}));writeFileSync(out+'/binding-and-negative.actual.json',JSON.stringify({status:'PASS',bindingVerification:'TypeScript AST of actual App JSX prop, returned core source, LearnerView useMemo arguments and dependency; static binding evidence, not browser acceptance',current,syntheticCanonicalDescendantTrap:{synthetic:[...synthetic].sort(),canonical:[...canonical].sort(),mixed:[...mixed].sort()},negativeMutants:{globalCanonicalMergeIncorrectlyAddsB:true,missingAppPropRejected:!mutant1.all,missingMemoArgumentRejected:!mutant2.all},pins},null,2)+'\n');console.log('PASS: real UI source binding, independent synthetic descendant trap, mixed scope and three negative mutants')
