//Importing modules 
const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Create a connection to the database 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: "mydb"
});

// open the MySQL connection 
connection.connect(error => {
    if (error) {
        console.log("A error has been occurred "
            + "while connecting to database.");
        throw error;
    }

    //If Everything goes correct, Then start Express Server 
    app.listen(PORT, () => {
        console.log("Database connection is Ready and "
            + "Server is Listening on Port ", PORT);
    })
});

// Define route handler for enabling a course
app.put('/courses/:id/enable/:userId', (req, res) => {
    const courseId = req.params.id; // Extract courseId from request parameters
    const userId = req.params.userId; // Extract userId from request parameters

    // Check if course exists

    const doesCourseExistPromise = does_course_exist(courseId)

    // Check if the user is an admin

    const isAdminPromise = is_admin(userId)

    Promise.all([doesCourseExistPromise, isAdminPromise]).then((values) => {

        doesCourseExist = values[0]
        isAdmin = values[1]

        if (!isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' }); // Send 403 Forbidden if user is not authorized
        }

        if (!doesCourseExist) {
            return res.status(403).json({ error: 'Course does not exist' }); // Send 403 Forbidden if course does not exist 
        }

        // Main SQL query to update the database
        connection.query('UPDATE courses SET isAvailable = 1 WHERE CourseID = ?', [courseId], (updateError, updateResults) => {
            if (updateError) {
                console.error('Error enabling course:', updateError);
                return res.status(500).json({ error: 'An error occurred while enabling the course' }); // Send 500 Internal Server Error if there's an SQL error
            }

            res.json({ message: 'Course enabled successfully' }); // Confirmation if the course is enabled successfully
        });
    })
        .catch((error) => {
            return res.status(500).json({ error: error }); // Send 500 Internal Server Error if there's an SQL error
        });
});

// Define route handler for disabling a course
app.put('/courses/:id/disable/:userId', (req, res) => {
    const courseId = req.params.id; // Extract courseId from request parameters
    const userId = req.params.userId; // Extract userId from request parameters

    // Check if course exists

    const doesCourseExistPromise = does_course_exist(courseId)

    // Check if the user is an admin

    const isAdminPromise = is_admin(userId)

    Promise.all([doesCourseExistPromise, isAdminPromise]).then((values) => {

        doesCourseExist = values[0]
        isAdmin = values[1]
        if (!isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' }); // Send 403 Forbidden if user is not authorized
        }

        if (!doesCourseExist) {
            return res.status(403).json({ error: 'Course does not exist' }); // Send 403 Forbidden if course does not exist 
        }

        // Main SQL query to update the database
        connection.query('UPDATE courses SET isAvailable = 0 WHERE CourseID = ?', [courseId], (updateError, updateResults) => {
            if (updateError) {
                console.error('Error disabling course:', updateError);
                return res.status(500).json({ error: 'An error occurred while disabling the course' }); // Send 500 Internal Server Error if there's an SQL error
            }

            res.json({ message: 'Course disabled successfully' }); // Confirmation if the course is disabled successfully
        });
    })
        .catch((error) => {
            return res.status(500).json({ error: error }); // Send 500 Internal Server Error if there's an SQL error
        });
});

// Define route handler for assigning a course to a teacher
app.put('/courses/:id/assign_teacher/:teacherId/:userId', (req, res) => {
    const courseId = req.params.id; // Extract courseId from request parameters
    const teacherId = req.params.teacherId; // Exctract teacherId from request parameters
    const userId = req.params.userId; // Extract userId from request parameters   

    // Check if user that is being assigned has the role teacher via a promise
    const isTeacherPromise = is_teacher(teacherId)

    // Check that the current user is an admin via a promise
    const isAdminPromise = is_admin(userId)

    // Check if course exists

    const doesCourseExistPromise = does_course_exist(courseId)

    // Callback for all promises
    Promise.all([isTeacherPromise, isAdminPromise, doesCourseExistPromise]).then((values) => {
        isTeacher = values[0]
        isAdmin = values[1]
        doesCourseExist = values[2]

        if (!isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' }); // Send 403 Forbidden if user is not authorized
        }
        if (!isTeacher) {
            return res.status(403).json({ error: 'user is not a teacher' }); // Send 403 Forbidden if user is not authorized
        }

        if (!doesCourseExist) {
            return res.status(403).json({ error: 'Course does not exist' }); // Send 403 Forbidden if course does not exist 
        }

        connection.query('UPDATE courses SET TeacherID = ? WHERE CourseID = ?', [teacherId, courseId], (updateError, updateResults) => {
            if (updateError) {
                console.error('Error assigning teacher:', updateError);
                return res.status(500).json({ error: 'An error occurred while assigning teacher to the course' }); // Send 500 Internal Server Error if there's an SQL error
            }

            res.json({ message: 'Teacher assigned successfully' }); // Confirmation if the course is enabled successfully
        });
    }).catch((error) => {
        return res.status(500).json({ error: error }); // Send 500 Internal Server Error if there's an SQL error
    });

});

