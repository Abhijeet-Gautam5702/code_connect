import mongoose from "mongoose";

// Sub-document for the Venue of the Event
const venueSchema = new mongoose.Schema({
  address: String,
  lat: String,
  long: String,
});

const eventSchema = new mongoose.Schema(
  {
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
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    thumbnail: {
      type: String, // from Cloudinary
      required: true,
    },
    coverImage: {
      type: String, // from Cloudinary
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registrationFee: {
      type: Number,
      default: 0,
    },
    refundPolicy: {
      type: String,
      default: "Contact the organizer for any refund related information",
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
