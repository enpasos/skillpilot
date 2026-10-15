#!/usr/bin/env python3
"""Rebuild only this inactive KEEP candidate in a new ignored tmp host."""
from pathlib import Path
from datetime import datetime, timezone
import argparse, copy, hashlib, json, shutil, subprocess

def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', required=True)
    parser.add_argument('--destination', required=True)
    args=parser.parse_args()
    repo=Path(args.repo).resolve()
    ownroot=Path(__file__).resolve().parents[1]
    manifest=json.loads((ownroot/'REBUILD.native-import.manifest.json').read_text())
    destination=Path(args.destination).resolve()
    assert destination.is_relative_to(repo/'tmp'), 'Destination must be in repository tmp/'
    assert not destination.exists(), 'Refusing to overwrite an existing host'
    def bound(ref):
        path=repo/ref['path']
        assert path.is_file() and not path.is_symlink(), ref['path']
        assert digest(path)==ref['sha256'] and path.stat().st_size==ref['bytes'], ref['path']
        return path
    started=datetime.now(timezone.utc).isoformat()
    before=json.loads(bound(manifest['current554Before']).read_text())
    expected=copy.deepcopy(before)
    expected_by={g['id']:g for g in expected['goals']}
    selected_after=json.loads(bound(manifest['expectedAfterThree']).read_text())
    for goal in selected_after:
        expected_by[goal['id']]['resourceLinks']=goal['resourceLinks']
    # Verify every committable source before creating or mutating the new host.
    for module in manifest['stockModules']: bound(module)
    for asset in manifest['assets']:
        for key in ['originalPNG','originalCanonicalPNG','originalPublicPNG','originalBackendPNG','prompt','reconstructionPrompt','originalVSeal','originalVRecordSource']: bound(asset[key])
    destination.mkdir(parents=True)
    for module in manifest['stockModules']:
        target=destination/module['path'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(bound(module),target)
    canonical=destination/manifest['normalCanonicalAlias'];canonical.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(bound(manifest['current554Before']),canonical)
    logdir=destination/'actual-native-import-logs';logdir.mkdir()
    receipts=[]
    for asset in manifest['assets']:
        goalid=asset['goalId'];links=asset['reviewedResourceLinks'];assert len(links)==1;link=links[0]
        argv=['node',str(destination/'scripts/import_goal_visualization.mjs'),goalid,str(bound(asset['originalPNG'])),'--landscape',manifest['normalCanonicalAlias'],'--subject','chemie','--lang',link['lang'],'--provider',link['provider'],'--review-status',link['reviewStatus'],'--license',link['license'],'--description',link['description'],'--alt-text',link['altText'],'--prompt',str(bound(asset['prompt'])),'--reconstruction-prompt',str(bound(asset['reconstructionPrompt']))]
        runstart=datetime.now(timezone.utc).isoformat()
        proc=subprocess.run(argv,cwd=destination,capture_output=True)
        (logdir/f'{goalid}.stdout.txt').write_bytes(proc.stdout);(logdir/f'{goalid}.stderr.txt').write_bytes(proc.stderr)
        receipt={'goalId':goalid,'argv':argv,'cwd':str(destination),'startedAtUTC':runstart,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'exitCode':proc.returncode,'stdout':f'actual-native-import-logs/{goalid}.stdout.txt','stderr':f'actual-native-import-logs/{goalid}.stderr.txt'}
        receipts.append(receipt)
        assert proc.returncode==0,proc.stderr.decode()
        aliases=[f'curricula/DE/Gymnasium/visualizations/chemie/{goalid}/{goalid}.png',f'app/public/assets/goal-visualizations/chemie/{goalid}/{goalid}.png',f'backend/src/main/resources/static/assets/goal-visualizations/chemie/{goalid}/{goalid}.png']
        receipt['nativeOutputCopies']=[{'alias':alias,'sha256':digest(destination/alias),'bytes':(destination/alias).stat().st_size} for alias in aliases]
        assert all(r['sha256']==asset['originalPNG']['sha256'] and r['bytes']==asset['originalPNG']['bytes'] for r in receipt['nativeOutputCopies'])
        receipt['originalPNGAndContainerBytesExact']=True
        receipt['promptMetadataByteExact']=(destination/f'curricula/DE/Gymnasium/visualizations/chemie/{goalid}/prompt.de.md').read_bytes()==bound(asset['prompt']).read_bytes()
        receipt['reconstructionPromptMetadataByteExact']=(destination/f'curricula/DE/Gymnasium/visualizations/chemie/{goalid}/image-reconstruction-prompt.de.md').read_bytes()==bound(asset['reconstructionPrompt']).read_bytes()
    after=json.loads(canonical.read_text());assert after==expected
    before_by={g['id']:g for g in before['goals']};after_by={g['id']:g for g in after['goals']};ids=manifest['goalIds']
    assert len(after['goals'])==manifest['expectedWholeGoalCount']==554
    assert [g['id'] for g in before['goals']]==[g['id'] for g in after['goals']]
    other=[i for i in before_by if i not in ids];assert len(other)==manifest['expectedUnchangedOtherWholeGoals']==551
    assert all(before_by[i]==after_by[i] for i in other)
    for i in ids:
        assert {k:v for k,v in before_by[i].items() if k!='resourceLinks'}=={k:v for k,v in after_by[i].items() if k!='resourceLinks'}
    modules=[]
    for module in manifest['stockModules']:
        target=destination/module['path'];assert digest(target)==module['sha256'];modules.append({'path':module['path'],'sha256':digest(target),'unmodified':True})
    result={'schemaVersion':1,'role':'Actual unchanged stock native PNG import into new sparse host; technical KEEP reuse only','startedAtUTC':started,'completedAtUTC':datetime.now(timezone.utc).isoformat(),'destination':str(destination),'stockModules':modules,'imports':receipts,'canonicalAlias':manifest['normalCanonicalAlias'],'canonicalAfterSha256':digest(canonical),'wholeGoalCount':554,'targetGoalIds':ids,'otherWholeGoalsUnchanged':551,'targetNonResourceFieldsUnchanged':True,'wholeRootMetadataAndGoalOrderUnchanged':True,'allNinePNGOutputCopiesByteExact':True,'sourcePNGContainerMetadataIncludingC2PAUnchanged':True,'C2PACryptographicValidationPerformed':False,'generationInvoked':False,'newScientificVotes':0,'activeIntegration':False,'centralExecuted':False,'humanApproval':False,'humanTrial':False}
    (destination/'REBUILD.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__': main()
