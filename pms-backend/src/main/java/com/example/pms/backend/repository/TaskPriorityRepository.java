package com.example.pms.backend.repository;

import com.example.pms.backend.entity.TaskPriority;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskPriorityRepository extends JpaRepository<TaskPriority, Long> {

    Optional<TaskPriority> findByNameIgnoreCase(String name);

    List<TaskPriority> findAllByOrderByWeightDesc();
}
