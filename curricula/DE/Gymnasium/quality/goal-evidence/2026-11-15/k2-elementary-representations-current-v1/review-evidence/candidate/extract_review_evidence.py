#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1]
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def dump(n,o):(OUT/n).write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
payload=json.loads((OUT/'candidate-payload.json').read_text());target_ids={e['goalId'] for e in payload['ordinaryGoalEdits']};ids=target_ids|{x['id'] for x in payload['newAssessments']}
config=json.loads((ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json').read_text());math=next(x for x in config['subjects'] if x['subject']=='mathematik')
profiles=[]
for p in math['positiveEvidenceConfigPaths']:
 c=json.loads((ROOT/p).read_text())
 for line in (ROOT/c['reviewPath']).read_text().splitlines():
  if not line.strip():continue
  r=json.loads(line)
  if r['goalId'] in target_ids:profiles.append({'configPath':p,'configSha256':digest(ROOT/p),'reviewPath':c['reviewPath'],'reviewSha256':digest(ROOT/c['reviewPath']),'record':r})
assert len(profiles)==4
dump('current-four-positive-profiles.actual.json',profiles)
mappings=[]
for state in ['DE-HE','DE-BW','DE-SH']:
 for p in sorted((ROOT/'curricula/DE/Gymnasium/mapping'/state/'lower-secondary').glob('*.json')):
  d=json.loads(p.read_text());relevant=[(j,m) for j,m in enumerate(d.get('mappings',[])) if m.get('canonicalGoalId') in target_ids]
  if not relevant:continue
  extraction_path=d.get('sourceExtractionPath');extraction=json.loads((ROOT/extraction_path).read_text()) if extraction_path else None
  source_goals={g['id']:g for g in extraction.get('sourceGoals',[])} if extraction else {}
  rows=[]
  for j,m in relevant:
   g=source_goals.get(m.get('legacyGoalId'))
   rows.append({'jsonPointer':'/mappings/'+str(j),'mapping':m,'sourceGoalWitness':{'id':g['id'],'title':g['title'],'sourceRef':g.get('sourceRef'),'topicCode':g.get('topicCode'),'recordSha256':'sha256:'+hashlib.sha256(json.dumps(g,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()} if g else None})
  mappings.append({'mappingPath':str(p.relative_to(ROOT)),'mappingSha256':digest(p),'sourceExtractionPath':extraction_path,'sourceExtractionSha256':digest(ROOT/extraction_path) if extraction_path else None,'sourceDocument':extraction.get('sourceDocument') if extraction else None,'sourceDocuments':extraction.get('sourceDocuments') if extraction else None,'rows':rows})
dump('source-witnesses.actual.json',{'status':'existing source witnesses, not new official edge claims or new nationwide year assignments','claimBoundary':'Four new prerequisites are didactic model decisions. Three new tasks and all figures are original SkillPilot material. Applicability is inherited from each unchanged existing ordinary target; no mapping or retained input is changed. J6 folder is a technical canonical Sek-I placement, not a universal official year-6 claim. Existing partial mappings remain partial.','witnesses':mappings,'primaryDidacticSources':[{'url':'https://bildungsserver.berlin-brandenburg.de/fileadmin/bbb/rlp-online/Teil_C/Mathematik/Materialien/Ma_MzDuF_L5__Daten_und_Zufall_Gesamt_2023-05.pdf','localPdf':'tmp/math-diagram-route-20261115/elementary-followup/independent-draft-review/primary-sources/lisum-daten-und-zufall-2023.pdf','sha256':digest(ROOT/'tmp/math-diagram-route-20261115/elementary-followup/independent-draft-review/primary-sources/lisum-daten-und-zufall-2023.pdf'),'webVerifiedDate':'2026-11-15','pagesZeroBased':[8,16,45,48,55,56,57],'summary':'The concept distinguishes data representation and reading/evaluating representations, with qualitative/quantitative scales. Separate tasks organize tabular data and read displays. This informs separate target demands; it does not prescribe SkillPilot edges.'},{'url':'https://www.iqb.hu-berlin.de/media/exercise_files/Lernaufgaben_Mathematik_Primar/Darstellung_Aufgabe.pdf','localPdf':'tmp/math-diagram-route-20261115/elementary-followup/independent-draft-review/primary-sources/iqb-darstellung-aufgabe.pdf','sha256':digest(ROOT/'tmp/math-diagram-route-20261115/elementary-followup/independent-draft-review/primary-sources/iqb-darstellung-aufgabe.pdf'),'webVerifiedDate':'2026-11-15','pagesZeroBased':[0,1,2,3],'summary':'The illustrative primary task separates reading displays from critical reflection on scales and their effects. It supports assessing the actual performance and rejects a year/demand label as sufficient evidence of a prerequisite. No copying of its tasks or figures.'}]})
# Pin original retained evidence for a later integration diff check; never modify it.
paths=[ROOT/x['sourceExtractionPath'] for x in mappings if x['sourceExtractionPath']]
paths += [ROOT/'curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json']
dump('retained-evidence-pins.actual.json',{str(p.relative_to(ROOT)):digest(p) for p in sorted(set(paths))})
print(json.dumps({'currentCompletePProfiles':len(profiles),'sourceMappingFiles':len(mappings),'retainedInputPins':len(set(paths))},indent=2))
