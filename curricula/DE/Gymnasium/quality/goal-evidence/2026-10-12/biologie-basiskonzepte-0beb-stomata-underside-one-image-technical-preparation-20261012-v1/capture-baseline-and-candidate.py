# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,datetime,copy

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[6]
G='0beb4ca2-2437-557a-9db2-ccda1cbcfa0a'
BP=str(OUT.relative_to(ROOT))
NEW=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-basiskonzepte-0beb-stomata-underside-image-author-root-20261012-v1')/(G+'.png')
NEW_SHA='sha256:33cc4c68c2388b9f545c6ebb62fcec3bf47322b2312a1df965b27ef036a7f21a'
ALT='Eine Pflanze verknüpft Energie, Struktur und Stoffaustausch. Eine umgeschlagene Blattkante zeigt die hellere Blattunterseite; eine Lupe vergrößert dort zwei Schließzellen mit Spaltöffnung. Licht trifft die Blattoberseite, CO₂ gelangt an der Unterseite hinein und Wasser wird über die Wurzeln aufgenommen.'
bindings={}
def read(p):
    p=Path(p);b=(ROOT/p).read_bytes();bindings[str(p)]={'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)};return json.loads(b)
def write(rel,v):
    p=OUT/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def exactcopy(source,dest):
    p=Path(source);b=(ROOT/p).read_bytes();bindings[str(p)]={'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)};(OUT/dest).parent.mkdir(parents=True,exist_ok=True);(OUT/dest).write_bytes(b)

central=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
bio=next(x for x in central['subjects'] if x['subject']=='biologie')
land=read(bio['landscapePath']);ledger=read(bio['semanticKindLedgerPath']);qa=read(bio['visualizationQaPath'])
atoms={x['goalId'] for x in ledger['decisions'] if x['semanticKind']=='curricularAtomic'};assert len(atoms)==397
goal=next(g for g in land['goals'] if g['id']==G)
exactcopy(bio['landscapePath'],'baseline/whole484-current397.canonical.exact.json')
exactcopy(bio['semanticKindLedgerPath'],'baseline/whole484-current397.semantic.exact.json')
exactcopy(bio['visualizationQaPath'],'baseline/QA.current397.exact.json')
records={};record_bindings=[];target_config=None
for path in bio['positiveEvidenceConfigPaths']:
    cfg=read(path);scope=cfg['scope']['goalIds'];raw=(ROOT/cfg['reviewPath']).read_bytes();bindings[cfg['reviewPath']]={'path':cfg['reviewPath'],'sha256':'sha256:'+hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
    scoped=set(scope)
    for ordinal,line in enumerate(raw.splitlines(keepends=True)):
        if not line.strip():continue
        r=json.loads(line)
        if r['goalId'] not in scoped:continue
        assert r['goalId'] in atoms
        assert r['goalId'] not in records,r['goalId']
        records[r['goalId']]=(r,line)
        record_bindings.append({'goalId':r['goalId'],'configPath':path,'recordPath':cfg['reviewPath'],'lineOrdinalZeroBased':ordinal,'exactLineSha256':'sha256:'+hashlib.sha256(line).hexdigest()})
        if r['goalId']==G:target_config=cfg;target_config_path=path
assert set(records)==atoms
target_row,target_line=records[G]
(OUT/'baseline/P397.all-current-scoped-lines.exact.jsonl').write_bytes(b''.join(line for _,line in records.values()))
(OUT/'baseline/P396.other-current-scoped-lines.exact.jsonl').write_bytes(b''.join(line for id,(_,line) in records.items() if id!=G))
(OUT/'baseline/P1.0beb.whole-original-profile.exact.jsonl').write_bytes(target_line)
assert len(records)==397 and len([id for id in records if id!=G])==396
currentD=[]
for path in bio['resolutionIndexPaths']:
    index=read(path)
    for row in index.get('resolutions',[]):
        if row.get('goalId')==G:
            resolution_path=str(Path(path).parent/row['resolutionPath']);resolution=read(resolution_path);currentD.append({'indexPath':path,'wholeIndexEntry':row,'resolutionPath':resolution_path,'wholeResolution':resolution,'groups':index['groups']})
assert len(currentD)==1
assert not any(x['goalId']==G for x in bio.get('resolutionSupersessions',[]))
am={}
for tag,key in [('A','semanticAtomicityConfigPath'),('M','memoryReviewConfigPath')]:
    cfg=read(bio[key]);raw=(ROOT/cfg['reviewPath']).read_bytes();bindings[cfg['reviewPath']]={'path':cfg['reviewPath'],'sha256':'sha256:'+hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
    rr=next((json.loads(l),l) for l in raw.splitlines(keepends=True) if json.loads(l)['goalId']==G);(OUT/'baseline'/f'{tag}1.0beb.retained-text-decision.exact.jsonl').write_bytes(rr[1]);am[tag]={'configPath':bio[key],'wholeRecord':rr[0]}
    own=copy.deepcopy(cfg);own['landscapePath']=BP+'/candidate/whole484-current397.image-alt-only.inactive.json';own['reviewPath']=BP+f'/baseline/{tag}1.0beb.retained-text-decision.exact.jsonl';own['scope']={'label':'One unchanged Biology goal body; retained text decision, no fresh vote','leafGoalIds':[G]};own['reportPath']=BP+f'/checks/{tag}1.normal.md'
    if tag=='M':
        (OUT/'baseline/M1.no-primary-cards-in-scope.empty.jsonl').write_bytes(b'');own['cardReviewPath']=BP+'/baseline/M1.no-primary-cards-in-scope.empty.jsonl'
    write(f'configs/{tag}1.same-body.inactive.config.json',own)

candidate=copy.deepcopy(land);cg=next(g for g in candidate['goals'] if g['id']==G);links=[l for l in cg['resourceLinks'] if l['type']=='goal-visualization'];assert len(links)==1;links[0]['altText']=ALT
restored=copy.deepcopy(candidate);next(g for g in restored['goals'] if g['id']==G)['resourceLinks']=goal['resourceLinks'];assert restored==land
write('candidate/whole484-current397.image-alt-only.inactive.json',candidate)
new_ledger=copy.deepcopy(ledger);new_ledger['sourceLandscapePath']=BP+'/candidate/whole484-current397.image-alt-only.inactive.json';assert new_ledger['decisions']==ledger['decisions'];write('candidate/semantic397.same-decisions.current-path.json',new_ledger)
new_qa=copy.deepcopy(qa);q=next(r for r in new_qa['records'] if r['goalId']==G);q.update({'assetSha256':NEW_SHA,'aiApproved':'no','aiApprovedAssetSha256':'','aiReviewedAt':None,'aiReviewer':'','aiNotes':'Inactive author image correction; exact new original/native/360/680 independent review pending. Historical old-asset approvals remain intact in baseline. No human approval or learner evidence claimed.'});write('candidate/QA397.single-current-image.pending.json',new_qa)
new_bytes=(ROOT/NEW).read_bytes();assert 'sha256:'+hashlib.sha256(new_bytes).hexdigest()==NEW_SHA
bindings[str(NEW)]={'path':str(NEW),'sha256':NEW_SHA,'bytes':len(new_bytes)}
asset_rel='assets/goal-visualizations/biologie/'+G+'/'+G+'.png';(OUT/'native-public'/asset_rel).parent.mkdir(parents=True,exist_ok=True);(OUT/'native-public'/asset_rel).write_bytes(new_bytes)
criteria=read(target_config['reviewCriteriaPath']) if target_config['reviewCriteriaPath'].endswith('.json') else None
exactcopy(target_config['reviewCriteriaPath'],'author-inputs/P.criteria.exact.md')
for path in target_config.get('reviewRunManifestPaths',[]):read(path)
Pconfig=copy.deepcopy(target_config);Pconfig['reviewId']='biologie-0beb-underside-one-image-author-current397-20261012-v1';Pconfig['landscapePath']=BP+'/candidate/whole484-current397.image-alt-only.inactive.json';Pconfig['semanticKindLedgerPath']=BP+'/candidate/semantic397.same-decisions.current-path.json';Pconfig['reviewPath']=BP+'/positive/P1.current-image.pending.normal.jsonl';Pconfig['reviewRunManifestPaths']=[];Pconfig['scope']={'label':'One retained whole profile with new image and alt text; informed author binding, independent acceptance pending','goalIds':[G]};write('configs/P1.current-image.inactive.config.json',Pconfig)
write('author-inputs/P1.whole-body.binding-only.candidates.json',{'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':Pconfig['reviewId'],'reviewedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'Codex informed technical preparer; exact retained profile body, new image binding only, no independent vote','goals':[{'goalId':G,'reason':'Technical author rebinding of the unchanged complete current positive profile to the newly corrected image and alt text. Exact independent acceptance pending; retained scientific provenance disclosed separately. No new learner performance, lab execution, human approval or trial.','evidenceLevel':'E1','maximumClaimScope':'G1','dissent':[],'profile':target_row['profile']}]})
book=read('app/scripts/config/goal-books/de-gym-biology-national-atlas.json');book['landscapePath']=Pconfig['landscapePath'];book['semanticKindLedgerPath']=Pconfig['semanticKindLedgerPath'];book['goalVisualizationQaPath']=BP+'/candidate/QA397.single-current-image.pending.json';book['evidenceReviewPaths']=[BP+'/baseline/P396.other-current-scoped-lines.exact.jsonl',Pconfig['reviewPath']];book['outputPath']=BP+'/native/full397.current-image.normal-model.json';book['publicationMode']='review';write('configs/full397.actual-national-atlas.current-image.config.json',book)
write('configs/D1.first-pass.inactive.batch.config.json',{'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'biologie-0beb-underside-current397-native-first-20261012-v1','subject':'biologie','subjectLabel':'Biologie','bookId':'biologie-0beb-underside-current397-native-first-20261012-v1','title':'Biologie – Basiskonzepte, eine aktuelle Bildkorrektur','baseGoalBookConfigPath':BP+'/configs/full397.actual-national-atlas.current-image.config.json','goalIds':[G],'outputDirectory':BP+'/native/D1','feedbackBaseUrl':'https://skillpilot.com/feedback','promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md','publicRoot':'app/public','printDerivativeProfile':'standard'})
write('baseline/sole-current-D-chain-and-active-AM-P.actual.json',{'goalId':G,'activeSubjectBindings':{k:bio[k] for k in ['landscapePath','semanticKindLedgerPath','visualizationQaPath','semanticAtomicityConfigPath','memoryReviewConfigPath']},'soleCurrentDescription':currentD[0],'existingSupersessionChain':[],'targetPConfigPath':target_config_path,'wholeTargetPConfig':target_config,'wholeCurrentP1':target_row,'atomicityMemory':am,'activePConfigCount':len(bio['positiveEvidenceConfigPaths']),'activePScopedRecordCount':397,'other396RecordLinesExact':True,'originalImageAssetSha256':'sha256:ca53cf86312d202ca404988f6f377304f8d447b1b747bc4931513a36a4909342','newImageAuthorPath':str(NEW),'newImageAssetSha256':NEW_SHA,'oldPeerRecordsAreFreshIndependentInput':False,'newScientificVotes':0})
write('baseline/P397.current-scoped-line-bindings.actual.json',record_bindings)
for p,v in bindings.items():assert 'sha256:'+hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==v['sha256'],p
write('baseline/input-bindings.actual.json',{'inputs':list(bindings.values()),'activeInputWrites':False,'gitWrites':False,'scientificVotes':0})
print(json.dumps({'canonicalDefinitions':len(land['goals']),'curricularAtoms':397,'activePConfigs':len(bio['positiveEvidenceConfigPaths']),'scopedPRecords':397,'other396Exact':True,'soleDIndex':currentD[0]['indexPath'],'existingSupersessions':0,'canonicalSemanticChanges':0,'canonicalResourceFieldChanges':1,'imageSha256':NEW_SHA}))
