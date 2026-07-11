package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.CurriculumOverview;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.repository.CurriculumChampionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;

class CurriculaServiceQualitySnapshotSourceTest {

    @Test
    void packageModeCurriculaProjectionNeverReadsRepositoryQualityPoison() {
        List<Path> repositoryQualityCandidates = List.of(
                Path.of("docs", "qa-ci", "status", "curriculum-quality-status.json"),
                Path.of("..", "docs", "qa-ci", "status", "curriculum-quality-status.json"));
        assertThat(repositoryQualityCandidates).anyMatch(Files::isRegularFile);

        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getBaseCurricula()).thenReturn(List.of(new LandscapeSummary(
                "package-landscape",
                "Package curriculum",
                "From package only",
                "DE",
                null,
                "curriculum",
                "Mathematik",
                "de-DE",
                List.of())));
        ObjectMapper repositoryPoison = mock(ObjectMapper.class);

        CurriculaService service = new CurriculaService(
                landscapes,
                mock(MasteryRepository.class),
                mock(LearnerRepository.class),
                mock(CurriculumChampionRepository.class),
                mock(GitHubStatsService.class),
                mock(LearnerService.class),
                mock(CompositionViewService.class),
                repositoryPoison,
                new PackageCurriculumQualitySnapshotProvider());

        CurriculumOverview curriculum = service.getSnapshot().curricula().getFirst();

        assertThat(curriculum.curriculumId()).isEqualTo("package-landscape");
        assertThat(curriculum.qualityMaturity()).isNull();
        assertThat(curriculum.qualityGoals()).isZero();
        assertThat(curriculum.qualityAtomicGoals()).isZero();
        assertThat(curriculum.qualityWarnings()).isZero();
        assertThat(curriculum.qualityFailures()).isZero();
        assertThat(curriculum.subjectQuality()).isEmpty();
        verifyNoInteractions(repositoryPoison);
    }
}
