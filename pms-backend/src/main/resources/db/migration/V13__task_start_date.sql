ALTER TABLE tasks ADD COLUMN start_date TIMESTAMPTZ;

COMMENT ON COLUMN tasks.start_date IS 'Ngày bắt đầu công việc (timeline/Gantt); null = dùng created_at';
