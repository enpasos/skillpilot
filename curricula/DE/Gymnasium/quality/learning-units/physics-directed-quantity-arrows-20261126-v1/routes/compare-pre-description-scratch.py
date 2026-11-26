#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Compare every source-bound view against the retained pre-text scratch."""
import argparse,gzip,hashlib,json,subprocess,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[6]
sys.path.insert(0,str(ROOT/'scripts'))
import generate_hessen_physics_stage_views as graph


def digest(raw):return hashlib.sha256(raw).hexdigest()
def value_digest(value):return digest(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def references(view):
    result=[]
    def visit(nodes,trail=()):
        for node in nodes:
            if node['kind']=='structure':visit(node['children'],(*trail,node['id']))
            else:result.append(dict(path=list(trail),reference=node))
    visit(view['rootNodes']);return result

def delta(before,after,path=''):
    if type(before)!=type(after):return [dict(path=path,before=before,current=after)]
    if isinstance(before,dict):
        return [d for key in sorted(set(before)|set(after)) for d in (delta(before[key],after[key],path+'/'+key) if key in before and key in after else [dict(path=path+'/'+key,before=before.get(key),current=after.get(key))])]
    if isinstance(before,list):
        return [d for i in range(max(len(before),len(after))) for d in (delta(before[i],after[i],path+'/'+str(i)) if i<len(before) and i<len(after) else [dict(path=path+'/'+str(i),before=before[i] if i<len(before) else None,current=after[i] if i<len(after) else None)])]
    return [] if before==after else [dict(path=path,before=before,current=after)]

def main():
    p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);a=p.parse_args()
    if a.output.exists():raise ValueError('Choose a fresh output; retained evidence is immutable')
    path=HERE/'scratch-pre-description-correction-90-views.actual.json.gz';scratch=json.loads(gzip.decompress(path.read_bytes()))
    canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json';current_bytes=(ROOT/canonical).read_bytes();current=json.loads(current_bytes)
    old_bytes=subprocess.check_output(['git','show','eb77c4fb68:'+canonical],cwd=ROOT);old=json.loads(old_bytes)
    old_by_id={g['id']:g for g in old['goals']};new_by_id={g['id']:g for g in current['goals']};text_rows=[]
    counterfactual=json.loads(current_bytes)
    selected=['4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe','d61ea362-f6c3-5eab-ac30-2d0e265ac0f6']
    for identifier in selected:
        before=old_by_id[identifier];after=new_by_id[identifier]
        fields=['description','descriptionEn']
        text_rows.append(dict(goalId=identifier,before={f:before[f] for f in fields},current={f:after[f] for f in fields},changedFields=[f for f in fields if before[f]!=after[f]]))
        target=next(g for g in counterfactual['goals'] if g['id']==identifier)
        for field in fields:target[field]=before[field]
    changed=delta(counterfactual,current)
    assert len(changed)==4 and all(d['path'].endswith(('/description','/descriptionEn')) for d in changed)
    rows=[]
    for item in scratch['rows']:
        live_path=ROOT/'curricula/DE/Gymnasium/composition-views/physik'/item['file'];raw=live_path.read_bytes();view=json.loads(raw)
        before=item['view'];old_roles=graph.role_atoms(before);new_roles=graph.role_atoms(view);before_refs=references(before);after_refs=references(view)
        diffs=delta(before,view)
        rows.append(dict(file=item['file'],viewId=view['viewId'],scope=view['scope'],scratchSha256=item['sha256'],currentSha256=digest(raw),viewValueUnchanged=before==view,viewBytesUnchanged=item['sha256']==digest(raw),
            rolesUnchanged=old_roles==new_roles,referencePlacesAndPayloadsUnchanged=before_refs==after_refs,
            rolesBeforeCounts={k:len(v) for k,v in old_roles.items()},rolesCurrentCounts={k:len(v) for k,v in new_roles.items()},
            rolesBeforeValueSha256=value_digest({k:sorted(v) for k,v in old_roles.items()}),rolesCurrentValueSha256=value_digest({k:sorted(v) for k,v in new_roles.items()}),
            roleDifferences={k:dict(added=sorted(new_roles[k]-old_roles[k]),removed=sorted(old_roles[k]-new_roles[k])) for k in old_roles},
            orderedReferencePlacesBeforeValueSha256=value_digest(before_refs),orderedReferencePlacesCurrentValueSha256=value_digest(after_refs),differences=diffs))
    assert len(rows)==90
    result=dict(schema='physics-arrow-pre-description-scratch-delta-v1',status='PASS' if all(r['viewValueUnchanged'] and r['rolesUnchanged'] and r['referencePlacesAndPayloadsUnchanged'] for r in rows) else 'CHANGED',
        instruction='Claude 26 November 2026,06:41CET: the approved DE/EN wording changes at electric-field superposition and video velocity arrows remain bounded; every view/role/place effect is exposed.',
        method='Retain all90 actually generated provisional views from before the two description corrections, then compare every current actual final view as a complete ordered JSON value and exact raw bytes. Resolved atomic roles and every ordered authored reference path/payload are separately compared. This is a before/after measurement, not a claim of release acceptance for the earlier draft task.',
        scratch=dict(path=str(path.relative_to(ROOT)),sha256=digest(path.read_bytes()),draftTaskSha256=scratch['draftTaskSha256'],unreleasedDraftNotActivated=True),
        descriptionChanges=text_rows,isolatedTextInputDifference=changed,
        textCounterfactualCanonicalValueSha256=value_digest(counterfactual),finalCanonical=dict(path=canonical,sha256=digest(current_bytes),valueSha256=value_digest(current)),
        oldTextSource=dict(baseCommit='eb77c4fb68',path=canonical,sha256=digest(old_bytes)),
        counts=dict(views=len(rows),changedViewValues=sum(not r['viewValueUnchanged'] for r in rows),changedViewBytes=sum(not r['viewBytesUnchanged'] for r in rows),changedRoles=sum(not r['rolesUnchanged'] for r in rows),changedReferencePlacesOrPayloads=sum(not r['referencePlacesAndPayloadsUnchanged'] for r in rows)),views=rows,
        boundaries=['Earlier K4 stayed needs_review; the earlier scratch was explicitly provisional and never changed live composition views.','Current actual generation validates genuinely released K4. The complete view comparison also exposes any difference caused by that final task instead of silently attributing it to a text edit.','Description rendering and pixels are not evaluated by authored role/place equality. Native current schedule/frontier checks have their own evidence.'])
    a.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result['counts']))
    if result['status']!='PASS':raise SystemExit('Inspect all explicitly recorded view differences')
if __name__=='__main__':main()
