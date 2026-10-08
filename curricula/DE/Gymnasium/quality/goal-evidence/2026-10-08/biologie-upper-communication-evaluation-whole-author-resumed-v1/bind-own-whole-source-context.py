# SPDX-License-Identifier: Apache-2.0
"""Bind existing operative source context; this inventory is no new approval."""
import hashlib,json,re,subprocess,urllib.request
from datetime import datetime,timezone
from pathlib import Path
from bs4 import BeautifulSoup
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT).as_posix();PRIMARY=OWN/'primary'
def load(path):return json.loads((ROOT/path).read_text())
def bind(path):
 b=(ROOT/path).read_bytes();return dict(path=path,sha256='sha256:'+hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(name,data):(OWN/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
snap=load(REL+'/whole-sixteen-current-goals-and-context.input.snapshot.json');selected=[e['wholeCurrentGoal'] for e in snap['entries']];ids={g['id'] for g in selected}
canon=load(REL+'/input/current-whole-canonical.snapshot.json');byid={g['id']:g for g in canon['goals']}
anc=set(ids)
while True:
 added={g['id'] for g in canon['goals'] if any(c in anc for c in g.get('contains',[]))}-anc
 if not added:break
 anc|=added
atlaspath='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json';atlas=load(atlaspath)
def descendants(key,seen=None):
 seen=set() if seen is None else seen
 if key in seen:return set()
 seen.add(key);g=byid[key]
 if not g.get('contains'):return {key}
 return {z for c in g['contains'] for z in descendants(c,seen)}
duties=[];inputs=[bind(atlaspath)]
for path in atlas['mappingPaths']:
 mapping=load(path);extractionpath=mapping.get('sourceExtractionPath');ex=load(extractionpath) if extractionpath else {};sources={g['id']:g for g in ex.get('sourceGoals',[])}
 hits=[(i,d) for i,d in enumerate(mapping.get('decisions',[])) if set(d.get('canonicalGoalIds',[]))&anc]
 if not hits:continue
 inputs.append(bind(path));inputs.append(bind(extractionpath))
 for i,d in hits:
  s=sources.get(d.get('sourceGoalId'));assert s is not None,(path,d.get('sourceGoalId'))
  fullpartners=[]
  for k in d['canonicalGoalIds']:
   assert k in byid,(path,k)
   leaves=descendants(k);fullpartners.append({'directMappedGoal':byid[k],'wholeAtomicDescendants':[byid[z] for z in sorted(leaves)]})
  duties.append({'mappingPath':path,'decisionIndex':i,'wholeOperativeDecisionUnchanged':d,'sourceExtractionPath':extractionpath,'wholeSourceGoalUnchanged':s,'wholePartnerUnion':fullpartners,'selectedTargetGoalIds':sorted(ids&{z for k in d['canonicalGoalIds'] for z in descendants(k)}),'role':'author source-context inventory, not independent whole-source approval'})

reg=load(REL+'/input/current-central-registry.snapshot.json');bio=next(s for s in reg['subjects'] if s['subject']=='biologie');D={g['id']:[] for g in selected};P={g['id']:[] for g in selected}
for path in bio['resolutionIndexPaths']:
 x=load(path)
 for r in x.get('resolutions',[]):
  if r.get('goalId') in ids:D[r['goalId']].append({'indexPath':path,'resolution':r})
for path in bio['positiveEvidenceConfigPaths']:
 x=load(path);scope=set(x['scope']['goalIds'])
 for gid in scope&ids:
  rows=[json.loads(s) for s in (ROOT/x['reviewPath']).read_text().splitlines() if s.strip()];P[gid]+=[{'configPath':path,'reviewPath':x['reviewPath'],'record':r} for r in rows if r['goalId']==gid]
qa=load(bio['visualizationQaPath']);qmap={r['goalId']:r for r in qa['records']}
gaps=[]
for g in selected:
 assert not D[g['id']] and not P[g['id']],g['id']
 q=qmap[g['id']];assert q['visualizationState']=='missing' and not g.get('resourceLinks'),g['id']
 gaps.append({'goalId':g['id'],'existingDResolutions':D[g['id']],'existingPRecords':P[g['id']],'wholeExistingVisualizationQARecord':q,'resourceLinks':g.get('resourceLinks',[]),'existingAandM':'unchanged exact original selected records bound in whole-sixteen-current-goals-and-context.input.snapshot.json','sourceReviewRole':'current context inventory only, fresh whole16 native/source review pending'})
write('sixteen-current-gates-and-source-context.author-inventory.json',{'schemaVersion':1,'authorReadAt':datetime.now(timezone.utc).isoformat(),'atlasInput':bind(atlaspath),'bindingInputs':inputs,'entries':gaps,'sourceDuties':duties,'sourceDutyCount':len(duties),'directAndInheritedRolesPreserved':True,'mappingWrites':[],'existingDCount':sum(map(len,D.values())),'existingPCount':sum(map(len,P.values())),'visualGapCount':16,'newWholeSourceApproval':False,'independentApproval':False,'humanApproval':False})

# Preserve fetched original12 bytes and append the two actual13 primary contexts.
retrieval=load(REL+'/primary/official-source-retrieval.author.receipt.json')
for role in ['erhoeht','grundlegend']:
 url='https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/'+role
 with urllib.request.urlopen(url,timeout=45) as r:b=r.read();status=r.status
 h=PRIMARY/('BY13-'+role+'.official-whole.html.txt');h.write_bytes(b)
 soup=BeautifulSoup(b,'html.parser');main=soup.find('main') or soup;t=PRIMARY/('BY13-'+role+'.official-whole.visible-text.txt');t.write_text(main.get_text('\n',strip=True)+'\n')
 retrieval['entries'].append({'url':url,'statusCode':status,'originalPath':h.relative_to(ROOT).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b),'visibleExtractionPath':t.relative_to(ROOT).as_posix(),'purpose':'current author source-context reading, not independent approval'})
write('primary/official-source-retrieval.author.receipt.json',retrieval)
pdf='curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf';extracts=[]
for page in [28,29]:
 p=PRIMARY/f'HE-physical-page-{page:03d}.whole-official.txt'
 subprocess.run(['pdftotext','-layout','-f',str(page),'-l',str(page),str(ROOT/pdf),str(p)],check=True);extracts.append(bind(p.relative_to(ROOT).as_posix()))
norm=lambda t:re.sub(r'\s+',' ',t).strip()
BYEX='curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_BIOLOGIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json';ex=load(BYEX);smap={g['id']:g for g in ex['sourceGoals']};rows=[]
for g in selected:
 s=smap[g['extendedData']['provenance']['sourceGoalId']];text=norm(s['sourceText']);primary=[]
 for r in retrieval['entries']:
  visible=(ROOT/r['visibleExtractionPath']).read_text();needle=text
  # Lehrplan extraction and visibleHTML may differ only by normalized NBSP/whitespace.
  assert needle in norm(visible),(g['id'],r['url'])
  i=visible.find(s['sourceText'].split('.')[0]);primary.append({'url':r['url'],'originalSourceBinding':{'path':r['originalPath'],'sha256':r['sha256'],'bytes':r['bytes']},'wholeVisibleExtraction':bind(r['visibleExtractionPath']),'wholeCompetencyTextActuallyPresent':True,'officialContext':'Lernbereich1 Kommunikationskompetenz/Bewertungskompetenz, general cross-topic competency; actual course/year explicitly bound'})
 rows.append({'goalId':g['id'],'sourceSpan':s['sourceSpan'],'wholeSourceGoal':s,'wholeCurrentGoal':g,'primaryContextBindings':primary,'sourceClaim':'actual author reading of these whole16 competencies only, not new independent source/mapping/whole-curriculum approval','authorScopeDecision':'KEEP full current DE/EN bodies and operative course/stage mappings; all original sourceOccurrences and partner unions retained'})
write('sixteen-official-full-clause-author-context-bindings.json',{'schemaVersion':1,'BYSourceExtraction':bind(BYEX),'HESourcePDF':bind(pdf),'HEWholePhysicalPages':extracts,'HEQualifierContext':'General SekII K1–K14 and B1–B11: whole physical28/29 retained; no claim that process examples confer new stage/course content targets','entries':rows,'sourceApproval':False,'independentNativeSourceReviewPending':True,'regionalWholeApproval':False,'descriptionChanges':[]})
print(json.dumps({'sourceDuties':len(duties),'PGap':sum(map(len,P.values())),'DGap':sum(map(len,D.values())),'primaryFourByWhole16':64,'HEWholePhysicalPages':[28,29]}))
