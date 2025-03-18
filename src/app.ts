// src/app.ts
import express from "express";
import { connectToDatabase } from "./utils/db";
import {
  loadUsersHandler,
  deleteAllUsersHandler,
  deleteUserByIdHandler,
  getUserByIdHandler,
  createUserHandler,
} from "./controllers/userController";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, Vercel!");
});
app.get("/load", loadUsersHandler);
app.delete("/users", deleteAllUsersHandler);
app.delete("/users/:userId", deleteUserByIdHandler);
app.get("/users/:userId", getUserByIdHandler);
app.put("/users", createUserHandler);

// Start the server immediately
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Connect to MongoDB in the background
connectToDatabase()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
