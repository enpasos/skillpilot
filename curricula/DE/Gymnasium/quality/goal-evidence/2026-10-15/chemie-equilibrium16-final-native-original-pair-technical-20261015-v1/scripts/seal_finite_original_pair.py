# SPDX-License-Identifier: Apache-2.0
"""Seal completed original pairing without rerunning checks or normal writers."""
from pathlib import Path
import ast, datetime, hashlib, json, os
REPO=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file())
OWN=Path(__file__).resolve().parents[1]
def ref(p):
    b=p.read_bytes()
    return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def main():
    selector=OWN/'SELECTION.final-original-independent-D16-pair.technical.json'
    seal=OWN/'FILES.finite-original-D16-pair-technical.seal.json'
    assert not selector.exists() and not seal.exists()
    audit=json.loads((OWN/'checks/finite-audit.stdout.actual.json').read_text())
    assert audit['stockPairingExitCodes']==[0]*6 and audit['freshPortableStockCheckExitCode']==0 and audit['normalcurriculum_symlink_errors']==[]
    transport=json.loads((OWN/'checks/TRANSPORT.exact-native-and-original-rounds.json').read_text())
    native=OWN.parent/'chemie-equilibrium16-final-PNG-current422-native-preparation-technical-20261015-v2'
    payload={'schemaVersion':1,'role':'Finite original independent D16 technical pairing; no new scientific votes',
      'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
      'sourceNativeV2BlindSelector':ref(native/'INPUTS.blind-native16-whole-scientific-materials.selector.json'),
      'sourceNativeV2FinalSeal':ref(native/'FILES.finite-native16-technical.seal.json'),
      'originalIndependentReviewSelectors':transport['sourceReviewSelectors'],
      'frozenCanonicalSha256':audit['nativeFrozenCanonicalSha256'],'frozenSemanticSha256':audit['nativeFrozenSemanticSha256'],
      'normalPairedConfig':ref(OWN/'config/native16.original-context-paired10.config.json'),
      'resolutionIndex':ref(OWN/'native16/resolution-index.json'),'dualSummary':ref(OWN/'native16/dual-summary.json'),
      'synthesisAuthoring':ref(OWN/'native16/synthesis-authoring.json'),'synthesisManifest':ref(OWN/'native16/synthesis-decisions.json'),
      'exactOriginalTransport':ref(OWN/'checks/TRANSPORT.exact-native-and-original-rounds.json'),
      'originalDecisionOverlap':ref(OWN/'checks/OVERLAP.original-D16-no-new-votes.json'),
      'rebuildPhysicalMap':ref(OWN/'checks/REBUILD.portable-check-only.physical-source-alias-map.json'),
      'portableHelper':ref(OWN/'scripts/rebuild_portable_check_host.py'),
      'actualFiniteAudit':ref(OWN/'checks/finite-audit.stdout.actual.json'),
      'actualSixStockCommands':[ref(OWN/f'checks/{n}.command.actual.json') for n in ['native-check','native-summarize','native-synthesis','native-resolutions','native-finalize','native-final-check']],
      'actualPortableCheck':ref(OWN/'checks/portable-stock-check.command.actual.json'),
      'keepCurrentGoalIds':audit['keepCurrentGoalIds'],'deferredGoalIds':audit['deferredGoalIds'],
      'sourceScopeBlockGoalIds':audit['sourceScopeBlockGoalIds'],
      'originalProfileRevisionRecommendationsPreserved':audit['profileRevisionRecommendationsPreservedFromOriginalD'],
      'originalDRecords':32,'originalRuns':2,'keepCurrent':10,'deferred':6,
      'allOriginalReasonsAndUnderstandingPerformanceTransferChainsVerbatim':True,
      'maximumRationaleCharacters':3141,'stockPipelineExitCodes':[0]*6,'independentPortableCheckExitCode':0,
      'stockPipelineFailures':0,'preservedLocalPreparationFailures':2,'preservedLocalSchemaResolverFailures':1,
      'newScientificVotes':0,'newPAMVOrHumanGrants':0,'newM7Claims':0,'centralRuns':0,
      'authority':'Informed technical synthesis only; ten D-only same-context pairs; all other holds remain open',
      'readme':ref(OWN/'README.md')}
    dump(selector,payload)
    files=[];symlinks=[]
    for p in sorted(OWN.rglob('*')):
        if p.is_symlink():
            target=os.readlink(p);assert not os.path.isabs(target) and p.resolve().is_relative_to(REPO)
            symlinks.append({'path':p.relative_to(REPO).as_posix(),'target':target,'resolvedRepositoryPath':p.resolve().relative_to(REPO).as_posix(),
                             'exactTargetFiles':[r for r in transport['originalNativeV2Artifacts'] if '/bundle/' in r['path']]})
        elif p.is_file():
            if p.suffix=='.json':json.loads(p.read_text())
            elif p.suffix=='.jsonl':
                for row in p.read_text().splitlines():
                    if row.strip():json.loads(row)
            elif p.suffix=='.py':ast.parse(p.read_text())
            files.append(ref(p))
    assert len(symlinks)==1
    dump(seal,{'schemaVersion':1,'role':'Finite seal of original independent D16 technical pairing; self excluded',
       'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pathBase':'repository root',
       'selector':ref(selector),'fileCount':len(files),'files':files,'directoryAliases':symlinks,
       'ownRegularBytes':sum(r['bytes'] for r in files),'newScientificVotes':0,'centralRuns':0})
    final=json.loads(seal.read_text())
    for r in final['files']:assert ref(REPO/r['path'])==r
    actual_files=[p for p in OWN.rglob('*') if p.is_file() and not p.is_symlink() and p!=seal]
    assert len(actual_files)==final['fileCount']
    print(json.dumps({'selector':ref(selector),'seal':ref(seal),'sealedFilesExcludingSeal':len(files),'ownRegularBytesExcludingSeal':sum(r['bytes'] for r in files),'keep':10,'defer':6,'sourceBlocks':4,'stop':True},indent=2))
if __name__=='__main__':main()
