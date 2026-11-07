import fs from 'node:fs';
const inputs=fs.readdirSync('data',{withFileTypes:true}).filter(e=>e.isFile()).map(e=>({name:e.name,bytes:fs.readFileSync('data/'+e.name).length}));
const fd=fs.openSync('/proc/sys/vm/overcommit_memory','r');
const bytes=fs.readSync(fd,Buffer.alloc(Number(process.argv[2])),0,Number(process.argv[2]),null);
fs.closeSync(fd);
console.log(JSON.stringify({inputs,bytes}));
