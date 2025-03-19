import { MongoClient, Db } from "mongodb"; // Import MongoClient and Db from the MongoDB library
import * as dotenv from "dotenv"; // Import dotenv to load environment variables from a .env file

// Load environment variables from the .env file into process.env
dotenv.config();

// Define the MongoDB connection URI using the environment variable MONGODB_URI or a default local URI
const uri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/node_assignment";

// Create a new MongoClient instance using the connection URI
const client = new MongoClient(uri);

// Variable to store the connected database instance
let db: Db;

// Function to connect to the MongoDB database
export const connectToDatabase = async () => {
  try {
    // Attempt to connect to the MongoDB server
    await client.connect();
    // Set the database instance to the "node_assignment" database
    db = client.db("node_assignment");
    // Log a success message to indicate a successful connection
    console.log("Connected to MongoDB");
  } catch (error) {
    // Log an error message if the connection fails
    console.error("Error connecting to MongoDB:", error);
    // Re-throw the error to allow it to be handled by the caller
    throw error;
  }
};

// Function to retrieve the connected database instance
export const getDb = () => {
  // Check if the database instance is initialized
  if (!db) {
    // Throw an error if the database is not connected
    throw new Error("Database not connected");
  }
  // Return the connected database instance
  return db;
};
