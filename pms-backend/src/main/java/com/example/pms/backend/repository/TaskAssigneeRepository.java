package com.example.pms.backend.repository;

import com.example.pms.backend.entity.TaskAssignee;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskAssigneeRepository extends JpaRepository<TaskAssignee, Long> {

    List<TaskAssignee> findByTaskId(Long taskId);

    @Query("""
            SELECT ta FROM TaskAssignee ta
            JOIN FETCH ta.user
            WHERE ta.task.id = :taskId
            """)
    List<TaskAssignee> findByTaskIdWithUser(@Param("taskId") Long taskId);

    void deleteByTaskId(Long taskId);

    boolean existsByTaskIdAndUserId(Long taskId, Long userId);
}
