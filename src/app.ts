import express from "express"; // Import the Express framework
import { connectToDatabase } from "./utils/db"; // Import the function to connect to the database
import {
  loadUsersHandler,
  deleteAllUsersHandler,
  deleteUserByIdHandler,
  getUserByIdHandler,
  createUserHandler,
} from "./controllers/userController"; // Import user-related route handlers

// Create an Express application
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Define a simple root route to check if the server is running
app.get("/", (req, res) => {
  res.send("Hello, I am fine!");
});

// Define routes for user-related operations
app.get("/load", loadUsersHandler); // Route to load users and their data
app.delete("/users", deleteAllUsersHandler); // Route to delete all users
app.delete("/users/:userId", deleteUserByIdHandler); // Route to delete a specific user by ID
app.get("/users/:userId", getUserByIdHandler); // Route to fetch a specific user by ID
app.put("/users", createUserHandler); // Route to create a new user

// Function to start the server and connect to the database
const startServer = async () => {
  try {
    // Connect to the MongoDB database
    await connectToDatabase();
    // Start the Express server on port 3000
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    // Log an error if the server fails to start or the database connection fails
    console.error("Failed to start the server:", error);
  }
};

// Call the function to start the server
startServer();
