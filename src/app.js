import express from "express";

const app = express();

// ROUTER IMPORTS
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/users",userRouter);

export default app;
