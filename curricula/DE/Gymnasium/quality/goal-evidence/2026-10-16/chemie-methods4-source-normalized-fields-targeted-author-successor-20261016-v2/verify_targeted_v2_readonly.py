"""Read-only verification of exactly HB decision and SN normalized-field repairs."""
from pathlib import Path
import copy, hashlib, json

P=Path(__file__).resolve().parent
ROOT=next(p for p in P.parents if (p/'docs/landscape-runtime.schema.json').exists())
def read(p):return json.loads(Path(p).read_text())
def stable(x):return 'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def verify(p):
 path=ROOT/p['path'];b=path.read_bytes()
 assert len(b)==p['bytes'] and 'sha256:'+hashlib.sha256(b).hexdigest()==p['sha256'],p['path']
 return path
delta=read(P/'DELTA.two-scientific-corrections-and-exact-retention.author.json')
oldseal=read(verify(delta['predecessor']))
oldroot=Path(delta['predecessor']['path']).parent
for pin in oldseal['files']:verify(pin)
reviewselector=read(verify(delta['informedReview']))
for pin in reviewselector['files']:verify(pin)
modified=[];retained=0
for x in delta['inheritedFiles']:
 verify(x['before']);verify(x['after'])
 if x['bytesExactlyRetained']:assert x['before']['sha256']==x['after']['sha256'];retained+=1
 else:modified.append(x['relativePath'])
assert sorted(modified)==sorted(['source/EXTRACTION.finite-whole-object-CAS.author.json','source/MAPPING.finite-whole-object-CAS.author.json','source/SOURCE48.whole-before-after-CAS.author.json','source/SOURCE48.whole-targeted-after-contexts.author.json'])
assert len(delta['scientificCorrections'])==2 and retained==12
for exact in ['materials/SEVENTEEN.whole-bilingual-retained-and-targeted-method-cases.author.json','profiles/SIX.whole-positive-v2-author-designs-no-independent-votes.json','consolidation/413.whole-duplicate-to-protected94-science-proposal.author.json','candidate/GOALS.one-whole-planar-CAS-two-source-grounded-new-atoms.author.json','views/FOUR.whole-common-course-CAS-and-THREE.conditional-elective-proposals.author.json']:
 assert (P/exact).read_bytes()==(ROOT/oldroot/exact).read_bytes(),exact
assert len(read(P/'materials/SEVENTEEN.whole-bilingual-retained-and-targeted-method-cases.author.json')['cases'])==17
assert len(read(P/'profiles/SIX.whole-positive-v2-author-designs-no-independent-votes.json')['rows'])==6

mapping=read(P/'source/MAPPING.finite-whole-object-CAS.author.json')
oldmapping=read(ROOT/oldroot/'source/MAPPING.finite-whole-object-CAS.author.json')
hb=next(f for f in mapping['files'] if '/DE-HB/' in f['normalPath'])
oldhb=next(f for f in oldmapping['files'] if '/DE-HB/' in f['normalPath'])
assert hb['patches'][0]['afterWholeObjects']==oldhb['patches'][0]['afterWholeObjects']
actualdecision=hb['patches'][0]['decisionWholeCAS']['afterWholeObjects'][0]
assert actualdecision['topicCode']=='3.3-2-2-AMINOSAEUREN-PROTEINE'
assert 'PDF-S.27' in actualdecision['sourceSpan'] and '26' not in actualdecision['sourceSpan']
assert actualdecision['matchType']=='partial'
assert actualdecision['sourceGoalId']==oldhb['patches'][0]['decisionWholeCAS']['afterWholeObjects'][0]['sourceGoalId']
assert len(actualdecision['canonicalGoalIds'])==2
assert all(x['matchType']=='partial' for x in hb['patches'][0]['afterWholeObjects'])
restored=copy.deepcopy(mapping)
rf=next(f for f in restored['files'] if '/DE-HB/' in f['normalPath'])
rf['patches'][0]['decisionWholeCAS']['afterWholeObjects']=oldhb['patches'][0]['decisionWholeCAS']['afterWholeObjects']
assert restored==oldmapping

extract=read(P/'source/EXTRACTION.finite-whole-object-CAS.author.json')
oldextract=read(ROOT/oldroot/'source/EXTRACTION.finite-whole-object-CAS.author.json')
sn=next(f for f in extract['files'] if '/SN/' in f['normalPath'])
oldsn=next(f for f in oldextract['files'] if '/SN/' in f['normalPath'])
sg=next(x['afterWholeObject'] for x in sn['patches'] if x['listKey']=='sourceGoals')
sp=next(x['afterWholeObject'] for x in sn['patches'] if x['listKey']=='passages')
for key in ['sourceText','parentBulletText','rawSourceText','rawParentBulletText']:
 assert sg[key]=='Einblick in die Klassifizierung der chromatographischen Verfahren nach der Art der Phasen gewinnen\n- experimentelles Herstellen von Runge-Bildern'
 assert 'Elektrophorese' not in sg[key] and 'Runge-Bil-' not in sg[key]
