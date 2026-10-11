from pathlib import Path
import json, hashlib, subprocess, collections, concurrent.futures, datetime
R=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent
B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
A=B/'wirtschaft-current678-origin-three-commits-M6-protected-integration-root-v1'
checks=[]
def check(n,v,d=None):checks.append({'check':n,'pass':bool(v),'detail':d})
def load(p):return json.loads(Path(p).read_text())
def git(*args):return subprocess.check_output(['git',*args],cwd=R)
def bind(p):
 p=Path(p);p=p if p.is_absolute() else R/p;b=p.read_bytes()
 return {'path':str(p.relative_to(R)) if p.is_relative_to(R) else str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(n,j):
 p=O/n
 if p.exists():raise RuntimeError('Already exists: '+str(p))
 p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n');return bind(p)
before=load(A/'actual-before-M6-tracked-byte-and-original-index-state-preservation.json')
merge=load(A/'actual-origin-fast-forward-and-retained-stash.json')
HEAD=git('rev-parse','HEAD').decode().strip();origin=git('rev-parse','origin/main').decode().strip()
check('Actual HEAD/origin=2c2f026d, actual authorized FF',HEAD==origin==before['fetchedOriginMain']==merge['HEAD'])
check('Exactly three incoming commits and no merge commit',len(git('log','--format=%H',before['HEAD']+'..HEAD').decode().splitlines())==3 and git('merge-base',before['HEAD'],'HEAD').decode().strip()==before['HEAD'])
stash=git('stash','list','--format=%H').decode().splitlines();check('Original whole stash retained',merge['stashSHA'] in stash)
staged_start=git('diff','--cached','--name-only','-z')
staged=sorted(x for x in staged_start.decode().split('\0') if x)
check('Exactly original two BE staged paths restored',staged==sorted(before['originalStagedPaths']))
preserved=[]
for b in before['trackedChanges']:
 p=R/b['path']
 if b['exists']:
  exactcopy=bind(R/b['frozenExactCopy']);check('Frozen original whole copy '+b['path'],exactcopy['sha256']==b['sha256'] and exactcopy['bytes']==b['bytes'])
 else:exactcopy=None
 if b['path'] not in before['sharedTrackedPaths']:
  current=bind(p) if p.exists() else None
  check('Nonshared before object preserved '+b['path'],p.exists()==b['exists'] and (not b['exists'] or current['sha256']==b['sha256'] and current['bytes']==b['bytes']))
  preserved.append({'path':b['path'],'original':b,'current':current})
 if b['path'] in staged:
  ib=git('show',':'+b['path']);check('Staged BE blob is whole original '+b['path'],hashlib.sha256(ib).hexdigest()==b['sha256'])
check('Whole before29 and exactly24 nonshared objects',len(before['trackedChanges'])==29 and len(preserved)==24 and len(before['sharedTrackedPaths'])==5)
rp='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
current=load(R/rp);old=load(R/next(x['frozenExactCopy'] for x in before['trackedChanges'] if x['path']==rp));head=json.loads(git('show','HEAD:'+rp))
subjects=[]
for s in current['subjects']:
 source=old if s['subject']=='wirtschaftswissenschaften' else head
 expected=next(x for x in source['subjects'] if x['subject']==s['subject'])
 check('Whole semantic union subject '+s['subject'],s==expected)
 subjects.append({'subject':s['subject'],'wholeExpectedSource':'local M6 before' if source is old else 'new HEAD','wholeCurrent':s,'wholeExpected':expected})
check('Shared registry exact newHEAD non-subject fields', {k:v for k,v in current.items() if k!='subjects'}=={k:v for k,v in head.items() if k!='subjects'})
check('No subjects omitted or added',len(current['subjects'])==len(head['subjects'])==5)
REGbefore=bind(R/rp)
inventory_path='docs/legal/ai-transparency-inventory.json';base_bytes=git('show','HEAD:'+inventory_path);base=json.loads(base_bytes)
patch_path=A/'actual-merged-existing-asset-inventory-after-local23-copies-patch.stdout.txt';patch=patch_path.read_text()
candidate_bytes=('\n'.join(l[1:] for l in patch.splitlines() if l.startswith('+') and not l.startswith('+++'))+'\n').encode();candidate=json.loads(candidate_bytes)
candidate_path=A/'whole-merged-inventory-only-eight-actual-existing-asset-and-card-measurements.INERT-candidate.json'
check('Root actual candidate present and exactly emitted native patch',candidate_path.is_file() and candidate_path.read_bytes()==candidate_bytes)
check('Working inventory is still wholeHEAD pending independent qualification',(R/inventory_path).read_bytes()==base_bytes)
emit=load(A/'actual-merged-existing-asset-inventory-after-local23-copies-patch.command-exit.json')
initial=load(A/'actual-merged-existing-asset-inventory-patch.command-exit.json')
check('Actual native emission successor passed and failed initial retained',emit['actualExitCode']==0 and initial['actualExitCode']==1)
allowed=[('goalVisualizations','canonicalGoalCount'),('goalVisualizations','count'),('goalVisualizations','fileExtensions'),('goalVisualizations','providerCounts'),('goalVisualizations','c2paStructure','detected'),('canonicalLearningContent','memoryDeckFiles'),('canonicalLearningContent','cardRecords'),('canonicalLearningContent','uniqueCardIds')]
def get(j,p):
 for k in p:j=j[k]
 return j
def assign(j,p,v):
 for k in p[:-1]:j=j[k]
 j[p[-1]]=v
delta=[];masked=json.loads(json.dumps(candidate))
for p in allowed:
 a,b=get(base['artifactClasses'],p),get(candidate['artifactClasses'],p);delta.append({'path':'/artifactClasses/'+'/'.join(p),'wholeBefore':a,'wholeAfter':b});assign(masked['artifactClasses'],p,get(base['artifactClasses'],p))
check('All other whole inventory fields/policies/approvals exact newHEAD',masked==base)
check('Exactly eight actual logical measurement fields differ',all(x['wholeBefore']!=x['wholeAfter'] for x in delta))

canonicals=sorted((R/'curricula/DE/Gymnasium/canonical').glob('*.json'));canon_guards=[];links=[];total=0
for p in canonicals:
 j=load(p);gg=j.get('goals',[]);total+=len(gg);canon_guards.append(bind(p))
 for g in gg:
  for link in g.get('resourceLinks',[]):
   if link.get('type')=='goal-visualization':links.append({'goalId':g['id'],**link})
providers=collections.Counter(x.get('provider','<missing>') for x in links);extensions=collections.Counter(Path(x.get('url','')).suffix.lower().lstrip('.') for x in links)
def physical(link):
 public=R/('app/public'+link['url']);backend=R/('backend/src/main/resources/static'+link['url'])
 pb=public.read_bytes();bb=backend.read_bytes();ext=public.suffix.lower()
 marker=b'caBX' in pb if ext=='.png' else b'c2pa' in pb and b'jumb' in pb if ext in ['.jpg','.jpeg'] else False
 return {'goalId':link['goalId'],'url':link['url'],'public':{'path':str(public.relative_to(R)),'sha256':hashlib.sha256(pb).hexdigest(),'bytes':len(pb)},'backend':{'path':str(backend.relative_to(R)),'sha256':hashlib.sha256(bb).hexdigest(),'bytes':len(bb)},'copiesWholeExact':pb==bb,'shallowC2PAMarker':marker}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:images=list(pool.map(physical,links))
v=candidate['artifactClasses']['goalVisualizations'];missing=sorted(x['url'] for x in images if not x['shallowC2PAMarker'])
check('Own whole21 canonical files/6238 goals/2383 actual visualization links',len(canonicals)==v['canonicalLandscapeFiles']==21 and total==v['canonicalGoalCount']==6238 and len(links)==v['count']==2383)
check('Own extension/provider complete aggregate exact candidate',dict(extensions)==v['fileExtensions'] and dict(providers)==v['providerCounts'])
check('Every actual2383 public/backend whole asset copy exact',all(x['copiesWholeExact'] for x in images))
check('Own shallow markers2332 and unchanged whole missing-marker list',len(images)-len(missing)==v['c2paStructure']['detected']==2332 and missing==sorted(v['c2paStructure']['notDetectedUrls']))
deckfiles=sorted((R/'curricula/DE/Gymnasium/memory-decks').glob('*.json'));deckrows=[];cardids=[]
for p in deckfiles:
 j=load(p);cards=j.get('cards',[]);cardids.extend(x['id'] for x in cards);deckrows.append({'wholeDeck':bind(p),'actualCardRecords':len(cards),'actualCardIds':[x['id'] for x in cards]})
m=candidate['artifactClasses']['canonicalLearningContent']
check('Own physical61 decks/745 card records/577 unique current IDs',len(deckfiles)==m['memoryDeckFiles']==61 and len(cardids)==m['cardRecords']==745 and len(set(cardids))==m['uniqueCardIds']==577)
old_inv=load(R/next(x['frozenExactCopy'] for x in before['trackedChanges'] if x['path']==inventory_path))
check('Merged memory aggregates exactly already qualified old M6 aggregates',old_inv['artifactClasses']['canonicalLearningContent']==m)
check('Merged visual delta from old M6: exactly7 canonical nodes/23 links/23PNG/23markers',v['canonicalGoalCount']-old_inv['artifactClasses']['goalVisualizations']['canonicalGoalCount']==7 and v['count']-old_inv['artifactClasses']['goalVisualizations']['count']==23 and v['fileExtensions']['png']-old_inv['artifactClasses']['goalVisualizations']['fileExtensions']['png']==23 and v['c2paStructure']['detected']-old_inv['artifactClasses']['goalVisualizations']['c2paStructure']['detected']==23)
plan=load(A/'actual23-upstream-existing-asset-source-public-byteexact-local-backend-materialization-plan.json');triples=[]
for row in plan['records']:
 triple=[bind(row[k]) for k in ['source','public','backend']]
 check('Actual unchanged source/public/backend23 '+row['relative'],all(x['sha256']==row['sha256'] for x in triple))
 check('Only ignored local backend copy '+row['relative'],subprocess.run(['git','check-ignore','-q',row['backend']],cwd=R).returncode==0)
 triples.append({'relative':row['relative'],'wholeCopies':triple})
check('Exactly23 byte-identical materialized existing backend copies',len(triples)==23)
copy=load(A/'actual-native23-local-build-copy.command-exit.json');check('Native23 actual copier zero/no new images',copy['actualExitCode']==0 and copy['byteExactIgnoredCopies']==23 and copy['sourceChanges']==copy['publicChanges']==copy['newImages']==0)
readme='docs/qa-ci/status/README.md';oldtxt=next(x['frozenExactCopy'] for x in before['trackedChanges'] if x['path']==readme);curtxt=(R/readme).read_text();headtxt=git('show','HEAD:'+readme).decode()
check('README preserves actual Chem381 newHEAD reference and Econ336 native log', 'memory-current381.normal.report.md' in headtxt and 'memory-current381.normal.report.md' in curtxt and 'economics-memory-current336-native.stdout.txt' in curtxt and 'remaining-eight-layerA-after-qualified-national-views-and-inventory-run-v6/economics-memory-cards-and34-views.stdout.txt' in curtxt)
check('README retains wholeHEAD except single actual subject memory registry row',[x for x in curtxt.splitlines() if not x.startswith('| [memory-card-review-canonical-biology-full.md]')]==[x for x in headtxt.splitlines() if not x.startswith('| [memory-card-review-canonical-biology-full.md]')])
check('Original four actual stash conflict artifacts retained',all((A/('unresolved-stash-conflict-'+n+'.exact')).is_file() and b'<<<<<<<' in (A/('unresolved-stash-conflict-'+n+'.exact')).read_bytes() for n in ['ai-transparency-inventory.json','README.md','curriculum-quality-status.json','curriculum-quality-status.md']))
check('Active description CAN remains exact qualified M6 before6bfa',bind(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')['sha256']=='6bfa382a2b174a1645d883f746ef42c0693813ec2d447561fca3290ca98a0b09')
for b in canon_guards:check('Final canonical endguard '+b['path'],bind(R/b['path'])==b)
for d in deckrows:check('Final whole deck endguard '+d['wholeDeck']['path'],bind(R/d['wholeDeck']['path'])==d['wholeDeck'])
check('Final Economics registry exact',bind(R/rp)==REGbefore)
check('Final original two BE staged state exact',git('diff','--cached','--name-only','-z')==staged_start)
check('Final native Root inventory candidate exact',candidate_path.is_file() and candidate_path.read_bytes()==candidate_bytes)
check('No incoming code source-inventory/generator altered by local audit',git('rev-parse','HEAD').decode().strip()==HEAD and git('rev-parse','origin/main').decode().strip()==origin)
artifacts=[]
artifacts.append(put('actual-independent-whole-before29-nonshared24-original-two-index-and-five-subject-union.json',{'RootBefore':bind(A/'actual-before-M6-tracked-byte-and-original-index-state-preservation.json'),'RootMerge':bind(A/'actual-origin-fast-forward-and-retained-stash.json'),'RootIndexRestore':bind(A/'actual-original-two-BE-staged-paths-restored-after-stash-conflict-resolution.json'),'preserved24':preserved,'semanticUnion5':subjects,'actualRegistry':REGbefore,'originalIndexPaths':staged,'README':bind(R/readme)}))
artifacts.append(put('actual-independent-eight-measured-inventory-fields-whole2383-assets61decks-and23-copies.json',{'RootWholeCandidate':bind(candidate_path),'RootSuccessfulNativePatch':bind(patch_path),'RootSuccessfulCommand':bind(A/'actual-merged-existing-asset-inventory-after-local23-copies-patch.command-exit.json'),'retainedFailedNativeCommand':bind(A/'actual-merged-existing-asset-inventory-patch.command-exit.json'),'logicalFieldDeltas8':delta,'headInventorySHA256':hashlib.sha256(base_bytes).hexdigest(),'oldQualifiedM6Inventory':bind(R/next(x['frozenExactCopy'] for x in before['trackedChanges'] if x['path']==inventory_path)),'actualWholeCanonicalInputs21':canon_guards,'actualWholeImages2383':images,'actualWholeDecks61':deckrows,'actualExisting23SourcePublicBackendCopies':triples,'checkerImplementation':bind(R/'scripts/check_ai_transparency_inventory.mjs'),'shallowMarkerMeaning':'Container marker scan only, not authenticity/ownership/signature validation or scientific image approval.'}))
artifacts.append(put('actual-independent-merge-inventory-checks-and-endguards.json',{'checks':checks,'postMergeCentralM6NotYetClaimed':True}))
failed=[x for x in checks if not x['pass']]
seal={'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Independent read-only fieldwise semantic union and existing-asset/card inventory measurement review. Root owns merge, stash/index restoration, native emitter and subsequent activation. No source/image/card science restarted.','decision':'BOUNDED_SHARED_UNION_AND_EIGHT_MEASURED_INVENTORY_FIELDS_KEEP' if not failed else 'REVISE','actualHEAD':HEAD,'actualOriginMain':origin,'actualThreeCommitsFastForwarded':True,'beforeTrackedObjects29':29,'nonsharedObjects24Exact':24,'originalTwoBEStagedPathsExact':staged,'wholeRegistryFiveSubjectUnionExact':True,'RootInertInventoryCandidate':bind(candidate_path) if candidate_path.is_file() else None,'eightLogicalMeasuredFieldsOnly':True,'actualCanonicalFiles':len(canonicals),'actualCanonicalGoals':total,'actualExistingVisualizationLinks':len(links),'actualExistingShallowC2PAMarkers':len(images)-len(missing),'actualExistingDeckFiles':len(deckfiles),'actualExistingCardRecords':len(cardids),'actualExistingUniqueCardIds':len(set(cardids)),'actualExisting23LocalBackendCopies':23,'checks':len(checks),'failedChecks':failed,'artifacts':artifacts,'remainingLane':'Peer B separately verifies all5684 unshared incoming HEAD blobs and protected Math/Physics. This seal qualifies the shared Root union and exact eight-field candidate for Root integration; actual post-merge source/central/floors pass remains a separate required measured bundle.','limitations':['Inventory aggregates and shallow metadata markers identify actual files; they do not approve images, sources, cards or human release.','The old M6 checkpoint remains exact historical evidence on ee13896d. New HEAD2c2f026d is actually integrated, while post-merge status regeneration/central/floors has not been claimed here.','Two description candidates and their v19 followers remain inert; current CAN stays6bfa.','First native emitter failed because23 existing upstream backend copies were absent; original failed command and four original stash conflicts remain preserved. Root fixed only byte-identical ignored local copies and reran the standard emitter successfully.','Only eight measured aggregate fields differ from the whole newHEAD inventory. Existing memory counts exactly match the already qualified pre-merge M6 memory inventory; all remaining policies/provenance/review fields stay wholeexact.'],'activeWritesByReviewer':0,'docsWritesByReviewer':0,'fetchOrMergeByReviewer':False,'newImagesByReviewer':0,'newScienceVerdicts':0}
final=put('actual-final-origin-three-commits-shared-union-eight-existing-inventory-measurements-independent-KEEP.handoff.json',seal)
print(json.dumps({'final':final,'decision':seal['decision'],'checks':len(checks),'failedChecks':failed},ensure_ascii=False,indent=2))
