-- 1) Admins should be able to enable or disable the availability of a course
-- Confirm if the course exist and the user is an admin
SELECT * FROM courses WHERE CourseID = ?
SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Admin" AND UserID = ?

-- Update the course table
UPDATE courses SET isAvailable = 1 WHERE CourseID = ?;
UPDATE courses SET isAvailable = 0 WHERE CourseID = ?;

-- 2) Admins should be able to assign one or more courses to a teacher
-- Confirm if the course exist, if the teacher id is valid and if the user is an admin
SELECT * FROM courses WHERE CourseID = ?
SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Admin" AND UserID = ?
SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Teacher" AND UserID = ?

-- Update the course table
UPDATE courses SET TeacherID = ? WHERE CourseID = ?


-- 3) Students can browse and list all the available courses and see the course title and course teacher’s name.
SELECT courses.Title, users.Name AS TeacherName 
FROM courses 
LEFT JOIN users ON courses.TeacherID = users.UserID 
WHERE courses.isAvailable = 1;


-- 4) Students can enrol in a course. Students should not be able to enrol in a course more than once at each time.
-- Confirm if the course is available and the user is a student
SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Student" AND UserID = ?SELECT 1, 10
SELECT isAvailable FROM courses WHERE courseId = ?

-- Check if the record is already in the enrolments table
SELECT * FROM enrolments WHERE CourseID = ? AND UserID = ?

-- Update the enrolments table
INSERT INTO enrolments (CourseID, UserID) VALUES (?, ?)


-- 5) Teachers can fail or pass a student.
-- Confirm if the course exist, the student ID is valid and if the user is the teacher assigned to the course
SELECT * FROM courses WHERE CourseID = ?
SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Student" AND UserID = ?
SELECT TeacherID FROM courses WHERE CourseID = ? AND TeacherID = ?

-- Update the enrolments table
UPDATE enrolments SET Mark = ? WHERE CourseID = ? AND UserID = ?
