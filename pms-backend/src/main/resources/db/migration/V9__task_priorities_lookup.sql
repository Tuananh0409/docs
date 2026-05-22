-- Task priority lookup (giống project_priorities)

CREATE TABLE task_priorities (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(50)  NOT NULL,
    weight     INT          NOT NULL DEFAULT 0,
    color_code VARCHAR(20),
    CONSTRAINT uq_task_priorities_name UNIQUE (name)
);

INSERT INTO task_priorities (name, weight, color_code) VALUES
    ('Highest', 4, '#E54937'),
    ('High',    3, '#E54937'),
    ('Low',     2, '#4C9AFF'),
    ('Lowest',  1, '#4C9AFF');

ALTER TABLE tasks ADD COLUMN priority_id BIGINT REFERENCES task_priorities (id);

UPDATE tasks
SET priority_id = (
    SELECT tp.id
    FROM task_priorities tp
    WHERE LOWER(tp.name) = LOWER(tasks.priority)
)
WHERE priority IS NOT NULL;

UPDATE tasks
SET priority_id = (SELECT id FROM task_priorities WHERE name = 'Low' LIMIT 1)
WHERE priority_id IS NULL;

ALTER TABLE tasks ALTER COLUMN priority_id SET NOT NULL;

ALTER TABLE tasks DROP COLUMN priority;
