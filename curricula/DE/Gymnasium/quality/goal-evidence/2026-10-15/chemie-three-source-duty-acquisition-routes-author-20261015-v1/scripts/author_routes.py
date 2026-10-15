#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Own static author routes only; preserve complete source/current objects."""
import copy,hashlib,json,subprocess
from pathlib import Path

ROOT=Path.cwd();OUT=Path(__file__).resolve().parents[1];REL=OUT.relative_to(ROOT).as_posix()
PREP='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-source3-six-contexts-current422-native-preparation-root-20261015-v1'
BASE='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-four-source-duties-explicit-compulsory-domain-carriers-author-20261014-v3'
LAB='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-laboratory-communication-fifteen-current419-whole-author-20261015-v1'
AUTHOR='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1'
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,x):(OUT/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
neutral=read(PREP+'/NEUTRAL.native-nine-physical-inputs.json')
land=read(neutral['wholeCanonical']['path']);G={g['id']:g for g in land['goals']}
def gid(prefix):return next(i for i in G if i.startswith(prefix))
HB=list(map(gid,['416df','13d4','fcc73','326d45']))
BW=list(map(gid,['416df','13d4','135170','9b5d','e7c363','4285','448815','9b56']))
ALL=list(dict.fromkeys(HB+BW));SRC=neutral['newSourceGoalIds']
assert len(ALL)==10
rows=[]
for name,adds in [('de-hb-lk',HB),('de-bw-lk',BW),('de-hb-gk',[]),('de-bw-gk',[])]:
 p=BASE+('/candidate/views/'+name+'.view.author.json' if adds else '/inputs/views/'+name+'.view.exact.json')
 old=read(p);new=copy.deepcopy(old)
 original=(ROOT/p).read_bytes();(OUT/'inputs'/f'{name}.whole-original.exact.json').write_bytes(original)
 if adds:
  old_children=copy.deepcopy(new['rootNodes'][0]['children'])
  branch={'kind':'structure','id':name+'-curated-acquisition-foundations',
    'label':'Expliziter Lernpfad: Grundlagen für den LK-Pflichtbereich4.3' if name=='de-hb-lk' else 'Expliziter Lernpfad: Grundlagen für die gewählte Farbstoffroute',
    'children':[{'kind':'goalEntry','goalId':i,'projectionRole':'target'} for i in adds]}
  new['rootNodes'][0]['children'].insert(1,branch)
  assert new['rootNodes'][0]['children'][:1]+new['rootNodes'][0]['children'][2:]==old_children
  write('candidate/'+name+'.whole-view.author.json',new)
  out=REL+'/candidate/'+name+'.whole-view.author.json'
 else:out=REL+'/inputs/'+name+'.whole-original.exact.json'
 rows.append({'name':name,'before':bind(p),'beforePhysicalCopy':bind(REL+'/inputs/'+name+'.whole-original.exact.json'),
   'after':bind(out),'scope':old['scope'],'addedTargetGoalIds':adds,
   'patch':[{'op':'add','path':'/rootNodes/0/children/1','value':branch}] if adds else [],
   'allOriginalNodesPreservedExactly':True,'removedTargetGoalIds':[],
   'sourceMappingsAdded':0,'sourceLabelForAddedPrerequisites':False,'prerequisiteOnlyEntriesAdded':0})
write('CAS.two-whole-LK-views-and-two-exact-GK-controls.author.json',{'schemaVersion':1,'role':'Static author proposal; no independent course approval','rows':rows})

# Full graph bodies are retained for every relevant requires/contains prerequisite.
closure=set(ALL+SRC);todo=list(closure)
while todo:
 g=G[todo.pop()]
 for i in g.get('requires',[])+g.get('contains',[]):
  if i not in closure:closure.add(i);todo.append(i)
write('source-context/whole-acquisition-targets-three-carriers-and-prerequisites.exact.json',{
 'canonical':neutral['wholeCanonical'],'newRouteTargetGoalIds':ALL,'sourceGoalIds':SRC,
 'goals':[G[i] for i in sorted(closure)],'goalObjectEdits':[],'semanticKindEdits':[],'mappingEdits':[]})

source=[]
for pdf,pages in [('curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf',[36,37]),('curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf',[42])]:
 extracts=[]
 for page in pages:
  cmd=['pdftotext','-f',str(page),'-l',str(page),'-layout',pdf,'-']
  raw=subprocess.run(cmd,cwd=ROOT,check=True,capture_output=True).stdout
  extracts.append({'physicalPage':page,'command':cmd,'fullPageTextSHA256':'sha256:'+hashlib.sha256(raw).hexdigest(),
                   'fullPageRead':True,'fullOfficialPageCopiedIntoPacket':False})
 source.append({'pdf':bind(pdf),'readPages':extracts,'rights':'Official third-party source; no relicensing.'})
write('SOURCE.whole-official-pages-and-bounded-operator-scope.author.json',{
 'sources':source,
 'HB':{'physicalPage36':'Topic4.3 requires explaining active ingredient isolation and the interplay of analysis, synthesis and molecular modelling. Its experimental examples are examples, not mandatory performance operators for the two new explanatory carriers.',
       'physicalPage37':'Topic4.3 is compulsory in LK; the four listed other topics are a choice inventory, with one chosen for GK/two for LK. This route patch does not resolve the whole optional selection programme.',
       'boundedChange':'Add four explicit ordinary target foundations for40/93 in LK only. Basic practical goal operators retain their actual-performance requirement.'},
 'BW':{'physicalPage42Printed40':'Section3.4.8(4), Leistungsfach, requires one further selected family across historical/current/future perspectives. The existing curated dyes route is retained as that selection.',
       'boundedChange':'Add eight explicit ordinary target foundations for d815. Preserve every original dye and alternative inventory entry. Do not turn all example families into cumulative requirements.'},
 'sourceMappingPolicy':'No mapping is added merely because a prerequisite is educationally useful. The new separate foundation branch is explicitly our acquisition design, not an official-source label.'})

write('INPUTS.physical-exact-selector.json',{
 'schemaVersion':1,'role':'Finite inactive author acquisition-route proposal',
 'nativePreparation':bind(PREP+'/NEUTRAL.native-nine-physical-inputs.json'),
 'canonical':neutral['wholeCanonical'],'semanticLedger':neutral['kindLedger'],
 'sourceGoalIds':SRC,'HBAddedTargetGoalIds':HB,'BWAddedTargetGoalIds':BW,
 'viewCAS':bind(REL+'/CAS.two-whole-LK-views-and-two-exact-GK-controls.author.json'),
 'source3CompleteCasesUnchanged':neutral['completeElevenDEENCases'],
 'source3WholeGoalsUnchanged':neutral['wholeThreeGoals'],
 'sealedLab15Input':bind(LAB+'/FILES.finite-own-artifacts.seal.json'),
 'sealedThirtyLaborCasesUnchanged':bind(LAB+'/materials/thirty-complete-DE-EN-cases.author.json'),
 'informedAuthorDiagnostic':bind('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-source3-six-contexts-current422-native-fresh-independent-a-20261015-v1/CHECK.actual-course-projections.json'),
 'newApprovals':0,'newStrictClosures':0,'restoredBindings':0,'activeIntegration':False})
print(json.dumps({'wholeLKViewCandidates':2,'exactGKControls':2,'HBTargetAdditions':len(HB),'BWTargetAdditions':len(BW),
 'uniqueAcquisitionTargets':len(ALL),'wholeRelevantGoals':len(closure),'mappingEdits':0,'goalEdits':0}))
