import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Database connections are always asynchronous operations. Always use try-catch blocks.
async function connectDatabase() {
  try {
    await mongoose.connect(`${process.env.MONGO_DB_CONNECTION_URI}/${DB_NAME}`);
    console.log("MONGO-DB DATABASE CONNECTED SUCCESSFULLY");
  } catch (error) {
    console.log(`MONGO-DB CONNECTION ERROR | ${error}`);
  }
}

export { connectDatabase };
