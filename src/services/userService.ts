// src/services/userService.ts
import { getDb } from "../utils/db";
import { User } from "../models/user";

export const loadUsers = async () => {
  const db = getDb();
  const usersCollection = db.collection<User>("users");
  const postsCollection = db.collection("posts");
  const commentsCollection = db.collection("comments");

  // Clear existing data (optional)
  await usersCollection.deleteMany({});
  await postsCollection.deleteMany({});
  await commentsCollection.deleteMany({});

  // Fetch users
  const usersResponse = await fetch(
    "https://jsonplaceholder.typicode.com/users"
  );
  const users: User[] = await usersResponse.json();

  for (const user of users) {
    // Insert user
    await usersCollection.insertOne(user);
    console.log(`Inserted user: ${user.name}`);

    // Fetch posts for the user
    const postsResponse = await fetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${user.id}`
    );
    const posts = await postsResponse.json();

    for (const post of posts) {
      // Insert post
      await postsCollection.insertOne(post);
      console.log(`Inserted post: ${post.title}`);

      // Fetch comments for the post
      const commentsResponse = await fetch(
        `https://jsonplaceholder.typicode.com/comments?postId=${post.id}`
      );
      const comments = await commentsResponse.json();

      for (const comment of comments) {
        // Insert comment
        await commentsCollection.insertOne(comment);
        console.log(`Inserted comment: ${comment.name}`);
      }
    }
  }
};

export const deleteAllUsers = async () => {
  const db = getDb();
  await db.collection("users").deleteMany({});
  await db.collection("posts").deleteMany({});
  await db.collection("comments").deleteMany({});
};

export const deleteUserById = async (userId: number) => {
  const db = getDb();
  await db.collection("users").deleteOne({ id: userId });
  await db.collection("posts").deleteMany({ userId });
  await db.collection("comments").deleteMany({
    postId: {
      $in: await db
        .collection("posts")
        .find({ userId })
        .map((post) => post.id)
        .toArray(),
    },
  });
};

export const getUserById = async (userId: number) => {
  const db = getDb();
  const user = await db.collection("users").findOne({ id: userId });
  const posts = await db.collection("posts").find({ userId }).toArray();
  const comments = await db
    .collection("comments")
    .find({ postId: { $in: posts.map((post) => post.id) } })
    .toArray();

  return {
    ...user,
    posts: posts.map((post) => ({
      ...post,
      comments: comments.filter((comment) => comment.postId === post.id),
    })),
  };
};

export const createUser = async (user: User) => {
  const db = getDb();
  const existingUser = await db.collection("users").findOne({ id: user.id });
  if (existingUser) {
    throw new Error("User already exists");
  }
  await db.collection("users").insertOne(user);
};
