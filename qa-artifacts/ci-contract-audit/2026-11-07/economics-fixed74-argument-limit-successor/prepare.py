#!/usr/bin/env python3
import hashlib,json,shutil,subprocess
from pathlib import Path
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3]
OLD=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/economics-fixed74-authority-integration-candidate'
W=Path(json.loads((OUT/'ram-location.json').read_bytes())['path'])
raw=(OLD/'private-code/scripts/visualization_qualified_context_capsule.py').read_text()
assert hashlib.sha256(raw.encode()).hexdigest()=='f3a0b4cd62982c2ce334e708e7139d127210cbe57b2fea47097dd6a741486a3e'
start=raw.index("if __name__ == '__main__':")
new=raw[:start]+'''def _with_fixed74_limits(action):
    """Guard the effective Namespace from the one authoritative kernel parser."""
    def bounded(args):
        if args.accepted_census_sha256 == '234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785':
            kernel.require(args.maximum_working_bytes <= 201326592,
                           'Fixed74 working allowance exceeds its external192-MiB bound')
            kernel.require(args.maximum_object_bytes <= 268435456,
                           'Fixed74 object allowance exceeds unchanged256-MiB bound')
            kernel.require(args.maximum_embedded_bytes <= 16777216,
                           'Fixed74 embedded allowance exceeds unchanged16-MiB bound')
        return action(args)
    return bounded


if __name__ == '__main__':
    # Parse exactly once inside unchanged kernel.main(). Both actual operations
    # receive the same effective Namespace after this closed resource guard.
    kernel.originals = index_originals
    kernel.build = _with_fixed74_limits(kernel.build)
    kernel.materialize = _with_fixed74_limits(kernel.materialize)
    kernel.main()
'''
p=OUT/'private-code/scripts/visualization_qualified_context_capsule.py';p.parent.mkdir(parents=True);p.write_text(new)
for directory in ['scratch','results']: (W/directory).mkdir()
shutil.copytree(ROOT/'app/scripts',W/'scripts')
shutil.copytree(ROOT/'scripts',W/'root-scripts',ignore=shutil.ignore_patterns('__pycache__'))
shutil.copytree(ROOT/'contracts/goal-visualization-context/v1',W/'contracts')
for source in (OLD/'private-code').rglob('*'):
 if not source.is_file():continue
 relative=source.relative_to(OLD/'private-code');path=str(relative)
 if path.startswith('app/scripts/'):target=W/'scripts'/relative.relative_to('app/scripts')
 elif path.startswith('scripts/'):target=W/'root-scripts'/relative.relative_to('scripts')
 elif path.startswith('contracts/goal-visualization-context/v1/'):target=W/'contracts'/relative.relative_to('contracts/goal-visualization-context/v1')
 else:continue
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
(W/'root-scripts/visualization_qualified_context_capsule.py').write_text(new)
index=W/'workspace.index.readonly';index.write_bytes((ROOT/'.git/index').read_bytes());index.chmod(0o444)
subprocess.run(['git','init','--quiet',str(W/'origin')],check=True)
for _ in range(2):subprocess.run(['git','-C',str(W/'origin'),'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','--quiet','--allow-empty','-m','Unrelated argument successor host'],check=True)
subprocess.run(['git','clone','--quiet','--depth=1',(W/'origin').as_uri(),str(W/'host')],check=True)
record={'overridePath':str(p.relative_to(ROOT)),'overrideSha256':hashlib.sha256(new.encode()).hexdigest(),'oldSelectorSha256':hashlib.sha256(raw.encode()).hexdigest(),
 'rawKernelSha256':hashlib.sha256((W/'root-scripts/visualization_review_git_capsule.py').read_bytes()).hexdigest(),
 'workspaceIndexSnapshotSha256':hashlib.sha256(index.read_bytes()).hexdigest(),'sourcePoWiSnapshotSha256':hashlib.sha256((W/'politikwirtschaft49.readonly.json').read_bytes()).hexdigest(),
 'onlyOneCodeOverride':True,'old74PacketWritten':False}
(OUT/'preparation.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
