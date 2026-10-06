# SPDX-License-Identifier: Apache-2.0
import json,hashlib,datetime
from pathlib import Path

OWN=Path(__file__).resolve().parent;ROOT=OWN.parents[6]
V3=OWN.parent/'biologie-q1-four-current383-source-scope-author-remediation-v3'
NOW=datetime.datetime.now(datetime.timezone.utc).isoformat()
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def rel(p):return str(p.relative_to(ROOT))
def freeze_file_check(f):
    d=read(f);rows=[]
    for row in d['files']:
        p=Path(row['path']);p=p if p.is_absolute() else f.parent/p
        if not p.is_file():p=ROOT/row['path']
        expected=row['sha256'].removeprefix('sha256:')
        rows.append(dict(path=rel(p),sha256=sha(p),expectedSHA256=expected,bytes=p.stat().st_size,match=sha(p)==expected and (row.get('bytes') is None or p.stat().st_size==row['bytes'])))
    assert all(x['match'] for x in rows)
    return dict(freezePath=rel(f),freezeSHA256=sha(f),fileCount=len(rows),matchingFiles=len(rows),files=rows)

v3freeze=V3/'author-source-scope.final.freeze.json'
assert sha(v3freeze)=='fb5a587f6417a6937f6fd370698ddade6ea7d663a482effe076481efb8449412'
v3verified=freeze_file_check(v3freeze)
main=read(OWN/'four-main-components-eight-positive-cases.author-candidate.json')
child=read(OWN/'mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json')
all_components=main['components']+child['components'];assert len(all_components)==11
nulls=[x for x in all_components if x['canonicalGoalId'] is None];existing=[x for x in all_components if x['canonicalGoalId'] is not None]
assert len(nulls)==7 and len(existing)==4
assert len({x['candidateKey'] for x in all_components})==11
for c in all_components:
    assert c['newAssignedGoalId'] is None and not c['wholeSourceClosure']
    assert len(c['tasks'])==2
for c in main['components']:
    for task in c['tasks']:
        assert all(task[k].strip() for k in ['material','task','solution','materialEn','taskEn','solutionEn'])
        assert len(task['positiveEssentialPassingConditions'])>=3
for c in child['components']:
    for task in c['tasks']:
        assert all(task[k].strip() for k in ['materialDe','promptDe','solutionDe','materialEn','promptEn','solutionEn'])
        assert len(task['positiveEssentialConditions'])>=3

# Independently calculate every newly introduced coding sequence against the retained standard table.
table=read(OWN/'standard-code-sun.codon-data.actual.json')['codonAssignments']
assert len(table)==64
expected_sequences={
 'ATGGAATTTTGA':['Met','Glu','Phe','Stopp'], 'ATGGAGTTTTAA':['Met','Glu','Phe','Stopp'],
 'ATGAAATGCTAG':['Met','Lys','Cys','Stopp'], 'ATGAAGTGTTGA':['Met','Lys','Cys','Stopp'],
 'ATGGAATTCTAA':['Met','Glu','Phe','Stopp'], 'ATGGACTTCTAA':['Met','Asp','Phe','Stopp'],
 'ATGGAGTTCTAA':['Met','Glu','Phe','Stopp'], 'GAAGGT':['Glu','Gly'], 'GACGGT':['Asp','Gly']}
sequence_checks=[]
for dna,expected in expected_sequences.items():
    mrna=dna.replace('T','U');product=[table[mrna[i:i+3]] for i in range(0,len(mrna),3)]
    assert product==expected,(dna,product,expected)
    sequence_checks.append(dict(codingDNA5to3=dna,mRNA5to3=mrna,productIncludingStopMarker=product,expected=expected,match=True))
complement=lambda x:''.join({'A':'T','T':'A','G':'C','C':'G'}[b] for b in x)
assert complement('TACG')=='ATGC' and complement('GTAC')=='CATG'
assert ''.join({'A':'U','U':'A','G':'C','C':'G'}[b] for b in 'GAA')=='CUU'
numeric=dict(mutagenPhysicalPercent=[3/1000*100,27/1000*100,6/1000*100],physicalRatio=27/3,
             mutagenChemicalPercent=[2/1000*100,18/1000*100,17/1000*100],uncorrectedMispairs=30-24,
             environmentalShift=[14-8,16-10],chromosomeIncreases=[4+1,6-1])
assert numeric['physicalRatio']==9 and numeric['uncorrectedMispairs']==6 and numeric['environmentalShift']==[6,6]

