# SPDX-License-Identifier: Apache-2.0
# Locator authoring only. Preserve histories and apply selected IDs additively.
import json,hashlib,re
from pathlib import Path
from datetime import datetime,timezone
from bs4 import BeautifulSoup
import fitz
B=Path(__file__).resolve().parents[1];ROOT=B.parents[6]
# Resolve through actual current working directory; every stored path is repo relative.
ROOT=Path.cwd()
registry=json.loads((B/'sources/actual-primary-registry.author-working.json').read_text());input=json.loads((B/'inputs/whole-current-direct-source-witnesses.neutral.json').read_text());goals=json.loads((B/'inputs/whole-current-DE-EN-goals.neutral.json').read_text())['wholeCurrentGoalObjects'];gby={g['id']:g for g in goals}
NOW=datetime.now(timezone.utc).isoformat()
def digest(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def doc_for(w):
 key=w['sourceDocument']['key'];s=w['wholeCurrentSourceGoal'];sid=s['id']
 if key=='LEHRPLANPLUS_BIOLOGIE_GYMNASIUM':key='LEHRPLANPLUS_BIOLOGIE_GYMNASIUM_CURRENT_B10' if s.get('topicCode','').startswith('B10') else 'LEHRPLANPLUS_BIOLOGIE_GYMNASIUM_CURRENT_B8'
 docs=[d for d in registry['documents'] if d['sourceDocumentKey']==key]
 if len(docs)>1:
  state='BE' if sid.startswith('be-') else 'BB';docs=[d for d in docs if '/primary/'+state+'-' in d['actualPrimaryPath']]
 assert len(docs)==1,(sid,key)
 return docs[0]
def pages_for(s):
 sid=s['id'];tc=str(s.get('topicCode') or '');ref=str(s.get('sourceRef') or '')
 if sid.startswith('hb-'):
  if '-gliedertiere-' in sid:return [28]
  if '-koerperleistungen-' in sid:return [30] if any('-'+x+'-' in sid for x in ['037','038','039']) else [29]
  if '-sinne-wahrnehmung-' in sid:return [31]
  if '-ernaehrung-' in sid:return [32]
  if '-sexualitaet-' in sid:return [31] if any('-'+x+'-' in sid for x in ['054','055','057']) else [32]
 if sid.startswith('hh-'):return [19] if '-pb-' in sid else [27,28]
 if sid.startswith('mv-'):return [16] if '-pb-' in sid else ([20] if '-j7-' in sid else [24])
 if sid.startswith('sn-'):return [13,14,15] if '-pb-' in sid else [34,35,36]
 if sid.startswith('st-'):return [6,7,8,11,17] if '-pb-' in sid else ([25] if '-sj56-' in sid else ([34,35] if '-sj78-' in sid else [38,39]))
 if sid.startswith('th-'):return [19,24,25] if '-pb-' in sid else [22,23,24]
 if sid.startswith('rp-'):return [36,37] if 'tf06' in sid else [40,41]
 if sid.startswith(('bb-','be-')):
  if '-2-3-' in sid:return [22,23,24]
  if '-3-3-' in sid:return [30]
  if '-3-4-' in sid:return [32]
  if '-3-6-' in sid:return [34]
 if sid.startswith('nw-'):
  if '-if2-' in sid:return [24,25]
  if '-if3-' in sid:return [25,26]
  if '-if7-' in sid:return [35,36]
  if '-if8-' in sid:return [37,38]
  if '-pb-' in sid:return [21,29]
 if sid.startswith('sh-'):return [19] if '-pb-' in sid else [24,32]
 if sid.startswith('sl-'):
  if '-ern5-' in sid:return [19,20]
  if '-atm6-' in sid:return [36,37]
  if '-pfl5-' in sid:return [25,26]
  if '-sex6-' in sid:return [34,35]
 if sid.startswith('bw-'):
  if '-p22-' in sid:return [13]
  if '-p23-' in sid:return [14]
  if '-k78-ev-008-' in sid:return [18]
  if '-k78-ev-' in sid:return [17]
  if '-k78-abk-' in sid:return [19]
  if '-k78-fe-' in sid:return [20] if any('-'+x+'-' in sid for x in ['005','006']) else [19]
  if '-k78-is-' in sid:return [20] if '-003-' in sid else [21]
 if sid.startswith('ni-'):return [80] if '-bw-' in sid else [87]
 if sid in ['43600f6d-acee-4fca-a0da-790b3da50542','46b5ebc1-9fe4-4325-a4c1-b541a14349c4','3fd526ec-95bd-4428-b256-f7027d95ee7d']:return [14]
 if tc.startswith('B'):return []
 raise ValueError((sid,tc,ref))
# Actual read page 34 for ST's ongoing 7/8 table continuation is supplied below.
allnotes=[];unique={};changes=[];mapchanges=[];removals=[];docbindings={}
for row in input['rows']:
 gid=row['goalId'];goal=gby[gid]
 for w in row['wholeDirectSourceWitnesses']:
  s=w['wholeCurrentSourceGoal'];sid=s['id'];doc=doc_for(w);p=doc['actualPrimaryPath'];pgs=pages_for(s)
  assert digest(p)==doc['sha256'],p
  loc={'officialUrl':doc.get('url') or doc.get('originalSourceDocumentDescriptor',{}).get('url'),'actualPrimaryPath':p,'actualPrimarySha256':doc['sha256'],'sourceDocumentKey':('HE-G9-BIOLOGIE-SEKI-ACTUAL-PRIMARY-6-1' if doc['sourceDocumentKey']=='G9_BIOLOGIE_SEKI' else doc['sourceDocumentKey']),'physicalPagesOneBased':pgs,'originalSourceReferenceRetainedAsHistory':s.get('sourceRef'),'primaryReadRole':'AUTHOR actual targeted operator/context examination; independent source judgement pending'}
  if p.endswith('.pdf'):
   pdf=fitz.open(p);loc['wholeSelectedPageTextSha256']=[{'physicalPage':n,'sha256':'sha256:'+hashlib.sha256(pdf[n-1].get_text().encode()).hexdigest()} for n in pgs]
  else:
   tc=s['topicCode'];lb=int(tc.split('.')[1]);idx=s['bulletIndex'];loc.update({'section':f'B{10 if tc.startswith("B10") else 8} Lernbereich {lb}','competenceExpectationIndexOneBased':idx,'indexIsLocalOrdinalNotOfficialSubpointNumber':True})
  baseNote=f"Gezielt betrachtete kanonische Leistung: {goal['title']}. Aktuelle Quellleistung: {s['description']}. Der vollständige Quelloperator und Kontext sind über die tatsächliche Primärfundstelle gebunden; keine Gesamtfach-/Kurs- oder menschliche Freigabe."
  limits=['Only the selected overlap is examined. All other topic, stage, course, experiment and assessment claims remain outside this author candidate.','Current technical mapping coverage is not proof of exact semantic equivalence or actual learner mastery.']
  if '-pb-' in sid or (s.get('rawSourceText') is None):limits.append('This structured source goal is an authored synthesis or operationalisation. The primary page supplies the original operator/context; the synthesis is not a verbatim official bullet.')
  if sid.startswith('hb-'):limits.append('The actual cached PDF includes the 2022 restriction to grades5–9. A historical grade10 section heading is not a renewed grade10 applicability approval; existing restriction/reduction policy must remain.')
  if '-k78-ev-008-' in sid:limits.append('The historical BW wording calls eating disorders addictive behaviour. This candidate does not classify every eating disorder as an addiction or diagnose someone from eating habits.')
  if sid=='sl-biology-seki-nw56-2012-pfl5-003-b5650cc6':limits.append('Only fusion of male/female gametes is a shared concept. This plant operator does not establish human conception, implantation, pregnancy, fruits/seeds or complete canonical goal equivalence.')
  if sid=='sl-biology-seki-nw56-2012-pfl5-004-c265b417':
   limits.append('Fruit forms, seed dispersal and vegetative plant propagation have no direct assessable overlap with this canonical human conception/prenatal goal. Remove only this source→a6f2 mapping; preserve every other source target.')
   removals.append({'sourceGoalId':sid,'canonicalGoalId':gid,'beforeMapping':w['wholeCurrentMappingRecord'],'proposedAction':'REMOVE_ONLY_THIS_PAIR','reason':'Actual SL physical26 operator is fruit/seed dispersal and vegetative propagation, not human fertilisation/prenatal development. Other sexual-reproduction and SEX6 source routes retain SL human coverage. Independent source/applicability checks required.'})
  if ('abbruch' in s['description'].lower()) or ('schweineauge' in s['description'].lower()):limits.append('This canonical goal does not establish the complete legal abortion evaluation or actual pig-eye preparation performance; preserve partial coverage, no legal/practical release inferred.')
  allnotes.append({'canonicalGoalId':gid,'sourceGoalId':sid,'wholeOriginalSourceGoalSha256':'sha256:'+hashlib.sha256(json.dumps(s,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'wholeCurrentMapping':w['wholeCurrentMappingRecord'],'actualPrimaryLocator':loc,'authorScopeNoteDe':baseNote,'limitations':limits,'authorReviewStatus':'candidate; actual source examined; independent verification pending','newSourceApproval':False,'humanApproval':False,'humanTrial':False})
  unique.setdefault(sid,{'sourceGoalId':sid,'wholeBefore':s,'actualPrimaryLocator':loc,'canonicalGoalIds':[]})['canonicalGoalIds'].append(gid)
  docbindings[(doc['sourceDocumentKey'],p)]=doc
# Additive patches to selected whole source objects: never use an old whole extraction snapshot as the live successor.
for sid,u in unique.items():
 s=u['wholeBefore'];after=json.loads(json.dumps(s));loc=u['actualPrimaryLocator'];after['actualPrimaryLocator']=loc;after['sourceDocumentKey']=loc['sourceDocumentKey']
 if s.get('topicCode','').startswith(('B8.','B10.')):
  # Actual HTML contains the full selected original competency, including inline spans; body preserved exactly.
  sp=BeautifulSoup(Path(loc['actualPrimaryPath']).read_text(),'html.parser')
  for e in sp.select('dialog,script,style,nav,header,footer'):e.decompose()
  norm=lambda t:re.sub(r'\s+',' ',str(t)).strip().replace('\xa0',' ')
  assert norm(s['description']) in norm(sp.get_text(' ',strip=True)),sid
  after['granularity']='officialCompetency'
 elif s.get('topicCode')=='6.1':
  after['granularity']='authoredOperationalization'
  after['rawSourceSpan']='6.1 Sexualität des Menschen, verbindliche Inhalte, gedruckte S.13 / physische Seite14'
  after['sourceRef']='Lehrplan Biologie Gymnasium G9 Hessen, 6.1 Sexualität des Menschen, gedruckte S.13 / physische Seite14; eigene Operationalisierung, alte6.1.x-Alias-ID bleibt historisch'
  items={'46b5ebc1-9fe4-4325-a4c1-b541a14349c4':'Geschlechtsmerkmale\nVeränderungen in der Pubertät','3fd526ec-95bd-4428-b256-f7027d95ee7d':'Zeugung, Empfängnis\nPränatale Entwicklung (Gefahren für das ungeborene Leben)','43600f6d-acee-4fca-a0da-790b3da50542':'Pränatale Entwicklung (Gefahren für das ungeborene Leben)\nSchwangerschaft und Geburt'}
  after['rawSourceText']=items[sid];after['rawParentBulletText']='Verbindliche Unterrichtsinhalte/Aufgaben: Fortpflanzung und Entwicklung'
  after['sourcePrecisionCorrection']={'role':'AUTHOR proposed precision correction','aliasSubpointIsNotOfficial':True,'actualPrimaryFundstelle':after['rawSourceSpan'],'ownAssessableDescriptionPreserved':True,'wholeCourseApproval':False,'humanApproval':False}
  for gid in u['canonicalGoalIds']:mapchanges.append({'sourceGoalId':sid,'canonicalGoalId':gid,'beforeMatchType':'exact','proposedMatchType':'partial','reason':'Official6.1 contains nominal topic items, not separate assessable6.1.1–3 competencies. Own operationalisation is more specific than this primary source granularity.'})
 changes.append({'sourceGoalId':sid,'wholeBeforeFromNeutral':s,'wholeAfterAuthorCandidate':after,'changedFields':[k for k in set(s)|set(after) if s.get(k)!=after.get(k)],'mergeRule':'Apply only named changed fields to the newest operative object after comparing unchanged science/operator body and existing metadata. Preserve all active Neuro8/HE6 and every nonselected source goal/occurrence; never replace a whole older extraction.','independentReviewPending':True})
report={'schemaVersion':1,'role':'Own SOURCE AUTHOR candidates only; actual primary reading is not independent approval','createdAt':NOW,'canonicalGoalIds':[g['id'] for g in goals],'actualPrimaryDocuments':list(docbindings.values()),'directWitnessCount':len(allnotes),'uniqueSourceGoalCount':len(unique),'individualDirectWitnessNotes':allnotes,'additiveSourceGoalFieldDeltas':changes,'targetedMappingMatchTypeDeltas':mapchanges,'targetedPairRemovalCandidates':removals,'wholeCourseApproval':False,'newHumanApproval':False,'humanTrial':False,'strictGain':0,'newSourceApproval':False}
descriptors=[]
for originalKey,newKey,title in [
 ('LEHRPLANPLUS_BIOLOGIE_GYMNASIUM_CURRENT_B8','LEHRPLANPLUS_BIOLOGIE_GYMNASIUM_CURRENT_B8','LehrplanPLUS Bayern Biologie Gymnasium8, tatsächliche offizielle Kompetenzseite'),
 ('LEHRPLANPLUS_BIOLOGIE_GYMNASIUM_CURRENT_B10','LEHRPLANPLUS_BIOLOGIE_GYMNASIUM_CURRENT_B10','LehrplanPLUS Bayern Biologie Gymnasium10, tatsächliche offizielle Kompetenzseite'),
 ('G9_BIOLOGIE_SEKI','HE-G9-BIOLOGIE-SEKI-ACTUAL-PRIMARY-6-1','Hessen Biologie Gymnasium G9, tatsächliches offizielles PDF,6.1 gedruckte S.13 / physische Seite14')
]:
 selected=next(d for d in registry['documents'] if d['sourceDocumentKey']==originalKey)
 descriptors.append({'key':newKey,'title':title,'path':selected['actualPrimaryPath'],'url':selected.get('url') or selected.get('originalSourceDocumentDescriptor',{}).get('url'),'official':True,'sha256':selected['sha256'],'provenance':'Actual official primary bytes; AUTHOR selected operator/context reading; no independent approval or rights grant','additiveMerge':'Reuse exact current B8 key and preserve old derived descriptors as history. Add B10/HE keys only if absent; compare any existing descriptor before integrating. Never overwrite a whole older source config.'})
report['proposedActualPrimarySourceDocumentDescriptors']=descriptors
report['sourceDocumentMergeRule']='Add selected actual-primary descriptors and selected sourceGoal fields to the newest active source configuration; preserve all current Neuro8/HE6 successors, old descriptors, unrelated goals/occurrences and reduction policies.'
assert len(allnotes)==187 and len(unique)==98
(B/'sources/187-witnesses-98-source-goals.actual-primary-and-additive-deltas.author.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'witnesses':len(allnotes),'uniqueSourceGoals':len(unique),'documents':len(docbindings),'fieldDeltas':len(changes),'HEprecisionMappings':len(mapchanges),'targetedUnsupportedPairRemovalCandidates':len(removals),'sourceApproval':False}))
