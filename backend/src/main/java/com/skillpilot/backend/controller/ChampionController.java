package com.skillpilot.backend.controller;

import com.skillpilot.backend.api.ChampionRegistrationRequest;
import com.skillpilot.backend.api.ChampionRegistrationResponse;
import com.skillpilot.backend.api.CurriculumChampionProfile;
import com.skillpilot.backend.service.CurriculaService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/ui/curricula/champions")
public class ChampionController {

    private final CurriculaService curriculaService;

    public ChampionController(CurriculaService curriculaService) {
        this.curriculaService = curriculaService;
    }

    @GetMapping("/me")
    public List<CurriculumChampionProfile> getMyChampionships(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String githubId = principal.getAttribute("login");
        return curriculaService.getChampionsByGithubId(githubId);
    }

    @PostMapping("/register")
    public ChampionRegistrationResponse register(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody ChampionRegistrationRequest request) {

        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String githubId = principal.getAttribute("login"); // Get trusted ID from OAuth

        // Override the githubId in request with the authenticated one
        ChampionRegistrationRequest secureRequest = new ChampionRegistrationRequest(
                request.curriculumId(),
                request.skillpilotId(),
                githubId,
                request.topicId());

        return curriculaService.registerChampion(secureRequest);
    }

    @PostMapping("/deregister")
    public void deregister(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody List<String> curriculumIds) {

        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String githubId = principal.getAttribute("login");
        curriculaService.deregisterChampions(githubId, curriculumIds);
    }
}
