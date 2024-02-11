import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

// Built-in express middleware to serve static files 
app.use(express.static("public"))

/*
    `cookie-parser` Middleware to give us the access to the `req.cookies` object and allows us to send cookies to the response object
*/
app.use(cookieParser());


// ROUTER IMPORTS
import { API_VERSION } from "./constants.js";
import userRouter from "./routes/user.routes.js";
import eventRouter from "./routes/event.routes.js";

app.use(`/${API_VERSION}/users`, userRouter);
app.use(`/${API_VERSION}/events`, eventRouter);

export default app;
