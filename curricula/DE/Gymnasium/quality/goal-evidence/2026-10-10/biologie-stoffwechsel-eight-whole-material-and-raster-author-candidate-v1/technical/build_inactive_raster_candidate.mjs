// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const common=await import(pathToFileURL(resolve('scripts/goal_visualization_common.mjs')).href);
const b='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-stoffwechsel-eight-whole-material-and-raster-author-candidate-v1';const read=p=>JSON.parse(readFileSync(p,'utf8')),put=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const before=read(b+'/inputs/whole479-current335-before-stoff8.exact.json'),after=structuredClone(before),idx=read(b+'/assets/eight-current-selected-raster-author.index.json');
const descriptions=[
'Schematischer Pflanzenzellverband mit Zwiebel- und Blattgewebe am Lichtmikroskop.',
'Mensch als offenes System mit Stoffaufnahme, Stoffabgabe und Wärmeabgabe.',
'Kontrollierte Planung eines Temperaturvergleichs mit gleichen Enzym-, Substrat- und Flüssigkeitsmengen.',
'Schematische Enzymkette mit Rückkopplung eines Endprodukts an eine getrennte regulatorische Bindungsstelle.',
'Gärungsuntersuchung mit Hefe/CO₂ und einem homolaktischen Modell mit pH-/Lactatkontext.',
'Qualitativer Vergleich aerober und homolaktischer Glucosewege; Energiesymbole sind keine ATP-Zahlen.',
'Gerundete Lebensmittelenergie bei gleicher Masse:1gKohlenhydrate17kJ und1gFett37kJ. Balken sind qualitativ.',
'Hygiene durch Kühlen, Trennen und Reinigen; Mikroben sind vergrößerte schematische Symbole.'
];
const changed=[];
for(const [i,row] of idx.records.entries()){
 const g=after.goals.find(x=>x.id===row.goalId),p=common.buildVisualizationPaths(g,{subjectPath:'biologie',lang:'de',extension:'png'});assert.equal((g.resourceLinks??[]).filter(x=>common.isGoalVisualizationLink(x)).length,0);
 const link=common.createGoalVisualizationLink(g,{provider:'image_gen.imagegen',description:descriptions[i],altText:descriptions[i],lang:'de',license:'CC-BY-4.0',reviewStatus:'pilot',publicUrl:p.publicUrl});g.resourceLinks=[...(g.resourceLinks??[]),link];changed.push(g.id);
 const dir=b+'/candidate/'+g.id;mkdirSync(dir,{recursive:true});
 writeFileSync(dir+'/prompt.de.md',common.createPromptMetadataMarkdown(g,{provider:'image_gen.imagegen',reviewStatus:'pilot',fileName:p.fileName,publicUrl:p.publicUrl,rawPrompt:readFileSync(row.actualPrompt.path,'utf8')}));
 row.futureCanonicalSourcePath=p.sourceImagePath.slice(resolve('.').length+1);row.futurePublicPath=p.publicImagePath.slice(resolve('.').length+1);row.futureBackendPath=p.backendImagePath.slice(resolve('.').length+1);row.futurePublicURL=p.publicUrl;row.inactiveResourceLink=link;
}
assert.equal(after.goals.length,479);for(const g of before.goals){const n=after.goals.find(x=>x.id===g.id);if(!changed.includes(g.id))assert.deepEqual(g,n);else{const a={...g},c={...n};delete a.resourceLinks;delete c.resourceLinks;assert.deepEqual(a,c)}}
put(b+'/candidate/whole479-current335-with-eight-raster-links.inactive.json',after);const kinds=read(b+'/inputs/whole479-current394-kinds.exact.json');kinds.landscapePath=b+'/candidate/whole479-current335-with-eight-raster-links.inactive.json';put(b+'/candidate/after394-kinds.path-only.json',kinds);put(b+'/assets/eight-current-selected-raster-author.index.json',idx);
put(b+'/checks/inactive-resource-link-only-retention.actual.json',{schemaVersion:1,role:'Technical author inactive preparation, not adoption',whole479Retained:true,unchangedGoalBodies:471,changedGoalIds:changed,onlyChangedGoalField:'resourceLinks',currentInsect8WholeGoalBodiesRetained:true,current335ProtectedByWhole471ExactRetention:true,kindsDecisionsUnchanged:true,allSourceCourseIDsDescriptionsUnchanged:true,normalAPIs:['buildVisualizationPaths','createGoalVisualizationLink','createPromptMetadataMarkdown'],activeWrites:false,strictNew:0,strictRestored:0,strictNet:0,humanApproval:false,afterRasterP8AndWholeNative8Pending:true});
console.log('Inactive whole479 retains471 whole bodies; changes only8 resourceLinks; no active asset write');
