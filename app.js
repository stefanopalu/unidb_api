//Importing modules 
const express = require('express'); 
const mysql = require('mysql2'); 
  
const app = express(); 
const PORT = 3000; 

// Create a connection to the database 
const connection = mysql.createConnection({ 
  host: 'localhost', 
  user: 'root', 
  password: '25041945', 
  database: "mydb"        
}); 
  
// open the MySQL connection 
connection.connect(error => { 
    if (error){ 
        console.log("A error has been occurred "
            + "while connecting to database.");         
        throw error; 
    } 
      
    //If Everything goes correct, Then start Express Server 
    app.listen(PORT, ()=>{ 
        console.log("Database connection is Ready and "
             + "Server is Listening on Port ", PORT); 
    }) 
});

// Define route handler for enabling a course
app.put('/courses/:id/enable/:userId', (req, res) => {
    const courseId = req.params.id; // Extract courseId from request parameters
    const userId = req.params.userId; // Extract userId from request parameters

    // Check if the user is an admin
    is_admin(userId)
        .then((isAdmin) => {
            if (!isAdmin) {
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
        })
        .catch((error) => {
            return res.status(500).json({ error: error }); // Send 500 Internal Server Error if there's an SQL error
        });
});

// Define route handler for disabling a course
app.put('/courses/:id/disable/:userId', (req, res) => {
    const courseId = req.params.id; // Extract courseId from request parameters
    const userId = req.params.userId; // Extract userId from request parameters

    // Check if the user is an admin
    is_admin(userId)
        .then((isAdmin) => {
            if (!isAdmin) {
                return res.status(403).json({ error: 'Unauthorized' }); // Send 403 Forbidden if user is not authorized
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
    const teacherId = req.params.teacherId // Exctract teacherId from request parameters
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

// Define route handler for listing available courses with course title and teacher's name
app.get('/courses', (req, res) => {
    // SQL query to retrieve available courses with teacher's name
    const query = `
        SELECT courses.Title, users.Name AS TeacherName 
        FROM courses 
        JOIN users ON courses.TeacherID = users.UserID 
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
                reject('An error occurred while fetching user details');
            }
            if (results.length === 0) {
                resolve(false); // User is not a student
            } else {
                resolve(true); // User is a student
            }
        });
    });
}