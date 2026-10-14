# SPDX-License-Identifier: Apache-2.0
"""Add a #69-only correction after reading the exact final v3 peer receipt."""
import copy
import datetime
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path('tmp/cross-subject-requires')
OLD = 'physics-pending5-revision-author-20261013-v3'
NAME = 'physics-clausius-revision-author-20261013-v4'
GID = 'e713dc34-beeb-5807-8a90-f872e049aa4e'
AGENT = '/root/physics_pending5_revision'
read = lambda p: json.loads(Path(p).read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(Path(p).read_bytes()).hexdigest()
fp = lambda o: 'sha256:' + hashlib.sha256(json.dumps(o, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
write = lambda p, o: Path(p).open('x').write(json.dumps(o, ensure_ascii=True, indent=2) + '\n')
oldpath = lambda s: ROOT / (OLD + '.' + s)
newpath = lambda s: ROOT / (NAME + '.' + s)
review_path = Path(sys.argv[1])
review = read(review_path)
reviewed = next(r for r in review['decisions'] if r['dependentGoalId'] == GID)
assert reviewed['decision'] in ['pending', 'rejected'], 'Do not anticipate or misrepresent a reviewer verdict.'
old_manifest = read(oldpath('manifest.json'))
for a in old_manifest['artifacts']:
    assert sha(a['path']) == a['sha256'], a['path']
old_context = read(oldpath('context.exact.json'))
record = copy.deepcopy(next(r for r in old_context['records'] if r['goalId'] == GID))
old_packet = read(oldpath('proposal-candidate.json'))
old_decision = copy.deepcopy(next(r for r in read(oldpath('author-decisions.json'))['decisions'] if r['dependentGoalId'] == GID))
old_bound = next(r for r in old_packet['decisions'] if r['dependentGoalId'] == GID)
amendment = copy.deepcopy(next(a for a in read(oldpath('profile-amendments.candidate.json'))['amendments'] if a['goalId'] == GID))
old_v3_profile = copy.deepcopy(amendment['proposedProfile'])
profile = copy.deepcopy(old_v3_profile)
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
math_de = (
    'Allgemeine mathematische Hilfen: Bei dY=h(x)dx mit stetigem h ergibt die vorzeichenbehaftete Akkumulation ΔY=∫_a^b h(x)dx. '
    'Für einen stetigen Integranden f und eine differenzierbare Funktion F mit F′(x)=f(x) auf dem ganzen Integrationsintervall gilt ∫_a^b f(x)dx=F(b)−F(a). '
    'Speziell für a,b,x₀>0 und einen von x unabhängigen reellen Faktor c gilt F_c(x)=c ln(x/x₀), F_c′(x)=c/x und damit ausschließlich für den Integranden c/x: '
    '∫_a^b c/x dx=c[ln(b/x₀)−ln(a/x₀)]=c ln(b/a). Das gesamte Intervall liegt in x>0; x₀ ist ein fester positiver Referenzwert. '
    'ln 1=0 und bei b>a>0 gilt ln(b/a)>0. Die Logarithmusprimitive darf nicht für einen anderen Integranden benutzt werden. Bei q≠0 gilt (k q/x)/q=k/x. '
    'Diese Regeln nennen weder Entropie noch einen physikalischen Weg. Eigenständige Ober-/Untersummenbegründung, Primitive-Suche und numerische Termwertrechnung sind keine zusätzliche Pflicht; eine vollständig begründete symbolische Clausius-Anwendung ist zulässig.'
)
math_en = (
    'Generic mathematical support: for dY=h(x)dx with continuous h, signed accumulation gives ΔY=∫_a^b h(x)dx. '
    'For a continuous integrand f and a differentiable F satisfying F′(x)=f(x) throughout the integration interval, ∫_a^b f(x)dx=F(b)−F(a). '
    'Specifically, for a,b,x₀>0 and a real factor c independent of x, F_c(x)=c ln(x/x₀), F_c′(x)=c/x and therefore, only for integrand c/x, '
    '∫_a^b c/x dx=c[ln(b/x₀)−ln(a/x₀)]=c ln(b/a). The whole interval lies in x>0; x₀ is a fixed positive reference. '
    'ln 1=0 and b>a>0 implies ln(b/a)>0. The logarithmic primitive must not be used for a different integrand. For q≠0, (k q/x)/q=k/x. '
    'These rules mention neither entropy nor a physical path. An upper/lower-sum proof, independent primitive finding and numerical expression-value calculation are not additional requirements; a fully justified symbolic Clausius application is admissible.'
)
changes = []
for case in profile['applicationCaseBriefs']:
    for field, marker, replacement in [('taskDemandDe', 'Allgemeine mathematische Hilfen:', math_de), ('taskDemandEn', 'Generic mathematical support:', math_en)]:
        before = case[field]
        assert before.count(marker) == 1
        case[field] = before.split(marker)[0] + replacement
        assert len(case[field]) <= 2000, (field, len(case[field]))
        changes.append({'caseId': case['id'], 'field': field, 'old': before, 'new': case[field]})

rationale = (
    'Das endgültige unabhängige v3-Urteil wird als historischer, exakt gebundener Input gelesen, nicht auf v4 übertragen. '
    'Die v3-Hilfe ließ die notwendige Bedingung F′=f aus und konnte deshalb f=1 auf [1,2] fälschlich mit einer unpassenden Logarithmusprimitive behandeln. '
    'V4 korrigiert ausschließlich diese vier DE/EN-Aufgabenhilfe-Felder: Die allgemeine Auswertung fordert jetzt F′=f auf dem ganzen Intervall; die spezielle Logarithmusformel gilt nur für c/x bei festem Faktor c und vollständig positivem Intervall sowie positivem festem x₀. '
    'Alle Stoffgesetze, die selbständige physikalische Wahl des reversiblen Ersatzwegs, Herleitung von δQ_rev, Integrationsgröße, Grenzen, ΔS und Realwegvergleich bleiben wortgleich. '
    'Der Autorenkandidat ohne fremde Pflicht-Mastery wird nur für dieses genaue neue unterstützte Profil vorgeschlagen; er ist weder unabhängig geprüft noch nativ M7-freigegeben. '
    'Die anderen vier v3-Kandidaten und alle alten Quellen, IDs, requires und Revieweingaben bleiben unverändert.'
)

frozen = copy.deepcopy(old_context['frozenInputs'])
extra = [oldpath('manifest.json'), review_path] + [Path(a['path']) for a in old_manifest['artifacts']]
seen = {x['path'] for x in frozen}
for p in extra:
    if str(p) not in seen:
        frozen.append({'path': str(p), 'sha256': sha(p)})
        seen.add(str(p))
for x in frozen:
    assert sha(x['path']) == x['sha256'], 'Historical/current input drift: ' + x['path']

context = {
    'schemaVersion': 1, 'status': 'inert_v4_clausius_author_context_pending_independent_review',
    'role': 'revision_author', 'agentIdentity': AGENT, 'createdAt': now, 'goalCount': 1,
    'physicsCanonicalFileSha256': old_context['physicsCanonicalFileSha256'], 'mathCanonicalFileSha256': old_context['mathCanonicalFileSha256'],
    'records': [record], 'unchangedGoalFullDeEn': record['currentCanonicalGoal'],
    'unchangedDirectRequires': record['currentCanonicalGoal']['requires'],
    'oldNativeProfileFullDeEn': record['actualNativePRecord']['profile'],
    'oldV3ProfileFullDeEn': old_v3_profile, 'oldV3ProfileBodySha256': fp(old_v3_profile),
    'newV4ProfileFullDeEn': profile, 'newV4ProfileBodySha256': fp(profile),
    'exactFieldChanges': changes,
    'actualFinalV3PeerReceiptRead': {'path': str(review_path), 'sha256': sha(review_path), 'record': reviewed, 'boundary': 'This final exact v3 verdict remains attached to v3. It supplies no v4 approval.'},
    'officialSourceSupplements': old_context['officialSourceSupplements'],
    'retainedOwnLegacyGoals': old_context['retainedOwnLegacyGoals'],
    'sourceBoundary': old_context['sourceBoundary'],
    'mathematicsFullDescriptionsAndActualCurrentNativePRead': old_context['mathematicsFullDescriptionsAndActualCurrentNativePRead'],
    'frozenInputs': frozen,
    'roleBoundary': 'Fresh #69-only author inputs. Old v3 files and reviews remain unchanged. No native review row, current P, source, requires, graph, deployment or commit is altered.',
}
write(newpath('context.exact.json'), context)
amendment.update({
    'proposedProfile': profile, 'proposedProfileBodySha256': fp(profile),
    'v3ProfileFullDeEn': old_v3_profile, 'sourceContextPath': str(newpath('context.exact.json')),
    'sourceContextFileSha256': sha(newpath('context.exact.json')), 'rationale': rationale,
    'status': 'inert_v4_author_candidate_pending_different_agent_native_QA',
    'revisionAuthorAgent': AGENT,
    'supersedesAuthorCandidateOnly': {'path': str(oldpath('profile-amendments.candidate.json')), 'sha256': sha(oldpath('profile-amendments.candidate.json')), 'goalId': GID, 'profileBodySha256': fp(old_v3_profile), 'boundary': 'Additive fresh exact input; no old peer or native verdict rebound.'},
})
old_decision.update({
    'author': 'Codex / revision author ' + AGENT, 'authorAgentCanonicalName': AGENT,
    'authorRole': 'revision_author', 'status': 'candidate_pending_independent_review',
    'rationale': rationale, 'profileAmendmentCandidatePath': str(newpath('profile-amendments.candidate.json')),
    'profileAmendmentProposedBodySha256': fp(profile),
    'mathematicsFullProfileReadPath': str(newpath('context.exact.json')),
    'supersedesAuthorCandidateOnly': {'path': str(oldpath('proposal-candidate.json')), 'fileSha256': sha(oldpath('proposal-candidate.json')), 'proposalBindingSha256': fp(old_bound['proposalBinding']), 'boundary': 'V3 peer receipt is preserved at its original inputs. V4 needs a fresh independent verdict.'},
})
old_decision['sourceRefs'] = [x for x in old_decision['sourceRefs'] if x['path'] not in [str(oldpath('context.exact.json')), str(oldpath('profile-amendments.candidate.json'))]]
old_decision['sourceRefs'] += [
    {'path': str(newpath('context.exact.json')), 'recordId': GID, 'locator': 'unchangedGoalFullDeEn, oldNativeProfileFullDeEn, oldV3ProfileFullDeEn and exactFieldChanges', 'supports': 'goalSemantics'},
    {'path': str(newpath('profile-amendments.candidate.json')), 'recordId': GID, 'locator': 'amendments[goalId=' + GID + '].proposedProfile', 'supports': 'goalSemantics'},
]
write(newpath('profile-amendments.candidate.json'), {'schemaVersion': 1, 'status': 'inert_v4_author_profile_only_no_native_receipt', 'author': AGENT, 'sourceContextPath': str(newpath('context.exact.json')), 'sourceContextFileSha256': sha(newpath('context.exact.json')), 'amendments': [amendment], 'licensing': {'ownContent': 'CC-BY-4.0', 'attribution': 'SkillPilot contributors', 'thirdPartyBoundary': 'Original source conditions retained.'}})
write(newpath('author-decisions.json'), {'schemaVersion': 1, 'status': 'inert_v4_author_ledger_pending_fresh_independent_review', 'author': AGENT, 'createdAt': now, 'sourceContextPath': str(newpath('context.exact.json')), 'sourceContextFileSha256': sha(newpath('context.exact.json')), 'goalCount': 1, 'decisions': [old_decision], 'roleBoundary': 'Author only. No native or peer approval claimed.', 'licensing': {'ownContent': 'CC-BY-4.0', 'attribution': 'SkillPilot contributors'}})
for s in ['context.exact.json', 'profile-amendments.candidate.json', 'author-decisions.json']:
    print(newpath(s), sha(newpath(s)))