// Define route handler for listing available courses with course title and teacher's name
app.get('/courses', (req, res) => {
    // SQL query to retrieve available courses with teacher's name
    const query = `
        SELECT courses.Title, users.Name AS TeacherName 
        FROM courses 
        LEFT JOIN users ON courses.TeacherID = users.UserID 
        WHERE courses.isAvailable = 1;
    `;

    // Execute the SQL query
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching available courses:', error);
            return res.status(500).json({ error: 'An error occurred while fetching available courses' }); // Send 500 Internal Server Error if there's an SQL error
        }

        // Send the list of available courses with teacher's name as JSON response
        res.json(results);
    });
});

//Define route handler for enrolling students in a course 

app.put('/courses/:id/enrol_student/:userId', (req, res) => {
    const courseId = req.params.id; // Extract courseId from request parameters
    const userId = req.params.userId; // Extract userId from request parameters   

    // Check if the user is a student
    is_student(userId)
        .then((isStudent) => {
            if (!isStudent) {
                return res.status(403).json({ error: 'User is not a student' });
            }

            // Check if the record exists in the table
            connection.query('SELECT * FROM enrolments WHERE CourseID = ? AND UserID = ?', [courseId, userId], (selectError, selectResults) => {
                if (selectError) {
                    console.error('Error checking record:', selectError);
                    return res.status(500).json({ error: 'An error occurred while checking record' });
                }

                // If no record exists, insert the data
                if (selectResults.length === 0) {
                    connection.query('INSERT INTO enrolments (CourseID, UserID) VALUES (?, ?)', [courseId, userId], (insertError, insertResults) => {
                        if (insertError) {
                            console.error('Error inserting record:', insertError);
                            return res.status(500).json({ error: 'An error occurred while inserting record' });
                        }

                        res.json({ message: 'Student assigned successfully' });
                    });
                } else {
                    res.json({ message: 'Student is already enrolled' });
                }
            });
        })
        .catch((error) => {
            console.error('Error checking student status:', error);
            res.status(500).json({ error: 'An error occurred while checking student status' });
        });
});


//Define route handler for teacher to fail or pass a student
app.put('/courses/:id/set_grade/:studentId/:passed/:userId', (req, res) => {
    const courseId = req.params.id; // Extract courseId from request parameters
    const studentId = req.params.studentId; //Extract studentId from request parameters
    const passed = parseInt(req.params.passed); // Extract passed from request parameters
    const userId = req.params.userId; // Extract userId from request parameters   

    // Check if user that is being assigned has the role teacher via a promise
    const isTeacherPromise = is_teacher(userId)

    // Check if user that is being assigned has the role student via a promise
    const isStudentPromise = is_student(studentId)

    // Callback for all promises
    Promise.all([isTeacherPromise, isStudentPromise]).then((values) => {
        isTeacher = values[0]
        isStudent = values[1]

        if (!isTeacher) {
            return res.status(403).json({ error: 'Unauthorized' }); // Send 403 Forbidden if user is not authorized
        }

        if (!isStudent) {
            return res.status(403).json({ error: 'user is not a student' }); // Send 403 Forbidden if user is not authorized
        }

        // Checking if passed (0 or 1)
        if (!(passed === 0 || passed === 1)) {
            return res.status(403).json({ error: "passed should be 1 or 0" }) //Error that passed should be 1 or 0
        }

        connection.query('UPDATE enrolments SET Mark = ? WHERE CourseID = ? AND UserID = ?',
            [passed, courseId, studentId], (updateError, updateResults) => {
                if (updateError) {
                    console.error('Error assigning grade:', updateError);
                    return res.status(500).json({ error: 'An error occurred while assigning grade to the student' }); // Send 500 Internal Server Error if there's an SQL error
                }

                res.json({ message: 'Grade assigned successfully' }); // Confirmation if the grade is assigned successfully
            });
    }).catch((error) => {
        return res.status(500).json({ error: error }); // Send 500 Internal Server Error if there's an SQL error
    });

});


// Function to check if user is an admin, via Promise
function is_admin(userId) {
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
function is_teacher(userId) {
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
function is_student(userId) {
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

function does_course_exist(courseId) {
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