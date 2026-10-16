# SPDX-License-Identifier: Apache-2.0
"""Nur endliche Rohvorbereitung; keine finalen P/A/M/V-Fingerprints oder Checks."""
from pathlib import Path
import copy,hashlib,json
R=Path.cwd();O=Path(__file__).resolve().parents[1];E=O.parent
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=R/r['path'];assert ref(p)==r,p;return p
def put(p,d):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
specs=[('Q2PAV3','chemie-q2-three-current426-targeted-informed-PAV-review-20261015-v1/OUTPUTS.finite-targeted-informed-P3-A3-V2.selector.json','272eb8f28b0c20b6dfaa19542df1f7f69011e4f2252a1dff24cb289090c4d77c'),('b47P1','chemie-b47-glutamate-one-case-synthetic-observations-informed-independent-P1-20261015-v1/OUTPUTS.finite-informed-b47-case2-independent-P1.selector.json','35cdd0158e26134057320b237db4b2e9e93216ef256279c64857067181c0e7ab'),('P2A2','chemie-digestion-polarimetry-two-current426-informed-PA-20261015-v1/OUTPUTS.finite-current426-informed-P2-A2.selector.json','fd768e8f96536f404d7795a1269444a1aaeb9f2a155fd162c4228fbda581d0e7'),('f4P1','chemie-polarimetry-one-reference-unit-clarification-informed-independent-P1-20261015-v1/OUTPUTS.finite-informed-f4-reference-units-independent-P1.selector.json','b34972bab5e25469fc20e8d14578ec8d98589a8e8652170bde95fa399851f603')]
sources={};source_refs={}
for label,rel,h in specs:
 p=E/rel;assert ref(p)['sha256']=='sha256:'+h;s=load(p);seal=R/s.get('finalSealPath',s.get('sealPath'))
 for r in load(seal)['files']:verify(r)
 sources[label]=s;source_refs[label]={'selector':ref(p),'seal':ref(seal)}
native=E/'chemie-current426-q2-three-current-context-native-and-P077-technical-20261015-v1';np=native/'OUTPUTS.finite-current426-Q2-three-Native8-and-P077.technical-selector.json';assert ref(np)['sha256']=='sha256:6f8049c29fe0ef0181d8297898b6b00c7f0e78075ef867b7ec251e4e4622def9';ns=load(np)
for r in load(R/ns['finalSealPath'])['files']:verify(r)
tp=E/'chemie-two-local-assay-and-intestinal-absorption-texts-author-successor-20261015-v1/NEUTRAL.finite-two-local-text-author.selector.json';assert ref(tp)['sha256']=='sha256:e551228dbfab617e75ab30e7524e5fefd399451ffe2d4fb63739261dbc4cbbd7';ts=load(tp)
for r in load(verify(ts['seal']))['files']:verify(r)
delta=load(verify(ts['wholeBeforeAfter']));base=load(verify(ts['baseCanonical']));assert ts['baseCanonical']==ns['canonical'];by={g['id']:g for g in base['goals']};selected={}
for d in delta['changes']:
 assert by[d['goalId']]==d['before'];assert sorted(k for k in d['before'] if d['before'].get(k)!=d['after'].get(k))==sorted(d['changedFields']);selected[d['goalId']]=d['after']
