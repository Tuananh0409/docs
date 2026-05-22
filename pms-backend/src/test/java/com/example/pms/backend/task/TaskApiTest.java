package com.example.pms.backend.task;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.pms.backend.auth.AuthTestSupport;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
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
class TaskApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthTestSupport authTestSupport;

    @Test
    void createListAndUpdateTask() throws Exception {
        String token = authTestSupport.bearerTokenForUserId(1);

        MvcResult wsResult = mockMvc.perform(post("/api/workspaces")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Task Test WS",
                                "code", "TTW",
                                "slug", "task-test-ws"))))
                .andExpect(status().isCreated())
                .andReturn();

        String workspaceSlug = objectMapper
                .readTree(wsResult.getResponse().getContentAsString())
                .get("slug")
                .asText();

        MvcResult projectResult = mockMvc.perform(post("/api/workspaces/{ws}/projects", workspaceSlug)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "Task Test Project",
                                "statusName", "Active",
                                "privacyMode", "PRIVATE"))))
                .andExpect(status().isCreated())
                .andReturn();

        String projectSlug = objectMapper
                .readTree(projectResult.getResponse().getContentAsString())
                .get("slug")
                .asText();

        String createTaskJson = objectMapper.writeValueAsString(Map.of(
                "title", "Implement login",
                "description", "JWT cookie flow",
                "priority", "High",
                "statusName", "Todo",
                "assigneeUserIds", List.of(1)));

        MvcResult taskResult = mockMvc.perform(post(
                        "/api/workspaces/{ws}/projects/{ps}/tasks", workspaceSlug, projectSlug)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createTaskJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Implement login"))
                .andExpect(jsonPath("$.statusName").value("Todo"))
                .andExpect(jsonPath("$.taskKey").exists())
                .andReturn();

        long taskId = objectMapper
                .readTree(taskResult.getResponse().getContentAsString())
                .get("id")
                .asLong();

        mockMvc.perform(get("/api/workspaces/{ws}/projects/{ps}/tasks", workspaceSlug, projectSlug)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value((int) taskId));

        mockMvc.perform(patch(
                        "/api/workspaces/{ws}/projects/{ps}/tasks/{id}/status",
                        workspaceSlug,
                        projectSlug,
                        taskId)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("statusName", "In Progress"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statusName").value("In Progress"));

        mockMvc.perform(get("/api/tasks/mine").header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Implement login"));
    }
}
