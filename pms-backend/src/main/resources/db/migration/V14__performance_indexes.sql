-- Composite / missing indexes for hot query paths

CREATE INDEX IF NOT EXISTS idx_projects_workspace_deleted
    ON projects (workspace_id, is_deleted);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id
    ON project_members (project_id);

CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id
    ON task_assignees (task_id);

CREATE INDEX IF NOT EXISTS idx_tasks_project_deleted
    ON tasks (project_id, is_deleted);
