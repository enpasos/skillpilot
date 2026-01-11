package com.skillpilot.backend.controller;

import com.skillpilot.backend.api.UserStatsResponse;
import com.skillpilot.backend.service.UserStatsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ui")
public class UserStatsController {

    private final UserStatsService userStatsService;

    public UserStatsController(UserStatsService userStatsService) {
        this.userStatsService = userStatsService;
    }

    @GetMapping("/users/stats")
    public UserStatsResponse getUserStats() {
        return userStatsService.getStats();
    }
}
