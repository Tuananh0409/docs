-- Reporter tách khỏi created_by (giống Jira).
ALTER TABLE tasks ADD COLUMN reporter_id BIGINT;

UPDATE tasks SET reporter_id = created_by WHERE reporter_id IS NULL;

ALTER TABLE tasks ALTER COLUMN reporter_id SET NOT NULL;

ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_reporter
        FOREIGN KEY (reporter_id) REFERENCES users (id);
