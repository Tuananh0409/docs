package com.example.pms.backend.repository;

import com.example.pms.backend.entity.Task;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("""
            SELECT t FROM Task t
            LEFT JOIN FETCH t.priority
            LEFT JOIN FETCH t.status
            LEFT JOIN FETCH t.createdBy
            LEFT JOIN FETCH t.reporter
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
            LEFT JOIN FETCH t.reporter
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
            SELECT DISTINCT t FROM Task t
            JOIN TaskAssignee ta ON ta.task.id = t.id
            LEFT JOIN FETCH t.priority
            LEFT JOIN FETCH t.status
            LEFT JOIN FETCH t.project p
            LEFT JOIN FETCH p.workspace
            WHERE ta.user.id = :userId
              AND t.deleted = false
              AND p.deleted = false
              AND (
                EXISTS (
                    SELECT 1 FROM ProjectMember pm
                    WHERE pm.project.id = p.id AND pm.user.id = :userId)
                OR EXISTS (
                    SELECT 1 FROM WorkspaceMember wm JOIN wm.role r
                    WHERE wm.workspace.id = p.workspace.id AND wm.user.id = :userId
                      AND LOWER(r.roleName) = 'admin')
              )
            ORDER BY t.deadline NULLS LAST, t.updatedAt DESC
            """)
    List<Task> findAccessibleAssignedToUser(@Param("userId") Long userId);

    @Query("""
            SELECT new com.example.pms.backend.dto.task.AssignedTasksSummaryDto(
                COUNT(t),
                COALESCE(SUM(CASE
                    WHEN t.deadline IS NOT NULL AND t.deadline < :now
                         AND (s IS NULL OR LOWER(s.statusName) <> 'done') THEN 1L
                    ELSE 0L END), 0L),
                COALESCE(SUM(CASE
                    WHEN s IS NOT NULL AND LOWER(s.statusName) = 'in progress' THEN 1L
                    ELSE 0L END), 0L),
                COALESCE(SUM(CASE
                    WHEN s IS NOT NULL AND LOWER(s.statusName) = 'done' THEN 1L
                    ELSE 0L END), 0L))
            FROM Task t
            JOIN TaskAssignee ta ON ta.task.id = t.id
            JOIN t.project p
            LEFT JOIN t.status s
            WHERE ta.user.id = :userId
              AND t.deleted = false
              AND p.deleted = false
              AND (
                EXISTS (
                    SELECT 1 FROM ProjectMember pm
                    WHERE pm.project.id = p.id AND pm.user.id = :userId)
                OR EXISTS (
                    SELECT 1 FROM WorkspaceMember wm JOIN wm.role r
                    WHERE wm.workspace.id = p.workspace.id AND wm.user.id = :userId
                      AND LOWER(r.roleName) = 'admin')
              )
            """)
    com.example.pms.backend.dto.task.AssignedTasksSummaryDto summarizeAccessibleAssignedTasks(
            @Param("userId") Long userId, @Param("now") Instant now);

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

    long countByProjectIdAndStatusIdAndDeletedFalse(Long projectId, Long statusId);

    @Modifying(clearAutomatically = true)
    @Query(
            """
            UPDATE Task t SET t.status.id = :targetStatusId
            WHERE t.project.id = :projectId AND t.status.id = :sourceStatusId AND t.deleted = false
            """)
    int reassignTasksStatus(
            @Param("projectId") Long projectId,
            @Param("sourceStatusId") Long sourceStatusId,
            @Param("targetStatusId") Long targetStatusId);
}
