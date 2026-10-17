import pathlib,json,hashlib,datetime
R=pathlib.Path.cwd();O=R/'tmp/chemie-m7-resumed-20261016/BB-BE-LK-eleven-prior-boundary-independent-b-v1'
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest();pin=lambda p:{'path':str(pathlib.Path(p).relative_to(R)),'sha256':sha(p),'bytes':pathlib.Path(p).stat().st_size};rd=lambda p:json.loads(pathlib.Path(p).read_text());wr=lambda p,x:pathlib.Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
f=rd(O/'FIRST.actual-science.eleven-prior-boundary.independent-b.json');assert sha(O/'FIRST.actual-science.eleven-prior-boundary.independent-b.json')=='02e14f0f82dfaf08ba13686c1aa4140e139abc0f2d09fefbf24dd08591f680fe';c=rd(O/'CHECK.finite-two-current-roles-and-direct-interface-paths.readonly.json');i=rd(O/'INPUT.selected-current-wholes-and-two-whole-views.readonly.json');K=R/'tmp/chemie-m7-resumed-20261016/chemie-shared640-recycling-native-author-capsule-L6-v1';can=rd(K/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');m={g['id']:g for g in can['goals']};g={g['id']:g for g in i['wholeGoals']}
assert all(m[x]==v for x,v in g.items());assert all(rd(K/x['path'])==x['whole'] for x in i['wholeViews']);checks={'role':'Own bounded post-FIRST mechanical retention/count proof; no new science/nativeD/approval','FIRST':pin(O/'FIRST.actual-science.eleven-prior-boundary.independent-b.json'),'currentCanonical':pin(K/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),'selectedWholeBodiesStillExact':len(g),'wholeTwoViewsStillExact':True,'stockFiniteCompositionCompiles':{'views':2,'errors':sum(len([x for x in r['finiteCompileFindings'] if x['severity']=='error']) for r in c['rows'])},'actualElevenRoleCountsPerView':[{'view':r['view'],'target':sum(x['role']=='target' for x in r['eleven']),'support':sum(x['role']=='prerequisiteOnly' for x in r['eleven']),'missing':sum(x['role']=='missing' for x in r['eleven']),'directTargetEdgesToTheseEleven':sum(len(x['visibleDirectDependents']) for x in r['eleven'])} for r in c['rows']],'scopeLimit':'No39-view/global prerequisite audit, no APV/build/centralD/P/A/M/V run, no Java runtime execution.'};wr(O/'CHECK.post-FIRST.selected-retention-and-finite-counts.json',checks)
body='''# Independent B: BB/BE LK prerequisite boundary

**Decision: REVISE the current acquisition boundary. KEEP the actual 9fef phosphate-buffer goal and its qualitative P material.**

Own science FIRST: `02e14f0f82dfaf08ba13686c1aa4140e139abc0f2d09fefbf24dd08591f680fe`. No current peer scientific verdict was read before sealing it.

Both actual CrossStage LK views omit all eleven assigned IDs from both `target` and `prerequisiteOnly`. Their two direct 9fef prerequisites are targets. Seven omitted IDs have direct consumers among current targets: 19 edges per view, comprising 18 ordinary edges across 12 ordinary goals and one existing Memory acquisition edge. Four IDs lie deeper behind omitted goals; they are not four additional immediate blockers or new review quotas.

## Decisive actual interfaces

- `81373fb7-2a4a-5b2c-acd0-b4e775acaa65` → `70b34ae7-4481-590c-9a02-516464750832` (general equilibrium → full ester competence).
- `91cd4728-b811-562a-970b-18b81dfb4bdf` → `e9b61d96-a271-5e69-b872-8c463f822be1` (polar properties → full alcohol constitutional-isomer routine).
- `eb7537dd-d11b-50e9-a6d7-51a78e96fc4e` → `448815cc-4127-54b7-96bf-e54b3d2a38c5` and `9b56d01e-c2d7-51d8-b78e-237592c1ed20` (intermolecular interactions → bonding/geometry).
- `f5efab9d-2c61-44ea-b36a-87f873b51fd8` → `72236f2c-771e-4ab6-933a-e549ee49d15b` (energy-level/electron model → core-shell).

These are direct atomic canonical requirements. Inspected backend `LearnerService.java:5882`, `:6082` blocks a target whose known direct prior has neither projected role. It does not treat these as inherited-cluster noise or silently assume entry mastery. This is source-code evidence; no Java runtime test was run.

## Scientific classification

The actual phosphate case uses conjugate partners, balanced acid/base interception reactions, Le Chatelier, finite reserves and bounded biological meaning. It does not need the full ester/alcohol oxidation/nomenclature/isomer chain. The first two interfaces above carry broader context routines into a general skill and require a bounded author correction.

Core-shell, bonding and geometry can be legitimate entry foundations for existing atom/polarity targets. Their being earlier knowledge does not give them an unrecorded role or mastery. Reviewed explicit support can preserve those checks without new ordinary completion duties.

The other two exposed missing IDs are `a3788e40-b540-5bed-be37-b33053528422` (carboxylic acids) and `5a30273a-98d5-5163-bb16-c250b7ed4e7f` (structure–property relationships). They have other current target consumers and cannot simply be deleted. Deeper-only IDs: `5851b53a-162b-5c17-9269-510ee54ad846`, `858d56e0-ab8f-51a4-b07e-7d9d94cab8e2`, `345fdca9-038f-51e2-9bea-b6ac416a734a`, `536b48b2-7822-5b7e-9059-ad43400da7e0`.

## Minimal proposed author work

1. Preserve 9fef body/P and its Brønsted + Le Chatelier interface.
2. Correct the two demonstrated overbroad interfaces with existing scientifically suitable foundations after a bounded check of their whole material contexts. Preserve genuine ester/isomer duties in the contexts that require them.
3. In exactly the two BB/BE LK views, explicitly place retained genuine entry prerequisites as reviewed support, or as source-backed targets where actually intended. Resolve the seven exposed IDs first; show which of the deeper four remain necessary after the edge correction. Do not bulk add eleven completion targets or invent mastery.
4. Verify these exact interfaces and informed bindings of genuinely changed goals. No new atoms or historical whole-curriculum review is required by this finding.

Canonical Chemistry M3 checks paths in its configured canonical Sek-II profile; it does not currently select these BB/BE view roles. Two finite composition compiles have zero errors, but neither check establishes acquisition closure. No observed global M3 failure or M7 result is claimed. The known relevant Layer-A defect remains open for M7.

The expected concurrent F03 append changed L6 to 641 goals/439 ordinary at `42312988d68fccc65a15339bcb0b9d46a8d1800455a1858d3e3cb141090bc5e3`. All selected old whole bodies and both view bodies were independently checked unchanged through this seal. No F03 science is repeated here.

No R/L6/source/view/canonical edits, global APV/build, new P approval, formal Native D vote, or human/M7 approval.
'''
(O/'HANDOFF.eleven-prior-boundary.independent-b.md').write_text(body)
sel={'role':'Sealed independent B bounded read-only output selector','reviewerId':f['reviewerId'],'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'FIRST':pin(O/'FIRST.actual-science.eleven-prior-boundary.independent-b.json'),'handoff':pin(O/'HANDOFF.eleven-prior-boundary.independent-b.md'),'decision':f['decisions'],'technicalProof':pin(O/'CHECK.post-FIRST.selected-retention-and-finite-counts.json'),'noFormalD':True,'noWholeM7HumanApproval':True}
wr(O/'OUTPUTS.BB-BE-LK-eleven-prior-boundary.independent-b.selector.json',sel)
files=sorted(p for p in O.iterdir() if p.is_file() and not p.name.startswith('MANIFEST.'));wr(O/'MANIFEST.final.independent-b.json',{'role':'Own finite review artifact manifest; no canonical candidate','files':[pin(p) for p in files]})
for n in ['OUTPUTS.BB-BE-LK-eleven-prior-boundary.independent-b.selector.json','HANDOFF.eleven-prior-boundary.independent-b.md','MANIFEST.final.independent-b.json']:print(json.dumps(pin(O/n)))
