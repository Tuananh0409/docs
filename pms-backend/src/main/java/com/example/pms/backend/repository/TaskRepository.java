package com.example.pms.backend.repository;

import com.example.pms.backend.entity.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("""
            SELECT t FROM Task t
            LEFT JOIN FETCH t.priority
            LEFT JOIN FETCH t.status
            LEFT JOIN FETCH t.createdBy
            LEFT JOIN FETCH t.milestone
            WHERE t.project.id = :projectId AND t.deleted = false
            ORDER BY t.createdAt DESC
            """)
    List<Task> findByProjectIdWithDetails(@Param("projectId") Long projectId);

    @Query("""
            SELECT t FROM Task t
            LEFT JOIN FETCH t.priority
            LEFT JOIN FETCH t.status
            LEFT JOIN FETCH t.project p
            LEFT JOIN FETCH p.workspace
            LEFT JOIN FETCH t.createdBy
            WHERE t.id = :taskId AND t.project.id = :projectId AND t.deleted = false
            """)
    Optional<Task> findByIdAndProjectIdWithDetails(
            @Param("taskId") Long taskId, @Param("projectId") Long projectId);

    @Query("""
            SELECT DISTINCT t FROM Task t
            JOIN TaskAssignee ta ON ta.task.id = t.id
            LEFT JOIN FETCH t.priority
            LEFT JOIN FETCH t.status
            LEFT JOIN FETCH t.project p
            LEFT JOIN FETCH p.workspace
            WHERE ta.user.id = :userId AND t.deleted = false AND p.deleted = false
            ORDER BY t.deadline NULLS LAST, t.updatedAt DESC
            """)
    List<Task> findAssignedToUser(@Param("userId") Long userId);

    @Query("""
            SELECT COUNT(t) FROM Task t
            WHERE t.project.id = :projectId AND t.deleted = false
            """)
    long countByProjectId(@Param("projectId") Long projectId);

    @Query("""
            SELECT COUNT(t) FROM Task t
            JOIN t.status s
            WHERE t.project.id = :projectId AND t.deleted = false
              AND LOWER(s.statusName) = 'done'
            """)
    long countDoneByProjectId(@Param("projectId") Long projectId);
}
