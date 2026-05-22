-- Gắn độ ưu tiên dự án (lookup project_priorities đã seed ở V2)

ALTER TABLE projects
    ADD COLUMN priority_id BIGINT REFERENCES project_priorities (id);

UPDATE projects
SET priority_id = (SELECT id FROM project_priorities WHERE name = 'Medium' LIMIT 1)
WHERE priority_id IS NULL;

ALTER TABLE projects
    ALTER COLUMN priority_id SET NOT NULL;

CREATE INDEX idx_projects_priority_id ON projects (priority_id);
