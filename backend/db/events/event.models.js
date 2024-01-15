const mongoose = require("mongoose");

// Subdocument Location Schema
const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
});

// Document Event Schema
const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    time: {
      type: Number,
      min: 0,
      max: 24,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Document Event Model
const Event = mongoose.model("Event", EventSchema);

export { Event };
