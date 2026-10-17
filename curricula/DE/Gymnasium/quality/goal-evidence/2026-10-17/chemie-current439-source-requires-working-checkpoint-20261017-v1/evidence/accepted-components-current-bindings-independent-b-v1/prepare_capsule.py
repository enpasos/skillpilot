from pathlib import Path
from datetime import datetime,timezone
import shutil,json,hashlib,os
ROOT=Path('/home/enpasos/projects/skillpilot');T=ROOT/'tmp/chemie-m7-resumed-20261016'
SRC=T/'actual650-seven-priors-stock-applicability-private-root-v1/isolated-input-capsule'
OUT=Path('/mnt/e/skillpilot-chemie-L7-20261017/accepted-components-current-bindings-independent-b-v1');CAP=OUT/'capsule';CAP.mkdir(parents=True,exist_ok=False)
records=[]
def copyfile(src,dst):
 dst.parent.mkdir(parents=True,exist_ok=True)
 if not src.is_file():raise RuntimeError('Missing actual input '+str(src))
 shutil.copyfile(src,dst)
 records.append({'source':str(src),'sourceRealPath':str(src.resolve()),'destination':str(dst.relative_to(CAP)) if dst.is_relative_to(CAP) else str(dst.relative_to(OUT)),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'bytes':src.stat().st_size})
def copydir(src,dst):
 for root,dirs,files in os.walk(src,followlinks=True):
  dirs[:]=[d for d in dirs if d!='node_modules']
  for name in files:copyfile(Path(root)/name,dst/(Path(root)/name).relative_to(src))
for p in ['app/scripts','app/src','contracts/goal-evidence/v1','contracts/goal-evidence/v2','contracts/curriculum-package/v1']:
 copydir(SRC/p,CAP/p)
for p in ['package.json','app/package.json']:
 copyfile(SRC/p,CAP/p)
copyfile(ROOT/'AGENTS.md',CAP/'AGENTS.md')
os.symlink(ROOT/'app/node_modules',CAP/'app/node_modules',target_is_directory=True)
canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
copyfile(SRC/canonical,CAP/canonical)
land=json.loads((CAP/canonical).read_text())
urls={link['url'] for g in land['goals'] for link in g.get('resourceLinks',[]) if link.get('url','').startswith('/assets/')}
for url in sorted(urls):copyfile(SRC/'app/public'/url[1:],CAP/'app/public'/url[1:])
for p in (SRC/'curricula/DE/Gymnasium/composition-views/chemie').glob('*.json'):
 copyfile(p,CAP/p.relative_to(SRC))
mconfig='curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';copyfile(SRC/mconfig,CAP/mconfig)
mc=json.loads((SRC/mconfig).read_text())
for rel in [mc['reviewPath'],mc['cardReviewPath'],'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current439-paired-generic-SekI-and-NI-private-L6-technical-20261016-v1/P439.exact437-retained-whole-lines-two-own-b-contexts.for-native-model.jsonl','curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md']:
 copyfile(SRC/rel,OUT/'archives'/Path(rel).name)
 if rel.endswith('.md'):copyfile(SRC/rel,CAP/rel)
supp=T/'source-epa-full-graph-card-P-content-supplement-root-v1/INPUT.whole650-graph39views-80cards-and-unchanged67-a25-whole-P-content.json'
whole=json.loads(supp.read_text());decknames={}
for p in (SRC/'curricula/DE/Gymnasium/memory-decks').glob('*.de.json'):
 try:d=json.loads(p.read_text())
 except Exception:continue
 if any(x['deckId']==d.get('deckId') for x in whole['whole80CurrentCardsInDecks']):decknames[d['deckId']]=p.name
for d in whole['whole80CurrentCardsInDecks']:
 name=decknames[d['deckId']]
 data=json.dumps(d,ensure_ascii=False,indent=2)+'\n'
 for directory in ['curricula/DE/Gymnasium/memory-decks','app/public/data','backend/src/main/resources/static/data']:
  dest=CAP/directory/name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(data)
decision=T/'paired-source-six-routes-energy-and-nine-Memory-components-accepted-root-v1/DECISION.exact-paired-components-accepted-current-bindings-and-scope-HOLDs-retained.json'
copyfile(decision,OUT/'provenance'/decision.name)
dec=json.loads(decision.read_text())
for key,v in dec['inputs'].items():
 src=ROOT/v['path'];actual='sha256:'+hashlib.sha256(src.read_bytes()).hexdigest()
 if actual!=v['sha256']:raise RuntimeError('Root decision input mismatch '+key)
 if key not in ['actual67SelectorsAnd809MemoryPaths','actualCompiledFrontendTargetMeasurement']:
  copyfile(src,OUT/'provenance'/key/src.name)
manifest={'atUTC':datetime.now(timezone.utc).isoformat(),'sourceCapsule':str(SRC),'physicalCandidateRoot':str(CAP),'copiedFiles':len(records),'copiedBytes':sum(x['bytes'] for x in records),'goalAssetCount':len(urls),'cards':sum(len(d['cards']) for d in whole['whole80CurrentCardsInDecks']),'deckFiles':len(whole['whole80CurrentCardsInDecks']),'sourceGuards':records,'boundary':'Minimal physical script/schema/source/resource capsule; no unrelated historical trees or official PDF copies; only node_modules points to shared read-only dependencies. No APV27/NI override or full gate run.'}
(OUT/'GUARD.copy-inputs-and-source-pins.before.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({k:v for k,v in manifest.items() if k!='sourceGuards'}))
