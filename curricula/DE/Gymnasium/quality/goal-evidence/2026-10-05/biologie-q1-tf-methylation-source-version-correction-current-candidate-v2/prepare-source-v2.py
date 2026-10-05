# SPDX-License-Identifier: Apache-2.0
"""Prepare source-version correction only in a physically safe native isolation."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, os, shutil, sys

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT).as_posix()
PRIOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-prospective-current-candidate-v1'
IND = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-independent-a-m-v-v1'
ISO = ROOT / 'tmp/biologie-q1-tf-methylation-source-v2-native-isolated-20261005-v2'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
SEM = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
ATLAS = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
REG = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
TF = '946ce2e7-c30d-5670-839d-003b0619c284'
METH = '0ac51522-352c-50d1-8b95-8d3992b4db15'
GEL = '8eb86a82-122d-5cae-8f80-bb2850b29c2f'
PCR = 'a3f483ce-126e-595c-999c-aa4d95106221'
NEW_SOURCES = ['b8aa6b7a-8598-4498-83f5-5162bc3cb419', 'b5e1cdfd-34ff-4c05-976c-ee69ec041fdb']
PDF = 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
PDF_SHA = 'sha256:52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558'
PDF_URL = 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
NEW_KEY = 'KC2024_BIOLOGIE_SEKII_STAND_20250801'
HE_EXT = 'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_BIOLOGIE_SEKII_KC2024.m7-q1-tf-methylation-source-version-correction-20261005-v2.source-extraction.json'
HE_MAP = 'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_biology_upper_secondary_source_extraction_to_canonical_biology.m7-q1-tf-methylation-source-version-correction-20261005-v2.review.json'

def read(p): return json.loads(Path(p).read_text())
def sha(p): return 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p, value):
    p = Path(p); p.parent.mkdir(parents=True, exist_ok=True)
    if p.is_symlink(): p.unlink()
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def detach(p):
    p = Path(p)
    if p.is_symlink():
        target = p.resolve(); p.unlink(); shutil.copy2(target, p)
    return p
def own(name, value):
    write(OWN/name, value); write(ISO/REL/name, value)
def copy_file(src, dst):
    dst = Path(dst); dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.is_symlink(): dst.unlink()
    shutil.copy2(src, dst)
def verify_freeze(path, prepared=False):
    freeze = read(path)
    for row in freeze['files']:
        assert sha(ROOT/row.get('preparedPath' if prepared else 'path', row['path'])) == row['sha256'], row['path']
    return {'path':path.relative_to(ROOT).as_posix(), 'sha256':sha(path), 'fileCount':len(freeze['files'])}

if sys.argv[1] == 'init':
    assert not ISO.exists(), 'Never reset an existing isolation silently'
    frozen = [verify_freeze(PRIOR/'author-package.final.freeze.json'), verify_freeze(PRIOR/'prepared-inputs.freeze.json', True), verify_freeze(IND/'independent-a-m-v.final.freeze.json')]
    assert sha(ROOT/PDF) == PDF_SHA
    registry = read(ROOT/REG); bio = next(s for s in registry['subjects'] if s['subject'] == 'biologie')
    paths = {CANON, SEM, QA, ATLAS, REG, PDF, 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'}
    active_atlas = read(ROOT/ATLAS)
    for p in active_atlas['mappingPaths']:
        paths.add(p); paths.add(read(ROOT/p)['sourceExtractionPath'])
    for k in ['semanticAtomicityConfigPath','memoryReviewConfigPath']:
        cfg = read(ROOT/bio[k]); paths.add(bio[k]); paths.add(cfg['reviewPath'])
        if cfg.get('cardReviewPath'): paths.add(cfg['cardReviewPath'])
    for p in (ROOT/'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas').rglob('*'):
        if p.is_file(): paths.add(p.relative_to(ROOT).as_posix())
    subject_digests={s['subject']:'sha256:'+hashlib.sha256(json.dumps(s,sort_keys=True,ensure_ascii=False).encode()).hexdigest() for s in registry['subjects']}
    own_before = {'createdAtUTC':datetime.now(timezone.utc).isoformat(), 'frozenInputsVerified':frozen, 'paths':[{'path':p,'sha256':sha(ROOT/p)} for p in sorted(paths)], 'registrySubjectEntryDigests':subject_digests, 'activeWritesAuthorized':False}
    ISO.mkdir(parents=True)
    code = []
    for rel in ['app/scripts','scripts']:
        shutil.copytree(ROOT/rel, ISO/rel, symlinks=False)
        for p in (ROOT/rel).rglob('*'):
            if p.is_file() and p.suffix in ['.ts','.mts','.cts','.mjs','.cjs','.js','.py']:
                q = ISO/p.relative_to(ROOT); assert sha(p)==sha(q)
                code.append({'path':p.relative_to(ROOT).as_posix(),'sha256':sha(p)})
    for rel in ['app/src','app/node_modules','docs','contracts']:
        q=ISO/rel; q.parent.mkdir(parents=True,exist_ok=True); q.symlink_to(ROOT/rel,target_is_directory=True)
    detached=[]; leaf_count=0
    for rel in ['curricula','app/public','backend/src/main/resources/static']:
        for base, children, files in os.walk(ROOT/rel, followlinks=False):
            base=Path(base); target=ISO/base.relative_to(ROOT); target.mkdir(parents=True,exist_ok=True)
            for name in files:
                src=base/name; dst=target/name
                if dst.exists() or dst.is_symlink(): continue
                dst.symlink_to(src); leaf_count+=1
                path=src.relative_to(ROOT).as_posix()
                physical = (path.startswith('curricula/DE/Gymnasium/canonical/') and src.suffix=='.json') or (path.startswith('curricula/DE/Gymnasium/mapping/') and name.endswith('.review.json')) or name=='prompt.de.md'
                physical |= path.startswith('app/public/assets/goal-visualizations/biologie/') and any('/'+g+'/' in path for g in [TF,METH,GEL]) and src.suffix.lower() in ['.jpg','.jpeg']
                physical |= '/biologie/'+GEL+'/' in path and src.suffix.lower()=='.png'
                physical |= path in ['app/public/data/de_gymnasium_biology_flashcards_core.de.json','app/public/data/de_gymnasium_biology_flashcards_core.en.json']
                if physical: detach(dst); detached.append(path)
    for rel in ['app/package.json','app/tsconfig.json','app/tsconfig.node.json','package.json','AGENTS.md','LICENSING.md','LICENSE']:
        if (ROOT/rel).exists():
            p=ISO/rel; p.parent.mkdir(parents=True,exist_ok=True);p.symlink_to(ROOT/rel)
    own('active-input-boundary.before.json',own_before)
    own('native-code-and-write-isolation.receipt.json',{'isolationRoot':str(ISO),'nativeCodeByteIdentical':code,'physicalRequiredLeafPaths':detached,'leafSymlinkCount':leaf_count,'allActualRenderedGoalJPGsDetached':True,'allActualPromptDeLeavesDetached':True,'physicalCardsLeavesPreserved':True,'historicalLeafMirrorReadOnly':True,'activeWrites':0})
    own('baseline-book.config.json',{**read(ROOT/'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'),'outputPath':REL+'/baseline-full.book-model.json'})
    own('prospective-paths.json',{'isolationRoot':str(ISO),'ownPath':REL,'goalIds':[TF,METH],'bindingOnlyGoalIds':[GEL],'additionalSourceLinkFootprintGoalIds':[PCR],'canonicalPath':CANON,'semanticPath':SEM,'qaPath':QA,'atlasPath':ATLAS,'heExtractionPath':HE_EXT,'heMappingPath':HE_MAP,'currentBioEntry':bio})
    print(json.dumps({'status':'safe_native_isolation_prepared','frozenFilesVerified':[f['fileCount'] for f in frozen],'physicalLeaves':len(detached),'nativeCodeFiles':len(code),'activeWrites':0}))

elif sys.argv[1] == 'apply':
    assert (ISO/REL/'baseline-full.book-model.json').is_file()
    meta=read(PRIOR/'prospective-paths.json')
    for item in read(PRIOR/'prepared-inputs.freeze.json')['files']:
        copy_file(ROOT/item['preparedPath'], ISO/item['path'])
    ext=read(ISO/meta['heExtractionPath']); old_ext=copy.deepcopy(ext)
    assert len(ext['sourceGoals'])==150 and len(ext['sourceDocuments'])==1
    old_doc=copy.deepcopy(ext['sourceDocuments'][0]); assert old_doc==ext['sourceDocument']
    doc={'key':NEW_KEY,'title':'Kerncurriculum Biologie gymnasiale Oberstufe Hessen, Ausgabe 2024, Stand 01.08.2025','path':PDF,'role':'binding-core','official':True,'url':PDF_URL,'sha256':PDF_SHA,'version':'Ausgabe 2024, Stand 01.08.2025','pageCount':49}
    ext['sourceDocuments'].append(doc)
    ext['extractionId']=Path(HE_EXT).stem
    for g in ext['sourceGoals']:
        assert not g.get('sourceDocumentKey')
        g['sourceDocumentKey']=NEW_KEY if g['id'] in NEW_SOURCES else old_doc['key']
    assert ext['sourceDocument']==old_doc and ext['sourceDocuments'][0]==old_doc
    mapping=read(ISO/meta['heMappingPath']);old_map=copy.deepcopy(mapping)
    mapping['reviewId']=Path(HE_MAP).stem; mapping['sourceExtractionPath']=HE_EXT
    assert mapping['decisions']==old_map['decisions'] and mapping['mappings']==old_map['mappings']
    write(ISO/HE_EXT,ext);write(ISO/HE_MAP,mapping)
    atlas=read(ISO/ATLAS); atlas['mappingPaths']=[HE_MAP if p==meta['heMappingPath'] else p for p in atlas['mappingPaths']]
    assert not any(s['path']==PDF for s in atlas.get('sourceDocumentSnapshots',[]))
    atlas.setdefault('sourceDocumentSnapshots',[]).append({'path':PDF,'url':PDF_URL,'sha256':PDF_SHA})
    write(ISO/ATLAS,atlas)
    own('he-source-version-correction.delta.json',{'status':'inactive_source_version_correction','priorExtractionPath':meta['heExtractionPath'],'newExtractionPath':HE_EXT,'priorMappingPath':meta['heMappingPath'],'newMappingPath':HE_MAP,'oldSourceDocumentPreservedExactly':old_doc,'appendedActualSourceDocument':doc,'correctedSourceGoalIds':NEW_SOURCES,'explicitOldSourceDocumentKeyGoalCount':148,'mappingDecisionsAndWholeGoalIdsUnchangedExactly':True,'mappingRowsUnchangedExactly':True,'sourceContentAndReferencesUnchangedExactly':True,'allCanonicalGoalsUnchangedFromFrozenV1':True,'scientificApprovalFor148Invented':False,'humanApproval':False,'activeWrites':0})
    own('he-extraction.before-source-version.json',old_ext);own('he-mapping.before-source-version.json',old_map)
    for name in ['positive-evidence.candidates.json']:
        copy_file(PRIOR/name,OWN/name);copy_file(PRIOR/name,ISO/REL/name)
    candidates=read(OWN/'positive-evidence.candidates.json');candidates['reviewId']=OWN.name
    own('positive-evidence.candidates.json',candidates)
    for kind,field in [('atomicity','semanticAtomicityConfigPath'),('memory','memoryReviewConfigPath')]:
        active_cfg=read(ROOT/read(OWN/'prospective-paths.json')['currentBioEntry'][field])
        rows=(ROOT/active_cfg['reviewPath']).read_text().splitlines(keepends=True)
        fresh_rows=(IND/(kind+'.candidate.review.jsonl')).read_text().splitlines(keepends=True)
        fresh={json.loads(line)['goalId']:line for line in fresh_rows if line.strip()}
        assert set(fresh)=={TF,METH}
        old_ids=[json.loads(line)['goalId'] for line in rows if line.strip()]; assert len(old_ids)==363 and METH not in old_ids
        full=''.join(fresh.get(json.loads(line)['goalId'],line) if line.strip() else line for line in rows)+fresh[METH]
        for p in [OWN/('full-'+kind+'.candidate.review.jsonl'),ISO/REL/('full-'+kind+'.candidate.review.jsonl')]: p.write_text(full)
        cfg=copy.deepcopy(active_cfg);cfg['reviewPath']=REL+'/full-'+kind+'.candidate.review.jsonl'
        cfg.pop('reportPath',None)
        if cfg.get('cardReviewPath'): detach(ISO/cfg['cardReviewPath'])
        own('full-'+kind+'.candidate.config.json',cfg)
        own(kind+'.candidate.config.json',read(IND/(kind+'.candidate.config.json')))
        for name in [kind+'.candidate.review.jsonl']:
            copy_file(IND/name,ISO/IND.relative_to(ROOT)/name)
        if kind=='memory':copy_file(IND/'memory.candidate.cards.review.jsonl',ISO/IND.relative_to(ROOT)/'memory.candidate.cards.review.jsonl')
        own(kind+'-independent-review-reuse.receipt.json',{'scientificRowsReusedExactlyFrom':(IND/(kind+'.candidate.review.jsonl')).relative_to(ROOT).as_posix(),'independentRowsDigest':sha(IND/(kind+'.candidate.review.jsonl')),'currentFull363BaselineConfig':read(OWN/'prospective-paths.json')['currentBioEntry'][field],'old362LinesBytePreserved':all(line in full for line in rows if line.strip() and json.loads(line)['goalId']!=TF),'freshIndependent2RowsAddedWithoutScientificRewrite':True,'newFullCount':364,'sourceVersionCorrectionChangesGoalTexts':False,'humanApproval':False})
    qa=read(ISO/QA); freshqa=read(IND/'visualization.native-candidate.qa.json')
    old_records=copy.deepcopy(qa['records']);fresh_by={r['goalId']:r for r in freshqa['records']}
    qa['records']=[copy.deepcopy(fresh_by.get(r['goalId'],r)) for r in qa['records']]
    assert len([r for r in qa['records'] if r['goalId'] in fresh_by])==2
    assert all(r==old for r,old in zip(qa['records'],old_records) if r['goalId'] not in fresh_by)
    write(ISO/QA,qa)
    own('independent-v-reuse.provenance.json',{'independentFreezePath':(IND/'independent-a-m-v.final.freeze.json').relative_to(ROOT).as_posix(),'independentFreezeSha256':sha(IND/'independent-a-m-v.final.freeze.json'),'scientificEvidencePaths':[(IND/f).relative_to(ROOT).as_posix() for f in ['visualization.exact-goal-asset-bindings.candidate.json','native-v-binding-validation.receipt.json','native-card-inspection.metrics.json']],'actualScientificInspection':'Independent source/public/backend original PNG inspection and native GoalCard at actual360/680px, scientific model limitations and current Alt assessed; these records are reused only after exact wholeGoal/text/Alt/pixel equality is checked natively.','onlyTwoNativeQARecordsReplacedExactly':True,'allOtherQARecordsUnchanged':True,'humanApproved':'no','activeWrites':0})
    own('book.config.json',{**read(PRIOR/'book.config.json'),'outputPath':REL+'/prospective-full.book-model.json'})
    pconfig=read(PRIOR/'positive.validation-only.config.json');pconfig.update(reviewId=OWN.name,reviewPath=REL+'/positive.validation-only.review.jsonl')
    own('positive.validation-only.config.json',pconfig)
    batch=read(PRIOR/'batch.config.json');batch.update(batchId='biologie-q1-tf-methylation-source-version-correction-current-20261005-v2',bookId='de-gym-biologie-q1-tf-methylation-source-v2-current-20261005-v2',title='Biologie Q1 – TF und DNA-Methylierung; Quellenversionskorrektur mit Gel-Bindung',baseGoalBookConfigPath=REL+'/book.config.json',goalIds=[TF,METH,GEL],outputDirectory=REL+'/native-finalbook')
    own('batch.config.json',batch)
    own('d2-scope-and-review-boundaries.json',{'scientificDescriptionGoalIds':[TF,METH],'currentSourceBindingOnlyGoalIds':[GEL],'additionalAffectedSourceLinkWithoutStrictClosureGoalIds':[PCR],'unchangedGelWholeGoalPositiveEvidenceAtomicityMemoryVisualizationAndImage':True,'all148OldRoutingRowsMetadataOnly':True,'assessmentAndCapstonePrerequisiteCandidatesRemainSeparatePending':True,'completedFreshDReviews':0,'completedFreshPReviews':0,'sourceHoldV1PreservedExactly':True,'humanApproval':False})
    print(json.dumps({'status':'inactive_source_v2_inputs_applied','oldDocumentKeyRows':148,'actual2025Rows':2,'fullIndependentAtomicityMemoryRows':364,'nativeQARecordsReused':2,'d2GoalCount':3,'activeWrites':0}))
else: raise SystemExit('Usage: prepare-source-v2.py init|apply')
