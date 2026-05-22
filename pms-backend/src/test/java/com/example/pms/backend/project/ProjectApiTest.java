package com.example.pms.backend.project;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.pms.backend.auth.AuthTestSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class ProjectApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthTestSupport authTestSupport;

    @Test
    void createAndListProject() throws Exception {
        String workspaceJson = objectMapper.writeValueAsString(Map.of(
                "name", "Phong Dev Test",
                "code", "PDT",
                "slug", "phong-dev-test"));

        MvcResult wsResult = mockMvc.perform(post("/api/workspaces")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authTestSupport.bearerTokenForUserId(1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(workspaceJson))
                .andExpect(status().isCreated())
                .andReturn();

        String workspaceSlug = objectMapper
                .readTree(wsResult.getResponse().getContentAsString())
                .get("slug")
                .asText();

        String projectJson = objectMapper.writeValueAsString(Map.of(
                "name", "Du an Alpha",
                "description", "Mo ta du an",
                "statusName", "Active",
                "privacyMode", "PRIVATE"));

        MvcResult projectResult = mockMvc.perform(post("/api/workspaces/{ws}/projects", workspaceSlug)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authTestSupport.bearerTokenForUserId(1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Du an Alpha"))
                .andExpect(jsonPath("$.myRole").value("PM"))
                .andReturn();

        String projectSlug = objectMapper
                .readTree(projectResult.getResponse().getContentAsString())
                .get("slug")
                .asText();

        mockMvc.perform(get("/api/workspaces/{ws}/projects", workspaceSlug)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authTestSupport.bearerTokenForUserId(1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value(projectSlug))
                .andExpect(jsonPath("$[0].myRole").value("PM"));

        mockMvc.perform(get("/api/workspaces/{ws}/projects/{slug}", workspaceSlug, projectSlug)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authTestSupport.bearerTokenForUserId(1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").exists())
                .andExpect(jsonPath("$.canEditPriority").value(true));

        mockMvc.perform(patch("/api/workspaces/{ws}/projects/{slug}", workspaceSlug, projectSlug)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + authTestSupport.bearerTokenForUserId(1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"priorityName\":\"High\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priorityName").value("High"))
                .andExpect(jsonPath("$.priorityWeight").value(3));
    }
}
