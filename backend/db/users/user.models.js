const mongoose = require("mongoose");
const Event = require("../events/event.models");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    registeredEvents: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
      ],
    },
    createdEvents: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
      ],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export { User };
