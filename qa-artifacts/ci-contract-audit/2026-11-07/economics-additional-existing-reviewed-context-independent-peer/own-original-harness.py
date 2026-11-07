import os,subprocess,pathlib,json,hashlib,io,datetime
from PIL import Image
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');C=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/economics-additional-existing-reviewed-context-candidate';O=C.parent/'economics-additional-existing-reviewed-context-independent-peer'
sha=lambda b:hashlib.sha256(b).hexdigest();pins=json.loads((C/'private-family-pins.json').read_bytes());index=json.loads((C/'candidate-index.json').read_bytes());proof=json.loads((C/'raw-git-proof.json').read_bytes())
env=os.environ.copy()
for k in ['GIT_DIR','GIT_WORK_TREE','GIT_COMMON_DIR','GIT_INDEX_FILE','GIT_OBJECT_DIRECTORY','GIT_ALTERNATE_OBJECT_DIRECTORIES']:env.pop(k,None)
env.update(GIT_NO_REPLACE_OBJECTS='1',GIT_GRAFT_FILE=os.devnull)
p=subprocess.Popen(['git','--no-replace-objects','-C',str(ROOT),'--literal-pathspecs','cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,env=env)
cache={};checked={}
def obj(oid,typ):
 if oid in cache:return cache[oid]
 p.stdin.write((oid+'\n').encode());p.stdin.flush();head=p.stdout.readline().decode().strip().split();assert len(head)==3,(oid,head);got,kind,n=head;raw=p.stdout.read(int(n));assert p.stdout.read(1)==b'\n';assert got==oid and kind==typ;assert hashlib.sha1(typ.encode()+b' '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==oid
 checked[oid]={'oid':oid,'type':typ,'bytes':len(raw),'sha256':sha(raw)}
 if typ!='blob':cache[oid]=raw
 return raw
for expected in proof['objects']:
 raw=obj(expected['oid'],expected['type']);assert checked[expected['oid']]==expected
route=proof['parentRoute']
assert route[0]['oid']==pins['acceptedRepositoryCommit'] and route[-1]['oid']==pins['originalCommit']
for n,node in enumerate(route):
 raw=obj(node['oid'],'commit');headers=raw.split(b'\n\n',1)[0].splitlines();parents=[l[7:].decode() for l in headers if l.startswith(b'parent ')];assert parents==node['parents'] and sha(raw)==node['sha256']
 if n+1<len(route):assert route[n+1]['oid'] in parents

def tree(raw):
 out={};at=0
 while at<len(raw):
  sp=raw.index(b' ',at);zero=raw.index(b'\0',sp);mode=raw[at:sp].decode();name=raw[sp+1:zero].decode();oid=raw[zero+1:zero+21].hex();assert len(oid)==40 and name not in out;out[name]=(mode,oid);at=zero+21
 assert at==len(raw);return out

def path_raw(ref):
 commit=obj(ref['gitCommit'],'commit');oid=commit.split(b'\n',1)[0].decode().split()[1];parts=ref['path'].split('/')
 assert all(x not in ['','..','.'] for x in parts)
 for n,part in enumerate(parts):
  entries=tree(obj(oid,'tree'));assert part in entries;mode,oid=entries[part];assert mode in (['100644','100755'] if n==len(parts)-1 else ['40000'])
 raw=obj(oid,'blob');assert oid==ref['oid'] and sha(raw)==ref['sha256'];return raw
refs={x['path']:x for x in pins['originalReferences']};closure=[]
for ref in pins['originalReferences']:
 raw=path_raw(ref);same=None
 if ref['currentCopyRequired']:same=(ROOT/ref['path']).read_bytes()==raw;assert same
 closure.append(dict(ref,rawPathOidAndShaVerified=True,currentExact=same))
source_path=index['activeInputPins'][0]['path'];source=json.loads((ROOT/source_path).read_bytes());goals={x['id']:x for x in source['goals']};historical=json.loads(path_raw(refs[source_path]));old={x['id']:x for x in historical['goals']};qualified_path='contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json';qualified=json.loads((ROOT/qualified_path).read_bytes())
assert len(qualified['rows'])==57 and len({x['landscapeId']+':'+x['goalId'] for x in qualified['rows']})==57;existing={(x['landscapeId'],x['goalId']) for x in qualified['rows']}
ledgers=[json.loads((ROOT/row['path']).read_bytes()) for row in index['activeInputPins'][1:3]];records=[]
for row in index['rows']:
 gid=row['goalId'];goal=goals[gid];rev=json.loads(path_raw(refs[row['originalReview']['path']]));asset=path_raw(refs[row['reviewedAsset']['path']]);assert (source['landscapeId'],gid) not in existing
 assert goal['title']==rev['goalTitle'] and goal['description']==rev['goalDescription']
 assert rev['decision']=='KEEP' and rev['machineApproval']=='Reviewed AI' and not rev['humanApproved'] and not rev['imageAuthorIsReviewer'] and not rev['generationIsApproval'] and rev['blockingFindings']==[]
 links=[l for l in goal['resourceLinks'] if l['type']=='goal-visualization' and l.get('role','primary')=='primary'];assert len(links)==1;link=links[0];assert link['skillpilotId']==gid and link['lang']=='de' and link['resourceType']=='image'
 pub='app/public'+link['url'];canon='curricula/DE/Gymnasium/visualizations/'+link['url'].removeprefix('/assets/goal-visualizations/');assert pub==row['current']['publicAssetPath'] and canon==row['current']['canonicalAssetPath'];assert (ROOT/pub).read_bytes()==asset and (ROOT/canon).read_bytes()==asset
 im=Image.open(io.BytesIO(asset));im.load();assert im.format=='PNG' and im.size==(rev['actualDimensions']['width'],rev['actualDimensions']['height']);image={'format':im.format,'size':im.size,'pixelSha256':sha(im.convert('RGBA').tobytes()),'currentPublicAndCanonicalByteExactToAuthenticatedOriginal':True}
 derivatives=[]
 for d in rev['derivatives']:
  b=path_raw(refs[d['path']]);di=Image.open(io.BytesIO(b));di.load();assert di.width==d['width'];derivatives.append({'path':d['path'],'sha256':sha(b),'size':di.size,'fullDecodeSucceeded':True})
 lang={'reviewedFields':['title','description'],'attestedScope':rev['goalTextStatus'],'notClaimed':rev['notClaimed'],'interpretationLimits':rev['interpretationLimits']}
 if not row['corrected']:
  whole=json.loads(path_raw(refs[rev['authorCandidateBilingualGoalPath']]));auth=next(x for x in whole if x['id']==gid)
  for k in ['title','description','titleEn','descriptionEn']:assert auth[k]==goal[k]
  assert auth['dimensionTags']['demandLevel']==goal['dimensionTags']['demandLevel'];lang['reviewedFields']+=['titleEn','descriptionEn','demandLevel'];lang['fullAuthorGoalSha256']=sha(json.dumps(auth,ensure_ascii=False,sort_keys=True).encode());lang['authorInputOriginalPath']=rev['authorCandidateBilingualGoalPath']
 else:
  prior=json.loads(path_raw(refs[rev['preservedOriginalIndependentReceiptPath']]));assert prior['decision']=='REJECT' and prior['blockingFindings'];assert prior['goalTitle']==goal['title'] and prior['goalDescription']==goal['description'];assert path_raw(refs[prior['assetPath']])!=asset;lang['priorReject']={'path':rev['preservedOriginalIndependentReceiptPath'],'reviewedAt':prior['reviewedAt'],'assetSha256':prior['assetSha256'],'blockingFindings':prior['blockingFindings']};lang['englishAndDemandNotImportedFromRejectedReview']=True
 for ledger in ledgers:
  q=[x for x in ledger['records'] if x['goalId']==gid];assert len(q)==1;q=q[0];assert q['landscapeId']==source['landscapeId'] and q['imageUrl']==link['url'] and q['publicAssetPath']==pub and q['canonicalAssetPath']==canon and q['aiApproved']=='yes' and q['assetSha256']==q['aiApprovedAssetSha256']=='sha256:'+sha(asset) and q['humanApproved']=='no'
 records.append({'goalId':gid,'fullCurrentGoalDefinition':goal,'fullCurrentGoalSha256':sha(json.dumps(goal,ensure_ascii=False,sort_keys=True).encode()),'sourceDefinitionUnique':True,'historicalSourceIdExists':gid in old,'currentTitleAndFullDescriptionEqualActualOriginalReview':True,'languageScope':lang,'actualIndependentReviewAttribution':{'reviewer':rev['independentReviewer'],'reviewedAt':rev['reviewedAt'],'scopeReason':rev['actualInspection']['fachlichePruefung']},'image':image,'derivatives':derivatives,'bothCurrentQaLedgersMatchActualRoleAndImage':True,'overlapsActive57':False})
p.stdin.close();p.wait()
result={'kind':'independent-raw-original-and-semantic-binding-inspection','timeUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'acceptedRepositoryCommit':pins['acceptedRepositoryCommit'],'originalCommit':pins['originalCommit'],'method':'Own byte-framed Git cat-file batch reader with replacements/grafts/environment redirects disabled; independently parsed raw parent links and trees/path modes, SHA1 object framing and SHA256 bodies; decoded actual PNGs and compared full live goal texts, supplied author fields, primary resource roles and both QA ledgers. No new subject image review/approval.','rawGitObjectsAuthenticated':len(checked),'parentRouteNodes':len(route),'originalReferencesAuthenticated':len(closure),'externalAnchorMatchesCurrentActiveAuthorityLiteral':pins['acceptedRepositoryCommit']=='25a6f2164a81a7e6ae50db3557d20521fecf5124','active57Count':len(qualified['rows']),'new17Duplicates':0,'rawObjects':list(checked.values()),'originalReferences':closure,'records':records}
(O/'original-semantic-evidence.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'rawObjects':len(checked),'routeNodes':len(route),'originals':len(closure),'currentFullGoals':len(records),'bytes':(O/'original-semantic-evidence.json').stat().st_size}))