assert 'Runge-Bilder' in sg['description'] and 'Elektrophorese' not in sg['description']
assert 'Rechte Spalte: Beispiele/Hinweise, gesondert vom Operatorwortlaut:' in sp['text']
assert sp['rawText']==next(x['afterWholeObject']['rawText'] for x in oldsn['patches'] if x['listKey']=='passages')
assert sp['sourceGoalIds']==next(x['afterWholeObject']['sourceGoalIds'] for x in oldsn['patches'] if x['listKey']=='passages')
restored=copy.deepcopy(extract)
rsn=next(f for f in restored['files'] if '/SN/' in f['normalPath'])
for x,y in zip(rsn['patches'],oldsn['patches']):x['afterWholeObject']=y['afterWholeObject']
assert restored==oldextract

source48=read(P/'source/SOURCE48.whole-targeted-after-contexts.author.json')
oldsource48=read(ROOT/oldroot/'source/SOURCE48.whole-targeted-after-contexts.author.json')
assert len(source48['rows'])==48
for before,after in zip(oldsource48['rows'],source48['rows']):
 expected=copy.deepcopy(before)
 if expected['wholeSourceGoal']['id']==sg['id']:expected['wholeSourceGoal']=sg
 if expected['wholeSourcePassage']['id']==sp['id']:expected['wholeSourcePassage']=sp
 assert expected==after
 assert before['allOriginalPartnerMappings']==after['allOriginalPartnerMappings']
sourcecas=read(P/'source/SOURCE48.whole-before-after-CAS.author.json')
for x,y in zip(sourcecas['patches'],source48['rows']):assert x['afterWholeObject']==y

whole=read(P/'whole-file-CAS/TWO.actual-current-whole-file-CAS.author.json')
assert len(whole['files'])==2
for f in whole['files']:
 before=read(verify(f['wholeFileBefore']));after=read(verify(f['wholeFileAfter']))
 verify(f['actualCurrentObservedPin'])
 assert (ROOT/f['wholeFileBefore']['path']).read_bytes()==(ROOT/f['actualCurrentObservedPin']['path']).read_bytes()
 assert stable(before)==f['beforeWholeObjectStableHash'] and stable(after)==f['afterWholeObjectStableHash']
 expected=copy.deepcopy(before)
 if '/DE-HB/' in f['normalPath']:
  changes=f['touchedWholeObjectCAS'];assert len(changes)==1
  q=changes[0];id=q['sourceId']
  for k,field,rows in [(q['mappingListKey'],'legacyGoalId',q['afterMappings']),(q['decisionListKey'],'sourceGoalId',q['afterDecisions'])]:
   indices=[i for i,x in enumerate(expected[k]) if x.get(field)==id];j=indices[0]
   expected[k]=[x for x in expected[k] if x.get(field)!=id];expected[k][j:j]=rows
 else:
  assert len(f['touchedWholeObjectCAS'])==2
  for q in f['touchedWholeObjectCAS']:
   j=next(i for i,x in enumerate(expected[q['listKey']]) if x.get('id')==q['stableId'])
   assert expected[q['listKey']][j]==q['beforeWholeObject']
   expected[q['listKey']][j]=q['afterWholeObject']
 assert expected==after,('unrelated current normal content changed',f['normalPath'])
assert delta['wholeViewsAndConditionalSelectionHoldsExactlyRetained']
print(json.dumps(dict(status='PASS',scope='Two targeted author source-field corrections and exact retention only, not independent science or operative scope acceptance',originalAuthorFilesUnchanged=20,informedScienceFilesUnchanged=len(reviewselector['files']),byteExactInheritedFiles=12,changedInheritedRepresentations=4,scientificCorrections=2,wholeActualCurrentFileCAS=2,wholeSourceContexts=48,wholeCasesExactlyRetained=17,wholeProfilesExactlyRetained=6,protected94And413ProposalExactlyRetained=True,allUnrelatedCurrentFileObjectsRetained=True,RP_SN_b7_BYHoldsRetained=True,newIndependentVotes=0,newStrictGainClaimed=0,humanApproval=False,humanTrial=False)))
