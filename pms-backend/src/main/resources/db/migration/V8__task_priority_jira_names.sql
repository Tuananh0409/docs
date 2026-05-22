-- Task priorities: Jira-style Highest / High / Low / Lowest

UPDATE tasks SET priority = 'Highest' WHERE LOWER(priority) = 'urgent';
UPDATE tasks SET priority = 'Low' WHERE LOWER(priority) = 'medium';
UPDATE tasks SET priority = 'Lowest' WHERE LOWER(priority) = 'low';

ALTER TABLE tasks ALTER COLUMN priority SET DEFAULT 'Low';
