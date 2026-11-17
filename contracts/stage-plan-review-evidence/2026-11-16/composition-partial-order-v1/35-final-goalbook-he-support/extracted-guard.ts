      const crossStage = normalizeCompositionView(readJson(
        `${COMPOSITION_VIEW_DIRECTORY}/de-he-gk-${durationSpec.durationModel.toLowerCase()}.view.json`,
      ))
      const sourceStages = collectCompositionStructures(crossStage.rootNodes, 'physics-seki')
      const excerptStages = collectCompositionStructures(view.rootNodes, 'physics-seki')
      assert.equal(sourceStages.length, 1)
      assert.deepEqual(excerptStages, sourceStages,
        `${view.viewId}: preserve every exact lower-stage reference payload and acquisition placement`)
      const ownAtoms = (ids: Set<string>) => [...ids]
        .filter((id) => semanticGoalById.get(id)?.contains.length === 0).sort(compareCodePoints)
      const stageRoles = collectCompositionProjectionRoleGoalIds(sourceStages, physicsAndMathGoalById)
      const sourceRoles = collectCompositionProjectionRoleGoalIds(crossStage.rootNodes, physicsAndMathGoalById)
      const sourceTargetIds = new Set(ownAtoms(stageRoles.targetGoalIds))
      const required = new Set<string>()
      const pending = [...sourceTargetIds]
      while (pending.length > 0) {
        const id = pending.pop()!
        if (required.has(id)) continue
        required.add(id)
        pending.push(...(physicsAndMathGoalById.get(id)?.requires ?? []).map(normalizeGoalRef))
      }
      const explicitStageSupport = new Set(ownAtoms(stageRoles.prerequisiteOnlyGoalIds))
      const expectedSupport = new Set(ownAtoms(sourceRoles.prerequisiteOnlyGoalIds)
        .filter((id) => required.has(id) || explicitStageSupport.has(id)))
      explicitStageSupport.forEach((id) => expectedSupport.add(id))
      assert.deepEqual([...expectedSupport].sort(compareCodePoints),
        ['13b338eb-f761-5817-9058-11043b9cb253', 'f74c691b-0b76-54e0-8fd6-a22211994e0a',
          'b378c8b3-5e83-5abf-8243-b0f345037bfc', 'd3c153b9-e09b-5668-8386-73105546a7c1',
          'da26294f-4316-5bd5-a37a-bd89397b3b8b'].sort(compareCodePoints),
        'the stage-resolved excerpt retains the two declared supports and three genuinely required method preparations')
      for (const neededMethod of ['b378c8b3-5e83-5abf-8243-b0f345037bfc',
        'd3c153b9-e09b-5668-8386-73105546a7c1', 'da26294f-4316-5bd5-a37a-bd89397b3b8b']) {
        assert(required.has(neededMethod), `${view.viewId}: added method support must have a real unpruned source-seed requirement`)
      }
      const assertBoundStageRoles = (nodes: CompositionViewNode[]) => {
        const roles = collectCompositionProjectionRoleGoalIds(nodes, physicsAndMathGoalById)
        assert.deepEqual(ownAtoms(roles.targetGoalIds), [...sourceTargetIds].sort(compareCodePoints),
          'SekI excerpt must preserve the exact 134 own target atoms')
        assert.deepEqual(ownAtoms(roles.prerequisiteOnlyGoalIds), [...expectedSupport].sort(compareCodePoints),
          'SekI excerpt must preserve exactly the resolved required/explicit own support')
      }
      assertBoundStageRoles(view.rootNodes)
      const renderedOwnVisibleIds = collectRenderedAtomicGoalIdsFromCompositionView(
        rawLandscape as unknown as SkillLandscape, resolve(repoRoot, sourcePath), [durationSpec.durationModel],
        true, 'SekI', [], [rawLandscape, rawMathLandscape, rawChemistryLandscape] as unknown as SkillLandscape[],
      )
      assert.deepEqual(ownAtoms(renderedOwnVisibleIds), [...sourceTargetIds, ...expectedSupport].sort(compareCodePoints),
        'actual Sek-I own-Physics visibility agrees with its resolved target/support roles')
      for (const leakedId of HE_SEKI_UPPER_SUPPORT_LEAK_IDS) {
        assert(!required.has(leakedId), `${view.viewId}: do not prune a real required preparation ${leakedId}`)
        assert.throws(() => assertBoundStageRoles([...view.rootNodes,
          { kind: 'goalEntry', goalId: leakedId, projectionRole: 'prerequisiteOnly' }]),
        /resolved required\/explicit own support/u,
        `${view.viewId}: reject reintroduced upper-stage support ${leakedId}`)
      }
      for (const supportId of expectedSupport) {
        const removeSupport = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.flatMap((node) => (
          node.kind === 'structure' ? [{ ...node, children: removeSupport(node.children) }]
            : collectCompositionProjectionRoleGoalIds([node], physicsAndMathGoalById).prerequisiteOnlyGoalIds.has(supportId) ? [] : [node]
        ))
        assert.throws(() => assertBoundStageRoles(removeSupport(view.rootNodes)),
          /resolved required\/explicit own support/u,
          `${view.viewId}: reject loss of necessary/explicit preparation ${supportId}`)
      }