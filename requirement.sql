SELECT * FROM courses;
SELECT * FROM users;
SELECT * FROM enrolments;
SELECT * FROM roles;
-- 1) Admins should be able to enable or disable the availability of a course
UPDATE courses SET isAvailable = 1 WHERE CourseID = 5;
UPDATE courses SET isAvailable = 0 WHERE CourseID = 5;
-- 2) Admins should be able to assign one or more courses to a teacher
-- Find all users that are teachers
SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Teacher";
UPDATE courses SET TeacherID = 3 WHERE CourseID = 5;
-- 3) Students can browse and list all the available courses and see the course title and course
-- teacher’s name.
SELECT * FROM courses LEFT JOIN users ON users.UserID = courses.TeacherID WHERE isAvailable = 1;
-- 4) Students can enrol in a course. Students should not be able to enrol in a course more than
-- once at each time.
-- Find all users that are students
SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Student";
SELECT * FROM enrolments WHERE CourseID = 5 AND UserID = 10;
INSERT INTO enrolments (CourseID, UserID) VALUES (5,10);
-- 5) Teachers can fail or pass a student.
UPDATE enrolments SET Mark = 1 WHERE CourseID =5 AND UserID = 10;
-- 6) Access control for Admins, Teachers and Students: Ensure only the authorized access can
-- perform an action. For example, only teachers can pass/fail a student.
-- Is user a student?
SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Student" AND UserID = 10;
-- Is user an admin?
SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Admin" AND UserID = 10;
-- Is user a teacher?
SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Teacher" AND UserID = 10;

