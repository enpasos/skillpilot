from pathlib import Path
import json,hashlib,datetime
R=Path(__file__).resolve().parent
D=R/'sources/manufacturer'
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def dump(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
# Remove only failed content captures created by this author run, not original inputs.
for n in ['roth-P712-product','roth-9977-product','roth-A519-product']:
 for ext in ['.html','.txt']:
  p=D/(n+ext)
  if p.exists():p.unlink()
p=R/'candidate/P1.successor.whole-profile.body.json'
x=json.loads(p.read_text())
replacements={'8,40 g/L Wasser':'8,40 g/L fertige Lösung','1,00 g/L Wasser':'1,00 g/L fertige Lösung','8.40 g/L water':'8.40 g/L final solution','1.00 g/L citric acid in water':'aqueous citric acid at 1.00 g/L final solution'}
def replace(v):
 if isinstance(v,str):
  for a,b in replacements.items():v=v.replace(a,b)
  return v
 if isinstance(v,list):return [replace(i) for i in v]
 if isinstance(v,dict):return {k:replace(i) for k,i in v.items()}
 return v
x=replace(x);dump(p,x)
for n,c in enumerate(x['applicationCaseBriefs'],1):
 p=R/f'candidate/CASE-{n}.complete.operative.json';v=json.loads(p.read_text());v['case']=c;dump(p,v)
old=json.loads((R/'archive/P1.previous-current.whole-profile.json').read_text());changes=[]
def diff(a,b,p=''):
 if isinstance(a,dict) and isinstance(b,dict):
  for k in sorted(a.keys()|b.keys()):
   q=p+'/'+k.replace('~','~0').replace('/','~1')
   if k not in a:changes.append({'pointer':q,'kind':'added','before':None,'after':b[k]})
   elif k not in b:changes.append({'pointer':q,'kind':'removed','before':a[k],'after':None})
   else:diff(a[k],b[k],q)
 elif a!=b:changes.append({'pointer':p,'kind':'changed','before':a,'after':b})
diff(old,x);p=R/'candidate/P1.successor.substantive-field-diff.json';v=json.loads(p.read_text());v['changes']=changes;dump(p,v)
archive=json.loads((R/'archive/INPUTS.exact-archive.manifest.json').read_text())
primary=[
 {'id':'SN-binding-operator','officialUrl':'https://www.schulportal.sachsen.de/lplandb/lehrplan/file/521/lnuYavMOfLLQRd2MlehG','originalPDF':pin(R/'archive/lehrplan-gymnasium-chemie-sachsen-2025.pdf'),'pages':[{'physical':4,'printed':'IV','use':'Goals/content are binding; remarks recommend.'},{'physical':24,'printed':'12','use':'Grade 8 LB5, left-column experimental examination of acidic solutions using indicators; right-side SE remark.'}],'authorityLimit':'Author read the actual current archived primary PDF; no source-union approval is granted.'},
 {'id':'MN-92110-actual-instructions','officialUrl':'https://www.mn-net.com/media/pdf/Instruction-92110-pH-test-strips-pH-Fix-0-14-fixed-indicator.pdf','retrievalMode':'Official PDF content read via web tool, German/English first pages, Rev 10/2026; direct HTTP bytes download blocked (403).','extractionCapture':pin(D/'web-primary-extractions.json'),'use':'Product identity 92110, original reference scale, visual whole-field immersion 1 s, remove excess, match chart; insufficient buffering requires colour constancy.','notOriginalPDFPin':True},
 {'id':'MN-90201-product-and-paper-instructions','officialUrls':['https://www.mn-net.com/us/universal-indicator-paper-ph-1-11-reel-90201?c=6098','https://www.mn-net.com/media/pdf/9b/88/e0/Instruction-902xx-Universal-and-special-indicator-pH-test-paper.pdf'],'retrievalMode':'Official product page and official paper-instruction PDF search extraction read via web tool; original PDF bytes unavailable locally.','productExtractionCapture':pin(D/'web-primary-extractions.json'),'instructionExtractionCapture':pin(D/'MN-902xx.primary-search-extraction.txt'),'use':'90201 range 1–11, own single-colour chart; read damp. For weak/unbuffered solution, paper against tube inside wall, fill to brim, compare through glass after about 1 min.','notOriginalPDFPin':True},
 {'id':'ROTH-P712-identity','officialUrl':'https://www.carlroth.com/de/en/buffer-solutions-roticalipure/buffer-solution-ph-4-00-%C2%B10-01-%2820-%C2%B0c%29/p/p712.1','retrievalMode':'Official primary manufacturer product text read via web search.','use':'P712 colourless ready-to-use pH4.00±0.01 at20°C citrate buffer, as distinct from red-tinted A517.','sourceBytesArchived':False,'limit':'Actual bottle/lot and current local safety information still required; no safety clearance inferred.'},
 {'id':'ROTH-9977-identity','officialUrl':'https://www.carlroth.com/en/en/rotistar-ph-buffer-solutions/buffer-solution-ph-7-00-%C2%B10-01-%2820-%C2%B0c%29/p/9977.1','retrievalMode':'Official primary manufacturer product text read via web search.','use':'9977 colourless pH7.00±0.01 at20°C phosphate mixture (potassium dihydrogen phosphate/disodium hydrogen phosphate).','sourceBytesArchived':False,'limit':'Actual bottle/lot and current local safety information still required; no safety clearance inferred.'},
 {'id':'ROTH-0965-SDS','officialUrl':(D/'SDB-0965.source-url.txt').read_text().strip(),'originalPDF':pin(D/'SDB-0965.original.pdf'),'retrievalMode':'Full original manufacturer SDS downloaded and first pages read locally.','use':'NaHCO3≥99%, product0965, CAS144-55-8, German SDS4.1 revised2024-09-18; laboratory use and no private/food use.','limit':'Not a release of the prepared classroom mixture or a statement that current local stock has no risks.'},
 {'id':'ROTH-X863-stock-identity-and-risk','officialUrls':['https://www.carlroth.com/downloads/sdb/de/X/SDB_X863_CH_DE.pdf','https://www.carlroth.com/medias/SDB-X863-BE-DE.pdf'],'retrievalMode':'Manufacturer SDS primary web extraction read, including stock identity CAS77-92-9 and irritation hazards; original bytes download unsuccessful.','extractionCapture':pin(D/'web-primary-extractions.json'),'use':'Anhydrous citric acid≥99.5%, X863; restrict solid handling/preparation to teacher and require current actual local safety information.','notOriginalPDFPin':True,'limit':'Swiss/Belgian historical extraction is not a German school release; obtain actual current relevant SDS before real work.'}
]
limits=['This is the finite author artifact, inactive. It does not close source coverage or grant P/D/M/V acceptance.','Manufacturer colour scales are not reproduced or invented. Concrete original product charts and actual stock/lot identifiers must be materialized and bound before laboratory use.','The authored pH ranges for prepared citric acid and bicarbonate are broad chemistry-model orientations, not measured product certifications or guaranteed chart matches. Actual observations and controls govern.','No actual own raw observations, teacher signature, safety release, learner mastery or human approval exists in this package.','The current binding goal, prerequisite and good image are unchanged; former P aggregate remains byte-exact with all438other rows.','Third-party source documents retain their original rights; archival/source citation is not relicensing.']
dump(R/'sources/SOURCE-PINS.and-LIMITS.json',{'role':'Author source provenance and exact available file pins; not an acceptance manifest','capturedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'cleanCurrentSelector':pin(R/'archive/SELECTOR.clean-current-Source9-HB97-with-whole-target-subtrees-real-assets-materials.sealed.json'),'originalInputsArchiveManifest':pin(R/'archive/INPUTS.exact-archive.manifest.json'),'primarySources':primary,'priorFirstReviewsUsedAs':'Author error checklist only; archived whole, not new independent votes.','unchangedInputPins':[i['original'] for i in archive['inputs']],'limits':limits})
print(json.dumps({'sourceCount':len(primary),'ownDirectory':str(R),'wholeProfileSHA256':pin(R/'candidate/P1.successor.whole-profile.body.json')['sha256'],'limits':limits[:2]},ensure_ascii=False,indent=2))
