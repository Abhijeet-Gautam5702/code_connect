import mongoose from "mongoose";
/*
    EVENT REGISTRATION MODEL

    Query: Find which events are hosted by the current user 
    Soln: Search for document with {host: currUserId} as query

    Query: Find which events has the current user registered for
    Soln: Search for document with {attendee: currUserId} as query
*/
const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const EventRegistration = mongoose.model(
  "EventRegistration",
  eventRegistrationSchema
);

export default EventRegistration;
