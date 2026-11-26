#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Seal an exact A2 successor without rewriting the retained H/N records."""
import argparse, collections, gzip, hashlib, json, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
EXCLUDED = {'d8fc6295-d0db-59e5-bd90-080bbc508c3a'}  # same historical H/N comparison contract

def references(view):
    result=[]
    def visit(nodes, trail=()):
        for node in nodes:
            if node['kind']=='structure':visit(node['children'],(*trail,node['id']))
            elif node.get('goalId') not in EXCLUDED:result.append({'path':list(trail),'reference':node})
    visit(view['rootNodes']);return result

def digest(rows):
    return hashlib.sha256(json.dumps(rows,ensure_ascii=True,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
    if args.output.exists():raise ValueError('Choose a fresh output; retained evidence is immutable')
    predecessor=ROOT/'curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/routes/h-reference-place-successor.actual.json'
    baseline=HERE/'n-final-90-reference-places.actual.json.gz';data=json.loads(gzip.decompress(baseline.read_bytes()));rows=[]
    for item in data['views']:
        old_bytes=subprocess.check_output(['git','show',data['baseCommit']+':'+item['path']],cwd=ROOT)
        if hashlib.sha256(old_bytes).hexdigest()!=item['sha256']:raise ValueError('A2 baseline drifted from final N '+item['path'])
        before=references(json.loads(old_bytes));stored=[x for x in item['references'] if x['reference'].get('goalId') not in EXCLUDED]
        if before!=stored:raise ValueError('Stored A2 reference baseline drifted '+item['path'])
        after=references(json.loads((ROOT/item['path']).read_text()))
        if before==after:continue
        encode=lambda x:json.dumps(x,ensure_ascii=True,sort_keys=True,separators=(',',':'))
        bc,ac=collections.Counter(map(encode,before)),collections.Counter(map(encode,after))
        removed=[json.loads(k) for k,n in (bc-ac).items() for _ in range(n)];added=[json.loads(k) for k,n in (ac-bc).items() for _ in range(n)]
        rows.append({'path':item['path'],'viewId':item['viewId'],'beforeReferenceCount':len(before),'afterReferenceCount':len(after),'beforeOrderedReferencePlacesSha256':digest(before),'afterOrderedReferencePlacesSha256':digest(after),'removedExactReferences':removed,'addedExactReferences':added,'changedOrderPositions':before!=after and bc==ac})
    result={'schema':'physics-arrow-exact-reference-successor-v1','baseCommit':data['baseCommit'],'predecessorPath':str(predecessor.relative_to(ROOT)),'predecessorSha256':hashlib.sha256(predecessor.read_bytes()).hexdigest(),'baselinePath':str(baseline.relative_to(ROOT)),'baselineSha256':hashlib.sha256(baseline.read_bytes()).hexdigest(),'viewCount':len(data['views']),'changedViewCount':len(rows),'method':'Replay byte-exact final N views from Git, retain every ordered reference and exact before/after delta. H and N records remain immutable; the original H/N ignored-task convention is unchanged.','views':rows,'boundaries':['Exact current ordered-reference validation is retained; no previous fingerprint is silently replaced.','This authoring record creates or transfers no learner results.']}
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(len(rows))
if __name__=='__main__':main()
