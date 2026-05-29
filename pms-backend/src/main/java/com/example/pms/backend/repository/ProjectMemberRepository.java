package com.example.pms.backend.repository;

import com.example.pms.backend.entity.ProjectMember;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    @Query("SELECT pm.user.id FROM ProjectMember pm WHERE pm.project.id = :projectId")
    Set<Long> findUserIdsByProjectId(@Param("projectId") Long projectId);

    @Query("""
            SELECT pm.project.id FROM ProjectMember pm
            WHERE pm.user.id = :userId AND pm.project.id IN :projectIds
            """)
    Set<Long> findProjectIdsByUserIdAndProjectIdIn(
            @Param("userId") Long userId, @Param("projectIds") Collection<Long> projectIds);

    List<ProjectMember> findByProjectIdOrderByJoinedAtAsc(Long projectId);

    @Query("""
            SELECT pm FROM ProjectMember pm
            JOIN FETCH pm.user
            JOIN FETCH pm.role
            WHERE pm.project.id = :projectId
            ORDER BY pm.joinedAt ASC
            """)
    List<ProjectMember> findByProjectIdWithDetailsOrderByJoinedAtAsc(@Param("projectId") Long projectId);

    @Query("""
            SELECT pm.project.id, r.roleName FROM ProjectMember pm
            JOIN pm.role r
            WHERE pm.user.id = :userId AND pm.project.id IN :projectIds
            """)
    List<Object[]> findRoleNamesByUserIdAndProjectIdIn(
            @Param("userId") Long userId, @Param("projectIds") Collection<Long> projectIds);

    @Query("""
            SELECT CASE WHEN LOWER(wr.roleName) = 'admin' THEN 'Admin' ELSE pr.roleName END
            FROM WorkspaceMember wm
            JOIN wm.role wr
            LEFT JOIN ProjectMember pm ON pm.project.id = :projectId AND pm.user.id = wm.user.id
            LEFT JOIN pm.role pr
            WHERE wm.workspace.id = :workspaceId AND wm.user.id = :userId
            """)
    Optional<String> findEffectiveProjectRoleName(
            @Param("workspaceId") Long workspaceId,
            @Param("projectId") Long projectId,
            @Param("userId") Long userId);

    @Query("""
            SELECT COUNT(pm) FROM ProjectMember pm
            JOIN pm.role r
            WHERE pm.project.id = :projectId AND LOWER(r.roleName) = 'pm'
            """)
    long countPmByProjectId(@Param("projectId") Long projectId);
}
