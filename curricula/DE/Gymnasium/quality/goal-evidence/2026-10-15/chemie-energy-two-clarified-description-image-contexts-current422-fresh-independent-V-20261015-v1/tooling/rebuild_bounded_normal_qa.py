"""Reproduce the bounded current2 normal QA checks in a small private host.

Writes only the requested host under repo/tmp; sealed review evidence is read-only.
"""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import subprocess
import uuid


def main():
    repo=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file() and (p/'app').is_dir())
    root=Path(__file__).resolve().parents[1]
    config=json.loads((root/'CONFIG.bounded-current2-normal-QA.json').read_text())
    parser=argparse.ArgumentParser()
    parser.add_argument('--host',type=Path,default=repo/'tmp'/('chemie-two-current-V2-rebuild-'+str(uuid.uuid4())))
    args=parser.parse_args();host=args.host.resolve()
    if not host.is_relative_to(repo/'tmp'):
        raise ValueError('host must be under repo/tmp')
    host.mkdir(parents=True,exist_ok=False)
    for entry in config['stockSourceFiles']:
        src=repo/entry['path']
        if 'sha256:'+hashlib.sha256(src.read_bytes()).hexdigest()!=entry['sha256']:
            raise ValueError('stock source drift: '+entry['path'])
        dst=host/entry['path'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
    (host/'app/node_modules').symlink_to(repo/'app/node_modules')
    for sourcekey,alias in [('boundedWholeGoals',config['normalLandscapePath']),('normalQaCandidate',config['normalQaPath'])]:
        entry=config[sourcekey];src=repo/entry['path']
        if 'sha256:'+hashlib.sha256(src.read_bytes()).hexdigest()!=entry['sha256']:
            raise ValueError('sealed input drift')
        dst=host/alias;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
    for entry in config['images']:
        src=repo/entry['path']
        if 'sha256:'+hashlib.sha256(src.read_bytes()).hexdigest()!=entry['sha256']:
            raise ValueError('image drift')
        public=host/'app/public'/entry['publicUrl'].lstrip('/')
        public.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,public)
        canonical=host/entry['path'];canonical.parent.mkdir(parents=True,exist_ok=True);canonical.symlink_to(public)
    command=[str(repo/'app/node_modules/.bin/tsx'),str(host/'app/scripts/generateGoalVisualizationQaLedgers.ts'),'--subject=chemie']
    for cmd in [command,command+['--check']]:
        subprocess.run(cmd,cwd=host,check=True)
    probe=host/'predicate.mts'
    probe.write_text("""import {readFileSync} from 'node:fs'
import {isAiApprovedForCurrentAsset} from './app/src/utils/goalVisualizationQaStatus.ts'
const qa=JSON.parse(readFileSync('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','utf8'))
if(qa.records.length!==2)throw Error('wrong bounded denominator')
for(const r of qa.records){
 const expected=r.goalId==='16b24dc5-0e48-5e3b-8307-01289db8d1a9'
 if(isAiApprovedForCurrentAsset(r)!==expected)throw Error('original review changed')
 if(isAiApprovedForCurrentAsset({...r,assetSha256:'sha256:'+'0'.repeat(64)}))throw Error('wrong hash accepted')
}
console.log('current2: one approval, one metadata deferral; changed hash rejected')
""")
    subprocess.run([str(repo/'app/node_modules/.bin/tsx'),str(probe)],cwd=host,check=True)
    size=sum(p.stat().st_size for p in host.rglob('*') if p.is_file() and not p.is_symlink())
    if size>=10_000_000:
        raise ValueError('bounded host exceeded 10 MB')
    print(json.dumps({'host':str(host),'regularBytes':size,'scope':'two current V contexts only'}))


if __name__=='__main__':
    main()
