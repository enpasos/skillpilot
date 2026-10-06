#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Materialize E7 only in a bounded physical isolate; no active adoption."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, os, shutil
ROOT=Path.cwd(); OWN=Path(__file__).resolve().parent; REL=OWN.relative_to(ROOT).as_posix()
ISO=ROOT/'tmp/biologie-ephase-seven-current-native-isolated-20261005-v1'
OLD=ROOT/'tmp/biologie-q1-tf-methylation-current-source-consumer-native-isolated-20261005-v3'
IDS=['56663bb4-dad6-5ffd-a486-00f29600ef66','9d931642-2287-5277-adb2-082403ad25af','a545b28f-81de-5495-a537-c81cb66daaba','861fbc18-06a1-56e3-8619-fd47534d7a5d','7a79fda6-d629-5aea-9305-fc19f174bc4a','e566ae2f-1294-55c0-ba4c-6aeb4954118c','dd196715-a463-5379-8cdb-7a951372f5fd']
CANON='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
SEM='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
ATLAS='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
NOW=datetime.now(timezone.utc).isoformat()
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,v):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.is_symlink(),p
 p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def phys(src,dst):
 src,dst=Path(src),Path(dst);dst.parent.mkdir(parents=True,exist_ok=True)
 assert dst.parent.resolve().is_relative_to(ISO),dst
 if dst.is_symlink():dst.unlink()
 shutil.copy2(src,dst);assert not dst.is_symlink() and sha(src)==sha(dst)
def both(n,v):write(OWN/n,v);write(ISO/REL/n,v)
assert not ISO.exists() and OLD.is_dir()
canon=read(ROOT/CANON);by={g['id']:g for g in canon['goals']};assert len(by)==442
sem=read(ROOT/SEM);assert sem['counts']['curricularAtomic']==364
baselinepath=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-b010-tf-methylation-integration-v1/bio-current-central-five-gates.stdout.txt'
baseline=read(baselinepath);b=next(s for s in baseline['subjects'] if s['subject']=='biologie');assert b['strictComplete']==40 and b['denominator']==364
strict=b['strictCompleteGoalIds'];assert not set(IDS)&set(strict)
atlas=read(ROOT/ATLAS);registry=read(ROOT/REG);bio=next(s for s in registry['subjects'] if s['subject']=='biologie')
oldhe=next(p for p in atlas['mappingPaths'] if '/DE-HE/upper-secondary/' in p);oldext=read(ROOT/oldhe)['sourceExtractionPath']
inputs=[CANON,SEM,QA,ATLAS,REG,atlas['manifestPath'],atlas['navigationViewPath']]+atlas['mappingPaths']
inputs += [read(ROOT/p)['sourceExtractionPath'] for p in atlas['mappingPaths']]
for f in ['semanticAtomicityConfigPath','memoryReviewConfigPath']:
 c=read(ROOT/bio[f]);inputs += [bio[f],c['reviewPath']]
 if c.get('cardReviewPath'):inputs.append(c['cardReviewPath'])
inputs += [p.relative_to(ROOT).as_posix() for p in (ROOT/atlas['outputDirectory']).rglob('*') if p.is_file()]
inputs += [p.relative_to(ROOT).as_posix() for p in (ROOT/'curricula/DE/Gymnasium/memory-decks').glob('*biology*json')]
for gid in IDS:
 inputs += [f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png',f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png',f'backend/src/main/resources/static/assets/goal-visualizations/biologie/{gid}/{gid}.png']
