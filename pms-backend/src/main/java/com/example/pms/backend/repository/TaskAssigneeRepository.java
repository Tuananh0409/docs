package com.example.pms.backend.repository;

import com.example.pms.backend.entity.TaskAssignee;
import java.util.Collection;
import java.util.List;
import java.util.Set;
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

    @Query("""
            SELECT ta FROM TaskAssignee ta
            JOIN FETCH ta.user
            JOIN FETCH ta.task
            WHERE ta.task.id IN :taskIds
            """)
    List<TaskAssignee> findByTaskIdInWithUser(@Param("taskIds") Collection<Long> taskIds);

    @Query("SELECT ta.user.id FROM TaskAssignee ta WHERE ta.task.id = :taskId")
    Set<Long> findUserIdsByTaskId(@Param("taskId") Long taskId);

    void deleteByTaskId(Long taskId);

    boolean existsByTaskIdAndUserId(Long taskId, Long userId);
}
