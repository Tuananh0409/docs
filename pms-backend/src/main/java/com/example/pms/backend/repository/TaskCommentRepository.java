package com.example.pms.backend.repository;

import com.example.pms.backend.entity.TaskComment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskCommentRepository extends JpaRepository<TaskComment, Long> {

    @Query("""
            SELECT c FROM TaskComment c
            JOIN FETCH c.user
            WHERE c.task.id = :taskId
            ORDER BY c.createdAt ASC
            """)
    List<TaskComment> findByTaskIdWithUser(@Param("taskId") Long taskId);

    Optional<TaskComment> findByIdAndTaskId(Long id, Long taskId);
}
