package com.example.pms.backend.dto.lookup;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ProjectPriorityResponse {

    Long id;
    String name;
    Integer weight;
    String colorCode;
}
