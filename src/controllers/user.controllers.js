import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { customApiError } from "../utils/customApiError.utils.js";
import { customApiResponse } from "../utils/customApiResponse.utils.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

/*
    USER REGISTRATION CONTROLLER
*/
const userRegister = asyncHandler(async (req, res) => {
  // Get data from the client using body
  const { username, email, password, fullname } = req.body;

  // Validate whether any of the datafields is empty or invalid
  if (
    [username, email, password, fullname].some(
      (field) => !field || (field && field.trim() === "")
    )
  ) {
    throw new customApiError("One or more required fields is empty", 400);
  }

  // Check if the user already exists in database using the email or username
  const isUserExists = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (isUserExists) {
    throw new customApiError("A user with same username or email exists", 409);
  }

  // Create the user from the recieved details
  const user = await User.create({
    username: username.toLowerCase(),
    password,
    fullname,
    email,
  });

  // Check if the user has been created successfully or not
  // Create a user instance without password and refreshToken
  const createdUser = await User.findOne({ email }).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new customApiError("User registration could not be completed", 500);
  }

  // Send response to the client
  res
    .status(200)
    .json(
      new customApiResponse("User registration successful", 200, createdUser)
    );
});

/*
    USER LOGIN CONTROLLER
*/
const userLogin = asyncHandler(async (req, res) => {
  // Get username (or email) and password (must) from the user
  const { email, password, username } = req.body;

  // Check if the username or email along with password is provided by the user
  if (!(email || username)) {
    throw new customApiError("Either email or the username is required", 400);
  }
  if (!password || password?.trim() === "") {
    throw new customApiError("Password (required field) is not provided", 401);
  }

  // Check if the user exists in the database
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new customApiError(
      "User with the given credentials doesn't exist",
      404
    );
  }

  // Check if the password is correct
  const isPasswordCorrect = await user.validatePassword(password);
  if (!isPasswordCorrect) {
    throw new customApiError("Incorrect password", 401);
  }

  // Generate access and refresh tokens for the user
  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();

  // Give refresh token to the user document in the database
  let updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      refreshToken: refreshToken,
    },
    { new: true }
  );
  if (!updatedUser.refreshToken) {
    throw new customApiError("User could not be logged in from our end", 500);
  }

  const userData = await User.findById(user._id).select(
    "-refreshToken -password"
  );

  // Send the response and cookies containing the data and the access tokens
  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new customApiResponse("User logged in successfully", 200, {
        user: userData,
        refreshToken,
        accessToken,
      })
    );
});

/*
  USER LOGOUT CONTROLLER
*/
/*  
  User can only logout of the website if he is logged in. That means the logout route is an authenticated route. Hence there must be a middleware to verify whether the user is authorized to hit the logout-endpoint.
*/
const userLogout = asyncHandler(async (req, res) => {
  // Authenticate the user by the Auth Middleware
  // Get the userId from the `req.user` object injected by Auth Middleware
  const userId = req.user._id;

  // Clear the refresh token of the user
  const user = await User.findByIdAndUpdate(
    userId,
    {
      refreshToken: "",
    },
    { new: true } // this ensures that the updated/modified document is returned by the query
  );
  if (user.refreshToken) {
    throw new customApiError(
      "User could not be logged out successfully from our end",
      500
    );
  }

  // Clear the access token and refresh token from the cookies
  // Send response to the user
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
      new customApiResponse("User logged out successfully", 200, {
        user: user,
      })
    );
});

export { userRegister, userLogin, userLogout };
