package com.example.pms.backend.repository;

import com.example.pms.backend.entity.WorkspaceInvitation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation, Long> {

    Optional<WorkspaceInvitation> findByToken(String token);

    List<WorkspaceInvitation> findByWorkspaceIdAndStatus(Long workspaceId, String status);

    @Query("""
            SELECT wi FROM WorkspaceInvitation wi
            JOIN FETCH wi.role
            JOIN FETCH wi.inviter
            WHERE wi.workspace.id = :workspaceId AND wi.status = :status
            ORDER BY wi.createdAt DESC
            """)
    List<WorkspaceInvitation> findByWorkspaceIdAndStatusWithDetails(
            @Param("workspaceId") Long workspaceId, @Param("status") String status);

    List<WorkspaceInvitation> findByEmailIgnoreCaseAndStatusOrderByCreatedAtDesc(String email, String status);

    @Query("""
            SELECT wi FROM WorkspaceInvitation wi
            JOIN FETCH wi.workspace w
            JOIN FETCH wi.role r
            JOIN FETCH wi.inviter i
            WHERE wi.token = :token
            """)
    Optional<WorkspaceInvitation> findByTokenWithDetails(@Param("token") String token);

    @Query("""
            SELECT wi FROM WorkspaceInvitation wi
            JOIN FETCH wi.workspace w
            JOIN FETCH wi.role r
            JOIN FETCH wi.inviter i
            WHERE LOWER(wi.email) = LOWER(:email)
              AND wi.status = :status
            ORDER BY wi.createdAt DESC
            """)
    List<WorkspaceInvitation> findPendingWithDetailsByEmail(
            @Param("email") String email, @Param("status") String status);

    boolean existsByWorkspaceIdAndEmailIgnoreCaseAndStatus(Long workspaceId, String email, String status);
}
