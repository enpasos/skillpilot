"""Inactive source-binding candidates. Existing operative files are never written."""
from pathlib import Path
import copy, datetime, hashlib, json, shutil

ROOT=Path.cwd(); OWN=Path(__file__).parent
V1=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-q4-evolution-eighteen-whole-science-author-20261008-v1'
A=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-q4-evolution-eighteen-whole-science-independent-a-20261008-v1'
def read(p): return json.loads(Path(p).read_text())
def rel(p): return str(Path(p).relative_to(ROOT))
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(n,x):
 p=OWN/n; p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f: f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def snap(p):
 p=Path(p); p=p if p.is_absolute() else ROOT/p
 t=OWN/'input-snapshots'/rel(p);t.parent.mkdir(parents=True,exist_ok=True)
 assert not t.exists();shutil.copyfile(p,t);return rel(t)
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
ids=read(V1/'selected-eighteen-current-goal-ids.author.json')
canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
kinds='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
atlas='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
cfg=read(atlas);land=read(canonical);by={g['id']:g for g in land['goals']}
mp=next(p for p in cfg['mappingPaths'] if 'upper-secondary/hessen_biology_' in p)
m=read(mp); ep=m['sourceExtractionPath'];e=read(ep)
assert len(e['sourceGoals'])==144 and len(m['decisions'])==144
selected={by[k]['extendedData']['provenance']['sourceGoalId']:k for k in ids}
assert len(selected)==18 and selected.keys()<= {s['id'] for s in e['sourceGoals']}
inputs={}
for p in [canonical,kinds,atlas,cfg['durationModelPolicyPath']]+cfg['mappingPaths']:
 if p not in inputs:inputs[p]=snap(p)
for p in cfg['mappingPaths']:
 ex=read(p)['sourceExtractionPath']
 if ex not in inputs:inputs[ex]=snap(ex)
for p in ['A18.retained-sixteen-plus-two-targeted.review.jsonl','M18.retained-sixteen-plus-two-targeted.review.jsonl','P18.retained-sixteen-plus-two-targeted.review.jsonl','A-M-P.targeted-two-goal-binding-review.actual.json','independent-a.final-source-science.freeze.json']:
 inputs[rel(A/p)]=snap(A/p)
for p in ['eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.json','eighteen-whole-primary-source-duty-and-operative-binding-proposals.author.json','proposed-eighteen-whole-DEEN-bodies.targeted-two-goal-wording-author.json','actual-complete-official-page-extraction.provenance.json','eighteen-whole-science-native-P18-author-input.first.freeze.json']:
 inputs[rel(V1/p)]=snap(V1/p)
for p in sorted((V1/'sources').glob('*.txt')): inputs[rel(p)]=snap(p)
patch=read(V1/'proposed-eighteen-whole-DEEN-bodies.targeted-two-goal-wording-author.json')['patches']
patched=copy.deepcopy(land)
for p in patch:
 g=next(g for g in patched['goals'] if g['id']==p['goalId'])
 assert g[p['field']] in [p['before'],p['after']]
 g[p['field']]=p['after']
write('canonical.current-whole-plus-only-two-reviewed-wording-patches.inactive.candidate.json',patched)

