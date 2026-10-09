# SPDX-License-Identifier: Apache-2.0
"""Correct the insufficient historical tag argument; keep all actual source/goal edges."""
from pathlib import Path
import copy, hashlib, json
R=Path.cwd();D=Path(__file__).resolve().parent;P=D.relative_to(R).as_posix();B=D.parent/'biologie-82ac-nine-lower-jurisdictions-and-SN-ST-digital-prerequisite-source-author-v1'
def read(f):return json.loads(f.read_text())
def bind(f):
 b=f.read_bytes();return {'path':f.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(n,x):
 f=D/n;assert not f.exists(),f;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(x if isinstance(x,bytes) else (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode());return f
def diff(a,b,p=''):
 if a==b:return []
 if isinstance(a,dict) and isinstance(b,dict):return [r for k in sorted(a.keys()|b.keys()) for r in (diff(a[k],b[k],p+'/'+k) if k in a and k in b else [{'pointer':p+'/'+k,'before':a.get(k),'after':b.get(k)}])]
 return [{'pointer':p,'before':a,'after':b}]
old='Inaktiver gezielter Autoren-Nachfolger: 82ac ist ausdrücklich ein Sek-II-Ziel und wird aus dieser Sek-I-Target-Zuordnung entfernt. Ganze ursprüngliche Quellpflicht und alle übrigen Rollen bleiben erhalten; 26aa sowie konkrete praktische Methodenoperationen bleiben eigenständig zu prüfen. Keine gesamte Quellen- oder Kursfreigabe.'
rows=[];cfg=read(B/'candidate/whole394-final-normal-source-atlas.inactive.config.json')
for s in ['SN','ST']:
 before=read(B/f'candidate/mappings/{s}-whole-reviewed-Source7-operative-path.inactive.review.json');after=copy.deepcopy(before)
 first=put(f'input/{s}-whole-frozen-source7-mapping-before.exact.json',(B/f'candidate/mappings/{s}-whole-reviewed-Source7-operative-path.inactive.review.json').read_bytes())
 reason=('SN: Der allgemeine Kompetenzpunkt verlangt tatsächlich Hypothesen und Lösungsstrategien; die konkreten Klassenmethoden nennen u. a. angeleitete Mikroskopie, Beobachten/Protokollieren sowie digitale Temperatur-/Lichtaufnahme. Die begrenzten Klauseln tragen konkrete praktische Methoden- und Datenoperatoren, belegen aber nicht automatisch das gesamte82ac-Standardtarget mit eigener Planung, Durchführung und Protokollierung sämtlicher vier Methodenfamilien samt Variablengefüge/-kontrolle. Primärbereich: physische S.13-15,21,27,30-31.' if s=='SN' else 'ST: Die allgemeinen Methodenkompetenzen verlangen tatsächlich Hypothesen und Untersuchungsverfahren; konkrete7/8- und9-Methoden umfassen angeleitete Untersuchungen, Beobachten/Protokollieren und digitale Auswertung. SJ10 fordert bestimmte Naturobjekt-, Modell- und Simulationshandlungen; dies ist ausdrücklich Einführungsphase. Aus diesen begrenzten Klauseln folgt nicht automatisch das gesamte autonome82ac-Standardtarget für Planung, Durchführung und Protokollierung sämtlicher vier Methodenfamilien samt Variablengefüge/-kontrolle. Primärbereich: physische S.4-8,34,39-40,42,44-45.')
 new='Additiver tatsächlicher Primäroperator-Nachfolger: '+reason+' Die Entscheidung beruht auf dieser vollständigen Operator- und Autonomiegrenze, nicht auf dem SekII-Tag oder der BY-Provenanz des kanonischen Ziels. Hypothesen-/Kontrollkompetenzen können auch in SekI gefordert sein; die neun anderen Länderrollen bleiben hier unverändert und begrenzt unabhängig prüfbar. Ganze ursprüngliche Quellpflichten und Partner sind im exakten35/30-Rahmen erhalten.26aa und328fd bleiben tatsächliche praktische bzw. digitale Beiträge; keine Textauswertung als bereits ausgeführte Mikroskopie/Versuch/Software behauptet. Keine gesamte Quellen-, Kurs- oder Stufenfreigabe.'
 changed=[]
 for i,d in enumerate(after['decisions']):
  if old in d.get('rationale',''):d['rationale']=d['rationale'].replace(old,new);changed.append(i)
 assert changed==([0] if s=='SN' else [0,10])
 after['note']='Additiver Primäroperator-Rationalenachfolger. Die frühere alleinige SekII-Tagbegründung ist unzureichend und bleibt unverändert als Geschichte erhalten. Beschränkte tatsächliche SN/ST-Operator- und Autonomiebelege bestimmen die82ac-Targetentfernung; sämtliche SourceGoalIDs, Entscheidungen/Rollen, Kanten und Originalpflichtpartner bleiben exakt. Neun weitere Landesrollen erhalten. Keine pauschale Stufen- oder Programmfreigabe.'
 final=put(f'candidate/{s}-whole-reviewed-source7-primary-operator-rationale-only.inactive.review.json',after)
 for name in ['mappings','sourceExtractionPath','sourceLandscapeId','targetLandscapeId']:assert after[name]==before[name]
 for a,b in zip(before['decisions'],after['decisions']):assert {k:v for k,v in a.items() if k!='rationale'}=={k:v for k,v in b.items() if k!='rationale'}
 prior=(B.parent/'biologie-source7-SN-ST-SekI-82ac-stage-route-author-successor-v1/candidate/mappings'/f'{s}-whole-lower-source7.without82ac-SekI-target.review.json').relative_to(R).as_posix()
 assert prior in cfg['mappingPaths'];cfg['mappingPaths']=[final.relative_to(R).as_posix() if p==prior else p for p in cfg['mappingPaths']]
 e=read(R/after['sourceExtractionPath']);key=e.get('sourceDocumentKey',after.get('sourceDocumentKey'));doc=e['sourceDocument'];original=read(B/f'inputs/{s}-whole-narrow-proposed.extraction.exact.json')['sourceDocument']['path']
 snap=next(x for x in cfg['sourceDocumentSnapshots'] if x['path']==original);assert snap['sha256']==bind(R/doc['path'])['sha256'];snap['path']=doc['path']
 rows.append({'state':s,'wholeBefore':bind(first),'wholeAfter':bind(final),'actualValueDiff':diff(before,after),'wholeMappingsExact':True,'wholeAllNonRationaleDecisionFieldsExact':True,'allOriginalSourceGoalIdsAndRolesExact':True,'candidateWholeSourceExtractionRetained':bind(R/after['sourceExtractionPath']),'actualPrimaryScopeRationale':reason})
put('candidate/normal-source-atlas-primary-operator-rationale-only-v2.inactive.inputs.json',cfg)
oldManifest=read(B/'candidate/ordinary-QS-additive-reviewed-Source7-and-current-views.inactive-binding-manifest.json');manifest=copy.deepcopy(oldManifest)
for row in manifest['ordinaryOperativePathSuccessors']:
 row['wholeExactReviewedSource7Candidate']=bind(D/f'candidate/{row["state"]}-whole-reviewed-source7-primary-operator-rationale-only.inactive.review.json')
manifest['normalSourceAtlasConfig']=bind(D/'candidate/normal-source-atlas-primary-operator-rationale-only-v2.inactive.inputs.json')
put('candidate/ordinary-QS-additive-current-paths-primary-rationale-only-v2.inactive-binding-manifest.json',manifest)
put('exact-five-rationale-note-field-diffs-and-primary-scope.actual.json',{'schemaVersion':1,'wholeCandidateRows':rows,'actualRationaleFieldsChanged':3,'actualNoteFieldsChanged':2,'wholeSource7ScientificPartnerSemanticsUnchanged':True,'whole479And394GoalsNativeModelBindingsRemainFrozen':True,'currentSNSTOnly82acEntryRemovalPreserved':True,'whole2ae2AndFfefRetained':True,'oldTagArgumentIsNotAStageProof':True,'noStageInferredFromTag':True,'strictGain':0,'activeWrites':0})
put('author.actual-primary-operator-input-FIRST.json',{'schemaVersion':1,'role':'author additive rationale correction, not independent approval','wholeBaseEntry':bind(B/'neutral-whole-current-source-routes-82ac328fd-two-native.author-successor.independent-review.entry.json'),'wholeBaseSeal':bind(B/'author.final.freeze.json'),'actualPrimaryGrounds':[{'state':x['state'],'rationale':x['actualPrimaryScopeRationale']} for x in rows],'requiresRelationAndNativeTwoModelFPsUnchanged':True,'scienceReviewerOwnFIRSTRequired':True,'strictGain':0})
print(json.dumps({'wholeMappings':2,'actualRationaleFields':3,'actualNoteFields':2,'newEdges':0,'nativeOrPInputChanges':0,'oldSealsUnchanged':True,'strictGain':0,'activeWrites':0}))
