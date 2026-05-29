package com.example.pms.backend.repository;

import com.example.pms.backend.entity.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByWorkspaceIdAndDeletedFalseOrderByNameAsc(Long workspaceId);

    Optional<Project> findByIdAndWorkspaceIdAndDeletedFalse(Long id, Long workspaceId);

    @Query("""
            SELECT p FROM Project p
            JOIN FETCH p.workspace
            WHERE p.id = :id AND p.workspace.id = :workspaceId AND p.deleted = false
            """)
    Optional<Project> findRefByIdAndWorkspaceId(
            @Param("id") Long id, @Param("workspaceId") Long workspaceId);

    @Query("""
            SELECT p FROM Project p
            LEFT JOIN FETCH p.priority
            LEFT JOIN FETCH p.status
            LEFT JOIN FETCH p.workspace
            LEFT JOIN FETCH p.projectManager
            WHERE p.id = :id
              AND p.workspace.id = :workspaceId
              AND p.deleted = false
            """)
    Optional<Project> findByIdAndWorkspaceIdWithDetails(
            @Param("id") Long id, @Param("workspaceId") Long workspaceId);

    Optional<Project> findBySlugIgnoreCaseAndWorkspaceIdAndDeletedFalse(String slug, Long workspaceId);

    boolean existsByWorkspaceIdAndNameIgnoreCaseAndDeletedFalse(Long workspaceId, String name);

    boolean existsByCodeIgnoreCaseAndDeletedFalse(String code);

    boolean existsBySlugIgnoreCaseAndDeletedFalse(String slug);

    @Query("""
            SELECT p.code FROM Project p
            WHERE p.deleted = false AND LOWER(p.code) LIKE LOWER(CONCAT(:prefix, '%'))
            """)
    List<String> findExistingCodesByPrefix(@Param("prefix") String prefix);

    @Query("""
            SELECT p.slug FROM Project p
            WHERE p.deleted = false AND LOWER(p.slug) LIKE LOWER(CONCAT(:prefix, '%'))
            """)
    List<String> findExistingSlugsByPrefix(@Param("prefix") String prefix);

    @Query("""
            SELECT p, CASE WHEN LOWER(wr.roleName) = 'admin' THEN 'Admin' ELSE pr.roleName END
            FROM Project p
            LEFT JOIN FETCH p.priority
            LEFT JOIN FETCH p.status
            LEFT JOIN FETCH p.workspace
            LEFT JOIN FETCH p.projectManager
            JOIN WorkspaceMember wm ON wm.workspace.id = p.workspace.id AND wm.user.id = :userId
            JOIN wm.role wr
            LEFT JOIN ProjectMember pm ON pm.project.id = p.id AND pm.user.id = :userId
            LEFT JOIN pm.role pr
            WHERE p.id = :projectId
              AND p.workspace.id = :workspaceId
              AND p.deleted = false
              AND (pm.id IS NOT NULL OR LOWER(wr.roleName) = 'admin')
            """)
    Optional<Object[]> findByIdWithAccess(
            @Param("projectId") Long projectId,
            @Param("workspaceId") Long workspaceId,
            @Param("userId") Long userId);

    @Query("""
            SELECT DISTINCT p, CASE WHEN LOWER(wr.roleName) = 'admin' THEN 'Admin' ELSE pr.roleName END
            FROM Project p
            JOIN WorkspaceMember wm ON wm.workspace.id = p.workspace.id AND wm.user.id = :userId
            JOIN wm.role wr
            LEFT JOIN FETCH p.status
            LEFT JOIN FETCH p.priority
            LEFT JOIN FETCH p.workspace
            LEFT JOIN ProjectMember pm ON pm.project.id = p.id AND pm.user.id = :userId
            LEFT JOIN pm.role pr
            WHERE p.workspace.id = :workspaceId
              AND p.deleted = false
              AND (pm.id IS NOT NULL OR LOWER(wr.roleName) = 'admin')
            ORDER BY p.priority.weight DESC, p.name ASC
            """)
    List<Object[]> findVisibleProjectsWithMyRole(
            @Param("workspaceId") Long workspaceId, @Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Project p SET p.deleted = true
            WHERE p.id = :projectId AND p.workspace.id = :workspaceId AND p.deleted = false
            """)
    int softDeleteByIdAndWorkspaceId(
            @Param("projectId") Long projectId, @Param("workspaceId") Long workspaceId);

    @Query("""
            SELECT DISTINCT p FROM Project p
            LEFT JOIN FETCH p.status
            LEFT JOIN FETCH p.priority
            LEFT JOIN FETCH p.workspace
            WHERE p.workspace.id = :workspaceId
              AND p.deleted = false
              AND (
                EXISTS (
                  SELECT 1 FROM ProjectMember pm
                  WHERE pm.project.id = p.id AND pm.user.id = :userId
                )
                OR EXISTS (
                  SELECT 1 FROM WorkspaceMember wm
                  JOIN wm.role wr
                  WHERE wm.workspace.id = :workspaceId
                    AND wm.user.id = :userId
                    AND LOWER(wr.roleName) = 'admin'
                )
              )
            ORDER BY p.priority.weight DESC, p.name ASC
            """)
    List<Project> findVisibleByWorkspaceIdAndUserId(
            @Param("workspaceId") Long workspaceId, @Param("userId") Long userId);

    @Query("""
            SELECT COUNT(p) FROM Project p
            JOIN p.status s
            WHERE p.workspace.id = :workspaceId
              AND p.deleted = false
              AND LOWER(s.statusName) = 'active'
            """)
    long countActiveProjectsByWorkspaceId(@Param("workspaceId") Long workspaceId);
}
