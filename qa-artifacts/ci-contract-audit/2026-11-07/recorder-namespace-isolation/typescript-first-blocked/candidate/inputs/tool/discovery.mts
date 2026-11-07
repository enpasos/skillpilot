import {readFileSync,readdirSync} from 'node:fs';
type Goal = {id:string; contains?:string[]; requires?:string[]};
type Landscape = {landscapeId:string; goals:Goal[]};
const entries:{name:string;bytes:number}[]=readdirSync('data',{withFileTypes:true})
 .filter(entry=>entry.isFile()).map(entry=>({name:entry.name,bytes:readFileSync('data/'+entry.name).length}))
 .sort((a,b)=>a.name.localeCompare(b.name));
const source:Landscape=JSON.parse(readFileSync('data/goal.json','utf8'));
console.log(JSON.stringify({producer:'actual-tsx-typescript-discovery',inputs:entries,owner:source.landscapeId,goalIds:source.goals.map(goal=>goal.id)}));
