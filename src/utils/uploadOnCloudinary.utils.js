import { customApiError } from "./customApiError.utils.js";
import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_CLOUD_NAME } from "../constants.js";
import cleanDirectory from "./cleanDirectory.utils.js";

// Since cloudinary configurations occur here in this file, we need to provide access to the .env file again here
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

// Cloudinary Configurations
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility function to upload temporarily stored static files to Cloudinary
async function uploadOnCloudinary(localPath) {
  try {
    if (!localPath) {
      throw new customApiError(
        "CLOUDINARY FILE UPLOAD FAILED | Local File Path not provided",
        422
      );
    }
    const uploadedResponse = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });
    return uploadedResponse;
  } catch (error) {
    throw new customApiError(error.message, 500);
  } finally {
    // Clean the temp directory inside the public folder
    cleanDirectory("./public/temp");
  }
}

export default uploadOnCloudinary;
