import { Router } from "express";
import { userRegister, userLogin } from "../controllers/user.controllers.js";

const userRouter = Router();

// POST: Register User
userRouter.route("/register").post(userRegister);

// POST: Login User
userRouter.route("/login").post(userLogin);

export default userRouter;