envelope=read(OWN/'canonical-preserved.inert-envelope.json')
assert hashlib.sha256(envelope['preservedCanonicalUTF8'].encode()).hexdigest()==sha(V3/'prospective-canonical.unchanged.snapshot.json')
canonical=json.loads(envelope['preservedCanonicalUTF8']);assert len(canonical['goals'])==464
actual=read(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
before={g['id']:g for g in actual['goals']};after={g['id']:g for g in canonical['goals']}
assert set(before)==set(after)
changed=[i for i in before if before[i]!=after[i]]
current_field_deltas={}
four=['0daa79f6-8f61-5506-98f9-65db83062ba8','475eebb4-4eb0-524f-b1ec-4a672bf856d2','ffef97e3-12d6-5090-9816-46ab9e57fae2','e70d8a85-2dea-5165-919b-200fee9f4db4']
assert sorted(changed)==sorted(four)
for i in changed:
    delta=[k for k in set(before[i])|set(after[i]) if before[i].get(k)!=after[i].get(k)]
    assert set(delta)<= {'description','descriptionEn','resourceLinks'}
    current_field_deltas[i]=delta
protected=['0263fb84-33b1-52a3-a47e-dad56be7c9bc','3417bb28-e707-57fc-8484-311d4966e26a','74740709-fc77-5a54-88a6-bb14c3777941']
assert all(before[i]==after[i] for i in protected)
assert sha(OWN/'positive-four.native-candidate-records.json')==sha(V3/'positive-four.native-candidate-records.json')
assert sum(len(r['profile']['applicationCaseBriefs']) for r in read(OWN/'positive-four.native-candidate-records.json')['records'])==8
assert sha(OWN/'visualization-final-candidate-inputs.v3.json')==sha(V3/'visualization-final-candidate-inputs.v3.json')
png_checks=[]
for r in read(OWN/'visualization-final-candidate-inputs.v3.json')['records']:
    p=ROOT/r['candidatePath'];expected=r['sha256'].removeprefix('sha256:');assert sha(p)==expected
    png_checks.append(dict(goalId=r['goalId'],path=rel(p),sha256=sha(p),match=True))
native=read(OWN/'native-visibility-and-book-footprint.actual.json');assert native['wholePagesExactVsV3']==383 and native['all20SourceScopesExactVsV3']

all_by_key={c['candidateKey']:c for c in all_components}
v3relations=read(V3/'47-source-relations.before-after.author-candidate.json')
mutation_matrix=read(OWN/'mutation-source-components-author/six-open-obligations.source-to-component.author-matrix.json')
rows=[]
for obligation in v3relations['openObligations']:
    r=obligation['jurisdiction']
    if r in ['DE-BE','DE-BB']: keys=['classical_genetic_information_carriers_dna_gene_chromosome']
    elif r=='DE-HE':keys=['he_code_sun_forward_and_existing_reverse','he_pro_euk_mrna_ribosome_trna_mechanism']
    elif r=='DE-BY' and obligation['sourceGoalId']=='a6ad1554-558e-51e4-9d05-aa9b38ebfa40':keys=['by9_gene_product_trait_genwirk_chain']
    else:
        matches=[x for x in mutation_matrix['sourceToComponentMatrix'] if x['originalV3OpenObligation']==obligation]
        assert len(matches)==1
        keys=matches[0]['boundedAuthorComponentKeys']
    assert all(k in all_by_key for k in keys)
    rows.append(dict(originalOpenObligation=obligation,concreteAuthorComponentKeys=keys,
                     bilingualPositiveCaseKeys=[t.get('caseId',t.get('caseKey')) for k in keys for t in all_by_key[k]['tasks']],
                     authorMaterialStatus='concrete bounded material supplied',sourceApproval=False,
                     remainingGates=['Independent source/operator/stage and positive-case review','Resolve null IDs and appropriate minimal prerequisites','New affected native page/source/goal/profile binding before any integration'],wholeSourceClosure=False))
assert len(rows)==10
write(OWN/'ten-open-obligations.concrete-remediation.author-matrix.json',dict(schemaVersion=1,role='author candidate',
    originalOpenObligations=10,concreteAuthorRows=rows,componentCount=11,newBilingualCaseCount=22,
    sourceDetails=mutation_matrix['sourceToComponentMatrix'],wholeSourceClosure=False,activeWrites=0,independentApproval=False))

# No new whole-goal stage import is silently resolved. Candidate-key edges have no runtime effect.
classic='classical_genetic_information_carriers_dna_gene_chromosome'
plan=[]
for c in all_components:
    if c['canonicalGoalId'] is None:
        plan.append(dict(candidateKey=c['candidateKey'],canonicalGoalId=None,
          proposedComponentPrerequisites=[] if c['candidateKey']==classic else [classic],
          existingRelatedGoalCandidates=c.get('proposedPrerequisiteGoalCandidates',[]),
          existingWholeGoalPrerequisitesAccepted=False,
          rationale='Supplied models carry the sequence, pairing, lineage or copying facts. Do not import whole upper-stage nucleotide/organelle/recombination prerequisites into lower-stage components. Existing related goals remain separate partners until actual scope/route review.',
          resolvedRuntimeRequires=None,independentScopeAndDReviewPending=True))
    else:
        plan.append(dict(candidateKey=c['candidateKey'],canonicalGoalId=c['canonicalGoalId'],
          existingWholeGoalRequiresPreserved=after[c['canonicalGoalId']]['requires'],
          sourceBindingMode='Supplement only; original whole goal and current valid P/image decisions remain unchanged',
          newPracticeTerminalAuthored=False,independentScopeAndPReviewPending=True))
write(OWN/'prerequisite-and-source-integration-plan.author.json',dict(candidatePlans=plan,
    plannedHeldWholeTargetReplacement=['MV/SN/ST/TH mutation imports on3417 must be replaced by the independently reviewed bounded component set before any source-wide lower-stage closure; do not remove them and lose the actual mutation duty first.',
       'BE/BB0daa whole target is held; the new classical null-ID component is the proposed source-appropriate terminology partner.',
       'SH2023 mutation/recombination and DNA partial partner remain held for stage/route review; SH2026 incoming cohorts are outside the reviewed source content.'],
    assignedNewCanonicalIDs=[],nativeGraphMutated=False,activeWrites=0))
write(OWN/'separate-real-open-source-boundaries.author.json',dict(
    nullIDAndNativeBindingWork='Seven candidate components need canonical IDs only after independent source/scope/task review, then actual contains/requires/applicability/source mapping/P and nativeD work; none is currently integrated.',
    BYEASeparateCancerBindingPoint=mutation_matrix['BYEASeparateCancerBindingPoint'],
    SHCohortBoundary='Only frozen2023 source content is retained as a legacy/outgoing cohort source. New2026 entry source content has not been substantively reviewed and is not approved by this packet.',
    BY9ProteinStructuralDiversity=dict(sourceGoalId='caa62aba-fb03-5b28-8df1-d09624168990',existingGoalId='28850d2e-062d-5341-ac66-bd787a8fc84f',existingRelationPreserved=True,wholeGoalApprovalAdded=False),
    HEReverseDirectionBoundary='Existing e349 bidirectional goal is preserved. HE source requires forward code-wheel use; no literal HE reverse-translation obligation is invented.',
    BYPCRComparisonBoundary='The shared repair component retains the separate EA PCR/repair comparison obligation on its existing upper-stage partner; it does not close this comparison.',
    pendingIndependentReview=True,wholeSourceClosure=False,activeWrites=0))

write(OWN/'meaningful-author-checks.actual.json',dict(checkedAtUTC=NOW,role='author selfcheck, not independent approval',
    verifiedV3Freeze=v3verified,componentCount=11,bilingualCaseCount=22,nullIDCandidates=7,existingGoalSupplements=4,
    sequenceChecks=sequence_checks,anticodonGAA3to5='CUU',repairComplementChecks=['TACG→ATGC','GTAC→CATG'],numericChecks=numeric,
    canonical464WholeGoalsExactVsV3=True,existingGoalIDsPreserved=464,changedCurrentWholeGoalIDs=changed,currentVsPreservedV3FieldDeltas=current_field_deltas,other460CurrentWholeGoalsExact=True,
    protectedNIWholeGoalsExact=protected,eightOriginalPCasesExact=True,fourFinalPNGs=png_checks,
    original47PartialRelationsRetained=True,sourceViewsExact=20,nativeBookWholePagesExact=383,newNativeDRecords=0,newNativePApprovals=0,newVApprovals=0,
    ownNewQualityMappingDirectories=[],ownNewRawLandscapeFiles=[],fullCentralQARun=False,activeWrites=0,humanApproval=False,wholeSourceClosure=False))

inputs={}
def bind(p,role):
    assert p.is_file();inputs[rel(p)]=dict(path=rel(p),sha256=sha(p),bytes=p.stat().st_size,role=role)
bind(v3freeze,'exact author v3 baseline freeze')
for r in v3verified['files']:bind(ROOT/r['path'],'actual frozen v3 author input')
for r in read(OWN/'native-physical-isolation.inputs.actual.json')['inputFiles']:bind(ROOT/r['path'],'actual regular-file native v4 physical input')
for r in png_checks:bind(ROOT/r['path'],'exact retained final primary PNG')
bind(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json','actual current canonical comparison; no active writes')
for name in ['goalBookSourceAtlasInputs.ts','goalBookModel.ts','goalBookViewCompiler.ts']:
    p=ROOT/'app/scripts'/name
    if p.is_file():bind(p,'actual read-only native implementation')
write(OWN/'actual-reviewed-inputs.author.freeze.json',dict(schemaVersion=1,createdAtUTC=NOW,fileCount=len(inputs),files=list(inputs.values()),
    role='author material and mechanical input preservation only',independentApproval=False,activeWrites=0))

freeze_path=OWN/'author-source-scope-remediation-v4.final.freeze.json'
assert not freeze_path.exists(),'Never overwrite a completed final freeze'
files=[dict(path=str(p.relative_to(OWN)),sha256=sha(p),bytes=p.stat().st_size) for p in sorted(OWN.rglob('*')) if p.is_file()]
write(freeze_path,dict(schemaVersion=1,createdAtUTC=NOW,role='author candidate; requires independent A/B review',fileCount=len(files),files=files,
    concreteBoundedComponents=11,bilingualNewCases=22,nullIDCandidates=7,assignedCanonicalIDs=[],existing383RuntimePagesPreserved=True,
    nativeDRecords=0,independentApprovalsAdded=0,humanApproval=False,wholeSourceClosure=False,activeWrites=0))
print(json.dumps(dict(freezePath=rel(freeze_path),freezeSHA256=sha(freeze_path),ownFiles=len(files),actualInputFiles=len(inputs),components=11,cases=22,nullIDCandidates=7)))
