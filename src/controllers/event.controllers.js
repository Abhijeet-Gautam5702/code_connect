import mongoose from "mongoose";
import Event from "../models/event.models.js";
import EventRegistration from "../models/eventRegistration.models.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { customApiError } from "../utils/customApiError.utils.js";
import { customApiResponse } from "../utils/customApiResponse.utils.js";
import uploadOnCloudinary from "../utils/uploadOnCloudinary.utils.js";
import { INITIAL_ERROR_MESSAGES } from "../constants.js";

// GET ALL EVENTS
const getAllEvents = asyncHandler(async (req, res) => {
  // Authorization check by Auth middleware

  // Get userId from req.user
  const userId = req.user?._id;
  if (!userId) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.GET_EVENTS} | User-ID not recieved`,
      500
    );
  }

  // Get all the events from the database with relevant details (Aggregation Pipeline)
  const events = await Event.aggregate([
    {
      $project: {
        title: 1,
        isEventOnline: 1,
        time: 1,
        date: 1,
        thumbnail: 1,
        registrationFee: 1,
      },
    },
  ]);
  if (!events.length) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.GET_EVENTS} | Some unknown error occured at our end`,
      500
    );
  }

  // Send success response to the user
  res
    .status(200)
    .json(
      new customApiResponse("All events fetched successfully", 200, events)
    );
});

// GET AN EVENT BY ITS EVENT-ID
const getEventById = asyncHandler(async (req, res) => {
  // Authorization check by Auth middleware

  // Get userId from req.user
  const userId = req.user?._id;
  if (!userId) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.GET_EVENT_BY_ID} | User-ID not recieved`,
      500
    );
  }

  // Get eventId from req.params
  const eventId = req.params?.eventId;
  if (!eventId) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.GET_EVENT_BY_ID} | Event-ID not received`,
      422
    );
  }

  // Find the event from the database with relevant details (Aggregation Pipeline)
  const event = await Event.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(eventId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "host",
        foreignField: "_id",
        as: "host",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              fullname: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$host",
    },
    {
      $lookup: {
        from: "eventregistrations",
        localField: "_id",
        foreignField: "eventId",
        as: "eventRegistrations",
      },
    },
    {
      $addFields: {
        attendees: {
          $size: "$eventRegistrations",
        },
      },
    },
    {
      $project: {
        eventRegistrations: 0,
      },
    },
  ]);
  if (!event.length) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.GET_EVENT_BY_ID} | Either the event doesn't exist or some unknown error occured at the database end. Please check the event-ID carefully`,
      500
    );
  }

  // Send success response to the user
  res
    .status(200)
    .json(new customApiResponse("Event fetched successfully", 200, event[0]));
});

/* ------------------------------------- GENERAL EVENT CONTROLLERS ------------------------------------- */

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
    venue: [address, lat, long].some((item) => item)
      ? {
          address,
          lat,
          long,
        }
      : null,
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
const deleteEvent = asyncHandler(async (req, res) => {
  // Authorization check by Auth middleware

  // Get userId from req.user
  const userId = req.user?._id;
  if (!userId) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.DELETE_EVENT} | User-ID not recieved`,
      500
    );
  }

  // Get eventId from req.params
  const eventId = req.params?.eventId;
  if (!eventId) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.DELETE_EVENT} | Event-ID not received`,
      422
    );
  }

  // Check if the user is authorized to delete the event
  const isUserHostOfEvent = await Event.findOne({
    _id:eventId,
    host: userId,
  });
  if (!isUserHostOfEvent) {
    throw new customApiError(
      `${INITIAL_ERROR_MESSAGES.EVENTS.DELETE_EVENT} | Unauthorized access | Only the host can delete the event`,
      400
    );
  }

  // Delete the event
  // Deleting event from the EventRegistration database
  await EventRegistration.findByIdAndDelete(
    eventId
  );
  // Deleting event from the Event database
  await Event.findByIdAndDelete(eventId);

  // Send success response to the user
  res
    .status(200)
    .json(new customApiResponse("Event deleted successfully", 200, {}));
});

// UPDATE EVENT DETAILS
const updateEventDetails = asyncHandler(async (req, res) => {
  // Authorization check by Auth middleware
  // Get userId from req.user
  // Get eventId from req.params
  // Get the details of the events that need to be updated
  // Check if the event exists
  // Check if the user is authorized to make changes to the event
  // Update the details of the event
  // Send success response to the user
});

// UPDATE EVENT THUMBNAIL
const updateEventThumbnail = asyncHandler(async (req, res) => {
  // Authorization check by Auth middleware
  // Get userId from req.user
  // Get eventId from req.params
  // Get the thumbnail link of the event that needs to be updated
  // Check if the event exists
  // Check if the user is authorized to make changes to the event
  // Get the local file path of the thumbnail
  // Upload the file to Cloudinary
  // Get the url of the uploaded thumbnail
  // Update the thumbnail url in the event
  // Send success response to the user
});

/* ------------------------------------- EVENT REGISTRATION CONTROLLERS ------------------------------------- */

// EVENT REGISTER
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
              createdAt: 0,
              updatedAt: 0,
              __v: 0,
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

// EVENT DE-REGISTER
const eventDeregister = asyncHandler(async (req, res) => {
  // Authorization check by Auth middleware
  // Get userId from req.user
  // Get eventId from req.params
  // Check if the event exists
  // Delete the appropriate "EventRegistration" document from the database
  // Send success response to the user
});

export {
  addEvent,
  eventRegister,
  eventDeregister,
  updateEventDetails,
  updateEventThumbnail,
  deleteEvent,
  getAllEvents,
  getEventById,
};
