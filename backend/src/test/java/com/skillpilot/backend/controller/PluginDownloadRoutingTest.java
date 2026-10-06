package com.skillpilot.backend.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class PluginDownloadRoutingTest {

    private static final String DOWNLOAD = "/plugins/gemini/skillpilot-coach-v1-0.1.0.zip";
    private static final String RESOURCE_PREFIX = "classpath:/static/plugins/gemini/";

    @TempDir
    Path directory;

    private MockMvc mockMvc;
    private byte[] archive;
    private int archiveLookups;

    @BeforeEach
    void setUp() throws Exception {
        Path file = directory.resolve("skillpilot-coach-v1-0.1.0.zip");
        try (ZipOutputStream zip = new ZipOutputStream(Files.newOutputStream(file))) {
            zip.putNextEntry(new ZipEntry("SKILL.md"));
            zip.write("# Synthetic routing fixture\n".getBytes(StandardCharsets.UTF_8));
            zip.closeEntry();
        }
        archive = Files.readAllBytes(file);
        DefaultResourceLoader resources = new DefaultResourceLoader() {
            @Override
            public Resource getResource(String location) {
                if (location.startsWith(RESOURCE_PREFIX)) {
                    archiveLookups++;
                    return new FileSystemResource(directory.resolve(location.substring(RESOURCE_PREFIX.length())));
                }
                return super.getResource(location);
            }
        };
        mockMvc = MockMvcBuilders.standaloneSetup(new SpaController(resources)).build();
    }

    @Test
    void servesZipBytesInsteadOfForwardingToTheSpaShell() throws Exception {
        mockMvc.perform(get(DOWNLOAD))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/zip"))
                .andExpect(header().string("Cache-Control", "no-cache"))
                .andExpect(content().bytes(archive));
    }

    @Test
    void missingZipReturnsNotFoundInsteadOfAnHttp200SpaShell() throws Exception {
        mockMvc.perform(get("/plugins/gemini/missing-skill.zip"))
                .andExpect(status().isNotFound());
    }

    @Test
    void retainsPluginCatalogDeepLinks() throws Exception {
        for (String route : new String[] {"/plugins", "/plugins/gemini", "/plugins/claude/setup/example"}) {
            mockMvc.perform(get(route))
                    .andExpect(status().isOk())
                    .andExpect(forwardedUrl("/index.html"));
        }
    }

    @Test
    void rejectsUnsafeArchiveNamesBeforeResourceLookup() throws Exception {
        for (String name : new String[] {"..zip", "other..zip", "..\\private.zip", "%252e%252e.zip",
                "%2fprivate.zip", ".hidden.zip", "a".repeat(129) + ".zip"}) {
            mockMvc.perform(get("/plugins/gemini/" + name))
                    .andExpect(status().isNotFound());
        }
        assertEquals(0, archiveLookups, "unsafe names never reach resource lookup");
    }
}
