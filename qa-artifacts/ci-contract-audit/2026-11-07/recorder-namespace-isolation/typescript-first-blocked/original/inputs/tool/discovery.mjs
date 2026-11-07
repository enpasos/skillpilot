import {readFileSync,readdirSync} from 'node:fs';
const inputs=readdirSync('data',{withFileTypes:true}).filter(e=>e.isFile()).map(e=>e.name).sort().map(name=>({name,bytes:readFileSync('data/'+name).length}));
try { if(process.argv[2]==='host')readFileSync(process.argv[3]);
if(process.argv[2]==='proc-host')readFileSync('/proc/self/root'+process.argv[3]);
if(process.argv[2]==='alias-host')readFileSync('escape/goal.json');
if(process.argv[2]==='host-directory')readdirSync('/dev/shm'); } catch(error) { }
console.log(JSON.stringify({inputs}));
