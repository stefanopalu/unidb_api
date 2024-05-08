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
