# SPDX-License-Identifier: Apache-2.0
"""Inactive technical AUTHOR candidate, genuine earlier science retained."""
from pathlib import Path
from datetime import datetime,timezone
import copy,hashlib,json,os,tempfile
R=Path.cwd();D=Path(__file__).resolve().parent;DATE=D.parent;FILES={}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
rel=lambda p:str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);r={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};FILES[r['path']]=r;return r
def read(p):bind(p);return json.loads(Path(p).read_text())
def put(name,obj):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);b=obj if isinstance(obj,bytes)else (obj if isinstance(obj,str)else json.dumps(obj,ensure_ascii=False,indent=2))+'\n'
 if not isinstance(b,bytes):b=b.encode()
 assert not p.exists(),p
 fd,tmp=tempfile.mkstemp(prefix='.'+p.name+'.',suffix='.tmp',dir=p.parent)
 try:
  with os.fdopen(fd,'wb')as f:f.write(b)
  os.replace(tmp,p)
 finally:
  if Path(tmp).exists():Path(tmp).unlink()
 return bind(p)
def seal(p,digest):
 p=Path(p);assert sha(p)==digest,(p,'first/final seal digest')
 j=read(p);rows=j.get('ownFiles',j.get('files',j.get('frozenFiles')));assert rows is not None
 count=0
 for row in rows+j.get('retainedSourceV2AuthorFiles',[]):
  q=R/row['path'] if str(row['path']).startswith('curricula/')else p.parent/row['path']
  assert sha(q)==row['sha256'].removeprefix('sha256:'),(q,'historical frozen file drift')
  assert q.stat().st_size==row['bytes'];bind(q);count+=1
 return {'seal':bind(p),'actualExactFiles':count}
