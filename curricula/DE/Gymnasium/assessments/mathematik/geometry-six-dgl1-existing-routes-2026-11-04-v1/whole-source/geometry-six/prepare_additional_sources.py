from pathlib import Path
import json,hashlib,shutil,fitz
H=Path(__file__).resolve().parent;R=H.parents[2]
assert not (H/'review-input-manifest.json').exists()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'inputRoot':'.','path':str(p.relative_to(R)),'sha256':sha(p)}
def cp(src,name):
 dst=H/name;dst.parent.mkdir(exist_ok=True,parents=True);shutil.copyfile(src,dst);return {'originalBinding':bind(src),'privateCopy':name}
ids={g['id']for g in json.loads((H/'frozen-input.json').read_text())['wholeGoals']};copies=[];records=[]
mp=R/'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_math_upper_secondary_source_extraction_to_canonical_math.review.json';m=json.loads(mp.read_text());ep=R/m['sourceExtractionPath'];e=json.loads(ep.read_text());sg={g['id']:g for g in e['sourceGoals']};pg={g['id']:g for g in e['passages']};copies.extend([cp(mp,'original/additional-sources/BW.source-mapping.json'),cp(ep,'original/additional-sources/BW.source-extraction.json')]);pdf=R/e['sourceDocuments'][0]['path'];copies.append(cp(pdf,'original/additional-sources/BW.BP2016.pdf'))
for row in m['mappings']:
 if row['canonicalGoalId']not in ids:continue
 s=sg[row['legacyGoalId']];records.append({'jurisdiction':'DE-BW','canonicalGoalId':row['canonicalGoalId'],'wholeMappingRow':row,'wholeSourceGoal':s,'wholeSourcePassage':pg[s['passageId']],'wholeMappingDecisions':[v for v in m.get('decisions',[])if v.get('sourceGoalId')==s['id']]})
doc=fitz.open(pdf);pages=[]
# Complete actual pages containing these competence headings; printed numbering differs from PDF index.
for heading in ['3.4.2 Leitidee Messen','3.4.3 Leitidee Raum und Form','3.5.2 Leitidee Messen']:
 j={'3.4.2 Leitidee Messen':41,'3.4.3 Leitidee Raum und Form':42,'3.5.2 Leitidee Messen':47}[heading]
 matches=[(j,doc[j])]
 assert heading in ' '.join(doc[j].get_text().split())
 assert matches,heading
 for j,page in matches:
  if any(v['pdfPageIndex']==j and v['jurisdiction']=='DE-BW'for v in pages):continue
  stem=f'BW-BP2016-pdfpage{j+1}';(H/'source-pages'/f'{stem}.txt').write_text(page.get_text());page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(H/'source-pages'/f'{stem}.png');pages.append({'jurisdiction':'DE-BW','heading':heading,'pdfPageIndex':j,'text':'source-pages/'+stem+'.txt','image':'source-pages/'+stem+'.png','originalPdfBinding':bind(pdf)})
# Complete continuation pages for the retained whole official passages.
for j in [43,48]:
 page=doc[j];stem=f'BW-BP2016-pdfpage{j+1}';(H/'source-pages'/f'{stem}.txt').write_text(page.get_text());page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(H/'source-pages'/f'{stem}.png');pages.append({'jurisdiction':'DE-BW','heading':'Complete continuation of the preceding retained official passage','pdfPageIndex':j,'text':'source-pages/'+stem+'.txt','image':'source-pages/'+stem+'.png','originalPdfBinding':bind(pdf)})
# Bayern is scope/context evidence. Do not claim a new direct canonical mapping for the HE-authored goals.
bep=R/'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json';be=json.loads(bep.read_text());passage=next(p for p in be['passages']if p['id']=='by-math-gym-m13-3');bp=R/passage['sourcePath'];copies.extend([cp(bep,'original/additional-sources/BY.source-extraction.json'),cp(bp,'original/additional-sources/BY.M13.eA.Teil2.pdf')]);bdoc=fitz.open(bp)
for j,page in enumerate(bdoc):
 if 'Geraden und Ebenen im Raum'not in page.get_text():continue
 stem=f'BY-M13-eA-Teil2-pdfpage{j+1}';(H/'source-pages'/f'{stem}.txt').write_text(page.get_text());page.get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(H/'source-pages'/f'{stem}.png');pages.append({'jurisdiction':'DE-BY','heading':'M13 3 Geraden und Ebenen im Raum','pdfPageIndex':j,'text':'source-pages/'+stem+'.txt','image':'source-pages/'+stem+'.png','originalPdfBinding':bind(bp)})
records.append({'jurisdiction':'DE-BY','wholeSourcePassage':passage,'wholeSourceGoals':[g for g in be['sourceGoals']if g['id']in passage['sourceGoalIds']],'meaning':'Original actual M13 passage for parameter equations, plane normals, intersections, angles and application modelling. No direct canonical mapping or new official claim is manufactured for the six HE-authored goals. Their current BY T membership comes from the separately bound composition view.'})
(H/'additional-document-specific-source-context.json').write_text(json.dumps({'status':'ARCHIVED_COMPLETE_PRIMARY_SOURCE_PAGES_ONLY_NO_NEW_SCOPE_OR_MAPPING','copies':copies,'records':records,'completeRenderedPages':pages,'originalHEContractSource':'document-specific-source-context.json'},ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'ADDITIONAL_ARCHIVED_BW_BY_PRIMARY_PAGES_READY','records':len(records),'pages':len(pages)}))
