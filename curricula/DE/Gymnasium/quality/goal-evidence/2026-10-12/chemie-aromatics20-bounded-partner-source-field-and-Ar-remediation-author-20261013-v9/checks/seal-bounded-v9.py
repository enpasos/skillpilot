# Apache-2.0. Freeze only own regular author outputs, preserve all parent bytes/modes.
import hashlib,json,os,copy
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/';N='chemie-aromatics20-bounded-partner-source-field-and-Ar-remediation-author-20261013-v9';O=E+N;C='tmp/'+N+'/private-parent'
def read(p):return json.loads((R/p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256((R/p).read_bytes()).hexdigest()
def obj(x):return 'sha256:'+hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def write(p,x):(R/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def ref(p):return {'path':p,'sha256':sha(p)}
sp=O+'/NEUTRAL.targeted-v9-fix-verification.input-selector.json';s=read(sp);checks=read(O+'/checks/normal-compiler-countrymetadata-and-source-impact.actual.json');assert checks['passed'] and not checks['errors'];assert checks['counts']['protected231']==231 and checks['counts']['curricularAtomic']==402
mp=read(s['mappingComponentPatches']['path']);ep=read(s['sourceFieldPatches']['path']);cp=read(s['caseCorrections']['path']);pp=read(s['profileCorrection']['path']);errors=[];parents=[];empty=[];references=[]
for p in mp['patches']:
    path=p['parent']['path'];expected=p['parent']['sha256'];assert sha(path)==expected
    b=read(path);a=read(p['privateSuccessor']['path']);assert sha(p['privateSuccessor']['path'])==p['privateSuccessor']['sha256'];parents.append({**p['parent'],'actualParentHardlinkCount':(R/path).stat().st_nlink,'parentBytesPreserved':True,'parentModeOctal':oct((R/path).stat().st_mode&0o777)})
    for x in p['removedRows']:assert obj(b['mappings'][int(x['pointer'].split('/')[-1])])==x['beforeSha256']
    for x in p['decisionReplacements']:assert obj(b['decisions'][int(x['pointer'].split('/')[-1])])==x['beforeSha256'];assert obj(a['decisions'][int(x['pointer'].split('/')[-1])])==x['afterSha256']
    for i,d in enumerate(a.get('decisions',[])):
        if not d.get('canonicalGoalIds'):empty.append({'logicalPath':p['logicalPath'],'readPath':p['privateSuccessor']['path'],'pointer':'/decisions/'+str(i),'sourceGoalId':d['sourceGoalId'],'decision':d['decision'],'newInV9':b['decisions'][i].get('canonicalGoalIds')!=d['canonicalGoalIds']})
for p in ep['patches']:
    assert sha(p['parent']['readPath'])==p['parent']['sha256'];b=read(p['parent']['readPath']);i=int(p['pointer'].split('/')[-1]);assert obj(b['sourceGoals'][i])==p['beforeSha256'];assert obj(p['after'])==p['afterSha256'];parents.append({'path':p['parent']['readPath'],'sha256':p['parent']['sha256'],'actualParentHardlinkCount':(R/p['parent']['readPath']).stat().st_nlink,'parentBytesPreserved':True})
for p in cp['cases']:
    assert sha(p['parent']['path'])==p['parent']['sha256'];i=int(p['pointer'].split('/')[-1]);assert obj(read(p['parent']['path'])['cases'][i])==p['beforeSha256'];assert obj(p['after'])==p['afterSha256']
    for lang in ['De','En']:
        c=p['after'];assert 'Ar_D' in c['data'+lang];assert 'Ar_DNH₂' in c['modelAnswer'+lang];assert 'Ar_DN₂' in c['modelAnswer'+lang]
        first,remaining=c['modelAnswer'+lang].split('\n2.',1);assert remaining==p['before']['modelAnswer'+lang].split('\n2.',1)[1];assert 'Ar_D' not in remaining
        prefix='Vorgeschaltete Diazotierung' if lang=='De' else 'Preceding diazotization';assert c['data'+lang].split(prefix)[0]==p['before']['data'+lang].split(prefix)[0]
for p in pp['profiles']:assert sha(p['parent']['path'])==p['parent']['sha256'];assert obj(read(p['parent']['path'])['profiles'][int(p['pointer'].split('/')[-1])])==p['beforeSha256']
# All selected actual PNG and 17 retained assets remain their former exact bytes.
image=read(s['imageReferences']['path']);image_refs=[]
def collect_image_refs(x):
    if isinstance(x,dict):
        if isinstance(x.get('path'),str) and x.get('sha256') and x['path'].endswith('.png'):
            assert sha(x['path'])==x['sha256'];image_refs.append(x)
        for v in x.values():collect_image_refs(v)
    elif isinstance(x,list):
        for v in x:collect_image_refs(v)
collect_image_refs(image)
for key in ['landscape','imageReferences','existingMethodPartnerSupplements','methodPartnerAllocation','existingIndependentA_MReferences']:
    r=s[key];assert sha(r['path'])==r['sha256'];references.append(r)
assert sha('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')=='sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
lane_receipt=read(O+'/checks/publication-lane-empty-source-call.actual.json')
hold={'schemaVersion':1,'finding':'Five correct source removals leave no approved target. Preserve zero-entitlement cells rather than manufacture coverage.','newUnmappedCells':[x for x in empty if x['newInV9']],'alreadyUnresolvedCells':[x for x in empty if not x['newInV9']],'sevenWholeLiteralGapsAndBoundedExistingCandidates':lane_receipt['sevenWholeLiteralGapsAndBoundedExistingCandidates'],'actualRawSourceLaneCalls':lane_receipt['actualCalls'],'actualRawSourceLaneReceipt':ref(O+'/checks/publication-lane-empty-source-call.actual.json'),'publicationContract':{'path':'scripts/compile_curriculum_release_model.py','sha256':sha('scripts/compile_curriculum_release_model.py'),'function':'compile_mapping_source_lane','locators':['1688: actual raw sourceDocument contract call fails first','1901-1915: additional mapped/nonempty decision gate read from actual code','1945-1946: all sourceGoal IDs must have authoritative decision edges'],'method':'Five actual bounded source-lane calls on raw frozen extraction inputs; each fails first at1688 incomplete official source document. The later nonempty/mapped decision condition is code-derived, not presented as observed full-function failure. No publication-native/full-build run performed.','integrationHOLD':'Root checks legitimate QA/source-consumer representation of zero-entitlement gaps and technical native input contract preparation; no artificial partner coverage or consumer change by this author. v9 does not assert complete source-lane publication readiness.'},'fullFriedelCraftsHOLD':s['remainingHOLDs'],'sourceUnionApproval':False,'newIndependentVotes':0,'strictGain':0}
write(O+'/author/HOLD.zero-entitlement-publication-lane-and-b7.actual.json',hold)
write(O+'/checks/actual-run-corrections.actual.json',{'schemaVersion':1,'technicalAttempts':[{'attempt':1,'result':'ReferenceError: authorAfter before initialization in read overlay','correction':'Initialize read overlay before original compiler module constants'},{'attempt':2,'result':'Source and P checks passed; country-delta reporter incorrectly used applicability instead of compiledApplicability','correction':'Use actual GoalApplicabilityReport.compiledApplicability field, assert it exists; rerun required comparative compiler pass'},{'attempt':3,'result':'PASS:27 actual countrymetadata deltas,13 protected,66 bounded protected partner entries,470 valid alias rows preserved'},{'attempt':4,'result':'Seal-only assertion assumed case2 data contained literal Ar–H; case2 defines Ar by words instead','correction':'Check original donor/coupling data prefix and model parts2/3 remain exactly equal to frozen parent, with no Ar_D contamination'},{'attempt':5,'result':'Five actual bounded raw-source compiler calls fail at1688 incomplete official source document before later empty-decision gate','correction':'Report observed earlier structural failure separately from code-derived mapped/nonempty guard; no source or consumer logic changes'}],'scienceVotes':0,'nativeBuilds':0})
s['P20AuthorCandidates']['oneUpdatedRecord']=ref(O+'/author/P1.Ar-profile.pure-normal-model.author-candidate.jsonl');s['actualChecks']=ref(O+'/checks/normal-compiler-countrymetadata-and-source-impact.actual.json');s['remainingHOLDs'].append(ref(O+'/author/HOLD.zero-entitlement-publication-lane-and-b7.actual.json'));s['v9ImpactCounts']=checks['counts'];s['countrymetadataIntegrationInstruction']='Actual27 Chemie metadata deltas,13 protected. Treat root merged countrymetadata/goal-visibility/D-context as new input where it changes; unchanged original P/A/M/V raw records do not prove unchanged source contexts. No current231 demotion or fresh votes by this author.'
write(sp,s)
private=[]
for p in sorted((R/C).rglob('*')):
    assert not p.is_symlink()
    if p.is_file():assert p.stat().st_nlink==1;private.append({'path':str(p.relative_to(R)),'sha256':sha(str(p.relative_to(R))),'bytes':p.stat().st_size,'regularFile':True,'hardlinks':1})
write(O+'/checks/private-inputs-and-immutable-parent-binding-closure.actual.json',{'schemaVersion':1,'passed':True,'exactParentCAS':parents,'unchangedCriticalReferences':references,'actualImageBindingsChecked':image_refs,'privateCandidateFiles':private,'activeCanonicalSha256':sha('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'newCaseObjects':2,'retainedWholeCaseObjects':38,'newProfileObjects':1,'retainedWholeProfileObjects':19,'originalWholeBodiesIDsRequiresContainsPreserved':True,'all20SourceBoundariesPreserved':True,'other400MemoryRecordsAndCard75':'No writes; unchanged frozen v7 references retained','noActiveGitRuntimePluginOldSealMutation':True,'newIndependentVotes':0,'strictGain':0})
(R/O/'REPORT.author.md').write_text('''# Aromatics20 v9: bounded author correction batch

The frozen v8 matrix is applied: all128 unsupported source/target pairs removed from304 actual alias rows and corresponding decisions;179 valid bounded pairs/470 rows retained.39 isolated mapping carriers changed. Exact cell CAS permits disjoint Polymer/root composition.

Ten audited source cells and two regular BW alias cells are corrected. Consumed sourceText has complete HE sp3 wording, authentic MV lists and restored SN Indikatoren/column separation. SH right-eA fields are LK; optional medications remain optional. BW(4)/(5) bind physical39/printed37 in new operative and regular copies. Historic originals and actual hardlink parents retain their bytes and modes.

Only the two e594 whole bilingual cases and their one profile change: diazotization uses Ar_D; original donor Ar and all other chemistry remain.38 whole cases/19 profiles are exact references. All40 case/profile joins and rubric spans pass the existing P model; one actual P author candidate is updated.20 source boundaries, accepted d61 EN, original atomic4b, existing ac8 bounded guided digital research and all20 actual images retain their former bytes. No full research-partner union is asserted.

Actual normal Applicability-compiler comparison reports27 Chemie countrymetadata differences,13 already-strict goals, and66 individually listed protected source partners. Other subjects have no applicability differences. Root merged D/context/visibility inputs must expose these changes; current231/402 remains protected and unchanged by this author.

Five sources now truthfully have zero approved target; two earlier TH needsCanonicalGoal decisions remain. The current publication lane requires mapped/nonempty decisions and exhaustive source-edge coverage; the exact later integration HOLD is recorded. Full official b7 Friedel-Crafts entitlement remains HOLD. This batch runs no native/full build, campaign or human/independent D/P/A/M/V vote. Strict gain0.

The neutral selector composes frozen v7 payloads with exact v9 overlays. Seal and private binding closure bind every actual successor; root remains sole integrator. Own didactic material is CC-BY-4.0; helper code/technical reports are Apache-2.0. Primary source rights are unchanged.
''')
entries=[]
for p in sorted((R/O).rglob('*')):
    assert not p.is_symlink()
    if p.is_file() and p.name!='SEAL.actual.json':
        assert p.stat().st_nlink==1;entries.append({'path':str(p.relative_to(R/O)),'sha256':sha(str(p.relative_to(R))),'bytes':p.stat().st_size})
seal={'schemaVersion':1,'kind':'single bounded author successor; no independent votes','authorPackage':N,'entries':entries,'neutralInputSelector':ref(sp),'privateInputClosure':ref(O+'/checks/private-inputs-and-immutable-parent-binding-closure.actual.json'),'strictGain':0,'newIndependentVotes':0,'remainingHOLDs':s['remainingHOLDs']}
write(O+'/SEAL.actual.json',seal)
for p in (R/O).rglob('*'):
    if p.is_file():p.chmod(0o444)
for p in (R/C).rglob('*'):
    if p.is_file():p.chmod(0o444)
print(json.dumps({'seal':ref(O+'/SEAL.actual.json'),'selector':ref(sp),'ownSealedFiles':len(entries),'privateRegularFiles':len(private),'newUnmappedSourceCells':len(hold['newUnmappedCells']),'countryMetadataDeltas':27,'protectedCountryDeltas':13,'strictGain':0}))
