import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { customApiError } from "../utils/customApiError.utils.js";
import { customApiResponse } from "../utils/customApiResponse.utils.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

/*
  GET-USER CONTROLLER
*/
const getLoggedInUser = asyncHandler(async (req, res) => {
  // Authorize the user by the Auth Middleware

  // Get user instance from req.user object injected by the Auth middleware
  const userId = req.user._id;

  // Remove senstitive information and send success response to the user
  const user = await User.findById(userId).select("-password -refreshToken");
  res
    .status(200)
    .json(
      new customApiResponse(
        "Currently Logged-In user successfully fetched",
        200,
        user
      )
    );
});

/*------------------------- USER FUNCTIONALITY CONTROLLERS -------------------------*/

/*
    USER-REGISTRATION CONTROLLER
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
    USER-LOGIN CONTROLLER
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
  USER-LOGOUT CONTROLLER
*/
/*  
  User can only logout of the website if he is logged in. That means the logout route is an authenticated route. Hence there must be a middleware to verify whether the user is authorized to hit the logout-endpoint.
*/
const userLogout = asyncHandler(async (req, res) => {
  // Authorize the user by the Auth Middleware
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

/*------------------------- USER ACCOUNT UPDATE CONTROLLERS -------------------------*/

/*
  USER-PASSWORD-CHANGE CONTROLLER
*/
const changePassword = asyncHandler(async (req, res) => {
  // Authorize the user by the Auth Middleware

  // Get the password from the user
  const oldPassword = req.body.oldPassword?.trim();
  const newPassword = req.body.newPassword?.trim();
  if (!oldPassword || !newPassword) {
    throw new customApiError("One or more fields are empty", 422);
  }
  if (oldPassword === newPassword) {
    throw new customApiError(
      "New password cannot be same as the old password",
      400
    );
  }

  // Get the user instance from req.user injected by the Auth Middleware
  const user = req.user;
  const isPasswordCorrect = await user.validatePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new customApiError("Invlaid old password", 401);
  }

  // Update the password
  user.password = newPassword;
  await user.save();

  // Send success response to user
  res
    .status(200)
    .json(new customApiResponse("User Password update successfully", 200, {}));
});

/*
  USER-OTHER-DETAILS-UPDATE CONTROLLER
*/
const changeOtherUserAccountDetails = asyncHandler(async (req, res) => {
  // Authorize the user by the Auth Middleware

  // Get details from the user
  const email = req.body.email?.trim();
  const fullname = req.body.fullname?.trim();
  if (!email && !fullname) {
    throw new customApiError("At least one field is required", 422);
  }

  // Get user instance from the req.user object injected by Auth middleware
  const user = req.user;

  // Update the details in the user instance and save the document
  user.email = email || user.email;
  user.fullname = fullname || user.fullname;
  await user.save();

  // Check if the user was updated correctly
  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!updatedUser) {
    throw new customApiError(
      "User details could not be udpated successfully | User not found",
      404
    );
  }
  if (fullname && updatedUser.fullname !== fullname) {
    throw new customApiError("User fullname could not be updated", 500);
  }
  if (email && updatedUser.email !== email) {
    throw new customApiError("User email could not be updated", 500);
  }

  // Send success response to the user
  res
    .status(200)
    .json(
      new customApiResponse(
        "User account details updated successfully",
        200,
        updatedUser
      )
    );
});

export {
  userRegister,
  userLogin,
  userLogout,
  changePassword,
  changeOtherUserAccountDetails,
  getLoggedInUser,
};
