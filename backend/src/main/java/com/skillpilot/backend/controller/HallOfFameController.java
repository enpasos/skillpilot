package com.skillpilot.backend.controller;

import com.skillpilot.backend.service.HallOfFameService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ui")
public class HallOfFameController {

    private final HallOfFameService hallOfFameService;

    public HallOfFameController(HallOfFameService hallOfFameService) {
        this.hallOfFameService = hallOfFameService;
    }

    @GetMapping("/hall-of-fame")
    public HallOfFameService.HallOfFameSnapshot getHallOfFame() {
        return hallOfFameService.getSnapshot();
    }
}
