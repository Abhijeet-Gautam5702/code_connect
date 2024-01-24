import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { customApiError } from "../utils/customApiError.utils.js";
import { customApiResponse } from "../utils/customApiResponse.utils.js";

/*
    USER REGISTRATION CONTROLLER
*/
const userRegister = asyncHandler(async (req, res) => {
  // Get data from the client using body
  const { username, email, password, fullname } = req.body;

  // Validate whether any of the datafields is empty or invalid
  if (
    [username, email, password, fullname].some(
      (field) => !field || (field && field === "")
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
  res.status(200).json(
    new customApiResponse("User registration successful", 200, createdUser)
  );
});

/*
    USER LOGIN CONTROLLER
*/
const userLogin = asyncHandler(async (req, res) => {
  res.json({
    message: "User Logged In",
  });
});

export { userRegister, userLogin };
