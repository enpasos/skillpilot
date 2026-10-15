# SPDX-License-Identifier: Apache-2.0
"""One authorized a338 altText metadata correction; prepare final native inputs."""
import copy,hashlib,json,os,shutil
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix();SEAL='FILES.finite-alt-author-native-preparation.seal.json'
assert not (OWN/SEAL).exists()
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
OLD=E+'chemie-energy20-four-corrections-current422-native-successor-preparation-technical-20261015-v1'
V=E+'chemie-energy-two-clarified-description-image-contexts-current422-fresh-independent-V-20261015-v1'
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):assert bind(r['path'])==r,r['path']
def write(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def exact_copy(r,d):verify(r);shutil.copyfile(ROOT/r['path'],OWN/d);return bind(REL+'/'+d)
assert os.statvfs(ROOT).f_bavail*os.statvfs(ROOT).f_frsize>100*1024*1024,'Report low disk to root'
vs=bind(V+'/FILES.FIRST-two-current-context-V2-science.seal.json');assert vs['sha256']=='sha256:b9e3fdabc6a0998d11e377b8e34b01924a307bf57c596ebdd28fff5413f869d7'
findingPath=V+'/FINDING.a338-current-altText-and-recommended-whole-after.json';finding=read(findingPath);assert bind(findingPath)['sha256']=='sha256:8ac83b765cba98208d77faeae89faa22b4eb8ce221d1b49dcacaff6a5f52efd6'
old=read(OLD+'/INPUTS.final-corrected-native20.physical-selector.json');material=read(OLD+'/INPUTS.exact-sealed-four-corrections-native20.json');ids=old['scopeGoalIds'];before=read(old['wholeCanonical560']['path']);after=copy.deepcopy(before);G={g['id']:g for g in after['goals']};B={g['id']:g for g in before['goals']};gid=finding['goalId'];g=G[gid]
primary=next(r for r in g['resourceLinks'] if r.get('role')=='primary');assert primary==finding['wholeCurrentResourceLink'];primary['altText']=finding['recommendedWholeAfterResourceLink']['altText'];assert primary==finding['recommendedWholeAfterResourceLink']
assert [x['id'] for x in after['goals'] if x!=B[x['id']]]==[gid]
assert {k:v for k,v in after.items() if k!='goals'}=={k:v for k,v in before.items() if k!='goals'}
assert all({k:v for k,v in x.items() if k!='resourceLinks'}=={k:v for k,v in B[x['id']].items() if k!='resourceLinks'} for x in after['goals'])
write('candidate/canonical560.current422.only-a338-altText.corrected.json',after)
sem=exact_copy(old['semantic560'],'candidate/semantic560.exact-no-change.json')
cases=exact_copy(material['wholeCases42'],'materials/forty-two-whole-DE-EN-cases.exact-no-change.json')
write('candidate/twenty-whole-current560-goals.exact.json',{'goalIds':ids,'goals':[G[i] for i in ids]})
write('CAS.one-whole-a338-goal-only-altText.json',{'role':'Authorized metadata author correction after actual independent V-FIRST; no author V vote','originalVFinding':bind(findingPath),'originalVFirstSeal':vs,'beforeCanonical':old['wholeCanonical560'],'afterCanonical':bind(REL+'/candidate/canonical560.current422.only-a338-altText.corrected.json'),'goalId':gid,'wholeBefore':B[gid],'wholeAfter':g,'onlyChangedField':'resourceLinks[primary].altText','other559WholeGoalsExact':True,'allDescriptionsRequiresContainsAndImageUrlsExact':True,'allImageBytesUnchanged':True,'newVotes':0})
promptPath='curricula/DE/Gymnasium/visualizations/chemie/'+gid+'/prompt.de.md';prompt=bind(promptPath)
historical=exact_copy(prompt,'provenance/a338.prompt.de.historical.exact.md')
now=datetime.now(timezone.utc).isoformat();image=next(r['physicalRepositorySource'] for r in read(old['physicalRebuildMap']['path'])['selectedCurrentAssetRows'] if r['goalId']==gid)
(OWN/'provenance/a338.current-context-addendum.2026-10-15.md').write_text('''# Aktuelle Kontextnotiz zur unveränderten Nernst-Abbildung

Datum (UTC): '''+now+'''

Diese heutige Autoren-/Kontextnotiz ist kein Generierungsauftrag, keine neue Bildgenerierung und keine unabhängige V-Freigabe. Das historische `prompt.de.md` mit seinem früheren Zieltext bleibt bytegenau erhalten. Original: `'''+promptPath+'''`, '''+prompt['sha256']+'''. Die lokale historische Kopie ist ebenfalls bytegleich.

Aktueller Zieltext: Die lernende Person kann reversible Zellspannungen von Brennstoffzellen unter vorgegebenen Temperatur- und Aktivitätsbedingungen mit der Nernst-Gleichung berechnen.

Die Formel beschreibt die reversible Zellspannung für die angegebenen Temperatur- und Aktivitätsbedingungen. Die eingezeichnete Lampe stellt die Nutzung elektrischer Energie dar. Die Lastspannung und Lastverluste sind mit dieser Nernst-Gleichung allein nicht berechnet; dafür wären zusätzliche Daten bzw. Aktivierungs-, ohmsche und Stofftransportmodelle erforderlich. Die vollständigen vorhandenen Fälle12a/b unterscheiden diese Größen bereits. Die jetzt präzisierte alternative Bildbeschreibung übernimmt genau die im versiegelten unabhängigen V-FIRST belegte Metadatakorrektur.

Unveränderte Bildquelle: `'''+image['path']+'''`, '''+image['sha256']+'''. Provider/Generatorprovenienz bleibt die historische Google-Gemini-/Nano-Banana-Pro-Angabe. Weder das Bild noch seine ursprüngliche Entstehung werden nachträglich als neuer Versuch beschrieben. Historische Human-/AI-Felder bleiben getrennt. Eine technische Korrektur dieses Alttexts erzeugt keinen eigenen neuen V-Vote; die tatsächliche unabhängige Prüfung/Bindung des finalen Kontextes bleibt Aufgabe des beauftragten V-Reviewers.
''')
mapping=read(old['physicalRebuildMap']['path']);assert len(mapping['selectedCurrentAssetRows'])==434 and len(mapping['stockPhysicalModules'])==31
mapping['sourcePhysicalMap']=old['physicalRebuildMap'];mapping['role']='Final Native20-v3 author-alt metadata successor only, original434 assets/31 modules preserved'
mapping['executionHost']='tmp/chemie-m7-resumed-20261015/energy20-nernst-alt-current422-native560-final-host-v1';mapping['buildReceiptPath']='checks/REBUILD.actual-final-native-host.json'
overrides={'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json':bind(REL+'/candidate/canonical560.current422.only-a338-altText.corrected.json'),'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json':sem};aliasCAS=[]
for r in mapping['aliases']:
 if r['normalHostAlias'] in overrides:
  b=copy.deepcopy(r);r['physicalRepositorySource']=overrides[r['normalHostAlias']];aliasCAS.append({'wholeBefore':b,'wholeAfter':copy.deepcopy(r)})
write('checks/REBUILD.final-native560-alt-only.physical-map.json',mapping)
write('CAS.normal-alias-address-only.json',{'role':'Physical address transport only, all non-a338-alt canonical fields exact','changes':aliasCAS,'all434ImageRowsAnd31ModulesExact':True,'QA438Unchanged':True,'newVotes':0})
base=read(OLD+'/config/whole422.normal-stock-base.config.json');base.update({'bookId':'chemie-energy20-nernst-alt-current422-full560-20261015-v1','title':'Chemie – finaler Energie20-Kontext mit korrigiertem Nernst-Alttext','evidenceReviewPaths':[REL+'/candidate/twenty-author-E0G0.only-Nernst-input-binding.jsonl'],'outputPath':REL+'/candidate/full422.in-memory-only.not-materialized.json'});write('config/whole422.normal-stock-base.config.json',base)
batch=read(OLD+'/config/native20.normal-prepare-only.config.json');batch.update({'batchId':'chemie-energy20-nernst-alt-current422-native560-final-20261015-v1','bookId':'chemie-energy20-nernst-alt-current422-native560-final-20261015-v1','title':'Chemie – Energie und Waschmittel: finale zwanzig Lernziele','baseGoalBookConfigPath':REL+'/config/whole422.normal-stock-base.config.json','outputDirectory':REL+'/native-twenty'});write('config/native20.normal-prepare-only.config.json',batch)
for name in ['rebuild_new_native_sparse_host.py','run_native_stock.py']:
 text=(ROOT/OLD/'scripts'/name).read_text().replace('FILES.finite-native-successor.seal.json',SEAL).replace('checks/REBUILD.current422-native560-four-corrections.physical-map.json','checks/REBUILD.final-native560-alt-only.physical-map.json');(OWN/'scripts'/name).write_text(text)
write('INPUTS.exact-final-native20-alt-only.json',{'schemaVersion':1,'role':'Informed one-altText author correction plus technical native preparation; no new scientific approvals','scopeGoalIds':ids,'beforeCanonical560':old['wholeCanonical560'],'wholeCanonical560':bind(REL+'/candidate/canonical560.current422.only-a338-altText.corrected.json'),'beforeSemantic560':old['semantic560'],'semantic560':sem,'QA438':old['QA438HistoricalExact'],'beforeProfiles20':material['rawProfiles20E0G0'],'sourceWhole42Cases':material['wholeCases42'],'whole42Cases':cases,'sourceClosure':material['completeSourceAndPartnerClosure'],'blankOwnRecords':material['blankOwnRecords'],'originalVFirstSeal':vs,'originalVFinding':bind(findingPath),'originalVFirstWholeTwo':bind(V+'/FIRST.original-two-current-context-V2.json'),'historicalOriginalPrompt':prompt,'historicalPromptCopy':historical,'currentContextAddendum':bind(REL+'/provenance/a338.current-context-addendum.2026-10-15.md'),'originalNativeV2Neutral':bind(OLD+'/NEUTRAL.final-four-corrections-native20-successor.json'),'originalNativeV2Seal':bind(OLD+'/FILES.finite-native-successor.seal.json'),'originalV2InputSelector':bind(OLD+'/INPUTS.final-corrected-native20.physical-selector.json'),'originalHoldsPlusM6':material['originalHoldsPlusM6'],'oldPhysicalMap':old['physicalRebuildMap'],'originalAuthorSelector':material['sealedAuthorSelector'],'originalAuthorSeal':material['sealedAuthorSeal'],'independentPrimaryOrDPeerReadClaimed':False,'newD':0,'newP':0,'newA':0,'newM':0,'newV':0,'centralExecuted':False,'activeIntegration':False})
print(json.dumps({'wholeGoals':560,'onlyAltTextChanged':1,'otherWholeGoalsExact':559,'wholeCasesExact':42,'semanticExact':True,'historicalPromptExact':True,'modules':31,'images':434,'newVotes':0}))
