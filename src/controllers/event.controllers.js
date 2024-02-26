import mongoose from "mongoose";
import Event from "../models/event.models.js";
import EventRegistration from "../models/eventRegistration.models.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { customApiError } from "../utils/customApiError.utils.js";
import { customApiResponse } from "../utils/customApiResponse.utils.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.utils.js";
import { INITIAL_ERROR_MESSAGES } from "../constants.js";

// ADD NEW EVENT
const addEvent = asyncHandler(async (req, res) => {
  // Authorize user by Auth middleware

  // Get userId from req.user
  const userId = req.user?._id;
  if (!userId) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.CREATE_EVENT} | User-ID not recieved`,
      500
    );
  }

  // Get event details
  const {
    title,
    description,
    isEventOnline,
    registrationFee,
    address,
    lat,
    long,
    startTime,
    endTime,
    startDate,
    endDate,
    tags,
  } = req.body;
  if (
    [title, description, startTime, endTime, startDate, endDate].some(
      (field) => !field || (field && field.trim() === "")
    )
  ) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.CREATE_EVENT} | One or more required fields are not provided`,
      422
    );
  }

  if (
    !isEventOnline &&
    [address, lat, long].some(
      (field) => !field || (field && field.trim() === "")
    )
  ) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.CREATE_EVENT} | Since the event is offline, venue details are requried | One or more fields in the Event Venue are not provided`,
      422
    );
  }

  // Get the thumbnail of the event
  const thumbnail = req.file;
  if (!thumbnail.path) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.CREATE_EVENT} | Thumbnail not recieved`,
      422
    );
  }
  const thumbnailLocalPath = thumbnail?.path;
  // Upload thumbnail to Cloudinary
  const thumbnailUploadedOnCloudinary = await uploadOnCloudinary(
    thumbnailLocalPath
  );
  if (!thumbnailUploadedOnCloudinary.url) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.CREATE_EVENT} | Thumbnail could not be uploaded on Cloudinary`,
      500
    );
  }

  // Check if an event with identical details is present in the database
  const isEventAlreadyExists = await Event.findOne({ title: title?.trim() });
  if (isEventAlreadyExists) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.CREATE_EVENT} | Event with the same name already exists`,
      400
    );
  }

  // Create a new event in the database
  const newEvent = await Event.create({
    host: userId,
    title,
    description,
    thumbnail: thumbnailUploadedOnCloudinary?.url,
    isEventOnline: isEventOnline || false,
    registrationFee: registrationFee || 0,
    venue: {
      address,
      lat,
      long,
    },
    time: {
      startTime,
      endTime,
    },
    date: {
      startDate,
      endDate,
    },
    tags,
  });
  if (!newEvent) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.CREATE_EVENT} | Some unknown error occured at our end in creating the event in the database`,
      500
    );
  }

  // Send success response to the user
  res
    .status(200)
    .json(
      new customApiResponse("New event created successfully", 200, newEvent)
    );
});

// DELETE EVENT

// EVENT REGISTER (Testing pending)
const eventRegister = asyncHandler(async (req, res) => {
  // Authorize the user by the Auth Middleware

  // Get userId from req.user
  const userId = req.user?._id;
  if (!userId) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.REGISTER_EVENT} | User-ID not received`,
      500
    );
  }

  // Get the eventId from the URL params
  const eventId = req.params?.eventId;
  if (!eventId) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.REGISTER_EVENT} | Event-ID not received`,
      422
    );
  }

  // Check if the event exists in the database
  const isEventExists = await Event.findById(eventId);
  if (!isEventExists) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.REGISTER_EVENT} | Event with given ID not found`,
      404
    );
  }

  // Check if the user is the host of the event (Host do not need to register for their own event)
  const isUserTheHostOfTheEvent = await Event.findOne({
    _id: eventId,
    host: userId,
  });
  if (isUserTheHostOfTheEvent) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.REGISTER_EVENT} | Hosts need not register to the event`,
      400
    );
  }

  // Check if the user has already registered for this event
  const isUserAlreadyRegistered = await EventRegistration.findOne({
    eventId,
    attendee: userId,
  });
  if (isUserAlreadyRegistered) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.REGISTER_EVENT} | You have already registered for this event`,
      400
    );
  }

  // Get the host-ID of the event
  const hostId = isEventExists.host;
  // console.log(hostId)

  // Create a new "EventRegistration" document
  const newRegistration = await EventRegistration.create({
    eventId,
    host: hostId,
    attendee: userId,
  });
  if (!newRegistration) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.REGISTER_EVENT} | Some unknown error occured at our end`,
      500
    );
  }

  // Prepare the complete data to be sent to the user as response
  const data = await EventRegistration.aggregate([
    // Stage-1: Match all "EventRegistration" documents whose `eventId` is same as eventId and `attendee` field is same as userId
    {
      $match: {
        eventId: new mongoose.Types.ObjectId(eventId),
        attendee: new mongoose.Types.ObjectId(userId),
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
              host: 0,
              _id: 0,
              createdAt:0,
              updatedAt:0,
              __v:0,
            },
          },
        ],
      },
    },
    // Stage-3: Lookup for attendee details
    {
      $lookup: {
        from: "users",
        localField: "attendee",
        foreignField: "_id",
        as: "attendee",
        pipeline: [
          {
            $project: {
              fullname: 1,
              email: 1,
            },
          },
        ],
      },
    },
    // Stage-4: Lookup for host details
    {
      $lookup: {
        from: "users",
        localField: "host",
        foreignField: "_id",
        as: "host",
        pipeline: [
          {
            $project: {
              fullname: 1,
              email: 1,
            },
          },
        ],
      },
    },
    // Stage-5: Unwind the `eventDetails` field
    {
      $unwind: "$eventDetails",
    },
    {
      $unwind: "$host",
    },
    {
      $unwind: "$attendee",
    },
  ]);

  // Send success response to the user
  res
    .status(200)
    .json(
      new customApiResponse(
        "User successfully registered for the event",
        200,
        data[0]
      )
    );
});

// EVENT DE-REGISTER CONTROLLER

export { addEvent, eventRegister };
