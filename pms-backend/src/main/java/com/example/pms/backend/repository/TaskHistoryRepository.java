package com.example.pms.backend.repository;

import com.example.pms.backend.entity.TaskHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {

    @Query("""
            SELECT h FROM TaskHistory h
            JOIN FETCH h.changedBy
            WHERE h.task.id = :taskId
            ORDER BY h.createdAt DESC
            """)
    List<TaskHistory> findByTaskIdWithUser(@Param("taskId") Long taskId);
}
