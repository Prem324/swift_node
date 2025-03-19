import { getDb } from "../utils/db";
import { User } from "../models/user";

// Function to load users and their associated posts and comments from JSONPlaceholder into MongoDB
export const loadUsers = async () => {
  const db = getDb();
  const usersCollection = db.collection("users");
  const postsCollection = db.collection("posts");
  const commentsCollection = db.collection("comments");

  // Fetch users from JSONPlaceholder API
  const usersResponse = await fetch(
    "https://jsonplaceholder.typicode.com/users"
  );
  const users: User[] = await usersResponse.json();

  // Iterate through each user and insert their data into MongoDB if it doesn't already exist
  for (const user of users) {
    const existingUser = await usersCollection.findOne({ id: user.id });
    if (!existingUser) {
      // Insert the user into the users collection
      await usersCollection.insertOne(user);

      // Fetch posts for the current user from JSONPlaceholder API
      const postsResponse = await fetch(
        `https://jsonplaceholder.typicode.com/posts?userId=${user.id}`
      );
      const posts = await postsResponse.json();
      await postsCollection.insertMany(posts);

      // Fetch comments for each post and insert them into the comments collection
      for (const post of posts) {
        const commentsResponse = await fetch(
          `https://jsonplaceholder.typicode.com/comments?postId=${post.id}`
        );
        const comments = await commentsResponse.json();
        await commentsCollection.insertMany(comments);
      }

      // Log success message after inserting user, posts, and comments
      console.log(
        `Data for user ${user.id} fetched from JSONPlaceholder and inserted into MongoDB.`
      );
    } else {
      // Log a message if the user's data already exists in MongoDB
      console.log(
        `Data for user ${user.id} already exists in MongoDB. Skipping fetch.`
      );
    }
  }
};

// Function to delete all users, posts, and comments from MongoDB
export const deleteAllUsers = async () => {
  const db = getDb();
  // Delete all documents from the users, posts, and comments collections
  await db.collection("users").deleteMany({});
  await db.collection("posts").deleteMany({});
  await db.collection("comments").deleteMany({});
};

// Function to delete a specific user and their associated posts and comments by user ID
export const deleteUserById = async (userId: number) => {
  const db = getDb();
  // Delete the user from the users collection
  await db.collection("users").deleteOne({ id: userId });
  // Delete all posts associated with the user
  await db.collection("posts").deleteMany({ userId });
  // Delete all comments associated with the user's posts
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

// Function to fetch a specific user by their ID along with their posts and comments
export const getUserById = async (userId: number) => {
  const db = getDb();
  // Find the user in the users collection
  const user = await db.collection("users").findOne({ id: userId });
  // Find all posts associated with the user
  const posts = await db.collection("posts").find({ userId }).toArray();
  // Find all comments associated with the user's posts
  const comments = await db
    .collection("comments")
    .find({ postId: { $in: posts.map((post) => post.id) } })
    .toArray();

  // Return the user object with nested posts and comments
  return {
    ...user,
    posts: posts.map((post) => ({
      ...post,
      comments: comments.filter((comment) => comment.postId === post.id),
    })),
  };
};

// Function to create a new user in the database
export const createUser = async (user: User) => {
  const db = getDb();
  // Check if the user already exists in the database
  const existingUser = await db.collection("users").findOne({ id: user.id });
  if (existingUser) {
    throw new Error("User already exists");
  }
  // Insert the new user into the users collection
  await db.collection("users").insertOne(user);
};
