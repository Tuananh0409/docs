package com.example.pms.backend.repository;

import com.example.pms.backend.entity.WorkspaceMember;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {

    Optional<WorkspaceMember> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);

    @Query("""
            SELECT wm FROM WorkspaceMember wm
            JOIN FETCH wm.role
            JOIN FETCH wm.workspace w
            JOIN FETCH w.owner
            WHERE wm.workspace.id = :workspaceId AND wm.user.id = :userId
            """)
    Optional<WorkspaceMember> findByWorkspaceIdAndUserIdWithDetails(
            @Param("workspaceId") Long workspaceId, @Param("userId") Long userId);

    @Query("""
            SELECT wm FROM WorkspaceMember wm
            JOIN FETCH wm.user
            JOIN FETCH wm.role
            WHERE wm.workspace.id = :workspaceId
            ORDER BY wm.joinedAt ASC
            """)
    List<WorkspaceMember> findByWorkspaceIdWithDetails(@Param("workspaceId") Long workspaceId);

    @Query("""
            SELECT wm FROM WorkspaceMember wm
            JOIN FETCH wm.user
            JOIN FETCH wm.role
            WHERE wm.workspace.id = :workspaceId AND wm.user.id = :userId
            """)
    Optional<WorkspaceMember> findByWorkspaceIdAndUserIdWithUserAndRole(
            @Param("workspaceId") Long workspaceId, @Param("userId") Long userId);

    @Query("""
            SELECT wm.workspace.id FROM WorkspaceMember wm
            JOIN wm.role r
            WHERE wm.user.id = :userId
              AND LOWER(r.roleName) = 'admin'
              AND wm.workspace.id IN :workspaceIds
            """)
    Set<Long> findAdminWorkspaceIdsByUserIdAndWorkspaceIdIn(
            @Param("userId") Long userId, @Param("workspaceIds") Collection<Long> workspaceIds);

    @Query("""
            SELECT wm.user.id FROM WorkspaceMember wm
            JOIN wm.role r
            WHERE wm.workspace.id = :workspaceId AND LOWER(r.roleName) = 'admin'
            """)
    Set<Long> findAdminUserIdsByWorkspaceId(@Param("workspaceId") Long workspaceId);

    @Query("""
            SELECT CASE WHEN COUNT(wm) > 0 THEN true ELSE false END
            FROM WorkspaceMember wm
            JOIN wm.role r
            WHERE wm.workspace.id = :workspaceId
              AND wm.user.id = :userId
              AND LOWER(r.roleName) = 'admin'
            """)
    boolean isWorkspaceAdmin(@Param("workspaceId") Long workspaceId, @Param("userId") Long userId);

    boolean existsByWorkspaceIdAndUserId(Long workspaceId, Long userId);

    List<WorkspaceMember> findByWorkspaceId(Long workspaceId);

    @Query("""
            SELECT COUNT(m) FROM WorkspaceMember m
            JOIN m.role r
            WHERE m.workspace.id = :workspaceId AND r.roleName = 'Admin'
            """)
    long countAdminsByWorkspaceId(@Param("workspaceId") Long workspaceId);
}
