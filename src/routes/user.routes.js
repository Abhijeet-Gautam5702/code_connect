import { Router } from "express";
import {
  userRegister,
  userLogin,
  userLogout,
} from "../controllers/user.controllers.js";
import { verifyUserToken } from "../middlewares/auth.middlewares.js";

const userRouter = Router();

// POST: Register User
userRouter.route("/register").post(userRegister);

// POST: Login User
userRouter.route("/login").post(userLogin);

// SECURED ROUTES
// POST: Logout User
userRouter.route("/logout").post(verifyUserToken, userLogout);

export default userRouter;
