import { Request, Response } from "express";
import {
  loadUsers,
  deleteAllUsers,
  deleteUserById,
  getUserById,
  createUser,
} from "../services/userService";
import { getDb } from "../utils/db";

// Handler to load users and related data (posts and comments) from the database
export const loadUsersHandler = async (req: Request, res: Response) => {
  try {
    // Load users into the database (assuming this function populates the users collection)
    await loadUsers();
    const db = getDb();

    // Fetch all users, posts, and comments from their respective collections
    const users = await db.collection("users").find().toArray();
    const posts = await db.collection("posts").find().toArray();
    const comments = await db.collection("comments").find().toArray();

    // Respond with the fetched data and a success message
    res.status(200).json({
      message: "Data loaded successfully",
      users,
      posts,
      comments,
    });
  } catch (error) {
    // Handle errors and respond with an appropriate error message
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

// Handler to delete all users from the database
export const deleteAllUsersHandler = async (req: Request, res: Response) => {
  try {
    // Call the service function to delete all users
    await deleteAllUsers();
    // Respond with a 200 status code indicating success
    res.status(200).send();
  } catch (error) {
    // Handle errors and respond with an appropriate error message
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
};

// Handler to delete a specific user by their ID
export const deleteUserByIdHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Extract the user ID from the request parameters and convert it to a number
    const userId = parseInt(req.params.userId, 10);
    const db = getDb();
    const usersCollection = db.collection("users");

    // Attempt to delete the user with the specified ID
    const result = await usersCollection.deleteOne({ id: userId });

    // If no user was deleted, respond with a 404 status code and a "not found" message
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Respond with a success message if the user was deleted
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    // Log the error and respond with a 500 status code and an error message
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Handler to fetch a specific user by their ID
export const getUserByIdHandler = async (req: Request, res: Response) => {
  try {
    // Extract the user ID from the request parameters and convert it to a number
    const userId = parseInt(req.params.userId, 10);
    // Fetch the user from the database using the service function
    const user = await getUserById(userId);
    // Respond with the fetched user data
    res.status(200).json(user);
  } catch (error) {
    // Handle errors and respond with an appropriate error message
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
};

// Handler to create a new user
export const createUserHandler = async (req: Request, res: Response) => {
  try {
    // Extract the user data from the request body
    const user = req.body;
    // Call the service function to create the user in the database
    await createUser(user);
    // Respond with a 201 status code indicating successful creation
    res.status(201).send();
  } catch (error) {
    // Handle errors and respond with an appropriate error message
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
};
