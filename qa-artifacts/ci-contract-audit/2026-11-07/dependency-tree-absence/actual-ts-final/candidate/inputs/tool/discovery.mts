import {readFileSync,readdirSync} from 'node:fs';
type Goal={id:string;requires?:string[];contains?:string[]};
type Landscape={landscapeId:string;goals:Goal[]};
const inputs:{name:string;bytes:number}[]=readdirSync('data',{withFileTypes:true}).filter(e=>e.isFile()).map(e=>({name:e.name,bytes:readFileSync('data/'+e.name).length})).sort((a,b)=>a.name.localeCompare(b.name));
const source:Landscape=JSON.parse(readFileSync('data/goal.json','utf8'));
console.log(JSON.stringify({producer:'actual-tsx-on-private-complete-tool-tree',inputs,owner:source.landscapeId,goalIds:source.goals.map(g=>g.id)}));