inputs=sorted(set(inputs));boundary={'recordedAtUTC':NOW,'paths':[{'path':p,'sha256':sha(ROOT/p)} for p in inputs],'strictGoalIds':strict,'activeStrict':40,'activeDenominator':364,'activeWritesAuthorized':False}
write(OWN/'active-input-boundary.before.json',boundary)
shutil.copytree(OLD,ISO,symlinks=True);(ISO/REL).mkdir(parents=True)
code=[]
for d in ['app/scripts','app/src','scripts']:
 for base,children,files in os.walk(ROOT/d):
  children[:]=[c for c in children if c not in ['node_modules','__pycache__']]
  for n in files:
   src=Path(base)/n
   if src.suffix in ['.ts','.tsx','.mjs','.js','.py','.json']:
    p=src.relative_to(ROOT).as_posix();phys(src,ISO/p);code.append({'path':p,'sha256':sha(src)})
for p in inputs:phys(ROOT/p,ISO/p)
for src in (ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json'):phys(src,ISO/src.relative_to(ROOT))
registered={str(Path(p).parent) for p in bio['resolutionIndexPaths']+bio['positiveEvidenceConfigPaths']}
registered.add(str(Path(bio['semanticAtomicityConfigPath']).parent))
for d in registered:
 for src in (ROOT/d).rglob('*'):
  if src.is_file():phys(src,ISO/src.relative_to(ROOT))
phys(OWN/'active-input-boundary.before.json',ISO/REL/'active-input-boundary.before.json')
both('native-physical-isolation.receipt.json',{'isolationRoot':str(ISO),'codeBindings':code,'currentInputPaths':inputs,'registeredEvidenceDirectories':sorted(registered),'activeWrites':0,'humanApproval':False})
both('baseline-active-biology.report.json',baseline);both('current-canonical.before.snapshot.json',canon);both('current-registry.before.snapshot.json',registry)
basebook=read(ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.json');basebook['outputPath']=REL+'/baseline-full.book-model.json';both('baseline-book.config.json',basebook)
# Whole original source bullets, including boundaries beyond this atomic goal.
rows=[
 ('4c129394-f99c-4015-8442-c0fea203e068',IDS[0],'E.4',1,36,'Zusammenspiel von Zellteilung, Zelldifferenzierung und Morphogenese (zum Beispiel Froschentwicklung mit Metamorphose)','exact','E.4 is not one of the compulsory E.1-E.3 themes; model-organism bullet remains separate.'),
 ('152da0af-ce6c-4bd1-b681-e988751acfc3',IDS[1],'E.5',1,37,'Zusammenspiel von Zellteilung, Zelldifferenzierung und Morphogenese (zum Beispiel Fruchtbildung)','exact','E.5 is not one of the compulsory E.1-E.3 themes; meristems and cell signaling remain other source components.'),
 ('12877f68-0d5e-4c7c-805e-a3b497daaa0f',IDS[2],'E.5',2,37,'Bedeutung von Meristemen; Signalaustausch zwischen Zellen','exact','Integrated meristem growth regulation preserves both separate official bullets E.5 bullets 2 and 3; no universal hormone identity or whole plant-development closure.'),
 ('3c8c78b8-7c9b-4fd1-bbd0-52d3a4c7f206',IDS[3],'E.1',5,36,'Diffusion, Osmose und Plasmolyse (experimentell)','exact','Execution remains required; pre-supplied observations alone never demonstrate experiment performance.'),
 ('f10e23ac-94b6-4ba3-9b51-c44a01714d2a',IDS[4],'E.1',6,36,'Biomembran (Schema) und Membranmodelle (Übersicht)','partial','This goal compares model representations; membrane composition/transport remain other current goals and are not closed by model comparison.'),
 ('1e24db22-0da7-4ecf-bfde-d35ae9257b39',IDS[5],'E.2',4,36,'Abhängigkeit der Enzymaktivität von Temperatur (RGT-Regel), pH-Wert und Substratkonzentration','partial','RGT temperature component only, bounded stable-enzyme range; pH and substrate components remain other current goals.'),
 ('7ec5f758-e890-44f4-9dff-716ec87b8717',IDS[6],'E.2',5,36,'kompetitive und allosterische / nicht-kompetitive Hemmung (Prinzip, zum Beispiel Medikamente und Giftstoffe als Inhibitoren)','partial','Noncompetitive/allosteric component only; competitive inhibition remains existing prerequisite 01819a6c. Slash is not a universal mechanistic/kinetic identity.')]
he=read(ROOT/oldhe);ext=read(ROOT/oldext);delta=[]
newhe='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-ephase-seven-20261005-v1.review.json'
newext='curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.m7-ephase-seven-20261005-v1.source-extraction.json'
for sid,gid,topic,idx,page,text,match,bound in rows:
 r=next(g for g in ext['sourceGoals'] if g['id']==sid);before=copy.deepcopy(r)
 span=f'{topic}, amtlicher Bullet {idx}'+(' und 3' if gid==IDS[2] else '')+f', gedruckte S.{page}'
 r.update(sourceText=text,rawSourceText=text,parentBulletText=text,rawParentBulletText=text,sourceSpan=span,rawSourceSpan=span,bulletIndex=idx,
          sourceRef=f'Hessen KC Biologie Oberstufe, Ausgabe 2024, Stand 01.08.2025, {span}',sourceDocumentKey='KC2024_BIOLOGIE_SEKII_STAND_20250801',granularity='official-content-component')
 r.setdefault('metadata',{}).update(authorLocalAliasBefore=before['sourceSpan'],sourcePrintedPage=page,sourcePhysicalPage=page,sourceComponentBoundary=bound,themeCompulsory=topic in ['E.1','E.2','E.3'],courseProfileInterpretation='E-phase before GK/LK specialization; GK_LK is technical shared projection applicability',independentCurrentSourceReview='pending')
 mp=next(m for m in he['mappings'] if m['legacyGoalId']==sid and m['canonicalGoalId']==gid);mb=copy.deepcopy(mp)
 if mp['matchType']!=match:
  he['summary']['exactMappings']-=1;he['summary']['partialMappings']+=1;mp['matchType']=match
 decision=next(d for d in he['decisions'] if d['sourceGoalId']==sid);db=copy.deepcopy(decision)
 decision.update(matchType=match,reviewedAt=NOW,reviewer='Codex inactive E7 source author',rationale='Actual current HE primary pages 35-37 read; author metadata correction, not independent adoption. '+bound)
 delta.append({'sourceGoalId':sid,'goalId':gid,'before':before,'after':copy.deepcopy(r),'mappingBefore':mb,'mappingAfter':copy.deepcopy(mp),'decisionBefore':db,'decisionAfter':copy.deepcopy(decision)})
he.update(reviewId=Path(newhe).stem,sourceExtractionPath=newext)
write(ISO/newhe,he);write(ISO/newext,ext)
atlasfuture=copy.deepcopy(atlas);atlasfuture['mappingPaths']=[newhe if p==oldhe else p for p in atlas['mappingPaths']]
# Detach actual atlas output leaves before any native writer.
for p in [atlas['manifestPath'],atlas['navigationViewPath']]+[p.relative_to(ROOT).as_posix() for p in (ROOT/atlas['outputDirectory']).rglob('*') if p.is_file()]:
 dst=ISO/p
 if dst.is_symlink():phys(dst.resolve(),dst)
both('prospective-source-atlas.inputs.json',atlasfuture);both('source-seven-field-deltas.author.json',{'deltas':delta,'oldMappingPath':oldhe,'newMappingPath':newhe,'oldExtractionPath':oldext,'newExtractionPath':newext,'preserveAllOtherRows':True,'independentCurrentReview':'pending','humanApproval':False})
both('goal-content-KEEP.author.json',{'goalIds':IDS,'goals':[by[i] for i in IDS],'currentDescriptionsTitlesRequiresResourcesPreserved':True,'goalObjectFieldDeltas':[],'activeCurricularAtomic':364,'candidateCurricularAtomic':364,'independentScientificReview':'pending','strictClosureIncrease':0,'humanApproval':False})
both('prospective-canonical.snapshot.json',canon)
futurebook=copy.deepcopy(basebook);futurebook['outputPath']=REL+'/prospective-full.book-model.json';both('book.config.json',futurebook)
batch=read(ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/biologie/rollout-v1/2026-10-05/m7-ephase-open-remainder-seven-current-20261005-v1.config.json')
batch.update(batchId='biologie-ephase-seven-current-native-author-20261005-v1',bookId='de-gym-biologie-ephase-seven-current-native-author-20261005-v1',baseGoalBookConfigPath=REL+'/book.config.json',outputDirectory=REL+'/native-finalbook');both('batch.config.json',batch)
# Scoped and full current A/M records are carry-forward, not new author approvals.
for lane,field in [('atomicity','semanticAtomicityConfigPath'),('memory','memoryReviewConfigPath')]:
 c=read(ROOT/bio[field]);raw=(ROOT/c['reviewPath']).read_text();selected=[x for x in raw.splitlines(True) if json.loads(x)['goalId'] in IDS]
 assert len(selected)==7
 c.update(reviewPath=REL+'/'+lane+'.seven-existing.review.jsonl',scope={'label':'Seven unchanged current E-phase goals; retain valid current decisions','leafGoalIds':IDS})
 both(lane+'.seven-existing.config.json',c)
 for dst in [OWN/(lane+'.seven-existing.review.jsonl'),ISO/c['reviewPath']]:dst.write_text(''.join(selected))
 full=read(ROOT/bio[field]);both('full-'+lane+'.existing.config.json',full)
# Record image reuse and exact three-copy current binding, without a new V review.
qa=read(ROOT/QA);v=[]
for gid in IDS:
 r=next(r for r in qa['records'] if r['goalId']==gid);assert r['aiApproved']=='yes' and r['humanApproved']=='no'
 paths=[f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png',f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png',f'backend/src/main/resources/static/assets/goal-visualizations/biologie/{gid}/{gid}.png']
 assert all(sha(ROOT/p)==r['aiApprovedAssetSha256'] for p in paths)
 v.append({'goalId':gid,'qaRecord':r,'copies':[{'path':p,'sha256':sha(ROOT/p)} for p in paths],'authorActualImageSeen':True,'independentPriorVReused':True,'pixelsChanged':False})
both('seven-current-V-reuse.actual.author.json',{'records':v,'authorDecision':'KEEP good actual images; no new visual approval or generation','imageLandscape':'friendly abstract comic PNG; 1672x941; valid prior independent 360/680 reviews retained','humanApproval':False})
# A Bio-only future protection run leaves active whole registry and other subjects untouched.
future=copy.deepcopy(registry);future['subjects']=[copy.deepcopy(bio)];both('future-protection-biology-only.config.json',future)
meta={'isolationRoot':str(ISO),'goalIds':IDS,'canonicalPath':CANON,'semanticPath':SEM,'qaPath':QA,'atlasPath':ATLAS,'bioConfig':bio,'oldHEMappingPath':oldhe,'newHEMappingPath':newhe,'oldHEExtractionPath':oldext,'newHEExtractionPath':newext,'preparedInputPaths':[newhe,newext],'baselineDenominator':364,'baselineStrict':40,'laterBacterial365Rebase':'Apply these exact seven source-row and three mapping-match patches to whichever HE source/mapping is current then; never overwrite its Bacterial or TF/Methyl rows. No canonical goal payload change.'}
both('prospective-paths.json',meta)
for p in [newhe,newext]:
 dst=OWN/'prospective-input-tree'/p;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ISO/p,dst)
print(json.dumps({'status':'inactive_E7_author_prepared','goalObjectChanges':0,'sourceRowsCorrected':7,'mappingExactToPartial':3,'isolationRoot':str(ISO),'activeWrites':0,'humanApproval':False}))
