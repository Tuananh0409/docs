package com.example.pms.backend.repository;

import com.example.pms.backend.entity.TaskStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskStatusRepository extends JpaRepository<TaskStatus, Long> {

    boolean existsByProjectId(Long projectId);

    List<TaskStatus> findByProjectIdOrderByPositionAsc(Long projectId);

    Optional<TaskStatus> findByProjectIdAndStatusNameIgnoreCase(Long projectId, String statusName);

    Optional<TaskStatus> findByIdAndProjectId(Long id, Long projectId);
}
