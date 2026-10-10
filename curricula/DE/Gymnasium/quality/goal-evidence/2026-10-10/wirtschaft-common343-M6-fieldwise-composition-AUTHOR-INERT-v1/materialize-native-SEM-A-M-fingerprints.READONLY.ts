import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import ts from '/home/enpasos/projects/skillpilot/app/node_modules/typescript/lib/typescript.js';
import {fingerprintSemanticKindSourceGoal} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts';
const root='/home/enpasos/projects/skillpilot';
const out=path.join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1');
const sha=(s:any)=>'sha256:'+createHash('sha256').update(s).digest('hex');
const contracts:any[]=[];
function exactNativeFunctions(file:string,names:string[]) {
 const full=fs.readFileSync(path.join(root,file),'utf8');
 const tree=ts.createSourceFile(file,full,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const chunks=tree.statements.filter((s:any)=>ts.isFunctionDeclaration(s)&&s.name&&names.includes(s.name.text)).map((s:any)=>({name:s.name.text,text:full.slice(s.getStart(tree),s.end)}));
 if(chunks.length!==names.length)throw Error('Missing exact original native functions');
 const source=chunks.map(s=>s.text).join('\n');
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const context:any={createHash,exports:{}};
 vm.runInNewContext(js+'\nexports.fingerprintGoal=fingerprintGoal;'+(names.includes('fingerprintMemoryCard')?'exports.fingerprintMemoryCard=fingerprintMemoryCard;':''),context);
 contracts.push({sourcePath:file,wholeOriginalSourceSha256:sha(full),extraction:'TypeScript AST exact unchanged FunctionDeclaration source slices; transpileModule only removes type syntax',functions:chunks.map(s=>({name:s.name,exactSourceSha256:sha(s.text)})),originalWholeBytesAfterExact:sha(fs.readFileSync(path.join(root,file)))===sha(full)});
 return context.exports;
}
const A=exactNativeFunctions('app/scripts/semanticAtomicityReview.ts',['normalizeText','stableJson','getSemanticPayload','fingerprintGoal']);
const M=exactNativeFunctions('app/scripts/memoryCardReview.ts',['normalizeText','stableJson','fingerprintGoal','fingerprintMemoryCard']);
const canon=JSON.parse(fs.readFileSync(path.join(out,'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'),'utf8'));
const rows=canon.goals.map((g:any)=>({goalId:g.id,SEM:fingerprintSemanticKindSourceGoal(g),A:A.fingerprintGoal(g,'semantic-atomicity-v1'),M:M.fingerprintGoal(g,'memory-card-review-v1')}));
const cards:any[]=[];
for(const name of ['market_order_policy','macro_money_policy']){
 const d=JSON.parse(fs.readFileSync(path.join(out,'candidate-memory/canonical/de_gymnasium_economics_flashcards_'+name+'.de.json'),'utf8'));
 for(const c of d.cards){const nativeCard={deckId:d.deckId,cardId:c.id,front:c.front.normalize('NFKC').replace(/\s+/g,' ').trim(),back:c.back.normalize('NFKC').replace(/\s+/g,' ').trim(),category:String(c.category??'').normalize('NFKC').replace(/\s+/g,' ').trim(),tags:Array.isArray(c.tags)?c.tags.map((tag:any)=>String(tag).normalize('NFKC').replace(/\s+/g,' ').trim()).filter(Boolean):[]};cards.push({...nativeCard,originGoalIds:c.originGoalIds,fingerprint:M.fingerprintMemoryCard(nativeCard,'memory-card-review-v1')});}
}
const contract={role:'TECHNICAL_NATIVE_FINGERPRINT_MATERIALIZATION_ONLY',wholeGoals:rows.length,goalBookModelSha256:sha(fs.readFileSync(path.join(root,'app/scripts/goalBookModel.ts'))),calls:['fingerprintSemanticKindSourceGoal(actualWholeGoal)','A.fingerprintGoal(actualWholeGoal, semantic-atomicity-v1)','M.fingerprintGoal(actualWholeGoal, memory-card-review-v1)','M.fingerprintMemoryCard(actualNormalizedRuntimeDeckCard, memory-card-review-v1)'],contracts,sourceWholeGoalSha256:sha(fs.readFileSync(path.join(out,'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))),scientificSelfApproval:false,checkerLogicChanged:false,rows,cards};
fs.writeFileSync(path.join(out,'actual-native-SEM-A-M-689-and-two-decks-fingerprints.READONLY.json'),JSON.stringify(contract,null,2)+'\n');
console.log(JSON.stringify({wholeGoals:rows.length,nativeCardsInTwoAffectedDecks:cards.length,originalNativeFilesExact:contracts.every(r=>r.originalWholeBytesAfterExact)}));
