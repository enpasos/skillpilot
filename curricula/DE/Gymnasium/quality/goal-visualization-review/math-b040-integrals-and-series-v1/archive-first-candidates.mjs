import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root="curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-integrals-and-series-v1";
const jobs=[
  {
    "id": "1b664036-3c29-5d94-9f42-97069aaa2c53",
    "path": "tmp/goal-visualizations/1b664036-3c29-5d94-9f42-97069aaa2c53/generated/1b664036-3c29-5d94-9f42-97069aaa2c53.generated.2026-09-07T00-21-37-988Z.jpg"
  },
  {
    "id": "df5eeadd-414e-50ae-84ec-7e5dbf7449d6",
    "path": "tmp/goal-visualizations/df5eeadd-414e-50ae-84ec-7e5dbf7449d6/generated/df5eeadd-414e-50ae-84ec-7e5dbf7449d6.generated.2026-09-07T00-21-38-894Z.jpg"
  },
  {
    "id": "ece68088-71a8-466b-874c-09e6baac19fc",
    "path": "tmp/goal-visualizations/ece68088-71a8-466b-874c-09e6baac19fc/generated/ece68088-71a8-466b-874c-09e6baac19fc.generated.2026-09-07T00-21-36-901Z.jpg"
  },
  {
    "id": "90662398-a0fd-45bf-9ce9-2abbc20428ed",
    "path": "tmp/goal-visualizations/90662398-a0fd-45bf-9ce9-2abbc20428ed/generated/90662398-a0fd-45bf-9ce9-2abbc20428ed.generated.2026-09-07T00-21-37-391Z.jpg"
  },
  {
    "id": "5042fd2b-bab2-50be-8144-c9ccf5618615",
    "path": "tmp/goal-visualizations/5042fd2b-bab2-50be-8144-c9ccf5618615/generated/5042fd2b-bab2-50be-8144-c9ccf5618615.generated.2026-09-07T00-21-34-556Z.jpg"
  },
  {
    "id": "269675a9-13cd-4a3a-ab75-63794f5c9710",
    "path": "tmp/goal-visualizations/269675a9-13cd-4a3a-ab75-63794f5c9710/generated/269675a9-13cd-4a3a-ab75-63794f5c9710.generated.2026-09-07T00-21-35-770Z.jpg"
  },
  {
    "id": "911f3200-1dbc-59a6-90df-c883c77de39c",
    "path": "tmp/goal-visualizations/911f3200-1dbc-59a6-90df-c883c77de39c/generated/911f3200-1dbc-59a6-90df-c883c77de39c.generated.2026-09-07T00-21-39-347Z.jpg"
  },
  {
    "id": "a9ed219d-d497-55e5-a4e0-4d45d2554f6b",
    "path": "tmp/goal-visualizations/a9ed219d-d497-55e5-a4e0-4d45d2554f6b/generated/a9ed219d-d497-55e5-a4e0-4d45d2554f6b.generated.2026-09-07T00-21-34-322Z.jpg"
  }
];
const read=p=>fs.readFileSync(p);
const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const desc=p=>({path:p,sha256:digest(read(p)),bytes:read(p).length});
const safeCopy=(src,dest)=>{assert.ok(fs.existsSync(src),src);fs.mkdirSync(path.dirname(dest),{recursive:true});if(fs.existsSync(dest))assert.equal(digest(read(src)),digest(read(dest)),'Existing archive mismatch '+dest);else fs.copyFileSync(src,dest);return desc(dest);};
const landscape=JSON.parse(read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'));
const qa=JSON.parse(read('curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'));
const patches=[];const add=(p,obj)=>{assert.ok(!fs.existsSync(p),'Refuse receipt overwrite '+p);patches.push({p,text:JSON.stringify(obj,null,2)+'\n'});};
for(const job of jobs){
 const id=job.id,srcdir='curricula/DE/Gymnasium/visualizations/mathematik/'+id,base=root+'/'+id,temp='tmp/goal-visualizations/'+id;
 const originalFiles=fs.readdirSync(srcdir).filter(n=>fs.statSync(srcdir+'/'+n).isFile()).map(n=>safeCopy(srcdir+'/'+n,base+'/original/'+n));
 assert.equal(digest(read(srcdir+'/'+id+'.jpg')),digest(read('app/public/assets/goal-visualizations/mathematik/'+id+'/'+id+'.jpg')));
 const goal=landscape.goals.find(g=>g.id===id);assert.ok(goal);
 const qaEntry=qa.records.find(g=>g.goalId===id);assert.ok(qaEntry,'Missing existing QA record '+id);
 const previous={schemaVersion:1,goal,qaEntry,qaSourceShape:Object.keys(qa)};
 add(base+'/original/previous-goal-and-qa.json',previous);
 const genStem=path.basename(job.path,'.jpg');
 const genFiles=fs.readdirSync(temp+'/generated').filter(n=>n.startsWith(genStem+'.')).map(n=>temp+'/generated/'+n);
 const sourceFiles=[...genFiles,...['nano-banana-prompt.de.md','nano-banana-request.json','nano-banana-response-summary.json'].map(n=>temp+'/'+n),base+'/attempt-1.prompt.de.md'];
 const candidateFiles=sourceFiles.map(p=>safeCopy(p,base+'/candidate-1/'+path.basename(p)));
 add(base+'/candidate-1/archive-receipt.json',{schemaVersion:1,archivedAt:new Date().toISOString(),goalId:id,candidateNumber:1,provider:'Google Gemini / Nano Banana Pro (gemini-3-pro-image, reference-image input)',reconstructionModel:'gemini-2.5-flash',imported:false,reviewAuthority:'archive_only',humanApprovalClaimed:false,originalFiles,candidateFiles});
}
console.log(JSON.stringify({patch:'*** Begin Patch\n'+patches.map(({p,text})=>'*** Add File: '+p+'\n'+text.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n').join('')+'*** End Patch',archived:jobs.length}));
