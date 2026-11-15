#!/usr/bin/env python3
"""Read-only current-view checkpoint; reuse unchanged for the later 837 After."""
from pathlib import Path
import argparse, subprocess, json, hashlib, gzip, datetime, re, os

ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
SHA=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--label',required=True)
    parser.add_argument('--stages',default='CrossStage')
    parser.add_argument('--classpath-file',type=Path,default=ROOT/'tmp/land-stage-excerpts-20261115/native-classpath.txt')
    args=parser.parse_args()
    if not re.fullmatch(r'[A-Za-z0-9._-]+',args.label):raise ValueError('Unsafe checkpoint label')
    out=HERE/args.label;out.mkdir(exist_ok=False)
    inputs=set(ROOT.glob('curricula/DE/Gymnasium/canonical/*.json'))
    for subject in ['physik','mathematik']:inputs.update(ROOT.glob('curricula/DE/Gymnasium/composition-views/'+subject+'/*.view.json'))
    for p in ['curricula/curriculum_manifest.json','curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json','curricula/DE/Gymnasium/provenance/gymnasium-physics-duration-model-policy.json','app/src/generated/gymnasiumDurationOfferings.ts','app/src/utils/durationModel.ts','app/scripts/generateGymnasiumDurationOfferings.ts','app/package.json','app/package-lock.json','backend/build.gradle','backend/gradle.lockfile']:
        if (ROOT/p).is_file():inputs.add(ROOT/p)
    java=['backend/src/main/java/com/skillpilot/backend/composition/StagePlanRuntimeIndex.java','backend/src/main/java/com/skillpilot/backend/composition/CourseProfileCompositionViewMerger.java','backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java']
    inputs.update(ROOT/p for p in java)
    pending=[HERE/'measure-actual-maps.mts',HERE/'prepare-contexts.mts']
    seen=set()
    while pending:
        p=pending.pop().resolve()
        if p in seen:continue
        seen.add(p);inputs.add(p)
        for rel in re.findall(r'(?:from\s*|import\s*)[\'\"](\.[^\'\"]+)[\'\"]',p.read_text()):
            target=p.parent/rel
            possible=[target,*[Path(str(target)+ext) for ext in ['.ts','.tsx','.js','.mjs','.json']],target/'index.ts',target/'index.tsx']
            found=next((x for x in possible if x.is_file()),None)
            if found and found.suffix in ['.ts','.tsx','.js','.mjs','.json']:pending.append(found)
    inputs.update([Path(__file__).resolve(),HERE/'ExportActualViews.java'])
    # An active index and every authored authority it pins belong to the reader.
    planroot=ROOT/'curricula/DE/Gymnasium/stage-plans'
    if planroot.exists():inputs.update(planroot.rglob('*.json'))
    pins={str(p.relative_to(ROOT)):SHA(p) for p in sorted(inputs)}
    physics='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
    math='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
    if args.label.startswith('before809'):
        assert pins[physics]=='1ab730054209aa710b34e852bf3eab4f84e16f348b003fcaba6e2b2988c6b2b1'
        assert pins[math]=='306eeed52f6b0b1059264ccb1d4ea23227dd3ddff4d19f2a1ca096511d65a149'
    cp=args.classpath_file.resolve().read_text().strip().replace('\n',os.pathsep)
    manifest={'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'gitHead':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'label':args.label,'stages':args.stages.split(','),'sourcePins':pins,'runtimeClasspathFile':str(args.classpath_file),'runtimeClasspathFileSha256':SHA(args.classpath_file),'canonicalCopiesStoredInEvidence':0,'physicsGoalCount':len(json.loads((ROOT/physics).read_text())['goals']),'mathGoalCount':len(json.loads((ROOT/math).read_text())['goals'])}
    (out/'input-pins.actual.json').write_text(json.dumps(manifest,indent=2)+'\n')
    commands=[]
    def run(command,log):
        with (out/log).open('w') as f:r=subprocess.run(command,cwd=ROOT,stdout=f,stderr=subprocess.STDOUT)
        commands.append({'argv':command,'log':log,'exitCode':r.returncode})
        if r.returncode:raise RuntimeError(log+': '+(out/log).read_text()[-7000:])
    run([str(ROOT/'app/node_modules/.bin/tsx'),str(HERE/'prepare-contexts.mts'),str(out/'contexts.actual.json'),args.stages],'contexts.log')
    classes=out/'classes';classes.mkdir()
    run(['javac','-J-Xmx512m','-cp',cp,'-d',str(classes),*[str(ROOT/p) for p in java],str(HERE/'ExportActualViews.java')],'compile-native.log')
    run(['java','-Xmx1g','-cp',str(classes)+os.pathsep+cp,'com.skillpilot.backend.composition.ExportActualViews',str(ROOT),str(out/'contexts.actual.json'),str(out/'native-views.json')],'native-selection.log')
    (out/'native-views.json.gz').write_bytes(gzip.compress((out/'native-views.json').read_bytes(),compresslevel=9,mtime=0));(out/'native-views.json').unlink()
    run([str(ROOT/'app/node_modules/.bin/tsx'),str(HERE/'measure-actual-maps.mts'),str(out)],'actual-map.log')
    for path,digest in pins.items():
        if SHA(ROOT/path)!=digest:raise RuntimeError('Pinned input/code changed during measurement: '+path)
    receipt={'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'allPinnedSourcesAndCodeUnchanged':True,'liveWrites':0,'commands':commands,'artifacts':[{'path':str(p.relative_to(out)),'sha256':SHA(p),'bytes':p.stat().st_size} for p in sorted(out.glob('*')) if p.is_file()]}
    (out/'receipt.actual.json').write_text(json.dumps(receipt,indent=2)+'\n')
    rows=json.loads((out/'summary.actual.json').read_text())['rows'];measured=[r for r in rows if r['status']=='measured'];supported=[r for r in measured if not r['authorization'].startswith('unsupported')]
    print(json.dumps({'output':str(out),'contexts':len(rows),'measured':len(measured),'supportedOrNational':len(supported),'unsupportedPolicyRows':len(measured)-len(supported),'topWithBackflows':sum(any(m['topLevelBackwardSummaryArrows'] for m in r['maps']) for r in supported),'nestedWithBackflows':sum(any(m['nestedBackwardSummaryArrows'] for m in r['maps']) for r in supported),'contextsWithOutsideAtoms':sum(any(m['outsideUnitAtoms'] for m in r['maps']) for r in supported)}))

if __name__=='__main__':main()
