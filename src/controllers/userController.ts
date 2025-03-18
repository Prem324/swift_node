// src/controllers/userController.ts
import { Request, Response } from "express";
import {
  loadUsers,
  deleteAllUsers,
  deleteUserById,
  getUserById,
  createUser,
} from "../services/userService";
import { getDb } from "../utils/db";

export const loadUsersHandler = async (req: Request, res: Response) => {
  try {
    await loadUsers();
    const db = getDb();

    // Fetch users, posts, and comments from MongoDB
    const users = await db.collection("users").find().toArray();
    const posts = await db.collection("posts").find().toArray();
    const comments = await db.collection("comments").find().toArray();

    res.status(200).json({
      message: "Data loaded successfully",
      users,
      posts,
      comments,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
};
export const deleteAllUsersHandler = async (req: Request, res: Response) => {
  try {
    await deleteAllUsers();
    res.status(200).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
};

export const deleteUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    await deleteUserById(userId);
    res.status(200).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
};

export const getUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const user = await getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
};

export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const user = req.body;
    await createUser(user);
    res.status(201).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send("An unknown error occurred");
    }
  }
};
