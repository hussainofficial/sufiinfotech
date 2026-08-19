ALTER TABLE exams
  ADD COLUMN negative_marks DECIMAL(4,2) NOT NULL DEFAULT 0 AFTER pass_marks;

CREATE TABLE IF NOT EXISTS exam_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  student_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment (exam_id, student_id)
);

ALTER TABLE certificates
  ADD COLUMN grade VARCHAR(5) AFTER certificate_code;