def component(page,start,stop=None):
 path=V1/f'sources/current-HE-physical-page-{page:03}.whole-official.txt'
 text=path.read_text();lines=text.splitlines(keepends=True)
 begin=next(i for i,line in enumerate(lines) if start in line)
 if stop is None:
  end=begin+1
  while end<len(lines) and lines[end].strip() and not lines[end].startswith('–') and not lines[end].startswith('E ') and not lines[end].startswith('S') and not lines[end].startswith('E9'):end+=1
 else:end=next(i for i in range(begin+1,len(lines)) if stop in lines[i])
 raw=''.join(lines[begin:end]).rstrip('\r\n')
 assert raw in text
 return {'recordId':f'HE-current-p{page}-lines{begin+1}-{end}','originalText':raw,'physicalPage':page,'printedPage':page,'zeroBasedPdfPage':page-1,'firstTextLine1Based':begin+1,'lastTextLine1Based':end,'wholeOriginalPagePath':inputs[rel(path)],'wholeOriginalPageSha256':'sha256:'+sha(path),'originalTextSha256':'sha256:'+hashlib.sha256(raw.encode()).hexdigest(),'primaryUrl':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf','primaryPdfSha256':'sha256:52c278d6f5a7383361631d5251550c42222f13e1bbe2aa16d39ca3b12c5e1558','rawTextExtraction':'pdftotext -layout; no hyphen, spelling or whitespace normalization of this component','officialBulletNumberingClaim':False}
principles=component(42,'–   weitere grundlegende Prinzipien')
homologies=component(42,'–   Belege für die Evolution')
trees=component(42,'–   Stammbäume:')
behavior=component(42,'–   proximate')
human=component(42,'–   Evolution des Menschen:')
culture=component(42,'–   kulturelle Evolution:')
primates=component(42,'–   Sozialverhalten bei Primaten:')
misuse=component(42,'–   Missbrauch der Evolutionstheorie')
endosymbiosis=component(36,'–     evolutionsbiologischer Aspekt:')
fossils=component(41,'Formenvielfalt und Angepasstheit','Ein Verständnis')
s5=component(26,'S5   ')
e9=component(27,'E9    ')
e12=component(27,'E 12 ')
compulsory=component(42,'verbindlich: Themenfelder 1 und 3;','Die Angaben')
full=[
 [homologies,fossils,endosymbiosis], [principles], [human,fossils], [culture], [primates,behavior], [misuse,compulsory],
 [principles,e9,e12], [homologies,trees,s5,e9,e12], [human,culture,fossils,e9,e12], [principles,s5,e9,e12],
 [principles,s5,e9,e12], [principles,e9,e12], [principles,s5], [principles,s5,e9,e12], [principles,s5,e9,e12],
 [behavior,principles,primates], [trees,homologies,e9,e12], [homologies,trees,e9,e12]]
enrichment={7,10,13}; optional={5}
notes=read(V1/'eighteen-whole-primary-source-duty-and-operative-binding-proposals.author.json')['wholeSourceNotes']
before=copy.deepcopy(e);after=copy.deepcopy(e)
after['extractionId']=e['extractionId']+'-evolution18-operative-source-candidate-20261008-v2'
after['pipelineStatus']='author_candidate_pending_two_targeted_independent_source_reviews'
write('eighteen-original-primary-components.literal-checked.author.json',{'schemaVersion':1,'sourceComponents':[dict(c) for c in {c['recordId']:c for cs in full for c in cs}.values()],'literalWholePageMatches':True,'fakeOfficialNumbering':False,'candidateOnly':True})
source_by={s['id']:s for s in after['sourceGoals']}; proposed={g['id']:g for g in patched['goals']};deltas=[]
for i,gid in enumerate(ids):
 sid=next(sid for sid,goalid in selected.items() if goalid==gid);row=source_by[sid];old=copy.deepcopy(row)
 components=copy.deepcopy(full[i]);main=components[0];topic='Q2.2' if i in optional else 'Q2.1'
 role='authored-model-enrichment-not-named-or-required' if i in enrichment else 'optional-topic-bounded-operationalization' if i in optional else 'bounded-source-content-operationalization'
 duty=('Nicht amtlich benannte und nicht verpflichtende Zusatzmodellvertiefung; die allgemeine Sach-/Modellkompetenz macht dieses konkrete Modell nicht zur amtlichen Pflicht.' if i in enrichment else 'Optionales Themenfeld Q2.2 LK; keine allgemeine verpflichtende HE-Kompetenz.' if i in optional else 'Didaktische Konkretisierung des angegebenen tatsächlichen Inhalts; keine Behauptung eines wörtlichen oder vollständig eigenständigen amtlichen Kompetenzpunkts.')
 row.update({'passageId':'he-bio-sekii:evolution18-v2:'+sid,'topicCode':topic,'title':proposed[gid]['title'],'description':proposed[gid]['description'],'descriptionEn':proposed[gid].get('descriptionEn',''),'sourceText':proposed[gid]['description'],'sourceKind':'authoredModelSpecialisation' if i in enrichment else 'boundedPrimaryCompetencyComponent','authoredComponent':True,'isOfficialBullet':False,'officialNumberingClaim':False,'granularity':'declaredAuthoredModelSpecialisation' if i in enrichment else 'boundedOriginalCompetencyAspect','category':role,'stage':'SekII','sourceSpan':f"HE current physical/printed p{main['physicalPage']} lines{main['firstTextLine1Based']}-{main['lastTextLine1Based']}; {topic}; author-bounded component, no official numbering",'sourcePage':main['physicalPage']-1,'sourceLine':main['firstTextLine1Based']-1,'sourceRef':f"Hessen KC Biologie Ausgabe2024, Stand01.08.2025; {topic}; S.{','.join(str(c['physicalPage']) for c in components)}; {duty}",'rawSourceText':main['originalText'],'rawParentBulletText':main['originalText'],'parentBulletText':main['originalText'],'rawSourceSpan':f"HE actual physical p{main['physicalPage']} lines{main['firstTextLine1Based']}-{main['lastTextLine1Based']}",'sourceDocumentKey':'KC2024_BIOLOGIE_SEKII_STAND_20250801','actualOriginalRecordIds':[c['recordId'] for c in components],'actualPrimaryComponents':components,'wholeOriginalBulletCoverage':False,'wholeCurrentCanonicalCoverage':False,'wholeCandidateApproval':False})
 # Historical bulletIndex/aspectIndex were invented original numbering. They
 # are deliberately removed from these eighteen revised operative candidates.
 row.pop('bulletIndex',None);row.pop('aspectIndex',None)
 row['tags']=[t for t in old.get('tags',[]) if not t.startswith('topic:') and not t.startswith('phase:')]+['topic:'+topic,'phase:Q2']
 after['passages'].append({'id':row['passageId'],'topicCode':topic,'title':row['title'],'text':row['sourceText'],'rawText':main['originalText'],'sourceGoalIds':[sid],'sourceDocumentKey':row['sourceDocumentKey'],'sourceUrl':components[0]['primaryUrl'],'sourceRef':row['sourceRef'],'page':main['physicalPage']-1,'sourceKind':row['sourceKind'],'authoredComponent':True,'isOfficialBullet':False,'officialNumberingClaim':False})
 deltas.append({'ordinal':i+1,'canonicalGoalId':gid,'sourceGoalId':sid,'beforeWholeSourceRow':old,'afterWholeSourceRow':copy.deepcopy(row),'changedFields':[k for k in sorted(set(old)|set(row)) if old.get(k)!=row.get(k)],'literalPrimaryVerified':True,'authoredInterpretation':notes[i]['authorBoundaryAndRationale'],'officialNamedModel':False if i in enrichment else None,'concreteModelMandatory':False if i in enrichment else None,'sourceDuty':duty,'originalGK_LKLabelKeptAsCanonicalRouteScope':old['courseLevel'],'routeScopeMeaning':'Current authored canonical applicability route; not a claim the specific model or LK differentiation is named or compulsory in the official curriculum. Other jurisdictions are neither reviewed nor changed.'})
for s in after['sourceGoals']:
 if s['id'] not in selected:assert s==next(x for x in before['sourceGoals'] if x['id']==s['id'])
after['qualityReview']=copy.deepcopy(after.get('qualityReview',{}))
after['qualityReview']['evolution18AuthorSourceCandidate']={'reviewAuthority':'author_candidate','independentReviewStatus':'pending_two_targeted_source_reviews','affectedSourceGoalIds':list(selected),'sourceRowsKeptExact':126,'newStrictClosures':0,'humanApproval':False}
ename='DE_HE_BIOLOGIE_SEKII_KC2024.evolution18-operative-source-candidate-20261008-v2.source-extraction.json'
write(ename,after)
mapped=copy.deepcopy(m);mapped['reviewId']=m['reviewId']+'-evolution18-source-candidate-20261008-v2';mapped['sourceExtractionPath']=rel(OWN/ename);mapped['status']='author_candidate_pending_two_targeted_independent_source_reviews'
for d in mapped['decisions']:
 if d['sourceGoalId'] in selected:
  i=ids.index(selected[d['sourceGoalId']]);d.update({'matchType':'partial','reviewer':'codex-evolution18-source-v2-author-candidate-not-independent-reviewer','reviewedAt':now,'rationale':deltas[i]['sourceDuty']+' '+deltas[i]['authoredInterpretation']+' Author candidate only; final targeted independent source A/B reviews pending.','sourceKind':source_by[d['sourceGoalId']]['sourceKind'],'wholeOriginalSourceCoverage':False,'wholeCanonicalGoalApproval':False})
for edge in mapped['mappings']:
 if edge['legacyGoalId'] in selected:edge['matchType']='partial'
mapped['summary']=dict(mapped.get('summary',{}));mapped['summary']['evolution18CandidateActualCounts']={'sourceGoals':len(after['sourceGoals']),'authoritativeDecisionRows':len(mapped['decisions']),'selectedAuthorCandidatePartialDecisionRows':18,'unaffectedExactDecisionBodies':126,'independentNewSourceApprovals':0,'redundantLegacyEdgesKeptExceptSelectedMatchType':True}
mname='hessen_biology_upper_secondary.evolution18-operative-source-candidate-20261008-v2.review.json';write(mname,mapped)
write('targeted-eighteen-operative-source-before-after.author.json',{'schemaVersion':1,'recordedAt':now,'currentOperativeExtractionPath':ep,'currentOperativeMappingPath':mp,'wholeCanonicalBaselineSha256':sha(canonical),'currentCurricularAtomicDenominator':cfg['expectedCurricularAtomicGoalCount'],'unaffectedSourceRowsExact':126,'unaffectedSourceDecisionsExact':126,'selectedSourceRows':18,'boundedOperationalizations':15,'nonMandatoryUnnamedModelEnrichments':3,'optionalQ22MisuseGoalIds':[ids[5]],'deltas':deltas,'goalTextPatches':patch,'activeWrites':0,'newSourceReviewApprovals':0,'newStrictClosures':0,'humanApproval':False})
write('source-duty-and-applicability-boundaries.author.json',{'schemaVersion':1,'sourceDutyVsApplicability':'SourceAtlas consumes explicit source metadata as applicability witnesses, not compulsory-duty certification. Current target visibility for optional NS and three unnamed models is deliberately retained; no model becomes official mandatory content, no semanticKind or denominator is changed.','modelEnrichmentGoalIds':[ids[i] for i in sorted(enrichment)],'officialCompulsoryBasis':compulsory,'sourceKindConventionReferences':['curricula/DE/Gymnasium/input/HE/source-components/DE_HE_BIOLOGIE_NEURO8_HE-LK.author-v2.source-extraction.json','curricula/DE/Gymnasium/input/HE/source-components/DE_HE_BIOLOGIE_NEURO8_HE-GK-LK.author-v2.source-extraction.json'],'closedProjectionSchemaBoundary':'Publication sourceText is explicitly source-aligned authored wording, not verbatim original. Original literal text is in rawSourceText, parentBulletText and bound actualPrimaryComponents; mapped partial is the permitted existing edge enum.','allCountryOriginalDutyApproval':False,'BavariaDutyApproval':False,'humanApproval':False,'sourceRowsStrictlyAccepted':0})
# Native Atlas API emits strings only; output paths remain the existing book-local
# paths and the checker writes returned strings only inside this owned packet.
bcfg=copy.deepcopy(cfg);bcfg['landscapePath']=inputs[canonical];bcfg['semanticKindLedgerPath']=inputs[kinds];bcfg['durationModelPolicyPath']=inputs[cfg['durationModelPolicyPath']];bcfg['mappingPaths']=[inputs[p] for p in cfg['mappingPaths']]
# Snapshot mappings refer to their immutable matching extraction snapshots.
for p in cfg['mappingPaths']:
 s=read(inputs[p]);s['sourceExtractionPath']=inputs[read(p)['sourceExtractionPath']]
 write('native-input-mappings/'+Path(p).name,s)
bcfg['mappingPaths']=[rel(OWN/'native-input-mappings'/Path(p).name) for p in cfg['mappingPaths']]
acfg=copy.deepcopy(bcfg);acfg['mappingPaths']=[rel(OWN/mname) if p.endswith(Path(mp).name) else p for p in bcfg['mappingPaths']]
write('atlas.before-source-change.native-config.actual.json',bcfg);write('atlas.after-source-change.native-config.actual.json',acfg)
write('declared-current-whole-input-snapshots.actual.json',inputs)
write('neutral-operative-eighteen-source-review.entry.json',{'schemaVersion':1,'role':'Source v2 AUTHOR candidate; independent reviewers must make their own source-only verdicts','scopeGoalIds':ids,'sourceExtractionCandidatePath':rel(OWN/ename),'mappingReviewCandidatePath':rel(OWN/mname),'sourceDeltaPath':rel(OWN/'targeted-eighteen-operative-source-before-after.author.json'),'whole36ScienceCasesPath':inputs[rel(V1/'eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.json')],'priorActualIndependentATwoWordPatchAndAMPPath':inputs[rel(A/'A-M-P.targeted-two-goal-binding-review.actual.json')],'wholeScienceCaseReReviewRequired':False,'newSourceOnlyReviewRequired':True,'candidateOnly':True,'sourceApproved':False,'activeWrites':False,'strictNewClosureCount':0,'humanApproval':False})
print(json.dumps({'sourceRows':144,'selectedChanges':18,'unaffectedRowsExact':126,'sourceDocuments':len(e['sourceDocuments']),'atlasMappingPaths':len(cfg['mappingPaths']),'currentDenominator':cfg['expectedCurricularAtomicGoalCount'],'activeWrites':0}))
