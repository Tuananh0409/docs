package com.example.pms.backend.repository;

import com.example.pms.backend.entity.Workspace;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {

    boolean existsByNameIgnoreCaseAndDeletedFalse(String name);

    boolean existsByNameIgnoreCaseAndDeletedFalseAndIdNot(String name, Long id);

    boolean existsByCodeIgnoreCaseAndDeletedFalse(String code);

    boolean existsBySlugIgnoreCaseAndDeletedFalse(String slug);

    /** Trùng trên mọi bản ghi (kể cả đã xóa mềm) — khớp UNIQUE trong DB. */
    boolean existsByNameIgnoreCase(String name);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsBySlugIgnoreCase(String slug);

    @Query("""
            SELECT w.code FROM Workspace w
            WHERE LOWER(w.code) LIKE LOWER(CONCAT(:prefix, '%'))
            """)
    List<String> findExistingCodesByPrefix(@Param("prefix") String prefix);

    @Query("""
            SELECT w.slug FROM Workspace w
            WHERE LOWER(w.slug) LIKE LOWER(CONCAT(:prefix, '%'))
            """)
    List<String> findExistingSlugsByPrefix(@Param("prefix") String prefix);

    Optional<Workspace> findByIdAndDeletedFalse(Long id);

    @Query("""
            SELECT w FROM Workspace w
            LEFT JOIN FETCH w.owner
            WHERE w.id = :id AND w.deleted = false
            """)
    Optional<Workspace> findByIdAndDeletedFalseWithOwner(@Param("id") Long id);

    Optional<Workspace> findBySlugIgnoreCaseAndDeletedFalse(String slug);

    @Query("""
            SELECT w, r.roleName FROM Workspace w
            LEFT JOIN FETCH w.owner
            JOIN WorkspaceMember m ON m.workspace.id = w.id AND m.user.id = :userId
            JOIN m.role r
            WHERE w.deleted = false
            ORDER BY w.createdAt DESC
            """)
    List<Object[]> findAllAccessibleWithMyRoleByUserId(@Param("userId") Long userId);

    @Query("""
            SELECT w FROM Workspace w
            LEFT JOIN FETCH w.owner
            WHERE w.deleted = false
              AND EXISTS (
                  SELECT 1 FROM WorkspaceMember m
                  WHERE m.workspace = w AND m.user.id = :userId
              )
            ORDER BY w.createdAt DESC
            """)
    List<Workspace> findAllAccessibleByUserId(@Param("userId") Long userId);
}
