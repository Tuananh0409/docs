-- Bổ sung Medium (giữa High và Low), chỉnh lại weight 5 mức

INSERT INTO task_priorities (name, weight, color_code)
SELECT 'Medium', 3, '#E97F33'
WHERE NOT EXISTS (SELECT 1 FROM task_priorities WHERE name = 'Medium');

UPDATE task_priorities SET weight = 5, color_code = '#E54937' WHERE name = 'Highest';
UPDATE task_priorities SET weight = 4, color_code = '#E54937' WHERE name = 'High';
UPDATE task_priorities SET weight = 3, color_code = '#E97F33' WHERE name = 'Medium';
UPDATE task_priorities SET weight = 2, color_code = '#4C9AFF' WHERE name = 'Low';
UPDATE task_priorities SET weight = 1, color_code = '#4C9AFF' WHERE name = 'Lowest';
