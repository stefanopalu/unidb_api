// Function to check if user is an admin, via Promise
function is_admin(connection, userId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Admin" AND UserID = ?', [userId], (error, results) => {
            if (error) {
                console.error('Error fetching user details:', error);
                reject('An error occurred while fetching user details')
            }
            if (results.length === 0) {
                resolve(false)
            } else {
                resolve(true)
            }
        });
    });
}

// Function to check if user is an teacher, via Promise
function is_teacher(connection, userId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Teacher" AND UserID = ?', [userId], (error, results) => {
            if (error) {
                console.error('Error fetching user details:', error);
                reject('An error occurred while fetching user details')
            }
            if (results.length === 0) {
                resolve(false)
            } else {
                resolve(true)
            }
        });
    });
}

// Function to check if user is a student, via Promise
function is_student(connection, userId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users JOIN roles ON roles.RoleID = users.RoleID WHERE Role = "Student" AND UserID = ?', [userId], (error, results) => {
            if (error) {
                console.error('Error fetching user details:', error);
                reject('An error occurred while fetching user details')
            }
            if (results.length === 0) {
                resolve(false)
            } else {
                resolve(true)
            }
        });
    });
}

// Function to check if course exists
function does_course_exist(connection, courseId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM courses WHERE CourseID = ?', [courseId], (error, results) => {
            if (error) {
                console.error('Error fetching course details:', error);
                reject('An error occurred while fetching course details')
            }
            if (results.length === 0) {
                resolve(false)
            } else {
                resolve(true)
            }
        });
    });
}

// Function to check if a course is available
function is_course_available(connection, courseId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT isAvailable FROM courses WHERE courseId = ?', [courseId], (error, results) => {
            if (error) {
                reject(error);
            } else if (results.length === 0) {
                resolve(false); // Course does not exist
            } else {
                resolve(results[0].isAvailable === 1); // Return true if course is available, otherwise false
            }
        });
    });
}


// Function to check if enrolment exists
function does_enrolment_exist(connection, courseId, studentId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM enrolments WHERE CourseID = ? AND UserID = ?', [courseId, studentId], (error, results) => {
            if (error) {
                console.error('Error fetching enrolment details:', error);
                reject('An error occurred while finding enrolment details')
            }
            if (results.length === 0) {
                resolve(false)
            } else {
                resolve(true)
            }
        });
    });
}

// Function to check if the teacher is the one assigned to the course
function is_assigned_teacher(connection, courseId, userId) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT TeacherID FROM courses WHERE CourseID = ? AND TeacherID = ?', [courseId, userId], (error, results) => {
            if (error) {
                console.error('Error fetching course details:', error);
                reject('An error occurred while fetching course details');
            }

            // If there are results, it means the provided userId is the assigned teacher
            if (results.length > 0) {
                resolve(true); // User is the assigned teacher
            } else {
                resolve(false); // User is not the assigned teacher
            }
        });
    });
}

module.exports = {
    is_admin,
    is_teacher,
    is_student,
    does_course_exist,
    is_course_available,
    does_enrolment_exist,
    is_assigned_teacher
};
