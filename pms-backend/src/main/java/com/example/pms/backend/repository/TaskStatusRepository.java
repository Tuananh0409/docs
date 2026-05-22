package com.example.pms.backend.repository;

import com.example.pms.backend.entity.TaskStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskStatusRepository extends JpaRepository<TaskStatus, Long> {

    Optional<TaskStatus> findByStatusNameIgnoreCase(String statusName);

    List<TaskStatus> findAllByOrderByPositionAsc();
}
