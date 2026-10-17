import json,pathlib,hashlib,datetime,fitz
O=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-P13-independent-a-v1')
S=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-P13-native-preparation-technical-root-v1/SELECTOR.clean-current-native13-reviewer-inputs.sealed.json')
def sha(b):return hashlib.sha256(b).hexdigest()
def stable(v):return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def pin(p):
 p=pathlib.Path(p); b=p.read_bytes();return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
s=json.loads(S.read_text()); assert pin(S)['sha256']=='45ac7189db1533bbda09ca83b03f007a78269903a57db3e80b51cd4e855be3c7'
n=pathlib.Path(s['nativeRoot']);cap=pathlib.Path(s['capsule']);i=json.load(open(n/'round-a/description-review-input.json'));w=json.load(open(s['cleanSupplementPins'][0]['path']));b=json.load(open(n/'bundle/book-model.json'));obs={str(S):pin(S)}
for p in s['commonInputPins']+s['bundleArtifactPins']+s['cleanSupplementPins']+s['rounds'][0]['inputPins']+[s['configPin'],s['batchManifestPin']]:
 q=pin(p['path']); assert q['sha256']==p['sha256'] and q['bytes']==p['bytes'];obs[q['path']]=q
source_checks=[]
for pathkey,digestkey in [('landscapePath','landscapeDigest'),('compositionViewPath','compositionViewDigest'),('semanticKindLedgerPath','semanticKindLedgerDigest'),('goalVisualizationQaPath','goalVisualizationQaDigest')]:
 p=cap/b['source'][pathkey];d=json.load(open(p));q=pin(p);obs[str(p)]=q;h='sha256:'+sha(stable(d));assert h==b['source'][digestkey];source_checks.append({'path':str(p),'rawSha256':q['sha256'],'semanticSha256':h,'matches':True})
c=json.load(open(cap/b['source']['landscapePath']));goals={g['id']:g for g in c['goals']}; pfile=cap/b['source']['evidenceReviewSources'][0]['path'];ps=[json.loads(t) for t in pfile.read_text().splitlines() if t.strip()];pm={p['goalId']:p for p in ps};obs[str(pfile)]=pin(pfile)
pages={p['goalId']:p for p in b['pages']};pdf=fitz.open(n/'bundle/book.pdf');assert len(pdf)==15
checks=[]
for j,(ig,wr) in enumerate(zip(i['goals'],w['rows']),1):
 g=wr['currentWholeCanonicalGoal'];id=g['id'];assert id==ig['goalId']==s['goalIds'][j-1];assert goals[id]==g
 for field,inp in [('title','currentTitleDe'),('titleEn','currentTitleEn'),('description','currentDescriptionDe'),('descriptionEn','currentDescriptionEn')]:assert g[field]==ig[inp]
 assert g['requires']==ig['canonicalContext']['requires']; assert g.get('applicability')==ig['canonicalContext'].get('applicability');assert pm[id]['profile']==wr['currentWholePositiveEvidenceRecord']['profile']==ig['reviewContext']['evidenceProfile']['profile']
 pg=pages[id];assert pg['goalFingerprint']==ig['goalFingerprint'] and pg['pageFingerprint']==ig['pageFingerprint'];assert pg['description']==g['description']
 a=cap/'app/public'/pg['visualization']['url'].lstrip('/');q=pin(a);obs[str(a)]=q;assert 'sha256:'+q['sha256']==pg['visualization']['originalDigest']
 txt=pdf[j+1].get_text();assert id in txt and ''.join(g['title'].split()) in ''.join(txt.split())
 checks.append({'goalId':id,'wholeCanonicalEqualsCurrentCapsule':True,'wholeProfileEqualsFrozenInputAndCurrentCapsule':True,'DE_EN_title_description_requires_applicability_exact':True,'pageAndGoalFingerprintsExact':True,'actualPdfPhysicalPage':j+2,'titleAndIdOnActualPage':True,'boundImageSha256':q['sha256'],'teacherPrerequisiteCount':len(wr['teacherContext']['currentDirectPrerequisiteWholeGoals']),'currentDirectMappingPartnerCount':len(wr['currentDirectSourcePartnersForAuthoredJurisdictions'])})
for wr in w['rows']:
 for partner in wr['currentDirectSourcePartnersForAuthoredJurisdictions']:
  p=partner['mappingPin'];q=pin(p['path']);assert q['sha256']==p['sha256'];obs[q['path']]=q
for p in w['originalSourceReadOnlyPins']:
 q=pin(p['path']);assert q['sha256']==p['sha256'];obs[q['path']]=q
repo=pathlib.Path('/home/enpasos/projects/skillpilot')
extra=[repo/'AGENTS.md',pathlib.Path('/home/enpasos/.codex/attachments/c176f25a-3aea-4378-88ad-e0312e383d41/goal-objective.md'),repo/'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf']
for rel in ['2026-10-15/chemie-energy-four-context-satisfied-current422-positive-and-atomic-informed-20261015-v1/materials/four-whole-cases8.targeted-informed-successor.json','2026-10-15/chemie-energy-eleven-kept-current422-positive-and-atomic-informed-20261015-v1/materials/eleven-whole-cases22.targeted-informed-successor.json','2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json','2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1/inputs/nineteen-whole-operative-materials.exact.json']:
 extra.append(repo/'curricula/DE/Gymnasium/quality/goal-evidence'/rel)
for suffix in ['a','a-fresh','b','b-fresh']:
 extra.append(repo/f'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q3-thirteen-current402-four-images-author-20261012-v3/positive/assessment-graphs/q3-18-{suffix}.png')
for p in extra:obs[str(p)]=pin(p)
for p in (O/'source-snapshots').glob('*.html'):obs[str(p)]=pin(p)
report={'schemaVersion':1,'role':'READ-ONLY technical identity checks supporting a NONBLIND scientific diagnosis; not stock D/P acceptance','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'selectorPin':pin(S),'inputCount':len(obs),'wholeGoalCount':13,'pdfPhysicalPages':len(pdf),'scientificVerdictsFromHashChecks':False,'sourceSemanticDigestChecks':source_checks,'goals':checks,'allChecksPass':True,'sourceContentCoverage':'Mapping/source hashes establish identity only. Actual science reading is limited to the explicit diagnostic coverage, not every mapping partner/source page.','inputPins':list(obs.values())}
(O/'CHECK.actual-read-bindings-and-input-pins.NONBLIND.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'allChecksPass':True,'goals':len(checks),'pinnedFiles':len(obs),'pdfPhysicalPages':len(pdf),'output':str(O/'CHECK.actual-read-bindings-and-input-pins.NONBLIND.json')},indent=2))
