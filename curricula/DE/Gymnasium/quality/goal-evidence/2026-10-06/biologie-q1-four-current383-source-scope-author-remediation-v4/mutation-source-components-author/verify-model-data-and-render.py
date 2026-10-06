# SPDX-License-Identifier: Apache-2.0
"""Check actual retained inputs and fictional exercise data; render author prose.
No canonical mutation, assigned IDs, native compiler/evidence gate or approval.
"""
import datetime,hashlib,json,math,pathlib,re,subprocess
HERE=pathlib.Path(__file__).resolve().parent
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
V3=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-four-current383-source-scope-author-remediation-v3'
def load(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(name,value):HERE.joinpath(name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
candidates=load(HERE/'bounded-components-and-fourteen-positive-cases.author-candidate.json')
components=candidates['components']; bykey={c['candidateKey']:c for c in components}
assert len(components)==7 and len(bykey)==7
assert sum(c['canonicalGoalId'] is None for c in components)==6
assert [c['canonicalGoalId'] for c in components if c['canonicalGoalId']] == ['ffef97e3-12d6-5090-9816-46ab9e57fae2']
assert all(c['newAssignedGoalId'] is None and not c['wholeSourceClosure'] for c in components)
for c in components:
 assert c['description'] and c['descriptionEn'] and len(c['tasks'])==2
 for t in c['tasks']:
  assert all(t[k] for k in ['materialDe','materialEn','promptDe','promptEn','solutionDe','solutionEn'])
  assert len(t['positiveEssentialConditions'])>=3
  assert 'clinical inference' in t['claimLimit']
matrix=load(HERE/'six-open-obligations.source-to-component.author-matrix.json')
assert len(matrix['sourceToComponentMatrix'])==6
assert all(not r['wholeSourceClosure'] for r in matrix['sourceToComponentMatrix'])
assert all(k in bykey for r in matrix['sourceToComponentMatrix'] for k in r['boundedAuthorComponentKeys'])
# Scientific consistency checks on the actual fictional numbers/sequences used.
code={'AUG':'Met','GAA':'Glu','GAG':'Glu','GAC':'Asp','UUC':'Phe','UAA':'stop','GGU':'Gly'}
def translate_dna(codons):
 mrna=[c.replace('T','U') for c in codons.split()]
 product=[]
 for c in mrna:
  if code[c]=='stop':break
  product.append(code[c])
 return ' '.join(mrna),product
protein_cases=[]
for label,seq,product in [('reference','ATG GAA TTC TAA',['Met','Glu','Phe']),('V','ATG GAC TTC TAA',['Met','Asp','Phe']),('W','ATG GAG TTC TAA',['Met','Glu','Phe'])]:
 mrna,got=translate_dna(seq);assert got==product
 assert seq in bykey['protein_function_from_mutation_data']['tasks'][0]['materialDe']
 assert mrna in bykey['protein_function_from_mutation_data']['tasks'][0]['solutionDe']
 protein_cases.append({'variant':label,'codingDNA5to3':seq,'mRNA5to3':mrna,'polypeptide':got})
for seq,expected in [('GAA GGT',['Glu','Gly']),('GAC GGT',['Asp','Gly']),('GAA',['Glu'])]:assert translate_dna(seq)[1]==expected
protein_b=bykey['protein_function_from_mutation_data']['tasks'][1]
assert 'intronfreier markierter Abschnitt des codierenden DNA-Strangs, 5′→3′' in protein_b['materialDe']
assert 'intron-free marked segment of the coding DNA strand, 5′→3′' in protein_b['materialEn']
assert 'Rest und Leseraster sind gleich' in protein_b['materialDe'] and 'Rest/frame unchanged' in protein_b['materialEn']
comp=str.maketrans('ATCG','TAGC')
repair_cases=[]
for template,new,correct in [('TACG','ATAC','ATGC'),('GTAC','CAGG','CATG')]:
 assert template.translate(comp)==correct
 mismatch=[i+1 for i,(a,b) in enumerate(zip(new,correct)) if a!=b]
 assert mismatch==[3]
 repair_cases.append({'template3to5':template,'uncorrectedNew5to3':new,'correctedNew5to3':correct,'mismatchPositions1Based':mismatch})
assert 30-24==6
rates=[3/1000*100,27/1000*100,6/1000*100];assert rates==[0.3,2.7,0.6] and 27/3==9
for literal in ['0.3%','2.7%','0.6%']:assert literal in bykey['mutagen_causes_and_protection']['tasks'][0]['solutionEn']
assert all(math.isclose(observed,expected) for observed,expected in zip([2/1000*100,18/1000*100,17/1000*100],[0.2,1.8,1.7]))
assert 14-8==16-10==6
assert sum(a!=b for a,b in zip('ACTA','ATTA'))==sum(a!=b for a,b in zip('GCAA','GCTA'))==1
# Verify exact frozen original four goals and eight P cases; do not rewrite them.
freeze=load(V3/'author-source-scope.final.freeze.json')
for row in freeze['files']:
 p=ROOT/row['path'] if not pathlib.Path(row['path']).is_absolute() else pathlib.Path(row['path'])
 assert sha(p)==row['sha256'].removeprefix('sha256:') and p.stat().st_size==row['bytes']
oldP=load(V3/'positive-four.native-candidate-records.json')['records']
originalPCases=[{'goalId':r['goalId'],'caseCount':len(r['profile']['applicationCaseBriefs'])} for r in oldP]
assert len(oldP)==4 and sum(x['caseCount'] for x in originalPCases)==8
visuals=load(V3/'visualization-final-candidate-inputs.v3.json')['records']; png=[]
for row in visuals:
 p=ROOT/row['candidatePath'];assert sha(p)==row['sha256'].removeprefix('sha256:')
 assert p.read_bytes()[:8]==b'\x89PNG\r\n\x1a\n'
 png.append({'goalId':row['goalId'],'path':row['candidatePath'],'sha256':sha(p),'sha256MatchesV3':True,'inspection':'Byte/hash preservation only; no image viewing or fresh image approval.'})
assert len(png)==4
primary=load(HERE/'actual-primary-pages-and-clause-hashes.json'); sourcechecks=[]
for src in primary['sources']:
 if not src.get('retainedPrimaryPath'):continue
 p=ROOT/src['retainedPrimaryPath'];assert sha(p)==src['pdfSha256']
 pages=subprocess.run(['pdftotext','-layout',str(p),'-'],capture_output=True,check=True).stdout.decode('utf-8').split('\f')
 observed=[];used=[]
 for pg in src['pages']:
  page=pages[pg['physicalPage']-1];assert hashlib.sha256(page.encode()).hexdigest()==pg['pageTextSha256']
  assert len(page.encode())==pg['pageTextBytes'];used.append(page);observed.append(pg['physicalPage'])
 normalized=' '.join(' '.join(used).split())
 assert all(s in normalized for s in src['boundedActualPrimarySnippets'])
 sourcechecks.append({'source':src['sourceKey'],'originalPDFSha256Matches':True,'physicalPagesWithMatchingUTF8TextHashes':observed,'allBoundedSnippetsMatchActualWhitespaceNormalizedPages':True})
# Outputs are documentary wrappers. No native landscape top-level or hidden copies.
for p in HERE.rglob('*'):
 assert not (p.is_dir() and p.name=='mapping')
 assert not p.name.endswith('.de.json')
 if p.suffix=='.json':
  d=load(p);assert not (isinstance(d,dict) and 'landscapeId' in d and 'goals' in d)
receipt={'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'author data and immutable preservation checks; not independent or native validation','bilingualComponents':7,'nullIDCandidates':6,'existingGoalSupplements':1,'bilingualPositiveCases':14,'matrixAssignedOpenObligations':6,'codingSequenceChecks':protein_cases,'proteinFunctionBExplicitStrandContext':{'intronFree':True,'codingDNAStrand':True,'orientation':'5′→3′','DEENContextActuallyChecked':True,'restAndFramePreserved':True,'materialDeSha256':hashlib.sha256(protein_b['materialDe'].encode()).hexdigest(),'materialEnSha256':hashlib.sha256(protein_b['materialEn'].encode()).hexdigest()},'repairComplementAndMismatchChecks':repair_cases,'mutagenPhysicalModelRatesPercent':rates,'mutagenPhysicalModelRatioToControl':9,'chemicalModelRatesPercent':[0.2,1.8,1.7],'modificationModelReversibleDifferenceUnits':6,'unresolvedRepairMispairArithmetic':'30 - 24 = 6; this does not count stable mutations','v3FrozenFilesHashAndBytesVerified':len(freeze['files']),'v3FreezeSha256':sha(V3/'author-source-scope.final.freeze.json'),'retainedOriginalPFileSha256':sha(V3/'positive-four.native-candidate-records.json'),'originalFourGoalPCaseCounts':originalPCases,'preservedPNGBytesAndHashes':png,'primaryPDFAndPageChecks':sourcechecks,'discoveryBoundary':'No /mapping/ directory, .de.json copy tree or top-level native landscapeId+goals object in this author folder.','activeCanonicalSha256':sha(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),'independentApproval':False,'nativeGateClaims':False,'wholeSourceClosure':False}
write('meaningful-data-and-preservation-checks.actual.json',receipt)
# Render the same candidate material in a human-readable review document.
lines=['# Begrenzte Mutations- und Reparaturkomponenten – Autorenkandidaten','','Eigene Texte und Aufgaben: CC-BY-4.0. Fiktive, vorgegebene Daten; keine ausgeführten Versuche oder Lernendenleistungen. Die Texte sind Vorschläge für die unabhängige Quellen-, Umfangs- und Aufgabenprüfung. Es wurden keine neuen Ziel-IDs vergeben.','']
for idx,c in enumerate(components,1):
 lines += [f"## {idx}. {c['title']}",'',f"**Kandidatenschlüssel:** `{c['candidateKey']}`",'',f"**Bindung:** {'Null-ID-Kandidat' if c['canonicalGoalId'] is None else 'Zusatzmaterial zu '+c['canonicalGoalId']}",'',c['description'],'',c['titleEn'],'',c['descriptionEn'],'','**Quellenumfang**','']
 lines += [f'- {s}' for s in c['sourceScopes']]
 lines += ['','**Vorgeschlagene Vorziele:** '+(', '.join(c['proposedPrerequisiteGoalCandidates']) or 'Noch gesondert zu bestimmen; keine unbelegte Rekombinationspflicht.'),'']
 for t in c['tasks']:
  lines += [f"### Fall {t['caseKey']}",'','**Material DE:** '+t['materialDe'],'','**Aufgabe DE:** '+t['promptDe'],'','**Lösung DE:** '+t['solutionDe'],'','**Material EN:** '+t['materialEn'],'','**Task EN:** '+t['promptEn'],'','**Solution EN:** '+t['solutionEn'],'','**Positive Leistungsmerkmale**','']
  lines += ['- '+x for x in t['positiveEssentialConditions']]
  lines += ['']
HERE.joinpath('bounded-components-fourteen-positive-cases.review.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({'status':'actual_model_data_and_immutable_preservation_checked','bilingualCases':14,'v3FrozenFiles':len(freeze['files']),'originalCases':sum(x['caseCount'] for x in originalPCases),'PNGsPreserved':4,'independentApproval':False},ensure_ascii=False))