current=copy.deepcopy(base);current['goals']=[copy.deepcopy(selected.get(g['id'],g)) for g in base['goals']]
assert len(current['goals'])==570 and sum(g==h for g,h in zip(base['goals'],current['goals']))==568
cp=O/'candidate/canonical570.current426.two-local-author-text-successors.awaiting-context-binding.json';put(cp,current)
q2=load(verify(sources['Q2PAV3']['wholeActualCaseRoutesAndProfiles']));p2=load(verify(sources['P2A2']['wholeActualCasesAndProfiles']))
profiles={r['goalId']:copy.deepcopy(r) for r in q2['wholeThreeAuthorProfiles']}
profiles.update({r['goalId']:copy.deepcopy(r['wholeLatestV2AuthorProfile']) for r in p2['rows']})
brief_delta=[]
for label,field,gid,caseid in [('b47P1','wholeCorrectedCase','b47d542d-c2d7-5554-95dc-10b47ab622ab','case-2'),('f4P1','correctedWholeCase','f4d5a02d-711b-5a6b-a41d-971359c1f64d','execution-1')]:
 actual=load(verify(sources[label][field]));profile=profiles[gid]['profile'];i=next(i for i,c in enumerate(profile['applicationCaseBriefs']) if c['id']==caseid);old=copy.deepcopy(profile['applicationCaseBriefs'][i]);new={k:actual['case'][k] for k in old}
 for lang in ['De','En']:new['taskDemand'+lang]=actual['case']['materials'+lang]+'\n\n'+actual['case']['taskDemand'+lang]
 assert max(len(v) for v in new.values())<=2000;profile['applicationCaseBriefs'][i]=new
 brief_delta.append({'goalId':gid,'caseId':caseid,'originalBrief':old,'newLiteralMaterialAndBrief':new,'exactWholeCurrentCase':sources[label][field],'rule':'Nur Originalmaterial + zwei Zeilenumbrüche + Originalaufgabe; alle übrigen Brief-Felder wörtlich übernommen, sonstiger Profilinhalt exakt.'})
four=[profiles[g] for g in ['b47d542d-c2d7-5554-95dc-10b47ab622ab','ffec1761-c954-5b5d-a0cf-4c8367f91705','f4d5a02d-711b-5a6b-a41d-971359c1f64d']]
oldbook=[json.loads(l) for l in (native/'profiles/four-exact-current-candidate-book-inputs.jsonl').read_text().splitlines()];four.append(next(r for r in oldbook if r['goalId'].startswith('0773')))
rawp=O/'inputs/four-unaffected-b47-ffec-f4-and077.raw-profile-bodies.no-final-FPs.json';put(rawp,four)
put(O/'inputs/b47-and-f4.actual-whole-successor-brief-material-literal-composition.json',brief_delta)
put(O/'inputs/old-96-and0b-raw-author-profiles.awaiting-genuine-text-context.json',[profiles[g] for g in selected])
memcfg=E/'chemie-bcp-current426-bounded-inactive-integration-technical-20261015-v1/preparation/config/M426.original416-plus-ten-FIRSTs.ten-views.inactive.config.json';mc=load(memcfg);mrecords=[json.loads(l) for l in (R/mc['reviewPath']).read_text().splitlines()];m2=[r for r in mrecords if r['goalId'] in selected];assert len(m2)==2
put(O/'inputs/M2.exact-original-decisions-and-explicit-local-text-deltas.no-new-memory-science.json',{'schemaVersion':1,'originalConfig':ref(memcfg),'originalWholeRecordFile':ref(R/mc['reviewPath']),'originalCardsReview':ref(R/mc['cardReviewPath']),'originalTwoWholeRecords':m2,'exactTwoTextDeltas':delta['changes'],'allRequiresContainsResourcesAndExistingMemoryRefsUnchanged':True,'original96Status':'memory_required','original0bStatus':'no_memory_needed','newMemoryScience':False,'fingerprintBindingNotYetWritten':True})
put(O/'PREPARED.raw-five-PA-two-texts-awaiting-genuine-context-and-final-bindings.json',{'schemaVersion':1,'role':'Rohvorbereitung vor finaler echter Textkontextfreigabe; keine normalen neuen Voten','baseNative8Selector':ref(np),'genuineScientificSources':source_refs,'localTextAuthorSelector':ref(tp),'canonicalCandidate':ref(cp),'unchangedOtherWholeGoals':568,'goals':570,'ordinaryAtomicDenominator':426,'fourUnaffectedRawProfiles':ref(rawp),'waitingForGenuineTwoTextPAVContextResult':True,'normalRecords':0,'stockChecks':0,'newScientificVotes':0,'finalBookPolicy':'Nach finalen P5/A5/M2/V2-Bindungen genau ein kohärenter finaler Native8Prepare+Check; alte8Seiten immutable.','actualDDeltaSightRequired':True,'noAutomaticDescriptionFingerprintRewrite':True})
print(json.dumps({'currentGoals':570,'atoms':426,'wholeLocalTextChanges':2,'other568Exact':True,'unaffectedRawProfilesPrepared':4,'normalRecords':0,'finalFingerprints':0,'stockChecks':0,'waitingForGenuineTwoTextContext':True}),flush=True)
