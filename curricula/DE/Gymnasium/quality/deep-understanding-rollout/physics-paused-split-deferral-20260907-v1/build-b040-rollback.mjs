import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
const clone = x => JSON.parse(JSON.stringify(x));
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const sha = s => 'sha256:' + createHash('sha256').update(s).digest('hex');
const assert = (p,m) => { if (!p) throw new Error(m); };
const encode = x => JSON.stringify(x,null,2)+'\n';
const b040 = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-040-gravitation-and-cosmology-20-v1/physics100-split-implementation-v1/';
const b035 = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-035-quantum-models-particles-20-v1/physics100-quantum-consolidation-v1/';
function applyJsonOp(doc,op) {
  let obj=doc; for(const step of op.path.slice(0,-1)) obj=typeof step==='object'?obj.find(x=>Object.entries(step).every(([k,v])=>x[k]===v)):obj[step];
  const last=op.path.at(-1), key=typeof last==='object'?obj.findIndex(x=>Object.entries(last).every(([k,v])=>x[k]===v)):last;
  const present=typeof last==='object'?key>=0:Object.hasOwn(obj,key);
  assert(op.before.state==='missing'?!present:present&&same(obj[key],op.before.value),'reconstruct before lease '+op.file+' '+JSON.stringify(op.path));
  if(op.after.state==='missing'){ if(Array.isArray(obj))obj.splice(key,1);else delete obj[key]; }
  else if(typeof last==='object'&&key<0)obj.push(clone(op.after.value));else obj[key]=clone(op.after.value);
}
export async function buildB040Rollback({root}) {
  const read = p=>readFileSync(resolve(root,p),'utf8');
  const r=JSON.parse(read(b040+'read-only-implementation.receipt.v2.json'));
  const p35=JSON.parse(read(b035+'field-leased-plan.json'));
  const originals=new Map(), staged=new Map(), proof=[];
  const get=p=>{if(!staged.has(p)){const s=read(p);originals.set(p,s);staged.set(p,s);}return staged.get(p);};
  const put=(p,s)=>{get(p);staged.set(p,s);};
  const canonicalPath=r.fileDigests[0].path, before=JSON.parse(get(canonicalPath)), after=clone(before);
  const goals=new Map(after.goals.map(g=>[g.id,g]));
  for(const lease of r.canonical.canonicalFieldLeases){if(same(lease.before,lease.after))continue;const g=goals.get(lease.goalId);assert(g&&same(g[lease.field],lease.after),'canonical after lease '+lease.goalId+'.'+lease.field);g[lease.field]=clone(lease.before);}
  const removedGoals=after.goals.filter(g=>r.canonical.newAtoms.includes(g.id));assert(removedGoals.length===7,'seven B040 atoms');
  after.goals=after.goals.filter(g=>!r.canonical.newAtoms.includes(g.id));put(canonicalPath,encode(after));
  for(const v of r.views.proof.filter(x=>x.changed)){
    let oldText=execFileSync('git',['show','HEAD:'+v.path],{cwd:root,encoding:'utf8'});
    if(sha(oldText)!==v.beforeDigest){const d=JSON.parse(oldText);for(const op of p35.operations.filter(o=>o.file===v.path))applyJsonOp(d,op);oldText=encode(d);}
    if(sha(oldText)!==v.beforeDigest){
      const current=JSON.parse(get(v.path));
      const leases=r.views.leases.filter(x=>x.path===v.path&&x.beforeNode);
      const getChildren=(doc,ancestors)=>{let nodes=doc.rootNodes;for(const id of ancestors){const n=nodes.find(x=>x.id===id);assert(n,'view ancestor '+id);nodes=n.children;}return nodes;};
      const clean=nodes=>nodes.filter(n=>!r.canonical.newAtoms.includes(n.goalId)&&n.id!=='physics-b040-source-local-astronomy').map(n=>n.children?{...n,children:clean(n.children)}:n);
      for(const l of leases.filter(x=>x.beforeNode.goalId==='b59cb1ef-05c2-5b09-abb3-8b6903ca0fd6')){const nodes=getChildren(current,l.ancestors),i=nodes.findIndex(n=>n.id==='physics-b040-astrophysics');assert(i>=0,'astro inverse slot');nodes[i]=clone(l.beforeNode);}
      current.rootNodes=clean(current.rootNodes);
      const template=JSON.parse(oldText);
      for(const l of leases.filter(x=>x.beforeNode.goalId!=='b59cb1ef-05c2-5b09-abb3-8b6903ca0fd6')){const nodes=getChildren(current,l.ancestors),t=getChildren(template,l.ancestors);const oldI=t.findIndex(n=>same(n,l.beforeNode));assert(oldI>=0,'old direct view slot');let at=nodes.length;for(const neighbor of t.slice(oldI+1)){const i=nodes.findIndex(n=>same(n,neighbor));if(i>=0){at=i;break;}}nodes.splice(at,0,clone(l.beforeNode));}
      oldText=encode(current);
    }
    assert(sha(oldText)===v.beforeDigest,'reconstructed B040 view before hash '+v.path);
    assert(sha(get(v.path))===v.afterDigest,'current B040 view after hash '+v.path);
    put(v.path,oldText);proof.push({path:v.path,method:'exact known after bytes to reconstructed hash-verified before bytes',beforeBinding:v.beforeDigest,afterBinding:v.afterDigest});
  }
  const overlay=await import(pathToFileURL(resolve(root,b040+'generator-overlay-candidate.ts')).href);
  const grouped=Map.groupBy?Map.groupBy(r.sources.sourceReceipt,x=>x.path):r.sources.sourceReceipt.reduce((m,x)=>(m.set(x.path,[...(m.get(x.path)||[]),x]),m),new Map());
  for(const [path,rows]of grouped){const doc=JSON.parse(get(path));for(const row of rows){const expected={decisions:[clone(row.beforeDecision)],mappings:clone(row.beforeMappings)};overlay.applyPhysicsB040AstroSplitMappings(expected.decisions,expected.mappings);const i=doc.decisions.findIndex(x=>x.sourceGoalId===row.sourceGoalId);assert(i>=0&&same(doc.decisions[i],expected.decisions[0]),'source decision after lease '+row.sourceGoalId);const matches=doc.mappings.filter(x=>x.legacyGoalId===row.sourceGoalId);assert(same(matches,expected.mappings),'source mapping after lease '+row.sourceGoalId);doc.decisions[i]=clone(row.beforeDecision);const first=doc.mappings.findIndex(x=>x.legacyGoalId===row.sourceGoalId);doc.mappings=doc.mappings.filter(x=>x.legacyGoalId!==row.sourceGoalId);doc.mappings.splice(first,0,...clone(row.beforeMappings));}put(path,encode(doc));}
  const rpPath='curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json',rp=JSON.parse(get(rpPath));
  for(const old of r.sources.rpSourceIdLegacyRowsArchived){const row=r.sources.sourceReceipt.find(x=>x.sourceGoalId===old.legacyGoalId);const expected=row.afterCanonicalGoalIds.map(id=>({legacyGoalId:old.legacyGoalId,canonicalGoalId:id,matchType:'partial'}));const found=rp.mappings.filter(x=>x.legacyGoalId===old.legacyGoalId);assert(same(found,expected),'RP after lease '+old.legacyGoalId);const i=rp.mappings.findIndex(x=>x.legacyGoalId===old.legacyGoalId);rp.mappings=rp.mappings.filter(x=>x.legacyGoalId!==old.legacyGoalId);rp.mappings.splice(i,0,clone(old));}put(rpPath,encode(rp));
  for(const deck of r.memoryDecks){const doc=JSON.parse(get(deck.path));assert(!doc.cards.some(c=>c.id===deck.removedCardId),'c15 absent lease');doc.cards.push(clone(deck.beforeCard));put(deck.path,encode(doc));}
  for(const lane of ['A','M']){const path=r.ledger.fileLeases.find(x=>lane==='A'?x.path.includes('semantic-atomicity'):x.path.endsWith('canonical-physics-full.review.jsonl')&&x.path.includes('memory-card-review')).path;const lines=get(path).split('\n').filter(Boolean);for(const added of r.ledger['added'+lane]){const current=lines.map(JSON.parse).find(x=>x.goalId===added.goalId);assert(current&&same(current,added),lane+' added row after lease '+added.goalId);}const retained=lines.filter(l=>!r.canonical.newAtoms.includes(JSON.parse(l).goalId));for(const old of r.ledger['archived'+lane]){assert(!retained.some(l=>JSON.parse(l).goalId===old.row.goalId),lane+' old row absent');retained.push(old.raw);}put(path,retained.join('\n')+'\n');}
  const kp=r.ledger.fileLeases.find(x=>x.path.endsWith('physik.semantic-kinds.json')).path,k=JSON.parse(get(kp));
  for(const d of r.ledger.semanticKindDeltas){const i=k.decisions.findIndex(x=>x.goalId===d.goalId);assert(i>=0&&same(k.decisions[i],d.after),'K after lease '+d.goalId);if(d.before===null)k.decisions.splice(i,1);else k.decisions[i]=clone(d.before);}
  k.decisions.sort((a,b)=>a.goalId.localeCompare(b.goalId));for(const kind of Object.keys(k.counts).filter(x=>x!=='total'))k.counts[kind]=k.decisions.filter(x=>x.semanticKind===kind).length;k.counts.total=k.decisions.length;put(kp,encode(k));
  const cp=r.ledger.fileLeases.find(x=>x.path.endsWith('.cards.review.jsonl')).path,cd=r.ledger.cardDelta;
  const cl=get(cp).split('\n').filter(Boolean).map(l=>{const x=JSON.parse(l);if(x.cardId!==cd.after.cardId||x.deckId!==cd.after.deckId)return l;assert(same(x,cd.after),'c15 ledger after lease');return JSON.stringify(cd.before);});put(cp,cl.join('\n')+'\n');
  const ac=r.atlasCountDelta,atlas=JSON.parse(get(ac.path));assert(atlas[ac.field]===ac.after,'atlas after count');atlas[ac.field]=ac.before;put(ac.path,encode(atlas));
  for(const g of r.generatorProof){let text=get(g.path);const imp="import { applyPhysicsB040AstroSplitMappings } from './lib/physicsB040AstroSplitMappings'\n";assert(text.startsWith(imp),'generator import '+g.path);text=text.slice(imp.length);const line=/^[ \t]*applyPhysicsB040AstroSplitMappings\(decisions, mappings\)\n/gm;const matches=[...text.matchAll(line)];assert(matches.length===1,'generator hook '+g.path);text=text.replace(line,'');put(g.path,text);}
  const lib='app/scripts/lib/physicsB040AstroSplitMappings.ts';assert(sha(get(lib))===r.fileDigests.find(x=>x.path===lib).afterDigest,'overlay exact authored file lease');put(lib,null);
  const files=[...staged].filter(([p,s])=>s!==originals.get(p)).map(([path,after])=>({path,before:originals.get(path),after}));
  return {files,receipt:{status:'PAUSED_DEFERRED_CANDIDATE_NOT_APPLIED',sourceReceipt:b040+'read-only-implementation.receipt.v2.json',sourceReceiptSha256:sha(read(b040+'read-only-implementation.receipt.v2.json')),removedGoalIds:r.canonical.newAtoms,archivedGoals:removedGoals,canonicalInverseFieldLeases:r.canonical.canonicalFieldLeases.filter(x=>!same(x.before,x.after)),viewReconstructionProof:proof,fileDigests:files.map(f=>({path:f.path,beforeSha256:sha(f.before),afterSha256:f.after===null?null:sha(f.after)})),noNewReviews:true}};
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname)buildB040Rollback({root:process.cwd()}).then(x=>console.log(JSON.stringify(x))).catch(e=>{console.error(e.stack);process.exitCode=1;});