SCI=DATE/'biologie-he-q4-evolution-eighteen-whole-science-author-20261008-v1';SA=DATE/'biologie-he-q4-evolution-eighteen-whole-science-independent-a-20261008-v1';SB=DATE/'biologie-he-q4-evolution-eighteen-whole-science-independent-b-20261008-v1'
SRC=DATE/'biologie-he-evolution-eighteen-decision-locators-author-root-20261008-v3';SRA=DATE/'biologie-he-evolution-eighteen-decision-locators-independent-a-20261008-v3';SRB=DATE/'biologie-he-evolution-eighteen-decision-locators-independent-b-20261008-v3'
seals={'scienceAuthor':seal(SCI/'eighteen-whole-science-native-P18-author-input.first.freeze.json','5c85c1f442a80caa01e4107eea1c8788e72b03df1256605a57e0fddc44c3462b'),'scienceA':seal(SA/'independent-a.final-source-science.freeze.json','2db378057d882436d594beff245d6ce3f716ad2b4fcafdcc27c15109a9e11812'),'scienceB':seal(SB/'eighteen-whole-source-science-independent-b.final-portable.freeze.json','5cde2a758454a25efb6f5c38c6d3b17d70a4e9a06811ae995081aa6b538fcd61'),'sourceV3Author':seal(SRC/'eighteen-decision-locators-v3.author-first-input.freeze.json','4e960b794005cde4727cc276599910affa233a36f13366ca53816065a07d58d4'),'sourceV3A':seal(SRA/'independent-a.decision-locators-v3.final.freeze.json','d2da6ffcf26a9f3faefeb09590e59748cce12fb1554b2ae5da655a952368de3d'),'sourceV3B':seal(SRB/'eighteen-source-v3-independent-b.final-portable.freeze.json','b78017bdcda64e4670d38595d10a89c88cdcf4f8bef5599897b0f26b57855bc1')}
manifestPath=R/'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he-evolution-eighteen-image-author-root-20261008-v1/selected-eighteen-whole-goal-image-author-candidates.exact.json';assert sha(manifestPath)=='2fe20e9544ada8ffc0fd9de0f54ab4ce29aac30945c951a1743e4a7db983ef51';images=read(manifestPath);assert len(images['images'])==18
ids=[im['goalId']for im in images['images']];assert len(set(ids))==18
paths={'canonical':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','kinds':'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json','qa':'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json','Aconfig':'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json','Mconfig':'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json','registry':'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','ledger':'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json','floors':'app/scripts/config/curriculum-maturity-floor-policy.json','atlasInputs':'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json','atlasManifest':'app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json','bookConfig':'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'}
before={}
for key,path in paths.items():before[key]=bind(R/path);put('before/'+key+'.json',(R/path).read_bytes())
assert before['canonical']['sha256']=='82e0a67ecd7a1b765336349b66eb60279f91ea67a169c8667a08c93e5d68137d'
centralDir=DATE/'biologie-he9-split-reviewed-active-integration-root-v1';assert read(centralDir/'affected-check-central.terminal.actual.json')['actualExitCode']==0
central=read(centralDir/'affected-check-central.stdout.actual.txt');assert central['blockingIssueCount']==0
subjects={s['subject']:s for s in central['subjects']};assert [(subjects[s]['strictComplete'],subjects[s]['denominator'])for s in ['biologie','chemie','mathematik','physik']]==[(204,392),(173,378),(807,807),(478,478)]
assert not set(ids).intersection(subjects['biologie']['strictCompleteGoalIds']);put('before/current204-central.actual.json',(centralDir/'affected-check-central.stdout.actual.txt').read_bytes())
live=read(R/paths['canonical']);assert len(live['goals'])==476;by={g['id']:g for g in live['goals']};word=read(R/images['wholeTargetedTwoWordProposal']['path']);assert len(word['patches'])==3 and len({p['goalId']for p in word['patches']})==2
proposed={g['id']:g for g in word['proposedWholeGoals']};original={g['id']:g for g in word['originalWholeGoals']};assert set(proposed)==set(original)==set(ids)
candidate=copy.deepcopy(live);cb={g['id']:g for g in candidate['goals']};selected=[]
for im in images['images']:
 gid=im['goalId'];assert by[gid]==im['wholeOriginalGoal']==original[gid];assert proposed[gid]==im['wholeTwoWordPatchedGoalBeforeImageLink']
 assert not any(l.get('type')=='goal-visualization'for l in by[gid].get('resourceLinks',[]))
 cb[gid].clear();cb[gid].update(copy.deepcopy(proposed[gid]))
 for k in ['png','prompt','exactGenerationRequest','provenance']:verify=im[k];assert sha(R/verify['path'])==verify['sha256'];assert(R/verify['path']).stat().st_size==verify['bytes'];bind(R/verify['path'])
 png=put('selected-images/'+gid+'.png',(R/im['png']['path']).read_bytes())
 # Create contained relative image aliases only after the actual PNG copy exists.
 alias=D/'assets/goal-visualizations/biologie'/gid/(gid+'.png');alias.parent.mkdir(parents=True,exist_ok=True);assert not alias.exists();alias.symlink_to(os.path.relpath(D/'selected-images'/ (gid+'.png'),alias.parent));assert alias.resolve(strict=True)==(D/'selected-images'/(gid+'.png'));bind(alias)
 url=f'/assets/goal-visualizations/biologie/{gid}/{gid}.png';cb[gid].setdefault('resourceLinks',[]).append({'type':'goal-visualization','title':'Visualisierung: '+cb[gid]['title'],'url':url,'role':'primary','mimeType':'image/png','altText':'Lernzielillustration: '+cb[gid]['title']})
 selected.append({'goalId':gid,'actualOriginalPNG':im['png'],'selectedPath':png['path'],'sha256':png['sha256'],'bytes':png['bytes'],'promptPath':im['prompt']['path'],'exactGenerationRequestPath':im['exactGenerationRequest']['path'],'provenancePath':im['provenance']['path'],'width':im['width'],'height':im['height'],'selectedVersion':im['selectedVersion'],'requiredScientificBoundary':im['requiredScientificBoundary'],'candidateOnly':True,'independentVisualApproval':False})
for gid,g in by.items():
 if gid not in ids:assert cb[gid]==g
assert len(cb)==476;put('candidate/canonical.current476.actual-raster.inactive.json',candidate)
sourceOnly=copy.deepcopy(candidate)
for g in sourceOnly['goals']:
 if g['id']in ids:g['resourceLinks']=[l for l in g['resourceLinks']if l['type']!='goal-visualization']
put('candidate/canonical.current476.source-only.inactive.json',sourceOnly)
put('selected-eighteen-images.current-whole-exact.json',{'role':'Actual eighteen AUTHOR raster candidates; no independent visual review yet','images':selected,'selectedManifest':bind(manifestPath),'generationIsNotApproval':True,'activeWrites':0,'strictGainClaimed':0})
# Whole 36 original bilingual cases/profiles are retained exactly, including two
# independently assessed terminology repairs. No truncated materials/summaries.
for name in ['eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.json','eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.md','P18.thirty-six-whole-DEEN-cases.author.candidates.json']:
 p=SCI/name;bind(p);put('whole-science/'+name,p.read_bytes())
amp=read(SA/'A-M-P.targeted-two-goal-binding-review.actual.json');put('whole-science/genuine-two-word-patch-AM-A.receipt.json',amp)
am=[]
for key,letter in [('Aconfig','A'),('Mconfig','M')]:
 cfg=read(R/paths[key]);p=R/cfg['reviewPath'];bind(p);lines=p.read_text().splitlines();assert len(lines)==392
 targeted={r['goalId']:r['targetedDecision']for r in amp['receipts']if r['kind']==letter};assert set(targeted)=={p['goalId']for p in word['patches']}
 after=[]
 for line in lines:
  row=json.loads(line);after.append(json.dumps(targeted[row['goalId']],ensure_ascii=False,separators=(',',':'))if row['goalId']in targeted else line)
 assert sum(a==b for a,b in zip(after,lines))==390
 ledger=put('candidate/'+letter+'.current392.retained-plus-genuine-two-word-patches.jsonl','\n'.join(after));futurecfg={**cfg,'reviewPath':ledger['path']};put('candidate/'+letter+'.current392.future-active.config.json',futurecfg)
 inactive={**futurecfg,'landscapePath':rel(D/'candidate/canonical.current476.actual-raster.inactive.json'),'reportPath':rel(D/'checks'/(letter+'.current392.native.report.md'))};put('candidate/'+letter+'.current392.inactive.config.json',inactive)
 am.append({'kind':letter,'actualCurrentConfig':before[key],'actualCurrentReview':bind(p),'futureImmutableReview':ledger,'other390LinesExact':True,'other374OutsideScopeExact':True,'selected16UnchangedReviewedRowsExact':True,'genuineTwoTargetedJudgmentsSource':rel(SA/'A-M-P.targeted-two-goal-binding-review.actual.json')})
 if 'cardReviewPath'in cfg:bind(R/cfg['cardReviewPath'])
sourceEntry=read(SRC/'neutral-eighteen-source-v3-locator-review.entry.json');sourceMapping=read(R/sourceEntry['mappingReviewCandidatePath']);sourceExtraction=read(R/sourceEntry['sourceExtractionCandidatePath']);assert len(sourceMapping['decisions'])==144
# Capture all currently used scopes and source/class/runtime guards. No config or
# source mappings are installed: source v3 is an inert author input.
atlas=read(R/paths['atlasInputs']);manifest=read(R/paths['atlasManifest']);viewpaths=set(manifest['sourcePaths']+[manifest['navigationViewPath']])
for v in read(R/paths['Mconfig']).get('visibilityScopes',[]):viewpaths.add(v['viewPath'])
for p in (R/'curricula/DE/Gymnasium/composition-views/biologie').glob('*.view.json'):viewpaths.add(rel(p))
# Current authored landscape includes31 reviewed unique scopes (excluding the
# global navigation view), expanded later by native model checks.
views=[]
for path in sorted(viewpaths):
 b=bind(R/path);snap=put('before/views/'+path,(R/path).read_bytes());views.append({'activePath':path,'binding':b,'snapshotPath':snap['path']})
protected=[]
for s in ['MATHEMATIK','PHYSIK','CHEMIE']:protected.append(bind(R/f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{s}.de.json'))
for path in ['app/public/data/de_gymnasium_biology_flashcards_core.de.json','app/public/data/de_gymnasium_biology_flashcards_core.en.json']:protected.append(bind(R/path))
for path in read(R/paths['ledger'])['activeBatchConfigPaths']:protected.append(bind(R/path))
for mapping in atlas['mappingPaths']:
 m=read(R/mapping);bind(R/m['sourceExtractionPath'])
put('current204-whole-eighteen-author-guards.technical.json',{'role':'Inactive current204/392 eighteen whole-goal raster engineering; no science review or integration','selectedGoalIds':ids,'wholeGoalCount476':True,'atomic392':True,'beforeBindings':before,'protectedOtherFiles':protected,'views':views,'currentAM':am,'actualScienceAndSourceSeals':seals,'sourceV3NeutralEntry':rel(SRC/'neutral-eighteen-source-v3-locator-review.entry.json'),'sourceV3MappingCandidate':sourceEntry['mappingReviewCandidatePath'],'sourceV2ExtractionCandidate':sourceEntry['sourceExtractionCandidatePath'],'whole3Fields2GoalWordPatches':word['patches'],'other458WholeGoalsExact':True,'baselineStrictGoalIds204':subjects['biologie']['strictCompleteGoalIds'],'all4SubjectBaseline':{s:{'strict':x['strictComplete'],'denominator':x['denominator'],'strictGoalIds':x['strictCompleteGoalIds']}for s,x in subjects.items()},'source18Bounded15AndNonmandatory3':True,'source144ReleaseClaim':False,'existingNeuroGK2HOLDUnchanged':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
put('checks/initial-declared-inputs.technical.json',{'files':list(FILES.values())})
print(json.dumps({'actualCurrentBaseline':'204/392','candidateFullWholeGoals':476,'newRasterCandidates':18,'sourcev3ActualPair':'Bounded18, not144 release','wordPatches':3,'twoGenuineAMRebindings':True,'other458WholeGoalsExact':True,'other390AMLinesExact':True,'activeWrites':0,'strictGainClaimed':0}))
