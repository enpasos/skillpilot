import {readFileSync} from 'node:fs';
type Goal={id:string;requires?:string[];contains?:string[]};
type Landscape={landscapeId:string;goals:Goal[]};
const source:Landscape=JSON.parse(readFileSync('../curricula/DE/Gymnasium/canonical/fixture.json','utf8'));
console.log(JSON.stringify({producer:'actual-prepared-layout-tsx',owner:source.landscapeId,goalIds:source.goals.map(goal=>goal.id)}));
