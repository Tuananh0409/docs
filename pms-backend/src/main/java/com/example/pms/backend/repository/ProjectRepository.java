package com.example.pms.backend.repository;

import com.example.pms.backend.entity.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByWorkspaceIdAndDeletedFalseOrderByNameAsc(Long workspaceId);

    Optional<Project> findByIdAndWorkspaceIdAndDeletedFalse(Long id, Long workspaceId);

    @Query("""
            SELECT p FROM Project p
            LEFT JOIN FETCH p.priority
            LEFT JOIN FETCH p.status
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
            SELECT DISTINCT p FROM Project p
            LEFT JOIN FETCH p.status
            LEFT JOIN FETCH p.priority
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
