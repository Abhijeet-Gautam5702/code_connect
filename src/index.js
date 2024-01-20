import express from "express";
import { connectDatabase } from "./db/db.js";
import app from "./app.js";
import "dotenv/config"; // Importing and configuring dotenv package

const port = process.env.PORT || 8000;

/*
    NOTE-1: "connectDatabase" is an async-function hence it returns a promise. The await keyword is used so that the try-catch block executes only after the promise is resolved 
    NOTE-2: We could have also used the .then() syntax on "connection" to check for app-errors
*/
await connectDatabase();

// Try-catch block to look for any Express-App related errors
try {
  // App Listener: Listens for any errors
  app.on("error", (err) => {
    console.log(`EXPRESS APP ERROR | ${err}`);
    throw err;
  });

  // App Listener: If no errors, app runs on the given port
  app.listen(port, () => {
    console.log(`APP RUNNING SUCCESSFULLY ON PORT: ${port}`);
  });
} catch (error) {
  console.log(`EXPRESS APP ERROR | ${error}`);
  process.exit(1); // Exit the Process (Feature in NodeJS)
}
