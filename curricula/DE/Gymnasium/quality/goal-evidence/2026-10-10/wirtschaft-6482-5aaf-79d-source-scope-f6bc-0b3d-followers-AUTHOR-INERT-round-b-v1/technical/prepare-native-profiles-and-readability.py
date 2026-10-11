from pathlib import Path
import json,re,datetime,hashlib
O=Path(__file__).resolve().parents[1];R=O.parents[6];H=O/'history';C=O/'candidates'
def save(n,x):(O/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
# Correct actual NI source URL from the same already-bound owned original source manifest, not an assumed endpoint.
manifest=json.loads((R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-dd38-543b-source-course-f08-036ea-followers-AUTHOR-INERT-round-b-v1/source-notes/selected-original-source-inputs.actual.json').read_text());ni=next(x for x in manifest['mappingSourceSets'] if x['jurisdiction']=='DE-NI' and x['stage']=='SekII');p=O/'source-notes/actual-bounded-primary-readings-and-norm-scope.json';d=json.loads(p.read_text())
for row in d['actualLocalPrimaryReads']:
 if row.get('primaryRepositoryPath')==ni['primaryRepositoryPath']:row['url']=ni['primaryUrl']
save('source-notes/actual-bounded-primary-readings-and-norm-scope.json',d)
# Only newly authored M6/6 strings; original M1–5/1–5 bytes are protected.
subs={'Article4does':'Article 4 does','separate2024/1263Articles16/17':'separate 2024/1263 Articles 16/17','Nmay':'N may','Ksupplies':'K supplies','now,':'now, ','later debt':'later debt','Bel’s.1grant':'Bel’s .1 grant','completecoreabsence':'complete core absence','Originalchannels':'Original channels','Addedinterests':'Added interests','bothtranchecalculations':'both tranche calculations','noautomatic':'no automatic','conditionalreform':'conditional reform','Original channels2':'Original channels 2','budget/procedure/proportionality2':'budget/procedure/proportionality 2','beneficiaries/no automatic sanction2':'beneficiaries/no automatic sanction 2','interests/enforcement2':'interests/enforcement 2','common monetary policy/different bank-shock channels2':'common monetary policy/different bank-shock channels 2','marksg':'marks g','original36':'original 36','added8':'added 8','at26':'at 26','caps26':'caps 26','Original36':'Original 36','8added':'8 added','no added':'no added','entirely':'entirely'}
def fmt(t):
 for a,b in subs.items():t=t.replace(a,b)
 t=re.sub(r'(?<=[a-z])(?=\d)',' ',t);t=re.sub(r'(?<=\d)(?=[A-Za-z])',' ',t)
 t=re.sub(r'(?<=[,;])(?=[A-Za-z])',' ',t);t=re.sub(r'(?<=[,;])(?=\d)',' ',t)
 t=re.sub(r'(\d), (\d)',r'\1,\2',t)
 t=re.sub(r' {2,}',' ',t)
 return t
p=C/'0b3d.whole-practice.candidate.INERT.json';q=json.loads(p.read_text())
for k in ['taskContentEn','solutionContentEn']:
 marker='**M6 –' if k=='taskContentEn' else '6. Preserve'
 i=q['examData'][k].index(marker);q['examData'][k]=q['examData'][k][:i]+fmt(q['examData'][k][i:])
q['examData']['scoring']['steps'][-1]['description']='Alte Risikokanäle 2 / Budget, Verfahren, Verhältnismäßigkeit 2 / Begünstigte, kein Automatismus 2; ergänzte Interessen und Vollzug 2 / Tranchen 2 / EMU-, Banken- und Schockkanäle 2 / bedingtes Reformurteil mit Gegenposition 2.'
q['examData']['scoring']['steps'][-1]['descriptionEn']='Original channels 2 / budget, procedure and proportionality 2 / beneficiaries, no automatic sanction 2; added interests and enforcement 2 / tranches 2 / EMU, bank and shock channels 2 / conditional reform judgement with counterposition 2.'
save('candidates/0b3d.whole-practice.candidate.INERT.json',q);f=json.loads((C/'f6bc.whole-practice.candidate.INERT.json').read_text());save('candidates/two-whole-practices.INERT.json',[f,q]);land=json.loads((C/'landscape.author-only.INERT.json').read_text());land['goals']=[q if g['id']==q['id'] else g for g in land['goals']];save('candidates/landscape.author-only.INERT.json',land)
# Carry own previously sealed profiles, including the actual budget grammar addendum.
EU=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-6482-integration-risks-AUTHOR-INERT-round-b-v1';records=json.loads((EU/'candidates/positive-profiles.native-bound.INERT.json').read_text());law=json.loads((H/'sealed-addendum-positive.native-bound.INERT.jsonl').read_text());records=[law if r['goalId']==law['goalId'] else r for r in records]
save('history/three-sealed-own-profile-substantive-inputs.exact.json',records)
for rec in records:
 rec['reviewId']='eu-source-followers-own-author-v1-'+rec['goalId'];rec['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z');rec['reviewer']='OpenAI GPT-6 / Codex; own INERT technical scope rebinding, no independent content review';rec['reason']='Whole own sealed substantive P-v2 profile carried exactly, including the actual bounded budget grammar addendum; native binding to explicit authored scope proposals and existing whole semantic prose. E1/G1 AI author only. No unaffected nine historical P/685 cases rerated, no source/M6/M7/human or learner approval.';rec['reviewRunIds']=[]
save('candidates/positive-profiles.unbound-author-drafts.json',records)
sem=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-one-current-682-pure-Q1-terminal-native-technical-independent-a-INERT-v22/semantic679.only-Q1-parent-FP-and-independent-practice-terminal.activation-ready-INERT.json';ledger=json.loads(sem.read_text());selected={r['goalId']:r for r in ledger['decisions'] if r['goalId'] in ['648224f4-cc8f-5f41-9cae-6d783cd1ae77','79d244e0-049e-59e9-a2fb-b8f8670b315a']};save('history/selected-current-semantic-inputs.actual.json',{'path':str(sem.relative_to(R)),'digest':'sha256:'+hashlib.sha256(sem.read_bytes()).hexdigest(),'selectedCurrentKinds':selected,'candidateEffectiveKinds':{r['goalId']:'curricularAtomic' for r in records},'changedCandidateAuthority':'Own INERT semantic/scope author proposal; independent A open; no global retaxonomy'})
(O/'author-criteria.txt').write_text('Own targeted INERT EU scope/Practice author carry and native rebinding. Preserve entire original breadth and original Practice target-country sets through explicit authored existing didactic extensions, with target and prerequisiteOnly roles explicitly different from primary curricular mandate. Rule-of-law source2020/2092Articles4–6; bounded fiscal source2024/1263Articles11/13/16/17; invented tranche-only refinancing/interest/bank risk and conditional EMU reform judgements. Preserve exact M1–M5 and old24/36 performance marks; no new canonical facets, no new task/case quota. Whole sealed three P payloads stay exact. No unaffected nine historical P or685cases rerated. Local schema/fingerprints establish technical binding only; whole source/course/A/M/cards/routes/Practice/P/D/V/human/learner gates remain open. E1/G1 AI candidates, needs_human_review.\n')
print('Only own3 sealed profiles carried; norm/source URL corrected; newM6 readability saved, original M1–5 protected.')
