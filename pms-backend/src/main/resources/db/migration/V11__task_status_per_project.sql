-- Kanban columns scoped per project (not global)

ALTER TABLE task_status
    ADD COLUMN IF NOT EXISTS project_id BIGINT REFERENCES projects (id);

-- Drop global unique on name before copying rows per project
ALTER TABLE task_status
    DROP CONSTRAINT IF EXISTS uq_task_status_name;

INSERT INTO task_status (status_name, position, color_code, project_id)
SELECT s.status_name, s.position, s.color_code, p.id
FROM projects p
         CROSS JOIN task_status s
WHERE p.is_deleted = false
  AND s.project_id IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM task_status existing
    WHERE existing.project_id = p.id
      AND lower(existing.status_name) = lower(s.status_name)
  );

UPDATE tasks t
SET status_id = ps.id
FROM task_status old, task_status ps
WHERE old.id = t.status_id
  AND ps.project_id = t.project_id
  AND ps.status_name = old.status_name
  AND ps.project_id IS NOT NULL
  AND old.project_id IS NULL
  AND t.is_deleted = false;

DELETE FROM task_status WHERE project_id IS NULL;

ALTER TABLE task_status
    ALTER COLUMN project_id SET NOT NULL;

ALTER TABLE task_status
    DROP CONSTRAINT IF EXISTS uq_task_status_project_name;

ALTER TABLE task_status
    ADD CONSTRAINT uq_task_status_project_name UNIQUE (project_id, status_name);

CREATE INDEX IF NOT EXISTS idx_task_status_project_id ON task_status (project_id);
