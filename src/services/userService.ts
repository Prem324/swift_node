import { getDb } from "../utils/db";
import { User } from "../models/user";

// Load users, posts, and comments from JSONPlaceholder and insert into MongoDB (if not already present)
export const loadUsers = async () => {
  const db = getDb();
  const usersCollection = db.collection("users");
  const postsCollection = db.collection("posts");
  const commentsCollection = db.collection("comments");

  // Fetch users from JSONPlaceholder
  const usersResponse = await fetch(
    "https://jsonplaceholder.typicode.com/users"
  );
  const users: User[] = await usersResponse.json();

  for (const user of users) {
    // Check if the user already exists in MongoDB
    const existingUser = await usersCollection.findOne({ id: user.id });
    if (!existingUser) {
      // Insert the user into MongoDB
      await usersCollection.insertOne(user);

      // Fetch and insert posts for the user
      const postsResponse = await fetch(
        `https://jsonplaceholder.typicode.com/posts?userId=${user.id}`
      );
      const posts = await postsResponse.json();
      await postsCollection.insertMany(posts);

      // Fetch and insert comments for each post
      for (const post of posts) {
        const commentsResponse = await fetch(
          `https://jsonplaceholder.typicode.com/comments?postId=${post.id}`
        );
        const comments = await commentsResponse.json();
        await commentsCollection.insertMany(comments);
      }

      console.log(
        `Data for user ${user.id} fetched from JSONPlaceholder and inserted into MongoDB.`
      );
    } else {
      console.log(
        `Data for user ${user.id} already exists in MongoDB. Skipping fetch.`
      );
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
