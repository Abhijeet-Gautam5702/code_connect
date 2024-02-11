import mongoose from "mongoose";

// Sub-document for the venue of the Event
const venueSchema = new mongoose.Schema({
  address: String,
  lat: String,
  long: String,
});

// Sub-document for the time of the Event
const timeSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

// Sub-document for the date of the Event
const dateSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
});

const eventSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isEventOnline: {
      type: Boolean,
      default: false,
    },
    venue: {
      type: venueSchema,
      required: false,
    },
    time: {
      type: timeSchema,
      required: true,
    },
    date: {
      type: dateSchema,
      required: true,
    },
    thumbnail: {
      type: String, // from Cloudinary
      required: true,
    },
    registrationFee: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
