#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Build this one draft from real native scope; never write canonical inputs."""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import re
import uuid


def sha(raw):return hashlib.sha256(raw).hexdigest()


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--repo-root',required=True,type=Path)
    parser.add_argument('--scope',required=True,type=Path);parser.add_argument('--output',required=True,type=Path)
    args=parser.parse_args();base=Path(__file__).resolve().parent;out=args.output;out.mkdir(exist_ok=False)
    scope=json.loads(args.scope.read_bytes());source=args.repo_root/scope['source']['path']
    assert sha(source.read_bytes())==scope['source']['sha256']=='85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e'
    landscape=json.loads(source.read_bytes());owner=landscape['landscapeId'];ids=scope['coveredGoalIds']
    assert len(ids)==len(set(ids))==22 and '875cb53c-b48d-5b2b-8cb0-e20f27534f16' not in ids
    goal_id=str(uuid.uuid5(uuid.UUID(owner),'skillpilot/assessment/informatics/q2/gk22/v1'))
    cluster_id=str(uuid.uuid5(uuid.UUID(owner),'skillpilot/practice/informatics/q2/gk22/v1'))
    assert all(g['id'] not in (goal_id,cluster_id) for g in landscape['goals'])
    materials=(base/'materials.md').read_text();tasks=(base/'tasks.md').read_text();solutions=(base/'solutions.md').read_text()
    steps=[];bindings=[];by={g['id']:g for g in landscape['goals']}
    for n,id in enumerate(ids,1):
        key=f'{n:02}';task=re.search(r'^## A'+key+r'\b[\s\S]*?(?=^## A|\Z)',tasks,re.M).group()
        solution=re.search(r'^## S'+key+r' / R'+key+r'\b[\s\S]*?(?=^## S|\Z)',solutions,re.M).group()
        text=re.search(r'Fünf Leistungen: ([\s\S]*)',solution).group(1).strip()
        criteria=[' '.join(p.split()).rstrip('.') for p in text.split(';')]
        assert len(criteria)==5,(key,criteria)
        steps.append({'id':'R'+key,'points':5,'description':'A'+key+'/S'+key+': '+'; '.join(criteria)+'. Je erfüllte Teilleistung 1 Punkt.'})
        bindings.append({'goalId':id,'goalTitle':by[id]['title'],'goalDescription':by[id]['description'],
            'taskAnchor':'A'+key,'solutionAnchor':'S'+key,'rubricId':'R'+key,'maxPoints':5,
            'observablePerformances':criteria,'fullTask':task,'fullSolution':solution})
    exam={'id':goal_id,'title':'Datenbanken und Datenverwendung – privater 22-Ziele-Prüfungsentwurf',
        'titleEn':'Databases and data use: private 22-goal assessment draft',
        'description':'Die lernende Person kann die 22 benannten Kompetenzen zu Datenmodellierung, Datenbankabfragen, Webanbindung, Datenschutz und Datenverwendung am vollständigen LeihZeit-Fall eigenständig anwenden und begründen.',
        'descriptionEn':'The learner can independently apply and justify the 22 specified competencies in data modelling, database queries, web integration, privacy and data use in the complete LeihZeit case.',
        'weight':1,'tags':['Practice','Assessment'],'contains':[],'requires':[],
        'phase':'Q2','dimensionTags':{'framework':'canonical-de-gymnasium-informatics','phase':'Q2','demandLevel':'AB3'},
        'type':'atomic','nodeKind':'exam',
        'semanticKind':'practiceAssessment',
        'examData':{'reviewStatus':'draft','reviewNote':'Eigener unveröffentlichter Materialentwurf; unabhängige Fachabnahme, Preparation- und Angebotsintegration fehlen. Keine Übertragung alter Ergebnisse.',
            'coveredGoalIds':ids,'coveredStrands':['I1','I2','I3','I4','I5','P1','P2','P3','P4','P5'],
            'demandLevels':['AB1','AB2','AB3'],'taskContent':materials+'\n\n'+tasks,
            'solutionContent':solutions,'scoring':{'maxPoints':110,'passingPoints':110,'steps':steps}}}
    cluster={'id':cluster_id,'title':'Privater Praxisentwurf: Datenbanken und Datenverwendung',
        'description':'Privater Platzierungsentwurf für genau den neuen GK-Q2-Prüfungsnachfolger.',
        'weight':1,'tags':['Practice','Assessment'],'contains':[goal_id],'requires':[],
        'phase':'Q2','dimensionTags':{'framework':'canonical-de-gymnasium-informatics','phase':'Q2'},
        'type':'cluster','semanticKind':'programStructure'}
    fixture=copy.deepcopy(landscape)
    roots=[g for g in fixture['goals'] if 'root' in g.get('tags',[])];assert len(roots)==1 and not roots[0].get('requires')
    roots[0]['contains'].append(cluster_id);fixture['goals'] += [cluster,exam]
    oldid='0df1bedd-5fda-5b3b-a959-c9610237bb3e'
    assert next(g for g in fixture['goals'] if g['id']==oldid)==next(g for g in landscape['goals'] if g['id']==oldid)
    view={'$schema':'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json','viewFormatVersion':'1.0',
        'viewId':'private-informatics-q2-gk22-material-check','landscapeId':owner,'language':'de',
        'scope':{'schoolForm':'Gymnasium','stage':'SekII','courseProfile':'GK'},
        'rootNodes':[{'kind':'structure','id':'private-q2-gk','label':'Privater GK-Q2-Materialentwurf',
            'children':[{'kind':'goalEntry','goalId':id} for id in ids]+[{'kind':'canonicalSubtree','goalId':cluster_id}]}]}
    def write(name,value):
        raw=(json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode();(out/name).write_bytes(raw);return {'path':name,'bytes':len(raw),'sha256':sha(raw)}
    payloads=[write('goal-draft.json',exam),write('cluster-draft.json',cluster),write('private-fixture.json',fixture),
        write('private-view.json',view),write('per-goal-performance-binding.json',bindings)]
    receipt={'purpose':'one-private-observed22-material-draft-not-qualified-GK-scope-or-offer','source':scope['source'],
        'scopeRawSha256':sha(args.scope.read_bytes()),'goalId':goal_id,'clusterId':cluster_id,
        'uuidDerivation':{'namespaceOwner':owner,'examName':'skillpilot/assessment/informatics/q2/gk22/v1','clusterName':'skillpilot/practice/informatics/q2/gk22/v1'},
        'coveredGoalIds':ids,'observedNativeCountIsNotRequiredScope':True,'countryAndCanonicalScopeQualification':'unresolved pending independent primary-source/gap review','originalOldExamUnchanged':True,'sourceUnchanged':sha(source.read_bytes())==scope['source']['sha256'],
        'requiresStatus':'empty only in private material fixture; production prerequisite route explicitly unresolved, no derivation from coverage',
        'intendedKindIsNotAuthoritativeLedgerApproval':True,'passingPointsProposal':'110/110 for full22 confirmation; not official grading or an approved exam contract',
        'payloads':payloads,'activeWrites':False,'independentContentApproval':False,'maturityApproval':False}
    write('build-receipt.json',receipt);print(json.dumps({'goalId':goal_id,'clusterId':cluster_id,'coverage':len(ids),'criteria':len(steps),'maxPoints':110,'status':'draft'}))


if __name__=='__main__':main()
