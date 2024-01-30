// Auth Middleware to authenticate the user (using its access token) and ensure that only valid users are able to hit secured routes

import asyncHandler from "../utils/asyncHandler.utils.js";
import jwt from "jsonwebtoken";
import { customApiError } from "../utils/customApiError.utils.js";
import User from "../models/user.models.js";

const verifyUserToken = asyncHandler(async (req, res, next) => {
  // Get the access token of the user
  /*
        For websites: Tokens are generally stored in cookies
        For mobile apps: Tokens are sent as Authorization Header
  */
  let userAccessToken =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");
  if (!userAccessToken) {
    throw new customApiError("Unauthorized request", 401);
  }

  // Decode the token and get the userId
  const userInfoFromAccessToken = jwt.verify(
    userAccessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  const userId = userInfoFromAccessToken._id;

  // Verify the user details and that the user is present in the database
  const user = await User.findById(userId);
  if (!user) {
    throw new customApiError(
      "Invalid access token | User doesn't exist in the database",
      404
    );
  }

  // Inject a `req.user` object to the `req` object
  /*
    Middlewares have the power to inject additional objects to the request object
  */
  req.user = user;

  next();
});

export { verifyUserToken };
