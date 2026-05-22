package com.example.pms.backend.repository;

import com.example.pms.backend.entity.ProjectPriority;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectPriorityRepository extends JpaRepository<ProjectPriority, Long> {

    Optional<ProjectPriority> findByNameIgnoreCase(String name);

    List<ProjectPriority> findAllByOrderByWeightDesc();
}
