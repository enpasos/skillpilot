package com.skillpilot.backend.controller;

import com.skillpilot.backend.service.DeckResourceService;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DeckDataController {

    private final DeckResourceService deckResourceService;

    public DeckDataController(DeckResourceService deckResourceService) {
        this.deckResourceService = deckResourceService;
    }

    @GetMapping("/data/{fileName:.+}")
    public ResponseEntity<Resource> getDeck(@PathVariable String fileName) {
        Resource resource = deckResourceService.resolveDeckResource("/data/" + fileName);
        if (resource == null || !resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.APPLICATION_JSON)
                .body(resource);
    }
}

