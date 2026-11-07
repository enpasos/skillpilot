import pathlib,os,json,hashlib
W=pathlib.Path(__file__).parent;S=W/'ci-p2-successor-scripts';O=W/'candidate/app/scripts';S.mkdir(exist_ok=True)
for p in O.rglob('*'):
 out=S/p.relative_to(O)
 if p.is_dir():out.mkdir(exist_ok=True,parents=True)
 elif not out.exists():out.parent.mkdir(exist_ok=True,parents=True);os.link(p,out)
p=S/'lib/retainedAssessmentCoverage.ts';old=p.read_text();s=old.replace("import { collectCompositionProjectionRoleGoalIds } from", "import { collectCompositionProjectionRoleGoalIds, normalizeCompositionView } from")
a="""    try { const raw = viewFrame?.get(path) ?? readFileSync(path); if (raw.includes(INFO_HELD)) discoveryIssues.push('held-introduction: active view'); return { path, sha256: coverageSha256(raw) } }"""
b="""    try {
      const raw = viewFrame?.get(path) ?? readFileSync(path)
      const view = normalizeCompositionView(JSON.parse(raw.toString('utf8')))
      // Only authored goal references carry introduction semantics. Titles,
      // labels and metadata may discuss a held historical ID without offering it.
      // Native traversal includes both target and prerequisiteOnly assignments.
      const root = landscape.goals.find(goal => goal.tags?.includes('root'))
      const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId,
        root ? new Map([[landscape.landscapeId, root.id]]) : new Map())
      const references = [...roles.targetGoalIds, ...roles.prerequisiteOnlyGoalIds]
      const held = references.some(reference => {
        const parts = reference.split(':')
        if (parts.length < 1 || parts.length > 2 || parts.some(part => !part || part.trim() !== part)) return false
        const owner = parts.length === 2 ? parts[0] : view.landscapeId
        return owner.toLowerCase() === RETAINED_INFO_OWNER && parts.at(-1)!.toLowerCase() === INFO_HELD
      })
      if (held) discoveryIssues.push('held-introduction: active view')
      return { path, sha256: coverageSha256(raw) }
    }"""
assert old.count(a)==1;s=s.replace(a,b);tmp=p.with_suffix('.new');tmp.write_text(s);os.replace(tmp,p)
(W/'ci-p2-successor-code-pin.json').write_text(json.dumps({'status':'Private separate P2 successor only; original13 CI files/source c824 preserved','path':'app/scripts/lib/retainedAssessmentCoverage.ts','beforeSha256':hashlib.sha256(old.encode()).hexdigest(),'successorSha256':hashlib.sha256(s.encode()).hexdigest(),'sourceSha256':'c824e0b360470ef67ae4deb560146c7e677ad9601446b26cd5a46097c426e53b','changedProductionFiles':1,'concreteBindingsStillEmpty':True,'ordinary875EquivalenceStillUnbound':True},indent=2)+'\n')
