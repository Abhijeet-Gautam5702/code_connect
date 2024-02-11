import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

/*
    `cookie-parser` Middleware to give us the access to the `req.cookies` object and to send cookies to the response object
*/
app.use(cookieParser());

// ROUTER IMPORTS
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users", userRouter);

export default app;
