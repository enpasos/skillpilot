#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Verify retained inputs and externally retained original PDF bytes."""
import argparse, hashlib, json, subprocess
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[6]

def main():
    p=argparse.ArgumentParser();p.add_argument('--external-root',action='append',default=[]);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
    if a.output.exists():raise ValueError('Choose a fresh output; retained evidence is immutable')
    aliases={key:Path(value) for key,value in (item.split('=',1) for item in a.external_root)}
    decisions=HERE/'source-decisions.actual.json';data=json.loads(decisions.read_text());rows=[]
    for row in data['states']:
        s=row['sourceLocation'];path=ROOT/s['path'] if s['kind']=='retainedInput' else aliases[s['rootAlias']]/s['relativePath']
        digest=hashlib.sha256(path.read_bytes()).hexdigest()
        if digest!=row['sha256']:raise ValueError('Primary PDF bytes changed: '+row['land'])
        rows.append({'state':row['land'],'location':s,'officialUrl':row['officialUrl'],'sha256':digest,'pages':row['pages'],'matchesReviewedSource':True})
    paths=subprocess.check_output(['git','ls-files','curricula/DE/Gymnasium/input','curricula/DE/Gymnasium/mapping'],cwd=ROOT,text=True).splitlines()
    retained=[]
    additional_path='curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.directed-quantity-arrows-20261126-v1.review.json'
    additional=ROOT/additional_path
    mapping=json.loads(additional.read_text())
    endpoint=mapping['mappings']
    assert len(endpoint)==1 and endpoint[0]['legacyGoalId']=='7812213c-59e5-5d52-9a01-0c0534020cd5' and endpoint[0]['canonicalGoalId']==data['goalId'] and endpoint[0]['matchType']=='partial'
    extraction=json.loads((ROOT/mapping['sourceExtractionPath']).read_text())
    assert len(extraction['sourceGoals'])==301 and any(row['id']==endpoint[0]['legacyGoalId'] and row['sourceSpan']=='Ph8.3.2' for row in extraction['sourceGoals'])
    additions=[{'path':additional_path,'sha256':hashlib.sha256(additional.read_bytes()).hexdigest(),'sourceGoalId':endpoint[0]['legacyGoalId'],'canonicalGoalId':endpoint[0]['canonicalGoalId'],'matchType':'partial','existingOfficialSourceDenominator':301,'newOfficialSourceGoals':0}]
    for path in paths:
        if path==additional_path:continue
        if not path.endswith('.json') or not any(word in path.lower() for word in ('physics','physik')):continue
        before=subprocess.check_output(['git','show',data['baseCommit']+':'+path],cwd=ROOT)
        after=(ROOT/path).read_bytes()
        if before!=after:raise ValueError('Retained source or mapping bytes changed: '+path)
        retained.append({'path':path,'baseAndCurrentSha256':hashlib.sha256(after).hexdigest()})
    result={'schema':'physics-arrow-primary-source-byte-verification-v1','baseCommit':data['baseCommit'],'sourceDecisionsPath':str(decisions.relative_to(ROOT)),'sourceDecisionsSha256':hashlib.sha256(decisions.read_bytes()).hexdigest(),'verifiedStates':len(rows),'externalRootAliasResolution':{k:k for k in aliases},'externalBytesRedistributed':False,'sources':rows,'retainedSourceAndMappingCount':len(retained),'retainedSourceAndMappingBytesUnchanged':retained,'additionalSourceMappingInputs':additions,'additionalSourceMappingCount':len(additions)}
    a.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'verifiedStates':len(rows),'unchangedRetainedInputs':len(retained)}))
if __name__=='__main__':main()
