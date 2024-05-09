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
    database: "final_project"
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

    // Authorisation: SQL query to find the user's roleID from the database
    connection.query('SELECT RoleID FROM Users WHERE UserID = ?', [userId], (error, results) => {
        if (error) {
            console.error('Error fetching user details:', error);
            return res.status(500).json({ error: 'An error occurred while fetching user details' }); // Send 500 Internal Server Error if there's an SQL error
        }

        // Check if the user exists
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' }); // Send 404 Not Found if user does not exist
        }

        // Extract user's RoleID from the query results
        const roleId = results[0].RoleID;

        // Check if the user is authorized (RoleID is 1 for admin)
        if (roleId !== 1) {
            return res.status(403).json({ error: 'Unauthorized' }); // Send 403 Forbidden if user is not authorized
        }

        // Main SQL query to update the database
        connection.query('UPDATE courses SET isAvailable = 1 WHERE CourseID = ?', [courseId], (updateError, updateResults) => {
            if (updateError) {
                console.error('Error enabling course:', updateError);
                return res.status(500).json({ error: 'An error occurred while enabling the course' }); // Send 500 Internal Server Error if there's an SQL error
            }

            res.json({ message: 'Course enabled successfully' }); // Confirmation if the course is enabled successfully
        });
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

    // Callback for all promises
    Promise.all([isTeacherPromise, isAdminPromise]).then((values) => {
        console.log(values)
        isTeacher = values[0]
        isAdmin = values[1]
        if (!isAdmin) {
            return res.status(403).json({ error: 'Unauthorized' }); // Send 403 Forbidden if user is not authorized
        }
        if (!isTeacher) {
            return res.status(403).json({ error: 'user is not a teacher' }); // Send 403 Forbidden if user is not authorized
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




//Define route handler for enrolling students in a course 

app.put('/courses/:id/assign_student/:userId', (req, res) => {
    const courseId = req.params.id; // Extract courseId from request parameters
    const userId = req.params.userId; // Extract userId from request parameters   
    
    // Check if user that is being assigned has the role student via a promise
    const isStudentPromise = is_student(userId)
    

    // Callback for all promises
    Promise.all([isStudentPromise]).then((values) => {
        console.log(values)
        isStudent = values[0]

        if (!isStudent) {
            return res.status(403).json({ error: 'user is not a student' }); // Send 403 Forbidden if user is not authorized
        }
        connection.query(`INSERT INTO enrolments (CourseID, UserID)
        SELECT 1, 10
        FROM enrolments
        WHERE NOT EXISTS (
            SELECT *
            FROM enrolments
            WHERE CourseID = 1 AND UserID = 10
            LIMIT 1
        ); `, [courseId, userId, courseId, userId], (updateError, updateResults) => {
            if (updateError) {
                console.error('Error assigning student:', updateError);
                return res.status(500).json({ error: 'An error occurred while assigning student to the course' }); // Send 500 Internal Server Error if there's an SQL error
            }

            res.json({ message: 'Student assigned successfully' }); // Confirmation if the course is enabled successfully
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

