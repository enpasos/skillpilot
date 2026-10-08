# SPDX-License-Identifier: Apache-2.0
"""Inactive whole-goal author inputs. No independent approval or active writes."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, shutil, subprocess, os
R=Path.cwd();D=Path(__file__).resolve().parent;INPUT={}
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rel(p):return str(Path(p).relative_to(R))
def bind(p):
 p=Path(p);v={'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};INPUT[v['path']]=v;return v
def read(p):bind(p);return json.loads(Path(p).read_text())
def put(name,v):
 p=D/name;p.parent.mkdir(parents=True,exist_ok=True);b=(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode();
 if p.exists():assert p.read_bytes()==b,p;return bind(p)
 t=p.with_suffix(p.suffix+'.tmp');t.write_bytes(b);os.replace(t,p);return bind(p)
def snap(p,name):
 p=Path(p);bind(p);q=D/name;q.parent.mkdir(parents=True,exist_ok=True);
 if q.exists():assert sha(q)==sha(p);return bind(q)
 shutil.copyfile(p,q);assert sha(q)==sha(p);return bind(q)
entryPath=D/'neutral-root-selected-current-twenty-four-open-whole-goals.entry.json';assert sha(entryPath)=='c6deb270093a81e2d5d8091ead07a546434b90b0ae74c28b41d6abc610d1da33';entry=read(entryPath);ids=entry['scopeGoalIds'];assert len(ids)==24 and not set(ids)&set(entry['separateEvolution18GoalIds'])
cpath=R/entry['current476Whole392AtomicCanonical']['path'];assert sha(cpath)==entry['current476Whole392AtomicCanonical']['sha256'];canonical=read(cpath);by={g['id']:g for g in canonical['goals']};assert len(by)==476
for row in entry['wholeCurrentSelection']:assert by[row['goal']['id']]==row['goal']
canon=snap(cpath,'before/canonical.current476.json');kinds=snap(R/'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json','before/semantic-kinds.current476.json');crit=snap(R/'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-positive-understanding-evidence-profile-criteria-v1.md','before/biology-positive-profile-criteria.md')
put('selected24.current-whole-goals.context.author.json',{'role':'Complete current DE/EN whole goals, prerequisites, parents and consumers; routing Q3/Q4 values are not official topic evidence','goalIds':ids,'wholeGoals':[by[i]for i in ids],'contexts':[{'goalId':i,'wholePrerequisites':[by[j]for j in by[i].get('requires',[])],'wholeParents':[g for g in by.values()if i in g.get('contains',[])],'wholeConsumers':[g for g in by.values()if i in g.get('requires',[])]}for i in ids],'activeWrites':0})
# Use the genuinely reviewed future eighteen mapping as the inert HE baseline.
atlas=read(R/'app/scripts/config/goal-books/inactive/biologie-he-evolution-eighteen-raster-native-20261008-v1/atlas.inputs.json')
heMap=next(p for p in atlas['mappingPaths']if 'evolution18-decision-locators.author-20261008-v3' in p);mapping=read(R/heMap);source=read(R/mapping['sourceExtractionPath']);assert len(source['sourceGoals'])==144
snap(R/heMap,'source/HE.whole144.future-reviewed18-v3.mapping.exact.json');snap(R/mapping['sourceExtractionPath'],'source/HE.whole144.future-reviewed18-v2.extraction.exact.json')
parents={}
def descendants(i,inherited=False,seen=None):
 seen=set()if seen is None else seen
 if i in seen:return set()
 seen.add(i);g=by[i];ed=g.get('extendedData',{})
 if ed.get('applicabilityProjection')=='excluded' or(inherited and ed.get('applicabilityMappingInheritance')=='boundary'):return set()
 out={i}if i in ids else set()
 for child in g.get('contains',[]):out|=descendants(child,True,seen)
 return out
pool={};edges=[];guards=[];mappingPartnerDecisionDifferences=[]
for path in atlas['mappingPaths']:
 m=read(R/path);s=read(R/m['sourceExtractionPath']);gs={g['id']:g for g in s['sourceGoals']};ps={p['id']:p for p in s.get('passages',[])};guards.append({'mapping':bind(R/path),'extraction':bind(R/m['sourceExtractionPath'])})
 for decision in m.get('decisions',[]):
  if decision['decision']!='mapped':continue
  sid=decision['sourceGoalId'];partners=[p for p in m['mappings']if p['legacyGoalId']==sid]
  targets={i.replace(canonical['landscapeId']+':','')for i in decision['canonicalGoalIds']}
  partnerTargets={p['canonicalGoalId'].replace(canonical['landscapeId']+':','')for p in partners}
  if targets!=partnerTargets:mappingPartnerDecisionDifferences.append({'mappingPath':path,'sourceGoalId':sid,'decisionTargets':sorted(targets),'mappingPartnerTargets':sorted(partnerTargets),'relevanceToSelected24':bool(set().union(*(descendants(t)for t in targets|partnerTargets))),'status':'EXACT_EXISTING_INPUT_DIFFERENCE_NOT_REPAIRED_OR_APPROVED'})
  hits=[]
  for tid in sorted(targets):
   matchingRows=[p for p in partners if p['canonicalGoalId'].replace(canonical['landscapeId']+':','')==tid]
   for gid in sorted(descendants(tid)):hits.append({'goalId':gid,'mappedTargetGoalId':tid,'coverage':'direct'if gid==tid else 'inherited','exactSourceDecisionUsedByStandardAtlas':True,'allExactMatchingMappingRows':matchingRows,'decisionTargetMissingPartnerRow':not bool(matchingRows)})
  if not hits:continue
  key=path+'#'+sid;row=gs[sid]
  pool[key]={'sourceKey':key,'mappingPath':path,'sourceExtractionPath':m['sourceExtractionPath'],'wholeRetainedExtractionGoal':row,'wholeRetainedPassages':[ps[row['passageId']]]if row.get('passageId')in ps else [],'sourceDocument':s.get('sourceDocument'),'sourceDocuments':s.get('sourceDocuments',[]),'allPartnerRows':partners,'wholeCurrentDecision':decision,'wordingAuthority':'Current source normalization is not automatically literal primary curriculum or mandatory named content','reviewStatus':'AUTHOR_NOT_NATIONWIDE_APPROVAL'}
  edges.extend({'sourceKey':key,**hit}for hit in hits)
put('source/whole24-all-current-regional-source-duties-all-1n-partners.lossless.json',{'schemaVersion':1,'matchedEdges':len(edges),'uniqueSourceDuties':len(pool),'allPartnerRows':sum(len(p['allPartnerRows'])for p in pool.values()),'sourceGoals':list(pool.values()),'matchedEdgesData':edges,'actualWhole144HEFuture18SourceBaseline':True,'all29CurrentFutureMappingPathsRetained':atlas['mappingPaths'],'mappingExtractionGuards':guards,'existingPartnerDecisionDifferences':mappingPartnerDecisionDifferences,'currentLegacyNeuroGK2HoldPreserved':True,'allOtherSourceDecisionsMeaningExact':True,'sourceApprovalClaimed':False})
heIds={by[i]['extendedData']['provenance']['sourceGoalId']for i in ids}
put('source/HE.selected24.whole-original-normalized-rows-and-decisions.author.json',{'warning':'Normalized officialCompetency and numeric sourceSpan values are not primary quotations; retain them as exact before evidence','sourceGoals':[g for g in source['sourceGoals']if g['id']in heIds],'decisions':[g for g in mapping['decisions']if g['sourceGoalId']in heIds],'mappings':[g for g in mapping['mappings']if g['legacyGoalId']in heIds]})
pdf=R/'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf';assert sha(pdf)=='52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558';pages=[]
for page in [42,44,45,46,47,48]:
 cmd=['pdftotext','-layout','-f',str(page),'-l',str(page),str(pdf),'-'];r=subprocess.run(cmd,capture_output=True);assert r.returncode==0;rpath=D/f'primary/current-HE-physical-page-{page:03}.whole-official.txt';rpath.parent.mkdir(exist_ok=True);rpath.write_bytes(r.stdout);pages.append({'physicalPage':page,'printedPage':page,'zeroBasedPdfPage':page-1,'wholeOfficialPage':bind(rpath),'extractionCommand':cmd,'actualExitCode':0,'normalization':'None; complete actual primary page layout bytes preserved'})
oldEco=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20-current391-author-v2/primary-inputs'
for name in ['BY13-EA-official.actual-text.txt','BY13-GA-official.actual-text.txt','BY12-GA-official.actual-text.txt']:snap(oldEco/name,'primary/'+name)
put('primary/actual-primary-original-page-and-scope-reading.author.receipt.json',{'checkedAt':datetime.now(timezone.utc).isoformat(),'currentHEUrl':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf','currentHEPdfSha256':sha(pdf),'currentHEStand':'01.08.2025; Ausgabe2024; 49 actual physical pages','actualReadCompleteHEPages':pages,'currentBYPrimaryUrls':['https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/erhoeht','https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/grundlegend'],'actualCurrentOfficialWebPagesOpenedThisTurn':True,'retainedCompleteBYTextScopeRead':'B13EA/GA 3.1,3.2,3.3,4.1,4.2,4.3, plus original process duties; full text files retained','noRawCacheRequired':'Raw primary PDF/HTML are provenance locators only. Portable full official text and specific original components are required inputs.','actualExperiments':0,'humanApproval':False})
for lane,n in [('A','semantic-atomicity'),('M','memory-card-review')]:
 cfgPath=R/f'curricula/DE/Gymnasium/quality/{n}/canonical-biology-full.config.json';cfg=read(cfgPath);snap(R/cfg['reviewPath'],f'AM/{lane}.whole392.current-reviewed.exact.jsonl');cfg['landscapePath']=canon['path'];cfg['reviewPath']=rel(D/f'AM/{lane}.whole392.current-reviewed.exact.jsonl');cfg['reportPath']=rel(D/f'AM/{lane}.whole392.native-retained.report.actual.md')
 lines=(R/read(cfgPath)['reviewPath']).read_text().splitlines();selected=[json.loads(l)for l in lines if json.loads(l)['goalId']in ids];assert len(lines)==392 and len(selected)==24
 if lane=='M':
  cfg['cardReviewPath']=snap(R/cfg['cardReviewPath'],'AM/M.current.cards.exact.jsonl')['path']
  for k,v in enumerate(cfg['visibilityScopes']):v['viewPath']=snap(R/v['viewPath'],f'AM/visibility-{k:02}.current.view.json')['path']
 put(f'AM/{lane}.whole392.exact-retained-current.config.json',cfg);put(f'AM/{lane}.selected24.current-row-decisions-and-author-limit.json',{'wholeSelectedRows':selected,'existingReviewOnly':True,'newIndependentSourceScienceApproval':False,'authorCompoundBoundaryHoldsMustBeReviewedSeparately':True})
put('current24-author-inputs-and-lossless-source-AM.guard.json',{'rootEntry':bind(entryPath),'current476CanonicalSnapshot':canon,'current476KindsSnapshot':kinds,'positiveCriteriaSnapshot':crit,'selected24GoalIds':ids,'selectedRootWholeGoalBytesExact':True,'futureReviewed18SourceMappingBaseline':bind(R/heMap),'futureReviewed18SourceExtractionBaseline':bind(R/mapping['sourceExtractionPath']),'whole144IDsRetained':True,'current204StrictGoalsProtected':True,'sourcePoolCounts':{'matchedEdges':len(edges),'sourceDuties':len(pool),'allPartnerRows':sum(len(p['allPartnerRows'])for p in pool.values())},'full392AMExactRowsCopied':True,'atomicitySourceHoldsNotClearedByTechnicalChecks':True,'noSourcePhaseOrProfileInferredFromCanonicalQ3Q4':True,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False})
put('checks/initial-declared-inputs.author.json',{'files':list(INPUT.values())});print(json.dumps({'wholeGoals':24,'wholeHE144':True,'sourceDuties':len(pool),'matchedEdges':len(edges),'allPartnerRows':sum(len(p['allPartnerRows'])for p in pool.values()),'fullAM392Exact':True,'activeWrites':0}))
