package com.skillpilot.backend.controller;

import com.skillpilot.backend.api.ChampionRegistrationRequest;
import com.skillpilot.backend.api.ChampionRegistrationResponse;
import com.skillpilot.backend.api.CurriculaSnapshot;
import com.skillpilot.backend.service.CurriculaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ui")
public class CurriculaController {

    private final CurriculaService curriculaService;

    public CurriculaController(CurriculaService curriculaService) {
        this.curriculaService = curriculaService;
    }

    @GetMapping("/curricula")
    public CurriculaSnapshot getCurricula() {
        return curriculaService.getSnapshot();
    }

    @PostMapping("/curricula/champions")
    public ChampionRegistrationResponse registerChampion(@RequestBody ChampionRegistrationRequest request) {
        return curriculaService.registerChampion(request);
    }

    @GetMapping("/hall-of-fame")
    public CurriculaSnapshot getHallOfFame() {
        return curriculaService.getSnapshot();
    }

    @GetMapping("/curricula/{curriculumId}/topics")
    public java.util.List<com.skillpilot.backend.api.TopicSummary> getTopics(
            @org.springframework.web.bind.annotation.PathVariable String curriculumId) {
        return curriculaService.getTopics(curriculumId);
    }
}
