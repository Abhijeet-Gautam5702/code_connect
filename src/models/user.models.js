import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String, // from Cloudinary
      required: true,
    },
    avatar: {
      type: String, // from Cloudinary
      required: true,
    },
    registeredEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    organizedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
  },
  { timestamps: true }
);

// MONGOOSE PRE-SAVE-MIDDLEWARE: Hash Password (only if it was modified) before saving a document
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
  } catch (error) {
    console.log(`PASSWORD HASHING FAILED | ${error}`);
    throw error;
  }
});

// MONGOOSE METHOD: Password Validator
userSchema.methods.validatePassword = async function (password) {
  const isPasswordCorrect = await bcrypt.compare(password, this.password);
  return isPasswordCorrect;
};

// MONGOOSE METHOD: Access Token Generator
userSchema.methods.generateAccessToken = async function () {
  try {
    const accessToken = await jwt.sign(
      {
        _id: this._id,
        email: this.email,
        username: this.username,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
    return accessToken;
  } catch (error) {
    console.log(`ACCESS TOKEN GENERATION FAILED | ${error}`);
    throw error;
  }
};

// MONGOOSE METHOD: Refresh Token Generator
userSchema.methods.generateAccessToken = async function () {
  try {
    const accessToken = await jwt.sign(
      {
        _id: this._id,
        email: this.email,
        username: this.username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
    return accessToken;
  } catch (error) {
    console.log(`REFRESH TOKEN GENERATION FAILED | ${error}`);
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

export default User;
