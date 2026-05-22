package com.example.pms.backend.repository;

import com.example.pms.backend.entity.TaskAttachment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskAttachmentRepository extends JpaRepository<TaskAttachment, Long> {

    @Query("""
            SELECT a FROM TaskAttachment a
            JOIN FETCH a.uploadedBy
            WHERE a.task.id = :taskId
            ORDER BY a.createdAt DESC
            """)
    List<TaskAttachment> findByTaskIdWithUploader(@Param("taskId") Long taskId);

    Optional<TaskAttachment> findByIdAndTaskId(Long id, Long taskId);
}
