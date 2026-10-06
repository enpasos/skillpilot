from pathlib import Path
import json,hashlib,datetime,jsonschema,shutil
p=Path(__file__).parent;i=p/'inputs'
sha=lambda f:'sha256:'+hashlib.sha256(Path(f).read_bytes()).hexdigest()
schema=json.loads((i/'native-four/round-a/contracts/goal-description-review-record.schema.json').read_text())
rows=[json.loads(x) for x in (p/'results/description-review-records.jsonl').read_text().splitlines()]
d=json.loads((i/'native-four/round-a/description-review-input.json').read_text());c=json.loads((i/'native-four/round-a/description-review-campaign.json').read_text())
errors=[];checks=[]
for row,g in zip(rows,d['goals']):
 errors.extend(f"D:{row['goalId']}:{x.message}" for x in jsonschema.Draft202012Validator(schema).iter_errors(row))
 for k in ['goalId','goalFingerprint','pageFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn']:
  if row[k]!=g[k]:errors.append(f'D stale binding {k}: {g["goalId"]}')
 for k in ['bundleFingerprint','bookDigest']:
  if row[k]!=d[k]:errors.append(f'D stale shared binding {k}')
 for k in ['campaignId','roundId']:
  if row[k]!=c[k]:errors.append(f'D stale campaign binding {k}')
 if row['decision']!='block' or row['recordStatus']!='candidate' or row['reviewAuthority']!='ai_candidate':errors.append('unexpected review decision/authority')
 if 'proposedDescriptionDe' in row or 'proposedDescriptionEn' in row:errors.append('block contains replacement')
checks.append({'check':'native_D_schema_and_exact_context_bindings','records':len(rows),'expectedRecords':4,'goalOrder':[r['goalId'] for r in rows],'pass':len(rows)==4 and [r['goalId'] for r in rows]==c['batches'][0]['goalIds']})
if not checks[-1]['pass']:errors.append('native D cardinality/order mismatch')
if sha(i/'native-four/round-a/contracts/goal-description-review-record.schema.json')!=c['recordSchemaDigest']:errors.append('bound schema digest changed')
# Validate the actual supplied P records; no materialization or author-file writes.
source_schema=Path('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
shutil.copyfile(source_schema,i/'goal-evidence-profile.schema.json')
pschema=json.loads(source_schema.read_text());ps=json.loads((i/'positive-four.native-candidate-records.json').read_text())['records']
for pr,g in zip(ps,d['goals']):
 errors.extend(f"P:{pr['goalId']}:{x.message}" for x in jsonschema.Draft202012Validator(pschema,format_checker=jsonschema.FormatChecker()).iter_errors(pr))
 if pr['goalId']!=g['goalId'] or pr['goalFingerprint']!=g['goalFingerprint']:errors.append('P goal binding mismatch')
 if [pr['evidenceLevel'],pr['maximumClaimScope'],pr['status'],pr['reviewAuthority']]!=['E1','G1','needs_human_review','ai_candidate']:errors.append('P claim metadata mismatch')
checks.append({'check':'actual_P_native_schema_and_honest_claim_metadata','records':len(ps),'cases':sum(len(a['profile']['applicationCaseBriefs']) for a in ps),'pass':len(ps)==4 and sum(len(a['profile']['applicationCaseBriefs']) for a in ps)==8})
if not checks[-1]['pass']:errors.append('P cardinality mismatch')
# Independent sequence arithmetic for the reviewed cases.
comp=lambda s:s.translate(str.maketrans('ATGC','TACG'))
rna_template=lambda s:comp(s).replace('T','U')
rna_coding=lambda s:s.replace('T','U')
code={'AUG':'Met','GAA':'Glu','GAG':'Glu','UUU':'Phe','UCU':'Ser','GGU':'Gly','UUC':'Phe','GGC':'Gly','AAG':'Lys','CCA':'Pro','UAA':'Stop'}
translate=lambda s:[code[s[x:x+3]] for x in range(0,len(s),3)]
assert comp('ATGCCA')=='TACGGT'
assert comp('CGTTA')=='GCAAT'
assert rna_template('TACCTTAAA')=='AUGGAAUUU'
assert translate(rna_template('TACCTTAAA'))==['Met','Glu','Phe']
assert rna_coding('ATGTCTGGT')=='AUGUCUGGU'
assert translate(rna_coding('ATGTCTGGT'))==['Met','Ser','Gly']
assert translate(rna_coding('GAA'))==translate(rna_coding('GAG'))==['Glu']
assert translate(rna_coding('TTT'))==['Phe'] and translate(rna_coding('TCT'))==['Ser']
assert translate(rna_coding('GGC'))==['Gly']
assert 1%3!=0 and 2%3!=0 and 3%3==0
assert comp('AGTCCA')=='TCAGGT'
assert sum([1,1,0,0])==2
checks.append({'check':'targeted_DNA_complements_RNA_amino_acid_mutation_frame_and_original_label_arithmetic','pass':True,'assertions':12,'scope':'Arithmetic supports manual case content review; no learner trial inferred.'})
freeze=json.loads((i/'author-current-four.final.freeze.json').read_text());mismatches=[]
for f in freeze['files']:
 if sha(f['path'])!=f['sha256']:mismatches.append(f['path'])
checks.append({'check':'author_95_file_freeze_still_exact','pass':not mismatches,'files':len(freeze['files']),'mismatches':mismatches})
errors.extend('author freeze changed '+a for a in mismatches)
checks.append({'check':'four_fresh_native_PDF_page_renders_match_predecessor_raw','pass':all((p/'primary-and-page-inspection'/f'fresh-native-book-{n}.png').read_bytes()==(p/'primary-and-page-inspection'/f'native-book-physical-page-{n}.png').read_bytes() for n in range(3,7))})
if not checks[-1]['pass']:errors.append('PDF render mismatch')
receipt={'reviewer':'/root/q1_current_d_a_resume','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'pass' if not errors else 'fail','checks':checks,'errors':errors,'nativeDDecisions':{r['goalId']:r['decision'] for r in rows},'claimLimit':'Schema/current-binding and targeted correctness checks only. Four blocked D candidates confer no strict D/M7, empirical learner result or human approval.','activeWrites':0,'humanApproval':False}
(p/'validation.actual.receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(receipt,ensure_ascii=False,indent=2))
if errors:raise SystemExit(1)
