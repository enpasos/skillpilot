# SPDX-License-Identifier: Apache-2.0
import copy,hashlib,json,os,subprocess
from pathlib import Path
R=Path.cwd();P=Path(__file__).resolve().parent.relative_to(R);A=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-health-sexuality-addiction-twelve-whole-material-raster-source-author-candidate-v1')
def read(p):return json.loads(Path(p).read_text())
def ref(p):p=Path(p);data=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(data).hexdigest(),'bytes':len(data)}
def put(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
after=read(P/'sources/after394-atlas.current-summary.normal.config.json');pairs=[];bySid={}
for mpath in after['mappingPaths']:
 m=read(mpath);x=read(m['sourceExtractionPath']);pairs.append({'mapping':ref(mpath),'extraction':ref(m['sourceExtractionPath']),'jurisdiction':x['jurisdiction']})
 for g in x['sourceGoals']:bySid[g['id']]={'mappingPath':mpath,'mapping':m,'extraction':x,'goal':g}
original=read(P/'sources/original187-whole-witnesses.history.exact.json');current=copy.deepcopy(original);removed=[];actualPrimaries=[]
for row in current['rows']:
 new=[]
 for w in row['wholeDirectSourceWitnesses']:
  sid=w['wholeCurrentSourceGoal']['id'];ctx=bySid[sid];m=ctx['mapping'];ex=ctx['extraction'];g=ctx['goal'];match=next((z for z in m['mappings'] if z['legacyGoalId']==sid and z['canonicalGoalId'].split(':')[-1]==row['goalId']),None)
  if match is None:
   assert sid=='sl-biology-seki-nw56-2012-pfl5-004-c265b417' and row['goalId']=='a6f2bcaf-df2d-5144-aa8f-49396b12d31b';removed.append({'sourceGoalId':sid,'canonicalGoalId':row['goalId']});continue
  passage=next((x for x in ex.get('passages',[]) if x['id']==g.get('passageId')),{});keys=set([g.get('sourceDocumentKey'),passage.get('sourceDocumentKey')])|{t.split(':',1)[1] for t in g.get('tags',[]) if t.startswith('sourceDocument:')};keys.discard(None);docs=ex.get('sourceDocuments') or [ex['sourceDocument']];selected=[d for d in docs if not keys or d['key'] in keys];assert len(selected)==1,(sid,keys)
  w.update(wholeCurrentSourceGoal=g,wholeCurrentMappingRecord=match,wholeCurrentSourceDecisions=[z for z in m['decisions'] if z['sourceGoalId']==sid],mapping=ref(ctx['mappingPath']),extraction=ref(m['sourceExtractionPath']),sourceDocument=selected[0],actualCurrentPassage=passage,newSourceApproval=False)
  locator=g['actualPrimaryLocator'];primary=ref(locator['actualPrimaryPath']);assert primary['sha256']==locator['actualPrimarySha256'];w['actualReadOperatorPrimaryBinding']=primary;actualPrimaries.append(primary);new.append(w)
 row['wholeDirectSourceWitnesses']=new;row['directWitnessCount']=len(new);row['newSourceApproval']=False
current.update(role='Neutral current source whole objects after additive candidates, 186 direct witnesses from original187; independent source review pending',whole31PairBindings=pairs,originalWitnessCount=187,currentDirectWitnessCount=sum(len(r['wholeDirectSourceWitnesses']) for r in current['rows']),removedOnlyUnsupportedVegetativeHumanPair=removed,newSourceApproval=False,humanApproval=False)
assert current['currentDirectWitnessCount']==186 and len(removed)==1
put(P/'sources/current186-whole-direct-witnesses-and-selected-actual-primaries.neutral.json',current)
# Reuse exact already versioned primary bytes for normal legacy offline aliases; never claim those aliases are portable files.
known=[]
index=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-neuro-verhalten-hormone-ten-current343-source-raster-native-technical-preparation-20261010-v1/sources/all-actual-current-primary-portable-copies.json')
known.extend(r['exactCurrentPortableCopy'] for r in read(index)['records'])
known.extend(ref(d['actualPrimaryPath']) for d in read(A/'sources/actual-primary-registry.author-working.json')['documents'])
knownBySha={b['sha256']:b for b in known}
bindings=[]
for receipt in [P/'sources/before-raw-normal-output/source-projection.receipt.json',P/'sources/after-raw-normal-output/source-projection.final-summary.receipt.json']:
 for b in read(receipt)['inputBindings']:bindings.append(b)
for rel in ['native/current394-before.normal.config.json','native/current394-after.normal.config.json']:
 for f in read(P/rel)['evidenceReviewPaths']:bindings.append(ref(f))
for rel in ['inputs/current394-QA.before.exact.json','candidate/current394-QA-plus-twelve-pending.inactive.json']:
 for row in read(P/rel)['records']:
  if row['visualizationState']!='available':continue
  original=Path(row['canonicalAssetPath']);assert original.is_file();b=ref(original);assert b['sha256']==row['assetSha256'];bindings.append(b)
for f in ['AGENTS.md','docs/concept/skill-graph/atomic-goal-visualizations.md','scripts/validate_schemas.py','scripts/goal_visualization_common.mjs','app/scripts/goalBookModel.ts','app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/materializePositiveGoalEvidenceCandidates.ts','app/scripts/positiveGoalEvidenceReview.ts','app/scripts/materializeGoalDescriptionRolloutBatch.ts','app/package.json','app/package-lock.json']:
 bindings.append(ref(f))
unique={(b['path'],b['sha256']):b for b in bindings};paths=sorted({b['path'] for b in unique.values()});ignored=subprocess.run(['git','check-ignore','--stdin'],input=''.join(x+'\n' for x in paths),text=True,capture_output=True);assert ignored.returncode in [0,1];ignoredPaths=set(ignored.stdout.splitlines());portable=[]
for b in unique.values():
 f=Path(b['path'])
 if f.is_file() and not f.is_symlink() and b['path'] not in ignoredPaths:actual=ref(f);assert actual['sha256']==b['sha256']
 else:
  assert b['sha256'] in knownBySha,(b['path'],b['sha256']);actual=knownBySha[b['sha256']];assert ref(actual['path'])==actual
 head=Path(actual['path']).read_bytes()[:100].lstrip();kind='PDF actual bytes' if head.startswith(b'%PDF') else 'HTML actual bytes' if head.lower().startswith((b'<!doctype html',b'<html')) else 'JSON/JSONL/code/PNG/other actual bytes; derived source JSON is not an official primary'
 portable.append({'normalLogicalInputPathDiagnosticOnly':b['path'],'normalExpectedSha256':b['sha256'],'actualRegularPortableBinding':actual,'byteClassification':kind,'logicalAliasIsRegularCommittable':b['path'] not in ignoredPaths and f.is_file() and not f.is_symlink(),'newSourceApproval':False})
allPaths=sorted({r['actualRegularPortableBinding']['path'] for r in portable}|{b['path'] for b in actualPrimaries}|{str(f) for f in P.rglob('*') if f.is_file()});check=subprocess.run(['git','check-ignore','--stdin'],input=''.join(x+'\n' for x in allPaths),text=True,capture_output=True);assert check.returncode in [0,1] and not check.stdout,check.stdout
for f in allPaths:assert Path(f).is_file() and not Path(f).is_symlink(),f
put(P/'inputs/all-current-portable-external-bindings.neutral.json',{'schemaVersion':1,'role':'Actual current normal inputs mapped to regular committable evidence bytes, diagnostic alias paths confer no approval','normalInputBindingCount':len(portable),'records':portable,'originalWitnessesExamined':187,'currentDirectWitnesses':186,'currentSourcePrimaries':list({b['path']:b for b in actualPrimaries}.values()),'allOwnAndActualInputFilesRegularCommittable':True,'privateData':False,'sourceApproval':False,'humanApproval':False})
# Standalone carrier uses exactly selected original PNG bytes; raw ordinary bundle remains unchanged.
html=P/'native/twelve-current-native/bundle/book.html';text=html.read_text();directory=P/'native/portable-current-rasters/bundle';directory.mkdir(parents=True,exist_ok=True);carrier=directory/'book.html';replacements=[]
for row in read(P/'inputs/twelve-current-raster-bindings.neutral.json')['records']:
 original=next(r for r in row['actualRasterViews'] if r['role']=='original');relative=os.path.relpath(original['path'],directory);assert row['futurePublicURL'] in text;text=text.replace('src="'+row['futurePublicURL']+'"','src="'+relative+'"');replacements.append({'goalId':row['goalId'],'actualOriginal':original,'originalNativeSrc':row['futurePublicURL'],'portableRelativeSrc':relative})
carrier.write_text(text)
put(P/'checks/portable-native12-original-PNG-carrier-bindings.json',{'schemaVersion':1,'rawOrdinaryHtml':ref(html),'portableOriginalLinkedHtml':ref(carrier),'changes':replacements,'onlyImageSrcAttributesChanged':True,'originalPNGBytesUnchanged':True,'scientificApproval':False})
print(json.dumps({'originalWitnesses':187,'currentWitnesses':186,'current31Pairs':len(pairs),'distinctSelectedActualPrimaries':len({x['path'] for x in actualPrimaries}),'portableNormalBindings':len(portable),'allRegularCommittable':True,'portableOriginalLinkedHtml':str(carrier),'approved':0}))
