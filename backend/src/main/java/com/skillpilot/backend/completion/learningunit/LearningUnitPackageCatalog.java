package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionCanonicalGraphResolver;
import com.skillpilot.backend.curriculumpackage.CurriculumRuntimeSnapshot;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/** Package admission is strict before publication; runtime source bytes are retained and immutable. */
public final class LearningUnitPackageCatalog {
    private LearningUnitPackageCatalog() { }

    public static LearningUnitCatalog load(CurriculumRuntimeSnapshot snapshot, ObjectMapper mapper) throws Exception {
        Map<String, byte[]> inputs = LearningUnitApplicationService.packageInputs(snapshot, mapper);
        byte[] manifest = LearningUnitApplicationService.packageManifest(snapshot, inputs, mapper);
        if (manifest == null) throw new IllegalArgumentException("Package omits its learning-unit catalog");
        Map<String, SkillLandscape> landscapes = new LinkedHashMap<>();
        for (var descriptor : snapshot.landscapesById().values()) {
            landscapes.put(descriptor.landscapeId(), mapper.readValue(descriptor.json(), SkillLandscape.class));
        }
        var goals = CompletionCanonicalGraphResolver.normalizeDefinitions(landscapes.values(), mapper);
        var bindings = new LearningUnitPackageBindings(snapshot, inputs, mapper);
        Set<LearningUnitDefinition.ContractRef> active = new LinkedHashSet<>();
        LearningUnitCatalog catalog = LearningUnitCatalog.load(manifest, path -> {
            byte[] bytes = inputs.get(path);
            if (bytes == null) throw new IOException("Missing pinned package unit input: " + path);
            return bytes;
        }, definition -> {
            var source = landscapes.get(definition.sourceBinding().landscapeId());
            var sourceMeanings = bindings.validateAndRestoreSourceMeanings(definition, goals);
            LearningUnitSourceBindings.validateActiveSource(definition, source, sourceMeanings,
                    definition.sourceBinding().compositionViewDigests());
            active.add(definition.ref());
        }, recall -> LearningUnitRecallBindings.validateActive(recall, goals.get(recall.goalId()),
                bindings::readCurrentDeck, mapper), mapper);
        if (!catalog.quarantined().isEmpty()) throw new IllegalArgumentException("Invalid packaged unit admission: " + catalog.quarantined());
        Set<LearningUnitDefinition.ContractRef> authored = new LinkedHashSet<>();
        for (SkillLandscape landscape : landscapes.values()) if (landscape.getProgramUnits() != null) {
            for (var unit : landscape.getProgramUnits()) if (unit.getLearningUnit() != null) {
                authored.add(new LearningUnitDefinition.ContractRef(unit.getLearningUnit().contractId(), unit.getLearningUnit().revision()));
            }
        }
        if (!catalog.activeContractRefs().containsAll(authored)) throw new IllegalArgumentException("Packaged unit source metadata and active contracts differ");
        return catalog;
    }
}
