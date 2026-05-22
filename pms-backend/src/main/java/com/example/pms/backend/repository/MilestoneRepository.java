package com.example.pms.backend.repository;

import com.example.pms.backend.entity.Milestone;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    Optional<Milestone> findByIdAndProjectIdAndDeletedFalse(Long id, Long projectId);
}
