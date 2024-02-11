import mongoose from "mongoose";
import Event from "../models/event.models.js";
import EventRegistration from "../models/eventRegistration.models.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { customApiError } from "../utils/customApiError.utils.js";
import { customApiResponse } from "../utils/customApiResponse.utils.js";

// ADD NEW EVENT CONTROLLER

// DELETE EVENT CONTROLLER

// EVENT REGISTER CONTROLLER (Testing pending)
const eventRegister = asyncHandler(async (req, res) => {
  // Authorize the user by the Auth Middleware

  // Get userId from req.user
  const userId = req.user?._id;
  if (!userId) {
    throw new customApiError(
      "Unexpected error from our side | Logged-In User-ID not recieved",
      500
    );
  }

  // Get the eventId from the URL params
  const eventId = req.params?.eventId;
  if (!eventId) {
    throw new customApiError("Event-ID not recieved", 422);
  }

  // Check if the event exists in the database
  const isEventExists = await Event.findById(eventId);
  if (!isEventExists) {
    throw new customApiError("Invalid Event-ID | Event not found", 404);
  }

  // Check if the user has already registered for this event
  const isUserAlreadyRegistered = await EventRegistration.findOne({
    eventId,
    attendee: userId,
  });
  if (isUserAlreadyRegistered) {
    throw new customApiError(
      "Registration Failed | User has already registered for this event",
      400
    );
  }

  // Check if the user is the host of the event (Host do not need to register for their own event)
  const isUserTheHostOfTheEvent = await EventRegistration.findOne({
    eventId,
    host: userId,
  });
  if (isUserTheHostOfTheEvent) {
    throw new customApiError(
      "Registration Failed | Host need not register for their own events",
      400
    );
  }

  // Get the host-ID of the event
  const hostId = await EventRegistration.findById(eventId).host;

  // Create a new "EventRegistration" document
  const newRegistration = await EventRegistration.create({
    eventId,
    host: hostId,
    attendee: userId,
  });
  if (!newRegistration) {
    throw new customApiError(
      "Registration Failed | User could not be registered for the event",
      500
    );
  }

  // Prepare the complete data to be sent to the user as response
  const data = await EventRegistration.aggregate([
    // Stage-1: Match all "EventRegistration" documents whose `eventId` is same as eventId and `attendee` field is same as userId
    {
      $match: {
        eventId: mongoose.Types.ObjectId(eventId),
        attendee: mongoose.Types.ObjectId(userId),
      },
    },
    // Stage-2: Lookup for the event details from the "events" database
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "eventDetails",
        pipeline: [
          {
            $project: {
              tags: 0,
              thumbnail: 0,
              coverImage: 0,
            },
          },
        ],
      },
    },
  ]);

  // Send success response to the user
  res
    .status(200)
    .json(
      new customApiResponse(
        "User successfully registered for the event",
        200,
        data
      )
    );
});

// EVENT DE-REGISTER CONTROLLER


